"""
PHI Design System

Status Card

Universal KPI / Status Card.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)


def draw_status_card(
    draw,
    x,
    y,
    width,
    height,
    title,
    value,
    subtitle="",
    title_font=None,
    value_font=None,
    subtitle_font=None,
):
    """
    Universal Status / KPI Card.
    """

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
        title=title,
        title_font=title_font,
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
            y=area["y"] + 82,
            text=subtitle,
            font=subtitle_font,
            fill=SECONDARY_TEXT,
        )