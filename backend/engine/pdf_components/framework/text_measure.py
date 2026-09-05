"""
PHI Design System

Text Measurement Utilities

Universal text measurement helpers used by
dynamic PDF components and layout engine.
"""

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# SINGLE LINE
# ==========================================================

def measure_text_width(
    draw,
    text,
    font,
):
    """
    Return rendered width of a single line.
    """

    if not text:
        return 0

    bbox = draw.textbbox(
        (0, 0),
        str(text),
        font=font,
    )

    return bbox[2] - bbox[0]


# ==========================================================
# LINE HEIGHT
# ==========================================================

def measure_line_height(
    draw,
    font,
):
    """
    Return rendered height of a text line.
    """

    bbox = draw.textbbox(
        (0, 0),
        "Ag",
        font=font,
    )

    return bbox[3] - bbox[1]


# ==========================================================
# WRAP TEXT
# ==========================================================

def wrap_text(
    draw,
    text,
    font,
    width,
):
    """
    Use the PHI FontManager wrapping logic.
    """

    if not text:
        return []

    return FontManager.wrap_text(
        draw=draw,
        text=str(text),
        font=font,
        width=width,
    )


# ==========================================================
# PARAGRAPH
# ==========================================================

def measure_paragraph(
    draw,
    text,
    font,
    width,
    line_spacing=6,
):
    """
    Measure a wrapped paragraph.

    Returns
    -------
    dict
        {
            "width": int,
            "height": int,
            "lines": int,
        }
    """

    if not text:
        return {
            "width": 0,
            "height": 0,
            "lines": 0,
        }

    lines = wrap_text(
        draw=draw,
        text=text,
        font=font,
        width=width,
    )

    if not lines:
        return {
            "width": 0,
            "height": 0,
            "lines": 0,
        }

    line_height = measure_line_height(
        draw=draw,
        font=font,
    )

    height = (
        len(lines) * line_height
        + max(0, len(lines) - 1)
        * line_spacing
    )

    max_width = 0

    for line in lines:

        line_width = measure_text_width(
            draw=draw,
            text=line,
            font=font,
        )

        max_width = max(
            max_width,
            line_width,
        )

    return {
        "width": max_width,
        "height": height,
        "lines": len(lines),
    }


# ==========================================================
# BULLET LIST
# ==========================================================

def measure_bullet_list(
    draw,
    items,
    font,
    width,
    item_spacing=14,
    line_spacing=5,
):
    """
    Measure a wrapped bullet list.

    Each item may occupy one or multiple lines.

    Returns
    -------
    dict
        {
            "height": int,
            "items": int,
            "lines": int,
        }
    """

    if not items:
        return {
            "height": 0,
            "items": 0,
            "lines": 0,
        }

    total_height = 0
    total_lines = 0
    item_count = 0

    for item in items:

        if isinstance(item, dict):

            text = (
                item.get("text")
                or item.get("title")
                or ""
            )

        else:

            text = str(item)

        if not text:
            continue

        result = measure_paragraph(
            draw=draw,
            text=text,
            font=font,
            width=width,
            line_spacing=line_spacing,
        )

        total_height += result["height"]

        total_lines += result["lines"]

        item_count += 1

    if item_count > 1:

        total_height += (
            item_count - 1
        ) * item_spacing

    return {
        "height": total_height,
        "items": item_count,
        "lines": total_lines,
    }

# ==========================================================
# CARD HEIGHT
# ==========================================================

def measure_card_height(
    content_height,
    header_height=32,
    header_gap=18,
    top_padding=0,
    bottom_padding=24,
):
    """
    Calculate required card height.

    Parameters
    ----------
    content_height : int
        Measured content height.

    header_height : int
        Header rendered height.

    header_gap : int
        Space between header and content.

    top_padding : int
        Additional top padding.

    bottom_padding : int
        Space below content.

    Returns
    -------
    int
        Required card height.
    """

    return (
        top_padding
        + header_height
        + header_gap
        + content_height
        + bottom_padding
    )