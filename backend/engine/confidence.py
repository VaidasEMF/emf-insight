# =====================
# CONFIDENCE ENGINE
# =====================


def compute_confidence(
    analysis,
):

    points = analysis.get(
        "points",
        [],
    )

    zones = analysis.get(
        "zones",
        [],
    )

    sources = analysis.get(
        "sources",
        [],
    )

    score = 0

    # =====================
    # POINT COVERAGE
    # =====================

    point_count = len(points)

    if point_count >= 20:

        score += 40

    elif point_count >= 10:

        score += 25

    elif point_count >= 5:

        score += 15

    # =====================
    # ZONES
    # =====================

    zone_count = len(zones)

    if zone_count >= 4:

        score += 25

    elif zone_count >= 2:

        score += 15

    # =====================
    # SOURCES
    # =====================

    source_count = len(sources)

    if source_count >= 5:

        score += 20

    elif source_count >= 2:

        score += 10

    # =====================
    # DATA QUALITY
    # =====================

    valid_points = 0

    for p in points:

        m = p.get(
            "m",
            {},
        )

        if "rf" in m:

            valid_points += 1

    if point_count > 0:

        ratio = valid_points / point_count

        score += int(ratio * 15)

    # =====================
    # LABEL
    # =====================

    if score >= 75:

        label = "High"

    elif score >= 45:

        label = "Moderate"

    else:

        label = "Low"

    return {
        "score": score,
        "label": label,
    }
