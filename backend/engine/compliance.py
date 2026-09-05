# =====================
# COMPLIANCE ENGINE
# =====================


def build_compliance(
    analysis,
):

    summary = analysis.get(
        "summary",
        {},
    )

    score = summary.get(
        "score",
        0,
    )

    # =====================
    # ICNIRP
    # =====================

    if score < 90:

        icnirp = "Compliant"

    else:

        icnirp = "Further Assessment Recommended"

    # =====================
    # BIOLOGICAL
    # =====================

    if score < 25:

        biological = "Low Biological Concern"

    elif score < 50:

        biological = "Moderate Biological Concern"

    elif score < 75:

        biological = "Elevated Biological Concern"

    else:

        biological = "High Biological Concern"

    # =====================
    # INTERPRETATION
    # =====================

    if score >= 75:

        interpretation = (
            "Mitigation planning is strongly "
            "recommended for prolonged occupancy "
            "areas."
        )

    elif score >= 40:

        interpretation = (
            "Exposure optimization strategies " "may improve environmental quality."
        )

    else:

        interpretation = (
            "Environmental conditions remained " "within lower precautionary ranges."
        )

    return {
        "icnirp": icnirp,
        "biological": biological,
        "interpretation": interpretation,
    }
