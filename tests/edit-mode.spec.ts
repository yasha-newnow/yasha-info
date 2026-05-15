import { test, expect } from "playwright/test";
import { promises as fs } from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function snapshot(fileName: string): Promise<string> {
  return fs.readFile(path.join(CONTENT_DIR, fileName), "utf-8");
}

async function restore(fileName: string, content: string): Promise<void> {
  await fs.writeFile(path.join(CONTENT_DIR, fileName), content, "utf-8");
}

async function pollFile<T>(
  fileName: string,
  predicate: (parsed: T) => boolean,
  timeoutMs = 4000,
): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, fileName), "utf-8");
    const parsed = JSON.parse(raw) as T;
    if (predicate(parsed)) return parsed;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(
    `File ${fileName} did not match predicate within ${timeoutMs}ms`,
  );
}

test.describe("edit-mode", () => {
  test("Test 1 — inline edit short field → JSON updates → UI reflects", async ({
    page,
  }) => {
    const originalContent = await snapshot("case-cards.json");

    try {
      await page.goto("/");

      // Toggle button appears after client hydration + position-load effect
      const toggle = page.locator('[data-edit-toggle]');
      await expect(toggle).toBeVisible();

      // Activate edit mode
      await toggle.click();
      // Button text flips
      await expect(toggle).toContainText("Done editing");

      // Target SimilarWeb's company name on the first card (desktop variant)
      const companyField = page
        .locator('[data-edit-id="caseCards.0.company"]')
        .first();
      await expect(companyField).toBeVisible();

      // Replace contents and blur
      await companyField.click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type("E2E TestCo");
      // Blur via Enter (Editable prevents default newline and blurs)
      await page.keyboard.press("Enter");

      // Wait for JSON file to reflect the edit
      const parsed = await pollFile<{ caseCards: Array<{ company: string }> }>(
        "case-cards.json",
        (data) => data.caseCards[0].company === "E2E TestCo",
      );
      expect(parsed.caseCards[0].company).toBe("E2E TestCo");

      // Wait for HMR + on-page text reflects the new value
      await expect(companyField).toHaveText("E2E TestCo");
    } finally {
      await restore("case-cards.json", originalContent);
    }
  });

  test("Test 2 — side panel edit + Cmd+B bold → JSON has **markdown** → on-page bold", async ({
    page,
  }) => {
    const originalContent = await snapshot("case-studies.json");

    try {
      await page.goto("/");

      const toggle = page.locator('[data-edit-toggle]');
      await expect(toggle).toBeVisible();
      await toggle.click();

      // Open SimilarWeb sheet: click the card image area (non-Editable region)
      // Click outside any Editable to ensure the card's onClick fires.
      const card = page.locator('article').first();
      await card.click({ position: { x: 600, y: 400 } });

      // Wait for sheet description editable to be visible
      const description = page.locator(
        '[data-edit-id="caseStudies.0.description"]',
      );
      await expect(description).toBeVisible({ timeout: 10_000 });

      // Click → opens native <dialog> panel via showModal(). Top layer means
      // focus is owned by the dialog, no Vaul/Radix interference.
      await description.click();
      const panel = page.locator(
        '[data-edit-panel-label="Case study description"]',
      );
      await expect(panel).toBeVisible();
      const textarea = panel.locator("textarea");
      await expect(textarea).toBeVisible();
      // Native <dialog> places focus inside; our effect targets textarea.
      await expect(textarea).toBeFocused({ timeout: 2_000 });

      // Real-keyboard interaction (no synthetic events). If this works in the
      // test, it works for a real user clicking + typing.
      await textarea.fill("We shipped 40% retention improvement.");
      await expect(textarea).toHaveValue(
        "We shipped 40% retention improvement.",
      );

      // Select "40%" and press Cmd+B
      await textarea.evaluate((el: HTMLTextAreaElement) => {
        const idx = el.value.indexOf("40%");
        el.setSelectionRange(idx, idx + 3);
      });
      await page.keyboard.press("ControlOrMeta+b");

      // Textarea should now contain ** wrappers
      await expect(textarea).toHaveValue(
        "We shipped **40%** retention improvement.",
      );

      // Save via Cmd+S — focus first to make sure textarea owns the keydown
      await textarea.focus();
      await expect(textarea).toBeFocused();
      await page.keyboard.press("ControlOrMeta+s");

      // Panel auto-closes after a brief Saved confirmation
      await expect(panel).toBeHidden({ timeout: 4_000 });

      // CRITICAL: drawer must still be open (native dialog top-layer doesn't
      // dismiss Vaul drawer behind it).
      const drawerStillOpen = await page
        .locator('[data-vaul-drawer]')
        .count();
      expect(drawerStillOpen).toBeGreaterThan(0);

      // JSON file contains the markdown
      const parsed = await pollFile<{
        caseStudies: Array<{ description: string }>;
      }>(
        "case-studies.json",
        (data) =>
          data.caseStudies[0].description ===
          "We shipped **40%** retention improvement.",
      );
      expect(parsed.caseStudies[0].description).toBe(
        "We shipped **40%** retention improvement.",
      );

      // After save, the drawer stays open and applyEdit updates the
      // in-memory context → Editable receives new value → <strong> appears
      // for the bold word. No page reload, no remount.
      const renderedBold = page
        .locator('[data-edit-id="caseStudies.0.description"] strong')
        .first();
      await expect(renderedBold).toHaveText("40%", { timeout: 10_000 });
      await expect(renderedBold).toHaveClass(/text-medium/);
    } finally {
      await restore("case-studies.json", originalContent);
    }
  });

  test("Test 3 — Cmd+Z undoes last edit, multi-level, restores JSON", async ({
    page,
  }) => {
    const originalContent = await snapshot("case-cards.json");

    try {
      await page.goto("/");
      const toggle = page.locator("[data-edit-toggle]");
      await expect(toggle).toBeVisible();
      await toggle.click();

      // First edit: caseCards[0].company → "Probe One"
      const card0 = page
        .locator('[data-edit-id="caseCards.0.company"]')
        .first();
      await card0.click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type("Probe One");
      await page.keyboard.press("Enter");
      await pollFile<{ caseCards: Array<{ company: string }> }>(
        "case-cards.json",
        (d) => d.caseCards[0].company === "Probe One",
      );

      // Second edit: caseCards[1].company → "Probe Two"
      const card1 = page
        .locator('[data-edit-id="caseCards.1.company"]')
        .first();
      await card1.click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type("Probe Two");
      await page.keyboard.press("Enter");
      await pollFile<{ caseCards: Array<{ company: string }> }>(
        "case-cards.json",
        (d) => d.caseCards[1].company === "Probe Two",
      );

      // Undo button should show count 2
      const undoBtn = page.locator("[data-edit-undo]");
      await expect(undoBtn).toContainText("Undo (2)");

      // Cmd+Z → caseCards[1] back to original
      await page.keyboard.press("ControlOrMeta+z");
      const originalC1 = JSON.parse(originalContent).caseCards[1].company;
      await pollFile<{ caseCards: Array<{ company: string }> }>(
        "case-cards.json",
        (d) => d.caseCards[1].company === originalC1,
      );
      await expect(undoBtn).toContainText("Undo (1)");

      // Cmd+Z again → caseCards[0] back to original
      await page.keyboard.press("ControlOrMeta+z");
      const originalC0 = JSON.parse(originalContent).caseCards[0].company;
      await pollFile<{ caseCards: Array<{ company: string }> }>(
        "case-cards.json",
        (d) => d.caseCards[0].company === originalC0,
      );
      // Stack empty → Undo button gone
      await expect(undoBtn).toHaveCount(0);
    } finally {
      await restore("case-cards.json", originalContent);
    }
  });
});
