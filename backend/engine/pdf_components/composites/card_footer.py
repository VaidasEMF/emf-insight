"""
Card Footer Divider
"""

from engine.pdf_components.framework.colors import (
    BORDER,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)


def draw_card_footer(
    draw,
    x,
    y,
    width,
):
    """
    Draw divider at the bottom of a card.
    """

    draw_horizontal_divider(
        draw=draw,
        x=x,
        y=y,
        width=width,
        color=BORDER,
    )