"""
PHI Design System

Interpretation Item Composite
"""

from engine.pdf_components.utils import (
    draw_png_icon,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
    draw_text,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    PRIMARY,
    SUCCESS,
)

# ==========================================================
# LAYOUT
# ==========================================================

LEVEL_ICON_SIZE = 42

ICON_TEXT_GAP = 12

LABEL_GAP = 4

BOTTOM_PADDING = 4


# ==========================================================
# LEVEL ICONS
# ==========================================================

LEVEL_ICONS = {
    "LOW": "low.png",
    "MODERATE": "moderate.png",
    "HIGH": "high.png",
}


# ==========================================================
# LEVEL COLORS
# ==========================================================

LEVEL_COLORS = {
    "LOW": SUCCESS,
    "MODERATE": (245, 145, 20),
    "HIGH": (220, 55, 55),
}


# ==========================================================
# DRAW
# ==========================================================

def draw_interpretation_item(
    img,
    draw,
    x,
    y,
    width,
    item,
    fonts,
):
    """
    Draw interpretation row.

    Gauge icon is shown on the left.
    Level label is shown separately next to it.
    """

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    level = str(
        item.get(
            "status",
            "",
        )
    ).upper().strip()

    icon_file = LEVEL_ICONS.get(
        level,
    )

    level_color = LEVEL_COLORS.get(
        level,
        PRIMARY,
    )

    # ------------------------------------------------------
    # ICON
    # ------------------------------------------------------

    if icon_file:

        draw_png_icon(
            img=img,
            icon_file=icon_file,
            x=x,
            y=y,
            size=LEVEL_ICON_SIZE,
        )

    # ------------------------------------------------------
    # LABEL
    # ------------------------------------------------------

    label_font = fonts["small"]

    label = (
        level.title()
        if level
        else ""
    )

    label_x = (
        x
        + LEVEL_ICON_SIZE
        + ICON_TEXT_GAP
    )

    # ------------------------------------------------------
    # LABEL VERTICAL CENTER
    # ------------------------------------------------------

    label_bbox = draw.textbbox(
        (0, 0),
        label,
        font=label_font,
    )

    label_height = (
        label_bbox[3]
        - label_bbox[1]
    )

    label_y = (
        y
        + (
            LEVEL_ICON_SIZE
            - label_height
        ) / 2
        - label_bbox[1]
    )

    draw_text(
        draw=draw,
        x=label_x,
        y=label_y,
        text=label,
        font=label_font,
        fill=level_color,
    )

    # ------------------------------------------------------
    # DESCRIPTION
    # ------------------------------------------------------

    text_x = (
        label_x
    )

    text_y = (
        label_y
        + label_height
        + LABEL_GAP
    )

    text_width = (
        width
        - LEVEL_ICON_SIZE
        - ICON_TEXT_GAP
    )

    bottom = draw_paragraph(
        draw=draw,
        x=text_x,
        y=text_y,
        width=text_width,
        text=item.get(
            "text",
            "",
        ),
        font=fonts["body"],
        fill=TEXT,
        line_spacing=3,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return max(
        y + LEVEL_ICON_SIZE,
        bottom,
    ) + BOTTOM_PADDING