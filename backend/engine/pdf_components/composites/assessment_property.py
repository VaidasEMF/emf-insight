"""
PHI Design System

Assessment Property Composite
"""

from engine.pdf_components.primitives.icon import (
    draw_icon,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
)

ICON_SIZE = 18
TEXT_OFFSET = 28
LINE_GAP = 18


def draw_assessment_property(
    img,
    draw,
    x,
    y,
    icon,
    label,
    value,
    fonts,
):
    """
    Draw assessment property row.
    """

    draw_icon(
        img=img,
        x=x,
        y=y + 2,
        icon=icon,
        size=ICON_SIZE,
    )

    draw_text(
        draw=draw,
        x=x + TEXT_OFFSET,
        y=y,
        text=label,
        font=fonts["caption"],
        fill=TEXT_SECONDARY,
    )

    draw_text(
        draw=draw,
        x=x + TEXT_OFFSET,
        y=y + LINE_GAP,
        text=str(value),
        font=fonts["body"],
        fill=TEXT,
    )

    return y + 42