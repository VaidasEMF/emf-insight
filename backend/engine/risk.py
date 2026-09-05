# =====================
# RISK ENGINE
# =====================

# =====================
# SCORE → LABEL
# =====================


def get_risk_label(score):

    if score >= 75:

        return "Very High"

    elif score >= 50:

        return "High"

    elif score >= 25:

        return "Moderate"

    return "Low"


# =====================
# SCORE → VARIANT
# =====================


def get_risk_variant(score):

    if score >= 75:

        return "danger"

    elif score >= 40:

        return "warning"

    return "success"


# =====================
# LABEL → VARIANT
# =====================


def label_to_variant(label):

    label = str(label).lower()

    if label in [
        "very high",
        "high",
    ]:

        return "danger"

    elif label == "moderate":

        return "warning"

    return "success"


# =====================
# RISK NARRATIVE
# =====================


def get_risk_narrative(score):

    if score >= 75:

        return "Elevated biological exposure " "conditions were identified."

    elif score >= 40:

        return "Moderate biological exposure " "patterns were observed."

    return "Exposure conditions remained " "within lower precautionary ranges."
