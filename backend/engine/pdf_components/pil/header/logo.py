"""
PHI Logo
"""

from engine.pdf_components.primitives.panel import (
    draw_panel,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    WHITE,
)


def draw_logo(
    draw,
    x,
    y,
    size,
    font,
    text="PHI",
):
    """
    Draw PHI logo placeholder.
    """

    draw_panel(
        draw=draw,
        x=x,
        y=y,
        width=size,
        height=size,
        fill=WHITE,
        border=PRIMARY,
        radius=18,
        shadow=False,
    )

    draw_center_text(
        draw=draw,
        x_center=x + size / 2,
        y=y + size / 2 - font.size / 2,
        text=text,
        font=font,
        fill=PRIMARY,
    )