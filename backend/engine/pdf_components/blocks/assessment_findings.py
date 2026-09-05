"""
Assessment Findings Block
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


DEFAULT_FINDINGS = [

    "Overall property assessment completed successfully.",

    "Primary environmental exposure sources identified.",

    "Biological risk profile calculated.",

    "Priority mitigation opportunities established.",
]


def draw_assessment_findings(
    img,
    draw,
    x,
    y,
    width,
    findings,
    fonts,
    height=None,
):
    """
    Draw Assessment Key Findings.

    Height is calculated dynamically from content.
    """

    return draw_premium_findings_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,

        title="KEY FINDINGS",

        items=findings or DEFAULT_FINDINGS,

        icon=get_icon("analysis"),

        accent=SUCCESS,

        height=None,

        fonts=fonts,
    )