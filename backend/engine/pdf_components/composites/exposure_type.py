"""
PHI Design System

Exposure Type Composite
"""

from engine.pdf_components.primitives.icon import (
    draw_icon,
)

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.composites.bullet_list import (
    draw_bullet_list,
)

from engine.pdf_components.composites.score_compare import (
    draw_score_compare,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    TEXT_SECONDARY,
)

ICON_SIZE = 24

TITLE_X = 38

TITLE_Y = 0

CONTRIBUTORS_Y = 34

WORST_AREA_Y = 118

SCORES_Y = 170

BOTTOM_PADDING = 24


def draw_exposure_type(
    img,
    draw,

    x,
    y,
    width,

    metric,

    fonts,
):
    """
    Draw single exposure type section.

    metric = {

        "icon": "...",

        "title": "...",

        "contributors": [...],

        "worst_area": "...",

        "sbm": {...},

        "icnirp": {...},

    }
    """

    body_font = fonts["body"]
    small_font = fonts["small"]
    title_font = fonts["subtitle"]

    current_y = y

    # ------------------------------------------------------
    # ICON
    # ------------------------------------------------------

    draw_icon(
        img=img,
        x=x,
        y=current_y,
        icon=metric["icon"],
        size=ICON_SIZE,
    )

    # ------------------------------------------------------
    # TITLE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x + TITLE_X,
        y=current_y + TITLE_Y,
        text=metric["title"],
        font=title_font,
        fill=PRIMARY,
    )

    current_y += CONTRIBUTORS_Y

    # ------------------------------------------------------
    # CONTRIBUTORS
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x,
        y=current_y,
        text="Main contributors",
        font=small_font,
        fill=TEXT_SECONDARY,
    )

    current_y += 20

    current_y = draw_bullet_list(
        draw=draw,
        x=x,
        y=current_y,
        items=metric["contributors"],
        font=body_font,
        bullet_color=PRIMARY,
    )

    # ------------------------------------------------------
    # WORST AREA
    # ------------------------------------------------------

    current_y += 10

    draw_text(
        draw=draw,
        x=x,
        y=current_y,
        text="Worst Area",
        font=small_font,
        fill=TEXT_SECONDARY,
    )

    current_y += 20

    draw_text(
        draw=draw,
        x=x,
        y=current_y,
        text=metric["worst_area"],
        font=body_font,
        fill=TEXT,
    )

    # ------------------------------------------------------
    # SCORE COMPARISON
    # ------------------------------------------------------

    current_y += 40

    current_y = draw_score_compare(
        draw=draw,
        x=x,
        y=current_y,
        sbm=metric["sbm"],
        icnirp=metric["icnirp"],
        fonts=fonts,
    )

    return current_y + BOTTOM_PADDING