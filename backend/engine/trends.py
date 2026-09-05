# =====================
# TREND ENGINE
# =====================

# =====================
# LABEL
# =====================


def get_trend_label(delta):

    if delta >= 15:

        return "worsening"

    elif delta >= 5:

        return "slightly_worsening"

    elif delta <= -15:

        return "improving"

    elif delta <= -5:

        return "slightly_improving"

    return "stable"


# =====================
# ANALYZE
# =====================


def analyze_trend(
    summary_a,
    summary_b,
):

    score_a = summary_a.get(
        "score",
        0,
    )

    score_b = summary_b.get(
        "score",
        0,
    )

    delta = round(
        score_b - score_a,
        1,
    )

    label = get_trend_label(
        delta,
    )

    return {
        "before": round(score_a),
        "after": round(score_b),
        "delta": delta,
        "trend": label,
    }


# =====================
# NARRATIVE
# =====================


def build_trend_narrative(
    trend_data,
):

    trend = trend_data["trend"]

    delta = abs(trend_data["delta"])

    if trend == "worsening":

        return (
            f"Environmental exposure patterns "
            f"increased significantly "
            f"between measurement sessions "
            f"({delta} point increase)."
        )

    elif trend == "slightly_worsening":

        return (
            f"A moderate increase in cumulative "
            f"exposure conditions was observed "
            f"between sessions."
        )

    elif trend == "improving":

        return (
            f"Exposure conditions improved "
            f"substantially between "
            f"measurement sessions."
        )

    elif trend == "slightly_improving":

        return (
            f"A moderate reduction in cumulative " f"exposure conditions was observed."
        )

    return "Exposure conditions remained " "relatively stable between sessions."
