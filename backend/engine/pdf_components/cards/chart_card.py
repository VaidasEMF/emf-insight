"""
PHI Design System

Timeline Card

Displays process, workflow or assessment timeline.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import draw_card_header
from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
    SUCCESS,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.primitives.status_dot import (
    draw_status_dot,
)

from engine.pdf_components.primitives.divider import (
    draw_vertical_divider,
)


def draw_timeline_card(
    draw,
    x,
    y,
    width,
    height,
    title,
    steps,
    fonts,
):
    """
    Parameters
    ----------
    steps

    [
        ("completed", "Upload Floor Plan"),
        ("completed", "Draw Rooms"),
        ("active", "Measurements"),
        ("pending", "Recommendations"),
    ]
    """

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    if title:

        area["y"] = draw_card_header(
            draw=draw,
            x=area["x"],
            y=area["y"],
            title=title,
            font=fonts["subtitle"],
        )

    row_height = area["height"] / max(len(steps), 1)

    line_x = area["x"] + 12

    draw_vertical_divider(
        draw=draw,
        x=line_x,
        y=area["y"] + 12,
        height=area["height"] - 24,
        color=BORDER,
    )

    for i, (status, text) in enumerate(steps):

        yy = area["y"] + i * row_height + 12

        draw_status_dot(
            draw=draw,
            x=line_x,
            y=yy + 8,
            status=status,
        )

        draw_text(
            draw=draw,
            x=line_x + 28,
            y=yy,
            text=text,
            font=fonts["body"],
            fill=SECONDARY_TEXT if status == "pending" else PRIMARY,
        )