"""
Recommendations KPI Row
"""

from engine.pdf_components.cards.kpi_grid import (
    draw_kpi_grid,
)

from engine.pdf_layouts.recommendations_layout import (
    KPI_GRID_X,
    KPI_GRID_Y,
    KPI_GRID_WIDTH,
    KPI_GRID_HEIGHT,
)


def draw_recommendations_kpi(
    draw,
    analysis,
    fonts,
):
    """
    Recommendations KPI row.
    """

    metrics = [

        {

            "title": "HIGH PRIORITY",

            "value": analysis.get(
                "high_priority_count",
                0,
            ),

            "subtitle": "Action Recommended",

        },

        {

            "title": "MODERATE PRIORITY",

            "value": analysis.get(
                "moderate_priority_count",
                0,
            ),

            "subtitle": "Optimization Suggested",

        },

        {

            "title": "LOW PRIORITY",

            "value": analysis.get(
                "low_priority_count",
                0,
            ),

            "subtitle": "Good Practices",

        },

        {

            "title": "TOTAL",

            "value": analysis.get(
                "recommendation_count",
                0,
            ),

            "subtitle": "Across All Areas",

        },

    ]

    draw_kpi_grid(

        draw=draw,

        x=KPI_GRID_X,
        y=KPI_GRID_Y,

        width=KPI_GRID_WIDTH,
        height=KPI_GRID_HEIGHT,

        metrics=metrics,

        fonts=fonts,

    )