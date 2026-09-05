"""
PHI Design System

Exposure Summary Item

Compact exposure summary row used by:

- Property Overview
- Assessment Summary
"""

from engine.pdf_components.primitives.icon import (
    draw_icon,
)

from engine.pdf_components.primitives.status import (
    draw_status,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    ORANGE,
)


# ==========================================================
# LAYOUT
# ==========================================================

ICON_SIZE = 46

ICON_TEXT_GAP = 12

TITLE_SCORE_GAP = 6

SCORE_WIDTH = 82

STATUS_WIDTH = 70

ROW_HEIGHT = 48


# ==========================================================
# DRAW
# ==========================================================

def draw_exposure_summary_item(
    img,
    draw,
    x,
    y,
    width,
    metric,
    fonts,
):
    """
    Compact exposure summary row.
    """

    title_font = fonts["body"]
    small_font = fonts["small"]
    score_font = fonts["subtitle"]

    # ======================================================
    # ICON
    # ======================================================

    icon_name = metric.get(
        "icon",
        "spectrum",
    )

    draw_icon(
        img=img,
        x=x,
        y=y + 5,
        icon=icon_name,
        size=ICON_SIZE,
    )

    # ======================================================
    # TITLE POSITION
    # ======================================================

    text_x = (
        x
        + ICON_SIZE
        + ICON_TEXT_GAP
    )

    # ======================================================
    # TITLE — VERTICAL CENTER WITH ICON
    # ======================================================

    bbox = draw.textbbox(
        (0, 0),
        metric.get(
            "title",
            "",
        ),
        font=title_font,
    )

    text_height = (
        bbox[3]
        - bbox[1]
    )

    text_y = (
        y
        + (
            ICON_SIZE
            - text_height
        ) / 2
        - bbox[1]
    )

    draw_text(
        draw=draw,
        x=text_x,
        y=text_y,
        text=metric.get(
            "title",
            "",
        ),
        font=title_font,
        fill=PRIMARY,
    )
    # ======================================================
    # SCORE
    # ======================================================

    sbm = metric.get(
        "sbm",
        {},
    )

    score = sbm.get(
        "score",
        "-",
    )

    score_text = (
        f"{score}/100"
        if score != "-"
        else "-"
    )

    score_font = fonts["subtitle"]

    score_x = (
        x
        + width
        - STATUS_WIDTH
        - SCORE_WIDTH
        - 12
    )

    score_bbox = draw.textbbox(
        (0, 0),
        score_text,
        font=score_font,
    )

    score_height = (
        score_bbox[3]
        - score_bbox[1]
    )

    score_y = (
        y
        + (
            ICON_SIZE
            - score_height
        ) / 2
        - score_bbox[1]
    )

    draw_text(
        draw=draw,
        x=score_x,
        y=score_y,
        text=score_text,
        font=score_font,
        fill=PRIMARY,
    )
    # ======================================================
    # STATUS
    # ======================================================

    status = sbm.get(
        "status",
        "",
    )

    small_font = fonts["small"]

    status_x = (
        x
        + width
        - STATUS_WIDTH
    )

    status_y = (
        y
        + (
            ICON_SIZE
            - small_font.size
        ) / 2
    )

    status_color = (
        ORANGE
        if status == "Moderate"
        else SUCCESS
        if status == "Good"
        else PRIMARY
    )

    draw_text(
        draw=draw,
        x=status_x,
        y=status_y,
        text=status,
        font=small_font,
        fill=status_color,
    )
                
    # ======================================================
    # RETURN
    # ======================================================

    return y + ROW_HEIGHT