"""
Home Property Assessment Presentation

Presentation model for the Home Premium PDF.

This layer converts Home Property Assessment analysis
into a PDF-oriented presentation model.

Business Survey presentation logic is intentionally
not used here.
"""


def build_home_presentation(
    project,
    analysis,
):
    """
    Build the Home Premium PDF presentation model.

    Home is context-based and does not require
    physical measurements.
    """

    return {
        "property": {
            "project_id": project.get("id"),
            "floors": analysis.get(
                "floors",
                [],
            ),
        },

        "assessment": {
            "completeness": analysis.get(
                "home",
                {},
            ).get(
                "completeness",
                0,
            ),

            "insight_count": analysis.get(
                "home",
                {},
            ).get(
                "insight_count",
                0,
            ),
        },

        "lifestyle_areas": analysis.get(
            "zones",
            [],
        ),

        "indoor_sources": analysis.get(
            "sources",
            [],
        ),

        "outdoor_sources": [],

        "top_sources": analysis.get(
            "home",
            {},
        ).get(
            "top_sources",
            [],
        ),

        "insights": analysis.get(
            "home",
            {},
        ).get(
            "insights",
            [],
        ),

        "recommendations": [],

        "next_step": {
            "action": "find_professional",
        },
    }