import { test as base, expect } from "@playwright/test";

// Extends the base test with a `pageErrors` fixture that captures every console
// error and uncaught page exception that occurs during the test. Specs assert
// this array stays empty.
export const test = base.extend({
  pageErrors: async ({ page }, use) => {
    const errors = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      errors.push(`pageerror: ${err.message}`);
    });

    await use(errors);
  },
});

export { expect };
