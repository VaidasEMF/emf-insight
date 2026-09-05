"""
Room Overview Builder

Builds the normalized Room model used by
Room Analysis PDF pages.

Canonical PHI principles:

- Business Survey measurements are the source of truth.
- Room exposure comes from measured points.
- Zones are optional.
- Sources are NOT assigned directly to rooms here.
- Source information is kept as contextual information only.
- Measured exposure and modeled exposure remain separate.
- No room-specific values are hardcoded.
"""

from engine.analysis.common.source.source_context import (
    build_source_context,
)

from engine.analysis.common.zone.zone_analysis_builder import (
    build_zone_analysis,
)


# ==========================================================
# SAFE HELPERS
# ==========================================================


def _safe_list(
    value,
):
    if isinstance(
        value,
        list,
    ):
        return value

    return []


def _safe_dict(
    value,
):
    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


def _first_value(
    *values,
    default=None,
):
    """
    Return the first meaningful value.

    Empty strings and None are ignored.
    """

    for value in values:

        if value is None:
            continue

        if isinstance(
            value,
            str,
        ):

            if not value.strip():
                continue

        return value

    return default


# ==========================================================
# BUILD ROOM OVERVIEW
# ==========================================================
print(
    "🔥 BUILD_ROOM_OVERVIEW MODULE READY"
)

