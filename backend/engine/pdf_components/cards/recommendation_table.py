"""
PHI Design System

Recommendation Table
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import draw_card_header
from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
    BORDER,
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)


HEADER_HEIGHT = 48
ROW_HEIGHT = 82


def draw_recommendation_table(
    img,
    draw,
    x,
    y,
    width,
    height,
    title,
    accent,
    headers,
    rows,
    fonts,
):
    """
    Recommendation table.
    """

    title_font = fonts.get("title") or fonts.get("subtitle")
    header_font = (
        fonts.get("subtitle")
        or fonts.get("body_bold")
        or fonts.get("body")
    )
    body_font = fonts.get("body")
    bold_font = (
        fonts.get("body_bold")
        or fonts.get("subtitle")
        or fonts.get("body")
    )

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    area["y"] = draw_card_header(
        draw=draw,
        x=area["x"],
        y=area["y"],
        title=title,
        font=title_font,
    )

    table_y = area["y"] + 36

    columns = [
        area["x"] + 20,
        area["x"] + 250,
        area["x"] + 520,
        area["x"] + 900,
    ]

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    for i, header in enumerate(headers):

        draw_text(
            draw=draw,
            x=columns[i],
            y=table_y,
            text=header,
            font=header_font,
            fill=SECONDARY_TEXT,
        )

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=table_y + HEADER_HEIGHT,
        width=area["width"],
        color=BORDER,
    )

    # ------------------------------------------------------
    # ROWS
    # ------------------------------------------------------

    yy = table_y + HEADER_HEIGHT

    for row in rows:

        icon = row.get("icon")

        if icon:
            draw_png_icon(
                img=img,
                icon_file=icon,
                x=columns[0],
                y=yy + 18,
                size=36,
            )

        draw_text(
            draw=draw,
            x=columns[0] + 52,
            y=yy + 6,
            text=row.get("area", ""),
            font=bold_font,
            fill=PRIMARY,
        )

        draw_text(
            draw=draw,
            x=columns[0] + 52,
            y=yy + 34,
            text=row.get("zone", ""),
            font=header_font,
            fill=SECONDARY_TEXT,
        )

        draw_text(
            draw=draw,
            x=columns[1],
            y=yy + 6,
            text=row.get("issue", ""),
            font=bold_font,
            fill=PRIMARY,
        )

        draw_text(
            draw=draw,
            x=columns[1],
            y=yy + 34,
            text=row.get("contribution", ""),
            font=header_font,
            fill=accent,
        )

        draw_text(
            draw=draw,
            x=columns[2],
            y=yy + 6,
            text=row.get("recommendation", ""),
            font=body_font,
            fill=TEXT,
        )

        draw_text(
            draw=draw,
            x=columns[3],
            y=yy + 18,
            text=row.get("impact", ""),
            font=bold_font,
            fill=PRIMARY,
        )

        draw_text(
            draw=draw,
            x=columns[3],
            y=yy + 44,
            text=row.get("label", ""),
            font=header_font,
            fill=SECONDARY_TEXT,
        )

        draw_horizontal_divider(
            draw=draw,
            x=area["x"],
            y=yy + ROW_HEIGHT,
            width=area["width"],
            color=BORDER,
        )

        yy += ROW_HEIGHT

        if yy > area["y"] + area["height"] - ROW_HEIGHT:
            break