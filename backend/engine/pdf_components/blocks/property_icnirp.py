"""
Heatmap ICNIRP Block
"""

from engine.pdf_components.cards.premium_assessment_panel import (
    draw_premium_assessment_panel,
)

from engine.pdf_layouts.property_overview_layout import (
    ICNIRP_X,
    ICNIRP_Y,
    PANEL_WIDTH,
    PANEL_HEIGHT,
)


def draw_property_icnirp_assessment(
    img,
    draw,
    overview,
    fonts,
):
    """
    Draw ICNIRP assessment panel.
    """

    return draw_premium_assessment_panel(
        img=img,
        draw=draw,

        x=ICNIRP_X,
        y=ICNIRP_Y,

        width=PANEL_WIDTH,
        height=PANEL_HEIGHT,

        assessment=overview["icnirp"],

        fonts=fonts,
    )