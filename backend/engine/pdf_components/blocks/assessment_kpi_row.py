"""
Assessment KPI Row

Premium Property KPI Cards
"""

from engine.pdf_components.cards.premium_metric_card import (
    draw_premium_metric_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)

from engine.pdf_layouts.assessment_layout import (
    KPI_HEIGHT,
    KPI_CARD_GAP,
)


def draw_assessment_kpi_row(
    img,
    draw,
    x,
    y,
    width,
    metrics,
    fonts,
):
    """
    Draw the four Property Overview KPI cards.

    Cards:
        1. Measurements
        2. Assessed Areas
        3. Identified Sources
        4. Data Confidence
    """

    # ======================================================
    # CARD WIDTH
    # ======================================================

    card_width = (
        width
        - KPI_CARD_GAP * 3
    ) / 4

    # ======================================================
    # VALUES
    # ======================================================

    measurement_count = metrics.get(
        "measurement_count",
        0,
    )

    total_points = metrics.get(
        "total_points",
        0,
    )

    room_count = metrics.get(
        "room_count",
        0,
    )

    source_count = metrics.get(
        "source_count",
        0,
    )

    confidence = metrics.get(
        "confidence",
        "INITIAL",
    )

    coverage = metrics.get(
        "coverage",
        0,
    )

    # ======================================================
    # CARDS
    # ======================================================

    cards = [

        # --------------------------------------------------
        # 1. MEASUREMENTS
        # --------------------------------------------------

        {
            "title": "MEASUREMENTS",

            "value": (
                f"{measurement_count}"
                f" / "
                f"{total_points}"
            ),

            "subtitle": "Completed Points",

            "description": (
                f"{round(coverage)}% of planned "
                "measurements"
            ),

            "icon": get_icon(
                "measurement_point"
            ),

            "accent": "#FF6B00",
        },

        # --------------------------------------------------
        # 2. ASSESSED AREAS
        # --------------------------------------------------

        {
            "title": "ASSESSED AREAS",

            "value": room_count,

            "subtitle": "Rooms Analysed",

            "description": (
                "Total living area evaluated"
            ),

            "icon": get_icon(
                "property"
            ),

            "accent": PRIMARY,
        },

        # --------------------------------------------------
        # 3. IDENTIFIED SOURCES
        # --------------------------------------------------

        {
            "title": "IDENTIFIED SOURCES",

            "value": source_count,

            "subtitle": "EMF Sources",

            "description": (
                "Active sources detected"
            ),

            "icon": get_icon(
                "wifi"
            ),

            "accent": PRIMARY,
        },

        # --------------------------------------------------
        # 4. DATA CONFIDENCE
        # --------------------------------------------------

        {
            "title": "DATA CONFIDENCE",

            "value": confidence,

            "subtitle": "Assessment Status",

            "description": (
                "Based on available data"
            ),

            "icon": get_icon(
                "health_score"
            ),

            "accent": PRIMARY,
        },
    ]

    # ======================================================
    # DRAW
    # ======================================================

    current_x = x

    for card in cards:

        draw_premium_metric_card(
            img=img,
            draw=draw,

            x=current_x,
            y=y,

            width=card_width,
            height=KPI_HEIGHT,

            title=card["title"],

            value=card["value"],

            subtitle=card["subtitle"],

            description=card["description"],

            icon=card["icon"],

            accent=card["accent"],

            fonts=fonts,
        )

        current_x += (
            card_width
            + KPI_CARD_GAP
        )

    # ======================================================
    # RETURN
    # ======================================================

    return y + KPI_HEIGHT