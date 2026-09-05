"""
Risk Helpers
"""

from .score_helpers import (
    score_to_label,
)


def risk_variant(score):

    if score >= 75:
        return "danger"

    if score >= 40:
        return "warning"

    return "success"


def risk_color(score):

    if score < 25:
        return "#22C55E"

    if score < 50:
        return "#FACC15"

    if score < 75:
        return "#FB923C"

    return "#EF4444"


def risk_label(score):

    return score_to_label(score)