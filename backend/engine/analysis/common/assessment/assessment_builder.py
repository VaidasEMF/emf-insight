"""
Assessment Builder

Builds all presentation data required
for the Assessment Summary PDF page.
"""


def build_assessment(
    project,
    analysis,
):
    """
    Build Assessment presentation model.
    """

    scores = analysis.get("scores", {})
    compliance = analysis.get("compliance", {})

    return {

        # --------------------------------------------------
        # HERO
        # --------------------------------------------------

        "overview":{

            "score": scores.get(
                "property_health",
                scores.get("overall", "-"),
            ),

            "label": analysis.get(
                "risk_level",
                "UNKNOWN",
            ),

            "subtitle": "Overall Property Health",

            "description": (
                "The Property Health Score represents the overall "
                "biological electromagnetic exposure measured "
                "throughout the assessed property."
            ),

        },

        # --------------------------------------------------
        # KPI
        # --------------------------------------------------

        "metrics": {

            "risk_level": analysis.get(
                "risk_level",
                "-",
            ),

            "sbm_score": scores.get(
                "sbm",
                "-",
            ),

            "compliance": compliance.get(
                "status",
                "Unknown",
            ),

            "status": analysis.get(
                "report_status",
                "Completed",
            ),

        },

        # --------------------------------------------------
        # SUMMARY
        # --------------------------------------------------

        
        "summary": analysis.get(
            "summary"
        ) or (
            "The assessment evaluates the overall "
            "electromagnetic environment of the property "
            "using the Property Health Intelligence model."
        ),

        # --------------------------------------------------
        # FINDINGS
        # --------------------------------------------------

        "findings": analysis.get(
            "findings",
            [
                {
                    "text": "Assessment completed successfully."
                },
                {
                    "text": "Highest exposure areas identified."
                },
                {
                    "text": "Property Health Score calculated."
                },
                {
                    "text": "Biological interpretation generated."
                },
            ],
        ),

        # --------------------------------------------------
        # WHAT THIS MEANS
        # --------------------------------------------------

        "interpretation": analysis.get(
            "narrative",
            (
                "Measured exposure levels indicate the current "
                "condition of the property and identify the most "
                "important opportunities for exposure reduction."
            ),
        ),

        # --------------------------------------------------
        # ABOUT
        # --------------------------------------------------

        "about": (
            "This assessment combines measured RF exposure, "
            "Building Biology principles and international "
            "exposure standards into a single Property Health "
            "Intelligence evaluation."
        ),

    }