"""
PHI Design System

Bullet List Card

Universal bullet-list card with
automatic height calculation.
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
    draw_text,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# INTERNAL LAYOUT
# ==========================================================

BULLET_OFFSET = 18

LINE_SPACING = 4

ITEM_GAP = 8

CONTENT_TOP = 10

BOTTOM_PADDING = 16


# ==========================================================
# CARD
# ==========================================================

def draw_bullet_list_card(
    draw,
    x,
    y,
    width,
    title,
    items,
    fonts,
    height=None,
    min_height=0,
):
    """
    Universal Bullet List Card.

    Height is calculated automatically from
    the actual wrapped bullet content.

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
        or fonts.get("subtitle")
    )

    # ------------------------------------------------------
    # Normalize items
    # ------------------------------------------------------

    items = items or []

    # ------------------------------------------------------
    # Content width
    # ------------------------------------------------------

    content_width = (
        width
        - BULLET_OFFSET
        - 12
    )

    # ------------------------------------------------------
    # Measure wrapped content
    # ------------------------------------------------------

    measured_items = []

    content_height = 0

    line_height = (
        body_font.size
        + LINE_SPACING
    )

    for item in items:

        # ----------------------------------------------
        # Normalize item
        # ----------------------------------------------

        if isinstance(item, dict):

            text = (
                item.get("text")
                or item.get("title")
                or ""
            )

        else:

            text = str(item)

        text = str(text)

        # ----------------------------------------------
        # Wrap text
        # ----------------------------------------------

        lines = FontManager.wrap_text(
            draw=draw,
            text=text,
            font=body_font,
            width=content_width,
        )

        if not lines:
            lines = [""]

        measured_items.append(
            lines
        )

        # ----------------------------------------------
        # Item height
        # ----------------------------------------------

        item_height = (
            len(lines)
            * line_height
        )

        content_height += item_height

        # ----------------------------------------------
        # Gap between items
        # ----------------------------------------------

        content_height += ITEM_GAP

    # Remove last item gap

    if measured_items:

        content_height -= ITEM_GAP

    # ------------------------------------------------------
    # Header
    # ------------------------------------------------------

    header_height = 0

    if title:

        header_height = max(
            title_font.size,
            28,
        )

    # ------------------------------------------------------
    # AUTO HEIGHT
    # ------------------------------------------------------

    calculated_height = (
        header_height
        + CONTENT_TOP
        + content_height
        + BOTTOM_PADDING
    )

    if height is None:

        actual_height = calculated_height

    else:

        actual_height = height

    # Respect minimum height

    actual_height = max(
        actual_height,
        min_height,
    )

    # ------------------------------------------------------
    # Card
    # ------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    # ------------------------------------------------------
    # Header
    # ------------------------------------------------------

    current_y = area["y"]

    if title:

        current_y = draw_card_header(
            draw=draw,
            x=area["x"],
            y=current_y,
            title=title,
            font=title_font,
        )

    # ------------------------------------------------------
    # Body
    # ------------------------------------------------------

    current_y += CONTENT_TOP

    for lines in measured_items:

        # ----------------------------------------------
        # Bullet
        # ----------------------------------------------

        draw_text(
            draw=draw,
            x=area["x"],
            y=current_y,
            text="•",
            font=body_font,
            fill=TEXT,
        )

        # ----------------------------------------------
        # Text lines
        # ----------------------------------------------

        line_y = current_y

        for line in lines:

            draw_text(
                draw=draw,
                x=area["x"] + BULLET_OFFSET,
                y=line_y,
                text=line,
                font=body_font,
                fill=TEXT,
            )

            line_y += line_height

        # ----------------------------------------------
        # Next item
        # ----------------------------------------------

        current_y = (
            line_y
            + ITEM_GAP
        )

    # ------------------------------------------------------
    # Return actual bottom
    # ------------------------------------------------------

    return y + actual_height