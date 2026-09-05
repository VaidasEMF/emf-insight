"""
PHI Design System

Universal Status Dot primitive.
"""

from engine.pdf_components.framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
    PRIMARY,
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)


# ==========================================================
# COLORS
# ==========================================================

_STATUS_COLORS = {

    "pass": SUCCESS,

    "success": SUCCESS,

    "warning": WARNING,

    "danger": DANGER,

    "fail": DANGER,

    "primary": PRIMARY,

    "neutral": "#CBD5E1",

}


# ==========================================================
# DRAW
# ==========================================================

def draw_status_dot(
    draw,
    x,
    y,
    status,
    label=None,
    radius=7,
    font=None,
):
    """
    Draw status indicator.

    Parameters
    ----------
    draw
        PIL ImageDraw

    x, y
        Center of status dot.

    status
        pass
        success
        warning
        danger
        fail
        neutral
        primary

    label
        Optional label.

    radius
        Dot radius.
    """

    color = _STATUS_COLORS.get(
        status.lower(),
        PRIMARY,
    )

    # ======================================================
    # Dot
    # ======================================================

    draw.ellipse(

        (
            x - radius,
            y - radius,
            x + radius,
            y + radius,
        ),

        fill=color,

    )

    # ======================================================
    # Label
    # ======================================================

    if label:

        if font is None:

            fonts = load_cover_fonts()

            font = fonts["body"]

        draw_text(

            draw=draw,

            x=x + radius + 10,

            y=y - font.size / 2,

            text=label,

            font=font,

            fill=TEXT,

        )