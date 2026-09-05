"""
PHI Design System

Chip Primitive
"""

from engine.pdf_components.framework.theme import (
    CHIP_RADIUS,
    CHIP_PADDING_X,
    CHIP_PADDING_Y,
    CHIP_BORDER_WIDTH,
)


def draw_chip(
    draw,
    x,
    y,
    text,
    font,
    color,
    padding_x=CHIP_PADDING_X,
    padding_y=CHIP_PADDING_Y,
    radius=CHIP_RADIUS,
    border_width=CHIP_BORDER_WIDTH,
):
    """
    Premium outlined chip.

    Returns
    -------
    (width, height)
    """

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    width = (
        text_width
        + padding_x * 2
    )

    height = (
        text_height
        + padding_y * 2
    )

    # ---------------------------------------------------------
    # Border
    # ---------------------------------------------------------

    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=radius,
        outline=color,
        width=border_width,
    )

    print("NEW CHIP")

    # ---------------------------------------------------------
    # Text (vertically centered)
    # ---------------------------------------------------------

    text_x = x + padding_x

    text_y = (
        y
        + (height - text_height) / 2
        - 1
    )

    draw.text(
        (
            text_x,
            text_y,
        ),
        text,
        font=font,
        fill=color,
    )

    return width, height