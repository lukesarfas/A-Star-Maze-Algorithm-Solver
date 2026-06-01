import { test, expect } from "./fixtures.js";

// Scans the canvas for any pixel that is not the uniform background, proving the
// renderer actually drew something (non-blank canvas).
async function canvasIsNonBlank(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById("maze");
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { width, height } = canvas;
    if (width === 0 || height === 0) return false;
    const data = ctx.getImageData(0, 0, width, height).data;
    // Reference colour: the first pixel.
    const r0 = data[0];
    const g0 = data[1];
    const b0 = data[2];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== r0 || data[i + 1] !== g0 || data[i + 2] !== b0) {
        return true;
      }
    }
    return false;
  });
}

test("loads, renders a non-blank canvas, and has working controls", async ({ page, pageErrors }) => {
  const response = await page.goto("/");
  expect(response, "navigation produced a response").toBeTruthy();
  expect(response.status()).toBeLessThan(400);

  const canvas = page.locator("#maze");
  await expect(canvas).toBeVisible();

  // A draw is triggered on load; the maze paints walls regardless of the
  // animation state, so the canvas should be non-blank immediately.
  await expect.poll(() => canvasIsNonBlank(page)).toBe(true);

  // Every control is visible AND enabled.
  for (const id of ["#play-pause", "#step", "#new-maze", "#speed"]) {
    const control = page.locator(id);
    await expect(control).toBeVisible();
    await expect(control).toBeEnabled();
  }

  // Exercise a control: generate a fresh maze and confirm it still renders.
  await page.locator("#new-maze").click();
  await expect.poll(() => canvasIsNonBlank(page)).toBe(true);

  // Exercise the step control.
  await page.locator("#step").click();
  await expect.poll(() => canvasIsNonBlank(page)).toBe(true);

  // The a11y status region must carry text describing the run state.
  await expect(page.locator("#a11y-status")).not.toBeEmpty();

  // No console errors and no uncaught exceptions throughout.
  expect(pageErrors).toEqual([]);
});
