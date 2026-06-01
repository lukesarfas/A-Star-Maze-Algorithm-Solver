# A\* Pathfinding Visualizer — Product & Technical Specification

**Status:** v1.0 · **Owner:** Luke Sarfas · **Last updated:** 2026-06-01

This is the single source of truth for what "done and shippable" means for this
project. It defines the product, the architecture, and the acceptance bar.

---

## 1. Overview & positioning

An interactive visualiser for the **A\*** pathfinding algorithm. A maze is
generated with recursive backtracking and then solved with A\* (Manhattan
heuristic); the explored cells, the live frontier, and the final shortest path
are animated as the search runs.

It ships in two forms:

- **Open-source project** (this repo) — a faithful Python/pygame implementation
  and a faithful JavaScript/canvas port, each runnable on its own.
- **Flagship web showcase** — a polished, accessible, embeddable demo deployed
  as part of [luke.sarfas.com](https://luke.sarfas.com) (`apps/maze` in the
  `luke.sarfas.com` monorepo), featured on the hub via the applet contract.

**Positioning:** a small, beautifully-finished demonstration of a classic
algorithm — fast, accessible, secure, and dependency-light — that doubles as a
portfolio piece and a teaching aid.

## 2. Goals & non-goals

### Goals
- Correct, faithful A\* and maze generation, identical across Python and JS.
- A web experience that **launches every time, never crashes on load, and shows
  all UI** on first paint (no blank canvas, no console errors).
- WCAG 2.2 AA accessibility for the interactive visualisation.
- Strong defaults for security (CSP + headers) and cost (no surprise bills).
- Comprehensive automated tests (unit, e2e, accessibility, launch smoke) in CI.
- Clear documentation for users, contributors, security researchers, and ops.

### Non-goals
- Multiple algorithms (Dijkstra, BFS, …). A\* only for v1. (Roadmap §13.)
- A backend, accounts, persistence, or analytics. The site stays fully static.
- Mobile-app packaging. Web only.

## 3. Users & use cases
- **Recruiter / visitor** — lands on the showcase, sees an animated solve within
  ~2s, understands what it is in one sentence, can interact in one click.
- **Learner** — reads "how it works", steps through the search, watches the
  frontier vs explored set, sees the path reveal.
- **Developer** — reads the source, runs it locally (Python or JS), forks it.

## 4. Functional requirements

| # | Requirement |
|---|---|
| F1 | Generate a perfect maze via recursive backtracking; configurable odd size. |
| F2 | Solve with A\* (Manhattan heuristic); reproduce the path a tick at a time. |
| F3 | Render: walls, open cells, **explored**, **frontier**, **shortest path**, **start**, **goal**, current cell. |
| F4 | Transport controls: **Play/Pause** (single toggle), **Step**, **New maze**. |
| F5 | Config controls: **custom size** (any value, 11–501 cells per side), **speed** (slider). |
| F6 | Live stats: nodes explored, frontier size, path length, status. |
| F7 | A maze is rendered and (on the showcase) auto-solving **on load** — never blank. |
| F8 | Terminal states are explicit: "Solved (length N)" and "No path" (defensive). |
| F9 | Embeddable applet variant that is self-contained and auto-loops for liveliness. |

## 5. Architecture

### 5.1 Two implementations, one design
Both share the same module structure: `maze` generates the grid, `astar` runs
the search one node at a time, `agent` steps it forward, `main` renders.

- **Python** (`python/`) — pygame desktop app. The original. Unchanged.
- **JavaScript** (`javascript/`) — faithful ES-module port to `<canvas>`. The
  reference web implementation, kept simple and 1:1 with the Python.

Faithfulness is verified by test: on an identical grid, the JS search must
produce the **same path and the same node-expansion count** as `python/astar.py`.

