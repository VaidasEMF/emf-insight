"""
Heatmap Observations

Builds high-level observations and interpretation
used throughout the PDF report.
"""


def build_heatmap_observations(analysis):
    """
    Generate key insights for the heatmap section.

    Returns
    -------
    {
        "worst_room": "...",
        "observations": [...],
    }
    """

    # ======================================================
    # COVERAGE
    # ======================================================

    coverage = analysis.get(
        "coverage",
        {},
    )

    measured_points = coverage.get(
        "measured_points",
        0,
    )

    total_points = coverage.get(
        "total_points",
        0,
    )

    # ======================================================
    # WORST ROOM
    # ======================================================

    top_points = analysis.get(
        "top_points",
        [],
    )

    worst_room = "Unknown"

    if top_points:

        worst_room = top_points[0].get(
            "room",
            "Unknown",
        )

    # ======================================================
    # OBSERVATIONS
    # ======================================================

    observations = [

        f"• Highest measured exposure detected in {worst_room}",

        (
            f"• {measured_points} of "
            f"{total_points} measurement points completed"
        ),

        "• Exposure distribution is not uniform across the property",

        "• Areas with elevated exposure should be prioritized for mitigation",

    ]

    return {

        "worst_room": worst_room,

        "observations": observations,

    }