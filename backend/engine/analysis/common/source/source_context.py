# ==========================================================
# SOURCE CONTEXT ANALYZER
# ==========================================================
"""
Builds contextual relationships between EMF sources
and Rooms / Zones for Business Survey analysis.

IMPORTANT
---------

This module does NOT calculate exposure.

Business Survey exposure comes from measured points.

Sources are used only as contextual information:

    Source
        ↓
    Spatial Context
        ↓
    Relevance
        ↓
    Interpretation / Recommendations


CANONICAL BUSINESS MODEL
------------------------

When Zones exist:

    Source
       ↓
    Relevant Zones
       ↓
    Room fallback
       ↓
    Measurement context


When Zones do NOT exist:

    Source
       ↓
    Room
       ↓
    Measurement context


IMPORTANT:

Source context MUST NEVER modify:

- avg_rf
- max_rf
- avg_electric
- avg_magnetic
- SBM score
- ICNIRP score
- risk


Distances:

- to_nearest_measurement_point_m
- to_nearest_zone_m
- to_room_m

All same-floor distances are converted from floor-plan
coordinates to real-world meters using currentScale.

Cross-floor XY distance is NOT treated as 3D distance.
"""


import math


# ==========================================================
# SAFE HELPERS
# ==========================================================


def _safe_float(
    value,
    default=None,
):
    """
    Safely convert a value to float.
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


def _safe_list(
    value,
):
    """
    Return list or empty list.
    """

    if isinstance(
        value,
        list,
    ):
        return value

    return []


def _safe_dict(
    value,
):
    """
    Return dict or empty dict.
    """

    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


# ==========================================================
# POINT DISTANCE
# ==========================================================


def _distance_2d(
    x1,
    y1,
    x2,
    y2,
):
    """
    Euclidean 2D distance.
    """

    return math.hypot(
        x1 - x2,
        y1 - y2,
    )


# ==========================================================
# POINT EXTRACTION
# ==========================================================


def _point_coordinates(
    point,
):
    """
    Extract X/Y coordinates.
    """

    if not isinstance(
        point,
        dict,
    ):
        return None

    x = _safe_float(
        point.get(
            "x"
        )
    )

    y = _safe_float(
        point.get(
            "y"
        )
    )

    if x is None or y is None:
        return None

    return (
        x,
        y,
    )


# ==========================================================
# SOURCE COORDINATES
# ==========================================================


def _source_coordinates(
    source,
):
    """
    Extract X/Y coordinates from source.
    """

    if not isinstance(
        source,
        dict,
    ):
        return None

    x = _safe_float(
        source.get(
            "x"
        )
    )

    y = _safe_float(
        source.get(
            "y"
        )
    )

    if x is None or y is None:
        return None

    return (
        x,
        y,
    )


# ==========================================================
# FLOOR SCALE
# ==========================================================


def _get_floor_scale(
    room,
):
    """
    Return calibrated meters-per-pixel / meters-per-plan-unit.

    currentScale is the canonical value passed from the
    floor model.
    """

    if not isinstance(
        room,
        dict,
    ):
        return 0

    scale = room.get(
        "currentScale",
        0,
    )

    scale = _safe_float(
        scale,
        0,
    )

    if scale is None or scale <= 0:
        return 0

    return scale


# ==========================================================
# OPERATING STATE
# ==========================================================


def get_source_operating_state(
    source,
):
    """
    Normalize source operating state.

    Returns:

        on
        off
        standby
        intermittent
        unknown
    """

    if not isinstance(
        source,
        dict,
    ):
        return "unknown"

    # ------------------------------------------------------
    # Explicit state
    # ------------------------------------------------------

    state = source.get(
        "operatingState"
    )

    if state is None:

        state = source.get(
            "operating_state"
        )

    if state is not None:

        normalized = str(
            state
        ).strip().lower()

        if normalized in {
            "on",
            "active",
            "enabled",
        }:

            return "on"

        if normalized in {
            "off",
            "inactive",
            "disabled",
        }:

            return "off"

        if normalized == "standby":

            return "standby"

        if normalized in {
            "intermittent",
            "periodic",
        }:

            return "intermittent"


    # ------------------------------------------------------
    # Boolean state
    # ------------------------------------------------------

    if source.get(
        "isOn"
    ) is True:

        return "on"

    if source.get(
        "is_on"
    ) is True:

        return "on"

    if source.get(
        "enabled"
    ) is True:

        return "on"


    if source.get(
        "isOn"
    ) is False:

        return "off"

    if source.get(
        "is_on"
    ) is False:

        return "off"

    if source.get(
        "enabled"
    ) is False:

        return "off"


    return "unknown"


# ==========================================================
# PHI SOURCE CLASSIFICATION
# ==========================================================

def classify_source_class(
    source,
):
    """
    Classify a source for PHI Spatial Relevance.

    This is a contextual classification.
    It does NOT determine EMF exposure.
    """

    if not isinstance(
        source,
        dict,
    ):
        return "unknown"

    source_type = str(
        source.get(
            "type",
            "",
        )
    ).strip().lower()

    # ------------------------------------------------------
    # INDOOR LOCAL
    # ------------------------------------------------------

    if source_type in (
        "wifi_router",
        "wifi",
        "wireless_router",
        "bluetooth",
        "bluetooth_device",
        "dect",
        "dect_phone",
        "indoor_access_point",
        "access_point",
        "smart_tv",
        "tv",
        "computer",
        "monitor",
    ):
        return "indoor_local"

    # ------------------------------------------------------
    # OUTDOOR LOCAL
    # ------------------------------------------------------

    if source_type in (
        "ev_charger",
        "outdoor_access_point",
        "outdoor_wifi",
        "outdoor_equipment",
        "solar_inverter",
    ):
        return "outdoor_local"

    # ------------------------------------------------------
    # OUTDOOR INFRASTRUCTURE
    # ------------------------------------------------------

    if source_type in (
        "mobile_tower",
        "cell_tower",
        "base_station",
        "radio_transmitter",
        "tv_transmitter",
        "broadcast_antenna",
        "communication_antenna",
        "radar",
    ):
        return "outdoor_infrastructure"

    # ------------------------------------------------------
    # ELECTRICAL INFRASTRUCTURE
    # ------------------------------------------------------

    if source_type in (
        "power_line",
        "transformer",
        "substation",
        "electrical_panel",
        "electrical_cabinet",
        "high_voltage_line",
    ):
        return "electrical_infrastructure"

    return "unknown"

# ==========================================================
# PHI SOURCE ENVIRONMENT
# ==========================================================

def classify_source_environment(
    source,
    source_class=None,
):
    """
    Determine whether the source is indoor or outdoor.

    Explicit source environment has priority.

    Falls back to PHI source-class defaults.
    """

    if not isinstance(
        source,
        dict,
    ):
        return "unknown"

    # ------------------------------------------------------
    # EXPLICIT ENVIRONMENT
    # ------------------------------------------------------

    environment = source.get(
        "environment"
    )

    if environment:

        environment = str(
            environment
        ).strip().lower()

        if environment in (
            "indoor",
            "outdoor",
        ):
            return environment

    # ------------------------------------------------------
    # CLASS DEFAULT
    # ------------------------------------------------------

    if source_class == "indoor_local":
        return "indoor"

    if source_class in (
        "outdoor_local",
        "outdoor_infrastructure",
    ):
        return "outdoor"

    if source_class == "electrical_infrastructure":

        # Electrical infrastructure can exist
        # in either environment.
        return "unknown"

    return "unknown"

# ==========================================================
# PHI SPATIAL RELATIONSHIP
# ==========================================================

def classify_spatial_relationship(
    source,
    room,
    zone=None,
    same_floor=True,
):

    if not isinstance(
        source,
        dict,
    ):
        return "unknown"

    if not isinstance(
        room,
        dict,
    ):
        room = {}

    if not isinstance(
        zone,
        dict,
    ):
        zone = {}

    # ======================================================
    # CROSS FLOOR
    # ======================================================

    if not same_floor:
        return "cross_floor"

    # ======================================================
    # SAME ZONE
    # ======================================================

    source_zone_id = source.get(
        "zone_id"
    )

    zone_id = zone.get(
        "id"
    )

    if (
        source_zone_id
        and zone_id
        and source_zone_id == zone_id
    ):
        return "same_zone"

    # ======================================================
    # SAME ROOM
    # ======================================================

    source_room_id = (
        source.get(
            "room_id"
        )
        or source.get(
            "roomId"
        )
    )

    room_id = (
        room.get(
            "id"
        )
        or room.get(
            "room_id"
        )
    )

    if (
        source_room_id
        and room_id
        and source_room_id == room_id
    ):
        return "same_room"

    # ======================================================
    # OUTDOOR / EXTERNAL
    # ======================================================

    source_class = classify_source_class(
        source
    )

    if source_class in (
        "outdoor_local",
        "outdoor_infrastructure",
        "electrical_infrastructure",
    ):

        return "building_adjacent"

    # ======================================================
    # UNKNOWN
    # ======================================================

    return "unknown"

# ==========================================================
# RELEVANCE
# ==========================================================
def classify_spatial_relevance(
    distance,
    source_class="unknown",
    environment="unknown",
    spatial_relationship="unknown",
    same_floor=True,
):
    """
    PHI Spatial Relevance Matrix v1.0.

    IMPORTANT:

    This calculates contextual spatial relevance only.

    It does NOT calculate:

    - RF exposure
    - electric exposure
    - magnetic exposure
    - SBM score
    - health risk
    - compliance
    """

    if distance is None:
        return "unknown"

    distance = _safe_float(
        distance
    )


   

    if distance is None or distance < 0:
        return "unknown"

    source_class = str(
        source_class or "unknown"
    ).strip().lower()

    environment = str(
        environment or "unknown"
    ).strip().lower()

    spatial_relationship = str(
        spatial_relationship or "unknown"
    ).strip().lower()

    # ======================================================
    # CROSS FLOOR
    # ======================================================

    if spatial_relationship == "cross_floor":

        # If we have a valid 3D distance,
        # the value may be interpreted contextually.
        #
        # Without 3D geometry the caller should normally
        # provide UNKNOWN instead.

        if not same_floor:
            return "moderate"

        # ======================================================
    # INDOOR LOCAL
    # ======================================================
    #
    # Examples:
    #
    # - Wi-Fi Router
    # - Bluetooth
    # - DECT
    # - Indoor Access Point
    #
    # PHI distance bands:
    #
    # 0–1 m       VERY HIGH
    # >1–3 m      HIGH
    # >3–7 m      MODERATE
    # >7–15 m     LOW
    # >15 m       VERY LOW
    #
    # These are spatial relevance bands.
    # They are NOT exposure limits.
    # ======================================================

    if source_class == "indoor_local":

        if distance <= 1:

            return "very_high"


        if distance <= 3:

            return "high"


        if distance <= 7:

            return "moderate"


        if distance <= 15:

            return "low"


        return "very_low"


    # ======================================================
    # OUTDOOR LOCAL
    # ======================================================
    #
    # Examples:
    #
    # - EV Charger
    # - Outdoor Access Point
    # - Local external equipment
    #
    # Preferred spatial reference:
    #
    # Source → Building / Property Boundary
    #
    # PHI distance bands:
    #
    # 0–2 m       VERY HIGH
    # >2–5 m      HIGH
    # >5–15 m     MODERATE
    # >15–30 m    LOW
    # >30 m       VERY LOW
    #
    # These are spatial relevance bands.
    # They are NOT exposure limits.
    # ======================================================

    if source_class == "outdoor_local":

        if distance <= 2:

            return "very_high"


        if distance <= 5:

            return "high"


        if distance <= 15:

            return "moderate"


        if distance <= 30:

            return "low"


        return "very_low"


    # ======================================================
    # OUTDOOR INFRASTRUCTURE
    # ======================================================
    #
    # Examples:
    #
    # - Mobile Tower
    # - Cellular Base Station
    # - Radio / TV Transmitter
    #
    # IMPORTANT:
    #
    # Infrastructure is contextual.
    #
    # These categories describe spatial relevance only.
    # They are NOT exposure limits.
    #
    # Primary factor:
    #
    #     spatial relationship
    #
    # Secondary factor:
    #
    #     defensible distance
    #
    # ======================================================

    if source_class == "outdoor_infrastructure":

        # --------------------------------------------------
        # BUILDING ADJACENT
        # --------------------------------------------------

        if spatial_relationship == (
            "building_adjacent"
        ):

            print(
                "🔥🔥🔥 INFRA MATRIX CHECK:",
                "| DISTANCE:",
                distance,
                "| RELATIONSHIP:",
                spatial_relationship,
                "| <=10:",
                distance <= 10,
            )


            if distance <= 10:

                print(
                    "🔥🔥🔥 CLASSIFIER RETURN: VERY_HIGH",
                    "| CLASS:",
                    source_class,
                    "| DISTANCE:",
                    distance,
                    "| RELATIONSHIP:",
                    spatial_relationship,
                )

                return "very_high"


            if distance <= 30:

                print(
                    "🔥🔥🔥 CLASSIFIER RETURN: HIGH",
                    "| CLASS:",
                    source_class,
                    "| DISTANCE:",
                    distance,
                    "| RELATIONSHIP:",
                    spatial_relationship,
                )

                return "high"


            if distance <= 100:

                return "moderate"


            if distance <= 300:

                return "low"


            return "very_low"


        # --------------------------------------------------
        # OUTSIDE BUILDING / PROPERTY
        # --------------------------------------------------

        if spatial_relationship in (
            "outside_building",
            "property_external",
        ):

            if distance <= 30:

                return "high"


            if distance <= 100:

                return "moderate"


            if distance <= 300:

                return "low"


            return "very_low"


        # --------------------------------------------------
        # SAME BUILDING
        # --------------------------------------------------

        if spatial_relationship == (
            "same_building"
        ):

            return "high"


        # --------------------------------------------------
        # UNKNOWN RELATIONSHIP
        # --------------------------------------------------

        return "unknown"


    # ======================================================
    # ELECTRICAL INFRASTRUCTURE
    # ======================================================
    #
    # Examples:
    #
    # - Transformer
    # - Substation
    # - Power Line
    # - Electrical Cabinet
    #
    # IMPORTANT:
    #
    # Electrical infrastructure is contextual.
    # Spatial relevance is NOT electrical-field exposure.
    #
    # ======================================================

    if source_class == "electrical_infrastructure":

        # --------------------------------------------------
        # BUILDING ADJACENT
        # --------------------------------------------------

        if spatial_relationship == (
            "building_adjacent"
        ):

            if distance <= 2:

                return "very_high"


            if distance <= 5:

                return "high"


            if distance <= 15:

                return "moderate"


            if distance <= 30:

                return "low"


            return "very_low"


        # --------------------------------------------------
        # OUTSIDE BUILDING / PROPERTY
        # --------------------------------------------------

        if spatial_relationship in (
            "outside_building",
            "property_external",
        ):

            if distance <= 5:

                return "high"


            if distance <= 15:

                return "moderate"


            if distance <= 30:

                return "low"


            return "very_low"


        # --------------------------------------------------
        # SAME BUILDING
        # --------------------------------------------------

        if spatial_relationship == (
            "same_building"
        ):

            if distance <= 2:

                return "very_high"


            if distance <= 5:

                return "high"


            if distance <= 15:

                return "moderate"


            return "low"


        # --------------------------------------------------
        # UNKNOWN RELATIONSHIP
        # --------------------------------------------------

        return "unknown"

    # ======================================================
    # UNKNOWN SOURCE CLASS
    # ======================================================

    return "unknown"


# ==========================================================
# GEOMETRY EXTRACTION
# ==========================================================


def _extract_polygon(
    obj,
):
    """
    Extract polygon geometry from a Room or Zone.

    Supported forms:

        {
            "polygon": [
                {"x": ..., "y": ...},
                ...
            ]
        }

    and:

        {
            "points": [
                {"x": ..., "y": ...},
                ...
            ]
        }

    and:

        {
            "vertices": [
                {"x": ..., "y": ...},
                ...
            ]
        }

    Returns a list of valid (x, y) tuples.
    """

    if not isinstance(
        obj,
        dict,
    ):
        return []


    candidates = [

        obj.get(
            "polygon"
        ),

        obj.get(
            "points"
        ),

        obj.get(
            "vertices"
        ),

    ]


    polygon = None

    for candidate in candidates:

        if isinstance(
            candidate,
            list,
        ):

            polygon = candidate

            break


    if not polygon:
        return []


    result = []


    for point in polygon:

        if isinstance(
            point,
            dict,
        ):

            x = _safe_float(
                point.get(
                    "x"
                )
            )

            y = _safe_float(
                point.get(
                    "y"
                )
            )

        elif (
            isinstance(
                point,
                (
                    list,
                    tuple,
                )
            )
            and
            len(point) >= 2
        ):

            x = _safe_float(
                point[0]
            )

            y = _safe_float(
                point[1]
            )

        else:

            continue


        if (
            x is None
            or
            y is None
        ):
            continue


        result.append(
            (
                x,
                y,
            )
        )


    return result


# ==========================================================
# POINT IN POLYGON
# ==========================================================


def _point_on_segment(
    px,
    py,
    ax,
    ay,
    bx,
    by,
    tolerance=1e-9,
):
    """
    Check whether a point lies on a polygon edge.
    """

    cross = (
        (py - ay) * (bx - ax)
        -
        (px - ax) * (by - ay)
    )

    if abs(
        cross
    ) > tolerance:

        return False


    return (
        min(
            ax,
            bx,
        )
        - tolerance
        <= px
        <=
        max(
            ax,
            bx,
        )
        + tolerance
        and
        min(
            ay,
            by,
        )
        - tolerance
        <= py
        <=
        max(
            ay,
            by,
        )
        + tolerance
    )


def _point_in_polygon(
    x,
    y,
    polygon,
):
    """
    Ray-casting point-in-polygon test.

    Boundary points are treated as inside.
    """

    if len(
        polygon
    ) < 3:

        return False


    inside = False

    j = len(
        polygon
    ) - 1


    for i in range(
        len(
            polygon
        )
    ):

        xi, yi = polygon[i]

        xj, yj = polygon[j]


        if _point_on_segment(
            x,
            y,
            xi,
            yi,
            xj,
            yj,
        ):

            return True


        intersects = (

            (yi > y)
            !=
            (yj > y)

            and

            x
            <
            (
                (xj - xi)
                *
                (y - yi)
                /
                (
                    (yj - yi)
                    if yj != yi
                    else 1e-12
                )
            )
            + xi
        )


        if intersects:

            inside = not inside


        j = i


    return inside


# ==========================================================
# POINT → SEGMENT DISTANCE
# ==========================================================


def _point_to_segment_distance(
    px,
    py,
    ax,
    ay,
    bx,
    by,
):
    """
    Minimum Euclidean distance between point
    and line segment.
    """

    dx = bx - ax
    dy = by - ay


    segment_length_sq = (
        dx * dx
        +
        dy * dy
    )


    if segment_length_sq == 0:

        return _distance_2d(
            px,
            py,
            ax,
            ay,
        )


    t = (
        (
            (px - ax) * dx
            +
            (py - ay) * dy
        )
        /
        segment_length_sq
    )


    t = max(
        0.0,
        min(
            1.0,
            t,
        )
    )


    nearest_x = (
        ax
        +
        t * dx
    )

    nearest_y = (
        ay
        +
        t * dy
    )


    return _distance_2d(
        px,
        py,
        nearest_x,
        nearest_y,
    )


# ==========================================================
# POINT → POLYGON DISTANCE
# ==========================================================


def _point_to_polygon_distance(
    x,
    y,
    polygon,
):
    """
    Calculate minimum distance from a point
    to polygon geometry.

    If the point is inside the polygon:

        0

    Otherwise:

        minimum distance to polygon boundary.
    """

    if len(
        polygon
    ) < 3:

        return None


    if _point_in_polygon(
        x,
        y,
        polygon,
    ):

        return 0.0


    minimum = None


    for i in range(
        len(
            polygon
        )
    ):

        ax, ay = polygon[i]

        bx, by = polygon[
            (
                i + 1
            )
            %
            len(
                polygon
            )
        ]


        distance = (
            _point_to_segment_distance(
                x,
                y,
                ax,
                ay,
                bx,
                by,
            )
        )


        if (
            minimum is None
            or
            distance < minimum
        ):

            minimum = distance


    return minimum


# ==========================================================
# SOURCE → MEASUREMENT POINT
# ==========================================================


def find_nearest_measurement_point(
    source,
    measured_points,
):
    """
    Find the nearest physical measurement point
    to a source.

    Returns:

        {
            "point": point,
            "distance": distance_pixels,
        }

    The distance is still in floor-plan coordinates.

    Conversion to meters happens later.
    """

    source_coords = _source_coordinates(
        source
    )


    if source_coords is None:

        return None


    sx, sy = source_coords


    nearest_point = None

    nearest_distance = None


    for point in _safe_list(
        measured_points
    ):

        point_coords = _point_coordinates(
            point
        )

       

        if point_coords is None:
            continue


        px, py = point_coords

       

        distance = _distance_2d(
            sx,
            sy,
            px,
            py,
        )

        


        if (
            nearest_distance is None
            or
            distance < nearest_distance
        ):

            nearest_distance = distance

            nearest_point = point


    if nearest_point is None:
        return None


   

    return {

        "point":
            nearest_point,

        "distance":
            round(
                nearest_distance,
                2,
            ),
    }

 # ==========================================================
# CROSS-FLOOR 3D DISTANCE
# ==========================================================


def calculate_cross_floor_3d_distance(
    source,
    room,
    floor_elevations=None,
):
    """
    Calculate 3D spatial distance between a source
    and a room located on another floor.

    PHI spatial context only.

    This function does NOT calculate:

        - exposure
        - health risk
        - compliance
        - SBM score

    The calculation requires a real vertical elevation
    for both floors.

    Expected floor_heights format:

        {
            0: 0.0,
            1: 3.0,
            2: 6.0,
        }

    Values are metres.

    IMPORTANT:

    If floor elevation data is unavailable,
    the function returns None.

    It must NEVER invent a default floor height.
    """

   

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        source,
        dict,
    ):
        return None


    if not isinstance(
        room,
        dict,
    ):
        return None


    # ======================================================
    # FLOOR INDEX
    # ======================================================

    source_floor = source.get(
        "floorIndex"
    )

    room_floor = room.get(
        "floorIndex"
    )


    if (
        source_floor is None
        or
        room_floor is None
    ):

        print(
            "❌ CROSS-FLOOR 3D: "
            "MISSING FLOOR INDEX"
        )

        return None


    # ======================================================
    # SAME FLOOR
    # ======================================================

    if (
        source_floor
        ==
        room_floor
    ):

        print(
            "⚠️ CROSS-FLOOR 3D: "
            "SOURCE AND ROOM ARE ON SAME FLOOR"
        )

        return None


    # ======================================================
    # FLOOR HEIGHT DATA
    # ======================================================

    if not isinstance(
        floor_elevations,
        dict,
    ):

        print(
            "⚠️ CROSS-FLOOR 3D: "
            "NO FLOOR HEIGHT DATA"
        )

        return None


    source_z = floor_elevations.get(
        source_floor
    )

    room_z = floor_elevations.get(
        room_floor
    )


    source_z = _safe_float(
        source_z
    )

    room_z = _safe_float(
        room_z
    )


   

    if (
        source_z is None
        or
        room_z is None
    ):

        

        return None


    # ======================================================
    # SOURCE COORDINATES
    # ======================================================

    source_coords = _source_coordinates(
        source
    )


    if source_coords is None:

        print(
            "❌ CROSS-FLOOR 3D: "
            "NO SOURCE COORDINATES"
        )

        return None


    sx, sy = source_coords


    # ======================================================
    # ROOM GEOMETRY
    # ======================================================

    polygon = _extract_polygon(
        room
    )


    if not polygon:

        print(
            "❌ CROSS-FLOOR 3D: "
            "NO ROOM POLYGON"
        )

        return None


    if len(
        polygon
    ) < 3:

        print(
            "❌ CROSS-FLOOR 3D: "
            "INVALID ROOM POLYGON"
        )

        return None


    # ======================================================
    # HORIZONTAL DISTANCE
    # ======================================================

    horizontal_distance_pixels = (
        _point_to_polygon_distance(
            sx,
            sy,
            polygon,
        )
    )


    if horizontal_distance_pixels is None:

        print(
            "❌ CROSS-FLOOR 3D: "
            "HORIZONTAL DISTANCE FAILED"
        )

        return None


    # ======================================================
    # FLOOR SCALE
    # ======================================================

    scale = _get_floor_scale(
        room
    )


    scale = _safe_float(
        scale
    )


    if (
        scale is None
        or
        scale <= 0
    ):

        print(
            "❌ CROSS-FLOOR 3D: "
            "INVALID FLOOR SCALE",
            "| SCALE:",
            scale,
        )

        return None


    # ======================================================
    # HORIZONTAL DISTANCE → METRES
    # ======================================================

    horizontal_distance_m = (
        float(
            horizontal_distance_pixels
        )
        *
        scale
    )


    # ======================================================
    # VERTICAL DISTANCE
    # ======================================================

    vertical_distance_m = abs(
        source_z
        -
        room_z
    )


    # ======================================================
    # TRUE 3D DISTANCE
    # ======================================================

    distance_3d = math.sqrt(
        (
            horizontal_distance_m
            ** 2
        )
        +
        (
            vertical_distance_m
            ** 2
        )
    )


    # ======================================================
    # DEBUG
    # ======================================================

    print(
        "🔥🔥🔥 CROSS-FLOOR 3D DISTANCE:",
        source.get(
            "id"
        ),

        "| SOURCE FLOOR:",
        source_floor,

        "| ROOM FLOOR:",
        room_floor,

        "| HORIZONTAL M:",
        horizontal_distance_m,

        "| VERTICAL M:",
        vertical_distance_m,

        "| 3D M:",
        distance_3d,
    )


    return round(
        distance_3d,
        3,
    )   


# ==========================================================
# SOURCE → ROOM DISTANCE
# ==========================================================


def calculate_source_to_room_distance(
    source,
    room,
):
    """
    Calculate real-world distance from source
    to Room geometry.

    Same floor only.

    Priority:

        1. Source -> Room boundary
        2. Fallback is handled by caller via
           nearest measurement point.

    Returns distance in metres or None.
    """

    
    # ======================================================
    # SOURCE COORDINATES
    # ======================================================

    source_coords = _source_coordinates(
        source
    )

    if source_coords is None:

        print(
            "❌ ROOM DISTANCE: NO SOURCE COORDS"
        )

        return None

    # ======================================================
    # ROOM POLYGON
    # ======================================================

    polygon = _extract_polygon(
        room
    )

   

    if not polygon:

        print(
            "❌ ROOM DISTANCE: NO ROOM POLYGON"
        )

        return None

    # ======================================================
    # PIXEL DISTANCE
    # ======================================================

    sx, sy = source_coords

    distance_pixels = (
        _point_to_polygon_distance(
            sx,
            sy,
            polygon,
        )
    )

   

    if distance_pixels is None:

        print(
            "❌ ROOM DISTANCE: "
            "POINT TO POLYGON FAILED"
        )

        return None

    # ======================================================
    # FLOOR SCALE
    # ======================================================

    scale = _get_floor_scale(
        room
    )


    if scale is None or scale <= 0:

        print(
            "❌ ROOM DISTANCE: "
            "INVALID FLOOR SCALE"
        )

        return None

    # ======================================================
    # FINAL DISTANCE
    # ======================================================

    distance_m = (
        distance_pixels
        * scale
    )


    return distance_m


def calculate_source_to_zone_distance(
    source,
    zone,
    room,
):
    """
    Calculate real-world distance from source
    to Zone geometry.

    Same floor only.

    If source is inside Zone:

        0 m

    Otherwise:

        shortest distance to Zone boundary.
    """

    source_coords = _source_coordinates(
        source
    )


    if source_coords is None:
        return None


    polygon = _extract_polygon(
        zone
    )


    if not polygon:
        return None


    sx, sy = source_coords


    distance_pixels = (
        _point_to_polygon_distance(
            sx,
            sy,
            polygon,
        )
    )


    if distance_pixels is None:
        return None


    scale = _get_floor_scale(
        room
    )


    if scale <= 0:
        return None


    return (
        distance_pixels
        * scale
    )


# ==========================================================
# SOURCE → ROOM CONTEXT
# ==========================================================

def build_source_room_context(
    source,
    room,
    measured_points,
    rooms=None,
    floor_elevations=None,
):
    """
    Build contextual relationship between one source
    and one Room.

    Distance priority:

        1. Source -> Room geometry
        2. Source -> nearest measurement point

    The second path is a calibrated spatial fallback.

    This contains:

        - measurement distance
        - room distance
        - spatial relevance
        - spatial relationship
        - operating state

    It does NOT calculate exposure.
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        source,
        dict,
    ):
        return None

    if not isinstance(
        room,
        dict,
    ):
        room = {}

    measured_points = _safe_list(
        measured_points
    )

    rooms = _safe_list(
        rooms
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
    # SOURCE COORDINATES
    # ======================================================

    source_coords = _source_coordinates(
        source
    )

    if source_coords is None:
        return None


    # ======================================================
    # FLOOR CONTEXT
    # ======================================================

    source_floor = source.get(
        "floorIndex"
    )

    room_floor = room.get(
        "floorIndex"
    )




    # ======================================================
    # SOURCE FLOOR ELEVATION
    # ======================================================

    source_floor_elevation_m = None

    if isinstance(
        floor_elevations,
        dict,
    ):

        source_floor_elevation_m = _safe_float(
            floor_elevations.get(
                source_floor,
                0.0,
            ),
            default=0.0,
        )


    # ======================================================
    # TARGET / ROOM FLOOR ELEVATION
    # ======================================================

    target_floor_elevation_m = _safe_float(
        floor_elevations.get(
            room.get(
                "floorIndex"
            ),
            0.0,
        ),
        default=0.0,
    )


   


    same_floor = True


    if (
        source_floor is not None
        and
        room_floor is not None
    ):

        same_floor = (
            source_floor
            ==
            room_floor
        )


    # ======================================================
    # SOURCE CLASSIFICATION
    # ======================================================

    source_class = (
        classify_source_class(
            source
        )
    )

    source_environment = (
        classify_source_environment(
            source,
            source_class,
        )
    )


    # ======================================================
    # SPATIAL RELATIONSHIP
    # ======================================================

    spatial_relationship = (
        classify_spatial_relationship(
            source=source,
            room=room,
            zone=None,
            same_floor=same_floor,
        )
    )


   

    
    # ======================================================
    # CROSS-FLOOR 3D DISTANCE
    # ======================================================

    distance_cross_floor_3d = None


    if not same_floor:

        distance_cross_floor_3d = (
            calculate_cross_floor_3d_distance(
                source=source,
                room=room,
                floor_elevations=floor_elevations,
            )
        )

    if not same_floor:

        print(
            "🔥🔥🔥 CROSS-FLOOR 3D CONTEXT:",
            source.get("id"),
            "| SAME FLOOR:",
            same_floor,
            "| DISTANCE:",
            distance_cross_floor_3d,
        )


    # ======================================================
    # NEAREST MEASUREMENT POINT
    # ======================================================

    nearest = (
        find_nearest_measurement_point(
            source,
            measured_points,
        )
    )

    distance_to_measurement = None

    nearest_point = None


    if nearest:

        nearest_point = nearest.get(
            "point"
        )

        distance_pixels = nearest.get(
            "distance"
        )


        


        if (
            same_floor
            and
            distance_pixels is not None
        ):

            scale = _get_floor_scale(
                room
            )


            if (
                scale is not None
                and
                scale > 0
            ):

                distance_to_measurement = (
                    float(
                        distance_pixels
                    )
                    *
                    scale
                )


    


    # ======================================================
    # ROOM GEOMETRY DISTANCE
    # ======================================================

    distance_to_room = None


    if same_floor:

        distance_to_room = (
            calculate_source_to_room_distance(
                source,
                room,
            )
        )


   

    # ======================================================
    # BUILDING BOUNDARY DISTANCE
    # ======================================================

    distance_to_building = None


    if (
        same_floor
        and
        source_environment == "outdoor"
        and
        rooms
    ):

        distance_to_building = (
            calculate_source_to_building_boundary_distance(
                source=source,
                rooms=rooms,
                floor_scale=_get_floor_scale(
                    room
                ),
            )
        )


   

    # ======================================================
    # CLIENT-FACING EFFECTIVE DISTANCE
    # ======================================================

    effective_distance = None

    effective_distance_basis = (
        "distance_unavailable"
    )


    # ======================================================
    # EFFECTIVE DISTANCE SELECTION
    # ======================================================

    if same_floor:

        # --------------------------------------------------
        # 1. ROOM GEOMETRY
        # --------------------------------------------------

        if distance_to_room is not None:

            effective_distance = (
                distance_to_room
            )

            effective_distance_basis = (
                "room_geometry"
            )

        # --------------------------------------------------
        # 2. MEASUREMENT POINT
        # --------------------------------------------------

        elif distance_to_measurement is not None:

            effective_distance = (
                distance_to_measurement
            )

            effective_distance_basis = (
                "nearest_measurement_point_2d"
            )


    else:

        # --------------------------------------------------
        # CROSS-FLOOR 3D
        # --------------------------------------------------

        if distance_cross_floor_3d is not None:

            effective_distance = (
                distance_cross_floor_3d
            )

            effective_distance_basis = (
                "cross_floor_3d"
            )
    

    # ======================================================
    # PHI SPATIAL RELEVANCE
    # ======================================================

    if effective_distance is not None:

        relevance = (
            classify_spatial_relevance(
                distance=effective_distance,

                source_class=(
                    source_class
                ),

                environment=(
                    source_environment
                ),

                spatial_relationship=(
                    spatial_relationship
                ),

                same_floor=(
                    same_floor
                ),
            )
        )

    else:

        relevance = "unknown"

   




    # ======================================================
    # RETURN
    # ======================================================
    
   
     
    return {

        "source_id":
            source.get(
                "id"
            ),

        "type":
            source.get(
                "type",
                "unknown",
            ),

        "room_id":
            room.get(
                "id"
            ),

        "room_name":
            room.get(
                "name",
                "Room",
            ),


            

        "source_floor":
            source_floor,

        "room_floor":
            room_floor,

        "same_floor":
            same_floor,

        "distance": {

            "to_nearest_measurement_point_m":
                (
                    round(
                        distance_to_measurement,
                        3,
                    )
                    if distance_to_measurement is not None
                    else None
                ),

            "to_room_m":
                (
                    round(
                        distance_to_room,
                        3,
                    )
                    if distance_to_room is not None
                    else None
                ),

            "to_building_boundary_m":
                (
                    round(
                        distance_to_building,
                        3,
                    )
                    if distance_to_building is not None
                    else None
                ),

            "cross_floor_3d_m":
                (
                    round(
                        distance_cross_floor_3d,
                        3,
                    )
                    if distance_cross_floor_3d is not None
                    else None
                ),

            "effective_distance_m":
                (
                    round(
                        effective_distance,
                        3,
                    )
                    if effective_distance is not None
                    else None
                ),

            "basis":
                effective_distance_basis,

            "cross_floor_3d":
                (
                    effective_distance_basis
                    ==
                    "cross_floor_3d"
                ),

            "to_nearest_zone_m":
                None,
        },

        "distance_basis":
            effective_distance_basis,

        "nearest_measurement_point_id":
            (
                nearest_point.get(
                    "id"
                )
                if isinstance(
                    nearest_point,
                    dict,
                )
                else None
            ),

        "spatial_relationship":
            spatial_relationship,

        "source_class":
            source_class,

        "environment":
            source_environment,

        "spatial_relevance":
            relevance,

        "operating_state":
            get_source_operating_state(
                source
            ),
    }


# ==========================================================
# BUILD OUTER BOUNDARY
# ==========================================================


def _build_outer_boundary(
    polygons,
):
    """
    Build a stable outer boundary from multiple
    room polygons.

    This is a geometry fallback used when an explicit
    building/property boundary is not available.

    Returns:

        polygon

    or:

        None
    """

    if not isinstance(
        polygons,
        list,
    ):

        return None


    points = []


    for polygon in polygons:

        if not isinstance(
            polygon,
            list,
        ):
            continue


        for point in polygon:

            if not isinstance(
                point,
                (list, tuple),
            ):
                continue


            if len(point) < 2:
                continue


            try:

                x = float(
                    point[0]
                )

                y = float(
                    point[1]
                )

            except (
                TypeError,
                ValueError,
            ):

                continue


            points.append(
                (
                    x,
                    y,
                )
            )


    if len(points) < 3:

        return None


    # Remove duplicates

    points = list(
        set(
            points
        )
    )


    if len(points) < 3:

        return None


    # ------------------------------------------------------
    # Cross product
    # ------------------------------------------------------

    def cross(
        origin,
        a,
        b,
    ):

        return (
            (
                a[0]
                -
                origin[0]
            )
            *
            (
                b[1]
                -
                origin[1]
            )
            -
            (
                a[1]
                -
                origin[1]
            )
            *
            (
                b[0]
                -
                origin[0]
            )
        )


    # ------------------------------------------------------
    # Sort points
    # ------------------------------------------------------

    points.sort()


    # ------------------------------------------------------
    # Lower hull
    # ------------------------------------------------------

    lower = []


    for point in points:

        while (
            len(lower) >= 2
            and
            cross(
                lower[-2],
                lower[-1],
                point,
            )
            <= 0
        ):

            lower.pop()


        lower.append(
            point
        )


    # ------------------------------------------------------
    # Upper hull
    # ------------------------------------------------------

    upper = []


    for point in reversed(
        points
    ):

        while (
            len(upper) >= 2
            and
            cross(
                upper[-2],
                upper[-1],
                point,
            )
            <= 0
        ):

            upper.pop()


        upper.append(
            point
        )


    # Remove duplicated endpoints

    hull = (
        lower[:-1]
        +
        upper[:-1]
    )


    if len(
        hull
    ) < 3:

        return None


    return hull

# ==========================================================
# SOURCE → BUILDING BOUNDARY DISTANCE
# ==========================================================


def calculate_source_to_building_boundary_distance(
    source,
    rooms,
    floor_scale=0,
):
    """
    Calculate distance from a source to the derived
    building boundary.

    The boundary is derived from the outer geometry
    of all valid rooms on the same floor.

    Returns distance in metres or None.
    """

    print(
        "\n🔥🔥🔥 BUILDING BOUNDARY DISTANCE CALC"
    )

    # ======================================================
    # SOURCE
    # ======================================================

    if not isinstance(
        source,
        dict,
    ):
        return None


    source_coords = _source_coordinates(
        source
    )


    print(
        "SOURCE:",
        source.get(
            "type"
        ),
    )

    print(
        "SOURCE COORDS:",
        source_coords,
    )


    if source_coords is None:

        print(
            "❌ BUILDING DISTANCE: "
            "NO SOURCE COORDS"
        )

        return None


    source_floor = source.get(
        "floorIndex"
    )


    # ======================================================
    # ROOMS
    # ======================================================

    rooms = _safe_list(
        rooms
    )


    print(
        "BUILDING ROOMS INPUT:",
        len(
            rooms
        ),
    )


    if not rooms:

        print(
            "❌ BUILDING DISTANCE: "
            "NO ROOMS"
        )

        return None


    # ======================================================
    # COLLECT ROOM POLYGONS
    # ======================================================

    floor_polygons = []


    for room in rooms:

        if not isinstance(
            room,
            dict,
        ):
            continue


        room_floor = room.get(
            "floorIndex"
        )


        # --------------------------------------------------
        # Same floor
        # --------------------------------------------------

        if (
            source_floor is not None
            and
            room_floor is not None
            and
            source_floor != room_floor
        ):

            continue


        polygon = _extract_polygon(
            room
        )




        if not polygon:

            continue


        if len(
            polygon
        ) < 3:

            continue


        floor_polygons.append(
            polygon
        )




    if not floor_polygons:

        print(
            "❌ BUILDING DISTANCE: "
            "NO VALID ROOM POLYGONS"
        )

        return None


    # ======================================================
    # BUILD OUTER BOUNDARY
    # ======================================================

    building_boundary = (
        _build_outer_boundary(
            floor_polygons
        )
    )




    if not building_boundary:

        print(
            "❌ BUILDING DISTANCE: "
            "BOUNDARY CREATION FAILED"
        )

        return None


    # ======================================================
    # PIXEL DISTANCE
    # ======================================================

    sx, sy = source_coords


    distance_pixels = (
        _point_to_polygon_distance(
            sx,
            sy,
            building_boundary,
        )
    )


    print(
        "🔥 BUILDING DISTANCE PIXELS:",
        distance_pixels,
    )


    if distance_pixels is None:

        print(
            "❌ BUILDING DISTANCE: "
            "POINT TO BOUNDARY FAILED"
        )

        return None


    # ======================================================
    # FLOOR SCALE
    # ======================================================

    scale = _safe_float(
        floor_scale
    )


   


    if (
        scale is None
        or
        scale <= 0
    ):

        print(
            "❌ BUILDING DISTANCE: "
            "INVALID FLOOR SCALE"
        )

        return None


    # ======================================================
    # PIXELS → METRES
    # ======================================================

    distance_m = (
        float(
            distance_pixels
        )
        *
        scale
    )


   


    return distance_m

# ==========================================================
# BUILD SOURCE → ZONE CONTEXT
# ==========================================================


def build_source_zone_context(
    source,
    zone,
    room,
):
    """
    Build contextual relationship between one source
    and one Zone.

    Zone geometry is the primary spatial reference.

    The source does NOT modify Zone exposure.
    """

    if not isinstance(
        source,
        dict,
    ):
        return None

    zone_data = zone


    if not isinstance(
        zone,
        dict,
    ):
        return None


    if not isinstance(
        room,
        dict,
    ):
        room = {}

    distance = None    


    source_floor = source.get(
        "floorIndex"
    )

    zone_floor = zone.get(
        "floorIndex"
    )


    # Some zone models may inherit floor context
    # from the parent room.

    if zone_floor is None:

        zone_floor = room.get(
            "floorIndex"
        )


    same_floor = True

  

    if (
        source_floor is not None
        and
        zone_floor is not None
    ):

        same_floor = (
            source_floor
            ==
            zone_floor
        )


    distance = None


    if same_floor:

        distance = (
            calculate_source_to_zone_distance(
                source,
                zone,
                room,
            )
        )


    # ======================================================
    # PHI SOURCE CLASSIFICATION
    # ======================================================

    source_class = classify_source_class(
        source
    )

    source_environment = (
        classify_source_environment(
            source,
            source_class,
        )
    )


    # ======================================================
    # PHI SPATIAL RELATIONSHIP
    # ======================================================

    if not same_floor:

        spatial_relationship = (
            "cross_floor"
        )

    else:

        spatial_relationship = (
            "same_zone"
        )


    # ======================================================
    # PHI SPATIAL RELEVANCE
    # ======================================================

    if not same_floor:

        relevance = (
            "cross_floor_potential"
        )

    elif distance is not None:

        relevance = (
            classify_spatial_relevance(
                distance=distance,

                source_class=
                    source_class,

                environment=
                    source_environment,

                spatial_relationship=
                    spatial_relationship,

                same_floor=
                    same_floor,
            )
        )

    else:

        relevance = "unknown"





    # ======================================================
    # NORMALIZED DISTANCE
    # ======================================================

    distance_m = (
        round(
            distance,
            3,
        )
        if distance is not None
        else None
    )


    # ======================================================
    # RETURN
    # ======================================================

    return {

        "source_id":
            source.get(
                "id"
            ),

        "type":
            source.get(
                "type",
                "unknown",
            ),

        "zone_id":
            zone.get(
                "id"
            ),

        "zone_name":
            zone.get(
                "name",
                "Zone",
            ),

        "source_floor":
            source_floor,

        "zone_floor":
            zone_floor,

        "same_floor":
            same_floor,

        "spatial_relationship":
            spatial_relationship,

        "source_class":
            source_class,

        "environment":
            source_environment,

        "distance_m":
            distance_m,

        "spatial_relevance":
            relevance,

        "operating_state":
            get_source_operating_state(
                source
            ),
    }


# ==========================================================
# BUILD ALL SOURCE CONTEXT
# ==========================================================


def build_source_context(
    sources,
    room,
    measured_points,
    zones=None,
    rooms=None,
    floor_elevations=None,
):
    """
    Build canonical Business Survey source context.

    Priority:

        1. Zones
        2. Room fallback
        3. Measurement point context

    IMPORTANT:

    Source context is contextual only.

    It must NEVER be added to measured exposure.
    """

   
    sources = _safe_list(
        sources
    )

    measured_points = _safe_list(
        measured_points
    )

    zones = _safe_list(
        zones
    )

    rooms = _safe_list(
        rooms
    )

    if not isinstance(
        floor_elevations,
        dict,
    ):

        floor_elevations = {}


    room = _safe_dict(
        room
    )

    floor_elevations = (
        floor_elevations
        if isinstance(
            floor_elevations,
            dict,
        )
        else {}
    )


    for source in sources:

        if not isinstance(
            source,
            dict,
        ):
            continue

       

    


    # ======================================================
    # ROOM SOURCE CONTEXT
    # ======================================================

    room_context = []


    for source in sources:

        context = (
            build_source_room_context(
                source=source,
                room=room,
                measured_points=measured_points,
                rooms=rooms,
                floor_elevations=floor_elevations,
            )
        )


        if context is None:
            continue


        room_context.append(
            context
        )


    # ======================================================
    # ZONE SOURCE CONTEXT
    # ======================================================

    zone_context = []


    for zone in zones:

        if not isinstance(
            zone,
            dict,
        ):
            continue


        zone_sources = []


        for source in sources:

            context = (
                build_source_zone_context(
                    source=source,
                    zone=zone,
                    room=room,
                )
            )


            if context is None:
                continue


            zone_sources.append(
                context
            )


        # --------------------------------------------------
        # Sort nearest / most relevant first
        # --------------------------------------------------

        relevance_order = {

            "very_high": 0,

            "high": 1,

            "moderate": 2,

            "low": 3,

            "very_low": 4,

            "cross_floor_potential": 5,

            "unknown": 6,
        }


        zone_sources.sort(
            key=lambda item: (
                relevance_order.get(
                    item.get(
                        "spatial_relevance",
                        "unknown",
                    ),
                    99,
                ),

                item.get(
                    "distance_m"
                )
                if
                item.get(
                    "distance_m"
                )
                is not None
                else float(
                    "inf"
                ),
            )
        )


        zone_context.append({

            "zone_id":
                zone.get(
                    "id"
                ),

            "zone_name":
                zone.get(
                    "name",
                    "Zone",
                ),

            "sources":
                zone_sources,

        })


    # ======================================================
    # PRIMARY ZONE PER SOURCE
    # ======================================================
    #
    # A source may be relevant to multiple zones.
    #
    # We therefore keep ALL zone relationships and
    # separately identify the nearest relevant zone.
    #

    source_zone_map = {}


    for zone_data in zone_context:

        zone_id = zone_data.get(
            "zone_id"
        )

        zone_name = zone_data.get(
            "zone_name"
        )


        for source_context in (
            zone_data.get(
                "sources",
                []
            )
        ):

            source_id = (
                source_context.get(
                    "source_id"
                )
            )


            if source_id is None:
                continue


            source_zone_map.setdefault(
                source_id,
                [],
            ).append({

                "zone_id":
                    zone_id,

                "zone_name":
                    zone_name,

                "distance_m":
                    source_context.get(
                        "distance_m"
                    ),

                "spatial_relevance":
                    source_context.get(
                        "spatial_relevance",
                        "unknown",
                    ),

            })


    # ======================================================
    # ENRICH ROOM SOURCE CONTEXT
    # ======================================================

    relevance_order = {

        "very_high": 0,

        "high": 1,

        "moderate": 2,

        "low": 3,

        "very_low": 4,

        "cross_floor_potential": 5,

        "unknown": 6,
    }


    enriched_sources = []


    for source_context in room_context:

        source_id = (
            source_context.get(
                "source_id"
            )
        )


        related_zones = (
            source_zone_map.get(
                source_id,
                []
            )
        )


        # Sort zones by relevance and distance.

        related_zones.sort(
            key=lambda item: (

                relevance_order.get(
                    item.get(
                        "spatial_relevance",
                        "unknown",
                    ),
                    99,
                ),

                item.get(
                    "distance_m"
                )
                if
                item.get(
                    "distance_m"
                )
                is not None
                else float(
                    "inf"
                ),

            )
        )


        source_context[
            "zones"
        ] = related_zones


        # --------------------------------------------------
        # Nearest / primary zone
        # --------------------------------------------------

        primary_zone = None


        if related_zones:

            primary_zone = (
                related_zones[0]
            )


        source_context[
            "primary_zone"
        ] = primary_zone


        # --------------------------------------------------
        # Nearest zone distance
        # --------------------------------------------------

        if primary_zone:

            nearest_zone_distance = (
                primary_zone.get(
                    "distance_m"
                )
            )

            source_context[
                "distance"
            ][
                "to_nearest_zone_m"
            ] = (
                round(
                    nearest_zone_distance,
                    3,
                )
                if
                nearest_zone_distance
                is not None
                else None
            )


        # --------------------------------------------------
        # Context level
        # --------------------------------------------------

        if related_zones:

            source_context[
                "context_level"
            ] = "zone"

        else:

            source_context[
                "context_level"
            ] = "room"


        enriched_sources.append(
            source_context
        )


    # ======================================================
    # PRIMARY SOURCE
    # ======================================================
    #
    # Primary source is contextual only.
    #
    # If Zones exist, the source's nearest relevant Zone
    # is considered before Room relevance.
    #
    # It does NOT mean:
    #
    # "source responsible for exposure"
    #

    def primary_source_key(
        item,
    ):

        context_level = item.get(
            "context_level",
            "room",
        )


        level_rank = (
            0
            if context_level == "zone"
            else 1
        )


        zone = item.get(
            "primary_zone"
        )


        zone_distance = (
            zone.get(
                "distance_m"
            )
            if isinstance(
                zone,
                dict,
            )
            else None
        )


        room_distance = (
            item.get(
                "distance",
                {}
            ).get(
                "to_room_m"
            )
        )


        measurement_distance = (
            item.get(
                "distance",
                {}
            ).get(
                "to_nearest_measurement_point_m"
            )
        )


        return (

            level_rank,

            zone_distance
            if zone_distance is not None
            else float(
                "inf"
            ),

            room_distance
            if room_distance is not None
            else float(
                "inf"
            ),

            measurement_distance
            if measurement_distance is not None
            else float(
                "inf"
            ),

        )


    enriched_sources.sort(
        key=primary_source_key
    )


    primary_source = None


    if enriched_sources:

        primary_source = (
            enriched_sources[0]
        )


    for index, source_context in enumerate(
        enriched_sources,
        start=1,
    ):

        distance_data = (
            source_context.get(
                "distance",
                {}
            )
        )




    # ======================================================
    # RETURN
    # ======================================================

    return {

        "sources":
            enriched_sources,

        "primary_source":
            primary_source,

        "zones":
            zone_context,

    }