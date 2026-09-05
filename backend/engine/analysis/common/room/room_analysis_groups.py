"""
Room Analysis Groups

Builds presentation groups for Room Analysis PDF pages.

Room Analysis v2 rules
----------------------

- rooms are grouped by floor;
- rooms are ordered deterministically;
- highest-risk / highest-exposure rooms appear first;
- rooms are NOT limited by a hardcoded "3 per page" rule;
- page grouping is content-aware;
- rooms with more zones require more page space;
- rooms with more sources require more page space;
- all matched rooms are preserved;
- raw room data is preserved;
- analytical data is not recalculated here.

This module decides:

    WHICH rooms belong to WHICH Room Analysis page.

It does NOT render the cards.
"""


# ==========================================================
# RISK PRIORITY
# ==========================================================

RISK_PRIORITY = {
    "high": 4,
    "elevated": 3,
    "moderate": 2,
    "medium": 2,
    "low": 1,
    "unknown": 0,
}


# ==========================================================
# PAGE CONTENT CAPACITY
# ==========================================================
#
# This is NOT a room-count limit.
#
# It represents the approximate amount of content that
# can normally fit into one A4 Room Analysis page.
#
# A room receives a dynamic weight based on:
#
#     base room content
#     + zones
#     + sources
#
# Therefore:
#
#     simple room      -> small weight
#     1-zone room      -> larger weight
#     3-zone room      -> much larger weight
#
# This value is intentionally isolated here so that the
# presentation density can later be calibrated centrally.
#
# ==========================================================

PAGE_CONTENT_CAPACITY = 14

BASE_ROOM_WEIGHT = 2

ZONE_WEIGHT = 1

SOURCE_WEIGHT = 0.25


# ==========================================================
# NORMALIZE RISK
# ==========================================================

def _risk_priority(
    risk,
):
    """
    Return numeric risk priority.
    """

    if risk is None:

        return 0

    value = str(
        risk
    ).strip().lower()

    return RISK_PRIORITY.get(
        value,
        0,
    )


# ==========================================================
# EXPOSURE SCORE
# ==========================================================

def _exposure_score(
    room_overview,
):
    """
    Return numeric exposure score.

    Uses avg_rf as the current room-level
    exposure metric.

    This is used only for deterministic
    presentation ordering.
    """

    if not isinstance(
        room_overview,
        dict,
    ):

        return 0

    value = room_overview.get(
        "avg_rf",
        0,
    )

    try:

        return float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


# ==========================================================
# ZONE ANALYSIS
# ==========================================================

def _get_zone_analysis(
    room_overview,
):
    """
    Return canonical analytical zones.

    IMPORTANT:

    We use only:

        zone_analysis

    We do NOT use:

        zones

    because `zones` may represent other contextual
    relationships.

    No zones are invented here.
    """

    if not isinstance(
        room_overview,
        dict,
    ):

        return []

    zones = room_overview.get(
        "zone_analysis",
        [],
    )

    if not isinstance(
        zones,
        list,
    ):

        return []

    return [
        zone
        for zone in zones
        if isinstance(
            zone,
            dict,
        )
    ]


# ==========================================================
# SOURCE CONTEXT
# ==========================================================

def _get_sources(
    room_overview,
):
    """
    Return normalized source-context entries.
    """

    if not isinstance(
        room_overview,
        dict,
    ):

        return []

    source_context = room_overview.get(
        "source_context",
        {},
    )

    if not isinstance(
        source_context,
        dict,
    ):

        return []

    sources = source_context.get(
        "sources",
        [],
    )

    if not isinstance(
        sources,
        list,
    ):

        return []

    return [
        source
        for source in sources
        if isinstance(
            source,
            dict,
        )
    ]


# ==========================================================
# CONTENT COMPLEXITY
# ==========================================================

def _room_content_weight(
    room_overview,
):
    """
    Estimate how much vertical presentation space
    one Room Analysis card requires.

    This is NOT a measurement or analytical score.

    It is purely a presentation-density model.

    Components:

        base room information
        + analytical zones
        + source context
    """

    zones = _get_zone_analysis(
        room_overview
    )

    sources = _get_sources(
        room_overview
    )

   

    # ------------------------------------------------------
    # Base room content
    # ------------------------------------------------------

    weight = float(
        BASE_ROOM_WEIGHT
    )

    # ------------------------------------------------------
    # Zones
    #
    # Every analytical zone needs its own visible
    # presentation row/card.
    # ------------------------------------------------------

    weight += (
        len(
            zones
        )
        * ZONE_WEIGHT
    )

    # ------------------------------------------------------
    # Sources
    #
    # Source context is intentionally lighter than a zone.
    # ------------------------------------------------------

    weight += (
        len(
            sources
        )
        * SOURCE_WEIGHT
    )

    print(
        "FINAL WEIGHT:",
        weight,
    )

    return weight


# ==========================================================
# PAGE FIT
# ==========================================================

def _fits_page(
    current_weight,
    room_weight,
    page_capacity,
):
    """
    Return True if another room can be placed
    on the current page.
    """


    proposed_weight = (
        current_weight
        + room_weight
    )

   

    fits = (
        proposed_weight
        <= page_capacity
    )


    return fits


# ==========================================================
# BUILD FLOOR PAGES
# ==========================================================

