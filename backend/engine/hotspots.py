# =====================
# HOTSPOT ENGINE
# =====================


def classify_hotspot(
    score,
):

    if score >= 85:

        return "Critical"

    elif score >= 65:

        return "High"

    elif score >= 40:

        return "Moderate"

    return "Low"


# =====================
# BUILD HOTSPOTS
# =====================


def build_hotspots(
    points,
):

    result = []

    for p in points:

        m = p.get(
            "m",
            {},
        )

        rf = m.get(
            "rf",
            0,
        )

        severity = classify_hotspot(
            rf,
        )

        if severity == "Low":

            continue

        result.append(
            {
                "id": p.get(
                    "id",
                    "Point",
                ),
                "room": p.get(
                    "room",
                    "Unknown",
                ),
                "rf": round(
                    rf,
                    1,
                ),
                "severity": severity,
            }
        )

    # =====================
    # SORT
    # =====================

    result.sort(
        key=lambda x: x["rf"],
        reverse=True,
    )

    return result[:10]
