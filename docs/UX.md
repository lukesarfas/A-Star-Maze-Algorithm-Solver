# UX & Accessibility

This document records the user-experience and accessibility decisions behind the
visualiser and the reasoning for each. It is the companion to the requirements in
[SPEC.md](SPEC.md) §6–§7; where the spec states *what*, this states *why*, with
sources.

The brief is narrow: a single canvas that animates an A\* search over a maze,
with transport controls and a stats panel. That narrowness is the point — every
choice below is about making one small thing legible, operable, and robust rather
than adding surface area.

## Colour

Colour carries the bulk of the on-screen meaning (which cells are explored, which
are on the frontier, where the path is), so the palette is the first
accessibility decision, not an afterthought. We use the
[Okabe-Ito palette](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference),
a set of eight colours designed to remain distinguishable under the common forms
of colour-vision deficiency (CVD) — deuteranopia, protanopia, and tritanopia.

### State → colour mapping

| State    | Colour            | Hex       | Notes                                            |
|----------|-------------------|-----------|--------------------------------------------------|
| Explored | Sky blue          | `#56B4E9` | Settled cells the search has already expanded.   |
| Frontier | Orange            | `#E69F00` | The open set — candidates yet to be expanded.    |
| Path     | Yellow            | `#F0E442` | The final shortest path. High luminance: a "reveal". |
| Start    | Bluish green      | `#009E73` | Distinct marker in addition to colour.           |
| Goal     | Vermillion        | `#D55E00` | Distinct marker in addition to colour.           |
| Wall     | Near-black        | —         | Structural, reads as "not traversable".          |
| Open     | Background        | —         | Untouched, traversable cells.                    |

### Why these choices

- **Blue ↔ orange is the safest contrast pair.** The explored set (sky blue) and
  the frontier (orange) are the two states a viewer compares most often — "where
  has the search been vs. where is it about to go". Blue and orange differ along
  an axis that survives all three common CVD types, which is why it is the most
  universally distinguishable pairing and why it is assigned to the most
  comparison-heavy states.
- **Vary hue *and* lightness, not hue alone.** Two colours that differ only in
  hue can collapse to the same grey under CVD. Each state in the table differs
  from its neighbours in lightness as well as hue, so the encoding degrades
  gracefully — the image still reads as distinct regions even in greyscale.
- **The path is the brightest colour.** Yellow (`#F0E442`) has the highest
  luminance in the palette. The path is the payoff of the whole animation, so it
  is given the strongest "pop" against the darker explored/frontier fields — a
  literal reveal.
- **At least 3:1 contrast between adjacent cell states.** Per WCAG 2.2 success
  criterion [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html),
  meaningful graphical objects must have ≥3:1 contrast against what's next to
  them. We treat each cell state as such an object and keep neighbouring states
  (explored/frontier/path/start/goal) at or above that ratio so the boundaries
  between regions are visible without relying on fine colour discrimination.
- **At most six simultaneous categories.** The Okabe-Ito set has eight colours,
  but human colour memory and CVD-safe separation both degrade as the count
  rises. We cap the on-screen palette at six meaningful categories (explored,
  frontier, path, start, goal, wall) so every one stays comfortably distinct.

### Non-colour cues

Colour is never the only carrier of meaning ([WCAG 1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color)):

- A **text legend** names each state ("Explored", "Frontier", "Path", "Start",
  "Goal") alongside its swatch, so the mapping is readable without perceiving the
  colour at all.
- **Start and goal use distinct markers** in addition to their colours.
- The **status text** (below) states the phase and result in words.

Colours are defined as CSS custom properties so the palette — including a
theme/colour-blind variant — can be swapped in one place rather than threaded
through the renderer.

## Accessibility (WCAG 2.2 AA)

The target is [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA for the
interactive visualisation.

- **The canvas is announced.** A `<canvas>` is opaque to assistive technology, so
  it carries `role="img"` and a descriptive `aria-label` that summarises what is
  drawn (the maze and the current state of the search).
- **A live status region.** An `aria-live="polite"` region announces phase and
  result as they change — for example "Exploring, N nodes", "Solved, path length
  N", "No path". `polite` queues the announcement without interrupting the user,
  which suits a stream of incremental updates.
- **Keyboard shortcuts.** Every control is operable from the keyboard, and the
  primary actions have shortcuts: **Space** to play/pause, **→** to step,
  **N** for a new maze, **R** to replay/reset. There are no keyboard traps.
- **Visible focus.** The focus indicator has ≥3:1 contrast against its
  surroundings so keyboard users can always see where they are
  ([1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)).
- **Reduced motion.** When the user has
  [`prefers-reduced-motion: reduce`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
  set, the visualiser renders the final state instantly instead of animating the
  search. No information is lost — the explored set, frontier, and final path are
  all still shown; only the motion is removed.
- **Colour is never the sole carrier** of meaning, as covered above.

## Interaction & animation

The renderer follows a **precompute-then-play-back** model (SPEC §5.2): run the
A\* search to completion first, recording an ordered event log (each settled
node, frontier snapshots, the final path), then animate by replaying that log.
This has direct UX consequences:

- **Pause and step are instant** — they move a cursor through an already-computed
  log rather than resuming a live search.
- **Frames are cheap**, because a frame is a draw of known data, not a search
  step plus a draw.
- **A result is guaranteed before the first paint.** Because the search has
  already finished, there is no risk of an animation that stalls or crashes
  mid-run; the terminal state ("Solved" / "No path") is known in advance.

Other rendering decisions:

- **A single [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
  loop** drives playback, advancing N log steps per frame to control speed. We
  use `requestAnimationFrame` rather than `setInterval` so the loop is synced to
  the display's refresh, pauses with the tab, and never queues work faster than
  the screen can show it.
- **HiDPI scaling** via [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio):
  the canvas backing store is sized to the physical pixel count and re-laid-out
  on resize, so the maze is crisp on retina displays instead of blurry. This and
  the loop design follow MDN's
  [Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
  guidance.
- **A maze is rendered on load** — the canvas is never blank. The showcase begins
  auto-solving immediately so a visitor sees motion within a couple of seconds.
- **Live stats** (nodes explored, frontier size, path length, status) update
  alongside the animation, giving a numeric read on what the colours show.
- **Terminal states are explicit and textual**: "Solved (length N)" or, in the
  defensive case, "No path".

## Reference visualisers & lessons

Prior art we studied and what we took from each:

- **[PathFinding.js](https://qiao.github.io/PathFinding.js/visual/)** — clean
  separation of explored vs. frontier with a clear final-path reveal; confirms
  that the two-set distinction is the core thing to get right.
- **[Clément Mihailescu's Pathfinding Visualizer](https://clementmihailescu.github.io/Pathfinding-Visualizer/)**
  — strong onboarding and an animation that "reveals" the path at the end; the
  high-luminance path colour here is in the same spirit.
- **[VisuAlgo](https://visualgo.net/en)** — thorough and well-regarded for
  desktop study, but a cautionary example for *us*: it is poor on touch and small
  screens. We treat responsive, touch-friendly layout and a guaranteed
  non-blank first paint as requirements rather than nice-to-haves.

## Sources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — W3C Recommendation.
- [Understanding 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).
- [WCAG 1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color).
- [Okabe-Ito palette — hex reference](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference).
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
- [MDN: Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas).
