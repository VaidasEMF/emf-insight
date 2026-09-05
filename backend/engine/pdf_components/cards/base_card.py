"""
PHI Design System

Base Card

Responsible only for drawing the card surface.
Does NOT draw headers, footers or content.
"""

from engine.pdf_components.primitives.shadow import (
    draw_shadow,
)

from engine.pdf_components.primitives.surface import (
    draw_surface,
)

from engine.pdf_components.primitives.border import (
    draw_border,
)

from engine.pdf_components.framework.colors import (
    CARD_BACKGROUND,
    BORDER,
)

from engine.pdf_components.framework.theme import (
    CARD_PADDING,
)


def draw_base_card(
    draw,
    x,
    y,
    width,
    height=None,
):
    """
    Draw card container.

    Returns
    -------
    dict
        Inner content area.
    """

    if height is None:
        raise ValueError(
            "Card height must be specified."
        )

    # ---------------------------------------------------------
    # Shadow
    # ---------------------------------------------------------

    draw_shadow(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ---------------------------------------------------------
    # Surface
    # ---------------------------------------------------------

    draw_surface(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
        fill=CARD_BACKGROUND,
    )

    # ---------------------------------------------------------
    # Border
    # ---------------------------------------------------------

    draw_border(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
        color=BORDER,
    )

    # ---------------------------------------------------------
    # Content Area
    # ---------------------------------------------------------

    area = {

        "x": x + CARD_PADDING,

        "y": y + CARD_PADDING,

        "width": width - CARD_PADDING * 2,

        "height": height - CARD_PADDING * 2,

    }

  

    return area