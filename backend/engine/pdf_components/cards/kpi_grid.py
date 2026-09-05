"""
PHI Design System

KPI Grid

Displays Metric Cards in a responsive grid.
"""

from engine.pdf_components.cards.metric_card import (
    draw_metric_card,
)

from engine.pdf_components.framework.constants import (
    COLUMN_GAP,
)


def draw_kpi_grid(
    draw,
    x,
    y,
    width,
    height,
    metrics,
    fonts,
    columns=4,
):
    """
    Draw KPI Grid.
    """

    card_width = (
        width
        - COLUMN_GAP * (columns - 1)
    ) / columns

    card_height = height

    xx = x

    for metric in metrics:

        draw_metric_card(
            draw=draw,

            x=xx,
            y=y,

            width=card_width,
            height=card_height,

            title=metric.get(
                "title",
                "",
            ),

            value=metric.get(
                "value",
                "",
            ),

            subtitle=metric.get(
                "subtitle",
                "",
            ),

            fonts=fonts,
        )

        xx += card_width + COLUMN_GAP