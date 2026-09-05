"""
PHI Design System

Generic Data Table Card
"""

from engine.pdf_components.cards.base_card import draw_base_card
from engine.pdf_components.composites.card_header import draw_card_header
from engine.pdf_components.framework.colors import PRIMARY, TEXT, BORDER
from engine.pdf_components.framework.constants import DIVIDER_WIDTH
from engine.pdf_components.framework.typography import draw_text
from engine.pdf_components.primitives.divider import draw_horizontal_divider


def draw_data_table_card(
    draw,
    x,
    y,
    width,
    height,
    title,
    headers,
    rows,
    fonts,
):
    """
    Generic multi-column data table.
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

    cols = max(len(headers), 1)
    col_width = area["width"] / cols

    yy = area["y"]

    # -----------------------------
    # Header
    # -----------------------------

    for i, header in enumerate(headers):

        draw_text(
            draw=draw,
            x=area["x"] + i * col_width,
            y=yy,
            text=header,
            font=fonts["subtitle"],
            fill=PRIMARY,
        )

    yy += 30

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=yy,
        width=area["width"],
        color=BORDER,
        thickness=DIVIDER_WIDTH,
    )

    yy += 10

    # -----------------------------
    # Rows
    # -----------------------------

    row_height = 28

    for row in rows:

        for i, value in enumerate(row):

            draw_text(
                draw=draw,
                x=area["x"] + i * col_width,
                y=yy,
                text=str(value),
                font=fonts["body"],
                fill=TEXT,
            )

        yy += row_height

        draw_horizontal_divider(
            draw=draw,
            x=area["x"],
            y=yy - 4,
            width=area["width"],
            color=BORDER,
            thickness=1,
        )

        if yy > area["y"] + area["height"] - row_height:
            break