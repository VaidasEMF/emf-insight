"""
Reusable PIL section title.
"""

from PIL import ImageDraw

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
)

from engine.pdf_components.pil.cards.base_card import (
    draw_divider,
)


def draw_section_title(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    width,
    title,
    title_font,
    line=True,
):
    """
    Draw section title.

    Parameters
    ----------
    draw
        PIL draw object.

    x, y
        Top-left position.

    width
        Section width.

    title
        Section title.

    title_font
        PIL font.

    line
        Draw divider under title.
    """

    draw.text(
        (x, y),
        title,
        fill=PRIMARY,
        font=title_font,
    )

    if line:

        draw_divider(
            draw=draw,
            x=x,
            y=y + 34,
            width=width,
            color=BORDER,
        )

    return y + 48