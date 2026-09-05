"""
Assessment Summary Card
"""

from engine.pdf_components.cards.premium_info_card import (
    draw_premium_info_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)


DEFAULT_SUMMARY = (
    "The assessment evaluates the property's overall Property "
    "Health Score based on measured electromagnetic exposure, "
    "environmental conditions and current exposure guidelines."
)


def draw_assessment_summary_card(
    img,
    draw,
    x,
    y,
    width,
    summary,
    fonts,
):
    """
    Draw Assessment Summary card.
    """

    # ------------------------------------------------------
    # NORMALIZE SUMMARY
    # ------------------------------------------------------

    if isinstance(summary, dict):

        summary_text = (
            summary.get("text")
            or summary.get("description")
            or summary.get("summary")
            or ""
        )

    else:

        summary_text = str(
            summary or ""
        )

    # ------------------------------------------------------
    # FALLBACK
    # ------------------------------------------------------

    if not summary_text.strip():

        summary_text = DEFAULT_SUMMARY

    

    # ------------------------------------------------------
    # DRAW
    # ------------------------------------------------------

    return draw_premium_info_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,

        title="ASSESSMENT SUMMARY",

        text=summary_text,

        icon="summary",

        accent=PRIMARY,

        min_height=190,

        fonts=fonts,
    )