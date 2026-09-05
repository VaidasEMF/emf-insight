"""
PHI Design System

Property Exposure Overview Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
    BORDER,
    SUCCESS,
    WARNING,
    DANGER,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)


# ==========================================================
# LAYOUT
# ==========================================================

TOP_PADDING = 12
HEADER_GAP = 8

NUMBER_WIDTH = 22
TEXT_GAP = 16

ROW_HEIGHT = 72
ROW_GAP = 6

BOTTOM_PADDING = 18


# ==========================================================
# HELPERS
# ==========================================================

def _get_exposure_color(index):
    """
    Return visual severity color for exposure area number.
    """

    colors = [
        DANGER,
        WARNING,
        WARNING,
        SUCCESS,
        SUCCESS,
        SUCCESS,
    ]

    if index < len(colors):
        return colors[index]

    return SUCCESS


# ==========================================================
# CARD
# ==========================================================

def draw_property_exposure_areas_card(
    img,
    draw,
    project,
    analysis,
    fonts,
    x,
    y,
    width,
):
    """
    Draw Key Exposure Areas card.

    Height is calculated dynamically from
    the number of exposure areas.
    """

    # ======================================================
    # DATA
    # ======================================================

    areas = [
        (
            "Living Room",
            "Highest exposure detected in this area.",
        ),
        (
            "Electrical Panel Area",
            "Elevated exposure near electrical distribution.",
        ),
        (
            "Office / Study",
            "Moderate exposure from nearby sources.",
        ),
        (
            "Kitchen & Dining",
            "Lower exposure levels detected.",
        ),
    ]

    # ======================================================
    # HEADER HEIGHT
    # ======================================================

    header_height = (
        fonts["subtitle"].size
        + HEADER_GAP
    )

    # ======================================================
    # CARD HEIGHT
    # ======================================================

    card_height = (
        TOP_PADDING
        + header_height
        + 6
        + (
            len(areas)
            * ROW_HEIGHT
        )
        + (
            max(
                0,
                len(areas) - 1,
            )
            * ROW_GAP
        )
        + BOTTOM_PADDING
    )

    # ======================================================
    # CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=card_height,
    )

    current_y = area["y"]

    # ======================================================
    # HEADER
    # ======================================================

    current_y = draw_card_header(
        draw=draw,
        img=img,
        icon=get_icon("location"),
        x=area["x"],
        y=current_y,
        title="KEY EXPOSURE AREAS",
        font=fonts["subtitle"],
        color=PRIMARY,
    )

    current_y += 10

    # ======================================================
    # EXPOSURE AREAS
    # ======================================================

    for index, (
        title,
        description,
    ) in enumerate(areas):

        # --------------------------------------------------
        # NUMBER CIRCLE
        # --------------------------------------------------

        number_center_x = (
            area["x"]
            + NUMBER_WIDTH / 2
        )

        number_center_y = (
            current_y
            + 10
        )

        number_radius = 10

        draw.ellipse(
            (
                int(
                    number_center_x
                    - number_radius
                ),
                int(
                    number_center_y
                    - number_radius
                ),
                int(
                    number_center_x
                    + number_radius
                ),
                int(
                    number_center_y
                    + number_radius
                ),
            ),
            fill=_get_exposure_color(
                index
            ),
        )

        draw_text(
            draw=draw,
            x=number_center_x,
            y=current_y + 10,
            text=str(index + 1),
            font=fonts["caption"],
            fill=(255, 255, 255),
            anchor="mm",
        )

        # --------------------------------------------------
        # TEXT POSITION
        # --------------------------------------------------

        text_x = (
            area["x"]
            + NUMBER_WIDTH
            + TEXT_GAP
        )

        # --------------------------------------------------
        # TITLE
        # --------------------------------------------------

        draw_text(
            draw=draw,
            x=text_x,
            y=current_y,
            text=title,
            font=fonts["body"],
            fill=PRIMARY,
        )

        # --------------------------------------------------
        # DESCRIPTION
        # --------------------------------------------------

        draw_paragraph(
            draw=draw,
            x=text_x,
            y=current_y + 20,
            width=(
                area["width"]
                - NUMBER_WIDTH
                - TEXT_GAP
            ),
            text=description,
            font=fonts["caption"],
            fill=TEXT_SECONDARY,
            line_spacing=3,
        )

        current_y += ROW_HEIGHT

        # --------------------------------------------------
        # DIVIDER
        # --------------------------------------------------

        if index < len(areas) - 1:

            draw_horizontal_divider(
                draw=draw,
                x=text_x,
                y=current_y,
                width=(
                    area["width"]
                    - NUMBER_WIDTH
                    - TEXT_GAP
                ),
                color=BORDER,
            )

            current_y += ROW_GAP

    # ======================================================
    # RETURN
    # ======================================================

    return y + card_height