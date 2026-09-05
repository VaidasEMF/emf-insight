def collect_heatmap_points(
    analysis,
):
    """
    Collect measurement points for heatmap generation.
    """

    points = analysis.get(
        "points_before",
        [],
    )

    zone_points = []

    for zone in analysis.get(
        "zones",
        [],
    ):

        for gp in zone.get(
            "grid",
            [],
        ):

            m = (
                gp.get(
                    "measurements",
                    {}
                )
                .get(
                    "session_1",
                    {}
                )
            )

            if not m:
                continue

            zone_points.append({

                "id": gp.get("id"),

                "x": gp.get("x"),

                "y": gp.get("y"),

                "m": {

                    "rf": m.get(
                        "rf",
                        0,
                    ),

                    "electric": m.get(
                        "electric",
                        0,
                    ),

                    "magnetic": m.get(
                        "magnetic",
                        0,
                    ),

                },
            })

    if zone_points:
        return zone_points

    return points