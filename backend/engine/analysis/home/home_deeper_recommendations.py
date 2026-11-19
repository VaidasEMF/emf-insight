"""
Home Deeper Recommendations

Measurement-based recommendations for Home Wellness
Deeper Understanding (€49).
"""

RISK_PRIORITY = {
    "weak": "medium",
    "strong": "high",
    "extreme": "critical",
}

RISK_LEVEL_ORDER = {
    "unnoticeable": 0,
    "weak": 1,
    "strong": 2,
    "extreme": 3,
}


def classify_recommendation_priority(classification):
    """
    Map measurement classification to recommendation priority.
    """

    if not isinstance(classification, str):
        return None

    level = classification.strip().lower()

    return RISK_PRIORITY.get(level)

def get_worst_measurement(area, modality):
    """
    Return the worst confirmed measurement in a Lifestyle Area.

    First priority: highest risk classification.
    Tie-breaker: highest numeric measurement value.
    """

    measurement_data = area.get(
        "measurement_points",
        {},
    )

    points = measurement_data.get("points", [])

    worst_result = None
    worst_point = None

    for point in points:

        result = point.get(
            "measurements",
            {},
        ).get(modality)

        if not isinstance(result, dict):
            continue

        classification = result.get("classification")

        if not isinstance(classification, str):
            continue

        level = classification.strip().lower()

        if level not in RISK_LEVEL_ORDER:
            continue

        try:
            value = float(result["value"])
        except (TypeError, ValueError, KeyError):
            continue

        candidate = (
            RISK_LEVEL_ORDER[level],
            value,
        )

        if (
            worst_result is None
            or candidate > (
                RISK_LEVEL_ORDER[
                    worst_result["classification"].strip().lower()
                ],
                float(worst_result["value"]),
            )
        ):
            worst_result = result
            worst_point = point

    if worst_result is None:
        return None

    return {
        "classification": worst_result["classification"],
        "value": worst_result["value"],
        "unit": worst_result["unit"],
        "point_id": worst_point.get("point_id"),
        "point_index": worst_point.get("point_index"),
    }

def build_area_recommendations(area, measurement_types):
    """
    Build recommendations for one Lifestyle Area.

    Recommendations are generated at zone level only.
    Each modality identifies its worst confirmed point.
    """

    recommendations = []

    zone_name = area.get("zone_name", "Lifestyle Area")
    zone_type = area.get("zone_type", "general")

    measurement_data = area.get(
        "measurement_points",
        {},
    )

    total_points = measurement_data.get("total_points", 0)
    measured_points = measurement_data.get("measured_points", 0)

    coverage = area.get("measurement_coverage", 0)

    # ---------------------------------
    # Measurement coverage
    # ---------------------------------

    if total_points == 0 or coverage < 100:

        recommendations.append({
            "priority": "measurement_needed",
            "category": "coverage",
            "zone_id": area.get("zone_id"),
            "zone_name": zone_name,
            "text": (
                f"Complete the measurements in the {zone_name} area "
                f"to improve assessment coverage."
            ),
            "coverage_percent": coverage,
            "measured_points": measured_points,
            "total_points": total_points,
        })

    # ---------------------------------
    # Modality risk
    # ---------------------------------

    for modality in measurement_types:

        worst = get_worst_measurement(
            area,
            modality,
        )

        if not worst:
            continue

        priority = classify_recommendation_priority(
            worst["classification"],
        )

        if not priority:
            continue

        recommendations.append({
            "priority": priority,
            "category": modality,
            "zone_id": area.get("zone_id"),
            "zone_name": zone_name,
            "zone_type": zone_type,
            "classification": worst["classification"],
            "value": worst["value"],
            "unit": worst["unit"],
            "worst_point_id": worst["point_id"],
            "worst_point_index": worst["point_index"],
            "text": (
                f"Review {modality.upper()} exposure "
                f"in the {zone_name} area. "
                f"The highest measured level is "
                f"{worst['value']} {worst['unit']} "
                f"at measurement point "
                f"{(worst['point_index'] or 0) + 1}."
            ),
        })

    # ---------------------------------
    # Exposure context
    # ---------------------------------

    if area.get("hours_per_day") is None:

        recommendations.append({
            "priority": "context_unknown",
            "category": "exposure_context",
            "zone_id": area.get("zone_id"),
            "zone_name": zone_name,
            "text": (
                f"Record the daily time spent in the "
                f"{zone_name} area to improve exposure context."
            ),
        })

    return recommendations

def build_home_deeper_recommendations(analysis):
    """
    Build measurement-based recommendations for Home
    Deeper Understanding.

    Recommendations are generated at Lifestyle Area level.
    """

    lifestyle_areas = analysis.get(
        "lifestyle_areas",
        [],
    )

    measurement_types = analysis.get(
        "measurement_types",
        [],
    )

    all_recommendations = []

    for area in lifestyle_areas:

        area_recommendations = build_area_recommendations(
            area,
            measurement_types,
        )

        all_recommendations.extend(
            area_recommendations
        )

    priority_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "measurement_needed": 3,
        "context_unknown": 4,
    }

    all_recommendations.sort(
        key=lambda item: priority_order.get(
            item.get("priority"),
            99,
        )
    )

    return {
    "all": all_recommendations,

    "priority": [
        item
        for item in all_recommendations
        if item.get("priority") in (
            "critical",
            "high",
            "medium",
        )
    ],

    "measurement_actions": [
        item
        for item in all_recommendations
        if item.get("priority") in (
            "measurement_needed",
            "context_unknown",
        )
    ],

    "total": len(all_recommendations),
}