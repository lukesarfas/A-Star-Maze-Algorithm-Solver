import { Maze, WALL, START, END } from "./maze.js";
import { Agent } from "./agent.js";

// Maze dimensions. Odd values keep the outer border intact for the
// recursive-backtracking generator.
const ROWS = 51;
const COLS = 51;

// Colours, matching the original pygame version.
const COLOURS = {
  background: "#ffffff",
  seen: "#646464",
  wall: "#000000",
  start: "#00ff00",
  goal: "#ff0000",
  path: "#00ffff",
  agent: "#0000ff",
};

const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const newMazeButton = document.getElementById("new-maze");
const speedInput = document.getElementById("speed");

let maze;
let agent;
let cellSize;
let offsetX;
let offsetY;
let animationId = null;

function reset() {
  maze = new Maze(ROWS, COLS);
  maze.generate();
  agent = new Agent(maze);
}

// Size the drawing surface to the canvas's CSS box, accounting for the device
// pixel ratio so the cells stay crisp, and centre the maze the way the
// desktop version does.
function layout() {
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.clientWidth;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cellSize = Math.floor(size / Math.max(ROWS, COLS));
  offsetX = Math.floor((size - cellSize * COLS) / 2);
  offsetY = Math.floor((size - cellSize * ROWS) / 2);
}

function fillCell(x, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
}

function draw() {
  ctx.fillStyle = COLOURS.background;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientWidth);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (agent.seen.has(`${x},${y}`)) fillCell(x, y, COLOURS.seen);

      const cell = maze.grid[x][y];
      if (cell === WALL) fillCell(x, y, COLOURS.wall);
      else if (cell === START) fillCell(x, y, COLOURS.start);
      else if (cell === END) fillCell(x, y, COLOURS.goal);
    }
  }

  for (const [x, y] of maze.path) fillCell(x, y, COLOURS.path);

  fillCell(agent.x, agent.y, COLOURS.agent);
}

// One animation frame: step the search a few times (the speed control sets how
// many), redraw, and keep going until the path is found.
function loop() {
  const stepsPerFrame = Number(speedInput?.value ?? 1);
  for (let i = 0; i < stepsPerFrame && !agent.search.found; i++) {
    agent.tick();
  }
  draw();
  animationId = agent.search.found ? null : requestAnimationFrame(loop);
}

function start() {
  if (animationId !== null) cancelAnimationFrame(animationId);
  reset();
  layout();
  animationId = requestAnimationFrame(loop);
}

newMazeButton?.addEventListener("click", start);
window.addEventListener("resize", () => {
  layout();
  draw();
});

start();
