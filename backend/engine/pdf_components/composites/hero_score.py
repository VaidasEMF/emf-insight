"""
PHI Design System

Hero Score Composite
"""

from engine.pdf_components.framework.colors import (
    TEXT_SECONDARY,
)

from engine.pdf_components.primitives.badge import (
    draw_badge,
)

from engine.pdf_components.primitives.chip import (
    draw_chip,
)

from engine.pdf_components.framework.theme import (
    HERO_SCORE_GAP,
    HERO_SECTION_GAP,
    CARD_PADDING,
)

# ==========================================================
# LAYOUT
# ==========================================================

FRACTION_GAP = 4

FRACTION_BASELINE_OFFSET = 26


# ==========================================================
# DRAW
# ==========================================================

def draw_hero_score(
    draw,
    x,
    y,
    width,
    score,
    label,
    badge,
    fill,
    score_font,
    risk_font,
    body_font,
    variant="default",
):
    """
    Draw Hero Score block.

    Returns
    -------
    int
        Bottom Y position.
    """

    center_x = x + width / 2

    current_y = y

   
    # ---------------------------------------------------------
    # ASSESSMENT VARIANT
    # ---------------------------------------------------------

    if variant == "assessment":

        center_x = x + width / 2

        # -----------------------------------------------------
        # SCORE
        # -----------------------------------------------------

        score_text = str(score)

        score_bbox = draw.textbbox(
            (0, 0),
            score_text,
            font=score_font,
        )

        score_width = (
            score_bbox[2]
            - score_bbox[0]
        )

        score_height = (
            score_bbox[3]
            - score_bbox[1]
        )

        score_x = (
            center_x
            - score_width / 2
        )

        score_y = y + 8

        draw.text(
            (
                score_x,
                score_y,
            ),
            score_text,
            font=score_font,
            fill=fill,
        )

        # -----------------------------------------------------
        # /100
        # -----------------------------------------------------

        fraction = "/100"

        fraction_bbox = draw.textbbox(
            (0, 0),
            fraction,
            font=body_font,
        )

        fraction_y = (
            score_y
            + score_height
            - 12
        )

        fraction_x = (
            score_x
            + score_width
            + 8
        )

        draw.text(
            (
                score_x
                + score_width
                + FRACTION_GAP,
                fraction_y,
            ),
            fraction,
            font=body_font,
            fill=TEXT_SECONDARY,
        )

        # -----------------------------------------------------
        # EXCELLENT BADGE
        # -----------------------------------------------------

        badge_text = str(label).upper()

        # Smaller font specifically for the assessment badge
        if hasattr(body_font, "font_variant"):
            assessment_badge_font = body_font.font_variant(
                size=max(
                    1,
                    int(body_font.size * 0.9),
                )
            )
        else:
            assessment_badge_font = body_font

        badge_size = draw.textbbox(
            (0, 0),
            badge_text,
            font=assessment_badge_font,
        )

        badge_width = (
            badge_size[2]
            - badge_size[0]
            + 18
        )

        badge_height = (
            badge_size[3]
            - badge_size[1]
            + 8
        )

        badge_x = (
            center_x
            - badge_width / 2
        )

        badge_y = (
            score_y
            + score_height
            + 26
        )

        draw.rounded_rectangle(
            (
                badge_x,
                badge_y,
                badge_x
                + badge_width,
                badge_y
                + badge_height,
            ),
            radius=6,
            fill=fill,
        )

        draw.text(
            (
                badge_x + 9,
                badge_y + 2,
            ),
            badge_text,
            font=assessment_badge_font,
            fill="#FFFFFF",
        )

        # -----------------------------------------------------
        # RF EXPOSURE CHIP
        # -----------------------------------------------------

        chip_text = str(
            badge or ""
        )

        chip_size = draw.textbbox(
            (0, 0),
            chip_text,
            font=body_font,
        )

        chip_width = (
            chip_size[2]
            - chip_size[0]
            + 14
        )

        chip_height = (
            chip_size[3]
            - chip_size[1]
            + 6
        )

        chip_x = (
            center_x
            - chip_width / 2
        )

        chip_y = (
            badge_y
            + badge_height
            + 10
        )

        draw.rounded_rectangle(
            (
                chip_x,
                chip_y,
                chip_x
                + chip_width,
                chip_y
                + chip_height,
            ),
            radius=6,
            outline=fill,
            width=1,
        )

        draw.text(
            (
                chip_x + 7,
                chip_y + 3,
            ),
            chip_text,
            font=body_font,
            fill=fill,
        )

        # -----------------------------------------------------
        # RETURN
        # -----------------------------------------------------

        return (
            chip_y
            + chip_height
            + CARD_PADDING
        )
    # ---------------------------------------------------------
    # SCORE
    # ---------------------------------------------------------

    score_text = str(score)

    score_bbox = draw.textbbox(
        (0, 0),
        score_text,
        font=score_font,
    )

    score_width = score_bbox[2] - score_bbox[0]

    score_x = center_x - score_width / 2

    draw.text(
        (
            score_x,
            current_y,
        ),
        score_text,
        font=score_font,
        fill=fill,
    )

    # ---------------------------------------------------------
    # /100
    # ---------------------------------------------------------

    fraction = "/100"

    fraction_bbox = draw.textbbox(
        (0, 0),
        fraction,
        font=body_font,
    )

    fraction_x = (
        score_x
        + score_width
        + FRACTION_GAP
    )

    fraction_y = (
        current_y
        + score_font.size
        - 10
    )

    draw.text(
        (
            fraction_x,
            fraction_y,
        ),
        fraction,
        font=body_font,
        fill=TEXT_SECONDARY,
    )

    # ---------------------------------------------------------
    # BADGE
    # ---------------------------------------------------------

    badge_y = (
        current_y
        + score_font.size
        + HERO_SCORE_GAP
    )

    badge_size = draw.textbbox(
        (0, 0),
        str(label).upper(),
        font=risk_font,
    )

    badge_width = (
        badge_size[2]
        - badge_size[0]
        + 6
    )

    badge_height = (
        badge_size[3]
        - badge_size[1]
        + 4
    )

    badge_x = center_x - badge_width / 2

    


    draw_badge(
        draw=draw,
        x=badge_x,
        y=badge_y,
        text=str(label).upper(),
        font=risk_font,
        fill=fill,
    )

    

    # ---------------------------------------------------------
    # CHIP
    # ---------------------------------------------------------

    chip_y = (
        badge_y
        + risk_font.size
        + HERO_SECTION_GAP
    )

    chip_size = draw.textbbox(
        (0, 0),
        badge,
        font=body_font,
    )

    chip_width = (
        (chip_size[2] - chip_size[0])
        + 28
    )

    chip_x = center_x - chip_width / 2

    draw_chip(
        draw=draw,
        x=chip_x,
        y=chip_y,
        text=badge,
        font=body_font,
        color=fill,
    )

    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return (
        chip_y
        + body_font.size
        + CARD_PADDING
    )