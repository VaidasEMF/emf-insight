"""
Property Observations Block
"""

from engine.pdf_components.cards.premium_observations_card import (
    draw_premium_observations_card,
)


def draw_property_observations(
    img,
    draw,
    observations,
    fonts,
    x,
    y,
    width,
    height=None,
):
    """
    Draw Property Observations.

    Position and width are supplied by the page
    so the block can participate in a dynamic layout.

    Height is optional and should normally be
    calculated automatically by the card.
    """

    return draw_premium_observations_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        observations=observations,

        fonts=fonts,
    )