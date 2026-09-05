from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

from ..base_card import build_card

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    WARNING,
    DANGER,
    INFO,
    TEXT,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_SM,
)


def render_metric_card(
    styles,
    title,
    value,
    subtitle="",
    variant="info",
    width=CARD_WIDTH_SM,
):
    """
    Small KPI card used across ReportLab pages.

    Examples:
        • Risk Level
        • SBM Score
        • ICNIRP
        • Coverage
        • Rooms
        • Status
    """

    colors = {
        "success": SUCCESS,
        "warning": WARNING,
        "danger": DANGER,
        "info": INFO,
    }

    accent = colors.get(
        variant.lower(),
        PRIMARY,
    )

    title_style = ParagraphStyle(
        "MetricTitle",
        parent=styles["Small"],
        fontSize=9,
        leading=11,
        textColor=SECONDARY_TEXT,
    )

    value_style = ParagraphStyle(
        "MetricValue",
        parent=styles["Body"],
        fontSize=22,
        leading=26,
        textColor=accent,
    )

    subtitle_style = ParagraphStyle(
        "MetricSubtitle",
        parent=styles["Small"],
        fontSize=9,
        leading=11,
        textColor=TEXT,
    )

    rows = [

        [
            Paragraph(
                title.upper(),
                title_style,
            )
        ],

        [
            Paragraph(
                f"<b>{value}</b>",
                value_style,
            )
        ],

    ]

    if subtitle:

        rows.append(
            [
                Paragraph(
                    subtitle,
                    subtitle_style,
                )
            ]
        )

    return build_card(
        rows=rows,
        width=width,
        accent=accent,
    )