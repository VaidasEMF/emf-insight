"""
PHI Design System

Divider primitives.
"""

from engine.pdf_components.framework.colors import (
    BORDER,
)

from engine.pdf_components.framework.constants import (
    BORDER_WIDTH,
)

from PIL import ImageDraw


# ==========================================================
# HORIZONTAL
# ==========================================================

def draw_horizontal_divider(
    draw,
    x,
    y,
    width,
    color="#D9DEE7",
    thickness=1,
):
    """
    Draw horizontal divider.
    """

    x = int(round(x))
    y = int(round(y))
    width = int(round(width))
    thickness = max(1, int(round(thickness)))

    draw.line(
        (
            (x, y),
            (x + width, y),
        ),
        fill=color,
        width=thickness,
    )


# ==========================================================
# VERTICAL
# ==========================================================

def draw_vertical_divider(
    draw,
    x,
    y,
    height,
    color="#D9DEE7",
    thickness=1,
):
    """
    Draw vertical divider.
    """

    x = int(round(x))
    y = int(round(y))
    height = int(round(height))
    thickness = max(1, int(round(thickness)))

    draw.line(
        (
            (x, y),
            (x, y + height),
        ),
        fill=color,
        width=thickness,
    )


# ==========================================================
# RECTANGLE
# ==========================================================

def draw_divider_box(
    draw,
    x,
    y,
    width,
    height,
    color=BORDER,
    thickness=BORDER_WIDTH,
):
    """
    Draw rectangle divider.
    """

    draw.rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        outline=color,
        width=thickness,
    )

 # ==========================================================
# LEGACY COMPATIBILITY
# ==========================================================

def draw_divider(
    draw,
    x,
    y,
    width,
    fill=BORDER,
    line_width=BORDER_WIDTH,
):
    """
    Legacy wrapper.

    Keeps backward compatibility with older PDF components.
    """

    draw_horizontal_divider(
        draw=draw,
        x=x,
        y=y,
        width=width,
        color=fill,
        thickness=line_width,
    )