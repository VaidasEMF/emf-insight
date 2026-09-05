# =====================
# PROPERTY CERTIFICATION
# =====================


def classify_certification(
    score,
):

    if score <= 20:

        return {
            "level": "Certified Low Exposure",
            "badge": "A+",
            "status": "Excellent",
        }

    elif score <= 40:

        return {
            "level": "Low Exposure",
            "badge": "A",
            "status": "Good",
        }

    elif score <= 60:

        return {
            "level": "Moderate Exposure",
            "badge": "B",
            "status": "Moderate",
        }

    elif score <= 80:

        return {
            "level": "Elevated Exposure",
            "badge": "C",
            "status": "Poor",
        }

    return {
        "level": "High Exposure Environment",
        "badge": "D",
        "status": "High Risk",
    }


# =====================
# BUILD CERTIFICATION
# =====================


def build_certification(
    analysis,
):

    summary = analysis.get(
        "summary",
        {},
    )

    coverage = analysis.get(
        "coverage",
        {},
    )

    score = summary.get(
        "score",
        0,
    )

    coverage_percent = coverage.get(
        "coverage",
        0,
    )

    # =====================
    # NOT ENOUGH DATA
    # =====================

    if coverage_percent < 25:

        return {

            "score": round(score),

            "level": "Preliminary Assessment",

            "badge": "--",

            "status": (
                "Additional measurements required"
            ),

            "eligible": False,
        }

    # =====================
    # NORMAL CERTIFICATION
    # =====================

    data = classify_certification(
        score,
    )

    return {

        "score": round(score),

        "level": data["level"],

        "badge": data["badge"],

        "status": data["status"],

        "eligible": True,
    }