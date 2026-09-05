# =====================
# ZONE SUMMARY
# =====================

from engine.utils import (
    point_in_polygon,
)


def build_zone_summary(
    points,
    zones,
):

    
    

    results = []

    for zone in zones:

       

        polygon = (
            zone.get("polygon")
            or zone.get("points")
            or []
        )

        

      
        # =====================
        # ZONE MEASUREMENTS
        # =====================

        zone_points = []

        for gp in zone.get(
            "grid",
            [],
        ):

            measurements = gp.get(
                "measurements",
                {}
            )

            session_data = measurements.get(
                "session_1"
            )

            if not session_data:
                continue

            zone_points.append(
                {
                    "id": gp.get("id"),

                    "x": gp.get(
                        "x",
                        0,
                    ),

                    "y": gp.get(
                        "y",
                        0,
                    ),

                    "m": {
                        "rf": session_data.get(
                            "rf",
                            0,
                        ),

                        "electric": session_data.get(
                            "electric",
                            0,
                        ),

                        "magnetic": session_data.get(
                            "magnetic",
                            0,
                        ),
                    },
                }
            )

       

        if not zone_points:

            continue

        rf_values = [
            p["m"].get(
                "rf",
                0,
            )
            for p in zone_points
        ]

        electric_values = [
            p["m"].get(
                "electric",
                0,
            )
            for p in zone_points
        ]

        magnetic_values = [
            p["m"].get(
                "magnetic",
                0,
            )
            for p in zone_points
        ]

        avg_rf = (
            sum(rf_values)
            / len(rf_values)
        )

        max_rf = max(
            rf_values
        )

        avg_electric = (
            sum(electric_values)
            / len(electric_values)
        )

        max_electric = max(
            electric_values
        )

        avg_magnetic = (
            sum(magnetic_values)
            / len(magnetic_values)
        )

        max_magnetic = max(
            magnetic_values
        )

        # =====================
        # SBM CLASS (v1)
        # =====================

        if avg_rf < 30:

            sbm = "Good"
            risk = "low"

        elif avg_rf < 100:

            sbm = "Moderate"
            risk = "moderate"

        else:

            sbm = "Poor"
            risk = "high"

        results.append(

            {
                "id":
                    zone.get(
                        "id"
                    ),

                "name":
                    zone.get(
                        "name"
                    )
                    or zone.get(
                        "label"
                    )
                    or zone.get(
                        "type"
                    )
                    or "Zone",

               "type":
                    zone.get(
                        "type"
                    )
                    or "general",

                "point_count":
                    len(
                        zone_points
                    ),

                "avg_rf":
                    avg_rf,

                "max_rf":
                    max_rf,

                "avg_electric":
                    avg_electric,

                "max_electric":
                    max_electric,

                "avg_magnetic":
                    avg_magnetic,

                "max_magnetic":
                    max_magnetic,

                "sbm":
                    sbm,

                "risk":
                    risk,
            }
        )

    return results