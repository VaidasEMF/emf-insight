"""
Low Priority Recommendations
"""

from engine.pdf_components.cards.recommendation_table import (
    draw_recommendation_table,
)

from engine.pdf_components.framework.colors import (
    SUCCESS,
)

from engine.pdf_layouts.recommendations_layout import (
    LOW_X,
    LOW_Y,
    LOW_WIDTH,
    LOW_HEIGHT,
)


def draw_recommendations_low(
    img,
    draw,
    recommendations,
    fonts,
):

    draw_recommendation_table(

        img=img,

        draw=draw,

        x=LOW_X,
        y=LOW_Y,

        width=LOW_WIDTH,
        height=LOW_HEIGHT,

        title="GOOD PRACTICES",

        accent=SUCCESS,

        headers=[

            "AREA / ZONE",

            "MAIN ISSUE",

            "RECOMMENDATION",

            "EXPECTED IMPACT",

        ],

        rows=recommendations,

        fonts=fonts,

    )