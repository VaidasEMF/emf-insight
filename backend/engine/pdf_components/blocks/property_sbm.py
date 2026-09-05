"""
Heatmap SBM Block
"""

from engine.pdf_components.cards.premium_assessment_panel import (
    draw_premium_assessment_panel,
)

from engine.pdf_layouts.property_overview_layout import (
    SBM_X,
    SBM_Y,
    PANEL_WIDTH,
    PANEL_HEIGHT,
)


def draw_property_sbm_assessment(
    img,
    draw,
    overview,
    fonts,
):
    """
    Draw SBM assessment panel.
    """

    return draw_premium_assessment_panel(
        img=img,
        draw=draw,

        x=SBM_X,
        y=SBM_Y,

        width=PANEL_WIDTH,
        height=PANEL_HEIGHT,

        assessment=overview["sbm"],

        fonts=fonts,
    )