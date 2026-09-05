"""
PHI Design System

Premium Coverage Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.coverage_ring import (
    draw_coverage_ring,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)

HEADER_GAP = 14
DIVIDER_GAP = 18


def draw_premium_coverage_card(
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
    Premium Coverage Card.
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
        text=coverage["description"],
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
    # COVERAGE
    # ------------------------------------------------------

    current_y = draw_coverage_ring(
        draw=draw,
        x=area["x"] + (area["width"] - 116) / 2,
        y=current_y,
        measured=coverage["measured"],
        unmeasured=coverage["unmeasured"],
        fonts=fonts,
    )

    return current_y