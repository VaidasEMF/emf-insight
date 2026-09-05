"""
PHI Design System

Universal Pill primitive.

Larger than Badge.
Used for section labels,
status indicators and categories.
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
    WHITE,
)

from engine.pdf_components.framework.constants import (
    PANEL_RADIUS,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)

from engine.pdf_components.framework.drawing import (
    draw_round_rect,
)


# ==========================================================
# VARIANTS
# ==========================================================

_VARIANTS = {

    "primary": (
        PRIMARY,
        WHITE,
    ),

    "success": (
        SUCCESS,
        WHITE,
    ),

    "warning": (
        WARNING,
        WHITE,
    ),

    "danger": (
        DANGER,
        WHITE,
    ),

    "neutral": (
        "#EEF2F7",
        TEXT,
    ),
}


# ==========================================================
# DRAW
# ==========================================================

def draw_pill(
    draw,
    x,
    y,
    width,
    text,
    variant="primary",
    height=42,
    font=None,
):
    """
    Draw rounded pill.

    Parameters
    ----------
    draw
        PIL ImageDraw instance.

    x, y
        Top-left position.

    width
        Pill width.

    text
        Display text.

    variant
        primary
        success
        warning
        danger
        neutral

    height
        Pill height.
    """

    background, foreground = _VARIANTS.get(
        variant,
        _VARIANTS["primary"],
    )

    if font is None:

        fonts = load_cover_fonts()

        font = fonts["body"]

    # ======================================================
    # Background
    # ======================================================

    draw_round_rect(

        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        radius=height // 2,

        fill=background,

    )

    # ======================================================
    # Text
    # ======================================================

    draw_center_text(

        draw=draw,

        x_center=x + width / 2,

        y=y + (height - font.size) / 2 - 2,

        text=text,

        font=font,

        fill=foreground,

    )