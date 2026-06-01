import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "coverage/**", "playwright-report/**", "test-results/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "*.config.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        matchMedia: "readonly",
        console: "readonly",
        Number: "readonly",
        Math: "readonly",
        Set: "readonly",
        Array: "readonly",
        JSON: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    // Vitest unit tests run in Node.
    files: ["test/unit/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        console: "readonly",
        URL: "readonly",
        Math: "readonly",
        Set: "readonly",
        Map: "readonly",
        Array: "readonly",
        Number: "readonly",
      },
    },
  },
  {
    // E2E specs run page.evaluate() bodies in the browser, so allow DOM globals.
    files: ["test/e2e/**/*.js", "*.config.js", "playwright.config.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        document: "readonly",
        window: "readonly",
      },
    },
  },
];
