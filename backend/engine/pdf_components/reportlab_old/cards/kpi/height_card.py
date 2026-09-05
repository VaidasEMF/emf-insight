from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

from ..base_card import build_card

from engine.pdf_components.framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
)
from engine.pdf_components.framework.constants import (
    CARD_WIDTH_MD,
)


def render_height_card(
    styles,
    height_label,
    score,
    risk,
    note,
    width=CARD_WIDTH_MD,
):

    risk_lower = risk.lower()

    if "low" in risk_lower:
        accent = SUCCESS

    elif "moderate" in risk_lower:
        accent = WARNING

    else:
        accent = DANGER

    title_style = ParagraphStyle(
        "HeightTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=accent,
    )

    body_style = ParagraphStyle(
        "HeightBody",
        parent=styles["Body"],
        fontSize=10,
        leading=14,
        textColor=TEXT,
    )

    rows = [

        [Paragraph(f"<b>{height_label}</b>", title_style)],

        [Paragraph(f"Score: <b>{score}</b>/100", body_style)],

        [Paragraph(f"Risk: <b>{risk}</b>", body_style)],

        [Paragraph(note, body_style)],

    ]

    return build_card(
        rows=rows,
        width=width,
        accent=accent,
    )