### 5.2 Showcase renderer (product)
The deployed showcase (`apps/maze` in the monorepo) uses an **optimised variant**
of the same algorithm so it can scale to large, custom maze sizes (up to
501×501 ≈ 250k cells), where the faithful linear-scan port would hang. It
produces the same optimal shortest path (unique in a perfect maze). Model:

- **Typed-array maze + heap-based A\*.** Generation and search run on flat typed
  arrays with a binary-heap open set (lazy deletion) — O(E log V), not the
  faithful port's O(n²) list scans.
- **Precompute, then play back.** Run the search to completion immediately,
  recording the cell expansion order, discovery order, and the final path.
  Animation is pure playback of that log: pause/step are instant, a result is
  guaranteed before the first frame, and there are no mid-animation crashes.
- **Offscreen ImageData renderer.** Cells are written to a 1px-per-cell offscreen
  buffer scaled crisply onto the display canvas; a frame costs ~O(changed cells),
  not O(grid), so even 501×501 animates smoothly.
- **Single `requestAnimationFrame` loop**, steps/frame auto-scaled to the maze
  size (so huge mazes finish in a few seconds) and the speed control (never
  `setInterval`).
- **HiDPI**: scale the backing store by `devicePixelRatio`; re-layout on resize.
- Start/goal are drawn as outlined markers with a minimum size so they stay
  visible at any maze size. Colours come from CSS custom properties.

The faithful, 1:1 port stays in this repo (`javascript/`) as the reference
implementation and is what the parity test (§5.1) verifies.

## 6. UX requirements
(See [docs/UX.md](UX.md) for rationale and sources.)

- **Okabe-Ito colour-blind-safe palette** mapped to cell states; vary hue *and*
  lightness; ≥3:1 contrast between adjacent cell states.
- **Second, non-colour cue** for every state (the legend names each state in
  text; start/goal use distinct markers).
- **Light/dark theme** honouring `prefers-color-scheme`.
- **Maze on load** (no blank canvas); first value within ~2s.
- **Live stats** panel; explicit terminal state text.
- Controls grouped: transport (play/pause/step) distinct from config (size/speed/new).

## 7. Accessibility (WCAG 2.2 AA) — required
- **Keyboard**: every control operable; shortcuts **Space** (play/pause),
  **→** (step), **N** (new), **R** (reset/replay); visible focus ring ≥3:1; no traps.
- **Canvas alternative**: `<canvas>` has a descriptive `aria-label`; an
  `aria-live="polite"` region announces phase/result ("Exploring… N nodes",
  "Solved, path length N", "No path").
- **Non-text status**: textual Running/Paused/Solved state, not colour-only.
- **`prefers-reduced-motion`**: render to the final/instant state instead of
  animating; honoured automatically, with no loss of information.
- **Colour is never the only carrier** of meaning (1.4.1).

## 8. Security — required
(See [SECURITY.md](../SECURITY.md) and the monorepo `firebase.json`.)
- The maze pages have **no inline scripts** and serve a strict CSP
  `script-src 'self'` (scoped to `/sites/maze/**`). The hub's own pages carry a
  site-wide CSP that additionally allows `'unsafe-inline'` for scripts/styles —
  the hub has pre-existing inline scripts (theme/version stamp) and loads Google
  Fonts; the looser hub policy still enforces `frame-ancestors`, `object-src`,
  and `base-uri`. The maze remains strict via the more-specific (last-match) block.
- Site-wide CSP + `Strict-Transport-Security`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP`.
- Applet path serves `frame-ancestors 'self' https://luke.sarfas.com` and
  `Cross-Origin-Resource-Policy: cross-origin`.
- Parent iframe uses `sandbox="allow-scripts"` (never with `allow-same-origin`),
  `referrerpolicy="no-referrer"`.
