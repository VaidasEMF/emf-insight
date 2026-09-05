"""
Executive Metrics Analysis

Builds KPI metrics for the Executive Summary page.
"""


def build_executive_metrics(
    project,
    analysis,
):
    """
    Build Executive KPI presentation model.
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

    status = summary.get(
        "label",
        "Unknown",
    )

    coverage_percent = round(
        coverage.get(
            "coverage",
            0,
        )
    )

    measurement_count = coverage.get(
        "measured_points",
        0,
    )

    total_points = coverage.get(
        "total_points",
        0,
    )

    sbm_score = round(
        analysis.get(
            "sbm_score",
            score,
        )
    )

    icnirp_status = analysis.get(
        "icnirp_status",
        "Compliant",
    )

    return {

        "property_score": {

            "title": "Risk Level",

            "value": score,

            "label": status,

        },

        "sbm": {

            "title": "SBM",

            "value": sbm_score,

            "status": status,

        },

        "icnirp": {

            "title": "ICNIRP",

            "value": icnirp_status,

            "status": icnirp_status,

        },

        "coverage": {

            "title": "Coverage",

            "value": (
                f"{measurement_count} / {total_points}"
            ),

            "unit": "Measured Points",

            "percentage": coverage_percent,

        },

        "measurement_count": measurement_count,

        "total_points": total_points,

    }