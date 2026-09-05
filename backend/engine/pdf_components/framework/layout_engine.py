"""
PHI PDF Layout Engine
"""
print("LOADED LAYOUT ENGINE")
from engine.pdf_components.framework.constants import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    ROW_GAP,
)


class FlowPage:

    def __init__(
        self,
        x=LEFT_MARGIN,
        y=150,
        width=CONTENT_WIDTH,
        gap=ROW_GAP,
    ):
        self.x = x
        self.y = y
        self.width = width
        self.gap = gap

    def add(
        self,
        renderer,
        **kwargs,
    ):
        """
        Draw block and move cursor.
        """

        print("FLOW ADD")

        kwargs.setdefault("x", self.x)
        kwargs.setdefault("y", self.y)
        kwargs.setdefault("width", self.width)

        bottom = renderer(**kwargs)

        print("BOTTOM =", bottom)

        self.y = bottom + self.gap

        return bottom

    @property
    def current_y(self):
        return self.y