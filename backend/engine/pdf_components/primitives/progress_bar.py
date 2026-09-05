"""
PHI Design System

Universal Progress Bar primitive.
"""

from engine.pdf_components.framework.colors import (
    BORDER,
    SUCCESS,
    WARNING,
    DANGER,
    PRIMARY,
)

from engine.pdf_components.framework.constants import (
    PANEL_RADIUS,
)

from engine.pdf_components.framework.drawing import (
    draw_round_rect,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)


# ==========================================================
# COLORS
# ==========================================================

_PROGRESS_VARIANTS = {

    "primary": PRIMARY,

    "success": SUCCESS,

    "warning": WARNING,

    "danger": DANGER,

}


# ==========================================================
# DRAW
# ==========================================================

def draw_progress(
    draw,
    x,
    y,
    width,
    height,
    value=None,
    progress=None,
    maximum=100,
    variant="primary",
    show_label=True,
    font=None,
):
    """
    Draw universal progress bar.

    Parameters
    ----------
    value
        Current value.

    maximum
        Maximum value.

    variant
        primary
        success
        warning
        danger
    """

    if progress is not None:
        value = progress * maximum

    if value is None:
        value = 0

    if maximum <= 0:
        maximum = 1

    progress = max(
        0,
        min(
            value / maximum,
            1.0,
        ),
    )

    fill = _PROGRESS_VARIANTS.get(
        variant,
        PRIMARY,
    )

    if font is None:

        fonts = load_cover_fonts()

        font = fonts["small"]

    # ======================================================
    # Background
    # ======================================================

    draw_round_rect(

        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        radius=PANEL_RADIUS,

        fill="#EDF2F7",

        outline=BORDER,

        border_width=1,

    )

    # ======================================================
    # Progress
    # ======================================================

    progress_width = int(
        width * progress
    )

    if progress_width > 0:

        draw_round_rect(

            draw=draw,

            x=x,
            y=y,

            width=progress_width,
            height=height,

            radius=PANEL_RADIUS,

            fill=fill,

        )

    # ======================================================
    # Label
    # ======================================================

    if show_label:

        percent = int(
            progress * 100
        )

        draw_center_text(

            draw=draw,

            x_center=x + width / 2,

            y=y + (height - font.size) / 2 - 2,

            text=f"{percent}%",

            font=font,

            fill="#FFFFFF" if progress > 0.5 else PRIMARY,

        )

# ==========================================================
# BACKWARD COMPATIBILITY
# ==========================================================

draw_progress_bar = draw_progress        