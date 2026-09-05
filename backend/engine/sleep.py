# =====================
# SLEEP RISK ENGINE
# =====================


def classify_sleep_risk(
    score,
):

    if score >= 75:

        return "High"

    elif score >= 40:

        return "Moderate"

    return "Low"


# =====================
# ANALYZE
# =====================


def analyze_sleep_zones(
    zones,
):

    results = []

    for z in zones:

        zone_type = z.get(
            "type",
            "",
        ).lower()

        if zone_type != "bed":

            continue

        score = z.get(
            "score",
            0,
        )

        label = classify_sleep_risk(
            score,
        )

        if label == "High":

            interpretation = (
                "Elevated biological exposure " "may impact restorative sleep."
            )

        elif label == "Moderate":

            interpretation = "Sleep-area exposure optimization " "is recommended."

        else:

            interpretation = (
                "Sleep-area exposure remained " "within lower precautionary ranges."
            )

        results.append(
            {
                "name": z.get(
                    "name",
                    "Sleep Zone",
                ),
                "score": score,
                "risk": label,
                "interpretation": interpretation,
            }
        )

    return results
