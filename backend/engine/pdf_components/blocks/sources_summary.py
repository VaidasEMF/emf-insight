"""
Sources Summary Block
"""

from engine.pdf_components.cards.info_card import (
    draw_info_card,
)

from engine.pdf_layouts.sources_layout import (
    SUMMARY_X,
    SUMMARY_Y,
    SUMMARY_WIDTH,
    SUMMARY_HEIGHT,
)


def draw_sources_summary(
    draw,
    summary,
    fonts,
):
    """
    Sources summary.
    """

    if not summary:

        summary = (
            "The following electromagnetic sources were identified "
            "during the assessment. Each source contributes to the "
            "overall Property Health Score and cumulative exposure "
            "within the assessed property."
        )

    draw_info_card(
        draw=draw,

        x=SUMMARY_X,
        y=SUMMARY_Y,

        width=SUMMARY_WIDTH,
        height=SUMMARY_HEIGHT,

        title="EMF SOURCES",

        text=summary,

        fonts=fonts,
    )