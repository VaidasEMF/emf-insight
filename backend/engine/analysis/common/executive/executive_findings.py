"""
Executive Findings Analysis

Builds findings and observations used by the
Executive Summary page.

No rendering.
No layout.
No PDF logic.
"""


def build_executive_findings(
    project,
    analysis,
):
    """
    Returns findings used by the Executive Summary.
    """

    top_points = analysis.get(
        "top_points",
        [],
    )

    coverage = analysis.get(
        "coverage",
        {},
    )

    worst_room = "Unknown"

    if top_points:
        worst_room = top_points[0].get(
            "room",
            "Unknown",
        )

    measured = coverage.get(
        "measured_points",
        0,
    )

    total = coverage.get(
        "total_points",
        0,
    )

    findings = [

        {
            "title": "Highest Exposure",
            "text":
                f"Highest measured exposure detected in {worst_room}.",
        },

        {
            "title": "Measurement Coverage",
            "text":
                f"{measured} of {total} planned measurement points completed.",
        },

        {
            "title": "Exposure Distribution",
            "text":
                "Exposure is not uniformly distributed across the property.",
        },

        {
            "title": "Mitigation Priority",
            "text":
                "Mitigation should prioritize the highest exposure areas.",
        },

    ]

    return findings

def build_executive_priorities(
    project,
    analysis,
):
    """
    Returns recommended priorities for the Executive Summary.
    """

    priorities = analysis.get(
        "recommendations",
        [],
    )

    if priorities:
        return priorities

    return [

        "Complete remaining measurements.",

        "Reduce RF exposure in high-risk areas.",

        "Prioritize bedrooms and sleeping zones.",

        "Apply mitigation and validate results.",

        "Continue periodic monitoring.",

    ]