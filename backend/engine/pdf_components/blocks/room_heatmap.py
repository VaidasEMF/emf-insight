"""
Room Heatmap Block

Renders the main Room Analysis heatmap.
"""

from engine.pdf_components.cards.heatmap_card import (
    draw_heatmap_card,
)


def draw_room_heatmap(
    img,
    draw,
    heatmap,
    room,
    model,
    fonts,
    x,
    y,
    width,
    height=None,
):
    """
    Draw Room-level heatmap.
    """

    room_name = room.get(
        "name",
        "Room",
    )

    return draw_heatmap_card(
        img=img,
        draw=draw,

        heatmap=(
            heatmap.get(
                "sbm"
            )
            if heatmap
            else None
        ),

        x=x,
        y=y,

        width=width,

        height=height,

        title=(
            "ROOM — "
            + str(
                room_name
            )
        ),

        subtitle=(
            "Visual overview of electromagnetic "
            "exposure across the assessed room."
        ),

        floor=room.get(
            "floor",
            "",
        ),

        fonts=fonts,

        sources=[],
    )