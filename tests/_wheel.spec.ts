/**
 * Wheel-scroll capture spec — gated `RUN_WHEEL=1`.
 *
 * Records a continuous wheel-scroll of the homepage (Hero → WORKS → ABOUT →
 * Contact) on desktop + mobile viewports, dumps a dense PNG sequence for
 * frame-by-frame analysis, builds a contact sheet, and saves a webm video
 * (sent to the user as the primary verification artifact).
 *
 * Run:  RUN_WHEEL=1 BASE_URL=http://localhost:3001 npx playwright test _wheel
 */
import { test, devices, type Page } from "playwright/test";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";

test.skip(process.env.RUN_WHEEL !== "1", "wheel-recording only");

// home-client locks main.overflow during the 4.5s entrance. Wait until
// scrolling actually takes effect (unchanged from other specs).
async function waitUnlocked(page: Page) {
  await page.waitForFunction(
    () => {
      const m = document.querySelector("main");
      const s = document.querySelector("[data-card-count]");
      return !!m && !!s && getComputedStyle(m).overflowY !== "hidden";
    },
    undefined,
    { timeout: 12_000 },
  );
}

/** Continuous wheel-scroll using main.scrollTo (deterministic, matches what
 *  the user sees with a wheel; simpler than mouse.wheel which scrolls window
 *  not main). Captures a frame every `frameEveryPx` pixels. */
async function recordScroll(
  page: Page,
  label: string,
  outDir: string,
  frameEveryPx = 60,
) {
  mkdirSync(outDir, { recursive: true });
  // Empty the dir
  for (const f of readdirSync(outDir)) {
    try {
      rmSync(`${outDir}/${f}`);
    } catch {}
  }

  // Read the maximum scroll height of main
  const { maxScroll, vh } = await page.evaluate(() => {
    const m = document.querySelector("main")!;
    (m as HTMLElement).style.scrollBehavior = "auto";
    return {
      maxScroll: m.scrollHeight - m.clientHeight,
      vh: m.clientHeight,
    };
  });
  // Go to top
  await page.evaluate(() => {
    document.querySelector("main")!.scrollTo({ top: 0, behavior: "auto" });
  });
  await page.waitForTimeout(200);

  // Down pass
  let frameIdx = 0;
  for (let sy = 0; sy <= maxScroll; sy += frameEveryPx) {
    await page.evaluate(
      (y) => document.querySelector("main")!.scrollTo({ top: y, behavior: "auto" }),
      sy,
    );
    // 2 rAFs + small settle
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        ),
    );
    await page.waitForTimeout(40);
    await page.screenshot({
      path: `${outDir}/${String(frameIdx).padStart(3, "0")}.png`,
    });
    frameIdx++;
  }
  // Final frame at exact maxScroll
  await page.evaluate(
    (y) => document.querySelector("main")!.scrollTo({ top: y, behavior: "auto" }),
    maxScroll,
  );
  await page.waitForTimeout(80);
  await page.screenshot({
    path: `${outDir}/${String(frameIdx).padStart(3, "0")}.png`,
  });

  // Build contact sheet (6 cols × N rows), each thumb 360×(vh/4) for compactness
  const files = readdirSync(outDir)
    .filter((f) => /^\d{3}\.png$/.test(f))
    .sort();
  const cols = 6;
  const tw = 360;
  const th = Math.round(360 * (vh / page.viewportSize()!.width));
  const rows = Math.ceil(files.length / cols);
  const tiles = await Promise.all(
    files.map(async (f, idx) => ({
      input: await sharp(`${outDir}/${f}`)
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
      height: rows * th,
      channels: 3,
      background: "#111",
    },
  })
    .composite(tiles)
    .png()
    .toFile(`tmp/wheel-contact-${label}.png`);

  return { maxScroll, vh, frameCount: files.length };
}

test.use({ video: { mode: "on", size: { width: 1440, height: 900 } } });

test.describe("wheel scroll capture", () => {
  test("desktop 1440×900 — continuous scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await waitUnlocked(page);
    await page.waitForTimeout(300);
    const info = await recordScroll(page, "desktop", "tmp/wheel-frames/desktop", 70);
    console.log("desktop info:", info);
  });

  test("mobile 393×917 — continuous scroll", async ({ page }) => {
    const m = devices["Pixel 5"];
    await page.setViewportSize({ width: 393, height: 917 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await waitUnlocked(page);
    await page.waitForTimeout(300);
    const info = await recordScroll(page, "mobile", "tmp/wheel-frames/mobile", 70);
    console.log("mobile info:", info);
  });
});
