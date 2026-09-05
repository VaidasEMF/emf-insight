"""
PHI Design System

Standard Item Composite
"""

from engine.pdf_components.primitives.status import (
    draw_status,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    TEXT_SECONDARY,
)

TITLE_Y = 0
STATUS_Y = 2
DESCRIPTION_Y = 30
BOTTOM_PADDING = 20


def draw_standard_item(
    img,
    draw,
    x,
    y,
    width,
    standard,
    fonts,
):
    """
    Draw single assessment standard.
    """

    draw_text(
        draw=draw,
        x=x,
        y=y,
        text=standard["title"],
        font=fonts["subtitle"],
        fill=PRIMARY,
    )

    draw_status(
        img=img,
        draw=draw,
        x=x + 140,
        y=y + STATUS_Y,
        label=standard["status"],
        font=fonts["small"],
    )

    bottom = draw_paragraph(
        draw=draw,
        x=x,
        y=y + DESCRIPTION_Y,
        width=width,
        text=standard["description"],
        font=fonts["body"],
        fill=TEXT_SECONDARY,
        line_spacing=6,
    )

    return bottom + BOTTOM_PADDING