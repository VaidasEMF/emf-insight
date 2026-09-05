# =====================
# SESSIONS MODULE
# =====================

"""
Atsakingas už:

✔ session palyginimą (before / after)
✔ score pokyčių skaičiavimą
✔ interpretaciją (improved / worse / same)
"""

# =====================
# COMPARE SCORES
# =====================


def compare_scores(before_data: dict, after_data: dict) -> dict:
    """
    Lygina du score objektus:
    {
        "score": float,
        "label": str
    }
    """

    before = before_data.get("score", 0)
    after = after_data.get("score", 0)

    diff = after - before

    # interpretacija
    if diff < -5:
        trend = "Improved"
    elif diff > 5:
        trend = "Worsened"
    else:
        trend = "No significant change"

    return {"before": before, "after": after, "diff": diff, "trend": trend}


# =====================
# COMPARE FRAMEWORKS
# =====================


def compare_frameworks(points_before: list, points_after: list, scoring_fn) -> dict:
    """
    Lygina before vs after pagal vieną framework (ICNIRP arba SBM)
    """

    from .scoring import avg_score

    before = avg_score(points_before, scoring_fn)
    after = avg_score(points_after, scoring_fn)

    return compare_scores(before, after)


# =====================
# BUILD COMPARISON TABLE DATA
# =====================


def build_comparison_table(points_before, points_after):
    """
    Paruošia lentelės duomenis PDF'ui
    """

    from .scoring import normalize_icnirp, normalize_sbm

    icnirp = compare_frameworks(points_before, points_after, normalize_icnirp)
    sbm = compare_frameworks(points_before, points_after, normalize_sbm)

    table = [
        ["Framework", "Before", "After", "Change"],
        ["ICNIRP", round(icnirp["before"]), round(icnirp["after"]), icnirp["trend"]],
        ["SBM", round(sbm["before"]), round(sbm["after"]), sbm["trend"]],
    ]

    return table
