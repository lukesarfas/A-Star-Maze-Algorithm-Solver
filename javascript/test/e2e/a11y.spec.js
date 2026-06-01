import { test, expect } from "./fixtures.js";
import AxeBuilder from "@axe-core/playwright";

test("has no accessibility violations (WCAG 2.0/2.1 A & AA)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#maze")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
