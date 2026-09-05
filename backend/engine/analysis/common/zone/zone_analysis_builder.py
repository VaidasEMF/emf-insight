# ==========================================================
# BUSINESS SURVEY — ZONE ANALYSIS BUILDER
# ==========================================================
#
# Builds analytical data for one Business Survey Zone.
#
# IMPORTANT:
#
# Zone exposure is based ONLY on measurements belonging
# to the Zone grid.
#
# Measurement Scope determines which domains are assessed.
#
# Supported domains:
#
#     rf
#     electric
#     magnetic
#
# A domain outside the selected scope is NOT treated as zero.
#
# A domain inside the scope but without a valid measurement
# remains missing.
#
# This builder does NOT calculate source exposure.
#
# Sources are contextual information and are handled by
# Source Context separately.
#
# ==========================================================


from engine.analysis.common.measurement.measurement_scope import (
    normalize_measurement_scope,
    get_measurement_status,
)


# ==========================================================
# HELPERS
# ==========================================================


def _safe_list(
    value,
):
    """
    Return value as a list.
    """

    if isinstance(
        value,
        list,
    ):

        return value

    if isinstance(
        value,
        tuple,
    ):

        return list(
            value
        )

    return []


def _safe_dict(
    value,
):
    """
    Return value as a dict.
    """

    if isinstance(
        value,
        dict,
    ):

        return value

    return {}


def _numeric(
    value,
):
    """
    Return a numeric value or None.

    Boolean values are not accepted as measurements.
    """

    if isinstance(
        value,
        bool,
    ):

        return None

    if isinstance(
        value,
        (int, float),
    ):

        return float(
            value
        )

    return None


# ==========================================================
# EXTRACT MEASUREMENT
# ==========================================================


def _extract_measurement(
    grid_point,
    session_id=None,
):
    """
    Extract the canonical measurement dictionary from
    one Zone grid point.

    Supports both current flattened Zone grid data and
    session-based measurement storage.

    Current example:

        {
            "rf": 333,
            "electric": 3,
            "magnetic": 3,
            "measuredRF": True,
            ...
        }

    Session-based example:

        {
            "measurements": {
                "session_1": {
                    "rf": 333,
                    ...
                }
            }
        }
    """

    if not isinstance(
        grid_point,
        dict,
    ):

        return {}


    # ------------------------------------------------------
    # Session-based measurement
    # ------------------------------------------------------

    measurements = grid_point.get(
        "measurements"
    )

    if isinstance(
        measurements,
        dict,
    ):

        if (
            session_id
            and
            session_id in measurements
        ):

            session_measurement = (
                measurements.get(
                    session_id
                )
            )

            if isinstance(
                session_measurement,
                dict,
            ):

                return session_measurement


        # --------------------------------------------------
        # If there is only one session, use it.
        # --------------------------------------------------

        if len(
            measurements
        ) == 1:

            only_measurement = next(
                iter(
                    measurements.values()
                )
            )

            if isinstance(
                only_measurement,
                dict,
            ):

                return only_measurement


    # ------------------------------------------------------
    # Current flattened Zone representation
    # ------------------------------------------------------

    return grid_point


# ==========================================================
# GET MEASURED VALUE
# ==========================================================


def _get_domain_value(
    grid_point,
    measurement,
    domain,
):
    """
    Return the actual domain measurement.

    The frontend measurement flags are authoritative.

    If a flag exists and is False, the value is considered
    NOT measured even if a numeric value happens to exist.
    """

    flag_map = {

        "rf":
            "measuredRF",

        "electric":
            "measuredE",

        "magnetic":
            "measuredM",

    }


    flag = flag_map.get(
        domain
    )


    # ------------------------------------------------------
    # Prefer flags from measurement
    # ------------------------------------------------------

    if (
        flag
        and
        flag in measurement
    ):

        if measurement.get(
            flag
        ) is not True:

            return None


    # ------------------------------------------------------
    # If the session object does not contain the flag,
    # check the original grid point.
    # ------------------------------------------------------

    if (
        flag
        and
        flag not in measurement
        and
        flag in grid_point
    ):

        if grid_point.get(
            flag
        ) is not True:

            return None


    return _numeric(
        measurement.get(
            domain
        )
    )


