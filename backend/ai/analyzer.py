# =====================
# AI ANALYZER
# =====================


def analyze_project(
    project,
):

    insights = []

    floors = project.get(
        "floors",
        [],
    )

    # =====================
    # SOURCES
    # =====================

    total_sources = 0

    high_risk_sources = 0

    for floor in floors:

        sources = floor.get(
            "sources",
            [],
        )

        total_sources += len(sources)

        for s in sources:

            power = s.get(
                "power",
                1,
            )

            if power >= 3:

                high_risk_sources += 1

    # =====================
    # RISK
    # =====================

    if high_risk_sources >= 3:

        insights.append(
            {
                "level": "high",
                "title": "Multiple High-Power Sources",
                "description": (
                    "Several strong EMF "
                    "sources were detected. "
                    "Consider increasing "
                    "distance from sleeping "
                    "areas."
                ),
            }
        )

    elif total_sources == 0:

        insights.append(
            {
                "level": "low",
                "title": "Low Source Density",
                "description": ("Very few indoor EMF " "sources detected."),
            }
        )

    else:

        insights.append(
            {
                "level": "medium",
                "title": "Moderate EMF Environment",
                "description": ("Typical residential " "source distribution."),
            }
        )

    return insights
