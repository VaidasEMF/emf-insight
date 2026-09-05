from PIL import ImageDraw

from engine.pdf_components.framework.colors import (
    PRIMARY,
    LIGHT_BORDER,
)


def draw_page_section(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    number,
    title,
    width,
    title_font,
):
    """
    Draw numbered page section.

    Example:

    2  EXPOSURE OVERVIEW
    --------------------
    """

    text = f"{number}  {title.upper()}"

    draw.text(
        (x, y),
        text,
        font=title_font,
        fill=PRIMARY,
    )

    bbox = draw.textbbox(
        (x, y),
        text,
        font=title_font,
    )

    line_y = bbox[3] + 10

    draw.line(
        (
            x,
            line_y,
            x + width,
            line_y,
        ),
        fill=LIGHT_BORDER,
        width=2,
    )

    return line_y + 20

