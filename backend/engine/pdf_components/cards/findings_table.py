"""
PHI Design System

Findings Table

Thin wrapper around Table Card.
"""

from engine.pdf_components.cards.table_card import (
    draw_table_card,
)


def draw_findings_table(
    img,
    draw,
    x,
    y,
    width,
    height,
    title,
    rows,
    fonts,
):
    """
    Draw findings table.
    """

    draw_table_card(
        img=img,
        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        title=title,

        rows=rows,

        fonts=fonts,
    )