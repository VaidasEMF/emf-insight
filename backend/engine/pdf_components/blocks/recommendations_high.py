"""
High Priority Recommendations
"""

from engine.pdf_components.cards.recommendation_table import (
    draw_recommendation_table,
)

from engine.pdf_components.framework.colors import (
    DANGER,
)

from engine.pdf_layouts.recommendations_layout import (
    HIGH_X,
    HIGH_Y,
    HIGH_WIDTH,
    HIGH_HEIGHT,
)


def draw_recommendations_high(
    img,
    draw,
    recommendations,
    fonts,
):

    draw_recommendation_table(

        img=img,

        draw=draw,

        x=HIGH_X,
        y=HIGH_Y,

        width=HIGH_WIDTH,
        height=HIGH_HEIGHT,

        title="HIGH PRIORITY ACTIONS",

        accent=DANGER,

        headers=[

            "AREA / ZONE",

            "MAIN ISSUE",

            "RECOMMENDATION",

            "EXPECTED IMPACT",

        ],

        rows=recommendations,

        fonts=fonts,

    )