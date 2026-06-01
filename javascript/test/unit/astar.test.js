import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { Maze, WALL } from "../../src/maze.js";
import { AStarSearch } from "../../src/astar.js";

// Build a minimal maze-like object the AStarSearch understands. The grid is
// column-major: grid[x][y].
function makeGrid(cols, rows, fill) {
  return Array.from({ length: cols }, () => new Array(rows).fill(fill));
}

function runToCompletion(search, maxTicks = 100000) {
  let ticks = 0;
  while (!search.found && search.openList.length > 0 && ticks < maxTicks) {
    search.tickSearch();
    ticks++;
  }
  return ticks;
}

// Plain BFS shortest-path length over a column-major grid (number of cells on
// the path, inclusive of both endpoints), or null if unreachable.
function bfsPathLength(grid, sx, sy, gx, gy) {
  const cols = grid.length;
  const rows = grid[0].length;
  const dist = new Map();
  const queue = [[sx, sy]];
  dist.set(`${sx},${sy}`, 1);
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const d = dist.get(`${x},${y}`);
    if (x === gx && y === gy) return d;
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      if (grid[nx][ny] === WALL) continue;
      const key = `${nx},${ny}`;
      if (dist.has(key)) continue;
      dist.set(key, d + 1);
      queue.push([nx, ny]);
    }
  }
  return null;
}

describe("AStarSearch on a hand-built grid", () => {
  it("finds an optimal-length path on an all-open grid", () => {
    const cols = 7;
    const rows = 5;
    const maze = {
      grid: makeGrid(cols, rows, 0),
      startX: 0,
      startY: 0,
      endX: cols - 1,
      endY: rows - 1,
      path: [],
    };
    const search = new AStarSearch(maze);
    runToCompletion(search);

    expect(search.found).toBe(true);
    // Optimal Manhattan path length (cell count) on an obstacle-free grid.
    const optimal = Math.abs(maze.endX - maze.startX) + Math.abs(maze.endY - maze.startY) + 1;
    expect(maze.path.length).toBe(optimal);
    // Endpoints correct.
    expect(maze.path[0]).toEqual([maze.startX, maze.startY]);
    expect(maze.path[maze.path.length - 1]).toEqual([maze.endX, maze.endY]);
  });

  it("never finds a path when the goal is walled off; open list drains", () => {
    const cols = 5;
    const rows = 5;
    const grid = makeGrid(cols, rows, 0);
    // Wall off the goal cell entirely by surrounding it.
    const gx = cols - 1;
    const gy = rows - 1;
    grid[gx - 1][gy] = WALL;
    grid[gx][gy - 1] = WALL;
    const maze = { grid, startX: 0, startY: 0, endX: gx, endY: gy, path: [] };

    const search = new AStarSearch(maze);
    runToCompletion(search);

    expect(search.found).toBe(false);
    expect(search.openList.length).toBe(0);
    expect(maze.path).toEqual([]);
    // Further ticks are a no-op once drained.
    const before = search.closedList.length;
    search.tickSearch();
    expect(search.closedList.length).toBe(before);
  });
});

describe("AStarSearch on a generated maze", () => {
  it("returns a contiguous, wall-free path with correct endpoints", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    const search = new AStarSearch(maze);
    runToCompletion(search);

    expect(search.found).toBe(true);
    const path = maze.path;
    expect(path.length).toBeGreaterThan(0);

    // Endpoints.
    expect(path[0]).toEqual([maze.startX, maze.startY]);
    expect(path[path.length - 1]).toEqual([maze.endX, maze.endY]);

    for (let i = 0; i < path.length; i++) {
      const [x, y] = path[i];
      // Stays off walls.
      expect(maze.grid[x][y]).not.toBe(WALL);
      // Each step is orthogonally adjacent to the previous one.
      if (i > 0) {
        const [px, py] = path[i - 1];
        expect(Math.abs(x - px) + Math.abs(y - py)).toBe(1);
      }
    }
  });

  it("matches BFS shortest length (A* optimality)", () => {
    for (let trial = 0; trial < 3; trial++) {
      const maze = new Maze(21, 21);
      maze.generate();
      const search = new AStarSearch(maze);
      runToCompletion(search);
      expect(search.found).toBe(true);

      const bfsLen = bfsPathLength(maze.grid, maze.startX, maze.startY, maze.endX, maze.endY);
      expect(bfsLen).not.toBeNull();
      expect(maze.path.length).toBe(bfsLen);
    }
  });
});

describe("Cross-language parity", () => {
  it("reproduces the shared fixture path and explored count", () => {
    const fixture = JSON.parse(
      fs.readFileSync(new URL("../../../test/fixtures/astar-parity.json", import.meta.url))
    );

    const maze = {
      grid: fixture.grid,
      startX: fixture.start[0],
      startY: fixture.start[1],
      endX: fixture.goal[0],
      endY: fixture.goal[1],
      path: [],
    };

    const search = new AStarSearch(maze);
    runToCompletion(search);

    expect(search.found).toBe(true);
    expect(maze.path).toEqual(fixture.path);
    expect(search.closedList.length).toBe(fixture.explored);
  });
});
