# =====================
# OBSERVATIONS BLOCK
# =====================

from reportlab.platypus import Spacer

from engine.pdf_components.reportlab.sections.section_header import (
    render_section_header,
)

from engine.pdf_components.reportlab.cards.insights.insight_box import (
    render_insight_box,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)


# =====================
# BUILD OBSERVATIONS
# =====================


def build_observations(analysis):

    observations = []

    summary = analysis.get("summary", {})

    score = summary.get("score", 0)

    top = analysis.get("top_points", [])

    sources = analysis.get("sources", [])
    rf_values = []
    mag_values = []
    elec_values = []

    zones = analysis.get("zones", [])

    for p in analysis.get("points", []):

        m = p.get("m", {})

        rf_values.append(float(m.get("rf", 0)))

        mag_values.append(float(m.get("mag", 0)))

        elec_values.append(float(m.get("elec", 0)))

    # =====================
    # GLOBAL SCORE
    # =====================

    if score > 70:

        observations.append(
            "Elevated cumulative biological exposure patterns were identified."
        )

    elif score > 40:

        observations.append("Moderate biological exposure patterns detected.")

    else:

        observations.append(
            "Overall environmental exposure remained within lower biological ranges."
        )

    avg_rf = sum(rf_values) / max(1, len(rf_values))

    avg_mag = sum(mag_values) / max(1, len(mag_values))

    avg_elec = sum(elec_values) / max(1, len(elec_values))

    # =====================
    # DOMINANT FIELD
    # =====================

    if avg_rf > avg_mag and avg_rf > avg_elec:

        observations.append(
            (
                "RF radiation represents the dominant "
                "contributor to cumulative biological exposure."
            )
        )

    elif avg_mag > avg_rf and avg_mag > avg_elec:

        observations.append(
            (
                "Magnetic field activity contributed "
                "significantly to overall environmental load."
            )
        )

    else:

        observations.append(
            ("Electric field influence remained " "present across measured areas.")
        )

    # =====================
    # HOTSPOTS
    # =====================

    if top:

        hotspot = top[0]

        observations.append(
            (
                f"Peak cumulative exposure hotspot identified near "
                f"{hotspot.get('room', 'unknown area')}."
            )
        )

    # =====================
    # SOURCES
    # =====================

    wifi_count = len([s for s in sources if s.get("type") == "wifi"])

    if wifi_count >= 2:

        observations.append(
            ("Multiple WiFi sources may contribute " "to cumulative RF exposure.")
        )

    # =====================
    # ZONES
    # =====================

    bed_zones = len([z for z in zones if z.get("type") == "bed"])

    if bed_zones:

        observations.append(
            (
                "Sleeping zones require elevated precaution "
                "due to prolonged overnight exposure duration."
            )
        )

        if score > 50:

            observations.append(
                (
                    "Biological exposure within resting zones "
                    "may exceed recommended precautionary targets."
                )
            )

    return observations


# =====================
# RENDER
# =====================


def render_observations_block(
    story,
    analysis,
    styles,
    sections=None,
):

    observations = build_observations(analysis)

    if not observations:
        return

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="KEY OBSERVATIONS",
    )

    # =====================
    # INSIGHT BOX
    # =====================

    insight_box = render_insight_box(
        styles=styles,
        title="ANALYSIS INSIGHTS",
        items=observations,
        variant="info",
    )

    story.append(insight_box)

    story.append(
        Spacer(
            1,
            12,
        )
    )
