"""
PHI Design System

Premium Hero Card v2
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.primitives.status import (
    draw_status,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
    WHITE,
)

# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 20

LEFT_WIDTH = 180

COLUMN_GAP = 40

SCORE_TOP = 6

BADGE_TOP = 120

CHIP_TOP = 165

STATUS_TOP = 8

DESCRIPTION_TOP = 60

BADGE_HEIGHT = 34


def draw_premium_hero_card(
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
    interpretation,
    fill,
    fonts,
):

    title_font = fonts["subtitle"]
    score_font = fonts["score"]
    body_font = fonts["body"]
    caption_font = fonts["caption"]

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    header_bottom = draw_card_header(
        draw=draw,
        x=area["x"],
        y=area["y"],
        title=title,
        font=title_font,
    )

    content_y = header_bottom + HEADER_GAP

    # ======================================================
    # LEFT SIDE
    # ======================================================

    left_center = area["x"] + LEFT_WIDTH / 2

    score_text = str(score)

    score_box = draw.textbbox(
        (0, 0),
        score_text,
        font=score_font,
    )

    score_width = score_box[2] - score_box[0]
    score_height = score_box[3] - score_box[1]

    score_x = left_center - score_width / 2
    score_y = content_y + SCORE_TOP

    draw.text(
        (score_x, score_y),
        score_text,
        font=score_font,
        fill=fill,
    )

    draw_text(
        draw=draw,
        x=score_x + score_width + 6,
        y=score_y + score_height - 10,
        text="/100",
        font=body_font,
        fill=TEXT_SECONDARY,
    )

    badge_text = str(risk).upper()

    badge_box = draw.textbbox(
        (0, 0),
        badge_text,
        font=title_font,
    )

    badge_width = (
        badge_box[2]
        - badge_box[0]
    ) + 34

    badge_x = (
        left_center
        - badge_width / 2
    )

    badge_y = (
        content_y
        + BADGE_TOP
    )

    draw.rounded_rectangle(
        (
            badge_x,
            badge_y,
            badge_x + badge_width,
            badge_y + BADGE_HEIGHT,
        ),
        radius=8,
        fill=fill,
    )

    draw.text(
        (
            left_center,
            badge_y + 6,
        ),
        badge_text,
        font=title_font,
        fill=WHITE,
        anchor="ma",
    )

    draw_text(
        draw=draw,
        x=left_center,
        y=content_y + CHIP_TOP,
        text=subtitle,
        font=caption_font,
        fill=TEXT_SECONDARY,
        anchor="ma",
    )

    # ======================================================
    # RIGHT SIDE
    # ======================================================

    right_x = (
        area["x"]
        + LEFT_WIDTH
        + COLUMN_GAP
    )

    right_width = (
        area["width"]
        - LEFT_WIDTH
        - COLUMN_GAP
    )

        # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    draw_status(
        draw=draw,
        img=img,
        x=right_x,
        y=content_y + STATUS_TOP,
        label=risk,
        font=title_font,
        show_icon=False,
    )

    # ------------------------------------------------------
    # SUBTITLE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=right_x,
        y=content_y + STATUS_TOP + 34,
        text="Overall Property Health",
        font=caption_font,
        fill=TEXT_SECONDARY,
    )

    # ------------------------------------------------------
    # DESCRIPTION
    # ------------------------------------------------------

    draw_paragraph(
        draw=draw,
        x=right_x,
        y=content_y + DESCRIPTION_TOP,
        width=right_width,
        text=interpretation,
        font=body_font,
        fill=TEXT,
        line_spacing=8,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return y + height

