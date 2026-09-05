# ==========================================================
# ROOM ANALYSIS CARD BUILDER
# ==========================================================
"""
Builds presentation data for one Room Analysis card
inside the Floor Room Analysis page.

Canonical PHI model:

    Room
      ├── Measured Exposure
      ├── Zones (optional)
      ├── Source Context
      ├── Findings
      └── Recommendations

IMPORTANT:

- This builder does NOT calculate exposure.
- Business Survey measurements remain the source of truth.
- Sources are contextual information.
- Sources are NOT added to measured exposure.
- Zones are optional.
- No room-specific values are hardcoded.

SOURCE CONTEXT PRIORITY:

    Zones
       ↓
    Room fallback
       ↓
    Measurement context

If Zones exist, they remain the primary
client-facing spatial context.

If Zones do not exist, Room is used.
"""


# ==========================================================
# HELPERS
# ==========================================================


def _first_value(
    *values,
    default=None,
):
    """
    Return the first meaningful value.
    """

    for value in values:

        if value is None:
            continue

        if isinstance(
            value,
            str,
        ) and not value.strip():

            continue

        return value

    return default


def _safe_list(
    value,
):
    """
    Normalize list-like data.
    """

    if isinstance(
        value,
        list,
    ):
        return value

    if value is None:
        return []

    return [value]


def _safe_dict(
    value,
):
    """
    Normalize dictionary-like data.
    """

    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


def _safe_number(
    value,
    default=0,
):
    """
    Convert numeric values safely.
    """

    try:

        if value is None:
            return default

        return float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return default


# ==========================================================
# SOURCE CONTEXT NORMALIZATION
# ==========================================================


