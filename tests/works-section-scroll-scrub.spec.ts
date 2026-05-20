import { test, expect, devices, type Page } from "playwright/test";
import { mkdirSync } from "node:fs";

/* The worktree dev server runs on :3001 (config baseURL is :3000). */
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const SHOT_DIR = "tmp/works-stack";
mkdirSync(SHOT_DIR, { recursive: true });

/** home-client locks <main> scroll (overflow:hidden) for ~4.5s during the
 *  entrance. Wait until scrolling actually takes effect. */
async function ensureScrollable(page: Page) {
  await page.waitForFunction(
    () => {
      const m = document.querySelector("main");
      const s = document.querySelector<HTMLElement>("[data-card-count]");
      if (!m || !s) return false;
      const unlocked = getComputedStyle(m).overflowY !== "hidden";
      // stack must be laid out to its full multi-viewport height
      const laidOut = s.offsetHeight > m.clientHeight * 1.5;
      return unlocked && laidOut;
    },
    undefined,
    { timeout: 12_000 },
  );
  await page.waitForTimeout(200);
}

/** Scroll the <main> container so the scroll-stack is `p` (0..1) through its
 *  travel, wait two frames, return diagnostics. */
async function scrubTo(page: Page, p: number) {
  const info = await page.evaluate((progress) => {
    const main = document.querySelector("main");
    const stack = document.querySelector<HTMLElement>("[data-card-count]");
    if (!main || !stack) return { ok: false as const };
    // <main> has CSS scroll-smooth — force instant for deterministic jumps.
    (main as HTMLElement).style.scrollBehavior = "auto";
    const top =
      stack.getBoundingClientRect().top -
      main.getBoundingClientRect().top +
      main.scrollTop;
    const max = stack.offsetHeight - main.clientHeight;
    main.scrollTop = top + progress * max;
    return { ok: true as const, count: stack.dataset.cardCount };
  }, p);
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
  await page.waitForTimeout(80);
  return info;
}

async function cardState(page: Page, index: number) {
  return page.$$eval(
    `[data-stack-index="${index}"]`,
    (els) => {
      const el = els[0] as HTMLElement | undefined;
      if (!el) return null;
      const cs = getComputedStyle(el);
      const content = el.querySelector<HTMLElement>("[data-card-content]");
      const article = el.querySelector<HTMLElement>("article");
      const acs = article ? getComputedStyle(article) : null;
      return {
        opacity: +(+cs.opacity).toFixed(2),
        transform: cs.transform,
        contentFilter: content ? getComputedStyle(content).filter : "n/a",
        tint: parseFloat(cs.getPropertyValue("--card-tint")) || 0,
        articleFilter: acs ? acs.filter : "n/a",
        articleBackdrop:
          acs?.backdropFilter ||
          (acs as unknown as { webkitBackdropFilter?: string })
            ?.webkitBackdropFilter ||
          "none",
      };
    },
  );
}

const blurPx = (f: string) => {
  const m = (f || "").match(/blur\(([\d.]+)px\)/);
  return m ? parseFloat(m[1]) : 0;
};

