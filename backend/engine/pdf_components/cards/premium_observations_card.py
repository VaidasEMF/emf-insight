"""
PHI Design System

Premium Observations Card
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

from engine.pdf_components.composites.observation_item import (
    draw_observation_item,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 14
DIVIDER_GAP = 18

ITEM_GAP = 6

TOP_PADDING = 0
BOTTOM_PADDING = 20

LINE_GAP = 6

MIN_ITEM_HEIGHT = 54


# ==========================================================
# CARD
# ==========================================================

def draw_premium_observations_card(
    img,
    draw,
    x,
    y,
    width,
    observations,
    fonts,
    height=None,
):
    """
    Premium Observations Card.

    Height is calculated dynamically from the
    actual observation content.

    Returns
    -------
    int
        Actual bottom Y position.
    """

    observations = observations or []

    # ======================================================
    # FONTS
    # ======================================================

    title_font = (
        fonts.get("subtitle")
        or fonts.get("title")
        or fonts.get("body")
    )

    body_font = (
        fonts.get("body")
        or fonts.get("caption")
        or fonts.get("small")
    )

    # ======================================================
    # HEADER
    # ======================================================

    header_height = max(
        title_font.size,
        34,
    )

    # ======================================================
    # DESCRIPTION
    # ======================================================

    description = (
        "Key findings identified during the "
        "property heatmap assessment."
    )

    description_width = width

    description_lines = FontManager.wrap_text(
        draw=draw,
        text=description,
        font=body_font,
        width=description_width,
    )

    if not description_lines:
        description_lines = [description]

    description_height = (
        len(description_lines)
        * (
            body_font.size
            + LINE_GAP
        )
    )

    # ======================================================
    # OBSERVATION HEIGHT
    # ======================================================
    #
    # We estimate the minimum height needed for each
    # observation from its text. The actual draw function
    # remains responsible for rendering the content.
    #

    measured_observations_height = 0

    for observation in observations:

        if isinstance(observation, dict):

            text = (
                observation.get("text")
                or observation.get("description")
                or observation.get("summary")
                or observation.get("title")
                or ""
            )

        else:

            text = str(observation)

        text = str(text).strip()

        if not text:
            continue

        lines = FontManager.wrap_text(
            draw=draw,
            text=text,
            font=body_font,
            width=width,
        )

        if not lines:
            lines = [text]

        text_height = (
            len(lines)
            * (
                body_font.size
                + LINE_GAP
            )
        )

        item_height = max(
            MIN_ITEM_HEIGHT,
            text_height + 28,
        )

        measured_observations_height += (
            item_height
        )

        measured_observations_height += (
            ITEM_GAP
        )

    # Remove final gap
    if observations:
        measured_observations_height = max(
            0,
            measured_observations_height
            - ITEM_GAP,
        )

    # ======================================================
    # CALCULATE HEIGHT
    # ======================================================

    calculated_height = (

        TOP_PADDING

        + header_height

        + HEADER_GAP

        + description_height

        + HEADER_GAP

        + 1

        + DIVIDER_GAP

        + measured_observations_height

        + BOTTOM_PADDING
    )

    # ======================================================
    # FINAL HEIGHT
    # ======================================================

    if height is not None:

        actual_height = max(
            int(height),
            calculated_height,
        )

    else:

        actual_height = calculated_height

    # ======================================================
    # DEBUG
    # ======================================================

    print("=" * 70)
    print("PREMIUM OBSERVATIONS CARD")
    print("X:", x)
    print("Y:", y)
    print("WIDTH:", width)
    print("OBSERVATIONS:", len(observations))
    print("CALCULATED HEIGHT:", calculated_height)
    print("FINAL HEIGHT:", actual_height)
    print("=" * 70)

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
        icon=get_icon("observation"),
        x=area["x"],
        y=current_y,
        title="KEY OBSERVATIONS",
        font=title_font,
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
        text=description,
        font=body_font,
        line_spacing=LINE_GAP,
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
    # OBSERVATIONS
    # ======================================================

    for index, item in enumerate(
        observations
    ):

        current_y = draw_observation_item(
            img=img,
            draw=draw,
            x=area["x"],
            y=current_y,
            width=area["width"],
            observation=item,
            fonts=fonts,
        )

        if index < len(observations) - 1:
            current_y += ITEM_GAP

    # ======================================================
    # RETURN
    # ======================================================

    return max(
        y + actual_height,
        current_y + BOTTOM_PADDING,
    )