# =====================
# SCORING MODULE
# =====================

"""
Common scoring engine used across PHI.

Provides:

- SBM normalization
- ICNIRP normalization
- EUROPAEM normalization
- Average score
- Maximum score
- Risk classification
"""

# ==========================================================
# WEIGHTS
# ==========================================================

RF_WEIGHT = 0.45
MAG_WEIGHT = 0.35
ELEC_WEIGHT = 0.20


# ==========================================================
# CLASSIFICATION
# ==========================================================

def classify(score):

    if score < 25:
        return "Low"

    if score < 50:
        return "Moderate"

    if score < 75:
        return "High"

    return "Very High"


# ==========================================================
# SBM
# ==========================================================

def normalize_sbm(measurements):

    rf = float(
        measurements.get(
            "rf",
            0,
        )
    )

    magnetic = float(
        measurements.get(
            "magnetic",
            0,
        )
    )

    electric = float(
        measurements.get(
            "electric",
            0,
        )
    )

    rf_score = min(
        100,
        rf,
    )

    magnetic_score = min(
        100,
        magnetic / 2 * 100,
    )

    electric_score = min(
        100,
        electric / 50 * 100,
    )

    score = (

        rf_score * RF_WEIGHT +

        magnetic_score * MAG_WEIGHT +

        electric_score * ELEC_WEIGHT

    )

    score = round(score)

    return {

        "score": score,

        "label": classify(score),

    }


# ==========================================================
# ICNIRP
# ==========================================================

def normalize_icnirp(measurements):

    rf = float(
        measurements.get(
            "rf",
            0,
        )
    )

    score = min(
        100,
        rf / 1000 * 100,
    )

    score = round(score)

    return {

        "score": score,

        "label": classify(score),

    }


# ==========================================================
# EUROPAEM
# ==========================================================

def normalize_europaem(measurements):

    rf = float(
        measurements.get(
            "rf",
            0,
        )
    )

    score = min(
        100,
        rf / 300 * 100,
    )

    score = round(score)

    return {

        "score": score,

        "label": classify(score),

    }


# ==========================================================
# ZONE MULTIPLIER
# ==========================================================

def apply_zone_multiplier(
    score,
    zone_type,
):

    zone = str(
        zone_type,
    ).lower()

    if zone == "bed":
        return score * 1.45

    if zone == "child":
        return score * 1.60

    if zone == "work":
        return score * 1.15

    return score


# ==========================================================
# AVERAGE
# ==========================================================

def avg_score(
    points,
    scoring_function,
):

    if not points:

        return {

            "score": 0,

            "label": "Low",

        }

    values = []

    for point in points:

        try:

            result = scoring_function(
                point.get(
                    "m",
                    {},
                )
            )

            values.append(
                result["score"]
            )

        except Exception:

            continue

    if not values:

        return {

            "score": 0,

            "label": "Low",

        }

    score = sum(values) / len(values)

    return {

        "score": score,

        "label": classify(score),

    }


# ==========================================================
# MAX
# ==========================================================

def max_score(
    points,
    scoring_function,
):

    highest = 0

    for point in points:

        try:

            result = scoring_function(
                point.get(
                    "m",
                    {},
                )
            )

            highest = max(
                highest,
                result["score"],
            )

        except Exception:

            continue

    return {

        "score": highest,

        "label": classify(highest),

    }