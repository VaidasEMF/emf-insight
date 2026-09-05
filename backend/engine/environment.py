# =====================
# ENVIRONMENTAL QUALITY
# =====================


def classify_environment(
    score,
):

    if score >= 85:

        return "Excellent"

    elif score >= 70:

        return "Good"

    elif score >= 45:

        return "Moderate"

    return "Poor"


# =====================
# BUILD SCORE
# =====================


def compute_environmental_quality(
    analysis,
):

    exposure_score = (
        analysis.get(
            "summary",
            {}
        ).get(
            "score",
            0,
        )
    )

    environment_score = max(
        0,
        100 - exposure_score,
    )

    label = classify_environment(
        environment_score,
    )

    return {
        "score": round(
            environment_score
        ),
        "label": label,
    }
