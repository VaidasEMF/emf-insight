"""
Executive Priorities Block
"""

from engine.pdf_components.cards.premium_findings_card import (
    draw_premium_findings_card,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_layouts.executive_layout import (
    WHAT_MEANS_X,
    WHAT_MEANS_Y,
    WHAT_MEANS_WIDTH,
)


def draw_executive_priorities(
    draw,
    priorities,
    fonts,
    img=None,
    y=None,
):
    """
    Draw Executive Priorities.
    """

    if y is None:
        y = WHAT_MEANS_Y

    return draw_premium_findings_card(
        img=img,
        draw=draw,

        x=WHAT_MEANS_X,
        y=y,

        width=WHAT_MEANS_WIDTH,

        title="RECOMMENDED PRIORITIES",

        items=priorities,

        icon=get_icon("recommendation"),

        accent="#2563EB",

        min_height=360,

        fonts=fonts,
    )
