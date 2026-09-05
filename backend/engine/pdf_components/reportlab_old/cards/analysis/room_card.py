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

def render_room_card(
    styles,
    room_name,
    room_type,
    score,
    risk,
    point_count,
    recommendation,
    width=CARD_WIDTH_MD,
):
    """
    Render room summary card.
    """

    # ---------------------------------------------------------
    # Risk color
    # ---------------------------------------------------------

    risk_lower = str(risk).lower()

    if "low" in risk_lower or "good" in risk_lower:

        color = SUCCESS

    elif "moderate" in risk_lower or "medium" in risk_lower:

        color = WARNING

    else:

        color = DANGER

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "RoomTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=color,
    )

    body_style = ParagraphStyle(
        "RoomBody",
        parent=styles["Body"],
        fontSize=10,
        leading=14,
        textColor=TEXT,
    )

    meta_style = ParagraphStyle(
        "RoomMeta",
        parent=styles["Small"],
        fontSize=9,
        leading=12,
        textColor=SECONDARY_TEXT,
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
                f"<b>{room_name}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                f"<b>{risk}</b>",
                title_style,
            )
        ],

        [
            Paragraph(
                f"Property Health Score: <b>{round(score)}</b>/100",
                body_style,
            )
        ],

        [
            Paragraph(
                f"{point_count} measurements collected",
                meta_style,
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
    # Card
    # ---------------------------------------------------------

    return build_card(
        rows=rows,
        width=width,
        accent=color,
    )