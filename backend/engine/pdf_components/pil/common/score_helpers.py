"""
Score Helpers

Common score utilities used across PHI.
"""


def score_to_label(score):

    if score < 25:
        return "Low"

    if score < 50:
        return "Moderate"

    if score < 75:
        return "High"

    return "Very High"


def score_to_percent(score):

    return max(
        0,
        min(
            100,
            round(score),
        ),
    )


def is_high_risk(score):

    return score >= 75


def is_moderate_risk(score):

    return 40 <= score < 75


def is_low_risk(score):

    return score < 40