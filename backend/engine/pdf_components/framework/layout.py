"""
PHI Design System

Layout Engine
"""

from dataclasses import dataclass, field

from engine.pdf_components.framework.font_manager import (
    FontManager,
)


# ==========================================================
# SECTION
# ==========================================================

@dataclass
class Section:
    height: int


# ==========================================================
# CARD LAYOUT
# ==========================================================

@dataclass
class CardLayout:

    padding_top: int = 18
    padding_bottom: int = 18

    sections: list[Section] = field(
        default_factory=list
    )

    def add(
        self,
        height: int,
    ):
        """
        Add measured section.
        """

        if height > 0:
            self.sections.append(
                Section(height)
            )

    @property
    def height(self):

        return (
            self.padding_top
            + self.padding_bottom
            + sum(
                s.height
                for s in self.sections
            )
        )


# ==========================================================
# TEXT
# ==========================================================

def measure_paragraph_height(
    draw,
    text,
    font,
    width,
    line_spacing=8,
):

    if not text:
        return 0

    lines = FontManager.wrap_text(
        draw=draw,
        text=text,
        font=font,
        width=width,
    )

    if not lines:
        return 0

    return (
        len(lines) * font.size
        + (len(lines) - 1) * line_spacing
    )


# ==========================================================
# BULLET LIST
# ==========================================================

def measure_bullet_list_height(
    draw,
    items,
    font,
    width,
    line_spacing=8,
    item_spacing=8,
):

    if not items:
        return 0

    total = 0

    for item in items:

        total += measure_paragraph_height(
            draw=draw,
            text=f"• {item}",
            font=font,
            width=width,
            line_spacing=line_spacing,
        )

        total += item_spacing

    return total


# ==========================================================
# HEADER
# ==========================================================

def measure_header_height(
    font,
    padding=8,
):

    if font is None:
        return 0

    return font.size + padding


# ==========================================================
# METRIC BLOCK
# ==========================================================

def measure_metric_height(
    icon_size=40,
    value_height=44,
    subtitle_height=22,
    spacing=10,
):

    return (
        icon_size
        + spacing
        + value_height
        + spacing
        + subtitle_height
    )


# ==========================================================
# CARD
# ==========================================================

def measure_card_height(
    body_height,
    header_height=0,
    padding_top=18,
    padding_bottom=18,
):

    return (
        padding_top
        + header_height
        + body_height
        + padding_bottom
    )