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

    return {

        "score": score,

        "label": label,

        "coverage": coverage_percent,

        "rooms":
            len(
                analysis.get(
                    "rooms",
                    [],
                )
            ),

        "zones":
            len(
                analysis.get(
                    "zones",
                    [],
                )
            ),

        "sources":
            len(
                analysis.get(
                    "sources",
                    [],
                )
            ),

        "measured_points":
            coverage.get(
                "measured_points",
                0,
            ),

        "total_points":
            coverage.get(
                "total_points",
                0,
            ),

    }