from PIL import ImageDraw

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
)


def draw_section_title(
    draw: ImageDraw.ImageDraw,
    x,
    y,
    title,
    subtitle=None,
    title_font=None,
    subtitle_font=None,
    accent_color=PRIMARY,
    spacing=14,
):
    """
    Draw page or section title.

    Used for:
        - Assessment Summary
        - Executive Summary
        - Key Findings
        - Recommendations
        - Property Overview
        - Measurement Details

    Returns:
        next_y
    """

    # --------------------------------------------------
    # Title
    # --------------------------------------------------

    draw.text(
        (
            x,
            y,
        ),
        title.upper(),
        font=title_font,
        fill=accent_color,
    )

    if not subtitle:
        return y + 40

    # --------------------------------------------------
    # Subtitle
    # --------------------------------------------------

    title_bbox = draw.textbbox(
        (0, 0),
        title.upper(),
        font=title_font,
    )

    title_height = title_bbox[3] - title_bbox[1]

    subtitle_y = y + title_height + spacing

    draw.multiline_text(
        (
            x,
            subtitle_y,
        ),
        subtitle,
        font=subtitle_font,
        fill=SECONDARY_TEXT,
        spacing=4,
    )

    subtitle_bbox = draw.multiline_textbbox(
        (x, subtitle_y),
        subtitle,
        font=subtitle_font,
        spacing=4,
    )

    return subtitle_bbox[3]