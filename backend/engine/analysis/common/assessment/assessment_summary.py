"""
Assessment Summary Builder
"""


def build_assessment_summary(
    analysis,
):
    """
    Build hero data for the Assessment Summary page.
    """

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

    description = summary.get(
        "description",
        (
            "The Property Health Score represents the overall "
            "biological electromagnetic exposure measured "
            "throughout the assessed property. The assessment "
            "combines RF measurements, exposure modelling and "
            "biological interpretation to identify the highest "
            "priority mitigation opportunities."
        ),
    )

    return {

        "score": score,

        "label": label,

        "description": description,

    }