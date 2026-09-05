"""
PHI Design System

Low-level drawing primitives.
"""

from engine.pdf_components.framework.geometry import (
    circle_bbox,
)


# ==========================================================
# LINES
# ==========================================================

def draw_hline(
    draw,
    x1,
    x2,
    y,
    fill,
    width=1,
):
    draw.line(
        (
            x1,
            y,
            x2,
            y,
        ),
        fill=fill,
        width=width,
    )


def draw_vline(
    draw,
    x,
    y1,
    y2,
    fill,
    width=1,
):
    draw.line(
        (
            x,
            y1,
            x,
            y2,
        ),
        fill=fill,
        width=width,
    )


# ==========================================================
# RECTANGLES
# ==========================================================

def draw_round_rect(
    draw,
    x,
    y,
    width,
    height,
    radius=18,
    fill=None,
    outline=None,
    border_width=1,
):
    """
    Draw rounded rectangle.
    """

    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=radius,
        fill=fill,
        outline=outline,
        width=border_width,
    )


# ==========================================================
# CIRCLES
# ==========================================================

def draw_circle(
    draw,
    cx,
    cy,
    radius,
    fill=None,
    outline=None,
    border_width=1,
):
    draw.ellipse(
        circle_bbox(
            cx,
            cy,
            radius,
        ),
        fill=fill,
        outline=outline,
        width=border_width,
    )