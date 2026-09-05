# =====================
# INSIGHTS ENGINE
# =====================

from engine.sources import (
    get_primary_source,
)

# =====================
# EXECUTIVE INSIGHTS
# =====================


def build_executive_insights(
    analysis,
):

    insights = []

    summary = analysis.get(
        "summary",
        {},
    )

    score = summary.get(
        "score",
        0,
    )

    label = summary.get(
        "label",
        "Low",
    )

    sources = analysis.get(
        "sources",
        [],
    )

    zones = analysis.get(
        "zones",
        [],
    )

    primary_source = get_primary_source(
        sources,
    )

    # =====================
    # GLOBAL SCORE
    # =====================

    if score >= 75:

        insights.append(
            (
                "Environmental analysis identified "
                "elevated cumulative biological "
                "exposure conditions."
            )
        )

    elif score >= 40:

        insights.append(
            (
                "Moderate biological exposure patterns "
                "were detected across measured areas."
            )
        )

    else:

        insights.append(
            (
                "Overall exposure conditions remained "
                "within lower precautionary ranges."
            )
        )

    # =====================
    # PRIMARY SOURCE
    # =====================

    if primary_source:

        insights.append(
            (
                f"Primary environmental contribution "
                f"was associated with "
                f"{primary_source['label']} activity."
            )
        )

    # =====================
    # ZONES
    # =====================

    bed_count = 0

    for z in zones:

        if z.get("type") == "bed":

            bed_count += 1

    if bed_count:

        insights.append(
            ("Sleeping environments were included " "within the assessment scope.")
        )

    # =====================
    # HIGH SOURCE COUNT
    # =====================

    if len(sources) >= 5:

        insights.append(
            (
                "Multiple environmental EMF contributors "
                "were identified within the property."
            )
        )

    return insights
