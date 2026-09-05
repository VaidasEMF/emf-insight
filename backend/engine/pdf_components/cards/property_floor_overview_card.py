"""
PHI Design System

Property Floor Overview Card
"""

from pathlib import Path
from PIL import Image

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
    BORDER,
    SUCCESS,
    INFO,
)

from engine.pdf_components.framework.typography import (
    draw_paragraph,
    draw_label,
    draw_text,
)


# ==========================================================
# LAYOUT
# ==========================================================

TOP_PADDING = 14

HEADER_GAP = 12

DESCRIPTION_BOTTOM_GAP = 12

# ----------------------------------------------------------
# KPI PANEL
# ----------------------------------------------------------

KPI_TOP_GAP = 16

KPI_PANEL_HEIGHT = 210

KPI_PADDING_TOP = 10
KPI_PADDING_BOTTOM = 8

KPI_ICON_SIZE = 48


KPI_LABEL_GAP = 8

KPI_VALUE_GAP = 6


# ==========================================================
# FLOOR KPI ICONS
# ==========================================================

FLOOR_ICONS_DIR = (
    Path(__file__).resolve()
    .parents[2]
    / "assets"
    / "floors"
)


# ==========================================================
# HELPERS
# ==========================================================

def _draw_kpi_icon(
    img,
    filename,
    center_x,
    y,
):
    """
    Draw one Floor Overview KPI icon.
    """

    icon_path = (
        FLOOR_ICONS_DIR
        / filename
    )

    if not icon_path.exists():
        print(
            "KPI ICON NOT FOUND:",
            icon_path,
        )
        return

    icon = Image.open(
        icon_path
    ).convert("RGBA")

    icon.thumbnail(
        (
            KPI_ICON_SIZE,
            KPI_ICON_SIZE,
        ),
        Image.Resampling.LANCZOS,
    )

    icon_x = int(
        center_x
        - icon.width / 2
    )

    img.paste(
        icon,
        (
            icon_x,
            int(y),
        ),
        icon,
    )


def _center_text_x(
    draw,
    center_x,
    text,
    font,
):
    """
    Calculate left X position for centered text.
    """

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = (
        bbox[2]
        - bbox[0]
    )

    return (
        center_x
        - text_width / 2
    )


# ==========================================================
# CARD
# ==========================================================

