import { describe, it, expect } from "vitest";
import { Maze } from "../../src/maze.js";
import { Agent } from "../../src/agent.js";

describe("Agent", () => {
  it("starts at (1,1) with an empty seen set", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    const agent = new Agent(maze);
    expect(agent.x).toBe(1);
    expect(agent.y).toBe(1);
    expect(agent.seen.size).toBe(0);
    expect(agent.search).toBeTruthy();
  });

  it("move() adjusts position by the given delta", () => {
    const maze = new Maze(11, 11);
    maze.generate();
    const agent = new Agent(maze);
    agent.move(2, -1);
    expect(agent.x).toBe(3);
    expect(agent.y).toBe(0);
  });

  it("grows the seen set and eventually solves, ending at the goal", () => {
    const maze = new Maze(21, 21);
    maze.generate();
    const agent = new Agent(maze);

    const initialSeen = agent.seen.size;
    agent.tick();
    expect(agent.seen.size).toBeGreaterThan(initialSeen);

    let guard = 21 * 21 * 4;
    while (!agent.search.found && agent.search.openList.length > 0 && guard-- > 0) {
      agent.tick();
    }

    expect(agent.search.found).toBe(true);
    expect(agent.x).toBe(maze.endX);
    expect(agent.y).toBe(maze.endY);
    expect(agent.seen.size).toBeGreaterThan(1);
  });
});