# ==========================================================
# POINT RISK
# ==========================================================


def _normalize_risk(
    value,
):
    """
    Normalize an existing risk value.
    """

    if not isinstance(
        value,
        str,
    ):

        return None

    value = (
        value
        .strip()
        .lower()
    )


    if value in (
        "low",
        "moderate",
        "medium",
        "high",
        "very_high",
        "unknown",
    ):

        if value == "medium":

            return "moderate"

        return value


    return None


# ==========================================================
# RISK AGGREGATION
# ==========================================================


def _aggregate_risk(
    risks,
):
    """
    Aggregate existing point-level risk values.

    IMPORTANT:

    This does NOT introduce a new exposure threshold model.

    It only aggregates risk values already present on
    measured Zone points.
    """

    normalized = []


    for risk in risks:

        normalized_risk = _normalize_risk(
            risk
        )

        if normalized_risk:

            normalized.append(
                normalized_risk
            )


    if not normalized:

        return "unknown"


    rank = {

        "unknown": 0,
        "low": 1,
        "moderate": 2,
        "high": 3,
        "very_high": 4,

    }


    highest = max(
        normalized,
        key=lambda value:
            rank.get(
                value,
                0,
            ),
    )


    return highest


# ==========================================================
# BUILD DOMAIN METRICS
# ==========================================================


def _build_domain_metrics(
    values,
    measured_count,
    total_count,
    in_scope,
):
    """
    Build metrics for one measurement domain.
    """

    if not in_scope:

        return {

            "status":
                "not_in_scope",

            "measured_count":
                0,

            "total_count":
                total_count,

            "coverage":
                None,

            "average":
                None,

            "maximum":
                None,

            "minimum":
                None,

        }


    if not values:

        return {

            "status":
                "not_measured",

            "measured_count":
                0,

            "total_count":
                total_count,

            "coverage":
                0.0,

            "average":
                None,

            "maximum":
                None,

            "minimum":
                None,

        }


    average = (
        sum(
            values
        )
        /
        len(
            values
        )
    )


    maximum = max(
        values
    )


    minimum = min(
        values
    )


    coverage = (

        (
            measured_count
            /
            total_count
        )
        * 100

        if total_count

        else 0.0

    )


    return {

        "status":
            "measured",

        "measured_count":
            measured_count,

        "total_count":
            total_count,

        "coverage":
            round(
                coverage,
                1,
            ),

        "average":
            round(
                average,
                2,
            ),

        "maximum":
            round(
                maximum,
                2,
            ),

        "minimum":
            round(
                minimum,
                2,
            ),

    }


# ==========================================================
# BUILD ZONE ANALYSIS
# ==========================================================


