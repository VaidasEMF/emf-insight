"""
Reusable ReportLab Card Renderer
"""

from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors

from ...framework.constants import (
    CARD_PADDING_X,
    CARD_PADDING_Y,
)

from ...framework.colors import (
    CARD_BG,
    CARD_BORDER,
)


def build_card(
    rows,
    width,
    style=None,
):
    """
    Creates a standard ReportLab card.

    Parameters
    ----------
    rows : list
        Table rows.

    width : int | float
        Card width.

    style : list | None
        Additional ReportLab TableStyle commands.

    Returns
    -------
    Table
    """

    table = Table(
        rows,
        colWidths=[width],
    )

    table_style = [

        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),

        ("BOX", (0, 0), (-1, -1), 1, CARD_BORDER),

        ("LEFTPADDING", (0, 0), (-1, -1), CARD_PADDING_X),

        ("RIGHTPADDING", (0, 0), (-1, -1), CARD_PADDING_X),

        ("TOPPADDING", (0, 0), (-1, -1), CARD_PADDING_Y),

        ("BOTTOMPADDING", (0, 0), (-1, -1), CARD_PADDING_Y),

        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]

    if style:
        table_style.extend(style)

    table.setStyle(
        TableStyle(table_style)
    )

    return table


# ------------------------------------------------------------------
# Backward compatibility
# ------------------------------------------------------------------

draw_card = build_card

render_card = build_card