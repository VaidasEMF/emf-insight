# =====================
# ROOM HEALTH INDEX
# =====================


def classify_health(
    score,
):

    if score >= 75:

        return "Poor"

    elif score >= 40:

        return "Moderate"

    return "Good"


# =====================
# INTERPRETATION
# =====================


def health_interpretation(
    label,
):

    if label == "Poor":

        return "Elevated biological exposure " "conditions detected."

    elif label == "Moderate":

        return "Exposure optimization " "recommended."

    return "Environmental conditions remained " "within lower precautionary ranges."


# =====================
# BUILD HEALTH INDEX
# =====================


def build_room_health_index(
    zones,
):

    result = []

    for z in zones:

        score = round(
            z.get(
                "score",
                0,
            )
        )

        label = classify_health(
            score,
        )

        result.append(
            {
                "name": z.get(
                    "name",
                    "Zone",
                ),
                "score": score,
                "health": label,
                "interpretation": (
                    health_interpretation(
                        label,
                    )
                ),
            }
        )

    return result
