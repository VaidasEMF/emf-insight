"""
PHI Assessment

Canonical assessment object.
"""


def create_assessment(
    score,
    status,
    color,
    heatmap=None,
    properties=None,
    findings=None,
):
    """
    Create canonical assessment object.
    """

    return {

        "score": score,

        "status": status,

        "color": color,

        "heatmap": heatmap,

        "properties": properties or [],

        "findings": findings or [],

    }