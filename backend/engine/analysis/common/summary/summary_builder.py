"""
Property Health Summary Builder

Single source of truth for the entire Premium PDF.
"""

from engine.pdf_components.framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
)


def get_score_color(score):

    if score >= 80:
        return SUCCESS

    if score >= 60:
        return WARNING

    return DANGER


def build_summary(analysis):

    summary = analysis.get(
        "summary",
        {},
    )

    score = round(
        summary.get(
            "score",
            0,
        )
    )

    label = summary.get(
        "label",
        "Unknown",
    )

    return {

        "score": score,

        "label": label,

        "color": get_score_color(score),

        "description": (
            "The Property Health Score represents the overall "
            "electromagnetic health condition of the property "
            "based on cumulative biological exposure."
        ),

        "sbm": {

            "score": score,

            "label": label,

        },

        "icnirp": {

            "score": summary.get(
                "icnirp_score",
                96,
            ),

            "label": summary.get(
                "icnirp_label",
                "Compliant",
            ),

        },

        "coverage": round(
            analysis.get(
                "coverage",
                {},
            ).get(
                "coverage",
                0,
            )
        ),

    }