from reportlab.lib.styles import (
    ParagraphStyle,
)

from reportlab.platypus import (
    Paragraph,
)

from ..base_card import (
    build_card,
)

from engine.pdf_components.framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_MD,
)


def render_exposure_card(
    styles,
    title,
    score,
    risk,
    description="",
    width=CARD_WIDTH_MD,
):
    """
    Exposure KPI Card
    """

    risk_lower = str(risk).lower()

    if "low" in risk_lower:

        color = SUCCESS

    elif "moderate" in risk_lower:

        color = WARNING

    else:

        color = DANGER

    title_style = ParagraphStyle(
        "ExposureTitle",
        parent=styles["Body"],
        fontSize=10,
        leading=12,
        textColor=SECONDARY_TEXT,
        alignment=1,
    )

    score_style = ParagraphStyle(
        "ExposureScore",
        parent=styles["Body"],
        fontSize=28,
        leading=30,
        textColor=TEXT,
        alignment=1,
    )

    risk_style = ParagraphStyle(
        "ExposureRisk",
        parent=styles["Body"],
        fontSize=10,
        leading=12,
        textColor=color,
        alignment=1,
    )

    body_style = ParagraphStyle(
        "ExposureBody",
        parent=styles["Small"],
        fontSize=9,
        leading=12,
        textColor=SECONDARY_TEXT,
        alignment=1,
    )

    rows = [

        [
            Paragraph(
                f"<b>{title}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                f"<b>{score}</b>",
                score_style,
            )
        ],

        [
            Paragraph(
                f"<b>{risk.upper()}</b>",
                risk_style,
            )
        ],

        [
            Paragraph(
                description,
                body_style,
            )
        ],

    ]

    return build_card(
        rows=rows,
        width=width,
        accent=color,
    )