"""
Heatmap Comparison Block
"""

from engine.pdf_components.cards.premium_heatmap_card import (
    draw_premium_heatmap_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
)

from engine.pdf_layouts.heatmap_layout import (
    HEATMAP_CARD_X,
    HEATMAP_CARD_Y,
    HEATMAP_CARD_WIDTH,
    HEATMAP_CARD_HEIGHT,
)


def draw_heatmap_comparison(
    img,
    draw,
    analysis,
    fonts,
):
    """
    Draw Premium Heatmap Comparison.
    """

    return draw_premium_heatmap_card(

        img=img,
        draw=draw,

        x=HEATMAP_CARD_X,
        y=HEATMAP_CARD_Y,

        width=HEATMAP_CARD_WIDTH,
        height=HEATMAP_CARD_HEIGHT,

        title="EXPOSURE HEATMAP COMPARISON",

        subtitle=(
            "Heatmaps visualize electromagnetic exposure "
            "distribution across the property using both "
            "biological (SBM) and regulatory (ICNIRP) "
            "assessment models."
        ),

        legend=[
            ("#33C46B", "Low"),
            ("#FFD84A", "Moderate"),
            ("#FF9B2F", "Elevated"),
            ("#EA4335", "High"),
        ],

        left_title="SBM Assessment",
        left_image=analysis.get("sbm_heatmap"),
        left_score=analysis.get("sbm_score", "-"),
        left_status=analysis.get("risk_level", "-"),
        left_footer="Biological Building Biology Standard",
        left_color=PRIMARY,

        right_title="ICNIRP Assessment",
        right_image=analysis.get("icnirp_heatmap"),
        right_score=analysis.get("icnirp_score", "-"),
        right_status="Compliant",
        right_footer="International Regulatory Standard",
        right_color=SUCCESS,

        fonts=fonts,
    )