"""
PHI Design System

Hero Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.hero_score import (
    draw_hero_score,
)

from engine.pdf_components.composites.hero_status import (
    draw_hero_status,
)

from engine.pdf_components.primitives.divider import (
    draw_vertical_divider,
)

# ==========================================================
# INTERNAL LAYOUT
# ==========================================================

LEFT_COLUMN_WIDTH = 200

COLUMN_GAP = 44

HEADER_GAP = 20

BOTTOM_PADDING = 28


# ==========================================================
# HERO CARD
# ==========================================================

def draw_hero_card(
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
    Universal PHI Hero Card.
    """

    # ---------------------------------------------------------
    # Fonts
    # ---------------------------------------------------------

    title_font = (
        fonts.get("subtitle")
        or fonts.get("title")
        or fonts.get("body")
    )

    score_font = (
        fonts.get("score")
        or fonts.get("hero")
        or fonts.get("display")
        or fonts.get("title")
    )

    risk_font = (
        fonts.get("title")
        or fonts.get("subtitle")
        or fonts.get("body")
    )

    body_font = (
        fonts.get("body")
        or fonts.get("subtitle")
    )

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

    print(area)

    # ---------------------------------------------------------
    # Header
    # ---------------------------------------------------------

    area["y"] = draw_card_header(
        draw=draw,
        img=img,
        x=area["x"],
        y=area["y"],
        title=title,
        font=title_font,
    )

    # ---------------------------------------------------------
    # Layout
    # ---------------------------------------------------------

    content_top = area["y"] + HEADER_GAP

    # ---------------------------------------------------------
    # Columns
    # ---------------------------------------------------------

    left_x = area["x"]

    left_width = LEFT_COLUMN_WIDTH

    

    divider_x = (
        left_x
        + LEFT_COLUMN_WIDTH
        + 36
    )

    right_x = (
        divider_x
        + COLUMN_GAP
    )

    right_width = (
        area["width"]
        - LEFT_COLUMN_WIDTH
        - COLUMN_GAP
    )


    divider_height = (
        area["height"]
        - (content_top - area["y"])
        - BOTTOM_PADDING
    )

    draw_vertical_divider(
        draw=draw,
        x=divider_x,
        y=content_top,
        height=divider_height,
    )

    # ---------------------------------------------------------
    # Left Column
    # ---------------------------------------------------------
    
    draw_hero_score(
        draw=draw,
        x=left_x,
        y=content_top,
        width=left_width,
        score=score,
        label=risk,
        badge=subtitle,
        fill=fill,
        score_font=score_font,
        risk_font=risk_font,
        body_font=body_font,
        variant=variant,
    )

    # ---------------------------------------------------------
    # Right Column
    # ---------------------------------------------------------

    draw_hero_status(
        draw=draw,
        img=img,
        x=right_x,
        y=content_top,
        width=right_width,
        label=risk,
        description=interpretation,
        title_font=risk_font,
        body_font=body_font,
        variant=variant,
    )

    # ---------------------------------------------------------
    # Return
    # ---------------------------------------------------------

    return y + height