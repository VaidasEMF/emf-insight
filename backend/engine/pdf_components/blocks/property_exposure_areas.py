"""
Property Exposure Areas Block

Presentation block for the Property Overview page.
"""

from engine.pdf_components.cards.property_exposure_overview_card import (
    draw_property_exposure_areas_card,
)


def draw_property_exposure_areas(
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
    Draw Key Exposure Areas card.

    Returns
    -------
    int
        Bottom Y position of the card.
    """

    return draw_property_exposure_areas_card(
        img=img,
        draw=draw,
        project=project,
        analysis=analysis,
        fonts=fonts,
        x=x,
        y=y,
        width=width,
    )