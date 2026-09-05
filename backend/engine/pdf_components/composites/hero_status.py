"""
PHI Design System

Hero Status Composite
"""

from engine.pdf_components.framework.colors import (
    TEXT,
    SUCCESS,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
    draw_text,
)

from engine.pdf_components.primitives.status import (
    draw_status,
)


def draw_hero_status(
    draw,
    img,
    x,
    y,
    width,
    label,
    description,
    title_font,
    body_font,
    variant="default",
):
    """
    Draw Hero interpretation.

    Returns
    -------
    int
        Bottom Y position.
    """

    # ---------------------------------------------------------
    # STATUS
    # ---------------------------------------------------------
  
    print("=" * 60)
    print("HERO STATUS")
    print("label:", repr(label))
    print("description:", repr(description))
    print("=" * 60)

    status_bottom = draw_status(
        draw=draw,
        img=img,
        x=x,
        y=y + 8,
        label=label,
        font=title_font,
        show_icon=False,
    )

   # ---------------------------------------------------------
    # ASSESSMENT VARIANT
    # ---------------------------------------------------------

    if variant == "assessment":

        status_y = y + 10

        draw_text(
            draw=draw,
            x=x,
            y=status_y,
            text=str(label).title(),
            font=title_font,
            fill=SUCCESS,
        )

        paragraph_y = (
            status_y
            + title_font.size
            + 14
        )

        paragraph_bottom = draw_paragraph(
            draw=draw,
            x=x,
            y=paragraph_y,
            width=width,
            text=description,
            font=body_font,
            fill=TEXT,
            line_spacing=5,
        )

        return paragraph_bottom

    # ---------------------------------------------------------
    # DESCRIPTION
    # ---------------------------------------------------------

    paragraph_bottom = draw_paragraph(
        draw=draw,
        x=x,
        y=status_bottom+16,
        width=width,
        text=description,
        font=body_font,
        fill=TEXT,
        line_spacing=8,
    )

    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return paragraph_bottom