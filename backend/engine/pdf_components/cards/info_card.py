"""
PHI Design System

Info Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.colors import (
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)

from engine.pdf_components.framework.layout import (
    measure_paragraph_height,
    measure_header_height,
    measure_card_height,
)

from engine.pdf_components.framework.theme import (
    CARD_PADDING,
)


# ==========================================================
# INTERNAL LAYOUT
# ==========================================================

CONTENT_TOP = 8

BOTTOM_PADDING = 12

LINE_SPACING = 6


# ==========================================================
# CARD
# ==========================================================

def draw_info_card(
    draw,
    x,
    y,
    width,
    title,
    text,
    fonts,
    height=None,
    min_height=0,
    img=None,
    icon=None,
):
    """
    Universal Information Card.

    Height is calculated dynamically.

    If height is supplied, it acts as a minimum height.
    """

    # ------------------------------------------------------
    # FONTS
    # ------------------------------------------------------

    title_font = (
        fonts.get("subtitle")
        or fonts.get("title")
        or fonts.get("body")
    )

    body_font = (
        fonts.get("body")
        or fonts.get("subtitle")
    )

    # ------------------------------------------------------
    # HEADER HEIGHT
    # ------------------------------------------------------

    header_height = 0

    if title:

        header_height = measure_header_height(
            title_font,
        )

    # ------------------------------------------------------
    # BODY HEIGHT
    # ------------------------------------------------------

    paragraph_height = measure_paragraph_height(
        draw=draw,
        text=text or "",
        font=body_font,
        width=(
            width
            - CARD_PADDING * 2
        ),
        line_spacing=LINE_SPACING,
    )

    # ------------------------------------------------------
    # CALCULATED HEIGHT
    # ------------------------------------------------------

    calculated_height = measure_card_height(
        header_height=header_height,
        body_height=(
            paragraph_height
            + BOTTOM_PADDING
        ),
    )

    # ------------------------------------------------------
    # FINAL HEIGHT
    # ------------------------------------------------------

    actual_height = calculated_height

    if height is not None:

        actual_height = max(
            actual_height,
            int(height),
        )

    actual_height = max(
        actual_height,
        min_height,
    )

   
    # ------------------------------------------------------
    # CARD
    # ------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    current_y = area["y"]

    if title:

        current_y = draw_card_header(
            draw=draw,
            img=img,
            icon=icon,
            x=area["x"],
            y=current_y,
            title=title,
            font=title_font,
        )

    # ------------------------------------------------------
    # BODY
    # ------------------------------------------------------

    draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y + CONTENT_TOP,
        width=area["width"],
        text=text or "",
        font=body_font,
        fill=TEXT,
        line_spacing=LINE_SPACING,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return y + actual_height