"""
Property Exposure Summary Block
"""

from engine.pdf_components.cards.premium_exposure_summary_card import (
    draw_premium_exposure_summary_card,
)

from engine.pdf_layouts.property_overview_layout import (
    SUMMARY_X,
    SUMMARY_Y,
    SUMMARY_WIDTH,
)


def draw_property_exposure_summary(
    img,
    draw,
    exposure_summary,
    fonts,
    x=None,
    y=None,
    width=None,
    height=None,
):
    """
    Draw Exposure Overview.

    Supports:

    1. Existing Property Overview layout
       using property_overview_layout defaults.

    2. Dynamic Assessment Summary layout
       using supplied x / y / width.

    Height is dynamic when not explicitly supplied.
    """

    # ======================================================
    # DEFAULT / LEGACY LAYOUT
    # ======================================================

    if x is None:
        x = SUMMARY_X

    if y is None:
        y = SUMMARY_Y

    if width is None:
        width = SUMMARY_WIDTH

    # ======================================================
    # DRAW
    # ======================================================

    if height is None:

        return draw_premium_exposure_summary_card(
            img=img,
            draw=draw,

            x=x,
            y=y,

            width=width,

            metrics=exposure_summary,

            fonts=fonts,
        )

    return draw_premium_exposure_summary_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,

        metrics=exposure_summary,

        fonts=fonts,

        height=height,
    )