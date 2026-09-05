from engine.pdf_components.framework.colors import (
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
)


def draw_card_body(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill=TEXT,
    line_spacing=8,
):
    return draw_paragraph(
        draw=draw,
        x=x,
        y=y,
        width=width,
        text=text,
        font=font,
        fill=fill,
        line_spacing=line_spacing,
    )