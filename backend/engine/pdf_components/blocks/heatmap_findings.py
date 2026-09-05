"""
Heatmap Findings Block
"""

from engine.pdf_components.cards.premium_findings_card import (
    draw_premium_findings_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_layouts.heatmap_layout import (
    FINDINGS_X,
    FINDINGS_Y,
    FINDINGS_WIDTH,
    FINDINGS_HEIGHT,
)


def draw_heatmap_findings(
    img,
    draw,
    findings,
    fonts,
):
    """
    Draw Heatmap Findings.
    """

    return draw_premium_findings_card(
        img=img,
        draw=draw,

        x=FINDINGS_X,
        y=FINDINGS_Y,

        width=FINDINGS_WIDTH,
        height=FINDINGS_HEIGHT,

        title="KEY FINDINGS",

        items=findings,

        icon=get_icon("summary"),

        accent=PRIMARY,

        fonts=fonts,
    )