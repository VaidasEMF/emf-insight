"""
PHI Design System

Premium Hero Card

Universal Hero component used by:

- Assessment Summary
- Executive Summary
- Comparison Reports
- Future PHI reports
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
    TEXT_SECONDARY,
    WHITE,
    SUCCESS,
)

# ==========================================================
# LAYOUT
# ==========================================================

LEFT_COLUMN_WIDTH = 250
COLUMN_GAP = 28

HEADER_GAP = 12

SCORE_TOP = 22

STATUS_TOP = 18

PARAGRAPH_TOP = 62

FRACTION_GAP = 5


# ==========================================================
# HERO
# ==========================================================

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
    variant="default",
):
    """
    Premium Hero Card
    """

    # ---------------------------------------------------------
    # Fonts
    # ---------------------------------------------------------

    title_font = fonts["subtitle"]

    score_font = fonts["score"]

    badge_font = fonts["subtitle"]

    body_font = fonts["body"]

    # ---------------------------------------------------------
    # Card
    # ---------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ---------------------------------------------------------
    # Header
    # ---------------------------------------------------------

    area["y"] = draw_card_header(
        draw=draw,
        x=area["x"],
        y=area["y"],
        title=title,
        font=title_font,
    )

    # ---------------------------------------------------------
    # Layout
    # ---------------------------------------------------------

    content_y = (
        area["y"]
        + HEADER_GAP
    )

    # ---------------------------------------------------------
    # Divider
    # ---------------------------------------------------------

    divider_x = (
        area["x"]
        + LEFT_COLUMN_WIDTH
    )

    draw.line(
        (
            divider_x,
            content_y + 30,
            divider_x,
            area["y"]
            + area["height"]
            - 55,
        ),
        fill="#E5E7EB",
        width=1,
    )

    # ---------------------------------------------------------
    # LEFT COLUMN
    # ---------------------------------------------------------

    left_x = area["x"]

    left_width = LEFT_COLUMN_WIDTH

    # ---------------------------------------------------------
    # RIGHT COLUMN
    # ---------------------------------------------------------

    right_x = (
        divider_x
        + 24
    )

    right_width = (
        area["x"]
        + area["width"]
        - right_x
        - 8
    )
    # =========================================================
    # LEFT COLUMN
    # =========================================================

    center_x = left_x + LEFT_COLUMN_WIDTH / 2

    score_y = content_y + SCORE_TOP

    score_text = str(score)

    score_bbox = draw.textbbox(
        (0, 0),
        score_text,
        font=score_font,
    )

    score_width = score_bbox[2] - score_bbox[0]

    score_height = score_bbox[3] - score_bbox[1]

    score_x = (
        center_x
        - score_width / 2
    )

    draw.text(
        (
            score_x,
            score_y,
        ),
        score_text,
        font=score_font,
        fill=fill,
    )

    # ---------------------------------------------------------
    # /100
    # ---------------------------------------------------------

    fraction = "/100"

    fraction_bbox = draw.textbbox(
        (0, 0),
        fraction,
        font=body_font,
    )

    fraction_width = (
        fraction_bbox[2]
        - fraction_bbox[0]
    )

    draw.text(
        (
            score_x
            + score_width
            + FRACTION_GAP,
            score_y
            + score_height
            - 14,
        ),
        fraction,
        font=body_font,
        fill=TEXT_SECONDARY,
    )

    # ---------------------------------------------------------
    # PROPERTY HEALTH LABEL
    # ---------------------------------------------------------

    health_label = "Overall Property Health"

    health_y = (
        score_y
        + score_height
        + 30
    )

    draw_text(
        draw=draw,
        x=center_x,
        y=health_y,
        text=health_label,
        font=body_font,
        fill=TEXT_SECONDARY,
        anchor="ma",
    )

    # ---------------------------------------------------------
    # RISK / INTERPRETATION
    # ---------------------------------------------------------

    status_y = (
        content_y
        + STATUS_TOP
    )

    # ---------------------------------------------------------
    # RISK STATUS
    # ---------------------------------------------------------

    draw_text(
        draw=draw,
        x=right_x,
        y=status_y,
        text=str(risk).title(),
        font=title_font,
        fill=SUCCESS,
    )

    # ---------------------------------------------------------
    # Description
    # ---------------------------------------------------------

    paragraph_y = (
        content_y
        + PARAGRAPH_TOP
    )

    draw_paragraph(
        draw=draw,
        x=right_x,
        y=paragraph_y,
        width=right_width,
        text=interpretation,
        font=body_font,
        line_spacing=5,
    )

    # ---------------------------------------------------------
    # Return
    # ---------------------------------------------------------

    return y + height