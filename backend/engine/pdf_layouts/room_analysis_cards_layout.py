"""
Room Analysis Cards Layout

Dynamic layout for Room Analysis cards.

The layout supports 1–3 rooms per page.
No room-specific coordinates are hardcoded.
"""

from .base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    ROW_GAP,
)


# ==========================================================
# PAGE
# ==========================================================

ROOMS_PER_PAGE = 3


# ==========================================================
# CARD GRID
# ==========================================================

CARD_GAP = ROW_GAP

CARD_WIDTH = CONTENT_WIDTH

# Available vertical space is calculated dynamically
# by the page renderer.