from PIL import ImageDraw

from ...framework.colors import (
    CARD_BG,
    CARD_BORDER,
)

def draw_card(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    width,
    height,
    radius=16,
    fill=CARD_BG,
    border=CARD_BORDER,
    border_width=2,
):
    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=radius,
        fill=fill,
        outline=border,
        width=border_width,
    )


def draw_divider(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    width,
    color=CARD_BORDER,
):
    draw.line(
        (
            x,
            y,
            x + width,
            y,
        ),
        fill=color,
        width=1,
    )