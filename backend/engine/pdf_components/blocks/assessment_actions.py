"""
Assessment Actions Block
"""

from engine.pdf_components.cards.info_card import (
    draw_info_card,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)


DEFAULT_NEXT_STEP = (
    "Continue with detailed room analysis and implement "
    "recommended mitigation actions beginning with the "
    "highest exposure areas."
)


def draw_assessment_actions(
    img,
    draw,
    x,
    y,
    width,
    next_step,
    fonts,
    height=None,
):
    """
    Draw Assessment Next Steps.
    """

    return draw_info_card(
    draw=draw,
    img=img,

    x=x,
    y=y,

    width=width,

    title="RECOMMENDED NEXT STEPS",

    text=next_step or DEFAULT_NEXT_STEP,

    fonts=fonts,

    height=height,

    icon=get_icon("recommendation"),
)