"""
Home Recommendations

Build recommendations for Home Wellness reports.
"""

from engine.analysis.business.recommendations import (
    build_recommendations,
)

from engine.mitigation import (
    sort_recommendations,
    group_recommendations,
)


def build_home_recommendations(
    analysis,
):
    """
    Returns grouped recommendations for
    Home Wellness reports.
    """

    recommendations = build_recommendations(
        analysis,
    )

    recommendations = sort_recommendations(
        recommendations,
    )

    grouped = group_recommendations(
        recommendations,
    )

    return {

        "all": recommendations,

        "priority": recommendations[:5],

        "grouped": grouped,

    }