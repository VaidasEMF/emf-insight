"""
Property Heatmap Block

Renders the main floor-level heatmap
for the Property Overview page.

The block is responsible only for presentation.
"""

from engine.pdf_components.cards.heatmap_card import (
    draw_heatmap_card,
)


# ==========================================================
# DRAW
# ==========================================================

def draw_property_heatmap(
    img,
    draw,
    heatmap,
    x,
    y,
    width,
    floor,
    fonts,
    sources=None,
):
    """
    Draw the main floor-level heatmap.

    Property Overview uses one large floor heatmap
    with the Primary EMF Sources panel on the right.

    The card calculates its own height dynamically.
    """

    return draw_heatmap_card(
        img=img,
        draw=draw,

        heatmap=(
            heatmap.get("sbm")
            if heatmap
            else None
        ),

        x=x,
        y=y,

        width=width,

        # IMPORTANT:
        # Heatmap card calculates its own height.
        height=None,

        title="FLOOR — " + str(floor),

        subtitle=(
            "Visual overview of electromagnetic "
            "exposure across the assessed floor."
        ),

        floor=floor,

        fonts=fonts,

        sources=sources or [],
    )