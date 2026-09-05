# backend/engine/pdf_ui/grids.py

from reportlab.platypus import (
    Table,
    TableStyle,
)

# =====================
# TWO COLUMN GRID
# =====================


def two_column_grid(
    left,
    right,
    left_width=260,
    right_width=260,
):

    table = Table(
        [
            [
                left,
                right,
            ]
        ],
        colWidths=[
            left_width,
            right_width,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return table


# =====================
# THREE COLUMN GRID
# =====================


def three_column_grid(
    a,
    b,
    c,
    width=173,
):

    table = Table(
        [
            [
                a,
                b,
                c,
            ]
        ],
        colWidths=[
            width,
            width,
            width,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return table


# =====================
# FOUR COLUMN GRID
# =====================


def four_column_grid(
    a,
    b,
    c,
    d,
    width=130,
):

    table = Table(
        [
            [
                a,
                b,
                c,
                d,
            ]
        ],
        colWidths=[
            width,
            width,
            width,
            width,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return table


# =====================
# THREE CARD DASHBOARD
# =====================


def dashboard_three_grid(
    a,
    b,
    c,
):

    table = Table(
        [
            [
                a,
                b,
                c,
            ]
        ],
        colWidths=[
            170,
            170,
            170,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return table
