"""
Measurement Point Collection

Builds normalized measurement point collections from
zone grids or existing point lists.

Used by:
    - Heatmap
    - Room Analysis
    - Zone Analysis
    - Source Analysis
    - Future Session Comparison
"""


def collect_measurement_points(
    analysis,
    session="session_1",
    fallback_key="points_before",
):
    """
    Collect measurement points from zone grids.

    Parameters
    ----------
    analysis : dict

    session : str
        Measurement session name.
        Examples:
            session_1
            session_2

    fallback_key : str
        Key used when no zone grid exists.

    Returns
    -------
    list
    """

    # -----------------------------------------------------
    # Existing points (fallback)
    # -----------------------------------------------------

    points = analysis.get(
        fallback_key,
        [],
    )

    # -----------------------------------------------------
    # Zone grid points
    # -----------------------------------------------------

    zone_points = []

    for zone in analysis.get(
        "zones",
        [],
    ):

        for grid_point in zone.get(
            "grid",
            [],
        ):

            measurements = (
                grid_point
                .get(
                    "measurements",
                    {},
                )
                .get(
                    session,
                    {},
                )
            )

            if not measurements:
                continue

            zone_points.append({

                "id":
                    grid_point.get("id"),

                "x":
                    grid_point.get("x"),

                "y":
                    grid_point.get("y"),

                "room":
                    zone.get("room"),

                "zone":
                    zone.get("type"),

                "m": {

                    "rf":
                        measurements.get(
                            "rf",
                            0,
                        ),

                    "electric":
                        measurements.get(
                            "electric",
                            0,
                        ),

                    "magnetic":
                        measurements.get(
                            "magnetic",
                            0,
                        ),
                },
            })

    # -----------------------------------------------------
    # Prefer zone grid
    # -----------------------------------------------------

    if zone_points:

        print(
            f"Collected {len(zone_points)} grid measurement points."
        )

        return zone_points

    print(
        f"Using fallback measurement points: {len(points)}"
    )

    return points