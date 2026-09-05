"""
Cover Property Score Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    WHITE,
)

CARD_COLOR = "#DC2626"

TITLE_TOP = 34
SCORE_TOP = 92
STATUS_TOP = 195
SUBTITLE_TOP = 248


def draw_cover_property_score(
    draw,
    img,
    x,
    y,
    width,
    height,
    title,
    score,
    risk,
    subtitle,
    fill=None,
    fonts=None,
):

    area = {
        "x": x,
        "y": y,
        "width": width,
        "height": height,
    }

    title_font = fonts["subtitle"]
    score_font = fonts["score"]
    status_font = fonts["title"]
    body_font = fonts["body"]

    # ----------------------------------------------------
    # SHADOW
    # ----------------------------------------------------

    draw.rounded_rectangle(
        (
            x + 4,
            y + 4,
            x + width + 4,
            y + height + 4,
        ),
        radius=24,
        fill="#C9D3E4",
    )

    # ----------------------------------------------------
    # CARD
    # ----------------------------------------------------

    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=24,
        fill=CARD_COLOR,
    )



    center_x = x + width / 2

    # ----------------------------------------------------
    # TITLE
    # ----------------------------------------------------

    draw_text(
        draw=draw,
        x=center_x,
        y=y + TITLE_TOP,
        text=title.upper(),
        font=title_font,
        fill=WHITE,
        anchor="ma",
    )

    # ----------------------------------------------------
    # SCORE
    # ----------------------------------------------------

    draw_text(
        draw=draw,
        x=center_x,
        y=y + SCORE_TOP,
        text=f"{score} / 100",
        font=score_font,
        fill=WHITE,
        anchor="ma",
    )

    # ----------------------------------------------------
    # STATUS
    # ----------------------------------------------------

    draw_text(
        draw=draw,
        x=center_x,
        y=y + STATUS_TOP,
        text=str(risk).upper(),
        font=status_font,
        fill=WHITE,
        anchor="ma",
    )

    # ----------------------------------------------------
    # SUBTITLE
    # ----------------------------------------------------

    draw_text(
        draw=draw,
        x=center_x,
        y=y + SUBTITLE_TOP,
        text=subtitle.upper(),
        font=body_font,
        fill="#FFE7E7",
        anchor="ma",
    )

    return y + height