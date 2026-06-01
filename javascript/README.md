# A\* Maze Solver — JavaScript

A browser port of the Python version, rendered to a `<canvas>`. The algorithm is
a direct translation, file for file.

## Running

The page uses ES modules, which browsers won't load over `file://`, so serve the
directory over HTTP:

```sh
npm start            # http://localhost:3000
```

Or, without Node:

```sh
python -m http.server
```

Then open the served URL.

## Testing

```sh
npm ci                 # install pinned dev dependencies (first time)
npm run test:unit      # Vitest: unit tests + cross-language parity
npm run test:e2e       # Playwright: launch smoke + e2e + accessibility
```

The first `test:e2e` run needs browser binaries:
`npx playwright install --with-deps chromium`. See
[../docs/TESTING.md](../docs/TESTING.md) for what each layer guards.

## Files

- `index.html` — the page that wires everything together
- `styles.css` — page styling
- `src/maze.js` — recursive-backtracking maze generation
- `src/astar.js` — the A\* search (`Node` + `AStarSearch`)
- `src/agent.js` — steps the search forward and records explored cells
- `src/main.js` — canvas setup and render loop
