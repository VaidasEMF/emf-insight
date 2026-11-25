
"""
EMF Insight — Home Deeper Understanding (€49)

Independent measurement-based analysis.
Does not modify Heatmap Normalization or the €15 Simple Report.
"""
import math

from engine.analysis.home.home_deeper_recommendations import (
    build_home_deeper_recommendations,
)

def validate_input(project):
    """
    Validate the Home project structure before analysis.

    Returns:
        dict: validation result and normalized references.
    """

    errors = []
    warnings = []

    if not isinstance(project, dict):
        return {
            "valid": False,
            "errors": ["Project data must be a dictionary."],
            "warnings": [],
        }

    if project.get("type") != "home":
        errors.append("Only Home Wellness projects are supported.")

    floors = project.get("floors")

    if not isinstance(floors, list) or not floors:
        errors.append("Project must contain at least one floor.")
        floors = []

    profile = project.get("homeMeasurementProfile")

    if not isinstance(profile, dict):
        errors.append("Home measurement profile is missing.")
        profile = {}

    measurement_types = profile.get("measurementTypes")

    if not isinstance(measurement_types, list) or not measurement_types:
        errors.append("No active measurement modalities selected.")
        measurement_types = []

    supported_types = {"rf", "electric", "magnetic"}

    unsupported_types = [
        modality
        for modality in measurement_types
        if modality not in supported_types
    ]

    if unsupported_types:
        errors.append(
            f"Unsupported measurement modalities: {unsupported_types}"
        )

    lifestyle_zones = []

    for floor_index, floor in enumerate(floors):

        if not isinstance(floor, dict):
            warnings.append(
                f"Floor {floor_index} has an invalid structure."
            )
            continue

        zones = floor.get("zones", [])

        if not isinstance(zones, list):
            warnings.append(
                f"Floor {floor_index} has invalid zones data."
            )
            continue

        for zone in zones:

            if not isinstance(zone, dict):
                continue

            zone_type = (
                zone.get("zoneType")
                or zone.get("lifestyleType")
                or zone.get("type")
            )

            if zone_type in {"sleep", "child", "work", "rest", "relax"}:
                lifestyle_zones.append(zone)

    if not lifestyle_zones:
        errors.append("No Lifestyle Areas found in the project.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "floors": floors,
        "lifestyle_zones": lifestyle_zones,
        "measurement_types": measurement_types,
    }


# ==========================================================
# SBM-2024 MEASUREMENT CLASSIFICATION
# ==========================================================

SBM_THRESHOLDS = {
    "rf": {
        "unit": "µW/m²",
        "levels": [
            (0.1, "unnoticeable"),
            (10, "weak"),
            (1000, "strong"),
            (float("inf"), "extreme"),
        ],
    },
    "electric": {
        "unit": "V/m",
        "levels": [
            (1, "unnoticeable"),
            (5, "weak"),
            (50, "strong"),
            (float("inf"), "extreme"),
        ],
    },
    "magnetic": {
        "unit": "nT",
        "levels": [
            (20, "unnoticeable"),
            (100, "weak"),
            (500, "strong"),
            (float("inf"), "extreme"),
        ],
    },
}


def classify_measurement(modality, value):
    """
    Classify one measurement using SBM-2024 orientation values.

    Returns None when the measurement is missing.
    """

    if value is None:
        return None

    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        raise ValueError(
            f"Invalid {modality} measurement value: {value}"
        )

    if not math.isfinite(numeric_value) or numeric_value < 0:
        raise ValueError(
            f"Measurement must be finite and non-negative: {value}"
        )

    if modality not in SBM_THRESHOLDS:
        raise ValueError(
            f"Unsupported measurement modality: {modality}"
        )

    threshold = SBM_THRESHOLDS[modality]

    for upper_limit, level in threshold["levels"]:
        if numeric_value < upper_limit:
            return {
                "modality": modality,
                "value": numeric_value,
                "unit": threshold["unit"],
                "classification": level,
            }

    raise RuntimeError("Measurement classification failed.")



# ==========================================================
# MEASUREMENT POINT ANALYSIS
# ==========================================================

