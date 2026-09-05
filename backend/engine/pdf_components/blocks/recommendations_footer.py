"""
Recommendations Footer
"""

from engine.pdf_components.cards.info_card import (
    draw_info_card,
)

from engine.pdf_layouts.recommendations_layout import (
    FOOTER1_X,
    FOOTER2_X,
    FOOTER3_X,
    FOOTER_Y,
    FOOTER_WIDTH,
    FOOTER_HEIGHT,
)


def draw_recommendations_footer(
    draw,
    fonts,
):

    cards = [

        (

            FOOTER1_X,

            "HOW TO READ",

            "Recommendations are ordered according to their expected influence on the Property Health Score.",

        ),

        (

            FOOTER2_X,

            "IMPACT SCALE",

            "Higher percentage indicates greater expected reduction of cumulative exposure.",

        ),

        (

            FOOTER3_X,

            "NOTES",

            "Recommendations should be verified after implementation with repeat measurements.",

        ),

    ]

    for x, title, text in cards:

        draw_info_card(

            draw=draw,

            x=x,

            y=FOOTER_Y,

            width=FOOTER_WIDTH,

            height=FOOTER_HEIGHT,

            title=title,

            text=text,

            fonts=fonts,

        )