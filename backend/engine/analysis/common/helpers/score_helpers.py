# =====================
# SCORING MODULE
# =====================

"""
Šis modulis atsakingas už:

✔ ICNIRP scoring
✔ SBM scoring
✔ bendrą klasifikaciją (Low → Very High)
✔ vidurkių skaičiavimą

Visi scoring metodai grąžina VIENODĄ struktūrą:
{
    "score": 0–100,
    "label": "Low / Moderate / High / Very High"
}
"""

# =====================
# CLASSIFICATION
# =====================

# =====================
# BIOLOGICAL WEIGHTS
# =====================

RF_WEIGHT = 0.45
MAG_WEIGHT = 0.35
ELEC_WEIGHT = 0.20


def classify(score: float) -> str:
    """
    Paverčia score į tekstinę klasę
    """
    if score < 25:
        return "Low"
    elif score < 50:
        return "Moderate"
    elif score < 75:
        return "High"
    else:
        return "Very High"


# =====================
# ICNIRP
# =====================


def normalize_icnirp(m: dict) -> dict:
    """
    ICNIRP (regulatory) modelis

    Naudoja RF kaip pagrindinį indikatorių.
    Gali vėliau plėsti (electric + magnetic).
    """

    rf = float(m.get("rf", 0))

    # 🔧 paprastas modelis (gali vėliau pakeisti realiais limitais)
    # pvz. 1000 µW/m² ≈ limit → 100 score
    ratio = rf / 1000

    score = max(0, min(100, ratio * 100))

    return {"score": score, "label": classify(score)}


# =====================
# SBM
# =====================


def normalize_sbm(m: dict) -> dict:
    """
    SBM biological exposure model
    """

    rf = float(
        m.get(
            "rf",
            0,
        )
    )

    mag = float(
        m.get(
            "magnetic",
            0,
        )
    )

    elec = float(
        m.get(
            "electric",
            0,
        )
    )

    
    # =====================
    # NORMALIZATION
    # =====================

    rf_score = min(100, (rf / 100) * 100)

    mag_score = min(100, (mag / 2) * 100)

    elec_score = min(100, (elec / 50) * 100)

    # =====================
    # WEIGHTED SCORE
    # =====================

    score = rf_score * RF_WEIGHT + mag_score * MAG_WEIGHT + elec_score * ELEC_WEIGHT

    return {
        "score": round(score),
        "label": classify(score),
    }


# =====================
# ZONE MULTIPLIER
# =====================


def apply_zone_multiplier(
    score,
    zone_type,
):

    zone_type = str(zone_type).lower()

    if zone_type == "bed":

        return score * 1.45

    elif zone_type == "child":

        return score * 1.60

    elif zone_type == "work":

        return score * 1.15

    return score


# =====================
# EUROPAEM (OPTIONAL)
# =====================


def normalize_europaem(m: dict) -> dict:
    """
    EUROPAEM (optional – jei naudoji)
    """

    rf = float(m.get("rf", 0))

    ratio = rf / 300  # tarp ICNIRP ir SBM

    score = max(0, min(100, ratio * 100))

    return {"score": score, "label": classify(score)}


# =====================
# AVERAGE SCORE
# =====================


def avg_score(points: list, fn) -> dict:
    """
    Skaičiuoja vidutinį score per visus taškus

    fn = normalize_icnirp / normalize_sbm
    """

    if not points:
        return {"score": 0, "label": "Low"}

    values = []

    for p in points:
        try:
            data = fn(p["m"])
            values.append(data["score"])
        except:
            continue

    if not values:
        return {"score": 0, "label": "Low"}

    avg = sum(values) / max(1, len(values))

    return {"score": avg, "label": classify(avg)}


# =====================
# MAX HOTSPOT
# =====================


def max_score(points, fn):

    if not points:

        return {
            "score": 0,
            "label": "Low",
        }

    highest = 0

    for p in points:

        try:

            data = fn(p["m"])

            highest = max(
                highest,
                data["score"],
            )

        except:

            continue

    return {
        "score": highest,
        "label": classify(highest),
    }


# =====================
# FORMATTER (PDF UI)
# =====================


def format_score(data: dict) -> str:
    """
    Gražus formatas PDF'ui
    """

    score = round(data.get("score", 0))
    label = data.get("label", "Low")

    return f"{score} / 100 ({label})"

# =====================
# BACKWARD COMPATIBILITY
# =====================

def weighted_exposure_score(m: dict) -> float:
    """
    Legacy helper.

    Returns only the weighted SBM score (0–100).
    """

    return normalize_sbm(m)["score"]
