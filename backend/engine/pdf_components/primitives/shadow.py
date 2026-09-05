"""
PHI Design System

Shadow Primitive
"""

from PIL import ImageDraw


def draw_shadow(
    draw,
    x,
    y,
    width,
    height,
    radius=18,
    offset=4,
    color="#EEF3F8",
):
    """
    Lightweight shadow.
    """

    draw.rounded_rectangle(
        (
            int(x + offset),
            int(y + offset),
            int(x + width + offset),
            int(y + height + offset),
        ),
        radius=int(radius),
        fill=color,
    )