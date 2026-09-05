from engine.pdf_components.cards.table_card import (
    draw_table_card,
)


def draw_info_table(
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