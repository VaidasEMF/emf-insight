"""
Property Helpers

Common Property Health Intelligence helper functions.

Used by:
    - Analysis
    - PDF
    - Dashboard
    - API
    - AI Reports
"""


def get_room_count(analysis):

    return len(
        analysis.get(
            "rooms",
            [],
        )
    )


def get_zone_count(analysis):

    return len(
        analysis.get(
            "zones",
            [],
        )
    )


def get_source_count(analysis):

    return len(
        analysis.get(
            "sources",
            [],
        )
    )


def get_measurement_count(
    analysis,
    key="points_before",
):

    return len(
        analysis.get(
            key,
            [],
        )
    )


def get_top_points(
    analysis,
):

    return analysis.get(
        "top_points",
        [],
    )


def get_worst_point(
    analysis,
):

    points = get_top_points(
        analysis,
    )

    if not points:

        return None

    return points[0]


def get_worst_room(
    analysis,
):

    point = get_worst_point(
        analysis,
    )

    if not point:

        return "Unknown"

    return point.get(
        "room",
        "Unknown",
    )


def get_summary(
    analysis,
):

    return analysis.get(
        "summary",
        {},
    )


def get_score(
    analysis,
):

    return round(
        get_summary(
            analysis,
        ).get(
            "score",
            0,
        )
    )


def get_risk_label(
    analysis,
):

    return get_summary(
        analysis,
    ).get(
        "label",
        "Unknown",
    )


def get_coverage(
    analysis,
):

    return analysis.get(
        "coverage",
        {},
    )


def get_coverage_percent(
    analysis,
):

    return get_coverage(
        analysis,
    ).get(
        "coverage",
        0,
    )


def get_primary_source(
    analysis,
):

    sources = analysis.get(
        "sources",
        [],
    )

    if not sources:

        return None

    if "score" in sources[0]:

        return max(
            sources,
            key=lambda s: s.get(
                "score",
                0,
            ),
        )

    return sources[0]


def get_project_id(
    analysis,
):

    return analysis.get(
        "project_id",
        "-",
    )