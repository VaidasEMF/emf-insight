"""
PHI Design System

Coverage Ring Composite
"""

from engine.pdf_components.framework.typography import (
    draw_center_text,
    draw_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
)

RADIUS = 58


def draw_coverage_ring(
    draw,
    x,
    y,
    measured,
    unmeasured,
    fonts,
):
    """
    Draw coverage indicator.

    TODO:
    Replace with true donut chart.
    """

    # Placeholder circle
    draw.ellipse(
        (
            x,
            y,
            x + RADIUS * 2,
            y + RADIUS * 2,
        ),
        outline=PRIMARY,
        width=4,
    )

    draw_center_text(
        draw=draw,
        x_center=x + RADIUS,
        y=y + 36,
        text=f"{measured:.0f}%",
        font=fonts["subtitle"],
        fill=PRIMARY,
    )

    draw_text(
        draw=draw,
        x=x,
        y=y + 140,
        text=f"Measured: {measured:.0f}%",
        font=fonts["body"],
        fill=TEXT_SECONDARY,
    )

    draw_text(
        draw=draw,
        x=x,
        y=y + 164,
        text=f"Unmeasured: {unmeasured:.0f}%",
        font=fonts["body"],
        fill=TEXT_SECONDARY,
    )

    return y + 190