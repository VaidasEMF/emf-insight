"""
Room Builder

Builds presentation model
for Room Analysis PDF page.
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
)


def build_room_analysis(
    room,
    room_overview=None,
):
    """
    Build Room Analysis presentation model.

    Parameters
    ----------
    room:
        Raw room object used for geometry / heatmap.

    room_overview:
        Normalized Room PDF model containing
        coverage and analysis values.
    """

    if not isinstance(
        room_overview,
        dict,
    ):

        room_overview = {}

    # ==================================================
    # BASIC ROOM DATA
    # ==================================================

    room_name = room_overview.get(
        "name",
        room.get(
            "name",
            "Room",
        ),
    )

    room_type = room_overview.get(
        "type",
        room.get(
            "type",
            "Living Area",
        ),
    )

    floor_name = room_overview.get(
        "floor",
        room.get(
            "floor",
            "",
        ),
    )

    # ==================================================
    # MEASUREMENTS
    # ==================================================

    measured_count = room_overview.get(
        "measured_count",
        0,
    )

    coverage = room_overview.get(
        "coverage",
        0,
    )

    avg_rf = room_overview.get(
        "avg_rf",
        0,
    )

    max_rf = room_overview.get(
        "max_rf",
        0,
    )

    avg_electric = room_overview.get(
        "avg_electric",
        0,
    )

    avg_magnetic = room_overview.get(
        "avg_magnetic",
        0,
    )

    risk = room_overview.get(
        "risk",
        "unknown",
    )

    sbm = room_overview.get(
        "sbm",
        "Unknown",
    )

    # ==================================================
    # PRIMARY SOURCE
    # ==================================================

    primary_source = room_overview.get(
        "primary_source",
        room.get(
            "primary_source",
            "-",
        ),
    )

    # ==================================================
    # MEASUREMENT HEIGHT
    # ==================================================

    measurement_height = room_overview.get(
        "measurement_height",
        room.get(
            "measurement_height",
            "120 cm",
        ),
    )

    # ==================================================
    # ASSESSMENT
    # ==================================================

    assessment = {

        "title":
            room_name,

        "floor":
            floor_name,

        "score":
            round(
                avg_rf
            ),

        "avg_rf":
            avg_rf,

        "max_rf":
            max_rf,

        "avg_electric":
            avg_electric,

        "avg_magnetic":
            avg_magnetic,

        "risk":
            risk,

        "status":
            sbm,

        "coverage":
            coverage,

        "measured_points":
            measured_count,

        "color":
            PRIMARY,

    }

    # ==================================================
    # PROPERTIES
    # ==================================================

    properties = [

        {
            "icon": "room",

            "label": "Room Type",

            "value": room_type,
        },

        {
            "icon": "wifi",

            "label": "Primary Source",

            "value": primary_source,
        },

        {
            "icon": "ruler",

            "label": "Measurement Height",

            "value": measurement_height,
        },

    ]

    assessment[
        "properties"
    ] = properties

    # ==================================================
    # COVERAGE
    # ==================================================

    coverage_model = {

        "percent":
            coverage,

        "measured_points":
            measured_count,

        "grid_spacing":
            room_overview.get(
                "grid_spacing",
                room.get(
                    "grid_spacing",
                    "50 cm",
                ),
            ),

        "confidence":
            room_overview.get(
                "confidence",
                "Unknown",
            ),

    }

    # ==================================================
    # RETURN
    # ==================================================

    return {

        # --------------------------------------------------
        # ROOM
        # --------------------------------------------------

        "room": {

            "id":
                room_overview.get(
                    "room_id",
                    room_overview.get(
                        "id",
                        room.get(
                            "id",
                        ),
                    ),
                ),

            "name":
                room_name,

            "type":
                room_type,

            "floor":
                floor_name,

            "floorIndex":
                room_overview.get(
                    "floorIndex",
                    room.get(
                        "floorIndex",
                        0,
                    ),
                ),

        },

        # --------------------------------------------------
        # ASSESSMENT
        # --------------------------------------------------

        "assessment":
            assessment,

        # --------------------------------------------------
        # COVERAGE
        # --------------------------------------------------

        "coverage":
            coverage_model,

        # --------------------------------------------------
        # SOURCES
        # --------------------------------------------------

        "sources":
            room_overview.get(
                "sources",
                [],
            ),

        # --------------------------------------------------
        # FINDINGS
        # --------------------------------------------------

        "findings":
            room_overview.get(
                "findings",
                [],
            ),

        # --------------------------------------------------
        # RECOMMENDATIONS
        # --------------------------------------------------

        "recommendations":
            room_overview.get(
                "recommendations",
                [],
            ),

        # --------------------------------------------------
        # PRIMARY SOURCE
        # --------------------------------------------------

        "primary_source":
            room_overview.get(
                "primary_source",
                None,
            ),

        # --------------------------------------------------
        # WORST AREA
        # --------------------------------------------------

        "worst_area":
            room_overview.get(
                "worst_area",
                None,
            ),

        # --------------------------------------------------
        # RAW VALUES / METRICS
        # --------------------------------------------------

        "metrics": {

            # ----------------------------------------------
            # RF
            # ----------------------------------------------

            "avg_rf":
                avg_rf,

            "max_rf":
                max_rf,

            # ----------------------------------------------
            # ELECTRIC
            # ----------------------------------------------

            "avg_electric":
                avg_electric,

            # ----------------------------------------------
            # MAGNETIC
            # ----------------------------------------------

            "avg_magnetic":
                avg_magnetic,

            # ----------------------------------------------
            # MEASUREMENT
            # ----------------------------------------------

            "measured_points":
                measured_count,

            "coverage":
                coverage,

            # ----------------------------------------------
            # ASSESSMENT
            # ----------------------------------------------

            "risk":
                risk,

            "sbm":
                sbm,

        },

    }