"""
Room Findings

Build room observations.
"""


def build_room_findings(room):

    findings = []

    score = room.get(
        "score",
        0,
    )

    if score >= 75:

        findings.append(
            "High cumulative exposure detected."
        )

    elif score >= 40:

        findings.append(
            "Moderate exposure levels detected."
        )

    else:

        findings.append(
            "Low overall exposure."
        )

    findings.append(

        f"{len(room.get('sources', []))} nearby exposure sources identified."

    )

    findings.append(

        f"{len(room.get('points', []))} measurement points available."

    )

    return findings