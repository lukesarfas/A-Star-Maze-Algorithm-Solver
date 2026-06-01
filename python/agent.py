from maze import Maze
import random

from astar import a_star_search



# Agent to explore the maze
class Agent:
    def __init__(self, maze: Maze):
        # Start position
        self.x = 1
        self.y = 1

        # Grab a pointer to the maze
        self.maze = maze

        # Set of seen cells for rendering purposes
        self.seen = set()

        # Search object to be used to calculate the path
        self.search = a_star_search(maze)


    # Function to move the agent by a differential
    def move(self, dx, dy):
        self.x += dx
        self.y += dy

    # Function to tick the agent - called every frame
    def tick(self):
        # Add current position to seen set
        self.seen.add((self.x, self.y))
        # Choose the next cell to move to
        self.search.tick_search()
        # Set the new position
        self.x = self.search.current_x
        self.y = self.search.current_y