def analyze_measurement_points(zone, measurement_types):
    """
    Analyze individual measurement points in one Lifestyle Area.

    Historical readings from modalities outside the active
    measurement profile are intentionally excluded.
    """

    points = zone.get("measurementPoints", [])

    if not isinstance(points, list):
        points = []

    results = []

    for index, point in enumerate(points):

        if not isinstance(point, dict):
            continue

        readings = point.get("readings", {})

        if not isinstance(readings, dict):
            readings = {}

        modality_results = {}

        for modality in measurement_types:

            value = readings.get(modality)

            classification = classify_measurement(
                modality,
                value,
            )

            modality_results[modality] = classification

        measured_count = sum(
            1
            for result in modality_results.values()
            if result is not None
        )

        results.append({
            "point_id": point.get("id"),
            "point_index": index,
            "status": point.get("status", "unknown"),
            "measurements": modality_results,
            "measured_modalities": measured_count,
            "expected_modalities": len(measurement_types),
            "complete": (
                measured_count == len(measurement_types)
                and len(measurement_types) > 0
            ),
        })

    return {
        "total_points": len(results),
        "measured_points": sum(
            1 for point in results if point["complete"]
        ),
        "partial_points": sum(
            1
            for point in results
            if 0 < point["measured_modalities"]
            < point["expected_modalities"]
        ),
        "pending_points": sum(
            1 for point in results
            if point["measured_modalities"] == 0
        ),
        "points": results,
    }


# ==========================================================
# LIFESTYLE AREA ANALYSIS
# ==========================================================

def analyze_lifestyle_area(zone, measurement_types):
    """
    Build an analysis for one Home Lifestyle Area.
    """

    point_analysis = analyze_measurement_points(
        zone,
        measurement_types,
    )

    total_points = point_analysis["total_points"]
    measured_points = point_analysis["measured_points"]

    coverage = (
        round(measured_points / total_points * 100, 1)
        if total_points > 0
        else 0
    )

    hours_per_day = zone.get("hoursPerDay")

    if hours_per_day is not None:
        try:
            hours_per_day = float(hours_per_day)

            if not math.isfinite(hours_per_day) or not 0 <= hours_per_day <= 24:
                raise ValueError

        except (TypeError, ValueError):
            hours_per_day = None

    return {
        "zone_id": zone.get("id"),
        "zone_name": (
            zone.get("name")
            or zone.get("zoneType")
            or zone.get("lifestyleType")
            or zone.get("type")
            or "Lifestyle Area"
        ),
        "zone_type": (
            zone.get("zoneType")
            or zone.get("lifestyleType")
            or zone.get("type")
        ),
        "hours_per_day": hours_per_day,
        "exposure_context": (
            "known" if hours_per_day is not None else "unknown"
        ),
        "measurement_coverage": coverage,
        "measurement_points": point_analysis,
    }


# ==========================================================
# PROJECT MEASUREMENT COVERAGE
# ==========================================================

def calculate_coverage(lifestyle_areas):
    """
    Calculate overall measurement coverage across Lifestyle Areas.

    Only fully measured points count as covered.
    """

    total_points = 0
    measured_points = 0

    area_results = []

    for area in lifestyle_areas:

        point_data = area["measurement_points"]

        area_total = point_data["total_points"]
        area_measured = point_data["measured_points"]

        total_points += area_total
        measured_points += area_measured

        area_results.append({
            "zone_id": area["zone_id"],
            "zone_name": area["zone_name"],
            "total_points": area_total,
            "measured_points": area_measured,
            "coverage": area["measurement_coverage"],
        })

    overall_coverage = (
        round(measured_points / total_points * 100, 1)
        if total_points > 0
        else 0
    )

    return {
        "total_points": total_points,
        "measured_points": measured_points,
        "coverage_percent": overall_coverage,
        "areas": area_results,
    }


# ==========================================================
# MEASUREMENT CONFIDENCE
# ==========================================================

def calculate_confidence(
    lifestyle_areas,
    measurement_types,
):
    """
    Calculate data confidence independently from exposure risk.

    Confidence considers:
    - Measurement coverage
    - Active measurement modalities
    - Completeness of measurement data
    """

    total_expected = 0
    total_completed = 0
    total_readings_expected = 0
    total_readings_available = 0

    for area in lifestyle_areas:

        points = area["measurement_points"]["points"]

        for point in points:

            expected = point["expected_modalities"]
            available = point["measured_modalities"]

            total_expected += 1
            total_completed += int(point["complete"])

            total_readings_expected += expected
            total_readings_available += available

    point_completion = (
        total_completed / total_expected
        if total_expected > 0
        else 0
    )

    reading_completion = (
        total_readings_available / total_readings_expected
        if total_readings_expected > 0
        else 0
    )

    if not measurement_types or total_expected == 0:
        confidence_level = "insufficient"
    elif point_completion >= 0.9 and reading_completion >= 0.9:
        confidence_level = "high"
    elif point_completion >= 0.6 and reading_completion >= 0.6:
        confidence_level = "moderate"
    else:
        confidence_level = "limited"

    return {
        "level": confidence_level,
        "point_completion_percent": round(
            point_completion * 100, 1
        ),
        "reading_completion_percent": round(
            reading_completion * 100, 1
        ),
        "completed_points": total_completed,
        "total_points": total_expected,
        "active_modalities": measurement_types,
    }