def _normalize_source_context(
    source_context,
):
    """
    Normalize canonical Business Survey source context.

    Preserves:

    - sources
    - primary source
    - zones
    - primary zone
    - distances
    - context level
    - operating state

    IMPORTANT:

    This function only prepares presentation data.

    It does NOT calculate exposure.
    """

    source_context = _safe_dict(
        source_context
    )


    # ======================================================
    # SOURCES
    # ======================================================

    sources = _safe_list(
        source_context.get(
            "sources"
        )
    )


    normalized_sources = []


    for source in sources:

       

        if not isinstance(
            source,
            dict,
        ):
            continue


        distance = _safe_dict(
            source.get(
                "distance"
            )
        )


        zones = _safe_list(
            source.get(
                "zones"
            )
        )


        normalized_zones = []


        for zone in zones:

            if not isinstance(
                zone,
                dict,
            ):
                continue


            normalized_zones.append({

                "zone_id":
                    zone.get(
                        "zone_id"
                    ),

                "zone_name":
                    zone.get(
                        "zone_name",
                        "Zone",
                    ),

                "distance_m":
                    zone.get(
                        "distance_m"
                    ),

                "spatial_relevance":
                    zone.get(
                        "spatial_relevance",
                        "unknown",
                    ),

            })


        primary_zone = source.get(
            "primary_zone"
        )


        if not isinstance(
            primary_zone,
            dict,
        ):

            primary_zone = None


        normalized_sources.append({

            

            # ----------------------------------------------
            # SOURCE IDENTITY
            # ----------------------------------------------

            "source_id":
                source.get(
                    "source_id"
                ),

            "type":
                source.get(
                    "type",
                    "unknown",
                ),

            "label":
                source.get(
                    "label"
                ),

            # ----------------------------------------------
            # ROOM
            # ----------------------------------------------

            "room_id":
                source.get(
                    "room_id"
                ),

            "room_name":
                source.get(
                    "room_name"
                ),

           
            # ----------------------------------------------
            # FLOOR
            # ----------------------------------------------


            

            "source_floor":
                _first_value(

                    source.get(
                        "source_floor"
                    ),

                    source.get(
                        "floorIndex"
                    ),

                    default=None,
                ),

            "room_floor":
                _first_value(

                    source.get(
                        "room_floor"
                    ),

                    source.get(
                        "roomFloor"
                    ),

                    default=None,
                ),

            "same_floor":
                source.get(
                    "same_floor"
                ),

            "source_floor_name":
                source.get(
                    "source_floor_name"
                ),

            "room_floor_name":
                source.get(
                    "room_floor_name"
                ),

            # ----------------------------------------------
            # DISTANCE
            # ----------------------------------------------

            "distance": {

                "to_nearest_measurement_point_m":
                    distance.get(
                        "to_nearest_measurement_point_m"
                    ),

                "to_nearest_zone_m":
                    distance.get(
                        "to_nearest_zone_m"
                    ),

                "to_room_m":
                    distance.get(
                        "to_room_m"
                    ),

                # ------------------------------------------
                # PHI EFFECTIVE DISTANCE
                # ------------------------------------------

                "effective_distance_m":
                    _first_value(

                        source.get(
                            "effective_distance_m"
                        ),

                        source.get(
                            "effective_distance"
                        ),

                        distance.get(
                            "effective_distance_m"
                        ),

                        distance.get(
                            "effective_distance"
                        ),

                        default=None,
                    ),

                "basis":
                    _first_value(

                        source.get(
                            "effective_distance_basis"
                        ),

                        source.get(
                            "distance_basis"
                        ),

                        distance.get(
                            "basis"
                        ),

                        default=None,
                    ),

                "cross_floor_3d":
                    (
                        _first_value(

                            source.get(
                                "effective_distance_basis"
                            ),

                            source.get(
                                "distance_basis"
                            ),

                            distance.get(
                                "basis"
                            ),

                            default=None,
                        )
                        ==
                        "cross_floor_3d"
                    ),
            },

            # ----------------------------------------------
            # MEASUREMENT
            # ----------------------------------------------

            "nearest_measurement_point_id":
                source.get(
                    "nearest_measurement_point_id"
                ),

            # ----------------------------------------------
            # ZONES
            # ----------------------------------------------

            "zones":
                normalized_zones,

            "primary_zone":
                primary_zone,

            # ----------------------------------------------
            # CONTEXT
            # ----------------------------------------------

            "context_level":
                source.get(
                    "context_level",
                    "room",
                ),

            "spatial_relevance":
                source.get(
                    "spatial_relevance",
                    "unknown",
                ),

            # ----------------------------------------------
            # OPERATING STATE
            # ----------------------------------------------

            "operating_state":
                source.get(
                    "operating_state",
                    "unknown",
                ),
        })

   


    # ======================================================
    # PRIMARY SOURCE
    # ======================================================

    primary_source = _first_value(

        source_context.get(
            "primary_source"
        ),

        source_context.get(
            "primarySource"
        ),

        default=None,
    )


    if not isinstance(
        primary_source,
        dict,
    ):

        primary_source = None


    # ======================================================
    # ZONE CONTEXT
    # ======================================================
    #
    # This is the canonical zone-level source context
    # generated by source_context.py.
    #
    # It contains:
    #
    #     zone
    #        ↓
    #     sources
    #
    # This is preserved for future Zone Analysis cards
    # and PDF rendering.
    #

    zone_context = _safe_list(
        source_context.get(
            "zones"
        )
    )


    normalized_zone_context = []


    for zone in zone_context:

        if not isinstance(
            zone,
            dict,
        ):
            continue


        zone_sources = _safe_list(
            zone.get(
                "sources"
            )
        )


        normalized_zone_sources = []


        for source in zone_sources:

            if not isinstance(
                source,
                dict,
            ):
                continue


            normalized_zone_sources.append({

                "source_id":
                    source.get(
                        "source_id"
                    ),

                "type":
                    source.get(
                        "type",
                        "unknown",
                    ),

                "zone_id":
                    source.get(
                        "zone_id"
                    ),

                "zone_name":
                    source.get(
                        "zone_name",
                        "Zone",
                    ),

                "same_floor":
                    source.get(
                        "same_floor"
                    ),


                "source_floor_name":
                    source.get(
                        "source_floor_name"
                    ),

                "room_floor_name":
                    source.get(
                        "room_floor_name"
                    ),    

                "distance_m":
                    source.get(
                        "distance_m"
                    ),

                "spatial_relevance":
                    source.get(
                        "spatial_relevance",
                        "unknown",
                    ),

                "distance_basis":
                    _first_value(

                        source.get(
                            "effective_distance_basis"
                        ),

                        source.get(
                            "distance_basis"
                        ),

                        default=None,
                    ),

                "effective_distance_m":
                    _first_value(

                        source.get(
                            "effective_distance_m"
                        ),

                        source.get(
                            "effective_distance"
                        ),

                        source.get(
                            "distance_m"
                        ),

                        default=None,
                    ),

                "is_cross_floor":
                    (
                        source.get(
                            "same_floor"
                        )
                        is False
                        and
                        (
                            source.get(
                                "effective_distance_basis"
                            )
                            == "cross_floor_3d"
                            or
                            distance.get(
                                "basis"
                            )
                            == "cross_floor_3d"
                        )
                    ),    

                "operating_state":
                    source.get(
                        "operating_state",
                        "unknown",
                    ),
            })


        normalized_zone_context.append({

            "zone_id":
                zone.get(
                    "zone_id"
                ),

            "zone_name":
                zone.get(
                    "zone_name",
                    "Zone",
                ),

            "sources":
                normalized_zone_sources,
        })


    # ======================================================
    # RETURN
    # ======================================================

    return {

        "sources":
            normalized_sources,

        "primary_source":
            primary_source,

        "zones":
            normalized_zone_context,
    }


