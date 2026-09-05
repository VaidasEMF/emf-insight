# ==========================================================
# ROOM ANALYSIS CARD
# ==========================================================
"""
Dynamic Premium Room Analysis card.

Designed for:
    Floor Room Analysis

Canonical PHI model:

    Room
      ├── Measured Exposure
      ├── Zones (optional)
      ├── Source Context
      ├── Findings
      └── Recommendations

IMPORTANT:

Business Survey:

    Measurements = exposure truth

Sources:

    contextual information only

Sources MUST NOT modify:

    avg_rf
    max_rf
    avg_electric
    avg_magnetic
    SBM score
    risk

ZONE PRIORITY:

    Zones exist
        ↓
    Zone Analysis
        ↓
    Zone-first Source Context

    No Zones
        ↓
    Room Source Context

No room-specific values are hardcoded.
"""
from PIL import Image as PILImage

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
    draw_text,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
    PRIMARY,
)


# ==========================================================
# LAYOUT
# ==========================================================

CARD_PADDING = 18

HEADER_HEIGHT = 30

SECTION_GAP = 10

COLUMN_GAP = 12

BOTTOM_PADDING = 12

RISK_COLORS = {
    "high": "#E52521",
    "elevated": "#F57C00",
    "moderate": "#F2A900",
    "medium": "#F2A900",
    "low": "#159447",
}


# ==========================================================
# HELPERS
# ==========================================================


def _safe_float(
    value,
    default=0,
):
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


def _risk_key(
    risk,
):
    return str(
        risk or "unknown"
    ).strip().lower()


def _risk_label(
    risk,
):
    key = _risk_key(
        risk
    )

    labels = {
        "high": "HIGH",
        "elevated": "ELEVATED",
        "moderate": "MODERATE",
        "medium": "MEDIUM",
        "low": "LOW",
        "unknown": "UNKNOWN",
    }

    return labels.get(
        key,
        key.upper(),
    )


def _risk_color(
    risk,
):
    return RISK_COLORS.get(
        _risk_key(
            risk
        ),
        TEXT,
    )


def _get_font(
    fonts,
    *names,
):
    for name in names:

        font = fonts.get(
            name
        )

        if font is not None:
            return font

    return None


def _get_text(
    value,
    default="",
):
    if value is None:
        return default

    if isinstance(
        value,
        dict,
    ):

        return (
            value.get("name")
            or value.get("label")
            or value.get("title")
            or value.get("value")
            or default
        )

    return str(
        value
    )


def _draw_divider(
    draw,
    x,
    y,
    width,
):
    draw.line(
        (
            x,
            y,
            x + width,
            y,
        ),
        fill="#DCE3EC",
        width=1,
    )


def _draw_metric(
    draw,
    x_center,
    y,
    value,
    label,
    value_font,
    label_font,
):
    draw_center_text(
        draw=draw,
        x_center=x_center,
        y=y,
        text=str(
            value
        ),
        font=value_font,
        fill=TEXT,
    )

    draw_center_text(
        draw=draw,
        x_center=x_center,
        y=y + 22,
        text=str(
            label
        ).upper(),
        font=label_font,
        fill=TEXT_SECONDARY,
    )


def _safe_dict(
    value,
):
    if isinstance(
        value,
        dict,
    ):
        return value

    return {}


def _safe_list(
    value,
):
    if isinstance(
        value,
        list,
    ):
        return value

    return []


# ==========================================================
# SOURCE HELPERS
# ==========================================================


def _source_name(
    source,
):
    if not isinstance(
        source,
        dict,
    ):
        return str(
            source
        )

    return (
        source.get("label")
        or source.get("name")
        or source.get("source")
        or source.get("type")
        or "Unknown Source"
    )


def _source_state(
    source,
):
    if not isinstance(
        source,
        dict,
    ):
        return "UNKNOWN"

    state = (
        source.get(
            "operating_state"
        )
        or source.get(
            "operatingState"
        )
        or "unknown"
    )

    return str(
        state
    ).upper()


def _source_distance(
    source,
):
    """
    Return the canonical client-facing source distance.

    Priority:

        1. Cross-floor 3D distance
        2. Effective analytical distance
        3. Zone distance
        4. Room distance
        5. Nearest measurement point

    This function does not calculate distance.
    It only reads the already calculated
    analytical distance.
    """

    if not isinstance(
        source,
        dict,
    ):
        return None


    # ======================================================
    # DISTANCE OBJECT
    # ======================================================

    distance = _safe_dict(
        source.get(
            "distance"
        )
    )


    # ======================================================
    # DISTANCE BASIS
    # ======================================================

    basis = (
        source.get(
            "effective_distance_basis"
        )
        or
        source.get(
            "distance_basis"
        )
        or
        distance.get(
            "basis"
        )
    )


    # ======================================================
    # 1. CROSS-FLOOR 3D
    # ======================================================

    if (
        basis
        ==
        "cross_floor_3d"
    ):

        value = (
            distance.get(
                "effective_distance_m"
            )
        )

        if value is None:

            value = (
                distance.get(
                    "cross_floor_3d_m"
                )
            )

        if value is not None:

            return _safe_float(
                value,
                None,
            )


    # ======================================================
    # 2. EFFECTIVE DISTANCE
    # ======================================================

    value = (
        source.get(
            "effective_distance_m"
        )
    )

    if value is None:

        value = (
            source.get(
                "effective_distance"
            )
        )

    if value is None:

        value = (
            distance.get(
                "effective_distance_m"
            )
        )

    if value is None:

        value = (
            distance.get(
                "effective_distance"
            )
        )

    if value is not None:

        return _safe_float(
            value,
            None,
        )


    # ======================================================
    # 3. ZONE DISTANCE
    # ======================================================

    context_level = source.get(
        "context_level",
        "room",
    )

    if context_level == "zone":

        value = distance.get(
            "to_nearest_zone_m"
        )

        if value is not None:

            return _safe_float(
                value,
                None,
            )


    # ======================================================
    # 4. ROOM DISTANCE
    # ======================================================

    value = distance.get(
        "to_room_m"
    )

    if value is not None:

        return _safe_float(
            value,
            None,
        )


    # ======================================================
    # 5. MEASUREMENT POINT
    # ======================================================

    value = distance.get(
        "to_nearest_measurement_point_m"
    )

    if value is not None:

        return _safe_float(
            value,
            None,
        )


    return None


