# =====================
# NARRATIVE ENGINE
# =====================


def build_environment_narrative(
    analysis,
):

    summary = analysis.get(
        "summary",
        {},
    )

    environment = analysis.get(
        "environment",
        {},
    )

    score = summary.get(
        "score",
        0,
    )

    env_label = environment.get(
        "label",
        "Moderate",
    )

    sources = analysis.get(
        "sources",
        [],
    )

    source_types = [
        s.get(
            "type",
            "",
        )
        for s in sources
    ]

    # =====================
    # BASE
    # =====================

    if score >= 75:

        intro = (
            "The assessed environment "
            "demonstrated elevated biological "
            "electromagnetic exposure conditions."
        )

    elif score >= 40:

        intro = (
            "The measured environment "
            "demonstrated moderate biological "
            "exposure patterns."
        )

    else:

        intro = (
            "The evaluated environment remained "
            "within lower biological precautionary "
            "ranges."
        )

    # =====================
    # SOURCE INTERPRETATION
    # =====================

    if "wifi" in source_types:

        source_text = (
            "Primary exposure contributors " "included wireless infrastructure."
        )

    elif "tower" in source_types:

        source_text = (
            "External RF infrastructure appeared "
            "to contribute to cumulative exposure."
        )

    elif "electrical_panel" in source_types:

        source_text = (
            "Electrical infrastructure contributed "
            "to localized magnetic field exposure."
        )

    else:

        source_text = "Exposure conditions reflected " "combined environmental sources."

    # =====================
    # FINAL
    # =====================

    closing = (
        f"Overall environmental quality was " f"classified as {env_label.lower()}."
    )

    return [
        intro,
        source_text,
        closing,
    ]
