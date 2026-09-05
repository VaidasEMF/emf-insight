"""
PHI Design System

Premium Info Card

Universal information card used for:

- Assessment Summary
- About Assessment
- What this Means
- Executive Summary
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    PRIMARY,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# LAYOUT
# ==========================================================

ICON_SIZE = 40

HEADER_GAP = 12
DIVIDER_GAP = 16

TEXT_SIDE = 22

LINE_SPACING = 5

HEADER_BOTTOM = 14
DIVIDER_MARGIN = 10
TEXT_TOP = 10
BOTTOM_PADDING = 14


# ==========================================================
# CARD
# ==========================================================

def draw_premium_info_card(
    img,
    draw,
    x,
    y,
    width,
    height=None,
    title="",
    min_height=0,
    text="",
    icon=None,
    accent=None,
    fonts=None,
):
    """
    Premium information card.

    Height is calculated automatically from
    the actual text content.

    If height is supplied, it acts as a minimum
    requested height. The card will still expand
    when the content requires more space.

    Returns
    -------
    int
        Actual bottom Y position.
    """

    # ------------------------------------------------------
    # Fonts
    # ------------------------------------------------------

    title_font = (
        fonts.get("subtitle")
        or fonts.get("title")
        or fonts.get("body")
    )

    body_font = (
        fonts.get("body")
        or fonts.get("caption")
        or fonts.get("small")
    )

    # ------------------------------------------------------
    # Accent
    # ------------------------------------------------------

    if accent is None:
        accent = PRIMARY

    # ------------------------------------------------------
    # Normalize text
    # ------------------------------------------------------

    if isinstance(text, dict):

        text = (
            text.get("text")
            or text.get("description")
            or text.get("summary")
            or ""
        )

    text = str(text or "").strip()

    # ------------------------------------------------------
    # CONTENT WIDTH
    # ------------------------------------------------------

    content_width = (
        width
        - TEXT_SIDE * 2
    )

    # ------------------------------------------------------
    # MEASURE TEXT
    # ------------------------------------------------------

    lines = FontManager.wrap_text(
        draw=draw,
        text=text,
        font=body_font,
        width=content_width,
    )

    if not lines:
        lines = [""]

    line_height = (
        body_font.size
        + LINE_SPACING
    )

    text_height = (
        len(lines)
        * line_height
    )

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    header_height = max(
        title_font.size,
        ICON_SIZE,
    )

    # ------------------------------------------------------
    # CALCULATED HEIGHT
    # ------------------------------------------------------

    calculated_height = (
        header_height
        + HEADER_BOTTOM
        + DIVIDER_MARGIN
        + TEXT_TOP
        + text_height
        + BOTTOM_PADDING
    )

    # ------------------------------------------------------
    # ACTUAL HEIGHT
    # ------------------------------------------------------

    if height is not None:

        actual_height = height

    else:

        actual_height = max(
            calculated_height,
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

    header_bottom = draw_card_header(
        draw=draw,
        img=img,
        icon=icon,
        x=area["x"] + TEXT_SIDE,
        y=area["y"] + 18,
        title=title,
        font=title_font,
        color=accent,
    )

    # ------------------------------------------------------
    # DIVIDER
    # ------------------------------------------------------

    divider_y = (
        header_bottom
        + HEADER_GAP
    )

    draw_horizontal_divider(
        draw=draw,
        x=area["x"] + TEXT_SIDE,
        y=divider_y,
        width=(
            area["width"]
            - TEXT_SIDE * 2
        ),
    )

    # ------------------------------------------------------
    # BODY Y
    # ------------------------------------------------------

    
    body_y = (
        divider_y
        + 8
    )

    # ------------------------------------------------------
    # BODY
    # ------------------------------------------------------

    if text:

        draw_paragraph(
            draw=draw,
            x=area["x"] + TEXT_SIDE,
            y=body_y,
            width=content_width,
            text=text,
            font=body_font,
            fill=TEXT,
            line_spacing=LINE_SPACING,
        )


    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return y + actual_height