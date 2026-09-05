"""
Heatmap Interpretation Block
"""

from engine.pdf_components.cards.premium_interpretation_card import (
    draw_premium_interpretation_card,
)

from engine.pdf_layouts.heatmap_layout import (
    INTERPRETATION_X,
    INTERPRETATION_Y,
    INTERPRETATION_WIDTH,
    INTERPRETATION_HEIGHT,
)


print("=" * 70)
print("🔥 ASSESSMENT INTERPRETATION HEIGHT")
print("LEGACY INTERPRETATION_HEIGHT:", INTERPRETATION_HEIGHT)
print("=" * 70)


def draw_property_interpretation(
    img,
    draw,
    interpretation,
    fonts,
    x=None,
    y=None,
    width=None,
    height=None,
):
    """
    Draw Property Interpretation.

    Supports:

    1. Legacy Heatmap / Property Overview layout
       using default layout values.

    2. Dynamic Assessment Summary layout
       using supplied x / y / width.

    Height is dynamic when a custom assessment
    position / width is supplied.
    """

    # ======================================================
    # DETECT CUSTOM / DYNAMIC LAYOUT
    # ======================================================

    custom_layout = (
        x is not None
        or y is not None
        or width is not None
    )

    # ======================================================
    # DEFAULT LEGACY LAYOUT
    # ======================================================

    if x is None:
        x = INTERPRETATION_X

    if y is None:
        y = INTERPRETATION_Y

    if width is None:
        width = INTERPRETATION_WIDTH

    # ======================================================
    # HEIGHT
    # ======================================================

    if (
        height is None
        and not custom_layout
    ):
        height = INTERPRETATION_HEIGHT

    # IMPORTANT:
    #
    # For custom Assessment Summary layout:
    #
    # height remains None
    #
    # This allows premium_interpretation_card.py
    # to calculate the real height dynamically.
    #
    # ======================================================

    print("=" * 70)
    print("🔥 PROPERTY INTERPRETATION")
    print("X:", x)
    print("Y:", y)
    print("WIDTH:", width)
    print("HEIGHT:", height)
    print("CUSTOM LAYOUT:", custom_layout)
    print("=" * 70)

    return draw_premium_interpretation_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,

        height=height,

        interpretation=interpretation or [],

        fonts=fonts,
    )