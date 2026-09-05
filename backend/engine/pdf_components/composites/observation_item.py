"""
PHI Design System

Observation Item

Reusable observation row.
"""

from engine.pdf_components.primitives.icon import (
    draw_icon,
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

ICON_SIZE = 32

TITLE_GAP = 18

BOTTOM_GAP = 10


def draw_observation_item(
    img,
    draw,
    x,
    y,
    width,
    observation,
    fonts,
):
    """
    Draw single observation.
    """

    title = observation.get(
        "title",
        "",
    )

    text = observation.get(
        "text",
        "",
    )

    # ------------------------------------------------------
    # ICON
    # ------------------------------------------------------

    draw_icon(
        img=img,
        x=x,
        y=y + 2,
        icon="check",
        size=ICON_SIZE,
    )

    # ------------------------------------------------------
    # TITLE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x + 24,
        y=y,
        text=title,
        font=fonts["body"],
        fill=TEXT,
    )

    current_y = y + TITLE_GAP

    # ------------------------------------------------------
    # DESCRIPTION
    # ------------------------------------------------------

    current_y = draw_paragraph(
        draw=draw,
        x=x + 24,
        y=current_y,
        width=width - 24,
        text=text,
        font=fonts["caption"],
        fill=TEXT_SECONDARY,
        line_spacing=4,
    )

    return current_y + BOTTOM_GAP