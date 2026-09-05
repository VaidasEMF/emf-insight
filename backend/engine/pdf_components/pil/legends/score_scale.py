"""
Property Health Score Scale

Reusable score scale used by PIL pages.
"""

from ...framework.colors import (
    SUCCESS,
    WARNING,
    ORANGE,
    DANGER,
    PRIMARY,
    SECONDARY_TEXT,
)

SCORE_MIN = 0
SCORE_MAX = 100

SCORE_LOW = 25
SCORE_MODERATE = 50
SCORE_HIGH = 75

SCALE_COLORS = (
    SUCCESS,
    WARNING,
    ORANGE,
    DANGER,
)


def draw_score_scale(
    draw,
    x,
    y,
    width,
    score,
    body_font,
):

    score = max(
        SCORE_MIN,
        min(SCORE_MAX, score),
    )

    bar_height = 12
    segment = width / 4

    # Color bar

    for i, color in enumerate(SCALE_COLORS):

        draw.rounded_rectangle(
            (
                x + i * segment,
                y,
                x + (i + 1) * segment,
                y + bar_height,
            ),
            radius=4,
            fill=color,
        )

    # Marker

    marker_x = x + width * score / SCORE_MAX

    draw.polygon(
        (
            (marker_x, y - 10),
            (marker_x - 6, y - 2),
            (marker_x + 6, y - 2),
        ),
        fill=PRIMARY,
    )

    # Numbers

    for value in (0, 25, 50, 75, 100):

        px = x + width * value / 100

        draw.text(
            (px - 8, y + 18),
            str(value),
            font=body_font,
            fill=SECONDARY_TEXT,
        )

    # Labels

    labels = (

        ("LOW", SUCCESS),

        ("MODERATE", WARNING),

        ("HIGH", ORANGE),

        ("VERY HIGH", DANGER),

    )

    for i, (label, color) in enumerate(labels):

        draw.text(
            (
                x + segment * i,
                y + 42,
            ),
            label,
            font=body_font,
            fill=color,
        )

    draw.text(
        (
            marker_x - 8,
            y - 28,
        ),
        str(round(score)),
        font=body_font,
        fill=PRIMARY,
    )