"""
Layout Helpers

Small reusable layout helpers used by
multiple PDF sections.
"""
from engine.pdf_components.pil.cover.left_panel import (
    draw_card,
)

from engine.pdf_components.pil.sections.draw_section_title import (
    draw_section_title,
)

from engine.pdf_pages.grids import (
    CARD_PADDING,
)

from engine.pdf_components.framework.colors import (
    CARD_BG,
)


# ==========================================================
# CARD WITH TITLE
# ==========================================================

def draw_card_with_title(
    draw,
    x,
    y,
    width,
    height,
    title,
    title_font,
    subtitle=None,
    subtitle_font=None,
    fill=CARD_BG,
):
    """
    Draw a standard card with a section title.

    Returns:
        content_x,
        content_y,
        content_width
    """

    draw_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
        fill=fill,
    )

    content_y = draw_section_title(
        draw=draw,
        x=x + CARD_PADDING,
        y=y + 20,
        title=title,
        subtitle=subtitle,
        title_font=title_font,
        subtitle_font=subtitle_font,
    )

    return (
        x + CARD_PADDING,
        content_y + 20,
        width - CARD_PADDING * 2,
    )