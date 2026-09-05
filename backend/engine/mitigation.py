# =====================
# MITIGATION ENGINE
# =====================

PRIORITY_SCORE = {
    "low": 1,
    "medium": 2,
    "high": 3,
}

IMPACT_SCORE = {
    "low": 1,
    "moderate": 2,
    "high": 3,
}


# =====================
# COMPUTE SCORE
# =====================


def mitigation_score(item):

    if isinstance(item, str):
        return 1

    priority = item.get(
        "priority",
        "low",
    )

    impact = item.get(
        "impact",
        "low",
    )

    p = PRIORITY_SCORE.get(
        priority,
        1,
    )

    i = IMPACT_SCORE.get(
        impact,
        1,
    )

    return (p * 2) + i


# =====================
# SORT
# =====================


def sort_recommendations(
    recommendations,
):

    return sorted(
        recommendations,
        key=mitigation_score,
        reverse=True,
    )


# =====================
# PHASE GROUPING
# =====================


def recommendation_phase(item):

    if isinstance(item, str):
        return "Monitoring & Best Practices"

    priority = item.get(
        "priority",
        "low",
    )

    impact = item.get(
        "impact",
        "low",
    )

    if priority == "high":

        return "Immediate Actions"

    elif impact == "high":

        return "Optimization Phase"

    return "Monitoring & Best Practices"


# =====================
# GROUP PHASES
# =====================


def group_recommendations(
    recommendations,
):

    grouped = {}

    for item in recommendations:

        phase = recommendation_phase(
            item,
        )

        if phase not in grouped:

            grouped[phase] = []

        grouped[phase].append(
            item,
        )

    return grouped


# =====================
# MITIGATION MATRIX
# =====================


def classify_mitigation(
    item,
):  
    
    if isinstance(item, str):
        return "Optimization"

    priority = item.get(
        "priority",
        "low",
    )

    impact = item.get(
        "impact",
        "moderate",
    )

    # =====================
    # CRITICAL
    # =====================

    if priority == "high" and impact == "high":

        return "Immediate"

    # =====================
    # RECOMMENDED
    # =====================

    if priority == "medium" or impact == "high":

        return "Recommended"

    # =====================
    # OPTIMIZATION
    # =====================

    return "Optimization"


# =====================
# BUILD MATRIX
# =====================

def build_mitigation_matrix(
    recommendations,
):

    result = []

    for item in recommendations:

        # =====================
        # LEGACY STRING FORMAT
        # =====================

        if isinstance(
            item,
            str,
        ):

            result.append(
                {
                    "category": "Optimization",
                    "text": item,
                    "impact": "moderate",
                    "reduction": "N/A",
                }
            )

            continue

        # =====================
        # NEW OBJECT FORMAT
        # =====================

        category = classify_mitigation(
            item,
        )

        result.append(
            {
                "category": category,
                "text": item.get(
                    "text",
                    "",
                ),
                "impact": item.get(
                    "impact",
                    "moderate",
                ),
                "reduction": item.get(
                    "reduction",
                    "N/A",
                ),
            }
        )

    return result
