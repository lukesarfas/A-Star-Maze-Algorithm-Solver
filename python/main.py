import pygame
from maze import Maze
from agent import Agent

# Constants

# Maze dimensions
ROWS, COLS = 51, 51

# Screen dimensions
WIDTH, HEIGHT = 800, 800
CELL_SIZE = min(WIDTH // COLS, HEIGHT // ROWS)  # Calculate cell size based on screen dimensions
MAZE_WIDTH, MAZE_HEIGHT = COLS * CELL_SIZE, ROWS * CELL_SIZE  # Calculate maze dimensions
MAZE_OFFSET_X = (WIDTH - MAZE_WIDTH) // 2  # Offset to center maze horizontally
MAZE_OFFSET_Y = (HEIGHT - MAZE_HEIGHT) // 2  # Offset to center maze vertically

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREY = (100, 100, 100)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)

# Initialise Pygame
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Maze Solver Visualisation')
clock = pygame.time.Clock()

# Generate maze
maze = Maze(ROWS, COLS)
maze.generate_maze()

# Generate agent
agent = Agent(maze)

# Main loop
running = True
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Update agent
    agent.tick()

    # Clear screen
    screen.fill(WHITE)

    # Draw maze
    for y in range(ROWS):
        for x in range(COLS):
            rect = pygame.Rect(MAZE_OFFSET_X + x * CELL_SIZE, MAZE_OFFSET_Y + y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            if (x, y) in agent.seen:
                pygame.draw.rect(screen, GREY, rect)
            if maze.maze[x][y] == 1:  # Walls
                pygame.draw.rect(screen, BLACK, rect)
            elif maze.maze[x][y] == 2:  # Start
                pygame.draw.rect(screen, GREEN, rect)
            elif maze.maze[x][y] == 3:  # Goal
                pygame.draw.rect(screen, RED, rect)

    # Draw path
    for x, y in maze.path:
        pygame.draw.rect(screen, CYAN, (MAZE_OFFSET_X + x * CELL_SIZE, MAZE_OFFSET_Y + y * CELL_SIZE, CELL_SIZE, CELL_SIZE))

    # Draw agent
    pygame.draw.rect(screen, BLUE, (MAZE_OFFSET_X + agent.x * CELL_SIZE, MAZE_OFFSET_Y + agent.y * CELL_SIZE, CELL_SIZE, CELL_SIZE))

    # Update screen
    pygame.display.flip()

    # Cap the frame rate
    clock.tick(30)

# Quit Pygame
pygame.quit()