# ==========================================================
# RISK ANALYSIS
# ==========================================================

RISK_LEVEL_ORDER = {
    "unnoticeable": 0,
    "weak": 1,
    "strong": 2,
    "extreme": 3,
}


def calculate_risk(lifestyle_areas, measurement_types):
    """
    Calculate measurement-based risk independently for each
    active modality and Lifestyle Area.

    Risk is determined by the highest confirmed classification.
    No cross-modality weighting or exposure-time multiplier
    is applied.

    Returns:
        - Risk per Lifestyle Area and modality
        - Overall highest classification per modality
        - The measurement point responsible for each result
    """

    overall_by_modality = {
        modality: None
        for modality in measurement_types
    }

    area_results = []

    for area in lifestyle_areas:

        measurement_data = area.get(
            "measurement_points",
            {},
        )

        points = measurement_data.get("points", [])

        area_by_modality = {}

        for modality in measurement_types:

            worst_result = None
            worst_point = None

            for point in points:

                measurements = point.get(
                    "measurements",
                    {},
                )

                result = measurements.get(modality)

                if not isinstance(result, dict):
                    continue

                classification = result.get("classification")

                if not isinstance(classification, str):
                    continue

                level = classification.strip().lower()

                if level not in RISK_LEVEL_ORDER:
                    raise ValueError(
                        f"Unknown risk classification: {classification}"
                    )

                if (
                    worst_result is None
                    or (
                        RISK_LEVEL_ORDER[level],
                        float(result["value"]),
                    )
                    > (
                        RISK_LEVEL_ORDER[
                            worst_result["classification"].strip().lower()
                        ],
                        float(worst_result["value"]),
                    )
                ):
                    worst_result = result
                    worst_point = point

            if worst_result is None:

                area_by_modality[modality] = {
                    "status": "insufficient_data",
                    "classification": None,
                    "value": None,
                    "unit": None,
                    "worst_point_id": None,
                    "worst_point_index": None,
                }

                continue

            area_by_modality[modality] = {
                "status": "assessed",
                "classification": worst_result["classification"],
                "value": worst_result["value"],
                "unit": worst_result["unit"],
                "worst_point_id": worst_point["point_id"],
                "worst_point_index": worst_point["point_index"],
            }

            current_overall = overall_by_modality[modality]

            if (
                current_overall is None
                or (
                    RISK_LEVEL_ORDER[
                        worst_result["classification"].strip().lower()
                    ],
                    float(worst_result["value"]),
                )
                > (
                    RISK_LEVEL_ORDER[
                        current_overall["classification"].strip().lower()
                    ],
                    float(current_overall["value"]),
                )
            ):
                overall_by_modality[modality] = {
                    "classification": worst_result["classification"],
                    "value": worst_result["value"],
                    "unit": worst_result["unit"],
                    "zone_id": area.get("zone_id"),
                    "zone_name": area.get("zone_name"),
                    "worst_point_id": worst_point["point_id"],
                }

        area_results.append({
            "zone_id": area.get("zone_id"),
            "zone_name": area.get("zone_name"),
            "zone_type": area.get("zone_type"),
            "by_modality": area_by_modality,
        })

    return {
        "areas": area_results,
        "overall_by_modality": overall_by_modality,
    }

# ==========================================================
# HOME DEEPER ANALYSIS — MAIN ENTRY POINT
# ==========================================================

def run_deeper_analysis(project):
    """
    Run the complete Home Deeper Understanding analysis.

    This analysis is independent from:
    - Home Simple Report (€15)
    - Business Survey scoring
    - Heatmap normalization
    """

    # 1. Validate project input
    validation = validate_input(project)

    if not validation["valid"]:
        return {
            "success": False,
            "errors": validation["errors"],
            "warnings": validation.get("warnings", []),
            "analysis": None,
        }

    measurement_types = validation["measurement_types"]
    zones = validation["lifestyle_zones"]

    # 2. Analyze each Lifestyle Area
    lifestyle_areas = [
        analyze_lifestyle_area(zone, measurement_types)
        for zone in zones
    ]

    # 3. Calculate measurement coverage
    coverage = calculate_coverage(lifestyle_areas)

    # 4. Calculate confidence
    confidence = calculate_confidence(
        lifestyle_areas,
        measurement_types,
    )

    # 5. Calculate risk independently per modality
    risk = calculate_risk(
        lifestyle_areas,
        measurement_types,
    )

    # 6. Build Home Deeper Recommendations
    recommendations = build_home_deeper_recommendations({
        "measurement_types": measurement_types,
        "lifestyle_areas": lifestyle_areas,
    })

    sections = build_analysis_sections(
        coverage=coverage,
        lifestyle_areas=lifestyle_areas,
        confidence=confidence,
        risk=risk,
        recommendations=recommendations,
    )

    # 7. Build final result
    return {
        "success": True,
        "errors": [],
        "warnings": validation.get("warnings", []),

        "analysis": {
            "analysis_type": "home_deeper_understanding",
            "methodology": "emf_maps_measurement_based",

            "sections": sections,

            "measurement_types": measurement_types,

            "measurement_summary": coverage,

            "confidence": confidence,

            "risk": risk,

            "recommendations": recommendations,

            "lifestyle_areas": lifestyle_areas,
        },
    }

