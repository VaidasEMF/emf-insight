"""
PHI Report Builder

Builds the canonical report model
used by all PDF pages.
"""


def build_report(
    project,
    analysis,
):
    """
    Build canonical PHI Report model.
    """

    return {

        # --------------------------------------------------
        # PROPERTY
        # --------------------------------------------------

        "property": {

            "project": project,

            "analysis": analysis,

        },

        # --------------------------------------------------
        # FLOORS
        # --------------------------------------------------

        "floors": analysis.get(
            "floors",
            [],
        ),

        # --------------------------------------------------
        # SOURCES
        # --------------------------------------------------

        "sources": analysis.get(
            "sources",
            [],
        ),

        # --------------------------------------------------
        # RECOMMENDATIONS
        # --------------------------------------------------

        "recommendations": analysis.get(
            "recommendations",
            [],
        ),

    }