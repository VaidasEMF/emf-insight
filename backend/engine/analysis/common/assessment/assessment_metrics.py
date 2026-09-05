"""
Assessment Metrics

Build KPI metrics for Assessment Summary.
"""


def build_assessment_metrics(
    analysis,
):
    """
    Returns KPI metrics used on Assessment Summary.
    """

    summary = analysis.get(
        "summary",
        {},
    )

    coverage = analysis.get(
        "coverage",
        {},
    )

    score = round(
        summary.get(
            "score",
            0,
        )
    )

    label = summary.get(
        "label",
        "Unknown",
    )

    coverage_percent = coverage.get(
        "coverage",
        0,
    )

    room_count = len(
        analysis.get(
            "rooms",
            [],
        )
    )

    source_count = len(
        analysis.get(
            "sources",
            [],
        )
    )

    measurement_count = coverage.get(
        "measured_points",
        0,
    )

    zone_count = len(
        analysis.get(
            "zones",
            [],
        )
    )

    total_points = coverage.get(
        "total_points",
        0,
    )

    return {

    # ------------------------------------------------------
    # HERO
    # ------------------------------------------------------

    "score": score,
    "label": label,

    # ------------------------------------------------------
    # LEGACY / ASSESSMENT
    # ------------------------------------------------------

    "risk_level": label,

    "sbm_score": score,

    "compliance": "PASS",

    "status": "ACTIVE",

    # ------------------------------------------------------
    # PROPERTY KPIs
    # ------------------------------------------------------

    "coverage": coverage_percent,

    "measurement_count": measurement_count,

    "room_count": room_count,

    "source_count": source_count,

    "zone_count": zone_count,

    "total_points": total_points,

    "confidence": analysis.get(
        "data_confidence",
        "INITIAL",
    ),
}