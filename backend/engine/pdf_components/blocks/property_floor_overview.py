"""
Property Floor Overview Block

Presentation block for the Property Overview page.

Contains:
- Floor overview text
- Rooms
- Measurement points
- Area coverage
"""

from engine.pdf_components.cards.property_floor_overview_card import (
    draw_property_floor_overview_card,
)

def draw_property_floor_overview(
    img,
    draw,
    project,
    analysis,
    fonts,
    x,
    y,
    width,
):
    """
    Draw Floor Overview card.

    Returns
    -------
    int
        Bottom Y position of the card.
    """

    return draw_property_floor_overview_card(
        img=img,
        draw=draw,
        project=project,
        analysis=analysis,
        fonts=fonts,
        x=x,
        y=y,
        width=width,
    )