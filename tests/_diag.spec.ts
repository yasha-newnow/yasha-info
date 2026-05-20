import { test } from "playwright/test";
import { mkdirSync, readdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const DIR = "tmp/scrub";

test.skip(process.env.RUN_DIAG !== "1", "diagnostic only");

test("diag: real scroll-through of works deck", async ({ page }) => {
  mkdirSync(DIR, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-card-count]", { timeout: 10_000 });

  const geo = await page.evaluate(() => {
    const main = document.querySelector("main")!;
    const track = document.querySelector<HTMLElement>("[data-card-count]")!;
    const trackTop =
      track.getBoundingClientRect().top -
      main.getBoundingClientRect().top +
      main.scrollTop;
    return {
      trackTop,
      maxScrub: track.offsetHeight - main.clientHeight,
      vh: main.clientHeight,
    };
  });

  const STEPS = 21;
  const from = geo.trackTop - geo.vh * 0.25;
  const to = geo.trackTop + geo.maxScrub + geo.vh * 0.15;
  const rows: string[] = [];

  for (let i = 0; i < STEPS; i++) {
    const sTop = Math.round(from + ((to - from) * i) / (STEPS - 1));
    const data = await page.evaluate((y) => {
      const main = document.querySelector("main")!;
      main.scrollTop = y;
      const read = (sel: string) => {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const content = el.querySelector<HTMLElement>("[data-card-content]");
        return {
          op: +(+cs.opacity).toFixed(2),
          tf: cs.transform,
          blur: content ? getComputedStyle(content).filter : "n/a",
          tint: parseFloat(cs.getPropertyValue("--card-tint")) || 0,
        };
      };
      const track = document.querySelector<HTMLElement>("[data-card-count]");
      const dep = (i: number) =>
        document
          .querySelector<HTMLElement>(`[data-stack-index="${i}"]`)
          ?.dataset.depth ?? "?";
      return {
        scrollTop: Math.round(main.scrollTop),
        p: track?.dataset.p ?? "?",
        d: `${dep(0)}/${dep(1)}/${dep(2)}`,
        c0: read('[data-stack-index="0"]'),
        c1: read('[data-stack-index="1"]'),
        c2: read('[data-stack-index="2"]'),
      };
    }, sTop);
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        ),
    );
    await page.waitForTimeout(70);
    await page.screenshot({
      path: `${DIR}/${String(i).padStart(2, "0")}.png`,
    });
    const m = (x: { op: number; tf: string } | null) =>
      x ? `op${x.op} ${x.tf.replace(/matrix\(|\)/g, "").slice(0, 24)}` : "—";
    rows.push(
      `#${String(i).padStart(2)} sy=${String(data.scrollTop).padStart(
        5,
      )} p=${data.p} d=${data.d} | c0 ${m(data.c0)} | c1 ${m(
        data.c1,
      )} | c2 ${m(data.c2)}`,
    );
  }

  console.log(
    `\nGEO trackTop=${Math.round(geo.trackTop)} maxScrub=${Math.round(
      geo.maxScrub,
    )} vh=${geo.vh}\n` + rows.join("\n"),
  );

  // Contact sheet (3 cols) so the whole scroll reads in one image.
  const files = readdirSync(DIR)
    .filter((f) => /^\d\d\.png$/.test(f))
    .sort();
  const cols = 3;
  const tw = 480;
  const th = 300;
  const rowsN = Math.ceil(files.length / cols);
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
      height: rowsN * th,
      channels: 3,
      background: "#111",
    },
  })
    .composite(tiles)
    .png()
    .toFile("tmp/scrub-contact.png");
});
