"""Shared pytest setup.

This runs before any test module is collected, so it is the right place to:

1. Make the ``python/`` source directory importable (it is the parent of this
   ``tests/`` directory), so ``import maze`` / ``import astar`` / ``import agent``
   resolve.
2. Stub out ``pygame`` (and its submodules) with ``MagicMock`` instances *before*
   ``maze.py`` is imported. ``maze.py`` has a top-level ``import pygame`` that is
   otherwise unused, so without the stub the test suite would require pygame to
   be installed (and a display to be available).
"""

import os
import sys
from unittest.mock import MagicMock

# The python/ root is the parent of this tests/ directory.
PYTHON_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PYTHON_ROOT not in sys.path:
    sys.path.insert(0, PYTHON_ROOT)

# Inject pygame stubs so `import pygame` (and friends) resolve without the real
# package. setdefault means a real pygame, if installed, is left untouched.
sys.modules.setdefault("pygame", MagicMock())
sys.modules.setdefault("pygame.locals", MagicMock())
sys.modules.setdefault("pygame.draw", MagicMock())
