"""
Room Coverage Block

Room-level measurement coverage presentation.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.coverage_ring import (
    draw_coverage_ring,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
)


# ==========================================================
# LAYOUT
# ==========================================================

SIDE_PADDING = 18


# ==========================================================
# ROOM COVERAGE
# ==========================================================

def draw_room_coverage(
    img,
    draw,
    x,
    y,
    width,
    height,
    coverage,
    fonts,
):
    """
    Draw Room Coverage card.

    Parameters
    ----------
    coverage:
        Room coverage model produced by
        build_room_analysis()["coverage"].
    """

    if not isinstance(
        coverage,
        dict,
    ):

        coverage = {}

    # ======================================================
    # COVERAGE VALUE
    # ======================================================

    measured = coverage.get(
        "percent",
        0,
    )

    try:

        measured = float(
            measured
        )

    except (
        TypeError,
        ValueError,
    ):

        measured = 0

    measured = max(
        0,
        min(
            100,
            measured,
        ),
    )

    unmeasured = (
        100
        - measured
    )

    # ======================================================
    # CARD
    # ======================================================

    print(
        "🔥 DRAW ROOM COVERAGE:",
        "x=", x,
        "y=", y,
        "width=", width,
        "height=", height,
    )

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ======================================================
    # TITLE
    # ======================================================

    title_font = (
        fonts.get(
            "body_bold",
        )
        or fonts.get(
            "subtitle_bold",
        )
        or fonts.get(
            "bold",
        )
        or fonts.get(
            "body",
        )
    )

    draw_center_text(
        draw=draw,
        x_center=(
            area["x"]
            + area["width"] / 2
        ),
        y=(
            area["y"]
            + 10
        ),
        text="ROOM COVERAGE",
        font=title_font,
        fill=TEXT,
    )

    # ======================================================
    # COVERAGE RING
    # ======================================================

    ring_y = (
        area["y"]
        + 42
    )

    draw_coverage_ring(
        draw=draw,

        x=(
            area["x"]
            + (
                area["width"]
                - 116
            ) / 2
        ),

        y=ring_y,

        measured=measured,

        unmeasured=unmeasured,

        fonts=fonts,
    )

    # ======================================================
    # FOOT INFORMATION
    # ======================================================

    measured_points = coverage.get(
        "measured_points",
        0,
    )

    grid_spacing = coverage.get(
        "grid_spacing",
        "—",
    )

    confidence = coverage.get(
        "confidence",
        "Unknown",
    )

    info_font = (
        fonts.get(
            "caption",
        )
        or fonts.get(
            "small",
        )
        or fonts.get(
            "body",
        )
    )

    info_y = (
        area["y"]
        + area["height"]
        - 68
    )

    draw_center_text(
        draw=draw,
        x_center=(
            area["x"]
            + area["width"] / 2
        ),
        y=info_y,
        text=(
            f"Measured Points: "
            f"{measured_points}"
        ),
        font=info_font,
        fill=TEXT_SECONDARY,
    )

    draw_center_text(
        draw=draw,
        x_center=(
            area["x"]
            + area["width"] / 2
        ),
        y=info_y + 18,
        text=(
            f"Grid: {grid_spacing}"
        ),
        font=info_font,
        fill=TEXT_SECONDARY,
    )

    draw_center_text(
        draw=draw,
        x_center=(
            area["x"]
            + area["width"] / 2
        ),
        y=info_y + 36,
        text=(
            f"Confidence: {confidence}"
        ),
        font=info_font,
        fill=TEXT_SECONDARY,
    )

    return (
        area["y"]
        + area["height"]
    )