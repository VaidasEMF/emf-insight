"""
Home Recommendations Builder

Builds recommendation data for Home Wellness
analysis using human-relevant property context.

This module prepares recommendation input for
the PHI Priority Engine.
"""


# ==========================================================
# IMPORTS
# ==========================================================

from engine.analysis.business.recommendations import (
    build_recommendations,
)


# ==========================================================
# BUILD HOME RECOMMENDATIONS
# ==========================================================

def build_home_recommendations(
    analysis,
):
    """
    Build Home Wellness recommendation data.

    The Home Mode recommendation pipeline uses:

        - measured exposure
        - rooms
        - lifestyle zones
        - occupancy information
        - source context

    The resulting structure is consumed by
    the Recommendations PDF and, later,
    the PHI Priority Engine.
    """

    if not isinstance(
        analysis,
        dict,
    ):
        return {
            "all": [],
            "priority": [],
            "grouped": {},
        }

    # ------------------------------------------------------
    # BASE RECOMMENDATIONS
    # ------------------------------------------------------

    recommendations = build_recommendations(
        analysis,
    )

    if not isinstance(
        recommendations,
        list,
    ):
        recommendations = []

    # ------------------------------------------------------
    # INITIAL PRIORITY
    #
    # Temporary V1 behavior.
    #
    # The actual PHI Priority Engine scoring will replace
    # this selection.
    # ------------------------------------------------------

    priority = recommendations[
        :5
    ]

    # ------------------------------------------------------
    # GROUPS
    #
    # Keep the original recommendation list available.
    # Grouping will be introduced when the Priority Engine
    # is connected.
    # ------------------------------------------------------

    grouped = {}

    for recommendation in recommendations:

        if not isinstance(
            recommendation,
            dict,
        ):
            continue

        category = (
            recommendation.get(
                "category",
                "general",
            )
            or "general"
        )

        grouped.setdefault(
            category,
            [],
        ).append(
            recommendation
        )

    # ------------------------------------------------------
    # RESULT
    # ------------------------------------------------------

    return {
        "all": recommendations,
        "priority": priority,
        "grouped": grouped,
    }