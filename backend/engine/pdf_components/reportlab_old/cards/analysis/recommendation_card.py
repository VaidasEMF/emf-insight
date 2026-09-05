from reportlab.platypus import (
    Paragraph,
)

from reportlab.lib.styles import (
    ParagraphStyle,
)

from ..base_card import (
    build_card,
)

from ....framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
    SECONDARY_TEXT,
)

from ....framework.constants import (
    CARD_WIDTH_MD,
)

def render_recommendation_card(
    styles,
    title,
    priority,
    recommendation,
    impact="",
    category="",
    width=CARD_WIDTH_MD,
):
    """
    Render recommendation card.
    """

    # ---------------------------------------------------------
    # Priority color
    # ---------------------------------------------------------

    priority_lower = str(priority).lower()

    if "high" in priority_lower:

        color = DANGER

    elif "medium" in priority_lower:

        color = WARNING

    else:

        color = SUCCESS

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "RecommendationTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=color,
    )

    body_style = ParagraphStyle(
        "RecommendationBody",
        parent=styles["Body"],
        fontSize=10,
        leading=14,
        textColor=TEXT,
    )

    meta_style = ParagraphStyle(
        "RecommendationMeta",
        parent=styles["Small"],
        fontSize=8,
        leading=10,
        textColor=SECONDARY_TEXT,
    )

    # ---------------------------------------------------------
    # Rows
    # ---------------------------------------------------------

    rows = [

        [
            Paragraph(
                f"<b>{title}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                recommendation,
                body_style,
            )
        ],

        [
            Paragraph(
                (
                    f"Priority: {priority}<br/>"
                    f"Impact: {impact}<br/>"
                    f"Category: {category}"
                ),
                meta_style,
            )
        ],

    ]

    # ---------------------------------------------------------
    # Card
    # ---------------------------------------------------------

    return build_card(
        rows=rows,
        width=width,
        accent=color,
    )