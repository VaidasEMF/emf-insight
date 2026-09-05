"""
Reusable Page Section

Creates a standard titled section used
across Premium PDF PIL pages.
"""

from .draw_section_title import (
    draw_section_title,
)


def draw_page_section(
    draw,
    x,
    y,
    width,
    title,
    title_font,
    draw_content=None,
):
    """
    Draw page section.

    Parameters
    ----------
    draw
        PIL ImageDraw

    x, y
        Section origin

    width
        Section width

    title
        Section title

    title_font
        PIL font

    draw_content
        Callback:

            draw_content(draw, x, y)

        Should return new Y position (optional).
    """

    current_y = draw_section_title(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title=title,
        title_font=title_font,
    )

    if draw_content:

        result = draw_content(
            draw,
            x,
            current_y,
        )

        if result is not None:
            current_y = result

    return current_y