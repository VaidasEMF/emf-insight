"""
Home Property Overview Block

Context-based overview for the Home Premium PDF.

This block intentionally does not use Business
measurement-oriented metrics.
"""

from PIL import ImageDraw

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    TEXT_DARK,
    SECONDARY_TEXT,
    CARD_BG,
    CARD_BORDER,
    DIVIDER,
    SUCCESS,
    INFO,
)


def draw_home_property_overview(
    *,
    draw,
    project,
    presentation,
    fonts,
):
    """
    Draw Home Property Overview content.

    Returns the bottom Y coordinate of the rendered block.
    """

    width = 1240

    property_data = presentation.get(
        "property",
        {},
    )

    assessment = presentation.get(
        "assessment",
        {},
    )

    lifestyle_areas = presentation.get(
        "lifestyle_areas",
        [],
    )

    indoor_sources = presentation.get(
        "indoor_sources",
        [],
    )

    outdoor_sources = presentation.get(
        "outdoor_sources",
        [],
    )

    # ------------------------------------------------------
    # PROPERTY
    # ------------------------------------------------------

    property_name = (
        project.get("property_name")
        or project.get("name")
        or "Home Property"
    )

    address = (
        project.get("address")
        or project.get("property_address")
        or "Address not provided"
    )

    floors = property_data.get(
        "floors",
        [],
    )

    floor_count = len(floors)

    completeness = assessment.get(
        "completeness",
        0,
    )

    insight_count = assessment.get(
        "insight_count",
        0,
    )

    lifestyle_count = len(
        lifestyle_areas
    )

    indoor_count = len(
        indoor_sources
    )

    outdoor_count = len(
        outdoor_sources
    )

    # ------------------------------------------------------
    # SECTION TITLE
    # ------------------------------------------------------

    y = 145

    draw.text(
        (60, y),
        "PROPERTY OVERVIEW",
        font=fonts["header_title"],
        fill=PRIMARY,
    )

    y += 62

    draw.text(
        (60, y),
        "Home context and assessment scope",
        font=fonts["body"],
        fill=SECONDARY_TEXT,
    )

    y += 58

    # ------------------------------------------------------
    # PROPERTY CARD
    # ------------------------------------------------------

    card_x = 60
    card_y = y
    card_w = width - 120
    card_h = 150

    draw.rounded_rectangle(
        (
            card_x,
            card_y,
            card_x + card_w,
            card_y + card_h,
        ),
        radius=18,
        fill=CARD_BG,
        outline=CARD_BORDER,
        width=2,
    )

    draw.text(
        (card_x + 28, card_y + 25),
        property_name,
        font=fonts["title"],
        fill=TEXT_DARK,
    )

    draw.text(
        (card_x + 28, card_y + 82),
        address,
        font=fonts["body"],
        fill=TEXT,
    )

    y = card_y + card_h + 30

    # ------------------------------------------------------
    # KPI CARDS
    # ------------------------------------------------------

    gap = 18
    kpi_w = (card_w - (gap * 2)) // 3
    kpi_h = 130

    metrics = [
        (
            "Floors",
            floor_count,
            PRIMARY,
        ),
        (
            "Lifestyle Areas",
            lifestyle_count,
            SUCCESS,
        ),
        (
            "Indoor Sources",
            indoor_count,
            INFO,
        ),
    ]

    for index, (
        label,
        value,
        accent,
    ) in enumerate(metrics):

        x = card_x + index * (
            kpi_w + gap
        )

        draw.rounded_rectangle(
            (
                x,
                y,
                x + kpi_w,
                y + kpi_h,
            ),
            radius=16,
            fill=CARD_BG,
            outline=CARD_BORDER,
            width=2,
        )

        draw.text(
            (
                x + 24,
                y + 20,
            ),
            label,
            font=fonts["small"],
            fill=SECONDARY_TEXT,
        )

        draw.text(
            (
                x + 24,
                y + 55,
            ),
            str(value),
            font=fonts["kpi_value"],
            fill=accent,
        )

    y += kpi_h + 30

    # ------------------------------------------------------
    # ASSESSMENT STATUS
    # ------------------------------------------------------

    status_h = 155

    draw.rounded_rectangle(
        (
            card_x,
            y,
            card_x + card_w,
            y + status_h,
        ),
        radius=18,
        fill=CARD_BG,
        outline=CARD_BORDER,
        width=2,
    )

    draw.text(
        (
            card_x + 28,
            y + 22,
        ),
        "ASSESSMENT STATUS",
        font=fonts["header_title"],
        fill=PRIMARY,
    )

    draw.text(
        (
            card_x + 28,
            y + 78,
        ),
        "Assessment completeness",
        font=fonts["body"],
        fill=TEXT,
    )

    completeness_text = (
        f"{round(completeness)}%"
    )

    draw.text(
        (
            card_x + card_w - 180,
            y + 72,
        ),
        completeness_text,
        font=fonts["kpi_value"],
        fill=PRIMARY,
    )

    # Progress bar

    bar_x = card_x + 28
    bar_y = y + 118
    bar_w = card_w - 56
    bar_h = 10

    draw.rounded_rectangle(
        (
            bar_x,
            bar_y,
            bar_x + bar_w,
            bar_y + bar_h,
        ),
        radius=5,
        fill=DIVIDER,
    )

    progress_w = int(
        bar_w * max(
            0,
            min(
                completeness,
                100,
            ),
        ) / 100
    )

    if progress_w > 0:
        draw.rounded_rectangle(
            (
                bar_x,
                bar_y,
                bar_x + progress_w,
                bar_y + bar_h,
            ),
            radius=5,
            fill=SUCCESS,
        )

    y += status_h + 30

    # ------------------------------------------------------
    # CONTEXT SUMMARY
    # ------------------------------------------------------

    summary_h = 155

    draw.rounded_rectangle(
        (
            card_x,
            y,
            card_x + card_w,
            y + summary_h,
        ),
        radius=18,
        fill=CARD_BG,
        outline=CARD_BORDER,
        width=2,
    )

    draw.text(
        (
            card_x + 28,
            y + 22,
        ),
        "CONTEXT SUMMARY",
        font=fonts["header_title"],
        fill=PRIMARY,
    )

    summary_lines = [
        f"Lifestyle areas identified: {lifestyle_count}",
        f"Indoor sources identified: {indoor_count}",
        f"Outdoor sources identified: {outdoor_count}",
        f"Contextual insights generated: {insight_count}",
    ]

    line_y = y + 72

    for line in summary_lines:

        draw.text(
            (
                card_x + 32,
                line_y,
            ),
            line,
            font=fonts["body"],
            fill=TEXT,
        )

        line_y += 25

    return y + summary_h
