"""
Executive About Block
"""

from engine.pdf_components.cards.premium_info_card import (
    draw_premium_info_card,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_layouts.executive_layout import (
    ABOUT_X,
    ABOUT_Y,
    ABOUT_WIDTH,
)


def draw_executive_about(
    draw,
    about,
    fonts,
    img=None,
    y=None,
):
    """
    Draw About Assessment block.

    The Y position can be supplied by
    the dynamic page flow.

    If y is not provided, the original
    layout position is used.
    """

    if y is None:
        y = ABOUT_Y

    return draw_premium_info_card(
        img=img,
        draw=draw,

        x=ABOUT_X,
        y=y,

        width=ABOUT_WIDTH,

        title="ABOUT THIS ASSESSMENT",

        text=about,

        icon=get_icon("assessment"),

        accent="#2563EB",

        height=250,

        fonts=fonts,
    )

