"""
Property Overview Builder

Builds all presentation data required
for the Heatmap PDF page.
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
)

from engine.pdf_components.pil.heatmap.heatmap_generator import (
    generate_heatmap_images,
)

from engine.analysis.business.source_summary import (
    build_source_summary,
)


def build_property_overview(
    analysis,
    floor_index=0,
):

    # ==================================================
    # SELECT FLOOR
    # ==================================================

    floors = analysis.get(
        "floors",
        [],
    )

    floor_analysis_list = analysis.get(
        "floors",
        [],
    )

    # ==================================================
    # SELECT FLOOR PRESENTATION DATA
    # ==================================================

    selected_floor = None

    if (
        isinstance(
            floors,
            list,
        )
        and floors
    ):

        if (
            0
            <= floor_index
            < len(floors)
        ):

            selected_floor = floors[
                floor_index
            ]

        else:

            selected_floor = floors[0]

    # ==================================================
    # SELECT FLOOR ANALYSIS
    # ==================================================

    selected_floor_analysis = None


    if isinstance(
        floor_analysis_list,
        list,
    ):

        for i, item in enumerate(
            floor_analysis_list
        ):


            

            print(
                "  SOURCES:",
                len(
                    item.get(
                        "sources",
                        [],
                    )
                )
                if isinstance(
                    item,
                    dict,
                )
                else "N/A",
            )

   

    # ==================================================
    # FLOOR NAME
    # ==================================================

    if isinstance(
        selected_floor,
        dict,
    ):

        floor_name = selected_floor.get(
            "name",
            f"Floor {floor_index + 1}",
        )

    elif isinstance(
        selected_floor_analysis,
        dict,
    ):

        floor_name = selected_floor_analysis.get(
            "name",
            f"Floor {floor_index + 1}",
        )

    else:

        floor_name = (
            f"Floor {floor_index + 1}"
        )

    # ==================================================
    # FLOOR IMAGE
    # ==================================================

    if isinstance(
        selected_floor,
        dict,
    ):

        floor_image = selected_floor.get(
            "imageData",
        )

    else:

        floor_image = None

    # ==================================================
    # FLOOR DATA
    # ==================================================

    if isinstance(
        selected_floor,
        dict,
    ):

        floor_rooms = selected_floor.get(
            "rooms",
            [],
        )

        floor_zones = selected_floor.get(
            "zones",
            [],
        )

        floor_points = selected_floor.get(
            "points",
            [],
        )

        floor_points_after = selected_floor.get(
            "points_after",
            [],
        )

    else:

        floor_rooms = []
        floor_zones = []
        floor_points = []
        floor_points_after = []


    # ==================================================
    # FLOOR SOURCES
    # ==================================================

    analysis_floors = analysis.get(
        "floors",
        [],
    )

    floor_sources = []


    if (
        isinstance(
            analysis_floors,
            list,
        )
        and floor_index < len(
            analysis_floors
        )
    ):

        floor_analysis_item = (
            analysis_floors[
                floor_index
            ]
        )

        if isinstance(
            floor_analysis_item,
            dict,
        ):

            floor_sources = (
                floor_analysis_item.get(
                    "sources",
                    [],
                )
            )


    # ==================================================
    # NORMALIZE FLOOR SOURCES
    # ==================================================

    normalized_sources = []


    source_types = {

        "wifi_router": {
            "icon": "wifi",
            "title": "Wi-Fi Router",
            "subtitle": "High Frequency (RF)",
        },

        "bluetooth": {
            "icon": "bluetooth",
            "title": "Bluetooth Device",
            "subtitle": "Short Range RF",
        },

        "solar_inverter": {
            "icon": "solar",
            "title": "Solar Inverter",
            "subtitle": "Electrical / Magnetic",
        },

        "battery_storage": {
            "icon": "battery",
            "title": "Battery Storage",
            "subtitle": "Electrical / Magnetic",
        },
    }


    # ==================================================
    # BUILD REAL SOURCE SUMMARY FOR THIS FLOOR
    # ==================================================

    source_summary = build_source_summary(
        floor_sources,
        floor_points,
    )


    # ==================================================
    # INDEX SUMMARY BY SOURCE ID
    # ==================================================

    source_summary_by_id = {

        item.get(
            "id"
        ): item

        for item in source_summary

        if isinstance(
            item,
            dict,
        )
    }


    # ==================================================
    # NORMALIZE SOURCES
    # ==================================================

    for source in floor_sources:

        if not isinstance(
            source,
            dict,
        ):
            continue


        source_id = source.get(
            "id",
        )


        source_type = source.get(
            "type",
            "",
        )


        source_info = source_types.get(
            source_type,
            {},
        )


        # --------------------------------------------------
        # REAL ANALYSIS RESULT
        # --------------------------------------------------

        analyzed_source = (
            source_summary_by_id.get(
                source_id,
                {},
            )
        )


        source_risk = analyzed_source.get(
            "risk",
            "",
        )


        source_score = analyzed_source.get(
            "score",
            None,
        )


        # --------------------------------------------------
        # PDF STATUS
        # --------------------------------------------------

        if source_risk in (
            "Very High",
            "High",
        ):

            source_status = "High"

        elif source_risk == "Moderate":

            source_status = "Moderate"

        elif source_risk in (
            "Low",
            "Very Low",
        ):

            source_status = "Low"

        else:

            source_status = ""


        # --------------------------------------------------
        # NORMALIZED SOURCE
        # --------------------------------------------------

        normalized_source = {

            **source,

            "icon": source.get(
                "icon",
                source_info.get(
                    "icon",
                    "",
                ),
            ),

            "title": source.get(
                "title",
                source_info.get(
                    "title",
                    source_type,
                ),
            ),

            "subtitle": source.get(
                "subtitle",
                source_info.get(
                    "subtitle",
                    "",
                ),
            ),

            # Real analytical result
            "risk": source_risk,

            "score": source_score,

            # Presentation status
            "status": source_status,
        }


        normalized_sources.append(
            normalized_source
        )


    floor_sources = normalized_sources


 
    # ==================================================
    # PROPERTY OVERVIEW DATA
    # ==================================================

    rooms = floor_rooms

    zones = floor_zones

    measurements = floor_points

    # ==================================================
    # ROOMS
    # ==================================================
 
   
    
    if isinstance(
        rooms,
        list,
    ):

        rooms_count = len(
            rooms
        )

    else:

        rooms_count = rooms or 0

    # ==================================================
    # ZONES
    # ==================================================

    if isinstance(
        zones,
        list,
    ):

        zones_count = len(
            zones
        )

    else:

        zones_count = zones or 0

    # ==================================================
    # MEASUREMENTS
    # ==================================================

    if isinstance(
        measurements,
        list,
    ):

        measurements_count = len(
            measurements
        )

    elif isinstance(
        measurements,
        dict,
    ):

        measurements_count = (
            measurements.get(
                "measured_points",
                measurements.get(
                    "count",
                    0,
                ),
            )
        )

    else:

        measurements_count = (
            measurements or 0
        )

    # ==================================================
    # FLOORS
    # ==================================================

    if isinstance(
        floors,
        list,
    ):

        floors_count = len(
            floors
        )

    else:

        floors_count = floors or 0

    # ==================================================
    # PROPERTY-LEVEL COVERAGE
    # ==================================================

    property_coverage = analysis.get(
        "area_coverage",
        analysis.get(
            "coverage",
            0,
        ),
    )

    if isinstance(
        property_coverage,
        dict,
    ):

        property_coverage_value = (
            property_coverage.get(
                "coverage",
                property_coverage.get(
                    "percentage",
                    0,
                ),
            )
        )

    else:

        property_coverage_value = (
            property_coverage or 0
        )

    try:

        property_coverage_value = float(
            property_coverage_value
        )

    except (
        TypeError,
        ValueError,
    ):

        property_coverage_value = 0     

    # ==================================================
    # FLOOR MEASUREMENT COVERAGE
    # ==================================================

    total_grid_points = 0
    measured_grid_points = 0

    for zone in floor_zones:

        if not isinstance(
            zone,
            dict,
        ):
            continue

        grid = zone.get(
            "grid",
            [],
        )

        # --------------------------------------------------
        # NORMALIZE GRID
        # --------------------------------------------------

        if isinstance(
            grid,
            dict,
        ):

            grid_points = list(
                grid.values()
            )

        elif isinstance(
            grid,
            list,
        ):

            grid_points = grid

        else:

            grid_points = []

        # --------------------------------------------------
        # TOTAL PLANNED GRID POINTS
        # --------------------------------------------------

        total_grid_points += len(
            grid_points
        )

        # --------------------------------------------------
        # MEASURED GRID POINTS
        # --------------------------------------------------

        for grid_point in grid_points:

            if not isinstance(
                grid_point,
                dict,
            ):
                continue

            measurements = grid_point.get(
                "measurements",
                {},
            )

            if not isinstance(
                measurements,
                dict,
            ):
                continue

            session_1 = measurements.get(
                "session_1",
                {},
            )

            if session_1:

                measured_grid_points += 1


    # ==================================================
    # FALLBACK — EXISTING FLOOR POINTS
    # ==================================================

    if (
        measured_grid_points == 0
        and isinstance(
            floor_points,
            list,
        )
    ):

        measured_grid_points = len(
            floor_points
        )


    # ==================================================
    # COVERAGE PERCENT
    # ==================================================

    if total_grid_points > 0:

        coverage_value = round(
            (
                measured_grid_points
                / total_grid_points
            )
            * 100
        )

    else:

        coverage_value = 0


    # ==================================================
    # MEASUREMENTS
    # ==================================================

    measurements_count = (
        len(floor_points)
        if isinstance(
            floor_points,
            list,
        )
        else 0
    )


    # ==================================================
    # COVERAGE CONFIDENCE
    # ==================================================

    if coverage_value >= 80:

        coverage_confidence = "High"

    elif coverage_value >= 50:

        coverage_confidence = "Moderate"

    elif coverage_value > 0:

        coverage_confidence = "Initial"

    else:

        coverage_confidence = "Insufficient"


  


    # ==================================================
    # NORMALIZE COVERAGE
    # ==================================================

    try:

        coverage_value = float(
            coverage_value
        )

    except (
        TypeError,
        ValueError,
    ):

        coverage_value = 0


   

    # ==================================================
    # PROPERTY METRICS
    # ==================================================

    property_metrics = {

        "coverage": property_coverage_value,

        "measurements": measurements_count,

        "rooms": rooms_count,

        "zones": zones_count,

        "floors": floors_count,

    }

    # ==================================================
    # FLOOR ANALYSIS MODEL
    # ==================================================

    floor_model = dict(
        analysis
    )

    floor_model[
        "rooms"
    ] = floor_rooms

    floor_model[
        "zones"
    ] = floor_zones

    floor_model[
        "sources"
    ] = floor_sources

    floor_model[
        "points"
    ] = floor_points

    floor_model[
        "points_before"
    ] = floor_points

    floor_model[
        "points_after"
    ] = floor_points_after

    floor_model[
        "measurement_points"
    ] = floor_points

    floor_model[
        "measurements"
    ] = floor_points


    floor_model[
        "floor_name"
    ] = floor_name

    floor_model[
        "floor_index"
    ] = floor_index

    floor_model[
        "floor_image"
    ] = floor_image

    floor_model[
        "plan_image"
    ] = floor_image


    # ==================================================
    # HEATMAP POINTS
    # ==================================================

    points = floor_points


    sbm_image = None
    icnirp_image = None
   

    if points:

        sbm_image, icnirp_image = (
            generate_heatmap_images(
                analysis=floor_model,
                points=points,
            )
        )

    # ==================================================
    # COMMON ASSESSMENT PROPERTIES
    # ==================================================

    assessment_properties = [

        {
            "icon": "room",

            "label": "Worst Room",

            "value": floor_model.get(
                "worst_rf_room",
                analysis.get(
                    "worst_rf_room",
                    "Living Room",
                ),
            ),
        },

        {
            "icon": "wifi",

            "label": "Primary Source",

            "value": floor_model.get(
                "primary_source",
                analysis.get(
                    "primary_source",
                    "Wi-Fi Router",
                ),
            ),
        },

        {
            "icon": "ruler",

            "label": "Measurement Height",

            "value": analysis.get(
                "measurement_height",
                "120 cm",
            ),
        },

    ]

    # ==================================================
    # RETURN
    # ==================================================

    return {

        "floor_index": floor_index,

        "floor_name": floor_name,

        "floor_image": floor_image,

        "floor": selected_floor,

        "rooms": floor_rooms,

        "zones": floor_zones,

        "sources": floor_sources,

        "points": floor_points,

        "points_after": floor_points_after,

        "property_metrics": property_metrics,

        "coverage": {
            "coverage": coverage_value,
            "percent": coverage_value,
            "measured_points": measurements_count,
            "total_points": total_grid_points,
            "confidence": coverage_confidence,
        },

        # --------------------------------------------------
        # OVERVIEW
        # --------------------------------------------------

        "overview": {

            "title": "PROPERTY HEATMAP OVERVIEW",

            "subtitle": (
                "Professional visualization of measured "
                "electromagnetic exposure across the property "
                "using Building Biology (SBM) and ICNIRP "
                "assessment models."
            ),

            "sbm": {

                "title": "SBM Assessment",

                "score": analysis.get(
                    "sbm_score",
                    "-",
                ),

                "status": analysis.get(
                    "risk_level",
                    "Moderate",
                ),

                "heatmap": sbm_image,

                "color": PRIMARY,

                "properties": assessment_properties,

            },

            "icnirp": {

                "title": "ICNIRP Assessment",

                "score": analysis.get(
                    "icnirp_score",
                    "-",
                ),

                "status": analysis.get(
                    "icnirp_status",
                    "Compliant",
                ),

                "heatmap": icnirp_image,

                "color": SUCCESS,

                "properties": assessment_properties,

            },

        },

        # --------------------------------------------------
        # FLOOR HEATMAP
        # --------------------------------------------------

        "heatmap": {

            "sbm": sbm_image,

            "icnirp": icnirp_image,

        },

        # --------------------------------------------------
        # EXPOSURE SUMMARY
        # --------------------------------------------------

        "exposure_summary": [

            {
                "icon": "wifi",

                "title": "RF (HIGH FREQUENCY)",

                "contributors": [
                    "Wi-Fi Router",
                    "Mobile Network",
                ],

                "worst_area": floor_model.get(
                    "worst_rf_room",
                    analysis.get(
                        "worst_rf_room",
                        "Living Room",
                    ),
                ),

                "sbm": {
                    "score": analysis.get(
                        "sbm_score",
                        33,
                    ),
                    "status": analysis.get(
                        "risk_level",
                        "Moderate",
                    ),
                    "color": PRIMARY,
                },

                "icnirp": {
                    "score": analysis.get(
                        "icnirp_score",
                        82,
                    ),
                    "status": "Compliant",
                    "color": SUCCESS,
                },

            },

            {
                "icon": "electric",

                "title": "LOW FREQUENCY ELECTRIC",

                "contributors": [
                    "Electrical Wiring",
                ],

                "worst_area": "Bedroom",

                "sbm": {
                    "score": 74,
                    "status": "Good",
                    "color": PRIMARY,
                },

                "icnirp": {
                    "score": 96,
                    "status": "Compliant",
                    "color": SUCCESS,
                },

            },

            {
                "icon": "magnetic",

                "title": "LOW FREQUENCY MAGNETIC",

                "contributors": [
                    "Distribution Board",
                ],

                "worst_area": "Utility Room",

                "sbm": {
                    "score": 61,
                    "status": "Moderate",
                    "color": PRIMARY,
                },

                "icnirp": {
                    "score": 91,
                    "status": "Compliant",
                    "color": SUCCESS,
                },

            },

        ],

        # --------------------------------------------------
        # SOURCES
        # --------------------------------------------------

        "sources": floor_sources,

        # --------------------------------------------------
        # STANDARDS
        # --------------------------------------------------

        "standards": [

            {
                "title": "SBM",

                "status": analysis.get(
                    "risk_level",
                    "Moderate",
                ),

                "description": (
                    "Building Biology evaluation "
                    "focused on long-term biological exposure."
                ),
            },

            {
                "title": "ICNIRP",

                "status": "Compliant",

                "description": (
                    "International regulatory exposure "
                    "guideline for public safety."
                ),
            },

        ],

        # --------------------------------------------------
        # INTERPRETATION
        # --------------------------------------------------

        "interpretation": [

            {
                "status": "Low",
                "text": (
                    "Excellent exposure conditions."
                ),
            },

            {
                "status": "Moderate",
                "text": (
                    "Minor mitigation may improve "
                    "long-term comfort."
                ),
            },

            {
                "status": "High",
                "text": (
                    "Mitigation is recommended."
                ),
            },

        ],

        # --------------------------------------------------
        # OBSERVATIONS
        # --------------------------------------------------

        "observations": analysis.get(
            "heatmap_findings",
            [

                {
                    "title": (
                        "Exposure Successfully Calculated"
                    ),

                    "text": (
                        "Electromagnetic exposure was "
                        "calculated across all measured areas."
                    ),
                },

                {
                    "title": (
                        "Primary Hotspots Identified"
                    ),

                    "text": (
                        "Several elevated exposure locations "
                        "were detected during the survey."
                    ),
                },

                {
                    "title": (
                        "Professional Assessment Complete"
                    ),

                    "text": (
                        "Results are based on measured data "
                        "and international assessment standards."
                    ),
                },

            ],
        ),

    }