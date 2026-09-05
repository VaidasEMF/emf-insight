"""
Executive Overview Block
"""

from engine.pdf_components.cards.premium_hero_card import (
    draw_premium_hero_card,
)

from engine.pdf_layouts.executive_layout import (
    HERO_X,
    HERO_Y,
    HERO_WIDTH,
    HERO_HEIGHT,
)


def draw_executive_overview(
    img,
    draw,
    hero,
    fonts,
):
    """
    Executive Hero.
    """

    return draw_premium_hero_card(

        img=img,
        draw=draw,

        x=HERO_X,
        y=HERO_Y,

        width=HERO_WIDTH,
        height=HERO_HEIGHT,

        title=hero.get(
            "title",
            "PROPERTY HEALTH SCORE",
        ),

        score=hero.get(
            "score",
            "-",
        ),

        risk=hero.get(
            "status",
            hero.get(
                "label",
                "UNKNOWN",
            ),
        ),

        subtitle=hero.get(
            "subtitle",
            "Overall Property Health",
        ),

        interpretation=hero.get(
            "interpretation",
            hero.get(
                "description",
                "",
            ),
        ),

       fill=hero.get(
            "color",
            "#20B65B",
        ),

        fonts=fonts,
    )