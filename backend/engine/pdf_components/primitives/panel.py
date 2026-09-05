"""
PHI Design System

Universal Panel primitive.
Used by all cards and page sections.
"""

from engine.pdf_components.framework.colors import (
    CARD_BACKGROUND,
    BORDER,
    SHADOW,
)

from engine.pdf_components.framework.constants import (
    PANEL_RADIUS,
    BORDER_WIDTH,
    SHADOW_OFFSET,
)

from engine.pdf_components.framework.drawing import (
    draw_round_rect,
)


def draw_panel(
    draw,
    x,
    y,
    width,
    height,
    fill=CARD_BACKGROUND,
    border=BORDER,
    radius=PANEL_RADIUS,
    shadow=True,
):
    """
    Draw universal rounded panel.

    Parameters
    ----------
    draw
        PIL ImageDraw instance.

    x, y
        Top-left corner.

    width, height
        Panel size.

    fill
        Background color.

    border
        Border color.
        Use None to disable.

    radius
        Corner radius.

    shadow
        Draw subtle shadow.
    """

    # ======================================================
    # Shadow
    # ======================================================

    if shadow:

        draw_round_rect(
            draw=draw,
            x=x + SHADOW_OFFSET,
            y=y + SHADOW_OFFSET,
            width=width,
            height=height,
            radius=radius,
            fill=SHADOW,
        )

    # ======================================================
    # Panel
    # ======================================================

    draw_round_rect(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
        radius=radius,
        fill=fill,
        outline=border,
        border_width=BORDER_WIDTH,
    )