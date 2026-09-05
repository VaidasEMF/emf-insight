"""
PHI Design System

Premium Measurement Coverage Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.primitives.progress_bar import (
    draw_progress,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    BORDER,
    TEXT,
    TEXT_SECONDARY,
)

HEADER_GAP = 14
DIVIDER_GAP = 18
ROW_HEIGHT = 34
BAR_HEIGHT = 10


def draw_premium_measurement_coverage_card(
    img,
    draw,
    x,
    y,
    width,
    height,
    coverage,
    fonts,
):
    """
    Professional Measurement Coverage Card.
    """

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    current_y = area["y"]

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    current_y = draw_card_header(
        draw=draw,
        img=img,
        icon=get_icon("coverage"),
        x=area["x"],
        y=current_y,
        title="MEASUREMENT COVERAGE",
        font=fonts["subtitle"],
        color=PRIMARY,
    )

    current_y = draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        text=(
            "Coverage indicates how completely the room "
            "was measured during the survey."
        ),
        font=fonts["body"],
        line_spacing=6,
    )

    current_y += HEADER_GAP

    draw_horizontal_divider(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        color=BORDER,
    )

    current_y += DIVIDER_GAP

    # ------------------------------------------------------
    # COVERAGE BAR
    # ------------------------------------------------------

    draw_progress(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        height=BAR_HEIGHT,
        value=coverage["percent"],
        maximum=100,
        variant="success",
        show_label=True,
    )

    current_y += 34

    # ------------------------------------------------------
    # DETAILS
    # ------------------------------------------------------

    rows = [

        (
            "Measured Points",
            coverage["measured_points"],
        ),

        (
            "Grid Spacing",
            coverage["grid_spacing"],
        ),

        (
            "Coverage",
            f'{coverage["percent"]}%',
        ),

        (
            "Confidence",
            coverage["confidence"],
        ),

    ]

    body_font = fonts["body"]

    for label, value in rows:

        draw_text(
            draw=draw,
            x=area["x"],
            y=current_y,
            text=label,
            font=body_font,
            fill=TEXT_SECONDARY,
        )

        draw_text(
            draw=draw,
            x=area["x"] + 170,
            y=current_y,
            text=str(value),
            font=body_font,
            fill=TEXT,
        )

        current_y += ROW_HEIGHT

    return y + height