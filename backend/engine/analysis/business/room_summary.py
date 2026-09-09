from engine.analysis.common.scoring import (
    avg_score,
    normalize_sbm,
)

# =====================
# ROOM SUMMARY
# =====================

def build_room_summary(
    points,
):

    room_summary = {}

    def avg(values):

        numeric_values = [
            value
            for value in values
            if value is not None
        ]

        return (
            sum(numeric_values) / len(numeric_values)
            if numeric_values
            else 0
        )

    # ==================================================
    # GROUP POINTS BY FLOOR + ROOM
    # ==================================================

    for p in points:

        if not isinstance(
            p,
            dict,
        ):
            continue

        floor = p.get(
            "floor",
            "Unknown Floor",
        )

        room = p.get(
            "room",
            "Unknown Room",
        )

        key = (
            floor,
            room,
        )

        if key not in room_summary:

            room_summary[key] = {

                "floor":
                    floor,

                "room":
                    room,

                "points":
                    [],

                "rf_values":
                    [],

                "electric_values":
                    [],

                "magnetic_values":
                    [],

            }

        # ----------------------------------------------
        # PRESERVE ORIGINAL POINT
        # ----------------------------------------------

        room_summary[key][
            "points"
        ].append(
            p
        )

        # ----------------------------------------------
        # MEASUREMENTS
        # ----------------------------------------------

        measurements = p.get(
            "m",
            {},
        )

        if not isinstance(
            measurements,
            dict,
        ):
            measurements = {}

        room_summary[key][
            "rf_values"
        ].append(
            measurements.get(
                "rf",
                0,
            )
        )

        room_summary[key][
            "electric_values"
        ].append(
            measurements.get(
                "electric",
                0,
            )
        )

        room_summary[key][
            "magnetic_values"
        ].append(
            measurements.get(
                "magnetic",
                0,
            )
        )

    # ==================================================
    # BUILD FINAL ROOM MODELS
    # ==================================================


    final_rooms = []

    for room_data in room_summary.values():

        # ==================================================
        # BASIC METRICS
        # ==================================================

        avg_rf = avg(
            room_data[
                "rf_values"
            ]
        )

        max_rf = max(
            room_data[
                "rf_values"
            ],
            default=0,
        )

        avg_electric = avg(
            room_data[
                "electric_values"
            ]
        )

        avg_magnetic = avg(
            room_data[
                "magnetic_values"
            ]
        )

        # ==================================================
        # SBM SCORE
        #
        # IMPORTANT:
        # Score is calculated from the SAME measurement
        # points using the canonical normalize_sbm()
        # scoring function.
        # ==================================================

        sbm_result = avg_score(
            room_data[
                "points"
            ],
            normalize_sbm,
        )

        sbm_score = sbm_result.get(
            "score",
            0,
        )

        sbm_label = sbm_result.get(
            "label",
            "Low",
        )

        # ==================================================
        # RISK
        #
        # Keep existing Room risk semantics.
        # ==================================================

        if avg_rf < 30:

            risk = "low"

        elif avg_rf < 100:

            risk = "moderate"

        else:

            risk = "high"

        # ==================================================
        # FINAL ROOM MODEL
        # ==================================================

        final_rooms.append({

            "floor":
                room_data[
                    "floor"
                ],

            "room":
                room_data[
                    "room"
                ],

            # ------------------------------------------
            # EXPOSURE
            # ------------------------------------------

            "avg_rf":
                avg_rf,

            "max_rf":
                max_rf,

            "avg_electric":
                avg_electric,

            "avg_magnetic":
                avg_magnetic,

            # ------------------------------------------
            # POINTS
            # ------------------------------------------

            "point_count":
                len(
                    room_data[
                        "points"
                    ]
                ),

            # ------------------------------------------
            # SBM
            # ------------------------------------------

            "sbm_score":
                round(
                    sbm_score
                ),

            "score":
                round(
                    sbm_score
                ),

            "sbm":
                sbm_label,

            # ------------------------------------------
            # RISK
            # ------------------------------------------

            "risk":
                risk,

        })

    return final_rooms
    


  