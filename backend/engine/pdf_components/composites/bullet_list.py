"""
PHI Design System

Universal Bullet List
"""

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)

from engine.pdf_components.framework.colors import (
    TEXT,
)


BULLET = "•"

BULLET_OFFSET = 8
TEXT_OFFSET = 28

ITEM_SPACING = 8
LINE_SPACING = 4


def draw_bullet_list(
    draw,
    x,
    y,
    items,
    font,
    bullet_color,
    width=None,
):
    """
    Draw universal wrapped bullet list.

    Returns
    -------
    int
        Actual bottom Y position.
    """

    current_y = y

    if not items:
        return current_y

    # ------------------------------------------------------
    # Available text width
    # ------------------------------------------------------

    if width is None:
        width = 300

    text_width = (
        width
        - TEXT_OFFSET
    )

    # ------------------------------------------------------
    # ITEMS
    # ------------------------------------------------------

    for item in items:

        if isinstance(item, dict):

            line = (
                item.get("text")
                or item.get("title")
                or ""
            )

        else:

            line = str(item)

        line = str(line)

        # --------------------------------------------------
        # WRAP ITEM
        # --------------------------------------------------

        lines = FontManager.wrap_text(
            draw=draw,
            text=line,
            font=font,
            width=text_width,
        )

        if not lines:
            lines = [""]

        # --------------------------------------------------
        # BULLET
        # --------------------------------------------------

        draw_text(
            draw=draw,
            x=x + BULLET_OFFSET,
            y=current_y,
            text=BULLET,
            font=font,
            fill=bullet_color,
        )

        # --------------------------------------------------
        # TEXT LINES
        # --------------------------------------------------

        line_height = (
            font.size
            + LINE_SPACING
        )

        for index, wrapped_line in enumerate(lines):

            draw_text(
                draw=draw,
                x=x + TEXT_OFFSET,
                y=current_y,
                text=wrapped_line,
                font=font,
                fill=TEXT,
            )

            current_y += line_height

        # --------------------------------------------------
        # ITEM GAP
        # --------------------------------------------------

        current_y += ITEM_SPACING

    return current_y