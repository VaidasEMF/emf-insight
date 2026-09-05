"""
PHI Design System

Premium Sources Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)


from engine.pdf_components.composites.source_item import (
    draw_source_item,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 14

DIVIDER_GAP = 16

ROW_GAP = 6

SOURCE_ROW_MIN_HEIGHT = 54

BOTTOM_PADDING = 20

SUBTITLE_GAP = 8

BOTTOM_NOTE_GAP = 18
BOTTOM_NOTE_LINE_SPACING = 5
BOTTOM_NOTE_HEIGHT = 82

# Card horizontal padding
CARD_SIDE_PADDING = 18


# ==========================================================
# CARD
# ==========================================================

def draw_premium_sources_card(
    img,
    draw,
    x,
    y,
    width,
    height=None,
    sources=None,
    fonts=None,
):
    """
    Premium Primary EMF Sources Card.

    Layout:

        PRIMARY EMF SOURCES
        (This Floor)

        ─────────────────────────

        [icon]  1  Wi-Fi Router       High
                   2.4/5 GHz

        [icon]  2  Bluetooth Device   Moderate
                   Short Range

        [icon]  3  Electrical Panel   Moderate
                   Main Distribution

        [icon]  4  Power Line         Low
                   Outdoor Source
                   ~45 m from property

        ─────────────────────────

        Source impact levels reflect
        contribution to overall exposure
        on this floor.
    """

    sources = sources or []

    # ------------------------------------------------------
    # DISPLAY LIMIT
    # ------------------------------------------------------

    visible_sources = sources[:5]

    # ------------------------------------------------------
    # FONTS
    # ------------------------------------------------------

    title_font = fonts["subtitle"]
    body_font = fonts["body"]
    small_font = fonts["small"]

    # ------------------------------------------------------
    # HEADER HEIGHT
    # ------------------------------------------------------

    header_height = max(
        title_font.size,
        28,
    )

    subtitle_height = max(
        small_font.size,
        16,
    )

    # ------------------------------------------------------
    # SOURCE HEIGHT
    # ------------------------------------------------------

    source_height = (
        len(visible_sources)
        * SOURCE_ROW_MIN_HEIGHT
    )

    source_gaps = (
        max(
            0,
            len(visible_sources) - 1,
        )
        * ROW_GAP
    )

    # ------------------------------------------------------
    # FOOTER TEXT
    # ------------------------------------------------------

    footer_line_1 = (
        "Source impact levels reflect"
    )

    footer_line_2 = (
        "contribution to overall exposure"
    )

    footer_line_3 = (
        "on this floor."
    )

    footer_height = (
        small_font.size * 3
        + 8
    )

    # ------------------------------------------------------
    # CALCULATED HEIGHT
    # ------------------------------------------------------

    calculated_height = (

        header_height

        + HEADER_GAP

        + DIVIDER_GAP

        + source_height

        + source_gaps

        + BOTTOM_NOTE_GAP

        + BOTTOM_NOTE_HEIGHT

        + BOTTOM_PADDING
    )

    # ------------------------------------------------------
    # FINAL HEIGHT
    # ------------------------------------------------------

    if height is not None:

        actual_height = max(
            int(height),
            int(calculated_height),
        )

    else:

        actual_height = int(
            calculated_height
        )

 
    # ======================================================
    # BASE CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    current_y = area["y"]

    # ======================================================
    # HEADER
    # ======================================================

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text="PRIMARY EMF SOURCES",
        font=title_font,
        fill=PRIMARY,
    )

    current_y += title_font.size

    # ======================================================
    # THIS FLOOR
    # ======================================================

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y + 2,
        text="(This Floor)",
        font=small_font,
        fill=PRIMARY,
    )

    current_y += (
        subtitle_height
        + SUBTITLE_GAP
    )

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
    # SOURCES
    # ======================================================

    for index, source in enumerate(
        visible_sources
    ):

        current_y = draw_source_item(
            img=img,
            draw=draw,
            x=area["x"],
            y=current_y,
            width=area["width"],
            source=source,
            fonts=fonts,
            number=index + 1,
        )

        if index < len(visible_sources) - 1:

            current_y += ROW_GAP

    current_y += 10        

    # ======================================================
    # BOTTOM DIVIDER
    # ======================================================

    if visible_sources:

        draw_horizontal_divider(
            draw=draw,
            x=area["x"],
            y=current_y,
            width=area["width"],
            color=BORDER,
        )

        current_y += DIVIDER_GAP

    # ======================================================
    # FOOTER
    # ======================================================

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=footer_line_1,
        font=small_font,
        fill="#687386",
    )

    current_y += small_font.size

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=footer_line_2,
        font=small_font,
        fill="#687386",
    )

    current_y += small_font.size

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=footer_line_3,
        font=small_font,
        fill="#687386",
    )

    # ======================================================
    # BOTTOM NOTE
    # ======================================================

    bottom_note = (
        "Source impact levels reflect "
        "contribution to overall exposure "
        "on this floor."
    )

    note_y = (
        current_y
        + 8
    )

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=note_y - 6,
        width=area["width"],
        color=BORDER,
    )

    note_y += 10

    draw_paragraph(
        draw=draw,
        x=area["x"],
        y=note_y,
        width=area["width"],
        text=bottom_note,
        font=fonts["small"],
        line_spacing=5,
    )

    # ======================================================
    # RETURN
    # ======================================================

    return max(
        y + actual_height,
        current_y + BOTTOM_PADDING,
    )