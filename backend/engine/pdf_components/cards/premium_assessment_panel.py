"""
PHI Design System

Premium Assessment Panel

Reusable assessment panel used by:

- Property Overview
- Floor Overview
- Room Analysis
"""

from PIL import Image as PILImage

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.primitives.icon import (
    draw_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
)

# ==========================================================
# LAYOUT
# ==========================================================

TOP_PADDING = 18

TITLE_GAP = 36

LEFT_COLUMN_WIDTH = 175

COLUMN_GAP = 24

IMAGE_HEIGHT = 250

PROPERTY_GAP = 44

# ==========================================================
# DRAW
# ==========================================================


def draw_premium_assessment_panel(
    img,
    draw,
    x,
    y,
    width,
    height,
    assessment,
    fonts,
):
    """
    Premium Assessment Panel.
    """

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    title_font = fonts["subtitle"]
    score_font = fonts["score"]
    caption_font = fonts["caption"]
    body_font = fonts["body"]

    # ------------------------------------------------------
    # Assessment
    # ------------------------------------------------------

    title = assessment.get("title", "")

    score = assessment.get("score", "-")

    status = assessment.get("status", "")

    color = assessment.get(
        "color",
        PRIMARY,
    )

    heatmap = assessment.get(
        "heatmap",
    )

    properties = assessment.get(
        "properties",
        [],
    )

    current_y = area["y"]

    # ------------------------------------------------------
    # TITLE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=title,
        font=title_font,
        fill=color,
    )

    current_y += TITLE_GAP

    # ------------------------------------------------------
    # SCORE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=f"{score}/100",
        font=score_font,
        fill=color,
    )

    current_y += 64

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=area["x"],
        y=current_y,
        text=str(status).upper(),
        font=title_font,
        fill=color,
    )

    current_y += 50

    # ------------------------------------------------------
    # PROPERTIES
    # ------------------------------------------------------

    for item in properties:

        draw_icon(
            img=img,
            x=area["x"],
            y=current_y + 2,
            icon=item.get("icon", "info"),
            size=18,
        )

        draw_text(
            draw=draw,
            x=area["x"] + 28,
            y=current_y,
            text=item.get("label", ""),
            font=caption_font,
            fill="#667085",
        )

        draw_text(
            draw=draw,
            x=area["x"] + 28,
            y=current_y + 18,
            text=item.get("value", ""),
            font=body_font,
            fill=TEXT,
        )

        current_y += PROPERTY_GAP

    # ------------------------------------------------------
    # HEATMAP
    # ------------------------------------------------------

    if heatmap:

        panel = heatmap.copy()

        available_width = (
            width
            - LEFT_COLUMN_WIDTH
            - COLUMN_GAP
            - 24
        )

        panel.thumbnail(
            (
                int(available_width),
                270,
            ),
            PILImage.Resampling.LANCZOS,
        )

        image_x = (
            area["x"]
            + LEFT_COLUMN_WIDTH
            + COLUMN_GAP
        )

        paste_x = image_x + (
            (
                width
                - LEFT_COLUMN_WIDTH
                - COLUMN_GAP
                - panel.width
            )
            / 2
        )

        paste_y = (
            area["y"]
            + TITLE_GAP
            + (
                IMAGE_HEIGHT
                - panel.height
            )
            / 2
        )

        img.paste(
            panel,
            (
                int(paste_x),
                int(paste_y),
            ),
            panel if panel.mode == "RGBA" else None,
        )

    return y + height