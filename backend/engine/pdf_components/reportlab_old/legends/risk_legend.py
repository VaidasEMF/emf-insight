
from reportlab.platypus import (
    Table,
    TableStyle,
)

from engine.pdf_components.framework.colors import (
    LOW,
    MODERATE,
    HIGH,
    VERY_HIGH,
    SOFT_BG,
    BORDER,
)

from engine.pdf_components.reportlab.legends.heatmap_legend import (
    build_legend_item,
)

# =====================
# RISK LEGEND
# =====================


def render_risk_legend(
    styles,
):

    low = build_legend_item(
        LOW,
        "Low",
        styles,
    )

    moderate = build_legend_item(
        MODERATE,
        "Moderate",
        styles,
    )

    high = build_legend_item(
        HIGH,
        "High",
        styles,
    )

    very_high = build_legend_item(
        VERY_HIGH,
        "Very High",
        styles,
    )

    legend = Table(
        [
            [
                low,
                moderate,
                high,
                very_high,
            ]
        ],
        colWidths=[
            70,
            90,
            70,
            90,
        ],
    )

    legend.setStyle(
        TableStyle(
            [
                # CARD
                ("BACKGROUND", (0, 0), (-1, -1), SOFT_BG),
                ("BOX", (0, 0), (-1, -1), 1, BORDER),
                ("ROUNDEDCORNERS", [8, 8, 8, 8]),
                # SPACING
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    return legend
