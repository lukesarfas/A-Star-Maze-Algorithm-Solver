# Testing

The project is small but the testing is layered, because the goals are specific:
the algorithm must be correct, the JS port must stay behaviourally identical to
the Python original, and the web build must **never crash on launch**. Each layer
guards one of those properties.

| Layer | Tool | Location | Guards |
|-------|------|----------|--------|
| Unit + parity | Vitest | `javascript/test/unit/` | A\* correctness, maze invariants, JS↔Python parity |
| Launch smoke / E2E | Playwright | `javascript/test/e2e/` | The page loads, renders, and solves — with zero console errors |
| Accessibility | `@axe-core/playwright` | `javascript/test/e2e/` | No serious/critical WCAG violations |
| Python logic | pytest | `python/tests/` | A\* + maze logic, no display required |

All four run in CI on every push and pull request — see
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## What each layer guards

### Unit tests (Vitest)

These exercise the algorithm core (`src/maze.js`, `src/astar.js`,
`src/agent.js`) directly, with no DOM or canvas. They check the things that must
hold for any input:

- **Maze invariants** — generation produces a perfect maze (one path between any
  two cells), correct dimensions, start and goal placed and reachable.
- **A\* correctness** — finds the shortest path when one exists, reports no path
  when none does, expands nodes in the right order.

Vitest is configured (`javascript/vitest.config.js`) with coverage thresholds on
the three core modules, so the algorithm code stays well covered as it changes.

### Cross-language parity (Vitest + pytest)

This is the test that keeps the port honest. Both the JS and Python suites load
the **same fixture**, [`test/fixtures/astar-parity.json`](../test/fixtures/astar-parity.json)
— a fixed 11×11 grid with a known start and goal — run their own A\*
implementation on it, and assert they produce the **exact same path** and the
**exact same explored-node count**.

Because both languages are pinned to the same expected output in the fixture, the
two implementations cannot drift: any change to the algorithm semantics on one
side fails the parity assertion on at least one side. This is the mechanism
behind the faithfulness rule in [SPEC.md](SPEC.md) §5.1.

### Launch smoke / E2E (Playwright)

This layer enforces the **"never crashes on launch" guarantee** (SPEC §2, §10).
A real browser loads the page and asserts:

- **Zero console errors and no uncaught exceptions** during load and solve. The
  test fails on the first `console.error` or unhandled rejection.
- **The canvas actually renders.** It reads pixels back with `getImageData` and
  asserts the canvas is **not blank** — catching the classic failure where the
  page loads but nothing is drawn.
- **Controls are visible and enabled** — transport (play/pause, step, new) and
  config controls are present and operable.
- **The solve completes** — the animation reaches a terminal state.

### Accessibility (`@axe-core/playwright`)

Runs [axe-core](https://github.com/dequelabs/axe-core) against the loaded page
and asserts **no serious or critical** WCAG violations, covering the automatable
portion of the AA bar in [docs/UX.md](UX.md). (Manual checks — keyboard-only
operation, reduced-motion, focus visibility — are part of the Definition of Done
but not automated here.)

### Python logic (pytest)

The Python suite (`python/tests/`) tests `maze.py`, `astar.py`, and `agent.py`
without a display. `maze.py` has a top-level `import pygame` that the logic never
uses, so `python/tests/conftest.py` installs a **`pygame` import shim**: it stubs
`pygame` (and its submodules) into `sys.modules` with `MagicMock` *before* the
modules are imported. This lets the logic tests — including the parity test — run
headless in CI with no pygame install and no window.

## Running the tests

### JavaScript

From the `javascript/` directory:

```sh
npm ci                 # install pinned dev dependencies (first time)
npm run test:unit      # Vitest: unit tests + cross-language parity
npm run test:e2e       # Playwright: launch smoke + e2e + accessibility
```

The first Playwright run needs browser binaries:

```sh
npx playwright install --with-deps chromium
```

Playwright starts its own static server (see `javascript/playwright.config.js`),
so you don't need to start one yourself.

### Python

From the `python/` directory:

```sh
pip install -r requirements-dev.txt    # pytest, ruff, pygame
python -m pytest -q
```

The pygame shim means the tests run headless; pygame is listed for parity with
the runtime environment but a display is never opened.

## CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs the full set on
every push and pull request: Vitest unit + parity, Playwright launch-smoke / e2e,
axe accessibility, and pytest. Lint (ESLint, ruff) and format (Prettier) checks
run alongside. A change is only shippable when all of it is green — see the
Definition of Done in [SPEC.md](SPEC.md) §12.