test.describe("works scroll-stack", () => {
  test("desktop: cards fold onto each other, front advances, frame crisp", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-card-count]", { timeout: 10_000 });
    await ensureScrollable(page);

    // Start of stack: card 0 is the front → sharp, no frost, crisp frame.
    await scrubTo(page, 0);
    const c0Start = await cardState(page, 0);
    expect(c0Start).not.toBeNull();
    expect(c0Start!.opacity).toBeGreaterThan(0.95);
    expect(blurPx(c0Start!.contentFilter)).toBe(0); // front content sharp
    expect(c0Start!.tint).toBeLessThanOrEqual(0.01); // no frost veil on front
    expect(c0Start!.articleFilter).toBe("none"); // frame never filtered
    expect(c0Start!.articleBackdrop).toBe("none"); // no backdrop-filter
    await page.screenshot({ path: `${SHOT_DIR}/desktop-start.png` });

    const N = Number(
      await page
        .locator("[data-card-count]")
        .getAttribute("data-card-count"),
    );
    expect(N).toBeGreaterThanOrEqual(3);

    // Fully scrolled: last card (index N-1) is the front; card 0 is buried.
    await scrubTo(page, 1);
    const last = await cardState(page, N - 1);
    const c0End = await cardState(page, 0);
    // A mid receding card that is still clearly visible (depth ≈ 2 at p=1).
    const midReceded = await cardState(page, Math.max(0, N - 3));
    await page.screenshot({ path: `${SHOT_DIR}/desktop-end.png` });

    // Front (last) — full, sharp content, no frost, crisp frame.
    expect(last!.opacity).toBeGreaterThan(0.95);
    expect(blurPx(last!.contentFilter)).toBe(0);
    expect(last!.tint).toBeLessThanOrEqual(0.01);
    expect(last!.articleFilter).toBe("none");

    // A receded-but-visible card: scaled/moved back, its OWN content is
    // BLURRED and a white frost veil is applied (reads as glass). The
    // <article> frame is never filtered → stays crisp.
    expect(midReceded!.transform).not.toBe("none");
    expect(blurPx(midReceded!.contentFilter)).toBeGreaterThan(1);
    expect(midReceded!.tint).toBeGreaterThan(0.05);
    expect(midReceded!.articleFilter).toBe("none");
    expect(midReceded!.articleBackdrop).toBe("none");

    // Deep tail dissolved.
    expect(c0End!.opacity).toBeLessThan(0.1);

    // Mid-scroll: card 0 is receded → blurred + frosted; the CURRENT front
    // (fractional index p*(N-1)) stays perfectly sharp (the key fix).
    await scrubTo(page, 0.5);
    const c0Mid = await cardState(page, 0);
    const frontMid = await cardState(page, Math.round(0.5 * (N - 1)));
    await page.screenshot({ path: `${SHOT_DIR}/desktop-mid.png` });
    expect(c0Mid!.transform).not.toBe("none");
    expect(blurPx(c0Mid!.contentFilter)).toBeGreaterThan(1); // receded → blurred
    expect(blurPx(frontMid!.contentFilter)).toBe(0); // active card never blurs
    expect(frontMid!.tint).toBeLessThanOrEqual(0.01);
  });

  test("desktop: scroll-up reverses the stack", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-card-count]", { timeout: 10_000 });
    await ensureScrollable(page);

    await scrubTo(page, 1);
    await scrubTo(page, 0);
    const c0 = await cardState(page, 0);
    expect(c0!.opacity).toBeGreaterThan(0.95); // back to front, un-receded
    await page.screenshot({ path: `${SHOT_DIR}/desktop-reversed.png` });
  });

  test("mobile: stacks without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({
      width: devices["Pixel 5"].viewport.width,
      height: devices["Pixel 5"].viewport.height,
    });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-card-count]", { timeout: 10_000 });
    await ensureScrollable(page);
    for (const p of [0, 0.5, 1]) {
      await scrubTo(page, p);
      await page.screenshot({
        path: `${SHOT_DIR}/mobile-p${String(p).replace(".", "_")}.png`,
      });
    }
    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("reduced-motion: static list, no stack, all crisp", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForSelector("section#works article");
    expect(await page.locator("[data-stack-index]").count()).toBe(0);
    expect(await page.locator("[data-card-count]").count()).toBe(0);
    const surfaces = await page.$$eval("section#works article", (els) =>
      (els as HTMLElement[])
        .filter((e) => e.offsetParent !== null)
        .map((e) => {
          const s = getComputedStyle(e);
          return {
            filter: s.filter,
            backdrop:
              s.backdropFilter ||
              (s as unknown as { webkitBackdropFilter?: string })
                .webkitBackdropFilter ||
              "none",
          };
        }),
    );
    expect(surfaces.length).toBeGreaterThanOrEqual(3); // count-agnostic
    // Static cards: no content filter AND no glass backdrop (glass=false).
    expect(surfaces.every((s) => s.filter === "none")).toBe(true);
    expect(surfaces.every((s) => s.backdrop === "none")).toBe(true);
    await page.screenshot({ path: `${SHOT_DIR}/reduced-motion.png` });
  });

  test("edit mode: static list, stack disabled", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    const toggle = page.locator("[data-edit-toggle]");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.waitForTimeout(300);
    expect(await page.locator("[data-stack-index]").count()).toBe(0);
    await expect(
      page.locator("section#works article").first(),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/edit-mode.png` });
  });
});
