"""
PHI Design System

Card Primitive

Low-level drawing primitive.

Responsibilities:

- rounded rectangle
- border
- shadow

No titles.
No padding.
No content.
"""

from engine.pdf_components.framework.colors import (
    WHITE,
    BORDER,
)

from engine.pdf_components.framework.constants import (
    PANEL_RADIUS,
    BORDER_WIDTH,
    SHADOW_OFFSET,
)


def draw_card(
    draw,
    x,
    y,
    width,
    height,
    radius=PANEL_RADIUS,
    fill=WHITE,
    border_color=BORDER,
    border_width=BORDER_WIDTH,
    shadow=True,
):
    """
    Draw card primitive.
    """

    # ---------------------------------------------------------
    # Shadow
    # ---------------------------------------------------------

    if shadow:

        try:

            draw.rounded_rectangle(

                (
                    x + SHADOW_OFFSET,
                    y + SHADOW_OFFSET,
                    x + width + SHADOW_OFFSET,
                    y + height + SHADOW_OFFSET,
                ),

                radius=radius,

                fill=(0, 0, 0, 18),

            )

        except Exception:

            pass

    # ---------------------------------------------------------
    # Card
    # ---------------------------------------------------------

    draw.rounded_rectangle(

        (
            x,
            y,
            x + width,
            y + height,
        ),

        radius=radius,

        fill=fill,

        outline=border_color,

        width=border_width,

    )


def get_content_box(
    x,
    y,
    width,
    height,
    padding_x,
    padding_y,
):
    """
    Returns drawable content box.
    """

    return {

        "x": x + padding_x,

        "y": y + padding_y,

        "width": width - padding_x * 2,

        "height": height - padding_y * 2,

    }