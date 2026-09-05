# ==========================================================
# BUSINESS SURVEY — MEASUREMENT SCOPE
# ==========================================================
#
# Canonical definition of the measurement domains included
# in a Business Survey assessment.
#
# Measurement Scope is explicit assessment configuration.
#
# Supported domains:
#
#     rf
#     electric
#     magnetic
#
# ==========================================================


VALID_DOMAINS = (
    "rf",
    "electric",
    "magnetic",
)


VALID_MEASUREMENT_STATUSES = (
    "measured",
    "missing",
    "not_in_scope",
    "invalid",
)


# ==========================================================
# NORMALIZE MEASUREMENT SCOPE
# ==========================================================


def normalize_measurement_scope(
    scope=None,
):
    """
    Normalize the Business Survey Measurement Scope.

    Accepted input:

        {
            "domains": [
                "rf",
                "electric",
                "magnetic",
            ]
        }

    or:

        [
            "rf",
            "magnetic",
        ]

    Backward compatibility:

    If no explicit Measurement Scope exists yet,
    the current Business Survey is treated as:

        RF + Electric + Magnetic
    """

    # ------------------------------------------------------
    # Extract domains
    # ------------------------------------------------------

    if isinstance(
        scope,
        dict,
    ):

        domains = scope.get(
            "domains"
        )

    elif isinstance(
        scope,
        (list, tuple, set),
    ):

        domains = scope

    else:

        domains = None


    # ------------------------------------------------------
    # Normalize collection
    # ------------------------------------------------------

    if not isinstance(
        domains,
        (list, tuple, set),
    ):

        domains = []


    normalized = []


    for domain in domains:

        if not isinstance(
            domain,
            str,
        ):
            continue


        domain = (
            domain
            .strip()
            .lower()
        )


        if domain not in VALID_DOMAINS:
            continue


        if domain not in normalized:

            normalized.append(
                domain
            )


    # ------------------------------------------------------
    # BACKWARD COMPATIBILITY
    # ------------------------------------------------------
    #
    # Frontend does not yet store Measurement Scope.
    #
    # Therefore existing Business Surveys continue to
    # operate with the current full measurement model.
    #
    # ------------------------------------------------------

    if not normalized:

        normalized = list(
            VALID_DOMAINS
        )


    return {
        "domains":
            normalized,
    }


# ==========================================================
# DOMAIN IN SCOPE
# ==========================================================


def is_domain_in_scope(
    domain,
    measurement_scope,
):
    """
    Return True if the domain belongs to the selected
    Measurement Scope.
    """

    if not isinstance(
        domain,
        str,
    ):

        return False


    domain = (
        domain
        .strip()
        .lower()
    )


    normalized_scope = (
        normalize_measurement_scope(
            measurement_scope
        )
    )


    return (
        domain
        in
        normalized_scope[
            "domains"
        ]
    )


# ==========================================================
# GET MEASUREMENT STATUS
# ==========================================================