def draw_property_floor_overview_card(
    img,
    draw,
    project,
    analysis,
    fonts,
    x,
    y,
    width,
):
    """
    Draw Floor Overview card.

    Structure:

        Header
        Description
        KPI panel

    KPI structure:

        Icon
        Value
        Label
        Secondary label

    Height is calculated dynamically.
    """

    # ======================================================
    # DATA
    # ======================================================

    print(
        "🔥 FLOOR CARD DEBUG:",
        analysis.get("floor_name"),
        "ROOMS:",
        len(analysis.get("rooms", [])),
        "POINTS:",
        len(analysis.get("points", [])),
    )


    rooms = len(
        analysis.get(
            "rooms",
            [],
        )
    )

    measurements = len(
        analysis.get(
            "points",
            [],
        )
    )

    coverage = round(
        analysis.get(
            "coverage",
            {},
        ).get(
            "coverage",
            0,
        )
    )

    # ======================================================
    # DESCRIPTION
    # ======================================================

    description = (
        "This floor shows elevated exposure in the living room "
        "and near the electrical panel. Outdoor sources, such as "
        "the nearby power line, contribute to overall background exposure."
    )

    # ======================================================
    # CARD HEIGHT
    # ======================================================

    description_height = (
        fonts["body"].size * 3
        + 12
    )

    card_height = (
        TOP_PADDING
        + fonts["subtitle"].size
        + HEADER_GAP
        + description_height
        + DESCRIPTION_BOTTOM_GAP
        + KPI_TOP_GAP
        + KPI_PANEL_HEIGHT
        + KPI_PADDING_BOTTOM
    )

    # ======================================================
    # CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=card_height,
    )

    current_y = area["y"]

    # ======================================================
    # HEADER
    # ======================================================

    current_y = draw_card_header(
        draw=draw,
        img=img,
        icon=get_icon("clipboard"),
        x=area["x"],
        y=current_y,
        title="FLOOR OVERVIEW",
        font=fonts["subtitle"],
        color=PRIMARY,
    )

    current_y += HEADER_GAP

    # ======================================================
    # DESCRIPTION
    # ======================================================

    current_y = draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=area["width"] - 4,
        text=description,
        font=fonts["body"],
        fill=PRIMARY,
        line_spacing=5,
    )

    # ======================================================
    # KPI PANEL POSITION
    # ======================================================

    kpi_y = (
        current_y
        + 8
    )

    kpi_x = area["x"]

    kpi_width = area["width"]

    # ======================================================
    # KPI PANEL
    # ======================================================

    draw.rounded_rectangle(
        (
            int(kpi_x),
            int(kpi_y),
            int(
                kpi_x
                + kpi_width
            ),
            int(
                kpi_y
                + KPI_PANEL_HEIGHT
            ),
        ),
        radius=10,
        outline=BORDER,
        width=1,
    )

    # ======================================================
    # KPI COLUMNS
    # ======================================================

    column_width = (
        kpi_width / 3
    )

    # ======================================================
    # VERTICAL DIVIDERS
    # ======================================================

    divider_top = (
        kpi_y
        + 10
    )

    divider_bottom = (
        kpi_y
        + KPI_PANEL_HEIGHT
        - 10
    )

    for index in (1, 2):

        divider_x = (
            kpi_x
            + column_width
            * index
        )

        draw.line(
            (
                int(divider_x),
                int(divider_top),
                int(divider_x),
                int(divider_bottom),
            ),
            fill=BORDER,
            width=1,
        )

    # ======================================================
    # KPI CENTER POSITIONS
    # ======================================================

    rooms_x = (
        kpi_x
        + column_width / 2
    )

    measurements_x = (
        kpi_x
        + column_width
        + column_width / 2
    )

    coverage_x = (
        kpi_x
        + column_width * 2
        + column_width / 2
    )

    # ======================================================
    # KPI VERTICAL POSITIONS
    # ======================================================

    icon_y = (
        kpi_y
        + KPI_PADDING_TOP
    )

    value_y = (
        icon_y
        + KPI_ICON_SIZE
        + KPI_VALUE_GAP
    )

    label_y = (
        value_y
        + 46
        + KPI_LABEL_GAP
    )

    secondary_y = (
        label_y
        + fonts["caption"].size
        + 8
    )

    # ======================================================
    # ROOMS
    # ======================================================

    _draw_kpi_icon(
        img=img,
        filename="rooms.png",
        center_x=rooms_x,
        y=icon_y,
    )

    rooms_value = str(
        rooms
    )

    draw_text(
        draw=draw,
        x=_center_text_x(
            draw,
            rooms_x,
            rooms_value,
            fonts["subtitle"],
        ),
        y=value_y,
        text=rooms_value,
        font=fonts["subtitle"],
        fill=PRIMARY,
    )

    rooms_label = "ROOMS"

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            rooms_x,
            rooms_label,
            fonts["caption"],
        ),
        y=label_y,
        text=rooms_label,
        font=fonts["caption"],
        fill=SUCCESS,
    )

    rooms_secondary = "Assessed"

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            rooms_x,
            rooms_secondary,
            fonts["caption"],
        ),
        y=secondary_y,
        text=rooms_secondary,
        font=fonts["caption"],
        fill=TEXT_SECONDARY,
    )

    # ======================================================
    # MEASUREMENT POINTS
    # ======================================================

    _draw_kpi_icon(
        img=img,
        filename="measurement.png",
        center_x=measurements_x,
        y=icon_y,
    )

    measurements_value = str(
        measurements
    )

    draw_text(
        draw=draw,
        x=_center_text_x(
            draw,
            measurements_x,
            measurements_value,
            fonts["subtitle"],
        ),
        y=value_y,
        text=measurements_value,
        font=fonts["subtitle"],
        fill=INFO,
    )

    measurements_label = (
        "MEASUREMENT POINTS"
    )

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            measurements_x,
            measurements_label,
            fonts["caption"],
        ),
        y=label_y,
        text=measurements_label,
        font=fonts["caption"],
        fill=PRIMARY,
    )

    measurements_secondary = (
        "Collected"
    )

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            measurements_x,
            measurements_secondary,
            fonts["caption"],
        ),
        y=secondary_y,
        text=measurements_secondary,
        font=fonts["caption"],
        fill=TEXT_SECONDARY,
    )

    # ======================================================
    # AREA COVERAGE
    # ======================================================

    _draw_kpi_icon(
        img=img,
        filename="area_coverage.png",
        center_x=coverage_x,
        y=icon_y,
    )

    coverage_value = (
        f"{coverage}%"
    )

    draw_text(
        draw=draw,
        x=_center_text_x(
            draw,
            coverage_x,
            coverage_value,
            fonts["subtitle"],
        ),
        y=value_y,
        text=coverage_value,
        font=fonts["subtitle"],
        fill=SUCCESS,
    )

    coverage_label = (
        "AREA COVERAGE"
    )

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            coverage_x,
            coverage_label,
            fonts["caption"],
        ),
        y=label_y,
        text=coverage_label,
        font=fonts["caption"],
        fill=PRIMARY,
    )

    coverage_secondary = "Good"

    draw_label(
        draw=draw,
        x=_center_text_x(
            draw,
            coverage_x,
            coverage_secondary,
            fonts["caption"],
        ),
        y=secondary_y,
        text=coverage_secondary,
        font=fonts["caption"],
        fill=TEXT_SECONDARY,
    )

    # ======================================================
    # RETURN
    # ======================================================

    return (
        y
        + card_height
    )