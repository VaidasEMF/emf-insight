"""
PHI Design System

Heatmap Legend Composite
"""

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    TEXT,
)

DOT_RADIUS = 7
ITEM_GAP = 42
TEXT_OFFSET = 24


def draw_heatmap_legend(
    draw,
    x,
    y,
    items,
    font,
):
    """
    items = [
        ("#33AA55","Low"),
        ("#FFCC00","Moderate"),
        ...
    ]
    """

    current_y = y

    for color, label in items:

        draw.ellipse(
            (
                x,
                current_y,
                x + DOT_RADIUS * 2,
                current_y + DOT_RADIUS * 2,
            ),
            fill=color,
        )

        draw_text(
            draw=draw,
            x=x + TEXT_OFFSET,
            y=current_y - 2,
            text=label,
            font=font,
            fill=TEXT,
        )

        current_y += ITEM_GAP

    return current_y