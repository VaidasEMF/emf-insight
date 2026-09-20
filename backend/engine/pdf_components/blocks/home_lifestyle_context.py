"""
Home Lifestyle & Human Context Block

Context-based Home Assessment presentation.

No physical measurements are used here.
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    TEXT_PRIMARY,
    SECONDARY_TEXT,
    CARD_BG,
    CARD_BORDER,
    SUCCESS,
    WARNING,
    INFO,
)


ZONE_META = {
    "sleep": {
        "label": "Sleep Area",
        "description": "Primary sleeping environment",
        "color": INFO,
    },
    "work": {
        "label": "Work Area",
        "description": "Primary work environment",
        "color": PRIMARY,
    },
    "relax": {
        "label": "Rest Area",
        "description": "Relaxation and recovery area",
        "color": SUCCESS,
    },
    "child": {
        "label": "Child Area",
        "description": "Child-use environment",
        "color": WARNING,
    },
}


def _zone_meta(zone):
    zone_type = (
        zone.get("type")
        or zone.get("zone_type")
        or ""
    )

    return ZONE_META.get(
        zone_type,
        {
            "label": (
                zone.get("name")
                or "Lifestyle Area"
            ),
            "description": "Home lifestyle context",
            "color": PRIMARY,
        },
    )


def draw_home_lifestyle_context(
    *,
    draw,
    lifestyle_area,
    fonts,
):
    """
    Draw one lifestyle / human-context area.

    Returns the bottom Y coordinate.
    """

    zone = lifestyle_area or {}

    card_x = 60
    card_w = 1120

    y = 145

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    draw.text(
        (card_x, y),
        "LIFESTYLE & HUMAN CONTEXT",
        font=fonts["header_title"],
        fill=PRIMARY,
    )

    y += 62

    draw.text(
        (card_x, y),
        (
            "Areas are interpreted according to how "
            "people use the home."
        ),
        font=fonts["body"],
        fill=SECONDARY_TEXT,
    )

    y += 58

    # ------------------------------------------------------
    # AREA
    # ------------------------------------------------------

    meta = _zone_meta(zone)

    card_h = 155

    draw.rounded_rectangle(
        (
            card_x,
            y,
            card_x + card_w,
            y + card_h,
        ),
        radius=18,
        fill=CARD_BG,
        outline=CARD_BORDER,
        width=2,
    )

    # ------------------------------------------------------
    # ACCENT STRIP
    # ------------------------------------------------------

    draw.rounded_rectangle(
        (
            card_x,
            y,
            card_x + 8,
            y + card_h,
        ),
        radius=4,
        fill=meta["color"],
    )

    # ------------------------------------------------------
    # NAME
    # ------------------------------------------------------

    zone_name = (
        zone.get("name")
        or meta["label"]
    )

    draw.text(
        (
            card_x + 32,
            y + 22,
        ),
        zone_name,
        font=fonts["title"],
        fill=TEXT_PRIMARY,
    )

    draw.text(
        (
            card_x + 32,
            y + 68,
        ),
        meta["description"],
        font=fonts["body"],
        fill=SECONDARY_TEXT,
    )

    # ------------------------------------------------------
    # OCCUPANCY
    # ------------------------------------------------------

    occupancy = zone.get(
        "occupancyHours",
        zone.get(
            "occupancy_hours",
            zone.get(
                "hours",
                zone.get(
                    "hoursPerDay",
                    None,
                ),
            ),
        ),
    )

    if occupancy is not None:

        occupancy_text = (
            f"{occupancy} hours/day"
        )

    else:

        occupancy_text = (
            "Occupancy not specified"
        )

    draw.text(
        (
            card_x + 32,
            y + 112,
        ),
        occupancy_text,
        font=fonts["small"],
        fill=TEXT,
    )

    # ------------------------------------------------------
    # SOURCE CONTEXT
    # ------------------------------------------------------

    related_sources = zone.get(
        "sources",
        zone.get(
            "source_count",
            None,
        ),
    )

    if isinstance(
        related_sources,
        list,
    ):

        source_count = len(
            related_sources
        )

    elif related_sources is not None:

        source_count = related_sources

    else:

        source_count = 0

    source_text = (
        f"{source_count} nearby source"
        if source_count == 1
        else
        f"{source_count} nearby sources"
    )

    draw.text(
        (
            card_x + card_w - 270,
            y + 112,
        ),
        source_text,
        font=fonts["small"],
        fill=meta["color"],
    )
    return y + card_h