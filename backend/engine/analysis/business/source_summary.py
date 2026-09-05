from engine.source_profiles import (
    SOURCE_PROFILES,
)

from engine.analysis.common.helpers.score_helpers import (
    normalize_sbm,
)
def build_source_summary(
    sources,
    points,
):
    
   

    source_summary = []

    

    for s in sources:

        print(
            "SOURCE:",
            s.get("type"),
            s.get("id"),
        )

    for source in sources:

        

        source_id = source.get(
            "id"
        )

        source_type = source.get(
            "type",
            "unknown",
        )

        


        profile = SOURCE_PROFILES.get(
            source_type,
            SOURCE_PROFILES["generic"],
        )

        category = profile.get(
            "category",
            "mixed",
        )

      

        source_points = [

            p

            for p in points

            if p.get(
                "dominant_source"
            ) == source_id
        ]

        print(
            source_type,
            "| source_id:",
            source_id,
            "| matched points:",
            len(source_points),
        )

        if not source_points:

            print(
                "SKIPPED:",
                source_type,
                "NO POINTS",
            )

            continue

        rf_values = [
            p.get("m", {}).get(
                "rf",
                0,
            )
            for p in source_points
        ]

        electric_values = [
            p.get("m", {}).get(
                "electric",
                0,
            )
            for p in source_points
        ]

        magnetic_values = [
            p.get("m", {}).get(
                "magnetic",
                0,
            )
            for p in source_points
        ]

        avg_rf = (
            sum(rf_values)
            / len(rf_values)
        )

        max_rf = max(
            rf_values,
            default=0,
        )

        avg_electric = (
            sum(electric_values)
            / len(electric_values)
        )

        max_electric = max(
            electric_values,
            default=0,
        )

        avg_magnetic = (
            sum(magnetic_values)
            / len(magnetic_values)
        )

        max_magnetic = max(
            magnetic_values,
            default=0,
        )

        # =====================
        # RISK
        # =====================

        source_measurement = {

            "rf":
                avg_rf,

            "electric":
                avg_electric,

            "magnetic":
                avg_magnetic,
        }

        risk_data = normalize_sbm(
            source_measurement
        )

        risk = risk_data.get(
            "label",
            "Low",
        )

        source_score = risk_data.get(
            "score",
            0,
        )

       

        # =====================
        # RECOMMENDATION
        # =====================

        if source_type == "wifi_router":

            recommendation = (
                "Increase distance between router and occupied areas."
            )

        elif source_type == "electrical_panel":

            recommendation = (
                "Avoid prolonged occupancy near electrical panel."
            )

        elif source_type == "mobile_tower":

            recommendation = (
                "Review external exposure pathways and shielding options."
            )

        elif source_type == "power_lines":

            recommendation = (
                "Evaluate room usage near external power infrastructure."
            )

        else:

            recommendation = (
                "Monitor exposure levels and reassess after mitigation."
            )

        source_summary.append({

            "id":
                source_id,

            "type":
                source_type,

            "point_count":
                len(
                    source_points
                ),

            "avg_rf":
                round(
                    avg_rf,
                    1,
                ),

            "max_rf":
                round(
                    max_rf,
                    1,
                ),

            "avg_electric":
                round(
                    avg_electric,
                    1,
                ),

            "max_electric":
                round(
                    max_electric,
                    1,
                ),

            "avg_magnetic":
                round(
                    avg_magnetic,
                    1,
                ),

            "max_magnetic":
                round(
                    max_magnetic,
                    1,
                ),

            "risk":
                risk,

            "score":
                round(
                    source_score,
                    0,
                ),    

            "recommendation":
                recommendation,

            "distance":
                source.get(
                    "exactDistance"
                ),

            "direction":
                source.get(
                    "direction"
                ),

            "placement":
                source.get(
                    "placementMode"
                ),

            "hours":
                source.get(
                    "hours",
                    0,
                ),

            "linked_zones":
                source.get(
                    "linkedZoneIds",
                    [],
                ),
        })

    source_summary = sorted(
        source_summary,
        key=lambda s: s.get(
            "score",
            0,
        ),
        reverse=True,
    )

   

    for s in source_summary:

        print(
            s.get("type"),
            "| score:",
            s.get("score"),
        )

    return source_summary