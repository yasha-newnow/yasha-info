// Rebuilds public/cv.pdf from public/cv.html — the single source of truth.
// HTML is the thing you edit; this turns it into a vector PDF (like Cmd+P /
// Playwright page.pdf), which the site serves as a static file. Run via
// `npm run cv:pdf`; the pre-commit hook runs it automatically when cv.html
// changes. Playwright/Chromium runs HERE (build-time) — never in the
// visitor's browser.

import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const htmlPath = resolve(root, "public/cv.html");
const pdfPath = resolve(root, "public/cv.pdf");

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  console.error("\n✖ Could not launch Chromium for PDF generation.");
  console.error("  Install the browser once with:  npx playwright install chromium\n");
  console.error(err.message);
  process.exit(1);
}

try {
  // Desktop viewport so the page's mobile-scaling script stays a no-op.
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  // Wait for Inter (Google Fonts) before capture, else metrics shift.
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  console.log(`✔ Generated ${pdfPath}`);
} finally {
  await browser.close();
}
