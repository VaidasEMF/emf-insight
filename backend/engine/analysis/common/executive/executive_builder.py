"""
Executive Builder

Build presentation model
for Executive Summary page.
"""

from .executive_summary import (
    build_executive_summary,
    build_what_this_means,
)

from .executive_metrics import (
    build_executive_metrics,
)

from .executive_findings import (
    build_executive_findings,
    build_executive_priorities,
)


def build_executive(
    project,
    analysis,
):
    """
    Build Executive Summary presentation model.
    """

    overview = build_executive_summary(
        project,
        analysis,
    )

    return {

        "hero": overview,

        "metrics": build_executive_metrics(
            project,
            analysis,
        ),

        "findings": build_executive_findings(
            project,
            analysis,
        ),

        "priorities": build_executive_priorities(
            project,
            analysis,
        ),

        "about": build_what_this_means(
            project,
            analysis,
        ),

    }