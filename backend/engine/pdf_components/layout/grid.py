"""
PHI Design System

Grid Layout
"""


class Grid:

    def __init__(
        self,
        x,
        y,
        columns,
        gap,
        cell_width,
        cell_height,
    ):

        self.x = x
        self.y = y

        self.columns = columns

        self.gap = gap

        self.cell_width = cell_width
        self.cell_height = cell_height

    def cell(
        self,
        index,
    ):

        row = index // self.columns
        col = index % self.columns

        return (

            self.x + col * (self.cell_width + self.gap),

            self.y + row * (self.cell_height + self.gap),

        )