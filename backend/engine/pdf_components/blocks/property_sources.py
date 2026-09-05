from engine.pdf_components.cards.premium_sources_card import (
    draw_premium_sources_card,
)


def draw_property_sources(
    img,
    draw,
    sources,
    fonts,
    x,
    y,
    width,
    height=None,
):
    """
    Draw Primary EMF Sources.

    Position and width are supplied by the
    calling page so the block can participate
    in the dynamic page layout.
    """

    return draw_premium_sources_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        sources=sources,

        fonts=fonts,
    )