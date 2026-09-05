from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

from ..base_card import build_card

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_MD,
)


def render_dashboard_card(
    styles,
    title,
    value,
    subtitle="",
    width=CARD_WIDTH_MD,
):

    title_style = ParagraphStyle(
        "DashboardTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=PRIMARY,
    )

    value_style = ParagraphStyle(
        "DashboardValue",
        parent=styles["Body"],
        fontSize=22,
        leading=24,
        textColor=TEXT,
        alignment=1,
    )

    body_style = ParagraphStyle(
        "DashboardBody",
        parent=styles["Body"],
        fontSize=9,
        leading=12,
        textColor=TEXT,
    )

    rows = [

        [Paragraph(f"<b>{title}</b>", title_style)],

        [Paragraph(f"<b>{value}</b>", value_style)],

        [Paragraph(subtitle, body_style)],

    ]

    return build_card(
        rows=rows,
        width=width,
        accent=PRIMARY,
    )