# ==========================================================
# BUILD HOME DEEPER ANALYSIS SECTIONS
# ==========================================================

def build_analysis_sections(
    coverage,
    lifestyle_areas,
    confidence,
    risk,
    recommendations,
):
    """
    Build structured sections for Home Deeper Understanding.
    Uses existing calculated results without recalculating risk.
    """

    # 1. Assessment Overview
    assessment_overview = {
        "status": "completed",
        "total_lifestyle_areas": len(lifestyle_areas),
        "measurement_types": list(
            confidence.get("active_modalities", [])
        ),
        "confidence_level": confidence.get("level"),
    }

    # 2. Measurement Summary
    measurement_summary = {
        "total_points": coverage.get("total_points", 0),
        "measured_points": coverage.get("measured_points", 0),
        "coverage_percent": coverage.get("coverage_percent", 0),
        "areas": coverage.get("areas", []),
    }

    # 3. Lifestyle Area Analysis
    lifestyle_area_analysis = []

    for area in lifestyle_areas:
        lifestyle_area_analysis.append({
            "zone_id": area.get("zone_id"),
            "zone_name": area.get("zone_name"),
            "zone_type": area.get("zone_type"),
            "hours_per_day": area.get("hours_per_day"),
            "exposure_context": area.get("exposure_context"),
            "measurement_coverage": area.get(
                "measurement_coverage"
            ),
            "measurement_points": area.get(
                "measurement_points"
            ),
            "risk": next(
                (
                    item
                    for item in risk.get("areas", [])
                    if item.get("zone_id") == area.get("zone_id")
                ),
                None,
            ),
        })

    # 4. Exposure & Context
    exposure_context = {
        "known_duration_areas": [
            area.get("zone_name")
            for area in lifestyle_areas
            if area.get("hours_per_day") is not None
        ],
        "unknown_duration_areas": [
            area.get("zone_name")
            for area in lifestyle_areas
            if area.get("hours_per_day") is None
        ],
    }

    # 5. Risk & Confidence
    risk_confidence = {
        "risk_by_area": risk.get("areas", []),
        "overall_by_modality": risk.get(
            "overall_by_modality",
            {},
        ),
        "confidence": confidence,
    }

    # 6. Prioritised Recommendations
    prioritised_recommendations = {
        "priority": recommendations.get("priority", []),
        "measurement_actions": recommendations.get(
            "measurement_actions",
            [],
        ),
        "total": recommendations.get("total", 0),
    }

        # 7. Assessment Limitations
    assessment_limitations = []

    if coverage.get("coverage_percent", 0) < 100:
        assessment_limitations.append({
            "type": "incomplete_measurements",
            "description": (
                "Not all generated measurement points "
                "have complete measurements."
            ),
        })

    if confidence.get("level") in (
        "limited",
        "insufficient",
    ):
        assessment_limitations.append({
            "type": "limited_confidence",
            "description": (
                "The available measurement data provides "
                "limited assessment confidence."
            ),
        })

    unknown_areas = exposure_context.get(
        "unknown_duration_areas",
        [],
    )

    if unknown_areas:
        assessment_limitations.append({
            "type": "unknown_exposure_duration",
            "areas": unknown_areas,
            "description": (
                "Daily time spent in some Lifestyle Areas "
                "is unknown."
            ),
        })
    assessment_limitations.append({
        "type": "scope_limitation",
        "description": (
            "This is a self-measurement-based Home "
            "Deeper Understanding assessment, not a "
            "professional environmental assessment."
        ),
    })
    return {
        "assessment_overview": assessment_overview,
        "measurement_summary": measurement_summary,
        "lifestyle_area_analysis": lifestyle_area_analysis,
        "exposure_context": exposure_context,
        "risk_confidence": risk_confidence,
        "prioritised_recommendations": prioritised_recommendations,
        "assessment_limitations": assessment_limitations,
    }