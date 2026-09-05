"""
Heatmap Statistics Block
"""

from engine.pdf_components.cards.kpi_grid import (
    draw_kpi_grid,
)

from engine.pdf_layouts.heatmap_layout import (
    KPI_GRID_X,
    KPI_GRID_Y,
    KPI_GRID_WIDTH,
    KPI_GRID_HEIGHT,
)


def draw_heatmap_statistics(
    draw,
    statistics,
    fonts,
):
    """
    Heatmap KPI row.
    """

    cards = [

        {
            "title": "MAX LEVEL",
            "value": statistics.get("max_level", "-"),
        },

        {
            "title": "AVERAGE",
            "value": statistics.get("average", "-"),
        },

        {
            "title": "COVERAGE",
            "value": statistics.get("coverage", "-"),
        },

        {
            "title": "HOTSPOTS",
            "value": statistics.get("hotspots", "-"),
        },

    ]

    draw_kpi_grid(
        draw=draw,
        x=KPI_GRID_X,
        y=KPI_GRID_Y,
        width=KPI_GRID_WIDTH,
        height=KPI_GRID_HEIGHT,
        metrics=cards,
        fonts=fonts,
    )