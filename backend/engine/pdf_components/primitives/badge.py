"""
PHI Design System

Badge Primitive
"""

from engine.pdf_components.framework.theme import (
    BADGE_RADIUS,
    BADGE_PADDING_X,
    BADGE_PADDING_Y,
)


def draw_badge(
    draw,
    x,
    y,
    text,
    font,
    fill,
    text_color="white",
    padding_x=BADGE_PADDING_X,
    padding_y=BADGE_PADDING_Y,
    radius=BADGE_RADIUS,
):
    """
    Filled rounded badge.

    Returns
    -------
    (width, height)
    """
    print("NEW BADGE")

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    width = text_width + padding_x * 2

    height = (
        text_height
        + padding_y * 2
    )

    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=radius,
        fill=fill,
    )

    draw.text(
        (
            x + padding_x,
            y + (height - text_height) / 2 - 1,
        ),
        text,
        font=font,
        fill=text_color,
    )

    return width, height