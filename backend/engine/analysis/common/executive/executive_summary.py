"""
Executive Summary Analysis

Builds the presentation model for the Executive Hero.
"""



from engine.analysis.common.summary.summary_builder import (
    build_summary,
)


def build_executive_summary(
    project,
    analysis,
):

    summary = build_summary(
        analysis,
    )



    print("🔥 🔥 EXECUTIVE SUMMARY")
    print(summary)

    return {

        "title": "PROPERTY HEALTH SCORE",

        "score": summary["score"],

        "status": summary["label"],

        "subtitle": "Overall Property Health",

        "interpretation": summary["description"],

        "color": summary["color"],

    }

def build_what_this_means(
    project,
    analysis,
):
    """
    About section.
    """

    summary = build_summary(
        analysis,
    )

    return {

        "title": "What this means",

        "text": (
            f"The property achieved an overall Property Health "
            f"Score of {summary['score']}/100 "
            f"({summary['label']}). "
            "This score summarizes cumulative biological "
            "electromagnetic exposure measured throughout the "
            "assessment and highlights where mitigation efforts "
            "will have the greatest impact on long-term "
            "environmental quality."
        ),

    }