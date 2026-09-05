"""
PHI Design System

Metric Card

Universal KPI card used across all PDF pages.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)


def draw_metric_card(
    draw,
    x,
    y,
    width,
    height,
    title,
    value,
    subtitle="",
    fonts=None,
):
    """
    Universal KPI Metric Card.
    """

    title_font = (
        fonts.get("caption")
        or fonts.get("subtitle")
        or fonts.get("body")
        or fonts.get("title")
    )

    value_font = (
        fonts.get("score")
        or fonts.get("title")
        or fonts.get("body")
    )

    subtitle_font = (
        fonts.get("body")
        or fonts.get("subtitle")
    )

    # ---------------------------------------------------------
    # CARD
    # ---------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ---------------------------------------------------------
    # HEADER
    # ---------------------------------------------------------

    area["y"] = draw_card_header(
        draw=draw,
        x=area["x"],
        y=area["y"],
        title=title,
        font=title_font,
    )

    center = area["x"] + area["width"] / 2

    # ---------------------------------------------------------
    # VALUE
    # ---------------------------------------------------------

    draw_center_text(
        draw=draw,
        x_center=center,
        y=area["y"] + 18,
        text=str(value),
        font=value_font,
        fill=PRIMARY,
    )

    # ---------------------------------------------------------
    # SUBTITLE
    # ---------------------------------------------------------

    if subtitle:

        draw_center_text(
            draw=draw,
            x_center=center,
            y=area["y"] + 68,
            text=subtitle,
            font=subtitle_font,
            fill=SECONDARY_TEXT,
        )