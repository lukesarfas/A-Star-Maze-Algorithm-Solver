

# Nodes to store the heuristics and the parent for the A* algorithm - once navigated to the end, we can trace back the path using the parent nodes
class Node:
    def __init__(self, parent=None, position=None):
        self.parent = parent
        self.position = position

        self.g = 0
        self.h = 0
        self.f = 0




class a_star_search:
    def __init__(self, maze):
        # Store a pointer to the maze
        self.maze = maze

        # Start node
        self.start = Node(None, (maze.start_x, maze.start_y))

        # Open and closed lists for the A* algorithm 
        # - open list is the list of nodes to be evaluated
        # - closed list is the list of nodes that have been evaluated
        self.open_list = [self.start]
        self.closed_list = []

        # Goal position
        self.end_x = maze.end_x
        self.end_y = maze.end_y

        # Current position is the start position
        self.current_x = self.start.position[0]
        self.current_y = self.start.position[1]

        # Found flag to indicate if the end has been found
        self.found = False


    # Function to recurse through a node to find the path taken to that node
    def get_path(self, node):
        path = []
        current = node
        while current is not None:
            path.append(current.position)
            current = current.parent
        return path[::-1]


    # Function to tick the A* algorithm
    def tick_search(self):
        # If there are items in the open list then there are nodes left to be explored
        if self.open_list and not self.found:

            # Sort the open list by the f value of the nodes to get the node with the lowest f value - this indicates the node most likely closest to the goal
            # This is reversed as we want to pop the node with the lowest f value
            self.open_list.sort(key=lambda x: x.f, reverse=True)

            # Get the node with the lowest f value
            current_node = self.open_list.pop()

            # Update the current position so the agent can render the node
            self.current_x = current_node.position[0]
            self.current_y = current_node.position[1]

            # If the agent is at the end
            if current_node.position == (self.end_x, self.end_y):
                self.found = True
                self.maze.path = self.get_path(current_node)
                return

            # Generate the children nodes - this means find all 4 directions
            for new_position in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
                node_position = (current_node.position[0] + new_position[0], current_node.position[1] + new_position[1])


                if node_position[0] > (len(self.maze.maze) - 1) or node_position[0] < 0 or node_position[1] > (len(self.maze.maze[0]) - 1) or node_position[1] < 0:
                    continue

                if self.maze.maze[node_position[0]][node_position[1]] == 1:
                    continue

                
                # Node for position of new child
                new_node = Node(current_node, node_position)

                # Calculate the f, g, and h values
                # g is the cost to move from the start node to the current node
                new_node.g = current_node.g + 1
                # h is the heuristic - the estimated cost to move from the current node to the end node
                new_node.h = (abs(new_node.position[0] - self.end_x)) + (abs(new_node.position[1] - self.end_y)) # Manhattan distance

                # f is the sum of g and h, and used to calculate the best path to choose
                new_node.f = new_node.g + new_node.h

                # Check if the node is already in the open list or closed list
                add_to_list = True


                # If node is in the open list, see if the new node has a lower f value and replace if so
                for node in self.open_list:
                    if node.position == new_node.position:
                        if node.f > new_node.f:
                            node.f = new_node.f
                            node.parent = new_node.parent
                        else:
                            add_to_list = False


                # If node is in the closed list, see if the new node has a lower f value and place the node in the open list if so
                for node in self.closed_list:
                    if node.position == new_node.position and node.f < new_node.f:
                        add_to_list = False
                        break
                        
                # Add the node to the open list if it is not already in the open list and not closed
                if add_to_list:
                    self.open_list.append(new_node)

                    
            # Add the current node to the closed list as it has been evaluated
            self.closed_list.append(current_node)

