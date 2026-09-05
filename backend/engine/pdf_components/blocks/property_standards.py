"""
Heatmap Standards Block
"""

from engine.pdf_components.cards.premium_standard_card import (
    draw_premium_standard_card,
)

from engine.pdf_layouts.heatmap_layout import (
    STANDARD_X,
    STANDARD_Y,
    STANDARD_WIDTH,
    STANDARD_HEIGHT,
)


def draw_property_standards(
    img,
    draw,
    standards,
    fonts,
):
    return draw_premium_standard_card(
        img=img,
        draw=draw,

        x=STANDARD_X,
        y=STANDARD_Y,

        width=STANDARD_WIDTH,
        height=STANDARD_HEIGHT,

        standards=standards,

        fonts=fonts,
    )