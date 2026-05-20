import { test } from "playwright/test";
import { mkdirSync, readdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const DIR = "tmp/verify";

test.skip(process.env.RUN_VERIFY !== "1", "verify only");

test("verify: list overlay-stack + fixed header + about gap", async ({
  page,
}) => {
  mkdirSync(DIR, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => {
      const m = document.querySelector("main");
      const s = document.querySelector("[data-card-count]");
      return (
        !!m &&
        !!s &&
        getComputedStyle(m).overflowY !== "hidden" &&
        (s as HTMLElement).offsetHeight > m.clientHeight * 1.2
      );
    },
    undefined,
    { timeout: 12000 },
  );
  await page.waitForTimeout(300);

  const geo = await page.evaluate(() => {
    const m = document.querySelector("main")!;
    (m as HTMLElement).style.scrollBehavior = "auto";
    const c = document.querySelector<HTMLElement>("[data-card-count]")!;
    const top =
      c.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop;
    return { top, h: c.offsetHeight, vh: m.clientHeight };
  });

  const STEPS = 24;
  const from = geo.top - geo.vh * 0.35;
  const to = geo.top + geo.h + geo.vh * 0.35; // past the container → into ABOUT
  const rows: string[] = [];

  for (let i = 0; i < STEPS; i++) {
    const sy = Math.round(from + ((to - from) * i) / (STEPS - 1));
    const d = await page.evaluate((y) => {
      const m = document.querySelector("main")!;
      m.scrollTop = y;
      const r = (el: Element | null) =>
        el ? Math.round((el as HTMLElement).getBoundingClientRect().top) : NaN;
      const head = document.querySelector(
        "#works .sticky[style*='--accent'], #works div.sticky",
      );
      // works header = the WORKS h2
      const h2 = document.querySelector("#works h2");
      const about = document.querySelector("#about");
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("[data-stack-index]"),
      );
      const tops = cards
        .map(
          (c) =>
            `${c.dataset.stackIndex}:${Math.round(
              c.getBoundingClientRect().top,
            )}/${(+getComputedStyle(c).opacity).toFixed(1)}`,
        )
        .join(" ");
      return {
        sy: Math.round(m.scrollTop),
        headTop: r(h2),
        aboutTop: about ? r(about) : null,
        tops,
        headStuck: head ? Math.round(head.getBoundingClientRect().top) : null,
      };
    }, sy);
    await page.evaluate(
      () =>
        new Promise<void>((res) =>
          requestAnimationFrame(() => requestAnimationFrame(() => res())),
        ),
    );
    await page.waitForTimeout(70);
    await page.screenshot({ path: `${DIR}/${String(i).padStart(2, "0")}.png` });
    rows.push(
      `#${String(i).padStart(2)} sy=${String(d.sy).padStart(
        5,
      )} WORKStop=${String(d.headTop).padStart(5)} aboutTop=${String(
        d.aboutTop,
      ).padStart(6)} | cards ${d.tops}`,
    );
  }
  console.log("\n" + rows.join("\n"));

  const files = readdirSync(DIR)
    .filter((f) => /^\d\d\.png$/.test(f))
    .sort();
  const cols = 4;
  const tw = 420;
  const th = 263;
  const tiles = await Promise.all(
    files.map(async (f, idx) => ({
      input: await sharp(`${DIR}/${f}`)
        .resize(tw, th, { fit: "contain", background: "#111" })
        .png()
        .toBuffer(),
      left: (idx % cols) * tw,
      top: Math.floor(idx / cols) * th,
    })),
  );
  await sharp({
    create: {
      width: cols * tw,
      height: Math.ceil(files.length / cols) * th,
      channels: 3,
      background: "#111",
    },
  })
    .composite(tiles)
    .png()
    .toFile("tmp/verify-contact.png");
});
