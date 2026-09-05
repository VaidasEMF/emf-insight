# =====================
# LAYOUT ENGINE
# =====================

from reportlab.platypus import (
    Table,
    TableStyle,
    Spacer,
)


from engine.pdf_components.framework.constants import (
  
    CONTENT_WIDTH,
    
)

# =====================
# BASE GRID
# =====================


def build_grid(
    rows,
    widths,
    valign="TOP",
):

    table = Table(
        rows,
        colWidths=widths,
    )

    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), valign),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return table


# =====================
# TWO COLUMN
# =====================


def two_col(
    left,
    right,
    left_width=255,
    right_width=255,
):

    return build_grid(
        [[left, right]],
        [
            left_width,
            right_width,
        ],
    )


# =====================
# THREE COLUMN
# =====================


def three_col(
    a,
    b,
    c,
    width=170,
):

    return build_grid(
        [[a, b, c]],
        [
            width,
            width,
            width,
        ],
    )


# =====================
# FOUR KPI ROW
# =====================


def four_kpi(
    a,
    b,
    c,
    d,
):

    return build_grid(
        [[a, b, c, d]],
        [
            125,
            125,
            125,
            125,
        ],
    )


# =====================
# AUTO GRID
# =====================


def auto_grid(
    cards,
    columns=2,
    width=255,
    gap_spacer=True,
):

    rows = []

    current = []

    for i, card in enumerate(cards):

        current.append(card)

        if len(current) == columns:

            rows.append(current)

            current = []

    if current:

        while len(current) < columns:

            current.append(Spacer(1, 1))

        rows.append(current)

    widths = [width] * columns

    return build_grid(
        rows,
        widths,
    )


# =====================
# DASHBOARD STACK
# =====================


def dashboard_stack(
    *elements,
):

    rows = []

    for el in elements:

        rows.append([el])

    return build_grid(
        rows,
        [CONTENT_WIDTH],
    )
