"""
PHI Design System

Status Primitive

Universal status component used across the
entire PHI Platform and Premium PDF.
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.primitives.icon import (
    draw_icon,
)


# ==========================================================
# STATUS COLORS
# ==========================================================

STATUS_COLORS = {

    "PASS": "#16B364",
    "SUCCESS": "#16B364",
    "GOOD": "#16B364",
    "LOW": "#16B364",
    "SAFE": "#16B364",

    "EXCELLENT": "#16B364",
    "MODERATE": "#F79009",
    "MEDIUM": "#F79009",
    "WARNING": "#F79009",

    "HIGH": "#F04438",
    "FAIL": "#F04438",
    "DANGER": "#F04438",
    "CRITICAL": "#F04438",

    "UNKNOWN": "#667085",
    "INFO": "#1570EF",
}


# ==========================================================
# STATUS ICONS
# ==========================================================

STATUS_ICONS = {

    "PASS": "check",
    "SUCCESS": "check",
    "GOOD": "check",

    "LOW": "safe",
    "SAFE": "safe",

    "MODERATE": "warning",
    "MEDIUM": "warning",
    "WARNING": "warning",

    "HIGH": "critical",
    "FAIL": "critical",
    "DANGER": "critical",
    "CRITICAL": "critical",

    "UNKNOWN": "clipboard",
    "INFO": "clipboard",
}


# ==========================================================
# HELPERS
# ==========================================================

def get_status_color(label):
    """
    Return status color.
    """

    return STATUS_COLORS.get(
        str(label).upper(),
        PRIMARY,
    )


def get_status_icon(label):
    """
    Return status icon.
    """

    return STATUS_ICONS.get(
        str(label).upper(),
        "clipboard",
    )


# ==========================================================
# DRAW
# ==========================================================

def draw_status(
    draw,
    img=None,
    x=0,
    y=0,
    label="",
    font=None,
    color=None,
    icon=None,
    icon_size=30,
    gap=14,
    show_icon=True,
    anchor="left",
):
    """
    Draw status label.

    anchor:
        left | center | right
    """

    label = str(label)

    if color is None:
        color = get_status_color(label)

    if icon is None:
        icon = get_status_icon(label)

    # ------------------------------------------------------
    # Measure text
    # ------------------------------------------------------

    if font:
        bbox = draw.textbbox(
            (0, 0),
            label,
            font=font,
        )
        text_width = bbox[2] - bbox[0]
    else:
        text_width = 0

    total_width = text_width

    if show_icon:
        total_width += icon_size + gap

    # ------------------------------------------------------
    # Alignment
    # ------------------------------------------------------

    if anchor == "center":
        start_x = x - total_width / 2

    elif anchor == "right":
        start_x = x - total_width

    else:
        start_x = x

    text_x = start_x

    # ------------------------------------------------------
    # ICON
    # ------------------------------------------------------

    if show_icon:

        draw_icon(
            img=img,
            x=start_x,
            y=y - 3,
            icon=icon,
            size=icon_size,
        )

        text_x = start_x + icon_size + gap

    # ------------------------------------------------------
    # LABEL
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=text_x,
        y=y + 1,
        text=label,
        font=font,
        fill=color,
    )

    if font is None:
        return y + icon_size

    return y + max(
        font.size,
        icon_size if show_icon else font.size,
    )