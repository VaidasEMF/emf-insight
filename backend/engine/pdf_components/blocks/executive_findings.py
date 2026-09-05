"""
Executive Findings Block
"""

from engine.pdf_components.cards.premium_findings_card import (
    draw_premium_findings_card,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    SUCCESS,
)

from engine.pdf_layouts.executive_layout import (
    KEY_FINDINGS_X,
    KEY_FINDINGS_Y,
    KEY_FINDINGS_WIDTH,
)


def draw_executive_findings(
    draw,
    findings,
    fonts,
    img=None,
    y=None,
):
    """
    Draw Executive Findings.
    """

    if y is None:
        y = KEY_FINDINGS_Y

    return draw_premium_findings_card(
        img=img,
        draw=draw,

        x=KEY_FINDINGS_X,
        y=y,

        width=KEY_FINDINGS_WIDTH,

        title="KEY FINDINGS",

        items=findings,

        icon=get_icon("analysis"),

        accent=SUCCESS,

        min_height=360,

        fonts=fonts,
    )