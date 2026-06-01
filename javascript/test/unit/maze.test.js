import { describe, it, expect } from "vitest";
import { Maze, EMPTY, WALL, START, END } from "../../src/maze.js";

// Flood fill over all non-wall cells starting from a position, returning the
// set of "x,y" keys reachable via orthogonal moves.
function floodFill(grid, sx, sy) {
  const cols = grid.length;
  const rows = grid[0].length;
  const seen = new Set();
  const stack = [[sx, sy]];
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
    if (grid[x][y] === WALL) continue;
    seen.add(key);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return seen;
}

function countNonWall(grid) {
  let count = 0;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      if (grid[x][y] !== WALL) count++;
    }
  }
  return count;
}

describe("Maze dimensions", () => {
  for (const size of [11, 21]) {
    it(`builds a ${size}x${size} column-major grid`, () => {
      const maze = new Maze(size, size);
      expect(maze.grid.length).toBe(size); // cols
      expect(maze.grid[0].length).toBe(size); // rows
      expect(maze.startX).toBe(1);
      expect(maze.startY).toBe(1);
      expect(maze.endX).toBe(size - 2);
      expect(maze.endY).toBe(size - 2);
    });
  }

  it("supports non-square dimensions", () => {
    const maze = new Maze(11, 21); // rows=11, cols=21
    expect(maze.grid.length).toBe(21); // cols
    expect(maze.grid[0].length).toBe(11); // rows
  });

  it("starts fully walled before generation", () => {
    const maze = new Maze(11, 11);
    for (let x = 0; x < maze.cols; x++) {
      for (let y = 0; y < maze.rows; y++) {
        expect(maze.grid[x][y]).toBe(WALL);
      }
    }
    expect(maze.path).toEqual([]);
  });
});

describe("Maze.generate()", () => {
  it("marks the start and goal cells", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    expect(maze.grid[maze.startX][maze.startY]).toBe(START);
    expect(maze.grid[maze.endX][maze.endY]).toBe(END);
  });

  it("returns the grid reference", () => {
    const maze = new Maze(11, 11);
    const grid = maze.generate();
    expect(grid).toBe(maze.grid);
  });

  it("keeps the entire outer border solid", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    const cols = maze.cols;
    const rows = maze.rows;
    for (let x = 0; x < cols; x++) {
      expect(maze.grid[x][0]).toBe(WALL);
      expect(maze.grid[x][rows - 1]).toBe(WALL);
    }
    for (let y = 0; y < rows; y++) {
      expect(maze.grid[0][y]).toBe(WALL);
      expect(maze.grid[cols - 1][y]).toBe(WALL);
    }
  });

  it("produces a perfect maze: start reaches goal AND every non-wall cell", () => {
    for (let trial = 0; trial < 5; trial++) {
      const maze = new Maze(21, 21);
      maze.generate();
      const reachable = floodFill(maze.grid, maze.startX, maze.startY);
      // Goal is reachable from start.
      expect(reachable.has(`${maze.endX},${maze.endY}`)).toBe(true);
      // Connectivity: every non-wall cell is reachable from start.
      expect(reachable.size).toBe(countNonWall(maze.grid));
    }
  });

  it("only ever contains the documented cell values", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    const allowed = new Set([EMPTY, WALL, START, END]);
    for (let x = 0; x < maze.cols; x++) {
      for (let y = 0; y < maze.rows; y++) {
        expect(allowed.has(maze.grid[x][y])).toBe(true);
      }
    }
  });
});
