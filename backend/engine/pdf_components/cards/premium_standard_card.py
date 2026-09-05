"""
PHI Design System

Premium Standard Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.standard_item import (
    draw_standard_item,
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
SECTION_GAP = 18


def draw_premium_standard_card(
    img,
    draw,
    x,
    y,
    width,
    height,
    standards,
    fonts,
):
    """
    Premium Assessment Standards Card.
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
        icon=get_icon("shield"),
        x=area["x"],
        y=current_y,
        title="ASSESSMENT STANDARDS",
        font=fonts["subtitle"],
        color=PRIMARY,
    )

    current_y = draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"],
        text=(
            "Comparison of biological and regulatory "
            "exposure assessment frameworks."
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
    # STANDARDS
    # ------------------------------------------------------

    for standard in standards:

        current_y = draw_standard_item(
            img=img,
            draw=draw,

            x=area["x"],
            y=current_y,

            width=area["width"],

            standard=standard,

            fonts=fonts,
        )

        current_y += SECTION_GAP

    return current_y