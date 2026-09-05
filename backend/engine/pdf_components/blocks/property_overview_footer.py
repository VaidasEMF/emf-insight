"""
PHI PDF Design System

Property Overview Footer Block
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)


# ==========================================================
# LAYOUT
# ==========================================================

INFO_HEIGHT = 48

INFO_PADDING_X = 16
INFO_PADDING_Y = 10

INFO_ICON_SIZE = 24

NEXT_ARROW_GAP = 10

FOOTER_TOP_GAP = 14


# ==========================================================
# BLOCK
# ==========================================================

def draw_property_overview_footer(
    draw,
    fonts,
    x,
    y,
    width,
    floor_name="Main Floor",
    next_floor_name=None,
):
    """
    Draw bottom information bar and page footer.

    Returns
    -------
    int
        Bottom Y position.
    """

    # ======================================================
    # INFO BAR
    # ======================================================

    info_y = y

    draw.rounded_rectangle(
        (
            x,
            info_y,
            x + width,
            info_y + INFO_HEIGHT,
        ),
        radius=8,
        fill=(246, 248, 251),
        outline=None,
    )

    # ======================================================
    # INFO ICON
    # ======================================================

    icon_x = (
        x
        + INFO_PADDING_X
    )

    icon_y = (
        info_y
        + INFO_PADDING_Y
        + 2
    )

    draw.ellipse(
        (
            icon_x,
            icon_y,
            icon_x + INFO_ICON_SIZE,
            icon_y + INFO_ICON_SIZE,
        ),
        outline=PRIMARY,
        width=2,
    )

    draw_text(
        draw=draw,
        x=icon_x + 8,
        y=icon_y + 3,
        text="i",
        font=fonts["subtitle"],
        fill=PRIMARY,
    )

    # ======================================================
    # INFO TEXT
    # ======================================================

    text_x = (
        icon_x
        + INFO_ICON_SIZE
        + 12
    )

    text_y = (
        info_y
        + INFO_PADDING_Y
    )

    description = (
        f"This overview represents electromagnetic exposure "
        f"conditions on Floor 1 ({floor_name}). "
        f"See separate pages for individual room analysis."
    )

    draw_paragraph(
        draw=draw,
        x=text_x,
        y=text_y,
        width=width * 0.62,
        text=description,
        font=fonts["caption"],
        fill=PRIMARY,
        line_spacing=3,
    )

    # ======================================================
    # NEXT FLOOR
    # ======================================================

    if next_floor_name:

        next_text = (
            f"Next: {next_floor_name} Overview"
        )

        next_x = (
            x
            + width
            - 210
        )

        next_y = (
            info_y
            + 17
        )

        draw_text(
            draw=draw,
            x=next_x,
            y=next_y,
            text="→",
            font=fonts["subtitle"],
            fill=PRIMARY,
        )

        draw_text(
            draw=draw,
            x=next_x + 28,
            y=next_y + 1,
            text=next_text,
            font=fonts["caption"],
            fill=PRIMARY,
        )

    return info_y + INFO_HEIGHT