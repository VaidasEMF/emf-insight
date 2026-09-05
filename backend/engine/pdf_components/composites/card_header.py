"""
PHI Design System

Card Header Composite
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)

from engine.pdf_layouts.base_layout import (
    ROW_GAP,
)

# ==========================================================
# LAYOUT
# ==========================================================

HEADER_ICON_SIZE = 32
HEADER_ICON_GAP = 10
HEADER_BOTTOM_MARGIN = ROW_GAP

# ==========================================================
# DRAW
# ==========================================================

def draw_card_header(
    draw,
    x,
    y,
    title,
    font,
    color=None,
    img=None,
    icon=None,
):
    """
    Draw premium card header.

    Parameters
    ----------
    draw:
        PIL ImageDraw object.

    x:
        Left X position.

    y:
        Top Y position.

    title:
        Header title.

    font:
        Header font.

    color:
        Header text color.
        Defaults to PRIMARY.

    img:
        PIL image used for icon rendering.

    icon:
        Optional icon path.
    """

    if not title:
        return y

    # ------------------------------------------------------
    # COLOR
    # ------------------------------------------------------

    if color is None:
        color = PRIMARY

    # ------------------------------------------------------
    # CURRENT X
    # ------------------------------------------------------

    current_x = x

    # ------------------------------------------------------
    # ICON
    # ------------------------------------------------------

    if icon is not None and img is not None:

        draw_png_icon(
            img=img,
            icon_file=icon,
            x=current_x,
            y=y,
            size=HEADER_ICON_SIZE,
        )

        current_x += (
            HEADER_ICON_SIZE
            + HEADER_ICON_GAP
        )

    # ------------------------------------------------------
    # TITLE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=current_x,
        y=y,
        text=str(title).upper(),
        font=font,
        fill=color,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    text_height = getattr(
        font,
        "size",
        HEADER_ICON_SIZE,
    )

    return (
        y
        + max(
            HEADER_ICON_SIZE
            if icon is not None
            else 0,
            text_height,
        )
        + HEADER_BOTTOM_MARGIN
    )