"""
PHI Design System

Vertical Flow Layout
"""


class FlowLayout:
    """
    Simple vertical layout manager.
    """

    def __init__(
        self,
        start_y,
        gap=20,
    ):
        self.y = start_y
        self.gap = gap

    def current(self):
        """
        Current Y position.
        """
        return self.y

    def advance(
        self,
        bottom,
    ):
        """
        Advance after rendered block.
        """
        self.y = bottom + self.gap
        return self.y

    def draw(
        self,
        renderer,
        **kwargs,
    ):
        """
        Draw component and automatically advance.
        """

        bottom = renderer(
            y=self.y,
            **kwargs,
        )

        self.advance(bottom)

        return bottom