def _build_floor_page_groups(
    floor_name,
    floor_rooms,
):
    """
    Split one floor into content-aware page groups.
    """

    if not isinstance(
        floor_rooms,
        list,
    ):

        return []

    if not floor_rooms:

        return []

    page_groups = []

    current_rooms = []

    current_weight = 0.0

    # ======================================================
    # ROOMS
    # ======================================================

    for item in floor_rooms:

        if not isinstance(
            item,
            dict,
        ):

            continue

        overview = item.get(
            "room_overview",
            {},
        )

        room_weight = _room_content_weight(
            overview
        )

        # --------------------------------------------------
        # Empty page
        # --------------------------------------------------

        if not current_rooms:

            current_rooms.append(
                item
            )

            current_weight = room_weight

            continue

        # --------------------------------------------------
        # Can the room fit?
        # --------------------------------------------------

        if _fits_page(
            current_weight=current_weight,
            room_weight=room_weight,
            page_capacity=PAGE_CONTENT_CAPACITY,
        ):

            current_rooms.append(
                item
            )

            current_weight += room_weight

            continue

        # --------------------------------------------------
        # Current page is full.
        # --------------------------------------------------

        page_groups.append(
            {
                "floor": floor_name,
                "rooms": current_rooms,
                "content_weight": round(
                    current_weight,
                    2,
                ),
            }
        )

        # --------------------------------------------------
        # Start new page
        # --------------------------------------------------

        current_rooms = [
            item
        ]

        current_weight = room_weight

    # ======================================================
    # FINAL PAGE
    # ======================================================

    if current_rooms:

        page_groups.append(
            {
                "floor": floor_name,
                "rooms": current_rooms,
                "content_weight": round(
                    current_weight,
                    2,
                ),
            }
        )

    return page_groups


# ==========================================================
# BUILD GROUPS
# ==========================================================

def build_room_analysis_groups(
    rooms,
    room_overviews,
):
    """
    Build Room Analysis presentation groups.

    Parameters
    ----------
    rooms:
        Raw room objects.

    room_overviews:
        Normalized room overview models.

    Returns
    -------
    list
        Floor-based Room Analysis page groups.

    Important
    ---------
    There is intentionally NO `rooms_per_page`
    parameter anymore.

    Page membership is content-driven.
    """

    if not isinstance(
        rooms,
        list,
    ):

        return []

    if not isinstance(
        room_overviews,
        list,
    ):

        room_overviews = []

    # ======================================================
    # OVERVIEW INDEX
    # ======================================================

    overview_by_id = {}

    for overview in room_overviews:

        if not isinstance(
            overview,
            dict,
        ):

            continue

        room_id = overview.get(
            "room_id",
            overview.get(
                "id",
            ),
        )

        if room_id is None:

            continue

        overview_by_id[
            str(
                room_id
            )
        ] = overview

    # ======================================================
    # MATCH ROOMS
    # ======================================================

    matched = []

    for room in rooms:

        if not isinstance(
            room,
            dict,
        ):

            continue

        room_id = room.get(
            "id",
        )

        if room_id is None:

            continue

        overview = overview_by_id.get(
            str(
                room_id
            )
        )

        if overview is None:

            continue

        floor_name = overview.get(
            "floor",
            overview.get(
                "floor_name",
                room.get(
                    "floor",
                    "",
                ),
            ),
        )

        matched.append(
            {
                "room": room,
                "room_overview": overview,
                "floor": floor_name,
            }
        )

    # ======================================================
    # GROUP BY FLOOR
    # ======================================================

    floors = {}

    floor_order = []

    for item in matched:

        floor_name = item.get(
            "floor",
            "",
        )

        if floor_name not in floors:

            floors[
                floor_name
            ] = []

            floor_order.append(
                floor_name
            )

        floors[
            floor_name
        ].append(
            item
        )

    # ======================================================
    # BUILD PAGE GROUPS
    # ======================================================

    page_groups = []

    for floor_name in floor_order:

        floor_rooms = floors.get(
            floor_name,
            [],
        )

        # --------------------------------------------------
        # Highest risk first.
        #
        # Then highest RF exposure.
        #
        # Then room name for deterministic ordering.
        # --------------------------------------------------

        floor_rooms.sort(
            key=lambda item: (
                _risk_priority(
                    item[
                        "room_overview"
                    ].get(
                        "risk",
                        "unknown",
                    )
                ),
                _exposure_score(
                    item[
                        "room_overview"
                    ]
                ),
                str(
                    item[
                        "room_overview"
                    ].get(
                        "name",
                        "",
                    )
                ).lower(),
            ),
            reverse=True,
        )

        

        for item in floor_rooms:

            overview = item.get(
                "room_overview",
                {},
            )

            zones = _get_zone_analysis(
                overview
            )

            sources = _get_sources(
                overview
            )

            weight = _room_content_weight(
                overview
            )


        # --------------------------------------------------
        # Split floor into pages
        # --------------------------------------------------

        floor_page_groups = (
            _build_floor_page_groups(
                floor_name=floor_name,
                floor_rooms=floor_rooms,
            )
        )

        page_groups.extend(
            floor_page_groups
        )

    # ======================================================
    # FINAL DEBUG
    # ======================================================

   

    for page_index, group in enumerate(
        page_groups,
        start=1,
    ):


        for item in group.get(
            "rooms",
            [],
        ):

            overview = item.get(
                "room_overview",
                {},
            )

            zones = _get_zone_analysis(
                overview
            )

           

    return page_groups