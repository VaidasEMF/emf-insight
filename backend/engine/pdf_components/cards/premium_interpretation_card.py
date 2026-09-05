"""
PHI Design System

Premium Interpretation Card

Universal interpretation card used for:

- What This Means
- Property Interpretation
- Heatmap Interpretation
- Assessment Interpretation
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.interpretation_item import (
    draw_interpretation_item,
    LEVEL_ICON_SIZE,
    ICON_TEXT_GAP,
    LABEL_GAP,
    BOTTOM_PADDING as ITEM_BOTTOM_PADDING,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 10

DIVIDER_GAP = 10

SECTION_GAP = 4

TOP_PADDING = 24

BOTTOM_PADDING = 24

LINE_GAP = 6


# ==========================================================
# INTERNAL HELPERS
# ==========================================================

def _get_item_text(item):
    """
    Extract interpretation text from an item.
    """

    if isinstance(item, dict):

        return str(
            item.get("text")
            or item.get("description")
            or item.get("summary")
            or item.get("title")
            or ""
        ).strip()

    return str(
        item or ""
    ).strip()


def _get_item_status(item):
    """
    Extract interpretation status.
    """

    if not isinstance(item, dict):
        return ""

    return str(
        item.get("status")
        or item.get("level")
        or item.get("severity")
        or item.get("risk_level")
        or item.get("classification")
        or ""
    ).upper().strip()


def _measure_interpretation_item(
    draw,
    width,
    item,
    fonts,
):
    """
    Measure one interpretation item using
    the same typography logic as the
    actual renderer.
    """

    from engine.pdf_components.framework.typography import (
        draw_paragraph,
    )

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    level = _get_item_status(
        item
    )

    label = (
        level.title()
        if level
        else ""
    )

    # ------------------------------------------------------
    # FONTS
    # ------------------------------------------------------

    label_font = fonts["small"]

    body_font = fonts["body"]

    # ------------------------------------------------------
    # LABEL HEIGHT
    # ------------------------------------------------------

    label_height = 0

    if label:

        label_bbox = draw.textbbox(
            (0, 0),
            label,
            font=label_font,
        )

        label_height = (
            label_bbox[3]
            - label_bbox[1]
        )

    # ------------------------------------------------------
    # TEXT WIDTH
    # ------------------------------------------------------

    text_width = (
        width
        - LEVEL_ICON_SIZE
        - ICON_TEXT_GAP
    )

    # ------------------------------------------------------
    # TEXT
    # ------------------------------------------------------

    text = _get_item_text(
        item
    )

    # ------------------------------------------------------
    # MEASURE REAL PARAGRAPH HEIGHT
    # ------------------------------------------------------

    from engine.pdf_components.framework.layout import (
        measure_paragraph_height,
    )

    paragraph_height = (
        measure_paragraph_height(
            draw=draw,
            text=text,
            font=body_font,
            width=text_width,
            line_spacing=3,
        )
    )

    # ------------------------------------------------------
    # CONTENT HEIGHT
    # ------------------------------------------------------

    if label:

        text_block_height = (
            label_height
            + LABEL_GAP
            + paragraph_height
        )

    else:

        text_block_height = (
            paragraph_height
        )

    content_height = max(
        LEVEL_ICON_SIZE,
        text_block_height,
    )

    # ------------------------------------------------------
    # FINAL ITEM HEIGHT
    # ------------------------------------------------------

    return (
        content_height
        + ITEM_BOTTOM_PADDING
    )


# ==========================================================
# DRAW
# ==========================================================

def draw_premium_interpretation_card(
    img,
    draw,
    x,
    y,
    width,
    interpretation,
    fonts,
    height=None,
):
    """
    Premium Interpretation Card.

    Height is calculated dynamically from the
    actual interpretation content.

    The optional height parameter is retained only
    for backward compatibility and acts as a minimum.
    """

    interpretation = (
        interpretation
        or []
    )

    # ======================================================
    # FONTS
    # ======================================================

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

    # ======================================================
    # NORMALIZE ITEMS
    # ======================================================

    normalized_items = []

    for item in interpretation:

        text = _get_item_text(
            item
        )

        if not text:
            continue

        # IMPORTANT:
        # Keep the ORIGINAL item.
        # This preserves status / level / severity
        # for LOW / MODERATE / HIGH icons.

        normalized_items.append(
            item
        )

    # ======================================================
    # HEADER
    # ======================================================

    header_height = max(
        title_font.size,
        34,
    )

    # ======================================================
    # CONTENT WIDTH
    # ======================================================

    content_width = (
        width
        - TOP_PADDING * 2
    )

    # ======================================================
    # DESCRIPTION
    # ======================================================

    description = (
        "Interpretation of exposure levels "
        "according to PHI evaluation."
    )

    description_lines = FontManager.wrap_text(
        draw=draw,
        text=description,
        font=body_font,
        width=content_width,
    )

    if not description_lines:
        description_lines = [""]

    description_line_height = (
        body_font.size
        + LINE_GAP
    )

    description_height = (
        len(description_lines)
        * description_line_height
    )

    # ======================================================
    # MEASURE ITEMS
    # ======================================================

    measured_items_height = 0

    for index, item in enumerate(
        normalized_items
    ):

        item_height = (
            _measure_interpretation_item(
                draw=draw,
                width=content_width,
                item=item,
                fonts=fonts,
            )
        )

        measured_items_height += (
            item_height
        )

        if index < (
            len(normalized_items) - 1
        ):

            measured_items_height += (
                SECTION_GAP
            )

    # ======================================================
    # CALCULATE HEIGHT
    # ======================================================

    calculated_height = (

        TOP_PADDING

        + header_height

        + HEADER_GAP

        + description_height

        + HEADER_GAP

        + 1

        + DIVIDER_GAP

        + measured_items_height

        + BOTTOM_PADDING

        + 68
    )

    # ======================================================
    # FINAL HEIGHT
    # ======================================================

    actual_height = calculated_height

    # Backward compatibility only.
    # Never makes the card smaller than its content.

    if height is not None:

        actual_height = max(
            actual_height,
            int(height),
        )

  

    # ======================================================
    # CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    # ======================================================
    # HEADER
    # ======================================================

    current_y = (
        area["y"]
        + TOP_PADDING
    )

    current_y = draw_card_header(
        draw=draw,
        img=img,
        icon=None,
        x=area["x"],
        y=current_y,
        title="WHAT THIS MEANS",
        font=title_font,
        color=PRIMARY,
    )

    # ======================================================
    # DESCRIPTION
    # ======================================================

    current_y = draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=content_width,
        text=description,
        font=body_font,
        fill=PRIMARY,
        line_spacing=LINE_GAP,
    )

    current_y += HEADER_GAP

    # ======================================================
    # DIVIDER
    # ======================================================

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        color=BORDER,
    )

    current_y += DIVIDER_GAP

    # ======================================================
    # ITEMS
    # ======================================================

    for index, item in enumerate(
        normalized_items
    ):

        current_y = (
            draw_interpretation_item(
                img=img,
                draw=draw,
                x=area["x"],
                y=current_y,
                width=content_width,
                item=item,
                fonts=fonts,
            )
        )

        if index < (
            len(normalized_items) - 1
        ):

            current_y += SECTION_GAP

    # ======================================================
    # RETURN
    # ======================================================

    return y + actual_height