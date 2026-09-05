"""
Recommendations Header Block
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


def draw_recommendations_header(
    draw,
    fonts,
    analysis=None,
):
    """
    Draw recommendations introduction.
    """

    text = (
        "This section prioritizes mitigation actions based on the "
        "Property Health Assessment. Recommendations are grouped "
        "by urgency to support an effective improvement plan."
    )

    if analysis:
        text = analysis.get(
            "recommendations_summary",
            text,
        )

    draw_info_card(
        draw=draw,
        x=INFO_X,
        y=INFO_Y,
        width=INFO_WIDTH,
        height=INFO_HEIGHT,
        title="RECOMMENDATIONS OVERVIEW",
        text=text,
        fonts=fonts,
    )