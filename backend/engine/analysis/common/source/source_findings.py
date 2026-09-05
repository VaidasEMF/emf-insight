"""
Source Findings
"""


def build_source_findings(source):

    findings = []

    findings.append(

        f"Source type: {source.get('type', 'Unknown')}."

    )

    if source.get(
        "distance",
    ) is not None:

        findings.append(

            f"Approximate distance: {round(source['distance'],1)} m."

        )

    score = source.get(
        "score",
        0,
    )

    if score >= 75:

        findings.append(

            "Primary mitigation target."

        )

    elif score >= 40:

        findings.append(

            "Moderate contribution to exposure."

        )

    else:

        findings.append(

            "Minor contribution."

        )

    return findings