"""
Recommendations Info
"""

from engine.pdf_components.cards.info_card import (
    draw_info_card,
)

from engine.pdf_layouts.recommendations_layout import (
    INFO_X,
    INFO_Y,
    INFO_WIDTH,
    INFO_HEIGHT,
)


def draw_recommendations_info(
    draw,
    fonts,
):

    draw_info_card(

        draw=draw,

        x=INFO_X,
        y=INFO_Y,

        width=INFO_WIDTH,
        height=INFO_HEIGHT,

        title=None,

        text=(
            "Recommendations are based on measured levels, "
            "source analysis, and best practice guidelines."
        ),

        fonts=fonts,

    )