import { test, expect, type Page } from "playwright/test";
import { mkdirSync } from "node:fs";

/* Scalability check — content/case-cards.json carries the 7-card QA set, so
 * this runs by default. Asserts the deck caps at MAX_VISIBLE and the buried
 * tail dissolves, with the front advancing to the last card. Count-agnostic. */
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const SHOT_DIR = "tmp/works-stack";
const MAX_VISIBLE = 5; // mirrors works-section.tsx design constant
mkdirSync(SHOT_DIR, { recursive: true });

async function ensureScrollable(page: Page) {
  await page.waitForFunction(
    () => {
      const m = document.querySelector("main");
      const s = document.querySelector<HTMLElement>("[data-card-count]");
      if (!m || !s) return false;
      return (
        getComputedStyle(m).overflowY !== "hidden" &&
        s.offsetHeight > m.clientHeight * 1.5
      );
    },
    undefined,
    { timeout: 12_000 },
  );
  await page.waitForTimeout(200);
}

async function scrubTo(page: Page, p: number) {
  await page.evaluate((progress) => {
    const main = document.querySelector("main");
    const stack = document.querySelector<HTMLElement>("[data-card-count]");
    if (!main || !stack) return;
    (main as HTMLElement).style.scrollBehavior = "auto";
    const top =
      stack.getBoundingClientRect().top -
      main.getBoundingClientRect().top +
      main.scrollTop;
    main.scrollTop = top + progress * (stack.offsetHeight - main.clientHeight);
  }, p);
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
  await page.waitForTimeout(80);
}

test("scalability: caps at MAX_VISIBLE, tail dissolves, front advances", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-card-count]");
  await ensureScrollable(page);

  const N = Number(
    await page.locator("[data-card-count]").getAttribute("data-card-count"),
  );
  // Needs more cards than the visible window to prove the cap + dissolve.
  expect(N).toBeGreaterThan(MAX_VISIBLE);

  await scrubTo(page, 1);
  await page.screenshot({ path: `${SHOT_DIR}/scale-n${N}-end.png` });

  const rows = await page.$$eval("[data-stack-index]", (els) =>
    (els as HTMLElement[]).map((e) => ({
      index: Number(e.getAttribute("data-stack-index")),
      depth: parseFloat(e.dataset.depth ?? "0"),
      opacity: parseFloat(getComputedStyle(e).opacity),
    })),
  );

  // Last card is the current front (full).
  const last = rows.find((r) => r.index === N - 1)!;
  expect(last.opacity).toBeGreaterThan(0.95);

  // At most MAX_VISIBLE cards are visible at once.
  const visible = rows.filter((r) => r.opacity > 0.05);
  expect(visible.length).toBeLessThanOrEqual(MAX_VISIBLE);

  // The deeply-buried tail (depth ≥ MAX_VISIBLE) is dissolved.
  const buried = rows.filter((r) => r.depth >= MAX_VISIBLE);
  expect(buried.length).toBeGreaterThan(0);
  expect(buried.every((r) => r.opacity < 0.05)).toBe(true);

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});
