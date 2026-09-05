"""
PHI Design System

Vertical Stack Layout
"""


class VStack:

    def __init__(
        self,
        x,
        y,
        gap=12,
    ):

        self.x = x
        self.y = y
        self.gap = gap

    def next(
        self,
        height,
    ):

        yy = self.y

        self.y += height + self.gap

        return yy