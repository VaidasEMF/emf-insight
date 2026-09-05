"""
Premium PDF Helpers

Reusable drawing helpers used across
the PHI / EMF Maps PDF Design System.
"""

from PIL import ImageDraw

from PIL import Image
import os

from .framework.typography import (
    draw_label,
    draw_value,
    draw_body,
)

from .framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
    WHITE,
)

# ==========================================================
# TEXT
# ==========================================================

def draw_center_text(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    width,
    text,
    font,
    fill,
):
    """
    Draw centered text.
    """

    bbox = draw.textbbox(
        (0, 0),
        str(text),
        font=font,
    )

    text_width = bbox[2] - bbox[0]

    draw.text(
        (
            x + (width - text_width) / 2,
            y,
        ),
        str(text),
        fill=fill,
        font=font,
    )


def draw_right_text(
    draw: ImageDraw.ImageDraw,
    right_x,
    y,
    text,
    font,
    fill,
):
    """
    Draw right aligned text.
    """

    bbox = draw.textbbox(
        (0, 0),
        str(text),
        font=font,
    )

    text_width = bbox[2] - bbox[0]

    draw.text(
        (
            right_x - text_width,
            y,
        ),
        str(text),
        fill=fill,
        font=font,
    )


# ==========================================================
# KEY / VALUE
# ==========================================================

def draw_key_value(
    draw,
    label_x,
    value_x,
    y,
    label,
    value,
    label_font,
    value_font,
    value_color=WHITE,
):
    draw_label(
        draw,
        label_x,
        y,
        label,
        label_font,
    )

    draw_value(
        draw,
        value_x,
        y,
        value,
        value_font,
        fill=value_color,
    )


# ==========================================================
# KPI ROW
# ==========================================================

def draw_kpi_row(
    draw,
    x,
    right_x,
    y,
    icon,
    label,
    value,
    label_font,
    value_font,
):
    draw_body(
        draw,
        x,
        y,
        f"{icon}  {label}",
        label_font,
        fill=SECONDARY_TEXT,
    )

    draw_right_text(
        draw,
        right_x,
        y,
        str(value),
        value_font,
        fill=PRIMARY,
    )


# ==========================================================
# MULTILINE
# ==========================================================

def draw_multiline(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    text,
    font,
    fill,
    line_height=30,
):
    """
    Draw multiline text.

    Returns:
        next_y
    """

    if not text:
        return y

    for line in str(text).split("\n"):

        draw.text(
            (
                x,
                y,
            ),
            line,
            fill=fill,
            font=font,
        )

        y += line_height

    return y


# ==========================================================
# VALUE BLOCK
# ==========================================================

def draw_value_block(
    draw: ImageDraw.ImageDraw,
    label_x,
    value_x,
    y,
    label,
    value,
    label_font,
    value_font,
    line_height=30,
    text_color=WHITE,
):
    """
    Draw label with multiline value.

    Returns:
        next_y
    """

    draw_label(
        draw,
        label_x,
        y,
        label,
        label_font,
    )

    new_y = draw_multiline(
    draw,
    value_x,
    y,
    value,
    value_font,
    fill=text_color,
    line_height=line_height,
)

    return new_y

def draw_kpi_list(
    draw,
    rows,
    x,
    right_x,
    start_y,
    row_height,
    label_font,
    value_font,
):
    y = start_y

    for icon, label, value in rows:

        draw_kpi_row(
            draw=draw,
            x=x,
            right_x=right_x,
            y=y,
            icon=icon,
            label=label,
            value=value,
            label_font=label_font,
            value_font=value_font,
        )

        y += row_height

    return y

def draw_png_icon(
    img,
    icon_file,
    x,
    y,
    size=28,
):
    """
    Draw PNG icon.

    Supports either:

        shield.png

    or

        C:\\...\\assets\\icons\\shield.png
    """

    if not icon_file:
        return

    # ---------------------------------------------------------
    # Absolute path
    # ---------------------------------------------------------

    if os.path.isabs(icon_file):

        path = icon_file

    else:

        path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..",
                "assets",
                "icons",
                icon_file,
            )
        )

    if not os.path.isfile(path):
        print("ICON NOT FOUND:", path)
        return

    try:
        icon = Image.open(path).convert("RGBA")

    except Exception as e:

        print("ICON LOAD ERROR:", e)

        return

    size = max(
        1,
        int(round(size)),
    )

    icon.thumbnail(
        (size, size),
        Image.Resampling.LANCZOS,
    )

    img.paste(
        icon,
        (
            int(round(x)),
            int(round(y)),
        ),
        icon,
    )