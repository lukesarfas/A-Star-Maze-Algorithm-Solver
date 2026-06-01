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

## Files

- `maze.py` — recursive-backtracking maze generation
- `astar.py` — the A* search, advanced one node per tick
- `agent.py` — steps the search forward and records explored cells
- `main.py` — pygame window and render loop
