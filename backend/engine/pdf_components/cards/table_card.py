"""
PHI Design System

Table Card

Universal two-column table card.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import draw_card_header
from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    BORDER,
)

from engine.pdf_components.framework.constants import (
    DIVIDER_WIDTH,
)

from engine.pdf_components.framework.typography import (
    draw_label,
    draw_value,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)


def draw_table_card(
    img,
    draw,
    x,
    y,
    width,
    height,
    title,
    rows,
    fonts,
):
    """
    Universal PHI Table Card.

    Parameters
    ----------
    rows

    [
        ("coverage.png", "Coverage", "87%"),
        ("rooms.png", "Rooms", "5"),
        ("zones.png", "Zones", "12"),
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

    row_height = area["height"] / max(len(rows), 1)

    icon_size = 34

    for i, row in enumerate(rows):

        icon = None

        if len(row) == 3:

            icon, label, value = row

        else:

            label, value = row

        yy = area["y"] + i * row_height

        # --------------------------------------------------
        # Icon
        # --------------------------------------------------

        if icon:

            draw_png_icon(
                img=img,
                icon_file=icon,
                x=area["x"],
                y=yy + 6,
                size=icon_size,
            )

            label_x = area["x"] + icon_size + 14

        else:

            label_x = area["x"]

        # --------------------------------------------------
        # Label
        # --------------------------------------------------

        draw_label(
            draw=draw,
            x=label_x,
            y=yy + 6,
            text=label,
            font=fonts["body"],
            fill=TEXT,
        )

        # --------------------------------------------------
        # Value
        # --------------------------------------------------

        draw_value(
            draw=draw,
            x=area["x"] + area["width"],
            y=yy + 6,
            text=str(value),
            font=fonts["subtitle"],
            fill=PRIMARY,
            anchor="ra",
        )

        # --------------------------------------------------
        # Divider
        # --------------------------------------------------

        if i < len(rows) - 1:

            draw_horizontal_divider(
                draw=draw,
                x=area["x"],
                y=yy + row_height - 8,
                width=area["width"],
                color=BORDER,
                thickness=DIVIDER_WIDTH,
            )