def get_measurement_status(
    measurement,
    domain,
    measurement_scope,
):
    """
    Determine the measurement status of one domain.

    Canonical states:

        measured
        missing
        not_in_scope
        invalid

    IMPORTANT:

    A numeric value alone does NOT prove that a measurement
    was actually performed.

    The frontend measurement flags are authoritative:

        rf       -> measuredRF
        electric -> measuredE
        magnetic -> measuredM
    """

    # ======================================================
    # DOMAIN NORMALIZATION
    # ======================================================

    if not isinstance(
        domain,
        str,
    ):
        return "invalid"

    domain = (
        domain
        .strip()
        .lower()
    )


    # ======================================================
    # SCOPE
    # ======================================================

    if not is_domain_in_scope(
        domain,
        measurement_scope,
    ):

        return "not_in_scope"


    # ======================================================
    # MEASUREMENT OBJECT
    # ======================================================

    if not isinstance(
        measurement,
        dict,
    ):

        return "missing"


    # ======================================================
    # FRONTEND MEASUREMENT FLAGS
    # ======================================================
    #
    # These flags tell us whether the value was actually
    # measured.
    #
    # They are more authoritative than the numeric value.
    #
    # ======================================================

    measured_flags = {

        "rf":
            "measuredRF",

        "electric":
            "measuredE",

        "magnetic":
            "measuredM",

    }


    measured_flag = measured_flags.get(
        domain
    )


    # ======================================================
    # IF FRONTEND FLAG EXISTS
    # ======================================================

    if measured_flag in measurement:

        is_measured = measurement.get(
            measured_flag
        )

        if is_measured is not True:

            return "missing"


    # ======================================================
    # VALUE
    # ======================================================

    value = measurement.get(
        domain
    )


    # ======================================================
    # NO VALUE
    # ======================================================

    if value is None:

        return "missing"


    # Empty string

    if (
        isinstance(
            value,
            str,
        )
        and
        not value.strip()
    ):

        return "missing"


    # ======================================================
    # INVALID BOOLEAN
    # ======================================================

    if isinstance(
        value,
        bool,
    ):

        return "invalid"


    # ======================================================
    # NUMERIC VALUE
    # ======================================================

    if not isinstance(
        value,
        (int, float),
    ):

        return "invalid"


    return "measured"

# ==========================================================
# EVALUATE MEASUREMENT POINT
# ==========================================================


def evaluate_measurement_point(
    measurement,
    measurement_scope,
):
    """
    Evaluate one measurement point.

    A point is complete when every domain included in
    the selected Measurement Scope has a valid measurement.

    Domains outside the scope are not required.
    """

    normalized_scope = (
        normalize_measurement_scope(
            measurement_scope
        )
    )


    statuses = {}


    for domain in VALID_DOMAINS:

        statuses[
            domain
        ] = get_measurement_status(
            measurement=measurement,
            domain=domain,
            measurement_scope=normalized_scope,
        )


    # ------------------------------------------------------
    # Point completeness
    # ------------------------------------------------------

    complete = all(

        statuses[
            domain
        ]
        ==
        "measured"

        for domain
        in normalized_scope[
            "domains"
        ]

    )


    return {

        "statuses":
            statuses,

        "complete":
            complete,

        "scope":
            normalized_scope,

    }


# ==========================================================
# CALCULATE DOMAIN COVERAGE
# ==========================================================


def calculate_domain_coverage(
    measurements,
    measurement_scope,
):
    """
    Calculate coverage independently for RF,
    Electric Field and Magnetic Field.

    Domains outside the selected scope are explicitly
    marked as not_in_scope.
    """

    normalized_scope = (
        normalize_measurement_scope(
            measurement_scope
        )
    )


    points = (

        measurements

        if isinstance(
            measurements,
            list,
        )

        else []

    )


    result = {}


    for domain in VALID_DOMAINS:

        # --------------------------------------------------
        # Domain not assessed
        # --------------------------------------------------

        if domain not in normalized_scope[
            "domains"
        ]:

            result[
                domain
            ] = {

                "status":
                    "not_in_scope",

                "measured":
                    0,

                "total":
                    len(
                        points
                    ),

                "percent":
                    None,

            }

            continue


        measured_count = 0


        # --------------------------------------------------
        # Count valid measurements
        # --------------------------------------------------

        for point in points:

            if not isinstance(
                point,
                dict,
            ):
                continue


            measurement = point.get(
                "m"
            )


            if not isinstance(
                measurement,
                dict,
            ):

                measurement = point


            status = (
                get_measurement_status(
                    measurement=measurement,
                    domain=domain,
                    measurement_scope=normalized_scope,
                )
            )


            if status == "measured":

                measured_count += 1


        total = len(
            points
        )


        percent = (

            (
                measured_count
                /
                total
            )
            * 100

            if total

            else 0

        )


        result[
            domain
        ] = {

            "status":
                "measured",

            "measured":
                measured_count,

            "total":
                total,

            "percent":
                round(
                    percent,
                    1,
                ),

        }


    return result