- Supply chain: committed lockfiles, `npm ci` in CI, Dependabot with a cooldown.
  An `npm audit --audit-level=high` gate runs in the canonical repo (clean — small,
  exact-pinned dev deps). The monorepo CI does **not** gate on audit: its
  outstanding high advisories live entirely in Astro's SSR/dev-server code paths,
  which a static (`output: 'static'`) build never ships, and clearing them needs a
  breaking Astro 6 migration across every app — tracked separately.
- No third-party CDNs at runtime in the maze; the hub loads Google Fonts.

## 9. Cost — required
(See the monorepo `docs/COST.md`.)
- Classic Firebase Hosting (static) — not App Hosting.
- Realistic bill: **$0** at portfolio traffic. The only metered dimension is
  egress (10 GB/mo free).
- Protections: immutable long-cache on fingerprinted assets, short-cache HTML;
  no large files hosted; documented GCP budget + alert (and optional killswitch)
  runbook; prefer Spark (a true free hard-cap) unless a Blaze feature is needed.

## 10. Testing — required
(See [docs/TESTING.md](TESTING.md).)
- **Unit (Vitest)**: maze generation invariants, A\* correctness, JS↔Python parity.
- **Python (pytest)**: maze + A\* logic, with a `pygame` import shim (no display).
- **E2E + launch smoke (Playwright)**: showcase and applet load with **zero
  console errors / no uncaught exceptions**, canvas actually renders (non-blank),
  every control is visible and operable, the solve completes.
- **Accessibility (@axe-core/playwright)**: no serious/critical violations.
- All gated in CI on every push/PR.

## 11. Performance budgets
- Showcase page first-load transfer **< 200 KB** (excl. fonts); applet **< 150 KB**.
  Verified: showcase ≈ 37 KB and applet ≈ 26 KB of HTML+CSS+JS (raw, pre-gzip) —
  comfortably within budget.
- First maze painted **< 1s** on a mid-tier laptop; interaction within one click.
- Custom sizes up to **501×501** (≈250k cells) generate, solve, and begin
  animating without blocking the UI. Verified: a 501×501 maze precomputes in
  ~50ms and the full solve animates in ~2s; frame cost is O(changed cells).

## 12. Definition of Done (the ship bar)
Gates run in two places: the **canonical repo CI** (`.github/workflows/ci.yml`
here) gates the algorithm and the standalone demo; the **monorepo CI + deploy**
gate the shipped site. A change is shippable only when **all** of the following
hold:
1. `npm run build` (monorepo, all sites + hub) and the standalone builds succeed
   with no errors. *(Monorepo CI runs the full build on every push/PR.)*
2. All unit, e2e, a11y, launch-smoke, and pytest suites pass in CI. *(Canonical
   repo: unit + e2e + a11y + pytest; monorepo: full build + e2e/smoke/a11y/keyboard;
   deploy: an explicit launch-smoke gate before the Firebase step.)*
3. Lint (ESLint) and format (Prettier/ruff) are clean. *(Gated in the canonical
   repo, which owns the engine source; the monorepo vendors that same engine.)*
4. JS↔Python parity test passes (shared fixture).
5. The deployed showcase and applet load with no console errors and all UI visible
   — enforced by the launch-smoke gate in `deploy.yml` before deploy.
6. `npm audit --audit-level=high` is clean in the canonical repo. (The monorepo's
   Astro advisories are SSR/dev-server only and don't affect its static output — §8.)
7. Security headers verified present on the deployed site (CSP, HSTS, etc.).
8. Docs current. Project docs (README, SPEC, UX, TESTING, SECURITY, CONTRIBUTING)
   live in the canonical repo; the monorepo carries its own README, SECURITY, and
   COST.
9. Accessibility: keyboard-only operation works end to end; axe is clean;
   reduced-motion path verified.

## 13. Roadmap (post-v1)
- Additional algorithms (Dijkstra, BFS, Greedy) with a comparison view.
- Editable mazes (drag walls, drag start/goal) and shareable permalinks.
- Web Worker for the search on very large grids.
- Multiple maze generators (Prim's, recursive division).
