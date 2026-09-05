from reportlab.platypus import (
    Paragraph,
    TableStyle,
)

from reportlab.lib.styles import (
    ParagraphStyle,
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
    CARD_WIDTH_LG,
)

from engine.pdf_components.framework.constants import (
    ACCENT_LINE,
)


def render_heatmap_card(
    image,
    title,
    score,
    risk,
    worst_area="Unknown",
    height_label="120 cm",
):
    """
    Render Heatmap summary card.
    """

    # ---------------------------------------------------------
    # Risk Color
    # ---------------------------------------------------------

    risk_lower = str(risk).lower()

    if "low" in risk_lower:

        accent = SUCCESS

    elif "moderate" in risk_lower:

        accent = WARNING

    else:

        accent = DANGER

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "HeatmapTitle",
        fontSize=10,
        leading=12,
        textColor=SECONDARY_TEXT,
        alignment=1,
    )

    score_style = ParagraphStyle(
        "HeatmapScore",
        fontSize=26,
        leading=28,
        textColor=TEXT,
        alignment=1,
    )

    risk_style = ParagraphStyle(
        "HeatmapRisk",
        fontSize=10,
        leading=12,
        textColor=accent,
        alignment=1,
    )

    meta_style = ParagraphStyle(
        "HeatmapMeta",
        fontSize=8,
        leading=10,
        textColor=SECONDARY_TEXT,
        alignment=1,
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
            image,
        ],

        [
            Paragraph(
                f"<b>{score} / 100</b>",
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
                (
                    f"Worst Area: {worst_area}<br/>"
                    f"Measurement Height: {height_label}"
                ),
                meta_style,
            )
        ],

    ]

    # ---------------------------------------------------------
    # Base Card
    # ---------------------------------------------------------

    table = build_card(
        rows=rows,
        width=CARD_WIDTH_LG,
    )

    # ---------------------------------------------------------
    # Heatmap-specific styling
    # ---------------------------------------------------------

    table.setStyle(
        TableStyle(
            [

                (
                    "LINEABOVE",
                    (0, 0),
                    (-1, 0),
                    ACCENT_LINE,
                    accent,
                ),

                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),

            ]
        )
    )

    return table