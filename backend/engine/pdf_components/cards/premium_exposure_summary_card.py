"""
PHI Design System

Premium Exposure Summary Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.exposure_summary_item import (
    draw_exposure_summary_item,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
    draw_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
    TEXT,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 10
DIVIDER_GAP = 10

ROW_GAP = 6

HEADER_HEIGHT = 30
DESCRIPTION_HEIGHT = 32
DIVIDER_HEIGHT = 1

ROW_HEIGHT = 48

TOP_PADDING = 0
BOTTOM_PADDING = 12


# ==========================================================
# DRAW
# ==========================================================

def draw_premium_exposure_summary_card(
    img,
    draw,
    x,
    y,
    width,
    metrics,
    fonts,
    height=None,
):
    """
    Premium Exposure Summary Card.

    Compact three-row exposure overview.

    Returns
    -------
    int
        Actual bottom Y position.
    """

    metrics = metrics or []

    # ======================================================
    # CALCULATE HEIGHT
    # ======================================================

    actual_height = (
        HEADER_HEIGHT
        + HEADER_GAP
        + DESCRIPTION_HEIGHT
        + DIVIDER_HEIGHT
        + DIVIDER_GAP

        # Exposure rows
        + (
            len(metrics)
            * ROW_HEIGHT
        )
        + (
            max(
                0,
                len(metrics) - 1,
            )
            * ROW_GAP
        )

        # About scores
        + 10
        + DIVIDER_HEIGHT
        + 10
        + fonts["subtitle"].size
        + 6
        + 70

        + BOTTOM_PADDING
    )

    # ======================================================
    # HEIGHT
    # ======================================================

    calculated_height = actual_height

    if height is not None:
        actual_height = int(height)
    else:
        actual_height = calculated_height

    # ======================================================
    # CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    current_y = area["y"]

    # ======================================================
    # HEADER
    # ======================================================

    current_y = draw_card_header(
        draw=draw,
        img=img,
        icon=None,
        x=area["x"],
        y=current_y,
        title="EXPOSURE OVERVIEW",
        font=fonts["subtitle"],
        color=PRIMARY,
    )

    # ======================================================
    # DESCRIPTION
    # ======================================================

    current_y = draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        text=(
            "Comparison of electromagnetic exposure "
            "categories assessed during the survey."
        ),
        font=fonts["body"],
        line_spacing=5,
    )

    current_y += HEADER_GAP

    # ======================================================
    # DIVIDER
    # ======================================================

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        color=BORDER,
    )

    current_y += DIVIDER_GAP

    # ======================================================
    # ROWS
    # ======================================================

    for index, metric in enumerate(metrics):

        current_y = draw_exposure_summary_item(
            img=img,
            draw=draw,
            x=area["x"],
            y=current_y,
            width=area["width"],
            metric=metric,
            fonts=fonts,
        )

        if index < len(metrics) - 1:
            current_y += ROW_GAP

    # ======================================================
    # ABOUT THE SCORES
    # ======================================================

    current_y += 10

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        color=BORDER,
    )

    current_y += 10

    draw_png_icon(
        img=img,
        icon_file="info.png",
        x=area["x"],
        y=current_y - 6,
        size=44,
    )

    draw_text(
        draw=draw,
        x=area["x"] + 52,
        y=current_y,
        text="ABOUT THE SCORES",
        font=fonts["body"],
        fill=PRIMARY,
    )

    current_y += (
        fonts["body"].size
        + 4
    )

    draw_paragraph(
        draw=draw,
        x=area["x"] + 52,
        y=current_y,
        width=area["width"] - 52,
        text=(
            "Each score (0–100) reflects the exposure level "
            "for that category. Higher scores indicate lower "
            "exposure and a better result."
        ),
        font=fonts["body"],
        fill=TEXT,
        line_spacing=4,
    )

    # ======================================================
    # RETURN
    # ======================================================

    return y + actual_height