# ==========================================================
# BUILDER
# ==========================================================


def build_room_analysis_card(
    room,
    room_overview,
):
    """
    Build the presentation model for one Room Analysis card.

    This function is a presentation-layer normalizer.

    It does NOT:

    - calculate EMF exposure
    - calculate source influence
    - calculate source distances
    - calculate zone metrics
    - assign sources to rooms
    - create artificial zones

    It only organizes already calculated analysis data
    into the canonical Room Analysis card model.

    Presentation structure:

        LEFT
            - room / floorplan
            - SBM score
            - measurement coverage
            - top concern

        RIGHT
            - zone analysis
            - source context
    """
    
    # ======================================================
    # NORMALIZATION
    # ======================================================

    if not isinstance(
        room,
        dict,
    ):
        room = {}


    if not isinstance(
        room_overview,
        dict,
    ):
        room_overview = {}

    # ======================================================
    # NESTED MODELS
    # ======================================================



    assessment = _safe_dict(
        room_overview.get(
            "assessment"
        )
    )

    metrics = _safe_dict(
        room_overview.get(
            "metrics"
        )
    )

  

    # ======================================================
    # BASIC ROOM DATA
    # ======================================================

    room_name = _first_value(

        room_overview.get(
            "name"
        ),

        room.get(
            "name"
        ),

        default="Room",
    )


    room_type = _first_value(

        room_overview.get(
            "type"
        ),

        room.get(
            "type"
        ),

        default="Room",
    )


    room_id = _first_value(

        room_overview.get(
            "room_id"
        ),

        room_overview.get(
            "id"
        ),

        room.get(
            "id"
        ),

        default=None,
    )


    floor_name = _first_value(

        room_overview.get(
            "floor_name"
        ),

        room_overview.get(
            "floor"
        ),

        room.get(
            "floor_name"
        ),

        room.get(
            "floor"
        ),

        default="",
    )


    floor_index = _first_value(

        room_overview.get(
            "floorIndex"
        ),

        room.get(
            "floorIndex"
        ),

        default=0,
    )


    # ======================================================
    # MEASURED EXPOSURE
    # ======================================================
    #
    # These values represent actual measured
    # environmental exposure.
    #
    # They are NOT calculated from sources.
    #

    avg_rf = _first_value(

        room_overview.get(
            "avg_rf"
        ),

        metrics.get(
            "avg_rf"
        ),

        default=0,
    )


    max_rf = _first_value(

        room_overview.get(
            "max_rf"
        ),

        metrics.get(
            "max_rf"
        ),

        default=0,
    )


    avg_electric = _first_value(

        room_overview.get(
            "avg_electric"
        ),

        metrics.get(
            "avg_electric"
        ),

        default=0,
    )


    avg_magnetic = _first_value(

        room_overview.get(
            "avg_magnetic"
        ),

        metrics.get(
            "avg_magnetic"
        ),

        default=0,
    )


    # ======================================================
    # MEASUREMENT / COVERAGE
    # ======================================================

    coverage = _first_value(

        room_overview.get(
            "coverage"
        ),

        metrics.get(
            "coverage"
        ),

        default=0,
    )


    measured_count = _first_value(

        room_overview.get(
            "measured_count"
        ),

        room_overview.get(
            "measured_points"
        ),

        metrics.get(
            "measured_points"
        ),

        default=0,
    )


    total_grid_points = _first_value(

        room_overview.get(
            "total_grid_points"
        ),

        metrics.get(
            "total_grid_points"
        ),

        default=0,
    )


    # ======================================================
    # ASSESSMENT
    # ======================================================

    sbm = _first_value(

        room_overview.get(
            "sbm"
        ),

        room_overview.get(
            "status"
        ),

        assessment.get(
            "sbm"
        ),

        assessment.get(
            "status"
        ),

        metrics.get(
            "sbm"
        ),

        default="Unknown",
    )


    risk = _first_value(

        room_overview.get(
            "risk"
        ),

        assessment.get(
            "risk"
        ),

        metrics.get(
            "risk"
        ),

        default="unknown",
    )


    # ======================================================
    # SBM SCORE
    # ======================================================

    score = _first_value(

        room_overview.get(
            "score"
        ),

        room_overview.get(
            "sbm_score"
        ),

        room_overview.get(
            "sbmScore"
        ),

        assessment.get(
            "score"
        ),

        assessment.get(
            "sbm_score"
        ),

        assessment.get(
            "sbmScore"
        ),

        metrics.get(
            "score"
        ),

        metrics.get(
            "sbm_score"
        ),

        default=None,
    )


    if score is not None:

        try:

            score = float(
                score
            )

        except (
            TypeError,
            ValueError,
        ):

            score = None


    

    
    # ======================================================
    # ZONE ANALYSIS
    # ======================================================
    #
    # The Room Overview contains two different Zone layers:
    #
    #     zones
    #         raw / canonical Zone objects
    #
    #     zone_analysis
    #         normalized analytical Zone models
    #
    # The PDF card must use zone_analysis.
    #
    # We do NOT calculate Zone exposure here.
    # The analysis layer has already done that.
    #
    # ======================================================

    zone_analysis = _first_value(

        room_overview.get(
            "zone_analysis"
        ),

        default=[],
    )


    zone_analysis = _safe_list(
        zone_analysis
    )


    # ======================================================
    # SOURCE CONTEXT
    # ======================================================

    source_context = _first_value(

        room_overview.get(
            "source_context"
        ),

        assessment.get(
            "source_context"
        ),

        default=None,
    )


    normalized_source_context = (
        _normalize_source_context(
            source_context
        )
    )


    # ======================================================
    # FINDINGS
    # ======================================================

    findings = _safe_list(
        room_overview.get(
            "findings"
        )
    )


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    recommendations = _safe_list(
        room_overview.get(
            "recommendations"
        )
    )


    # ======================================================
    # ROOM INFORMATION
    # ======================================================

    area = _first_value(

        room_overview.get(
            "area"
        ),

        room_overview.get(
            "area_m2"
        ),

        room_overview.get(
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


    measurement_height = _first_value(

        room_overview.get(
            "measurement_height"
        ),

        room_overview.get(
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


    worst_area = _first_value(

        room_overview.get(
            "worst_area"
        ),

        metrics.get(
            "worst_area"
        ),

        default=None,
    )


    # ======================================================
    # COVERAGE MODEL
    # ======================================================

    coverage_model = room_overview.get(

        "coverage_model",

        room_overview.get(
            "coverage_data",
            None,
        ),
    )


    if not isinstance(
        coverage_model,
        dict,
    ):

        coverage_model = {

            "percent":
                _safe_number(
                    coverage
                ),

            "measured_points":
                measured_count,

            "total_points":
                total_grid_points,
        }


    # ======================================================
    # RETURN
    # ======================================================
   

    return {

        # ==================================================
        # ROOM
        # ==================================================

        "room": {

            "id":
                room_id,

            "name":
                room_name,

            "type":
                room_type,

            "floor":
                floor_name,

            "floorIndex":
                floor_index,
        },


        # ==================================================
        # ASSESSMENT
        # ==================================================

        "assessment": {

            "score":
                score,

            "sbm":
                sbm,

            "risk":
                risk,

            "status":
                sbm,
        },


        # ==================================================
        # MEASURED EXPOSURE
        # ==================================================

        "exposure": {

            "mode":
                "measured",

            "avg_rf":
                avg_rf,

            "max_rf":
                max_rf,

            "avg_electric":
                avg_electric,

            "avg_magnetic":
                avg_magnetic,
        },


        # ==================================================
        # COVERAGE
        # ==================================================

        "coverage":
            coverage_model,


        # ==================================================
        # ZONES
        # ==================================================


        "zone_analysis":
            zone_analysis,


        # ==================================================
        # SOURCE CONTEXT
        # ==================================================

        "source_context":
            normalized_source_context,


        # ==================================================
        # FINDINGS
        # ==================================================

        "findings":
            findings,


        # ==================================================
        # RECOMMENDATIONS
        # ==================================================

        "recommendations":
            recommendations,


        # ==================================================
        # ROOM INFORMATION
        # ==================================================

        "area":
            area,

        "measurement_height":
            measurement_height,

        "worst_area":
            worst_area,


        # ==================================================
        # FLAT PRESENTATION VALUES
        # ==================================================
        #
        # Kept for compatibility with existing renderers.
        #

        "score":
            score,

        "avg_rf":
            avg_rf,

        "avg_electric":
            avg_electric,

        "avg_magnetic":
            avg_magnetic,

        "max_rf":
            max_rf,

        "risk":
            risk,

        "status":
            sbm,

        "coverage_percent":
            coverage,

        "measured_points":
            measured_count,

        "primary_source":
            normalized_source_context.get(
                "primary_source"
            ),


        # ==================================================
        # METRICS
        # ==================================================

        "metrics": {

            "avg_rf":
                avg_rf,

            "avg_electric":
                avg_electric,

            "avg_magnetic":
                avg_magnetic,

            "max_rf":
                max_rf,

            "coverage":
                coverage,

            "measured_points":
                measured_count,

            "total_grid_points":
                total_grid_points,

            "risk":
                risk,

            "sbm":
                sbm,

            "score":
                score,

            "area":
                area,

            "measurement_height":
                measurement_height,

            "worst_area":
                worst_area,
        },
    }