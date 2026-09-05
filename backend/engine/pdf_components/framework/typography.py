"""
Premium PDF Typography

Shared typography helpers for the
Property Health Intelligence (PHI)
PDF Design System.
"""

from PIL import ImageDraw


from .font_manager import FontManager

from .colors import (
    PRIMARY,
    WHITE,
    TEXT_SECONDARY,
    FOOTER_SMALL,
)

from textwrap import wrap

from engine.pdf_components.framework.spacing import (
    SPACE_MD,
    SPACE_XL,
)



# ==========================================================
# BASIC TEXT
# ==========================================================


def draw_text(
    draw,
    x,
    y,
    text,
    font,
    fill=PRIMARY,
    anchor=None,
):
    """
    Draw plain text.
    """

    kwargs = {
        "font": font,
        "fill": fill,
    }

    if anchor is not None:
        kwargs["anchor"] = anchor

    draw.text(
        (x, y),
        str(text),
        **kwargs,
    )


def draw_page_title(
    draw,
    x,
    y,
    text,
    font,
    fill=WHITE,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_section_title(
    draw,
    x,
    y,
    text,
    font,
    fill=PRIMARY,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_subtitle(
    draw,
    x,
    y,
    text,
    font,
    fill=WHITE,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_label(
    draw,
    x,
    y,
    text,
    font,
    fill=TEXT_SECONDARY,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_value(
    draw,
    x,
    y,
    text,
    font,
    fill=WHITE,
    anchor=None,
):
    draw_text(
        draw=draw,
        x=x,
        y=y,
        text=text,
        font=font,
        fill=fill,
        anchor=anchor,
    )


def draw_body(
    draw,
    x,
    y,
    text,
    font,
    fill=PRIMARY,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_caption(
    draw,
    x,
    y,
    text,
    font,
    fill=TEXT_SECONDARY,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_small(
    draw,
    x,
    y,
    text,
    font,
    fill=FOOTER_SMALL,
):
    draw_text(
        draw,
        x,
        y,
        text,
        font,
        fill,
    )


def draw_icon(
    draw,
    x,
    y,
    icon,
    font,
    fill=WHITE,
):
    draw_text(
        draw,
        x,
        y,
        icon,
        font,
        fill,
    )


# ==========================================================
# ALIGNMENT
# ==========================================================


def draw_center_text(
    draw,
    x_center,
    y,
    text,
    font,
    fill=PRIMARY,
):

    draw.text(
        (
            FontManager.center_x(
                draw,
                text,
                font,
                x_center,
            ),
            y,
        ),
        str(text),
        font=font,
        fill=fill,
    )


def draw_right_text(
    draw,
    x_right,
    y,
    text,
    font,
    fill=PRIMARY,
):
    """
    Draw right aligned text.
    """

    draw.text(
    (
        FontManager.right_x(
            draw,
            text,
            font,
            x_right,
        ),
        y,
    ),
    str(text),
    font=font,
    fill=fill,
)




def draw_fit_text(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill=PRIMARY,
):

    font = FontManager.fit_font(
        draw,
        text,
        width,
        font,
    )

    draw.text(
        (
            x,
            y,
        ),
        str(text),
        font=font,
        fill=fill,
    )

    return font

def draw_paragraph(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill=PRIMARY,
    line_spacing=6,
    paragraph_spacing=0,
):
    """
    Draw wrapped paragraph.

    Returns
    -------
    int
        Bottom Y position.
    """

    if not text:
        return y

    lines = FontManager.wrap_text(
        draw=draw,
        text=str(text),
        font=font,
        width=width,
    )

    current_y = y

    line_height = font.size + line_spacing

    for line in lines:

        draw.text(
            (x, current_y),
            line,
            font=font,
            fill=fill,
        )

        current_y += line_height

    return current_y + paragraph_spacing

def draw_metric(
    draw,
    x_center,
    y,
    value,
    font,
    fill=PRIMARY,
):
    draw_center_text(
        draw=draw,
        x_center=x_center,
        y=y,
        text=str(value),
        font=font,
        fill=fill,
    )

def draw_badge_text(
    draw,
    x_center,
    y,
    text,
    font,
    fill=WHITE,
):
    draw_center_text(
        draw=draw,
        x_center=x_center,
        y=y,
        text=text,
        font=font,
        fill=fill,
    )

def draw_multiline_text(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill,
    line_spacing=6,
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

