"""
PHI Design System

Premium Findings Card

Universal bullet-list card used for:

- Key Findings
- Recommendations
- Priorities
- Next Steps
- Observations
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.composites.bullet_list import (
    draw_bullet_list,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 10

DIVIDER_MARGIN = 14

CONTENT_PADDING = 22

BOTTOM_PADDING = 42

BULLET_GAP = 8

BULLET_OFFSET = 28

LINE_GAP = 4


# ==========================================================
# CARD
# ==========================================================

def draw_premium_findings_card(
    img,
    draw,
    x,
    y,
    width,
    title,
    items,
    icon=None,
    accent=PRIMARY,
    fonts=None,
    min_height=0,
    height=None,
):
    """
    Premium Findings Card.

    Card height is calculated automatically from
    the actual wrapped bullet-list content.

    Returns
    -------
    int
        Actual bottom Y position.
    """

    print(
        ">>> 🔥 PREMIUM FINDINGS:",
        title,
        "Y=",
        y,
        "WIDTH=",
        width,
        "MIN_HEIGHT=",
        min_height,
    )

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
        or fonts.get("caption")
    )

    # ------------------------------------------------------
    # NORMALIZE ITEMS
    # ------------------------------------------------------

    normalized_items = []

    for item in items or []:

        if isinstance(item, dict):

            text = (
                item.get("text")
                or item.get("title")
                or ""
            )

        else:

            text = str(item)

        text = str(text).strip()

        if text:
            normalized_items.append(text)

    # ------------------------------------------------------
    # HEADER HEIGHT
    # ------------------------------------------------------

    header_height = max(
        title_font.size,
        34,
    )

    # ------------------------------------------------------
    # CONTENT WIDTH
    # ------------------------------------------------------

    content_width = (
        width
        - CONTENT_PADDING * 2
    )

    text_width = (
        content_width
        - BULLET_OFFSET
    )

    # ------------------------------------------------------
    # MEASURE BULLET CONTENT
    # ------------------------------------------------------

    measured_content_height = 0

    for text in normalized_items:

        lines = FontManager.wrap_text(
            draw=draw,
            text=text,
            font=body_font,
            width=text_width,
        )

        if not lines:
            lines = [text]

        line_height = (
            body_font.size
            + LINE_GAP
        )

        item_height = (
            len(lines)
            * line_height
        )

        measured_content_height += item_height

        measured_content_height += BULLET_GAP

    
    # ------------------------------------------------------
    # HEADER + DIVIDER + CONTENT
    # ------------------------------------------------------

    divider_height = 1

    actual_height = (

        CONTENT_PADDING

        + header_height

        + HEADER_GAP

        + divider_height

        + DIVIDER_MARGIN

        + measured_content_height

        + BOTTOM_PADDING

        + 18
    )

    # ------------------------------------------------------
    # HEIGHT
    # ------------------------------------------------------

    calculated_height = actual_height

    if height is not None:

        # --------------------------------------------------
        # FIXED PAGE LAYOUT HEIGHT
        # --------------------------------------------------

        actual_height = int(height)

    else:

        actual_height = max(
            calculated_height,
            min_height,
        )

    print(
        ">>> PREMIUM FINDINGS FINAL HEIGHT:",
        title,
        actual_height,
    )

    # ------------------------------------------------------
    # DEBUG
    # ------------------------------------------------------

    print(
        ">>> FINDINGS HEIGHT DEBUG"
    )

    print(
        "ITEMS:",
        len(normalized_items),
    )

    print(
        "CONTENT WIDTH:",
        content_width,
    )

    print(
        "TEXT WIDTH:",
        text_width,
    )

    print(
        "MEASURED CONTENT HEIGHT:",
        measured_content_height,
    )

    print(
        "FINAL CARD HEIGHT:",
        actual_height,
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
        x=area["x"] + CONTENT_PADDING,
        y=area["y"] + CONTENT_PADDING,
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
        x=area["x"] + CONTENT_PADDING,
        y=divider_y,
        width=(
            area["width"]
            - CONTENT_PADDING * 2
        ),
    )

    # ------------------------------------------------------
    # BULLETS
    # ------------------------------------------------------

    content_y = (
        divider_y
        + DIVIDER_MARGIN
    )

    draw_bullet_list(
        draw=draw,
        x=area["x"] + CONTENT_PADDING,
        y=content_y,
        width=content_width,
        items=normalized_items,
        font=body_font,
        bullet_color=accent,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return y + actual_height