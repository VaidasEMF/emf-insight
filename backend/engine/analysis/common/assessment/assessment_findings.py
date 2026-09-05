"""
Assessment Findings
"""

from engine.pdf_pages.assessment_strings import (
    NEXT_STEP_HIGH,
    NEXT_STEP_MODERATE,
    NEXT_STEP_LOW,
)


def build_assessment_findings(
    analysis,
):
    """
    Build Assessment Summary findings.
    """

    findings = []

    top_points = analysis.get(
        "top_points",
        [],
    )

    if top_points:

        findings.append(
            f"Highest exposure detected in "
            f"{top_points[0].get('room', 'Unknown')}."
        )

    coverage = analysis.get(
        "coverage",
        {},
    )

    findings.append(
        f"{coverage.get('measured_points', 0)} of "
        f"{coverage.get('total_points', 0)} "
        f"measurement points completed."
    )

    room_count = len(
        analysis.get(
            "rooms",
            [],
        )
    )

    findings.append(
        f"{room_count} room(s) assessed."
    )

    source_count = len(
        analysis.get(
            "sources",
            [],
        )
    )

    findings.append(
        f"{source_count} EMF source(s) identified."
    )

    findings.append(
        "Highest-priority mitigation areas have been identified."
    )

    return findings


def build_next_step(
    analysis,
):
    """
    Returns recommended next step.
    """

    score = (
        analysis.get(
            "summary",
            {},
        ).get(
            "score",
            0,
        )
    )

    if score >= 75:
        return NEXT_STEP_HIGH

    if score >= 40:
        return NEXT_STEP_MODERATE

    return NEXT_STEP_LOW