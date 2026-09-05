from engine.pdf_components.cards.hero_card import (
    draw_hero_card,
)


def draw_hero_assessment_card(
    draw,
    img,
    x,
    y,
    width,
    height,
    score,
    risk,
    interpretation,
    fonts,
):

  

    return draw_hero_card(
        draw=draw,
        img=img,
        x=x,
        y=y,
        width=width,
        height=height,
        title="OVERALL BIOLOGICAL EXPOSURE SCORE",
        score=score,
        risk=risk,
        subtitle="RF EXPOSURE",
        interpretation=interpretation,
        fill="#FF6B00",
        fonts=fonts,
        variant="assessment",
    )