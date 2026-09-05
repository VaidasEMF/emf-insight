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
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_MD,
)


def render_source_card(
    styles,
    source_name,
    source_type,
    impact,
    recommendation,
    details="",
    width=CARD_WIDTH_MD,
):
    """
    Render EMF source analysis card.
    """

    # ---------------------------------------------------------
    # Impact color
    # ---------------------------------------------------------

    impact_lower = str(impact).lower()

    if "low" in impact_lower:

        color = SUCCESS

    elif "moderate" in impact_lower or "medium" in impact_lower:

        color = WARNING

    else:

        color = DANGER

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "SourceTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=color,
    )

    body_style = ParagraphStyle(
        "SourceBody",
        parent=styles["Body"],
        fontSize=10,
        leading=15,
        textColor=TEXT,
    )

    details_style = ParagraphStyle(
        "SourceDetails",
        parent=styles["Small"],
        fontSize=9,
        leading=12,
        textColor=TEXT,
    )

    # ---------------------------------------------------------
    # Recommendation
    # ---------------------------------------------------------

    if isinstance(recommendation, dict):

        recommendation_text = recommendation.get(
            "text",
            "",
        )

    else:

        recommendation_text = str(
            recommendation,
        )

    # ---------------------------------------------------------
    # Rows
    # ---------------------------------------------------------

    rows = [

        [
            Paragraph(
                f"<b>{source_name}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                f"<b>{impact}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                source_type,
                body_style,
            )
        ],

        [
            Paragraph(
                details,
                details_style,
            )
        ],

        [
            Paragraph(
                recommendation_text,
                body_style,
            )
        ],

    ]

    # ---------------------------------------------------------
    # Base Card
    # ---------------------------------------------------------

    return build_card(
        rows=rows,
        width=width,
        accent=color,
    )