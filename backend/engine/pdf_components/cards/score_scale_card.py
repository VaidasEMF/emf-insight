"""
PHI Design System

Premium Score Scale Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.primitives.badge import (
    draw_badge,
)

from engine.pdf_components.framework.colors import (
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

# ---------------------------------------------------------
# COLORS
# ---------------------------------------------------------

GREEN = "#22C55E"
LIME = "#84CC16"
YELLOW = "#EAB308"
ORANGE = "#F97316"
RED = "#DC2626"

TRACK = "#EDF2F7"

MARKER = "#111827"

SEGMENTS = [

    ("Excellent", GREEN),

    ("Good", LIME),

    ("Moderate", YELLOW),

    ("Elevated", ORANGE),

    ("Critical", RED),

]


def draw_score_scale_card(
    draw,
    x,
    y,
    width,
    height,
    score,
    risk,
    fonts,
):

    area = draw_base_card(

        draw=draw,

        x=x,
        y=y,

        width=width,
        height=height,

        title="PROPERTY HEALTH SCALE",

        title_font=fonts["subtitle"],

    )

    # ---------------------------------------------------------
    # BAR
    # ---------------------------------------------------------

    left = area["x"] + 26

    right = area["x"] + area["width"] - 26

    total = right - left

    bar_y = area["y"] + 58

    bar_h = 12

    segment = total / 5

    draw.rounded_rectangle(

        (

            left,

            bar_y,

            right,

            bar_y + bar_h,

        ),

        radius=bar_h // 2,

        fill=TRACK,

    )

    # ---------------------------------------------------------
    # COLORED SEGMENTS
    # ---------------------------------------------------------

    for i, (_, color) in enumerate(SEGMENTS):

        x1 = left + i * segment

        x2 = x1 + segment

        draw.rounded_rectangle(

            (

                x1,

                bar_y,

                x2,

                bar_y + bar_h,

            ),

            radius=bar_h // 2,

            fill=color,

        )

    # ---------------------------------------------------------
    # LABELS
    # ---------------------------------------------------------

    for i, (title, _) in enumerate(SEGMENTS):

        xx = left + segment * i + segment / 2

        draw_center_text(

            draw=draw,

            x_center=xx,

            y=bar_y - 24,

            text=title,

            font=fonts["caption"],

            fill=TEXT,

        )

    # ---------------------------------------------------------
    # MARKER
    # ---------------------------------------------------------

    score = max(0, min(100, score))

    marker_x = left + total * score / 100

    draw_center_text(

        draw=draw,

        x_center=marker_x,

        y=bar_y - 2,

        text="▼",

        font=fonts["body"],

        fill=MARKER,

    )

    # ---------------------------------------------------------
    # SCALE
    # ---------------------------------------------------------

    for value in [0,20,40,60,80,100]:

        xx = left + total * value / 100

        draw.line(

            (

                xx,

                bar_y + bar_h + 6,

                xx,

                bar_y + bar_h + 12,

            ),

            fill="#CBD5E1",

            width=1,

        )

        draw_center_text(

            draw=draw,

            x_center=xx,

            y=bar_y + 18,

            text=str(value),

            font=fonts["caption"],

            fill="#64748B",

        )

    # ---------------------------------------------------------
    # SCORE
    # ---------------------------------------------------------

    draw_center_text(

        draw=draw,

        x_center=(left + right) / 2,

        y=bar_y + 54,

        text=f"{score} / 100",

        font=fonts["metric"],

        fill=TEXT,

    )

    # ---------------------------------------------------------
    # BADGE
    # ---------------------------------------------------------

    if score < 20:

        variant = "success"

    elif score < 40:

        variant = "success"

    elif score < 60:

        variant = "warning"

    elif score < 80:

        variant = "orange"

    else:

        variant = "danger"

    draw_badge(

        draw=draw,

        x=(left + right) / 2 - 70,

        y=bar_y + 108,

        width=140,

        height=32,

        text=risk.upper(),

        variant=variant,

        font=fonts["body"],

    )