import { test, expect } from "./fixtures.js";

// Keyboard-only operation (WCAG 2.1.1): Space toggles play/pause, "n" generates
// a new maze. The keydown handler lives on document and ignores form fields, so
// we focus the canvas (not a button) to avoid Space activating a control.
test("Space toggles play/pause and 'n' starts a new maze", async ({ page, pageErrors }) => {
  await page.goto("/");

  const toggle = page.locator("#play-pause");
  await expect(toggle).toBeVisible();
  await page.locator("#maze").focus();

  const initial = (await toggle.textContent())?.trim();
  await page.keyboard.press("Space");
  await expect(toggle).not.toHaveText(initial); // toggled (Play <-> Pause)
  await page.keyboard.press("Space");
  await expect(toggle).toHaveText(initial); // toggled back

  // "n" regenerates without error and the canvas stays present.
  await page.keyboard.press("n");
  await expect(page.locator("#maze")).toBeVisible();

  expect(pageErrors).toEqual([]);
});