def build_room_overview(
    room,
    room_summary,
    floor_name,
    floor_index,
    floor_scale,
    floor_elevation_m,
    sources,
    zones,
    rooms,
    floor_elevations=None,
    measurement_scope=None,
):
    """
    Build normalized Room Overview model.

    IMPORTANT
    ---------
    This builder does NOT determine which sources
    affect a room.

    Sources are contextual information and must not
    be added to measured exposure.

    Parameters
    ----------
    room:
        Raw room object.

    room_summary:
        Analytical summary generated from measurements.

    floor_name:
        Current floor name.

    floor_index:
        Current floor index.

    sources:
        Canonical source collection.

        Kept here for compatibility with the current
        pipeline, but NOT spatially assigned to the room.
    """



    # ======================================================
    # INPUT NORMALIZATION
    # ======================================================

    if not isinstance(
        room,
        dict,
    ):
        room = {}

    room_summary = _safe_dict(
        room_summary
    )

    if not isinstance(
        sources,
        list,
    ):
        sources = []


    if not isinstance(
        zones,
        list,
    ):
        zones = []     

    if not isinstance(
        rooms,
        list,
    ):
        rooms = []


    

    # ======================================================
    # GRID
    # ======================================================

    grid = room.get(
        "grid",
        [],
    )

    if not isinstance(
        grid,
        list,
    ):
        grid = []


    total_grid_points = len(
        grid
    )

    floor_elevations = (
        floor_elevations
        if isinstance(
            floor_elevations,
            dict,
        )
        else {}
    )


    # ======================================================
    # MEASURED POINTS
    # ======================================================
    #
    # Business Survey measurement points are the exposure
    # truth.
    #
    # Prefer the canonical measurement points supplied by
    # the analysis pipeline.
    #
    # Fall back to measured grid points only when the
    # canonical points are not available.
    #
    # ======================================================

    measured_points = room.get(
        "measurement_points",
        [],
    )

    if not isinstance(
        measured_points,
        list,
    ):

        measured_points = []


    # ------------------------------------------------------
    # FALLBACK: measured grid points
    # ------------------------------------------------------

    if not measured_points:

        for point in grid:

            if not isinstance(
                point,
                dict,
            ):
                continue

            if point.get(
                "measured",
                False,
            ):

                measured_points.append(
                    point
                )


    measured_count = len(
        measured_points
    )



    # ======================================================
    # COVERAGE
    # ======================================================

    if total_grid_points > 0:

        coverage = round(
            (
                measured_count
                /
                total_grid_points
            )
            * 100
        )

    else:

        coverage = 0


    # ======================================================
    # MEASURED EXPOSURE
    # ======================================================

    avg_rf = _first_value(
        room_summary.get(
            "avg_rf"
        ),
        room.get(
            "avg_rf"
        ),
        default=0,
    )


    max_rf = _first_value(
        room_summary.get(
            "max_rf"
        ),
        room.get(
            "max_rf"
        ),
        default=0,
    )


    avg_electric = _first_value(
        room_summary.get(
            "avg_electric"
        ),
        room.get(
            "avg_electric"
        ),
        default=0,
    )


    avg_magnetic = _first_value(
        room_summary.get(
            "avg_magnetic"
        ),
        room.get(
            "avg_magnetic"
        ),
        default=0,
    )


    point_count = _first_value(
        room_summary.get(
            "point_count"
        ),
        room_summary.get(
            "measured_count"
        ),
        measured_count,
        default=0,
    )


    # ======================================================
    # SBM / RISK
    # ======================================================

    sbm = _first_value(
        room_summary.get(
            "sbm"
        ),
        room.get(
            "sbm"
        ),
        default="Unknown",
    )


    risk = _first_value(
        room_summary.get(
            "risk"
        ),
        room.get(
            "risk"
        ),
        default="unknown",
    )


    # ======================================================
    # SCORE
    # ======================================================

    score = _first_value(
        room_summary.get(
            "score"
        ),
        room_summary.get(
            "sbm_score"
        ),
        room_summary.get(
            "sbmScore"
        ),
        room.get(
            "score"
        ),
        room.get(
            "sbm_score"
        ),
        default=None,
    )


    # ======================================================
    # ZONES
    # ======================================================
    #
    # Zones are supplied to build_room_overview()
    # by the Business Analysis pipeline.
    #
    # IMPORTANT:
    #
    # `zones` may contain all zones belonging to the
    # current floor.
    #
    # Room Overview must keep only zones belonging
    # to the current room.
    #
    # Canonical relationship:
    #
    #     zone.roomId == room.id
    #
    # We do NOT use polygon overlap here because the
    # frontend already stores the canonical room
    # relationship on the Zone object.
    #
    # If no zones are supplied, the room simply has
    # no Zone Analysis.
    # ======================================================


    # ------------------------------------------------------
    # 1. Preserve the canonical function input
    # ------------------------------------------------------

    all_zones = _safe_list(
        zones
    )


    # ------------------------------------------------------
    # 2. Current room
    # ------------------------------------------------------

    room_id = room.get(
        "id"
    )


    # ------------------------------------------------------
    # 3. Filter zones belonging to this room
    # ------------------------------------------------------

    room_zones = []


    for zone in all_zones:

        if not isinstance(
            zone,
            dict,
        ):
            continue


        zone_room_id = zone.get(
            "roomId"
        )


        if (
            room_id is not None
            and
            zone_room_id == room_id
        ):

            room_zones.append(
                zone
            )


    # ------------------------------------------------------
    # 4. Canonical Room Overview zones
    # ------------------------------------------------------

    zones = room_zones

    # ======================================================
    # BUILD ZONE ANALYSIS
    # ======================================================

    zone_analysis = []

    for zone in zones:

        zone_model = build_zone_analysis(
            zone=zone,
            measurement_scope=measurement_scope,
        )

        zone_analysis.append(
            zone_model
        )


   

    for zone_model in zone_analysis:

        print(
            "   ZONE:",
            zone_model.get(
                "type"
            ),
            "| STATUS:",
            zone_model.get(
                "status"
            ),
            "| COVERAGE:",
            zone_model.get(
                "coverage"
            ),
            "| RISK:",
            zone_model.get(
                "risk"
            ),
        )


    


    
    # ======================================================
    # FINDINGS
    # ======================================================

    findings = _first_value(
        room_summary.get(
            "findings"
        ),
        room_summary.get(
            "observations"
        ),
        room.get(
            "findings"
        ),
        default=[],
    )

    findings = _safe_list(
        findings
    )


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    recommendations = _first_value(
        room_summary.get(
            "recommendations"
        ),
        room_summary.get(
            "recommendation"
        ),
        room.get(
            "recommendations"
        ),
        default=[],
    )

    recommendations = _safe_list(
        recommendations
    )


    # ======================================================
    # WORST AREA
    # ======================================================

    worst_area = _first_value(
        room_summary.get(
            "worst_area"
        ),
        room_summary.get(
            "worstArea"
        ),
        room_summary.get(
            "hotspot"
        ),
        room.get(
            "worst_area"
        ),
        default=None,
    )


    # ======================================================
    # MEASUREMENT INFORMATION
    # ======================================================

    grid_spacing = _first_value(
        room_summary.get(
            "grid_spacing"
        ),
        room_summary.get(
            "gridSpacing"
        ),
        room.get(
            "grid_spacing"
        ),
        room.get(
            "gridSize"
        ),
        default=None,
    )


    measurement_height = _first_value(
        room_summary.get(
            "measurement_height"
        ),
        room_summary.get(
            "measurementHeight"
        ),
        room.get(
            "measurement_height"
        ),
        room.get(
            "measurementHeight"
        ),
        default=None,
    )


    confidence = _first_value(
        room_summary.get(
            "confidence"
        ),
        room.get(
            "confidence"
        ),
        default=None,
    )


    # ======================================================
    # AREA
    # ======================================================

    area = _first_value(
        room_summary.get(
            "area"
        ),
        room_summary.get(
            "area_m2"
        ),
        room_summary.get(
            "areaM2"
        ),
        room.get(
            "area"
        ),
        room.get(
            "area_m2"
        ),
        default=None,
    )


    # ======================================================
    # SOURCE CONTEXT
    # ======================================================
    #
    # Business Survey:
    #
    # Measurements = exposure truth.
    #
    # Sources = contextual information only.
    #
    # Source context MUST NOT modify:
    #
    # - RF
    # - Electric
    # - Magnetic
    # - SBM score
    # - Risk
    #
    # ======================================================

        # ======================================================
    # SOURCE CONTEXT
    # ======================================================
    #
    # Business Survey:
    #
    # Measurements = exposure truth.
    #
    # Sources = contextual information only.
    #
    # Source context MUST NOT modify:
    #
    # - RF
    # - Electric
    # - Magnetic
    # - SBM score
    # - Risk
    #
    # ======================================================



    if isinstance(
        sources,
        list,
    ):

        for source in sources:

            if not isinstance(
                source,
                dict,
            ):
                continue

            


    source_context = build_source_context(
        sources=sources,

        room={
            **room,

            "floorIndex":
                floor_index,

            "currentScale":
                floor_scale,
        },

        measured_points=measured_points,

        zones=zones,

        rooms=rooms,

        floor_elevations=floor_elevations,
    )

    


    # ======================================================
    # SAFETY FALLBACK
    # ======================================================

    if not isinstance(
        source_context,
        dict,
    ):

        source_context = {

            "sources":
                [],

            "primary_source":
                None,

            "zones":
                [],
        }


    # ======================================================
    # PRIMARY CONTEXT SOURCE
    # ======================================================

    primary_source = source_context.get(
        "primary_source"
    )
    
    # ======================================================
    # ROOM MODEL
    # ======================================================#
    # This is the normalized Room Overview model.
    #
    # IMPORTANT:
    #
    # - Measured exposure comes from measurements.
    # - Sources are contextual only.
    # - Zones are optional.
    # - Source context does NOT modify score or risk.
    #
    # ======================================================


    model = {

        "id":
            room.get(
                "id",
            ),

        "room_id":
            room.get(
                "id",
            ),

        "code":
            room.get(
                "code",
                "",
            ),

        "name":
            room.get(
                "name",
                "Room",
            ),

        "description":
            room.get(
                "description",
                "",
            ),

        "type":
            room.get(
                "type",
                "",
            ),

        "floor":
            floor_name,

        "floor_name":
            floor_name,

        "floorIndex":
            floor_index,

        "elevation_m":
            floor_elevation_m,    

        "polygon":
            room.get(
                "polygon",
                [],
            ),

        "center":
            room.get(
                "center",
                {},
            ),

        "grid":
            grid,

        "total_grid_points":
            total_grid_points,

        "measured_points":
            measured_points,

        "measured_count":
            measured_count,

        "coverage":
            coverage,

        "grid_spacing":
            grid_spacing,

        "confidence":
            confidence,

        "avg_rf":
            avg_rf,

        "max_rf":
            max_rf,

        "avg_electric":
            avg_electric,

        "avg_magnetic":
            avg_magnetic,

        "point_count":
            point_count,

        "sbm":
            sbm,

        "risk":
            risk,

        "score":
            score,

        "zones":
            zones,

        "zone_analysis":
            zone_analysis,    

        "source_context":
            source_context,

        "primary_source":
            primary_source,

        "area":
            area,

        "measurement_height":
            measurement_height,

        "worst_area":
            worst_area,

        "findings":
            findings,

        "recommendations":
            recommendations,

        "metrics": {

            "avg_rf":
                avg_rf,

            "max_rf":
                max_rf,

            "avg_electric":
                avg_electric,

            "avg_magnetic":
                avg_magnetic,

            "point_count":
                point_count,

            "measured_points":
                measured_count,

            "total_grid_points":
                total_grid_points,

            "coverage":
                coverage,

            "score":
                score,

            "sbm":
                sbm,

            "risk":
                risk,

            "area":
                area,

            "measurement_height":
                measurement_height,

            "worst_area":
                worst_area,
        },
    }

   


    return model