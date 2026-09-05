"""
Executive KPI Row

Premium Executive KPI Cards
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

from engine.pdf_layouts.executive_layout import (
    KPI_HEIGHT,
    KPI_GRID_X,
    KPI_GRID_Y,
    KPI_GRID_WIDTH,
)

KPI_CARD_GAP = 12


def draw_executive_kpi_row(
    img,
    draw,
    metrics,
    fonts,
):
    """
    Draw the four Executive Summary KPI cards.

    Cards:
        1. Risk Level
        2. SBM Score
        3. ICNIRP
        4. Coverage
    """

    # ======================================================
    # CARD WIDTH
    # ======================================================

    card_width = (
        KPI_GRID_WIDTH
        - KPI_CARD_GAP * 3
    ) / 4

    # ======================================================
    # VALUES
    # ======================================================

    property_score = metrics.get(
        "property_score",
        {},
    )

    if not isinstance(
        property_score,
        dict,
    ):
        property_score = {}

    risk_level = property_score.get(
        "label",
        "Unknown",
    )

    sbm = metrics.get(
        "sbm",
        {},
    )

    if not isinstance(
        sbm,
        dict,
    ):
        sbm = {}

    sbm_score = sbm.get(
        "value",
        "-",
    )

    icnirp = metrics.get(
        "icnirp",
        {},
    )

    if not isinstance(
        icnirp,
        dict,
    ):
        icnirp = {}

    compliance = icnirp.get(
        "status",
        "Unknown",
    )

    measurement_count = metrics.get(
        "measurement_count",
        0,
    )

    total_points = metrics.get(
        "total_points",
        0,
    )

    coverage = metrics.get(
        "coverage",
        0,
    )

    if isinstance(
        coverage,
        dict,
    ):
        coverage = coverage.get(
            "percentage",
            0,
        )

    # ======================================================
    # CARDS
    # ======================================================

    cards = [

        # --------------------------------------------------
        # 1. RISK LEVEL
        # --------------------------------------------------

        {
            "title": "RISK LEVEL",

            "value": risk_level,

            "subtitle": "Property Health",

            "description": (
                "Overall property risk classification"
            ),

            "icon": get_icon(
                "health_score"
            ),

            "accent": SUCCESS,
        },

        # --------------------------------------------------
        # 2. SBM SCORE
        # --------------------------------------------------

        {
            "title": "SBM SCORE",

            "value": sbm_score,

            "subtitle": "Biological Model",

            "description": (
                "Standardized biological exposure score"
            ),

            "icon": get_icon(
                "assessment"
            ),

            "accent": SUCCESS,
        },

        # --------------------------------------------------
        # 3. ICNIRP
        # --------------------------------------------------

        {
            "title": "ICNIRP",

            "value": compliance,

            "subtitle": "Guideline Status",

            "description": (
                "Exposure guideline compliance"
            ),

            "icon": get_icon(
                "shield"
            ),

            "accent": SUCCESS,
        },

        # --------------------------------------------------
        # 4. COVERAGE
        # --------------------------------------------------

        {
            "title": "COVERAGE",

            "value": (
                f"{measurement_count}"
                f" / "
                f"{total_points}"
            ),

            "subtitle": "Measurement Points",

            "description": (
                f"{round(coverage)}% of planned "
                "measurements"
            ),

            "icon": get_icon(
                "measurement_point"
            ),

            "accent": PRIMARY,
        },
    ]

    # ======================================================
    # DRAW
    # ======================================================

    current_x = KPI_GRID_X

    for card in cards:

        draw_premium_metric_card(
            img=img,
            draw=draw,

            x=current_x,
            y=KPI_GRID_Y,

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

    return KPI_GRID_Y + KPI_HEIGHT