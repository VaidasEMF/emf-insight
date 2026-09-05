"""
Sources Table Block
"""

from engine.pdf_components.cards.data_table_card import (
    draw_data_table_card,
)

from engine.pdf_layouts.sources_layout import (
    TABLE_X,
    TABLE_Y,
    TABLE_WIDTH,
    TABLE_HEIGHT,
)


def draw_sources_table(
    img,
    draw,
    sources,
    fonts,
):
    """
    Draw Sources table.
    """

    headers = [
        "Source",
        "Room",
        "Risk",
        "Distance",
    ]

    rows = []

    for source in sources:

        rows.append(
            [
                source.get("type", "-"),
                source.get("room", "-"),
                source.get("risk", "-"),
                source.get("distance", "-"),
            ]
        )

    draw_data_table_card(
        draw=draw,
        x=TABLE_X,
        y=TABLE_Y,
        width=TABLE_WIDTH,
        height=TABLE_HEIGHT,
        title="IDENTIFIED SOURCES",
        headers=headers,
        rows=rows,
        fonts=fonts,
    )