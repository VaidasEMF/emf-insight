"""
Heatmap Coverage Block
"""

from engine.pdf_components.cards.premium_coverage_card import (
    draw_premium_coverage_card,
)

from engine.pdf_layouts.heatmap_layout import (
    COVERAGE_X,
    COVERAGE_Y,
    COVERAGE_WIDTH,
    COVERAGE_HEIGHT,
)


def draw_heatmap_coverage(
    img,
    draw,
    coverage,
    fonts,
):
    return draw_premium_coverage_card(
        img=img,
        draw=draw,

        x=COVERAGE_X,
        y=COVERAGE_Y,

        width=COVERAGE_WIDTH,
        height=COVERAGE_HEIGHT,

        coverage=coverage,

        fonts=fonts,
    )