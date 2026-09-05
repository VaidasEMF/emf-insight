"""
Heatmap Analysis Builders

Transforms analysis data into
presentation-ready objects for the PDF.
"""

# ==========================================================
# KPI
# ==========================================================

def build_heatmap_statistics(
    analysis,
):
    """
    Build Heatmap KPI metrics.
    """

    return {

        "max_level": analysis.get(
            "max_rf_level",
            "-",
        ),

        "average": analysis.get(
            "average_rf_level",
            "-",
        ),

        "coverage": analysis.get(
            "coverage_percent",
            "-",
        ),

        "hotspots": analysis.get(
            "hotspot_count",
            "-",
        ),

    }


# ==========================================================
# SUMMARY
# ==========================================================

def build_heatmap_summary(
    analysis,
):
    """
    Build heatmap summary.
    """

    return analysis.get(
        "heatmap_summary",
        (
            "The heatmap visualizes the spatial distribution of "
            "electromagnetic field intensity across the assessed "
            "property. Areas with warmer colors indicate higher "
            "cumulative exposure requiring closer attention."
        ),
    )


# ==========================================================
# FINDINGS
# ==========================================================

def build_heatmap_findings(
    analysis,
):
    """
    Build key findings.
    """

    return analysis.get(
        "heatmap_findings",
        [

            "Exposure distribution successfully calculated.",

            "Potential hotspot areas identified.",

            "Coverage analysis completed.",

            "Heatmap generated from measured data.",

        ],
    )


# ==========================================================
# RECOMMENDATIONS
# ==========================================================

def build_heatmap_recommendations(
    analysis,
):
    """
    Build recommendations.
    """

    return analysis.get(
        "heatmap_recommendations",
        [

            "Review identified hotspot locations.",

            "Consider mitigation in elevated exposure areas.",

            "Repeat measurements after modifications.",

            "Monitor periodically for long-term changes.",

        ],
    )