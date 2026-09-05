"""
PHI Design System

Score Block Composite

Reusable score presentation block.
"""

from engine.pdf_components.framework.typography import (
    draw_text,
)


from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
    SUCCESS,
    WARNING,
    DANGER,
)

from engine.pdf_components.primitives.progress_bar import (
    draw_progress,
)



LABEL_Y = 0
VALUE_Y = 22
STATUS_Y = 46
BAR_Y = 72

BAR_WIDTH = 96
BAR_HEIGHT = 8

BOTTOM_PADDING = 12


def draw_score_block(
    draw,
    x,
    y,
    label,
    score,
    status,
    color,
    fonts,
):
    """
    Draw single score block.
    """

    

    body_font = fonts["body"]
    small_font = fonts["small"]

    # ------------------------------------------------------
    # LABEL
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x,
        y=y + LABEL_Y,
        text=label,
        font=small_font,
        fill=color,
    )

    # ------------------------------------------------------
    # SCORE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x,
        y=y + VALUE_Y,
        text=f"{score} /100",
        font=body_font,
        fill=TEXT,
    )

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x,
        y=y + STATUS_Y,
        text=status,
        font=small_font,
        fill=TEXT_SECONDARY,
    )

    # ------------------------------------------------------
    # BAR
    # ------------------------------------------------------

    variant = "primary"

    if color == SUCCESS:
        variant = "success"
    elif color == WARNING:
        variant = "warning"
    elif color == DANGER:
        variant = "danger"

    draw_progress(
        draw=draw,
        x=x,
        y=y + BAR_Y,
        width=BAR_WIDTH,
        height=BAR_HEIGHT,
        value=float(score),
        maximum=100,
        variant=variant,
        show_label=False,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------

    return (
        y
        + BAR_Y
        + BAR_HEIGHT
        + BOTTOM_PADDING
    )