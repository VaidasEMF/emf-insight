"""
Geometry helpers for PHI PDF Design System.
"""

import math


# ==========================================================
# ALIGNMENT
# ==========================================================

def center_x(x, width):
    return x + width / 2


def center_y(y, height):
    return y + height / 2


# ==========================================================
# RECTANGLES
# ==========================================================

def rect_center(x, y, width, height):
    return (
        x + width / 2,
        y + height / 2,
    )


def rect_right(x, width):
    return x + width


def rect_bottom(y, height):
    return y + height


# ==========================================================
# CIRCLE
# ==========================================================

def circle_bbox(cx, cy, radius):
    return (
        cx - radius,
        cy - radius,
        cx + radius,
        cy + radius,
    )


# ==========================================================
# DISTANCE
# ==========================================================

def distance(x1, y1, x2, y2):
    return math.hypot(
        x2 - x1,
        y2 - y1,
    )