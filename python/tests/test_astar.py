"""Tests for the A* search (correctness, no-path, parity, optimality)."""

import json
import os
from collections import deque
from types import SimpleNamespace

from astar import a_star_search
from maze import Maze

FIXTURE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "test", "fixtures", "astar-parity.json"
)


def run_to_completion(search, max_ticks=1_000_000):
    """Tick the search until it finds the goal or the open list drains."""
    ticks = 0
    while search.open_list and not search.found and ticks < max_ticks:
        search.tick_search()
        ticks += 1
    return search


def make_fake_maze(grid, start, end, path=None):
    """Build a minimal maze-like object that a_star_search can consume."""
    return SimpleNamespace(
        maze=grid,
        start_x=start[0],
        start_y=start[1],
        end_x=end[0],
        end_y=end[1],
        path=path if path is not None else [],
    )


def bfs_shortest_length(grid, start, end):
    """Return the number of cells in a shortest 4-connected path from start to
    end over non-wall cells (1 == wall), or None if unreachable."""
    cols = len(grid)
    rows = len(grid[0])
    queue = deque([(start, 1)])
    seen = {start}
    while queue:
        (x, y), dist = queue.popleft()
        if (x, y) == end:
            return dist
        for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < cols and 0 <= ny < rows):
                continue
            if grid[nx][ny] == 1:
                continue
            if (nx, ny) in seen:
                continue
            seen.add((nx, ny))
            queue.append(((nx, ny), dist + 1))
    return None


def test_open_grid_path_is_manhattan_optimal():
    n = 7
    grid = [[0 for _ in range(n)] for _ in range(n)]
    start = (0, 0)
    end = (n - 1, n - 1)
    fake = make_fake_maze(grid, start, end)

    search = a_star_search(fake)
    run_to_completion(search)

    assert search.found is True
    # On an open grid the shortest path length (in cells) is the Manhattan
    # distance + 1 (inclusive of both endpoints).
    expected_cells = abs(end[0] - start[0]) + abs(end[1] - start[1]) + 1
    assert len(fake.path) == expected_cells
    assert fake.path[0] == start
    assert fake.path[-1] == end


def test_no_path_drains_open_list():
    # 5x5 open grid, but the goal cell is fully walled off by its neighbours.
    n = 5
    grid = [[0 for _ in range(n)] for _ in range(n)]
    end = (n - 1, n - 1)
    # Wall the two orthogonal neighbours of the goal so it is unreachable.
    grid[end[0] - 1][end[1]] = 1
    grid[end[0]][end[1] - 1] = 1
    fake = make_fake_maze(grid, (0, 0), end)

    search = a_star_search(fake)
    run_to_completion(search)

    assert search.found is False
    assert search.open_list == []
    assert fake.path == []


def test_generated_maze_path_is_valid():
    maze = Maze(21, 21)
    grid = maze.generate_maze()

    search = a_star_search(maze)
    run_to_completion(search)

    assert search.found is True
    path = maze.path

    # Correct endpoints.
    assert path[0] == (maze.start_x, maze.start_y)
    assert path[-1] == (maze.end_x, maze.end_y)

    # Contiguous orthogonal adjacency between consecutive path cells.
    for (x0, y0), (x1, y1) in zip(path, path[1:], strict=False):
        assert abs(x0 - x1) + abs(y0 - y1) == 1, f"non-adjacent step {(x0, y0)}->{(x1, y1)}"

    # The path never crosses a wall.
    for x, y in path:
        assert grid[x][y] != Maze.WALL, f"path crosses wall at ({x}, {y})"


def test_parity_fixture_matches_path_and_explored():
    with open(FIXTURE_PATH) as fh:
        fixture = json.load(fh)

    grid = fixture["grid"]
    start = tuple(fixture["start"])
    end = tuple(fixture["goal"])
    fake = make_fake_maze(grid, start, end)

    search = a_star_search(fake)
    run_to_completion(search)

    assert search.found is True

    # Convert the fixture's path (list of [x, y] lists) to tuples to match the
    # tuples produced by a_star_search.get_path.
    expected_path = [tuple(cell) for cell in fixture["path"]]
    assert fake.path == expected_path

    # Node-expansion count must match the fixture exactly.
    assert len(search.closed_list) == fixture["explored"]


def test_astar_path_length_equals_bfs_on_generated_maze():
    maze = Maze(21, 21)
    grid = maze.generate_maze()

    search = a_star_search(maze)
    run_to_completion(search)

    assert search.found is True
    astar_len = len(maze.path)

    bfs_len = bfs_shortest_length(grid, (maze.start_x, maze.start_y), (maze.end_x, maze.end_y))
    assert bfs_len is not None
    assert astar_len == bfs_len
