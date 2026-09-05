"""
PHI Design System

Horizontal Layout
"""


class HRow:

    def __init__(
        self,
        x,
        gap,
    ):

        self.x = x
        self.gap = gap

    def next(
        self,
        width,
    ):

        xx = self.x

        self.x += width + self.gap

        return xx