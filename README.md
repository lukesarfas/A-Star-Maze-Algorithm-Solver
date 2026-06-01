# A* Maze Solver

![CI](https://github.com/lukesarfas/A-Star-Maze-Algorithm-Solver/actions/workflows/ci.yml/badge.svg)

A small project for visualising the A* pathfinding algorithm. A maze is generated
with recursive backtracking and then solved with A*, drawing the explored cells
and the final route as the search runs.

It began as a Python/pygame desktop program; the [`javascript/`](javascript)
directory is a faithful port of the same algorithm that runs in the browser.

**Live demo:** <https://luke.sarfas.com/projects/maze>

## How it works

**Maze generation — recursive backtracking.** Starting from the top-left cell, the
generator carves corridors by stepping two cells in a random direction, knocking
down the wall in between, and backtracking whenever it reaches a dead end. The
result is a "perfect" maze: exactly one path between any two cells.

**Pathfinding — A\*.** A* explores outward from the start, always expanding the
open cell with the lowest `f = g + h`, where `g` is the distance travelled so far
and `h` is the Manhattan distance to the goal. The heuristic keeps the search
biased towards the goal, so it finds the shortest route while exploring far fewer
cells than an uninformed search would.

## Layout

```
python/       pygame desktop version (the original)
javascript/   browser port — same algorithm, canvas rendering
```

Both implementations share the same structure: `maze` generates the grid, `astar`
runs the search one node at a time, `agent` steps it forward, and `main` drives
the render loop.

## Running

### Python

```sh
cd python
pip install -r requirements.txt
python main.py
```

### JavaScript

ES modules can't be loaded from `file://`, so serve the directory over HTTP:

```sh
cd javascript
npm start            # http://localhost:3000
```

Any static file server works — `python -m http.server` from `javascript/` is a
fine alternative.

## Testing

The two implementations share a layered test strategy — Vitest unit tests, a
cross-language parity fixture, Playwright launch-smoke / e2e, axe accessibility,
and pytest — all run in CI. See [docs/TESTING.md](docs/TESTING.md) for what each
layer guards. In short:

```sh
# JavaScript (from javascript/)
npm run test:unit      # unit tests + JS↔Python parity
npm run test:e2e       # launch smoke + e2e + accessibility

# Python (from python/)
pip install -r requirements-dev.txt
python -m pytest -q
```

## Documentation

- [docs/SPEC.md](docs/SPEC.md) — product & technical specification (the ship bar).
- [docs/UX.md](docs/UX.md) — UX and accessibility decisions, with sources.
- [docs/TESTING.md](docs/TESTING.md) — test strategy and how to run it.
- [CONTRIBUTING.md](CONTRIBUTING.md) — local setup, the faithfulness rule, PR checklist.
- [SECURITY.md](SECURITY.md) — vulnerability disclosure policy.

## License

[MIT](LICENSE)
