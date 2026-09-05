from reportlab.lib import colors
from reportlab.lib.styles import (
    ParagraphStyle,
)
from reportlab.platypus import (
    Paragraph,
    TableStyle,
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

def render_zone_card(
    styles,
    zone_name,
    zone_type,
    risk,
    avg_rf,
    max_rf,
    avg_electric,
    max_electric,
    avg_magnetic,
    max_magnetic,
    point_count,
    recommendation,
    width=CARD_WIDTH_MD,
):
    """
    Render exposure zone card.
    """

    # ---------------------------------------------------------
    # Risk color
    # ---------------------------------------------------------

    risk_lower = str(risk).lower()

    if "acceptable" in risk_lower:

        color = SUCCESS

    elif "optimization" in risk_lower:

        color = WARNING

    else:

        color = DANGER

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "ZoneTitle",
        parent=styles["Body"],
        fontSize=9,
        leading=11,
        textColor=TEXT,
    )

    body_style = ParagraphStyle(
        "ZoneBody",
        parent=styles["Body"],
        fontSize=9,
        leading=12,
    )

    meta_style = ParagraphStyle(
        "ZoneMeta",
        parent=styles["Body"],
        fontSize=8,
        leading=10,
        textColor=SECONDARY_TEXT,
    )

    recommendation_style = ParagraphStyle(
        "ZoneRecommendation",
        parent=styles["Body"],
        fontSize=9,
        leading=11,
        textColor=SECONDARY_TEXT,
        spaceBefore=4,
    )

    # ---------------------------------------------------------
    # Rows
    # ---------------------------------------------------------

    rows = [

        [
            Paragraph(
                f"<b>{zone_name}</b>",
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
                (
                    f"<b>RF Avg:</b> {round(avg_rf,1)} | "
                    f"<b>Max:</b> {round(max_rf,1)}"

                    f"<br/><b>Electric Avg:</b> {round(avg_electric,1)} | "
                    f"<b>Max:</b> {round(max_electric,1)}"

                    f"<br/><b>Magnetic Avg:</b> {round(avg_magnetic,1)} | "
                    f"<b>Max:</b> {round(max_magnetic,1)}"
                ),
                body_style,
            )
        ],

        [
            Paragraph(
                f"{point_count} measurements collected",
                body_style,
            )
        ],

        [
            Paragraph(
                "<b>Recommendation</b>",
                meta_style,
            )
        ],

        [
            Paragraph(
                recommendation.get("text", ""),
                recommendation_style,
            )
        ],

    ]

    # ---------------------------------------------------------
    # Base card
    # ---------------------------------------------------------

    table = build_card(
        rows=rows,
        width=width,
        accent=color,
    )

    # ---------------------------------------------------------
    # Zone-specific styling
    # ---------------------------------------------------------

    table.setStyle(
        TableStyle(
            [

                ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#D8DEE8")),

                ("BOTTOMPADDING", (0, 0), (-1, 0), 16),

                ("TOPPADDING", (0, 1), (-1, 1), 6),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 12),

                ("TOPPADDING", (0, 2), (-1, 2), 12),

            ]
        )
    )

    return table