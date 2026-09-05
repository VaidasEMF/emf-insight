# =====================
# LEGEND SYSTEM
# =====================



from reportlab.platypus import (
    Paragraph,
    Table,
    TableStyle,
)

# =====================
# LEGEND ITEM
# =====================


def build_legend_item(
    color,
    label,
    styles,
):

    # =====================
    # COLOR DOT
    # =====================

    dot = Table(
        [[""]],
        colWidths=[10],
        rowHeights=[10],
    )

    dot.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("ROUNDEDCORNERS", [5, 5, 5, 5]),
            ]
        )
    )

    # =====================
    # LABEL
    # =====================

    text = Paragraph(
        label,
        styles["Small"],
    )

    # =====================
    # ROW
    # =====================

    row = Table(
        [
            [
                dot,
                text,
            ]
        ],
        colWidths=[14, 55],
    )

    row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return row


