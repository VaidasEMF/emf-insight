"""
Home Property Assessment

Context-based analysis for Home Wellness.

Home Assessment uses lifestyle areas, indoor sources,
outdoor sources, occupancy and contextual relationships.

It does not require physical measurements.
"""
INDOOR_SOURCE_WEIGHTS = {
    "wifi_router": 40,
    "bluetooth": 10,
    "smart_meter": 45,
    "electrical_panel": 50,
}


def get_distance_weight(
    distance,
):
    if distance < 0.5:
        return 5

    if distance < 1:
        return 4

    if distance < 2:
        return 3

    if distance < 3:
        return 2

    if distance < 5:
        return 1

    return 0.5


def get_occupancy_weight(
    hours,
):
    if hours > 8:
        return 5

    if hours >= 4:
        return 4

    if hours >= 2:
        return 3

    if hours >= 1:
        return 2

    return 1


def calculate_indoor_exposure(
    source_type,
    distance,
    hours,
):
    base = INDOOR_SOURCE_WEIGHTS.get(
        source_type,
        10,
    )

    score = (
        base
        * get_distance_weight(distance)
        * get_occupancy_weight(hours)
    )

    return round(score)

def get_indoor_distance(
    source,
    zone,
    floor=None,
):
    if not source or not zone:
        return 999

    ceiling_height = (
        floor.get(
            "ceilingHeight",
            2.7,
        )
        if isinstance(floor, dict)
        else 2.7
    )

    dx = (
        source.get("x", 0)
        - zone.get("x", 0)
    )

    dy = (
        source.get("y", 0)
        - zone.get("y", 0)
    )

    horizontal_pixels = (
        dx * dx +
        dy * dy
    ) ** 0.5

    horizontal_meters = (
        horizontal_pixels
        * (
            floor.get(
                "currentScale",
                1,
            )
            if isinstance(floor, dict)
            else 1
        )
    )

    source_floor_index = source.get(
        "floorIndex",
        0,
    )

    zone_floor_index = zone.get(
        "floorIndex",
        0,
    )

    floor_difference = abs(
        source_floor_index
        - zone_floor_index
    )

    vertical_meters = (
        floor_difference
        * ceiling_height
    )

    distance_3d = (
        horizontal_meters
        * horizontal_meters
        +
        vertical_meters
        * vertical_meters
    ) ** 0.5

    return distance_3d


def build_home_analysis(
    project,
):
    floors = project.get(
        "floors",
        [],
    )

    if not isinstance(
        floors,
        list,
    ):
        floors = []

    zones = []
    sources = []

    for floor in floors:

        if not isinstance(
            floor,
            dict,
        ):
            continue

        floor_zones = floor.get(
            "zones",
            [],
        )

        floor_sources = floor.get(
            "sources",
            [],
        )

        if isinstance(
            floor_zones,
            list,
        ):
            zones.extend(
                floor_zones
            )

        if isinstance(
            floor_sources,
            list,
        ):
            sources.extend(
                floor_sources
            )

    completeness = 0

    completeness += min(
        len(zones) * 20,
        50,
    )

    completeness += min(
        len(sources) * 10,
        50,
    )

    completeness = min(
        completeness,
        100,
    )

    source_scores = []

    top_sources = []

    for zone in zones:

        zone_id = zone.get(
            "id"
        )

        if not zone_id:
            continue

        linked_sources = [
            source
            for source in sources
            if zone_id in (
                source.get(
                    "linkedZoneIds",
                    [],
                )
                or []
            )
        ]

        for source in linked_sources:

            source_type = source.get(
                "type",
                "",
            )

            if source_type not in INDOOR_SOURCE_WEIGHTS:
                continue

            distance = get_indoor_distance(
                source,
                zone,
                next(
                    (
                        floor
                        for floor in floors
                        if isinstance(
                            floor,
                            dict,
                        )
                        and zone in floor.get(
                            "zones",
                            [],
                        )
                    ),
                    None,
                ),
            )

            hours = zone.get(
                "hours",
                1,
            )

            score = calculate_indoor_exposure(
                source_type,
                distance,
                hours,
            )

            source_scores.append(
                {
                    "source_type": source_type,
                    "zone_id": zone_id,
                    "distance": distance,
                    "hours": hours,
                    "score": score,
                    "level": get_exposure_level(
                        score
                    ),
                }
            )

    top_sources = sorted(
        source_scores,
        key=lambda item: item["score"],
        reverse=True,
    )[:3]

    insight_count = 0

    insights = []

    if zones and sources:
        insight_count += 1

    wireless_types = {
        "wifi_router",
        "bluetooth",
    }

    for zone in zones:

        if zone.get("type") != "sleep":
            continue

        zone_id = zone.get("id")

        if not zone_id:
            continue

        for source in sources:

            if source.get("type") not in wireless_types:
                continue

            linked_zone_ids = (
                source.get(
                    "linkedZoneIds",
                    [],
                )
                or []
            )

            if zone_id not in linked_zone_ids:
                continue

            insight_count += 1

            insights.append(
                {
                    "title": (
                        "Sleep area near "
                        "WiFi Router"
                    ),
                    "impact": 15,
                    "priority": "high",
                    "recommendation": (
                        "Move router farther "
                        "from sleep area"
                    ),
                    "zone_id": zone_id,
                    "source_type": source.get(
                        "type"
                    ),
                }
            )

    electrical_types = {
        "smart_meter",
        "electrical_panel",
    }

    for zone in zones:

        if zone.get("type") != "work_area":
            continue

        zone_id = zone.get("id")

        if not zone_id:
            continue

        for source in sources:

            if source.get("type") not in electrical_types:
                continue

            linked_zone_ids = (
                source.get(
                    "linkedZoneIds",
                    [],
                )
                or []
            )

            if zone_id not in linked_zone_ids:
                continue

            insight_count += 1

            insights.append(
                {
                    "title": (
                        "Electrical source "
                        "near work area"
                    ),
                    "impact": 12,
                    "recommendation": (
                        "Increase distance "
                        "from work area"
                    ),
                    "zone_id": zone_id,
                    "source_type": source.get(
                        "type"
                    ),
                }
            )

    child_areas = [
        zone
        for zone in zones
        if zone.get("type") == "child_area"
    ]

    if child_areas and sources:

        insight_count += 1

        insights.append(
            {
                "title": (
                    "Child area exposure detected"
                ),
                "impact": 10,
                "recommendation": (
                    "Reduce nearby EMF sources"
                ),
                "source_type": "child_area",
                "score": 100,
            }
        )

    return {
        "workspace": "home",

        "floors": floors,

        "zones": zones,

        "sources": sources,

        "rooms": [],

        "points": [],

        "measurements": [],

        "coverage": {
            "coverage": 0,
            "measured_points": 0,
            "total_points": 0,
        },

        "home": {
            "completeness": completeness,

            "insight_count": insight_count,

            "insights": insights,

            "source_scores": source_scores,

            "top_sources": top_sources,

            "potential_improvement": 0,

            "whole_home": {
                "floor_breakdown": [],

                "total_insights": 0,
            },
        },
    }

def get_exposure_level(
    score,
):
    if score >= 500:
        return "VERY HIGH"

    if score >= 300:
        return "HIGH"

    if score >= 150:
        return "MODERATE"

    if score >= 50:
        return "LOW"

    return "MINIMAL"