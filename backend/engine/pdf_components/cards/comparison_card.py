"""
PHI Design System

Comparison Card

Displays comparison between two or more values.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import draw_card_header
from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)


def draw_comparison_card(
    draw,
    x,
    y,
    width,
    height,
    title,
    items,
    fonts,
):
    """
    Parameters
    ----------
    items

    [
        {
            "title":"Before",
            "value":"61",
            "subtitle":"Moderate",
        },
        {
            "title":"After",
            "value":"22",
            "subtitle":"Low",
        },
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

    count = max(len(items), 1)

    column_width = area["width"] / count

    for i, item in enumerate(items):

        cx = area["x"] + column_width * i + column_width / 2

        # ---------------------------------------------
        # Column title
        # ---------------------------------------------

        draw_center_text(
            draw=draw,
            x_center=cx,
            y=area["y"] + 10,
            text=item.get("title", ""),
            font=fonts["body"],
            fill=SECONDARY_TEXT,
        )

        # ---------------------------------------------
        # Value
        # ---------------------------------------------

        draw_center_text(
            draw=draw,
            x_center=cx,
            y=area["y"] + 55,
            text=str(item.get("value", "-")),
            font=fonts["score"],
            fill=PRIMARY,
        )

        # ---------------------------------------------
        # Subtitle
        # ---------------------------------------------

        subtitle = item.get("subtitle")

        if subtitle:

            draw_center_text(
                draw=draw,
                x_center=cx,
                y=area["y"] + 115,
                text=subtitle,
                font=fonts["body"],
                fill=TEXT,
            )