def build_zone_analysis(
    zone,
    measurement_scope=None,
    session_id=None,
):
    """
    Build analytical representation of one Zone.

    Parameters
    ----------
    zone:
        Raw Zone object.

    measurement_scope:
        Business Survey Measurement Scope.

    session_id:
        Optional measurement session identifier.

    Returns
    -------
    dict
        Canonical Zone Analysis model.
    """

    zone = _safe_dict(
        zone
    )


    # ======================================================
    # SCOPE
    # ======================================================

    normalized_scope = (
        normalize_measurement_scope(
            measurement_scope
        )
    )


    scoped_domains = normalized_scope.get(
        "domains",
        [],
    )


    # ======================================================
    # ZONE IDENTITY
    # ======================================================

    zone_id = zone.get(
        "id"
    )

    zone_type = zone.get(
        "type",
        "unknown",
    )

    room_id = zone.get(
        "roomId"
    )

    room_code = zone.get(
        "roomCode"
    )

    floor_index = zone.get(
        "floorIndex"
    )


    # ======================================================
    # GRID
    # ======================================================

    grid = _safe_list(
        zone.get(
            "grid"
        )
    )


    total_points = len(
        grid
    )


    # ======================================================
    # DOMAIN COLLECTION
    # ======================================================

    domain_values = {

        "rf": [],

        "electric": [],

        "magnetic": [],

    }


    domain_measured_counts = {

        "rf": 0,

        "electric": 0,

        "magnetic": 0,

    }


    point_statuses = []

    point_risks = []


    # ======================================================
    # PROCESS GRID
    # ======================================================

    for grid_point in grid:

        if not isinstance(
            grid_point,
            dict,
        ):

            continue


        measurement = _extract_measurement(
            grid_point,
            session_id=session_id,
        )


        statuses = {}


        # --------------------------------------------------
        # Domain statuses
        # --------------------------------------------------

        for domain in (
            "rf",
            "electric",
            "magnetic",
        ):

            status = get_measurement_status(
                measurement=measurement,
                domain=domain,
                measurement_scope=normalized_scope,
            )


            statuses[
                domain
            ] = status


            # ----------------------------------------------
            # Valid measured value
            # ----------------------------------------------

            if status == "measured":

                value = _get_domain_value(
                    grid_point=grid_point,
                    measurement=measurement,
                    domain=domain,
                )


                if value is not None:

                    domain_values[
                        domain
                    ].append(
                        value
                    )

                    domain_measured_counts[
                        domain
                    ] += 1


        # --------------------------------------------------
        # Point completeness
        # --------------------------------------------------

        point_complete = all(

            statuses[
                domain
            ]
            ==
            "measured"

            for domain
            in scoped_domains

        )


        point_statuses.append({

            "id":
                grid_point.get(
                    "id"
                ),

            "statuses":
                statuses,

            "complete":
                point_complete,

        })


        # --------------------------------------------------
        # Existing point-level risk
        # --------------------------------------------------

        risk = _normalize_risk(
            measurement.get(
                "risk"
            )
        )


        if risk is None:

            risk = _normalize_risk(
                grid_point.get(
                    "risk"
                )
            )


        if risk:

            point_risks.append(
                risk
            )


    # ======================================================
    # COMPLETE POINTS
    # ======================================================

    measured_points = sum(

        1

        for point
        in point_statuses

        if point.get(
            "complete"
        )

    )


    point_coverage = (

        (
            measured_points
            /
            total_points
        )
        * 100

        if total_points

        else 0.0

    )


    # ======================================================
    # DOMAIN METRICS
    # ======================================================

    metrics = {}


    for domain in (
        "rf",
        "electric",
        "magnetic",
    ):

        metrics[
            domain
        ] = _build_domain_metrics(

            values=
                domain_values[
                    domain
                ],

            measured_count=
                domain_measured_counts[
                    domain
                ],

            total_count=
                total_points,

            in_scope=
                domain in scoped_domains,

        )


    # ======================================================
    # RISK
    # ======================================================

    risk = _aggregate_risk(
        point_risks
    )


    # ======================================================
    # ZONE STATUS
    # ======================================================

    if total_points == 0:

        status = (
            "no_measurements"
        )

    elif measured_points == 0:

        status = (
            "not_measured"
        )

    elif measured_points < total_points:

        status = (
            "partial"
        )

    else:

        status = (
            "complete"
        )


    # ======================================================
    # RETURN MODEL
    # ======================================================

    model = {

        # --------------------------------------------------
        # IDENTITY
        # --------------------------------------------------

        "id":
            zone_id,

        "zone_id":
            zone_id,

        "type":
            zone_type,

        "room_id":
            room_id,

        "room_code":
            room_code,

        "floor_index":
            floor_index,


        # --------------------------------------------------
        # SCOPE
        # --------------------------------------------------

        "measurement_scope":
            normalized_scope,


        # --------------------------------------------------
        # GRID
        # --------------------------------------------------

        "total_points":
            total_points,

        "measured_points":
            measured_points,

        "coverage":
            round(
                point_coverage,
                1,
            ),


        # --------------------------------------------------
        # STATUS
        # --------------------------------------------------

        "status":
            status,

        "complete":
            (
                status
                ==
                "complete"
            ),


        # --------------------------------------------------
        # DOMAIN METRICS
        # --------------------------------------------------

        "metrics":
            metrics,


        # --------------------------------------------------
        # RISK
        # --------------------------------------------------

        "risk":
            risk,


        # --------------------------------------------------
        # POINT DETAILS
        # --------------------------------------------------

        "point_statuses":
            point_statuses,

    }


   

    return model