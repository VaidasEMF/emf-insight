"""
Moderate Priority Recommendations
"""

from engine.pdf_components.cards.recommendation_table import (
    draw_recommendation_table,
)

from engine.pdf_components.framework.colors import (
    WARNING,
)

from engine.pdf_layouts.recommendations_layout import (
    MEDIUM_X,
    MEDIUM_Y,
    MEDIUM_WIDTH,
    MEDIUM_HEIGHT,
)


def draw_recommendations_medium(
    img,
    draw,
    recommendations,
    fonts,
):

    draw_recommendation_table(

        img=img,

        draw=draw,

        x=MEDIUM_X,
        y=MEDIUM_Y,

        width=MEDIUM_WIDTH,
        height=MEDIUM_HEIGHT,

        title="OPTIMIZATION RECOMMENDATIONS",

        accent=WARNING,

        headers=[

            "AREA / ZONE",

            "MAIN ISSUE",

            "RECOMMENDATION",

            "EXPECTED IMPACT",

        ],

        rows=recommendations,

        fonts=fonts,

    )