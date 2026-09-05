from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

from ..base_card import (
    build_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    WARNING,
    TEXT,
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_MD,
)


def render_comparison_card(
    styles,
    title,
    before,
    after,
    width=CARD_WIDTH_MD,
):

    if after < before:
        accent = SUCCESS
        trend = "Improved"

    elif after > before:
        accent = WARNING
        trend = "Increased"

    else:
        accent = PRIMARY
        trend = "No change"

    title_style = ParagraphStyle(
        "ComparisonTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=accent,
    )

    body_style = ParagraphStyle(
        "ComparisonBody",
        parent=styles["Body"],
        fontSize=10,
        leading=14,
        textColor=TEXT,
    )

    rows = [

        [Paragraph(f"<b>{title}</b>", title_style)],

        [Paragraph(f"Before: <b>{before}</b>", body_style)],

        [Paragraph(f"After: <b>{after}</b>", body_style)],

        [Paragraph(f"Trend: <b>{trend}</b>", body_style)],

    ]

    return build_card(
        rows=rows,
        width=width,
        accent=accent,
    )