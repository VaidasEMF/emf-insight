"""
PHI Design System

Universal Legend primitive.
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

_LEGEND_COLORS = {

    "excellent": SUCCESS,

    "good": SUCCESS,

    "moderate": WARNING,

    "warning": WARNING,

    "high": DANGER,

    "danger": DANGER,

    "critical": "#7F1D1D",

    "primary": PRIMARY,

    "neutral": "#CBD5E1",
}


# ==========================================================
# SINGLE ITEM
# ==========================================================

def draw_legend_item(
    draw,
    x,
    y,
    label,
    variant="primary",
    radius=8,
    font=None,
):
    """
    Draw single legend item.
    """

    color = _LEGEND_COLORS.get(
        variant.lower(),
        PRIMARY,
    )

    if font is None:

        fonts = load_cover_fonts()

        font = fonts["body"]

    # ------------------------------------------------------
    # Color marker
    # ------------------------------------------------------

    draw.ellipse(

        (
            x - radius,
            y - radius,
            x + radius,
            y + radius,
        ),

        fill=color,

    )

    # ------------------------------------------------------
    # Label
    # ------------------------------------------------------

    draw_text(

        draw=draw,

        x=x + radius + 12,

        y=y - font.size / 2,

        text=label,

        font=font,

        fill=TEXT,

    )


# ==========================================================
# LEGEND
# ==========================================================

def draw_legend(
    draw,
    x,
    y,
    items,
    spacing=180,
    radius=8,
    font=None,
):
    """
    Draw horizontal legend.

    Parameters
    ----------
    items

    [
        ("Excellent", "excellent"),
        ("Moderate", "moderate"),
        ("High", "danger"),
    ]
    """

    xx = x

    for label, variant in items:

        draw_legend_item(

            draw=draw,

            x=xx,

            y=y,

            label=label,

            variant=variant,

            radius=radius,

            font=font,

        )

        xx += spacing