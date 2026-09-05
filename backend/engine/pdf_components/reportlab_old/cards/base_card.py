"""
PHI Card Builder

Reusable card factory for all ReportLab cards.
"""

from reportlab.platypus import (
    Table,
    TableStyle,
)

from ...framework.colors import (
    CARD_BG,
    BORDER,
)

from engine.pdf_components.framework.constants import (
    CARD_PADDING_X,
    CARD_PADDING_Y,
    RADIUS_MD,
)


def build_card(
    rows,
    width,
    accent=None,
    background=CARD_BG,
    border=BORDER,
    radius=RADIUS_MD,
    padding_x=CARD_PADDING_X,
    padding_y=CARD_PADDING_Y,
):
    """
    Build standard PHI card.

    Parameters
    ----------
    rows : list
        ReportLab table rows.

    width : int|float
        Card width.

    accent : Color | None
        Optional left accent line.

    background : Color
        Card background.

    border : Color
        Border color.

    radius : int
        Rounded corner radius.

    padding_x : int
        Horizontal padding.

    padding_y : int
        Vertical padding.
    """

    table = Table(
        rows,
        colWidths=[width],
    )

    style = [

        (
            "BACKGROUND",
            (0, 0),
            (-1, -1),
            background,
        ),

        (
            "BOX",
            (0, 0),
            (-1, -1),
            1,
            border,
        ),

        (
            "ROUNDEDCORNERS",
            [
                radius,
                radius,
                radius,
                radius,
            ],
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            padding_x,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            padding_x,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            padding_y,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            padding_y,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),
    ]

    if accent:

        style.append(

            (
                "LINEBEFORE",
                (0, 0),
                (0, -1),
                5,
                accent,
            )

        )

    table.setStyle(
        TableStyle(style)
    )

    return table