"""
PHI Design System

Surface Primitive
"""


def draw_surface(
    draw,
    x,
    y,
    width,
    height,
    fill="#FFFFFF",
    radius=18,
):
    """
    Draw card surface.
    """

    draw.rounded_rectangle(
        (
            int(x),
            int(y),
            int(x + width),
            int(y + height),
        ),
        radius=int(radius),
        fill=fill,
    )