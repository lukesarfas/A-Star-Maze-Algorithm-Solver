# A* Maze Solver — Python

The original desktop version, built with pygame.

## Requirements

- Python 3.12
- pygame 2.6.0

```sh
pip install -r requirements.txt
```

## Running

```sh
python main.py
```

A window opens, generates a maze, and animates the A* search. Close the window
to quit.

## Testing

The logic tests run headless (no display) via a `pygame` import shim in
`tests/conftest.py`:

```sh
pip install -r requirements-dev.txt    # pytest, ruff, pygame
python -m pytest -q
```

This includes the cross-language parity test that asserts the Python A* matches
the JavaScript port on the shared fixture. See [../docs/TESTING.md](../docs/TESTING.md).

## Files

- `maze.py` — recursive-backtracking maze generation
- `astar.py` — the A* search, advanced one node per tick
- `agent.py` — steps the search forward and records explored cells
- `main.py` — pygame window and render loop
