"""
Assessment Hero Block
"""

from engine.pdf_components.cards.hero_assessment_card import (
    draw_hero_assessment_card,
)

from engine.pdf_layouts.assessment_layout import (
    HERO_HEIGHT,
)


def draw_assessment_hero(
    draw,
    img,
    x,
    y,
    width,
    hero,
    fonts,
):
    """
    Draw Assessment Hero.
    """

    return draw_hero_assessment_card(
        draw=draw,
        img=img,
        x=x,
        y=y,
        width=width,
        height=HERO_HEIGHT,
        score=hero.get("score", "-"),
        risk=hero.get("label", "UNKNOWN"),
        interpretation=hero.get("description", ""),
        fonts=fonts,
    )