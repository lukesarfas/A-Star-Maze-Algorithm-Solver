import { Maze, WALL, START, END } from "./maze.js";
import { Agent } from "./agent.js";

// Maze dimensions. Odd values keep the outer border intact for the
// recursive-backtracking generator.
const ROWS = 51;
const COLS = 51;

// Read a colour from the CSS custom properties so the palette (including the
// colour-blind-safe Okabe-Ito palette and dark theme) lives in one place. The
// fallback keeps the renderer working even if the stylesheet failed to load.
function cssColour(name, fallback) {
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

function readColours() {
  return {
    background: cssColour("--c-background", "#ffffff"),
    seen: cssColour("--c-seen", "#56b4e9"),
    frontier: cssColour("--c-frontier", "#e69f00"),
    wall: cssColour("--c-wall", "#14141a"),
    start: cssColour("--c-start", "#009e73"),
    goal: cssColour("--c-goal", "#d55e00"),
    path: cssColour("--c-path", "#f0e442"),
    agent: cssColour("--c-agent", "#0072b2"),
  };
}

// Draw a short, legible error message so the canvas is never left blank.
function drawError(canvas, message) {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width || 640;
    const h = canvas.height || 640;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#14141a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, w / 2, h / 2);
  } catch {
    /* Nothing more we can safely do. */
  }
}

function setup() {
  const canvas = document.getElementById("maze");
  if (!canvas) throw new Error("Missing #maze canvas element.");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  const playPauseButton = document.getElementById("play-pause");
  const stepButton = document.getElementById("step");
  const newMazeButton = document.getElementById("new-maze");
  const speedInput = document.getElementById("speed");
  const statusRegion = document.getElementById("a11y-status");

  // Honour the user's motion preference: when reduced motion is requested we
  // skip the animation entirely and render the final solved state directly.
  let prefersReducedMotion = false;
  try {
    prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    prefersReducedMotion = false;
  }

  let colours = readColours();
  let maze;
  let agent;
  let cellSize;
  let offsetX;
  let offsetY;
  let animationId = null;
  let playing = false;

  function setStatus(text) {
    if (statusRegion) statusRegion.textContent = text;
  }

  function reset() {
    maze = new Maze(ROWS, COLS);
    maze.generate();
    agent = new Agent(maze);
  }

  // Run the search all the way to completion without animating. Used for the
  // reduced-motion path so the final state is shown immediately.
  function solveImmediately() {
    let guard = ROWS * COLS * 4;
    while (!agent.search.found && agent.search.openList.length > 0 && guard-- > 0) {
      agent.tick();
    }
  }

  // Size the drawing surface to the canvas's CSS box, accounting for the device
  // pixel ratio so the cells stay crisp, and centre the maze.
  function layout() {
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || canvas.width || 640;
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
    const size = canvas.clientWidth || canvas.width || 640;
    ctx.fillStyle = colours.background;
    ctx.fillRect(0, 0, size, size);

    // The frontier is whatever is still queued in the open list.
    const frontier = new Set();
    if (!agent.search.found) {
      for (const node of agent.search.openList) {
        frontier.add(`${node.position[0]},${node.position[1]}`);
      }
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const key = `${x},${y}`;
        if (agent.seen.has(key)) fillCell(x, y, colours.seen);
        if (frontier.has(key)) fillCell(x, y, colours.frontier);

        const cell = maze.grid[x][y];
        if (cell === WALL) fillCell(x, y, colours.wall);
        else if (cell === START) fillCell(x, y, colours.start);
        else if (cell === END) fillCell(x, y, colours.goal);
      }
    }

    for (const [x, y] of maze.path) fillCell(x, y, colours.path);

    if (!agent.search.found) fillCell(agent.x, agent.y, colours.agent);
  }

  function announceState() {
    if (agent.search.found) {
      setStatus(`Solved, path length ${maze.path.length}`);
    } else if (agent.search.openList.length === 0) {
      setStatus("No path");
    } else if (playing) {
      setStatus("Searching…");
    } else {
      setStatus("Paused");
    }
  }

  // Stop the animation loop when the search is finished or stalled.
  function finished() {
    return agent.search.found || agent.search.openList.length === 0;
  }

  function updatePlayPause() {
    if (!playPauseButton) return;
    playPauseButton.textContent = playing ? "Pause" : "Play";
    playPauseButton.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  // One animation frame: step the search a few times (the speed control sets
  // how many), redraw, and keep going until the search resolves.
  function loop() {
    const stepsPerFrame = Number(speedInput?.value ?? 1) || 1;
    for (let i = 0; i < stepsPerFrame && !finished(); i++) {
      agent.tick();
    }
    draw();
    if (finished()) {
      playing = false;
      animationId = null;
      updatePlayPause();
      announceState();
    } else {
      animationId = requestAnimationFrame(loop);
    }
  }

  function play() {
    if (finished()) return;
    if (animationId !== null) return;
    playing = true;
    updatePlayPause();
    announceState();
    animationId = requestAnimationFrame(loop);
  }

  function pause() {
    playing = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    updatePlayPause();
    announceState();
  }

  function togglePlay() {
    if (playing) pause();
    else play();
  }

  function step() {
    pause();
    if (!finished()) agent.tick();
    draw();
    announceState();
  }

  function newMaze() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    playing = false;
    reset();
    layout();

    if (prefersReducedMotion) {
      // No animation: jump straight to the fully explored + solved state.
      solveImmediately();
      draw();
      updatePlayPause();
      announceState();
      return;
    }

    draw();
    updatePlayPause();
    announceState();
    play();
  }

  // Keyboard shortcuts. Ignore them when focus is in a form field so typing
  // and the speed slider keep working as expected.
  function isFormField(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  function onKeydown(event) {
    if (isFormField(event.target)) return;
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "n" || event.key === "N") {
      event.preventDefault();
      newMaze();
    }
  }

  playPauseButton?.addEventListener("click", togglePlay);
  stepButton?.addEventListener("click", step);
  newMazeButton?.addEventListener("click", newMaze);
  document.addEventListener("keydown", onKeydown);

  window.addEventListener("resize", () => {
    colours = readColours();
    layout();
    draw();
  });

  // First paint: a maze must always be on screen, never blank.
  reset();
  layout();
  if (prefersReducedMotion) {
    solveImmediately();
    draw();
    updatePlayPause();
    announceState();
  } else {
    draw();
    updatePlayPause();
    announceState();
    play();
  }
}

// Defensive boot: never throw on load, and never leave a blank canvas.
try {
  setup();
} catch (error) {
  const canvas = document.getElementById("maze");
  if (canvas) drawError(canvas, "Unable to start the maze visualiser.");
  const statusRegion = document.getElementById("a11y-status");
  if (statusRegion) statusRegion.textContent = "Error: the maze visualiser failed to start.";
  // Surface the cause for debugging without crashing the page.
  if (typeof console !== "undefined" && console.error) console.error(error);
}
