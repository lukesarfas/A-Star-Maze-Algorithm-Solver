# Contributing

Thanks for your interest in improving the A\* maze visualiser. This guide covers
local setup, running the tests and linters, the one rule that matters most
(keeping the two implementations faithful to each other), and the checklist a
pull request needs to clear.

Before starting non-trivial work, please read [docs/SPEC.md](docs/SPEC.md) — it
is the source of truth for what "done and shippable" means.

## Local development

The repo has two independent implementations. You can work on either; most
contributors will touch both because of the faithfulness rule below.

### Python

Requires Python 3.12.

```sh
cd python
pip install -r requirements.txt      # runtime: pygame
python main.py                       # opens the pygame window
```

For tests and linting, also install the dev dependencies:

```sh
pip install -r requirements-dev.txt  # pytest, ruff (pygame is stubbed in tests)
```

### JavaScript

Requires a recent Node.js (with `npm`).

```sh
cd javascript
npm ci                               # install pinned dev dependencies
npm start                            # serve the page at http://localhost:3000
```

ES modules cannot be loaded from `file://`, so the page must be served over HTTP;
`npm start` (or any static file server) does this.

## Running tests and linters

See [docs/TESTING.md](docs/TESTING.md) for what each layer guards. The commands:

**JavaScript** (from `javascript/`):

```sh
npm run test:unit      # Vitest: unit tests + cross-language parity
npm run test:e2e       # Playwright: launch smoke + e2e + accessibility
npm run lint           # ESLint
npm run format:check   # Prettier
```

The first `npm run test:e2e` needs browser binaries:
`npx playwright install --with-deps chromium`.

**Python** (from `python/`):

```sh
pip install -r requirements-dev.txt
python -m pytest -q        # logic tests (headless via the pygame shim)
ruff check tests           # lint (scoped to tests/; the originals are never linted)
ruff format --check tests  # format
```

All of the above runs in CI on every push and pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Code style & the faithfulness rule

- **The JavaScript port must stay behaviourally identical to the Python.** On any
  identical grid, the JS A\* must produce the **same path** and the **same
  node-expansion count** as `python/astar.py`. This is enforced by the
  cross-language parity test, which runs both implementations against the shared
  fixture [`test/fixtures/astar-parity.json`](test/fixtures/astar-parity.json)
  and asserts identical output.
- **Do not change algorithm semantics** (heuristic, tie-breaking, expansion
  order, neighbour iteration) on one side without making the matching change on
  the other and updating the fixture. If a change alters the path or the explored
  count, the parity test is *supposed* to fail until both sides — and the
  recorded expectation — agree.
- **Keep the two modules structurally 1:1**: `maze`, `astar`, `agent`, `main`
  mirror each other across the languages. Prefer the simplest translation over a
  cleverer idiom that drifts from the other implementation.
- **Match the existing style.** JS is formatted with Prettier and linted with
  ESLint; Python with ruff. Run the formatters before committing; CI checks them.
- The `.editorconfig` at the repo root sets baseline whitespace conventions.

## Pull request checklist

A PR is ready to merge when it satisfies the Definition of Done in
[docs/SPEC.md](docs/SPEC.md) §12. In practice, confirm:

- [ ] Builds succeed with no errors.
- [ ] Vitest unit tests pass.
- [ ] The **JS↔Python parity** test passes.
- [ ] Playwright launch-smoke / e2e pass — the page loads with **no console
      errors**, the canvas renders (non-blank), all controls are visible and
      operable, and the solve completes.
- [ ] axe accessibility check passes (no serious/critical violations).
- [ ] pytest passes.
- [ ] Lint and format are clean (ESLint + Prettier for JS, ruff for Python).
- [ ] `npm audit --audit-level=high` reports no high/critical advisories.
- [ ] Accessibility holds: keyboard-only operation works end to end, focus is
      visible, and the reduced-motion path renders the final state.
- [ ] Docs are updated if behaviour or interfaces changed (README, SPEC, UX,
      TESTING, SECURITY).

## Reporting security issues

Please **do not** open public issues for security vulnerabilities. Follow
[SECURITY.md](SECURITY.md) instead.

## License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
