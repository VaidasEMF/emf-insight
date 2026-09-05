"""
Business Recommendations

Generates recommendation data for the PDF and UI.
"""

from engine.analysis.common.helpers.score_helpers import (
    normalize_sbm,
)

from engine.analysis.heatmap.sources import (
    get_primary_source,
    get_source_profile,
)

from engine.recommendation_rules import (
    SOURCE_RECOMMENDATIONS,
    RISK_RECOMMENDATIONS,
)


# ==========================================================
# HELPERS
# ==========================================================

def deduplicate_recommendations(recs):

    seen = set()
    unique = []

    for rec in recs:

        key = rec.get("text") if isinstance(rec, dict) else str(rec)

        if key in seen:
            continue

        seen.add(key)
        unique.append(rec)

    return unique


def normalize_recommendations(recs):

    normalized = []

    for rec in recs:

        if isinstance(rec, str):

            normalized.append({

                "text": rec,

                "priority": "medium",

                "impact": "moderate",

                "category": "general",

            })

        else:

            normalized.append(rec)

    return normalized


# ==========================================================
# BUILD
# ==========================================================

def build_recommendations(analysis):
    """
    Build recommendation list from analysis.
    """

    print(
        "\n🔥🔥 🔥🔥🔥BUILD RECOMMENDATIONS START"
    )

    print(
        "ANALYSIS TYPE:",
        type(analysis),
    )

    print(
        "ANALYSIS KEYS:",
        list(
            analysis.keys()
        )
        if isinstance(
            analysis,
            dict,
        )
        else "NOT DICT",
    )

    recs = []

    summary = analysis.get("summary", {})
    score = summary.get("score", 0)

    print(
        "\n🔥🔥🔥 🔥🔥BUILD RECOMMENDATIONS INPUT"
    )

    print(
        "SUMMARY:",
        summary,
    )

    print(
        "SCORE:",
        score,
    )

    print(
        "RISK:",
        summary.get(
            "label",
            "MISSING",
        ),
    )

    print(
        "SOURCES:",
        len(
            analysis.get(
                "sources",
                [],
            )
        ),
    )

    print(
        "ZONES:",
        len(
            analysis.get(
                "zones",
                [],
            )
        ),
    )

    print(
        "POINTS:",
        len(
            analysis.get(
                "points",
                [],
            )
        ),
    )

    sources = analysis.get("sources", [])
    zones = analysis.get("zones", [])
    points = analysis.get(
        "points",
        analysis.get(
            "points_before",
            [],
        ),
    )

    # ------------------------------------------------------
    # Global risk
    # ------------------------------------------------------

    risk = summary.get("label", "Low").lower()

    for item in RISK_RECOMMENDATIONS.get(risk, []):

        recs.append(item)

    # ------------------------------------------------------
    # Hotspots
    # ------------------------------------------------------

    hotspot_count = 0

    for point in points:

        score_data = normalize_sbm(
            point.get("m", {})
        )

        if score_data["score"] >= 75:
            hotspot_count += 1

    if hotspot_count >= 3:

        recs.append(

            "Multiple biological hotspots were detected."

        )

        recs.append(

            "Mitigation should begin in the highest exposure areas."

        )

    # ------------------------------------------------------
    # Sources
    # ------------------------------------------------------

    for source in sources:

        for item in SOURCE_RECOMMENDATIONS.get(

            source.get("type"),

            [],

        ):

            recs.append(item)

    # ------------------------------------------------------
    # Zones
    # ------------------------------------------------------

    for zone in zones:

        zone_type = zone.get("type")

        if zone_type == "sleep":

            recs.append(

                "Sleeping areas should maintain the lowest achievable exposure."

            )

        elif zone_type == "children":

            recs.append(

                "Children's rooms should follow precautionary exposure principles."

            )

        elif zone_type == "work":

            recs.append(

                "Reduce long-term exposure in work environments."

            )

    # ------------------------------------------------------
    # Primary source
    # ------------------------------------------------------

    primary = get_primary_source(sources)

    if primary:

        profile = get_source_profile(
            primary["type"]
        )

        name = (

            primary.get("label")

            or primary.get("name")

            or primary.get("type")

        )

        recs.append({

            "text": f"Prioritize mitigation of {name}.",

            "priority": "high",

            "impact": "high",

            "category": profile.get(

                "category",

                "source",

            ),

        })

    # ------------------------------------------------------
    # Overall score
    # ------------------------------------------------------

    if score >= 75:

        recs.append(

            "Comprehensive mitigation planning is recommended."

        )

    # ------------------------------------------------------

    recs = deduplicate_recommendations(recs)

    recs = normalize_recommendations(recs)


    print(
        "\n🔥🔥🔥 BUILD RECOMMENDATIONS RESULT"
    )

    print(
        "RECS COUNT:",
        len(
            recs
        ),
    )

    for i, rec in enumerate(
        recs,
        start=1,
    ):

        print(
            "REC",
            i,
            rec,
        )

    print(
        "\n🔥🔥🔥 🔥🔥BUILD RECOMMENDATIONS OUTPUT"
    )

    print(
        "RAW RECS:",
        recs,
    )

    print(
        "RAW RECS COUNT:",
        len(
            recs
        ),
    )    

    return recs