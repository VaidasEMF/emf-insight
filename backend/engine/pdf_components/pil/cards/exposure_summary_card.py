from PIL import ImageDraw

from .base_card import (
    draw_card,
)

from ...framework.colors import (
    PRIMARY,
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
    SECONDARY_TEXT,
)


def _risk_color(label: str):

    label = (label or "").upper()

    if "LOW" in label:
        return SUCCESS

    if "MODERATE" in label:
        return WARNING

    if "HIGH" in label:
        return DANGER

    return PRIMARY


def draw_exposure_summary_card(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    width,
    height,
    title,
    score,
    classification,
    worst_room,
    measurement_height,
    title_font,
    subtitle_font,
    score_font,
    body_font,
):
    """
    Exposure Summary Card.

    Used by:
        • Executive Summary
        • Exposure Overview
        • Future comparison reports
    """

    draw_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    padding = 24

    current_y = y + padding

    # ---------------------------------------------------------
    # TITLE
    # ---------------------------------------------------------

    draw.text(
        (x + padding, current_y),
        title,
        font=title_font,
        fill=PRIMARY,
    )

    current_y += 42

    # ---------------------------------------------------------
    # SCORE
    # ---------------------------------------------------------

    draw.text(
        (x + padding, current_y),
        f"{round(score)}/100",
        font=score_font,
        fill=TEXT,
    )

    current_y += 62

    # ---------------------------------------------------------
    # CLASSIFICATION
    # ---------------------------------------------------------

    draw.text(
        (x + padding, current_y),
        classification.upper(),
        font=subtitle_font,
        fill=_risk_color(classification),
    )

    current_y += 42

    # ---------------------------------------------------------
    # DETAILS
    # ---------------------------------------------------------

    draw.text(
        (x + padding, current_y),
        f"Worst Area: {worst_room}",
        font=body_font,
        fill=TEXT,
    )

    current_y += 28

    draw.text(
        (x + padding, current_y),
        f"Measurement Height: {measurement_height}",
        font=body_font,
        fill=TEXT,
    )

    current_y += 36

    # ---------------------------------------------------------
    # DIVIDER
    # ---------------------------------------------------------

    draw.line(
        (
            x + padding,
            current_y,
            x + width - padding,
            current_y,
        ),
        fill=SECONDARY_TEXT,
        width=1,
    )