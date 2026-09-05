"""
Heatmap Summary Block
"""

from engine.pdf_components.cards.premium_info_card import (
    draw_premium_info_card,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_layouts.heatmap_layout import (
    SUMMARY_X,
    SUMMARY_Y,
    SUMMARY_WIDTH,
    SUMMARY_HEIGHT,
)


def draw_heatmap_summary(
    img,
    draw,
    summary,
    fonts,
):
    """
    Heatmap Summary.
    """

    if not summary:

        summary = (
            "The heatmap visualizes the spatial distribution of "
            "electromagnetic exposure across the assessed property, "
            "highlighting areas of elevated cumulative RF intensity."
        )

    return draw_premium_info_card(
        img=img,
        draw=draw,

        x=SUMMARY_X,
        y=SUMMARY_Y,

        width=SUMMARY_WIDTH,
        height=SUMMARY_HEIGHT,

        title="HEATMAP SUMMARY",

        text=summary,

        icon="heatmap",

        accent=PRIMARY,

        fonts=fonts,
    )