def _source_context_level(
    source,
):
    if not isinstance(
        source,
        dict,
    ):
        return "room"

    return source.get(
        "context_level",
        "room",
    )


def _source_primary_zone(
    source,
):
    if not isinstance(
        source,
        dict,
    ):
        return None

    zone = source.get(
        "primary_zone"
    )

    if isinstance(
        zone,
        dict,
    ):
        return zone

    return None


# ==========================================================
# ZONE HELPERS
# ==========================================================


def _zone_name(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return "Zone"

    return (
        zone.get("name")
        or zone.get("zone_name")
        or zone.get("label")
        or zone.get("title")
        or "Zone"
    )


def _zone_score(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return None

    return (
        zone.get("score")
        or zone.get("sbm")
        or zone.get("sbm_score")
        or zone.get("sbmScore")
    )


def _zone_risk(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return "unknown"

    return (
        zone.get("risk")
        or zone.get("status")
        or "unknown"
    )


def _zone_coverage(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return None

    coverage = zone.get(
        "coverage"
    )

    if isinstance(
        coverage,
        dict,
    ):
        return (
            coverage.get(
                "percent"
            )
            or coverage.get(
                "value"
            )
        )

    return coverage


def _zone_metric(
    zone,
    *keys,
):
    if not isinstance(
        zone,
        dict,
    ):
        return None

    for key in keys:

        value = zone.get(
            key
        )

        if value is not None:
            return value

    metrics = zone.get(
        "metrics"
    )

    if isinstance(
        metrics,
        dict,
    ):

        for key in keys:

            value = metrics.get(
                key
            )

            if value is not None:
                return value

    return None


# ==========================================================
# SOURCE CONTEXT NORMALIZATION
# ==========================================================


def _normalize_source_context(
    model,
):
    """
    Read canonical source_context.

    Returns:

        {
            "sources": [...],
            "primary_source": {...},
            "zones": [...]
        }
    """

    source_context = model.get(
        "source_context"
    )

    if not isinstance(
        source_context,
        dict,
    ):
        return {
            "sources": [],
            "primary_source": None,
            "zones": [],
        }


    sources = _safe_list(
        source_context.get(
            "sources"
        )
    )


    primary_source = source_context.get(
        "primary_source"
    )


    zones = _safe_list(
        source_context.get(
            "zones"
        )
    )


    return {

        "sources":
            [
                source
                for source in sources
                if isinstance(
                    source,
                    dict,
                )
            ],

        "primary_source":
            (
                primary_source
                if isinstance(
                    primary_source,
                    dict,
                )
                else None
            ),

        "zones":
            [
                zone
                for zone in zones
                if isinstance(
                    zone,
                    dict,
                )
            ],
    }


# ==========================================================
# ZONE ANALYSIS
# ==========================================================


def _get_zone_analysis(
    model,
):
    """
    Return canonical analytical Zone models.

    `zone_analysis` is the canonical source.

    These are human-use analytical zones,
    not source-context relationships.

    No zones are invented here.
    """

    if not isinstance(
        model,
        dict,
    ):
        return []


    zones = model.get(
        "zone_analysis"
    )


    if not isinstance(
        zones,
        list,
    ):
        return []


    return [
        zone
        for zone in zones
        if isinstance(
            zone,
            dict,
        )
    ]
# ==========================================================
# CLIENT-FACING HELPERS
# ==========================================================

def _format_distance(
    meters,
):
    """
    Format distance for US-facing PDF.

    Example:
        0.6 m  -> 0.6 m (24 in)
        1.5 m  -> 1.5 m (4 ft 11 in)
        7.4 m  -> 7.4 m (24 ft 3 in)
    """

    if meters is None:
        return "—"

    try:
        meters = float(meters)
    except (
        TypeError,
        ValueError,
    ):
        return "—"

    inches = meters * 39.3701

    if inches < 12:
        return (
            f"{meters:.1f} m "
            f"({inches:.0f} in)"
        )

    feet = int(
        inches // 12
    )

    remaining_inches = round(
        inches - feet * 12
    )

    if remaining_inches >= 12:
        feet += 1
        remaining_inches = 0

    if remaining_inches == 0:
        return (
            f"{meters:.1f} m "
            f"({feet} ft)"
        )

    return (
        f"{meters:.1f} m "
        f"({feet} ft "
        f"{remaining_inches} in)"
    )


def _client_zone_name(
    zone,
):
    """
    Return a client-facing zone name.

    Prefer explicit names.
    Fall back to analytical type.
    """

    if not isinstance(
        zone,
        dict,
    ):
        return "ZONE"

    value = (
        zone.get("name")
        or zone.get("zone_name")
        or zone.get("label")
        or zone.get("title")
    )

    if value:
        return str(
            value
        ).upper()

    zone_type = zone.get(
        "type"
    )

    if zone_type:
        return str(
            zone_type
        ).replace(
            "_",
            " ",
        ).upper()

    return "ZONE"


def _zone_exposure_label(
    risk,
):
    """
    Client-facing exposure wording.

    Keeps analytical risk as the source of truth.
    """

    key = _risk_key(
        risk
    )

    labels = {
        "high":
            "HIGH EXPOSURE",

        "elevated":
            "ELEVATED EXPOSURE",

        "moderate":
            "MODERATE EXPOSURE",

        "medium":
            "MODERATE EXPOSURE",

        "low":
            "LOW EXPOSURE",

        "unknown":
            "EXPOSURE NOT YET ASSESSED",
    }

    return labels.get(
        key,
        key.upper(),
    )


def _zone_metric_pair(
    zone,
    domain,
):
    """
    Return:

        average,
        maximum

    from canonical zone metrics.
    """

    metrics = _safe_dict(
        zone.get(
            "metrics"
        )
    )

    metric = _safe_dict(
        metrics.get(
            domain
        )
    )

    return (
        metric.get(
            "average"
        ),
        metric.get(
            "maximum"
        ),
    )


def _format_metric_pair(
    average,
    maximum,
):
    if (
        average is None
        and
        maximum is None
    ):
        return "—"

    if average is None:
        return (
            f"— / "
            f"{_safe_float(maximum):.0f}"
        )

    if maximum is None:
        return (
            f"{_safe_float(average):.1f}"
        )

    average_value = _safe_float(
        average
    )

    maximum_value = _safe_float(
        maximum
    )

    if float(
        average_value
    ).is_integer():

        average_text = (
            f"{average_value:.0f}"
        )

    else:

        average_text = (
            f"{average_value:.1f}"
        )

    return (
        f"{average_text}"
        f" / "
        f"{maximum_value:.0f}"
    )

def _source_context_label(
    source,
    has_zones,
):
    """
    Client-facing spatial context.

    Room Analysis V2 does not display
    zone names inside Source Context.

    Meaningful spatial context only:
        Adjacent area
        Other floor

    Otherwise nothing is displayed.
    """

    if not isinstance(
        source,
        dict,
    ):
        return ""

    spatial = str(
        source.get(
            "spatial_relevance",
            "",
        )
    ).strip().lower()

    if (
        "adjacent"
        in spatial
    ):
        return "Adjacent area"

    if (
        "cross_floor"
        in spatial
    ):
        return "Other floor"

    return ""


def _source_floor_label(
    source,
):
    """
    Return a concise client-facing source floor label.

    Only used for cross-floor sources.

    Preferred:

        source_floor_name

    Fallback:

        Floor 2
        Floor 3

    No floor label is returned for
    same-floor sources.
    """

    if not isinstance(
        source,
        dict,
    ):
        return ""

    same_floor = source.get(
        "same_floor"
    )

    if same_floor is True:
        return ""

    distance = source.get(
        "distance"
    )

    if not isinstance(
        distance,
        dict,
    ):
        distance = {}

    distance_basis = (
        source.get(
            "effective_distance_basis"
        )
        or source.get(
            "distance_basis"
        )
        or distance.get(
            "basis"
        )
    )

    is_cross_floor = (
        distance_basis
        == "cross_floor_3d"
    )

    if not is_cross_floor:
        return ""

    # ======================================================
    # PREFERRED FLOOR NAME
    # ======================================================

    floor_name = (
        source.get(
            "source_floor_name"
        )
        or source.get(
            "floor_name"
        )
    )

    if floor_name:
        return str(
            floor_name
        )

    # ======================================================
    # FALLBACK FLOOR INDEX
    # ======================================================

    floor_index = source.get(
        "source_floor"
    )

    if floor_index is None:
        floor_index = source.get(
            "floorIndex"
        )

    try:

        floor_index = int(
            floor_index
        )

    except (
        TypeError,
        ValueError,
    ):

        return "Other floor"

    if floor_index == 0:
        return "Main Floor"

    return (
        f"Floor {floor_index + 1}"
    )

def _source_relevance_label(
    source,
):
    """
    Translate existing analytical spatial relevance
    into a concise client-facing label.

    No new exposure calculation is performed.
    """

    if not isinstance(
        source,
        dict,
    ):
        return "UNKNOWN"

    spatial = str(
        source.get(
            "spatial_relevance",
            "",
        )
    ).lower()

    if spatial == "direct":
        return "VERY CLOSE"

    if spatial == "near":
        return "NEAR"

    if spatial == "adjacent":
        return "ADJACENT"

    if spatial == "cross_floor_potential":
        return "OTHER FLOOR"

    if spatial in (
        "",
        "unknown",
        "none",
        "null",
    ):
        return "CONTEXT"

    return spatial.replace(
        "_",
        " ",
    ).upper()


# ==========================================================
# DRAW ZONE ANALYSIS — V7
# ==========================================================

def _draw_zone_analysis(
    draw,
    x,
    y,
    width,
    available_height,
    zones,
    fonts,
):
    """
    Zone Analysis — V7.

    Compact analytical card inspired by the
    PHI reference layout.

    Structure:

        ZONE ANALYSIS (n)

        ┌─────────────────────────────────────────────┐
        │ ZONE NAME       EXPOSURE       COVERAGE      │
        │                                               │
        │                 RF     ELECTRIC    MAGNETIC  │
        │                 value     value       value   │
        │                 avg/max   avg/max     avg/max │
        └─────────────────────────────────────────────┘

    The component is content-aware but deliberately
    compact. It must not stretch vertically merely
    because the parent Room Analysis card is tall.
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        zones,
        list,
    ):
        return y

    zones = [
        zone
        for zone in zones
        if isinstance(
            zone,
            dict,
        )
    ]

    if not zones:
        return y

    # ======================================================
    # FONTS
    # ======================================================

    title_font = _get_font(
        fonts,
        "body_bold",
        "subtitle_bold",
        "bold",
        "body",
    )

    zone_font = _get_font(
        fonts,
        "subtitle_bold",
        "body_bold",
        "body",
        "caption",
    )

    value_font = _get_font(
        fonts,
        "body_bold",
        "body",
        "small",
        "caption",
    )

    label_font = _get_font(
        fonts,
        "tiny",
        "small",
        "caption",
        "body",
    )

    # ======================================================
    # TITLE
    # ======================================================

    draw_text(
        draw=draw,
        x=x,
        y=y,
        text=f"ZONE ANALYSIS ({len(zones)})",
        font=title_font,
        fill=TEXT,
    )

    y += 18

    # ======================================================
    # COMPACT ROW HEIGHT
    # ======================================================

    #
    # IMPORTANT:
    #
    # Do not stretch the zone card simply because
    # the Room Analysis card happens to be tall.
    #

    if len(zones) == 1:
        preferred_height = 88
    elif len(zones) == 2:
        preferred_height = 82
    else:
        preferred_height = 76

    available_for_rows = max(
        1,
        available_height - 18,
    )

    row_height = min(
        preferred_height,
        max(
            52,
            int(
                available_for_rows
                / max(
                    1,
                    len(zones),
                )
            ),
        ),
    )

    # ======================================================
    # ZONE CARDS
    # ======================================================

    for zone_index, zone in enumerate(
        zones
    ):

        # ==================================================
        # DATA
        # ==================================================

        risk = _zone_risk(
            zone
        )

        risk_color = _risk_color(
            risk
        )

        zone_name = (
            _client_zone_name(
                zone
            )
        )

        exposure_label = (
            _zone_exposure_label(
                risk
            )
        )

        if (
            exposure_label
            == "EXPOSURE NOT YET ASSESSED"
        ):
            exposure_label = (
                "NOT ASSESSED"
            )

        measured = zone.get(
            "measured_points"
        )

        total = zone.get(
            "total_points"
        )

        if (
            measured is not None
            and total is not None
        ):

            coverage_text = (
                f"{measured}/{total} measured"
            )

        else:

            coverage = _safe_float(
                zone.get(
                    "coverage",
                    0,
                )
            )

            coverage_text = (
                f"{coverage:.0f}% measured"
            )

        # ==================================================
        # METRICS
        # ==================================================

        rf_avg, rf_max = (
            _zone_metric_pair(
                zone,
                "rf",
            )
        )

        electric_avg, electric_max = (
            _zone_metric_pair(
                zone,
                "electric",
            )
        )

        magnetic_avg, magnetic_max = (
            _zone_metric_pair(
                zone,
                "magnetic",
            )
        )

        rf_value = _format_metric_pair(
            rf_avg,
            rf_max,
        )

        electric_value = _format_metric_pair(
            electric_avg,
            electric_max,
        )

        magnetic_value = _format_metric_pair(
            magnetic_avg,
            magnetic_max,
        )

        # ==================================================
        # CARD GEOMETRY
        # ==================================================

        card_top = y

        card_bottom = (
            card_top
            + row_height
        )

        draw.rounded_rectangle(
            (
                x,
                card_top,
                x + width,
                card_bottom,
            ),
            radius=7,
            fill="#F8FAFC",
            outline="#E1E7EF",
            width=1,
        )

        # ==================================================
        # IDENTITY / METRICS SPLIT
        # ==================================================

        identity_width = (
            width * 0.36
        )

        separator_x = (
            x
            + identity_width
        )

        metrics_x = (
            separator_x
            + 7
        )

        metrics_width = max(
            1,
            width
            - identity_width
            - 14,
        )

        metric_width = (
            metrics_width / 3
        )

        # ==================================================
        # ZONE NAME
        # ==================================================

        draw_text(
            draw=draw,
            x=x + 10,
            y=card_top + 16,
            text=str(
                zone_name
            ),
            font=zone_font,
            fill=TEXT,
        )

        # ==================================================
        # EXPOSURE BADGE
        # ==================================================

        exposure_text = str(
            exposure_label
        )

        badge_x = (
            x
            + identity_width * 0.50
        )

        badge_y = (
            card_top + 10
        )

        try:

            bbox = label_font.getbbox(
                exposure_text
            )

            badge_text_width = max(
                1,
                bbox[2] - bbox[0],
            )

        except Exception:

            badge_text_width = (
                len(
                    exposure_text
                )
                * 6
            )

        badge_width = min(
            92,
            identity_width - 20,
            badge_text_width + 10,
        )

        badge_height = 14

        draw.rounded_rectangle(
            (
                badge_x,
                badge_y,
                badge_x + badge_width,
                badge_y + badge_height,
            ),
            radius=5,
            fill="#FFFFFF",
            outline=risk_color,
            width=1,
        )

        draw_text(
            draw=draw,
            x=badge_x + 5,
            y=badge_y + 2,
            text=exposure_text,
            font=label_font,
            fill=risk_color,
        )

        # ==================================================
        # COVERAGE
        # ==================================================

        draw_text(
            draw=draw,
            x=x + 10,
            y=card_top + 37,
            text=str(
                coverage_text
            ),
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        # ==================================================
        # MAIN VERTICAL SEPARATOR
        # ==================================================

        draw.line(
            (
                separator_x,
                card_top + 7,
                separator_x,
                card_bottom - 7,
            ),
            fill="#E1E7EF",
            width=1,
        )

        # ==================================================
        # METRIC CENTERS
        # ==================================================

        centers = (
            metrics_x
            + metric_width / 2,

            metrics_x
            + metric_width * 1.5,

            metrics_x
            + metric_width * 2.5,
        )

        # ==================================================
        # INTERNAL METRIC SEPARATORS
        # ======================================================

        separator_1 = (
            metrics_x
            + metric_width
        )

        separator_2 = (
            metrics_x
            + metric_width * 2
        )

        draw.line(
            (
                separator_1,
                card_top + 12,
                separator_1,
                card_bottom - 10,
            ),
            fill="#E9EDF2",
            width=1,
        )

        draw.line(
            (
                separator_2,
                card_top + 12,
                separator_2,
                card_bottom - 10,
            ),
            fill="#E9EDF2",
            width=1,
        )

        # ==================================================
        # METRIC LABELS
        # ==================================================

        metric_label_y = (
            card_top + 4
        )

        draw_center_text(
            draw=draw,
            x_center=centers[0],
            y=metric_label_y,
            text="RF",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[1],
            y=metric_label_y,
            text="ELECTRIC",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[2],
            y=metric_label_y,
            text="MAGNETIC",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        # ==================================================
        # METRIC VALUES
        # ==================================================

        metric_value_y = (
            card_top + 37
        )

        draw_center_text(
            draw=draw,
            x_center=centers[0],
            y=metric_value_y,
            text=str(
                rf_value
            ),
            font=value_font,
            fill=TEXT,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[1],
            y=metric_value_y,
            text=str(
                electric_value
            ),
            font=value_font,
            fill=TEXT,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[2],
            y=metric_value_y,
            text=str(
                magnetic_value
            ),
            font=value_font,
            fill=TEXT,
        )

        # ==================================================
        # AVG / MAX
        # ==================================================

        avg_max_y = (
            card_top + 57
        )

        draw_center_text(
            draw=draw,
            x_center=centers[0],
            y=avg_max_y,
            text="(avg / max)",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[1],
            y=avg_max_y,
            text="(avg / max)",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        draw_center_text(
            draw=draw,
            x_center=centers[2],
            y=avg_max_y,
            text="(avg / max)",
            font=label_font,
            fill=TEXT_SECONDARY,
        )

        # ==================================================
        # NEXT ZONE
        # ==================================================

        y = (
            card_bottom
            + 6
        )

    # ======================================================
    # RETURN
    # ======================================================

    return y


    

# ==========================================================
# DRAW SOURCE CONTEXT — V4
# ==========================================================

def _draw_source_context(
    draw,
    x,
    y,
    width,
    available_height,
    source_context,
    has_zones,
    fonts,
):
    """
    Compact client-facing Source Context.

    Reference structure:

        SOURCE CONTEXT

        Source              Distance      Relevance       Context
        wifi_router         0.6 m         VERY STRONG     In the room
        mobile_tower        8.7 m         MODERATE        Outside
        ev_charger          6.7 m         LOW             Adjacent area

    Rules:

        - Never invent analytical values.
        - Never show UNKNOWN.
        - Never show generic CONTEXT.
        - Missing distance remains visually empty.
        - Rows stay compact.
        - Layout adapts to available width / height.
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        source_context,
        dict,
    ):
        return y

    sources = source_context.get(
        "sources",
        [],
    )

    if not isinstance(
        sources,
        list,
    ):
        return y

    sources = [
        source
        for source in sources
        if isinstance(
            source,
            dict,
        )
    ]

    if not sources:
        return y

    # ======================================================
    # FONTS
    # ======================================================

    title_font = _get_font(
        fonts,
        "body_bold",
        "subtitle_bold",
        "bold",
        "body",
    )

    body_font = _get_font(
        fonts,
        "body",
        "caption",
        "small",
    )

    small_font = _get_font(
        fonts,
        "small",
        "caption",
        "body",
    )

    tiny_font = _get_font(
        fonts,
        "tiny",
        "small",
        "caption",
        "body",
    )

    # ======================================================
    # TITLE
    # ======================================================

    draw_text(
        draw=draw,
        x=x,
        y=y,
        text="SOURCE CONTEXT",
        font=title_font,
        fill=TEXT,
    )

    y += 18

    # ======================================================
    # COLUMN GEOMETRY
    # ======================================================

    #
    # Keep the source column dominant.
    #
    source_x = x

    distance_x = (
        x
        + width * 0.40
    )

    relevance_x = (
        x
        + width * 0.78
    )

    context_x = (
        x
        + width * 0.84
    )

    # ======================================================
    # ROW HEIGHT
    # ======================================================

    base_row_height = 22

    cross_floor_row_height = 25

    # ======================================================
    # CONTENT-AWARE SOURCE LIMIT
    # ======================================================

    available_rows_height = max(
        1,
        available_height,
    )

    visible_sources = []

    used_height = 0

    for source in sources:

        distance_basis = (
            source.get(
                "effective_distance_basis"
            )
            or source.get(
                "distance_basis"
            )
        )

        is_cross_floor = (
            distance_basis
            == "cross_floor_3d"
        )

        current_row_height = (
            cross_floor_row_height
            if is_cross_floor
            else base_row_height
        )

        if (
            used_height
            + current_row_height
            >
            available_rows_height
        ):
            break

        visible_sources.append(
            source
        )

        used_height += (
            current_row_height
        )

       # ======================================================
    # SOURCE ROWS
    # ======================================================

    for source in visible_sources:

        # ==================================================
        # DATA
        # ==================================================

        name = _source_name(
            source
        )

        distance = _source_distance(
            source
        )

        distance_text = _format_distance(
            distance
        )

        relevance = _source_relevance_label(
            source
        )

        context = _source_context_label(
            source,
            has_zones,
        )

        floor_label = _source_floor_label(
            source
        )

        # ==================================================
        # NORMALIZE
        # ==================================================

        relevance = (
            str(
                relevance
            ).strip()
            if relevance
            else ""
        )

        context = (
            str(
                context
            ).strip()
            if context
            else ""
        )

        distance_text = (
            str(
                distance_text
            ).strip()
            if distance_text
            else ""
        )

        floor_label = (
            str(
                floor_label
            ).strip()
            if floor_label
            else ""
        )

        # --------------------------------------------------
        # NEVER SHOW GENERIC VALUES
        # --------------------------------------------------

        if relevance.upper() in (
            "UNKNOWN",
            "CONTEXT",
            "—",
            "-",
        ):
            relevance = ""

        if context.upper() in (
            "UNKNOWN",
            "CONTEXT",
            "—",
            "-",
            "ZONE",
        ):
            context = ""

        if distance_text.upper() in (
            "UNKNOWN",
            "—",
            "-",
        ):
            distance_text = ""

        # ==================================================
        # SOURCE
        # ==================================================

        draw_text(
            draw=draw,
            x=source_x,
            y=y,
            text=str(
                name
            ),
            font=body_font,
            fill=TEXT,
        )

        # ==================================================
        # DISTANCE + CROSS-FLOOR
        # ==================================================

        distance_display = distance_text

        if floor_label:

            if distance_display:

                distance_display = (
                    f"{distance_display}  {floor_label}"
                )

            else:

                distance_display = (
                    floor_label
                )

        if distance_display:

            draw_text(
                draw=draw,
                x=distance_x,
                y=y,
                text=distance_display,
                font=small_font,
                fill=TEXT_SECONDARY,
            )

        # ==================================================
        # RELEVANCE
        # ==================================================

        relevance_color = (
            TEXT_SECONDARY
        )

        relevance_display = (
            str(
                relevance
            ).strip()
            if relevance
            else ""
        )

        if relevance_display in (
            "VERY HIGH",
            "VERY STRONG",
            "VERY CLOSE",
            "NEAR",
        ):

            relevance_display = (
                "VERY STRONG"
            )

            relevance_color = _risk_color(
                "high"
            )

        elif relevance_display in (
            "MODERATE",
            "ADJACENT",
        ):

            relevance_display = (
                "MODERATE"
            )

            relevance_color = _risk_color(
                "moderate"
            )

        elif relevance_display in (
            "LOW",
            "OTHER FLOOR",
        ):

            relevance_display = (
                "LOW"
            )

            relevance_color = _risk_color(
                "low"
            )

        elif relevance_display in (
            "CROSS_FLOOR_POTENTIAL",
            "CROSS FLOOR POTENTIAL",
        ):

            relevance_display = (
                "CROSS FLOOR"
            )

            relevance_color = _risk_color(
                "moderate"
            )

        if relevance_display:

            # ==================================================
            # DYNAMIC RELEVANCE POSITION
            # ==================================================

            dynamic_relevance_x = relevance_x

            if distance_display:

                try:

                    distance_bbox = (
                        small_font.getbbox(
                            str(
                                distance_display
                            )
                        )
                    )

                    distance_width = (
                        distance_bbox[2]
                        - distance_bbox[0]
                    )

                except Exception:

                    try:

                        distance_width = (
                            small_font.getlength(
                                str(
                                    distance_display
                                )
                            )
                        )

                    except Exception:

                        distance_width = 0

                dynamic_relevance_x = max(
                    relevance_x,
                    distance_x
                    + distance_width
                    + 8,
                )

            draw_text(
                draw=draw,
                x=dynamic_relevance_x,
                y=y,
                text=relevance_display,
                font=tiny_font,
                fill=relevance_color,
            )

        # ==================================================
        # SPATIAL CONTEXT
        # ==================================================

        if context:

            draw_text(
                draw=draw,
                x=context_x,
                y=y,
                text=context,
                font=tiny_font,
                fill=TEXT_SECONDARY,
            )

        # ==================================================
        # NEXT ROW
        # ==================================================

        y += base_row_height


    # ======================================================
    # RETURN
    # ======================================================

    return y


# ==========================================================
def draw_room_analysis_card(
    img,
    draw,
    x,
    y,
    width,
    height,
    model,
    heatmap=None,
    fonts=None,
):
    """
    Room Analysis Card — V7.

    Presentation goals:

        HEADER
        ├── Room name / type
        └── Risk

        MAIN
        ├── LEFT
        │   ├── Heatmap
        │   └── SBM Score + Coverage
        │
        └── RIGHT
            ├── Zone Analysis
            └── Source Context

    Design principles:

        - Content-driven
        - No room-specific hardcoding
        - No page-height stretching
        - Heatmap remains visually dominant
        - Right column starts at the same visual level
        - Score / coverage stay attached to the heatmap
        - Zone/source sections consume only required height
        - Supports 0 / 1 / many zones
        - Supports 0 / 1 / many sources
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        model,
        dict,
    ):
        model = {}

    if not isinstance(
        fonts,
        dict,
    ):
        fonts = {}

    # ======================================================
    # BASE CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ======================================================
    # MODEL
    # ======================================================

    room = _safe_dict(
        model.get(
            "room"
        )
    )

    assessment = _safe_dict(
        model.get(
            "assessment"
        )
    )

    coverage_model = _safe_dict(
        model.get(
            "coverage"
        )
    )

    metrics = _safe_dict(
        model.get(
            "metrics"
        )
    )

    zone_analysis = _get_zone_analysis(
        model
    )

    if not isinstance(
        zone_analysis,
        list,
    ):
        zone_analysis = []

    zone_analysis = [
        zone
        for zone in zone_analysis
        if isinstance(
            zone,
            dict,
        )
    ]

    source_context = (
        _normalize_source_context(
            model
        )
    )

    if not isinstance(
        source_context,
        dict,
    ):
        source_context = {}

    sources = source_context.get(
        "sources",
        []
    )

    if not isinstance(
        sources,
        list,
    ):
        sources = []

    sources = [
        source
        for source in sources
        if isinstance(
            source,
            dict,
        )
    ]

    has_zones = bool(
        zone_analysis
    )

    # ======================================================
    # ROOM
    # ======================================================

    room_name = (
        room.get(
            "name"
        )
        or "Room"
    )

    room_type = (
        room.get(
            "type"
        )
        or "Room"
    )

    rank = model.get(
        "rank"
    )

    # ======================================================
    # SCORE
    # ======================================================

    score = _safe_float(
        assessment.get(
            "score",
            model.get(
                "score",
                0,
            ),
        )
    )

    risk = (
        assessment.get(
            "risk"
        )
        or metrics.get(
            "risk"
        )
        or model.get(
            "risk",
            "unknown",
        )
    )

    risk_label = _risk_label(
        risk
    )

    risk_color = _risk_color(
        risk
    )

    # ======================================================
    # COVERAGE
    # ======================================================

    coverage = _safe_float(
        coverage_model.get(
            "percent",
            metrics.get(
                "coverage",
                model.get(
                    "coverage",
                    0,
                ),
            ),
        )
    )

    # ======================================================
    # FONTS
    # ======================================================

    title_font = _get_font(
        fonts,
        "subtitle_bold",
        "body_bold",
        "bold",
        "body",
    )

    body_font = _get_font(
        fonts,
        "body",
        "caption",
    )

    small_font = _get_font(
        fonts,
        "small",
        "caption",
        "body",
    )

    tiny_font = _get_font(
        fonts,
        "tiny",
        "small",
        "caption",
        "body",
    )

    metric_font = _get_font(
        fonts,
        "small",
        "caption",
        "body",
    )

    score_font = _get_font(
        fonts,
        "body_bold",
        "body",
    )

    # ======================================================
    # CONTENT GEOMETRY
    # ======================================================

    content_x = (
        area["x"]
        + CARD_PADDING
    )

    content_y = (
        area["y"]
        + HEADER_HEIGHT
        + 4
    )

    content_width = max(
        1,
        area["width"]
        - CARD_PADDING * 2,
    )

    content_height = max(
        1,
        area["height"]
        - HEADER_HEIGHT
        - CARD_PADDING
        - 4,
    )

    # ======================================================
    # COLUMNS
    #
    # Reference composition:
    #
    # LEFT  ≈ 47%
    # RIGHT ≈ 53%
    # ======================================================

    column_gap = max(
        12,
        int(
            content_width
            * 0.025
        ),
    )

    left_width = (
        content_width
        * 0.50
    )

    right_x = (
        content_x
        + left_width
        + column_gap
    )

    right_width = max(
        1,
        content_width
        - left_width
        - column_gap,
    )

    # ======================================================
    # HEADER
    # ======================================================

    header_y = area["y"]

    title_x = (
        area["x"]
        + CARD_PADDING
    )

    # ------------------------------------------------------
    # OPTIONAL RANK
    # ------------------------------------------------------

    rank_number = None

    if rank is not None:

        try:

            rank_number = int(
                rank
            )

        except (
            TypeError,
            ValueError,
        ):

            rank_number = None

    if rank_number is not None:

        badge_size = 22

        draw.rounded_rectangle(
            (
                title_x,
                header_y,
                title_x
                + badge_size,
                header_y
                + badge_size,
            ),
            radius=5,
            fill=PRIMARY,
        )

        draw_center_text(
            draw=draw,
            x_center=(
                title_x
                + badge_size / 2
            ),
            y=(
                header_y
                + 2
            ),
            text=str(
                rank_number
            ),
            font=tiny_font,
            fill="#FFFFFF",
        )

        title_x += (
            badge_size
            + 8
        )

    # ------------------------------------------------------
    # ROOM NAME
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=title_x,
        y=header_y + 3,
        text=str(
            room_name
        ),
        font=title_font,
        fill=TEXT,
    )

    # ------------------------------------------------------
    # ROOM TYPE
    # ------------------------------------------------------

    if room_type:

        draw_text(
            draw=draw,
            x=title_x,
            y=header_y + 19,
            text=str(
                room_type
            ),
            font=tiny_font,
            fill=TEXT_SECONDARY,
        )

    # ------------------------------------------------------
    # RISK
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=(
            area["x"]
            + area["width"]
            - CARD_PADDING
            - 42
        ),
        y=header_y + 3,
        text=str(
            risk_label
        ),
        font=tiny_font,
        fill=risk_color,
    )

    # ======================================================
    # LEFT VISUAL HEIGHT
    #
    # Keep visual composition compact even if card is tall.
    # ======================================================

    visual_height = min(
        content_height * 0.86,
        230,
    )

    visual_height = max(
        120,
        visual_height,
    )

    # ======================================================
    # HEATMAP
    # ======================================================

    prepared_heatmap = None

    if isinstance(
        heatmap,
        dict,
    ):

        prepared_heatmap = (
            heatmap.get(
                "sbm"
            )
        )

    rendered_width = 0
    rendered_height = 0

    if prepared_heatmap is not None:

        try:

            original_width, original_height = (
                prepared_heatmap.size
            )

        except Exception:

            original_width = 0
            original_height = 0

        if (
            original_width > 0
            and original_height > 0
        ):

            heatmap_width_limit = (
                left_width
                * 1.08
            )

            heatmap_height_limit = (
                visual_height
                * 1.02
            )

            heatmap_scale = min(
                heatmap_width_limit
                / original_width,
                heatmap_height_limit
                / original_height,
            )

            rendered_width = max(
                1,
                int(
                    original_width
                    * heatmap_scale
                ),
            )

            rendered_height = max(
                1,
                int(
                    original_height
                    * heatmap_scale
                ),
            )

            image_x = (
                content_x
                + (
                    left_width
                    - rendered_width
                )
                / 2
            )

            image_y = (
                content_y
                + (
                    visual_height
                    - rendered_height
                )
                / 2
            )

            try:

                rendered_heatmap = (
                    prepared_heatmap.resize(
                        (
                            rendered_width,
                            rendered_height,
                        ),
                        resample=(
                            PILImage.Resampling.LANCZOS
                        ),
                    )
                )

            except Exception:

                rendered_heatmap = (
                    prepared_heatmap
                )

            img.paste(
                rendered_heatmap,
                (
                    int(
                        image_x
                    ),
                    int(
                        image_y
                    ),
                ),
                (
                    rendered_heatmap
                    if getattr(
                        rendered_heatmap,
                        "mode",
                        "",
                    )
                    == "RGBA"
                    else None
                ),
            )

    # ======================================================
    # LEFT SUMMARY
    # ======================================================

    summary_y = (
        content_y
        + visual_height
        + 8
    )

    # Keep summary inside the card.
    summary_y = min(
        summary_y,
        area["y"]
        + area["height"]
        - CARD_PADDING
        - 28,
    )

    # ------------------------------------------------------
    # SCORE
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=content_x,
        y=summary_y - 3,
        text=f"{score:.0f}",
        font=score_font,
        fill=risk_color,
    )

    # "/ 100" is deliberately positioned from
    # the actual score block, not a fixed card coordinate.

    draw_text(
        draw=draw,
        x=content_x + 35,
        y=summary_y + 3,
        text="/ 100",
        font=tiny_font,
        fill=TEXT,
    )

    draw_text(
        draw=draw,
        x=content_x,
        y=summary_y + 19,
        text="SBM SCORE",
        font=tiny_font,
        fill=TEXT_SECONDARY,
    )

    # ------------------------------------------------------
    # COVERAGE
    # ------------------------------------------------------

    coverage_x = (
        content_x
        + left_width
        * 0.56
    )

    draw_text(
        draw=draw,
        x=coverage_x,
        y=summary_y,
        text=f"{coverage:.0f}%",
        font=metric_font,
        fill=TEXT,
    )

    draw_text(
        draw=draw,
        x=coverage_x,
        y=summary_y + 22,
        text="MEASUREMENT COVERAGE",
        font=tiny_font,
        fill=TEXT_SECONDARY,
    )

    # ======================================================
    # RIGHT COLUMN
    # ======================================================

    right_y = content_y

    # ------------------------------------------------------
    # ZONE ANALYSIS
    # ------------------------------------------------------

    if has_zones:

        zone_height = max(
            70,
            min(
                content_height
                * 0.55,
                150,
            ),
        )

        zone_y = _draw_zone_analysis(
            draw=draw,
            x=right_x,
            y=right_y,
            width=right_width,
            available_height=zone_height,
            zones=zone_analysis,
            fonts=fonts,
        )

        if zone_y is not None:
            right_y = zone_y

        right_y += 8

    # ------------------------------------------------------
    # SOURCE CONTEXT
    # ------------------------------------------------------

    if sources:

        remaining_right_height = max(
            50,
            (
                content_y
                + content_height
                - right_y
            ),
        )

        right_y = _draw_source_context(
            draw=draw,
            x=right_x,
            y=right_y,
            width=right_width,
            available_height=remaining_right_height,
            source_context=source_context,
            has_zones=has_zones,
            fonts=fonts,
        )

    

    return area
    