"""
Heatmap Recommendations Block
"""

from engine.pdf_components.cards.premium_findings_card import (
    draw_premium_findings_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_layouts.heatmap_layout import (
    RECOMMENDATIONS_X,
    RECOMMENDATIONS_Y,
    RECOMMENDATIONS_WIDTH,
    RECOMMENDATIONS_HEIGHT,
)


def draw_heatmap_recommendations(
    img,
    draw,
    recommendations,
    fonts,
):
    """
    Draw Heatmap Recommendations.
    """

    return draw_premium_findings_card(
        img=img,
        draw=draw,

        x=RECOMMENDATIONS_X,
        y=RECOMMENDATIONS_Y,

        width=RECOMMENDATIONS_WIDTH,
        height=RECOMMENDATIONS_HEIGHT,

        title="RECOMMENDATIONS",

        items=recommendations,

        icon=get_icon("recommendation"),

        accent=PRIMARY,

        fonts=fonts,
    )