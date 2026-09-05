"""
PHI Design System

Border Primitive
"""


def draw_border(
    draw,
    x,
    y,
    width,
    height,
    color="#D9E2EC",
    radius=18,
    line_width=2,
):
    """
    Draw rounded border.
    """

    draw.rounded_rectangle(
        (
            int(x),
            int(y),
            int(x + width),
            int(y + height),
        ),
        radius=int(radius),
        outline=color,
        width=int(line_width),
    )