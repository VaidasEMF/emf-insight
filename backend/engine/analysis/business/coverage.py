# =====================
# COVERAGE
# =====================

def compute_coverage(
    project,
    points,
):

    measured_points = len(
        points
    )

    total_points = 0

    # =====================
    # ROOM GRID
    # =====================

    for floor in project.get(
        "floors",
        [],
    ):

        for room in floor.get(
            "rooms",
            [],
        ):

            total_points += len(
                room.get(
                    "grid",
                    [],
                )
            )

    coverage = 0

    if total_points > 0:

        coverage = (
            measured_points
            / total_points
        ) * 100

    # =====================
    # LABEL
    # =====================

    if coverage < 10:

        label = "Insufficient"

    elif coverage < 25:

        label = "Low"

    elif coverage < 50:

        label = "Moderate"

    else:

        label = "High"

    return {
        "measured_points":
            measured_points,

        "total_points":
            total_points,

        "coverage":
            round(
                coverage,
                1,
            ),

        "label":
            label,
    }