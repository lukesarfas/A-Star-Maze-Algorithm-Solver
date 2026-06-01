"""Tests for maze generation invariants (perfect-maze properties)."""

from collections import deque

from maze import Maze


def _flood_fill_open(grid, cols, rows, start):
    """Return the set of non-wall cells reachable from ``start`` via 4-way moves.

    A cell counts as "non-wall" if it is anything other than ``Maze.WALL`` (so
    EMPTY, START and END all count as traversable).
    """
    reachable = set()
    queue = deque([start])
    reachable.add(start)
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < cols and 0 <= ny < rows):
                continue
            if grid[nx][ny] == Maze.WALL:
                continue
            if (nx, ny) in reachable:
                continue
            reachable.add((nx, ny))
            queue.append((nx, ny))
    return reachable


def test_dimensions():
    maze = Maze(11, 11)
    grid = maze.generate_maze()

    # grid is indexed grid[x][y]; outer list is cols, inner list is rows.
    assert len(grid) == maze.cols == 11
    assert all(len(col) == maze.rows == 11 for col in grid)


def test_start_and_goal_cells():
    maze = Maze(11, 11)
    grid = maze.generate_maze()

    assert grid[maze.start_x][maze.start_y] == Maze.START
    assert grid[maze.end_x][maze.end_y] == Maze.END

    # And concretely for an 11x11 maze: start (1,1), goal (9,9).
    assert (maze.start_x, maze.start_y) == (1, 1)
    assert (maze.end_x, maze.end_y) == (9, 9)
    assert grid[1][1] == Maze.START
    assert grid[9][9] == Maze.END


def test_outer_border_all_walls():
    maze = Maze(11, 11)
    grid = maze.generate_maze()

    for x in range(maze.cols):
        assert grid[x][0] == Maze.WALL, f"top border open at ({x}, 0)"
        assert grid[x][maze.rows - 1] == Maze.WALL, f"bottom border open at ({x}, {maze.rows - 1})"
    for y in range(maze.rows):
        assert grid[0][y] == Maze.WALL, f"left border open at (0, {y})"
        assert grid[maze.cols - 1][y] == Maze.WALL, f"right border open at ({maze.cols - 1}, {y})"


def test_perfect_maze_connectivity():
    """A perfect maze: every non-wall cell is reachable from the start and the
    goal is among them (i.e. the open cells form a single connected component
    that the flood fill fully covers)."""
    maze = Maze(11, 11)
    grid = maze.generate_maze()

    open_cells = {
        (x, y) for x in range(maze.cols) for y in range(maze.rows) if grid[x][y] != Maze.WALL
    }

    reachable = _flood_fill_open(grid, maze.cols, maze.rows, (maze.start_x, maze.start_y))

    # The goal must be reachable from the start.
    assert (maze.end_x, maze.end_y) in reachable

    # Every non-wall cell must be reached by the flood fill (single component).
    assert reachable == open_cells
