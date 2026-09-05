"""
Executive Summary content builders.
"""

# ==========================================================
# KEY FINDINGS
# ==========================================================

def build_key_findings(analysis):

    coverage = analysis.get("coverage", {})
    coverage_percent = coverage.get("coverage", 0)

    top_points = analysis.get("top_points", [])

    worst_room = "Unknown"

    if top_points:
        worst_room = top_points[0].get("room", "Unknown")

    return [
        ("Highest Exposure", f"Detected in {worst_room}"),
        ("Coverage", f"{coverage_percent:.0f}% completed"),
        ("Rooms", f"{analysis.get('room_count', 0)} analyzed"),
        ("Recommendation", "Additional measurements recommended"),
    ]


# ==========================================================
# WHAT THIS MEANS
# ==========================================================

def build_what_this_means(analysis):

    coverage = analysis.get("coverage", {})
    coverage_percent = coverage.get("coverage", 0)

    top_points = analysis.get("top_points", [])

    room = "the property"

    if top_points:
        room = top_points[0].get("room", room)

    return (
        f"The highest exposure levels were identified in {room}. "
        f"Current measurement coverage ({coverage_percent:.0f}%) "
        "provides a preliminary understanding of the environment. "
        "Additional measurements would further improve confidence "
        "in the assessment."
    )


# ==========================================================
# EXECUTIVE OBSERVATIONS
# ==========================================================

def build_executive_observations(analysis):

    observations = []

    summary = analysis.get("summary", {})
    score = summary.get("score", 0)

    if score >= 80:
        observations.append(
            "Overall property demonstrates excellent exposure conditions."
        )

    elif score >= 60:
        observations.append(
            "Overall exposure levels are acceptable with several optimization opportunities."
        )

    else:
        observations.append(
            "Priority mitigation is recommended before long-term occupancy."
        )

    top_points = analysis.get("top_points", [])

    if top_points:

        observations.append(
            f"Highest exposure detected in {top_points[0].get('room','Unknown')}."
        )

    coverage = analysis.get("coverage", {})

    observations.append(
        f"Measurement coverage reached {coverage.get('coverage',0):.0f}%."
    )

    return observations


# ==========================================================
# EXECUTIVE METRICS
# ==========================================================

def build_executive_metrics(analysis):

    summary = analysis.get("summary", {})
    coverage = analysis.get("coverage", {})

    return {

        "score": round(
            summary.get("score", 0)
        ),

        "coverage": round(
            coverage.get("coverage", 0)
        ),

        "rooms": analysis.get(
            "room_count",
            0,
        ),

        "zones": len(
            analysis.get(
                "zone_summary",
                [],
            )
        ),

    }