"""
PHI PDF Base Layout

Shared page geometry for all PIL-rendered pages.
"""

from engine.pdf_components.framework.constants import (
    PAGE_WIDTH,
    PAGE_HEIGHT,
    CONTENT_WIDTH,
    CONTENT_HEIGHT,
    LEFT_MARGIN,
    RIGHT_MARGIN,
    TOP_MARGIN,
    BOTTOM_MARGIN,
    HEADER_HEIGHT,
    FOOTER_HEIGHT,
)

# ==========================================================
# PAGE
# ==========================================================

WIDTH = PAGE_WIDTH
HEIGHT = PAGE_HEIGHT

## ==========================================================
# CONTENT
# ==========================================================

CONTENT_X = LEFT_MARGIN
CONTENT_Y = TOP_MARGIN

# Nauja

HEADER_BOTTOM = HEADER_HEIGHT

CONTENT_TOP = HEADER_BOTTOM + 20

FOOTER_OFFSET = 20

FOOTER_TOP = (
    PAGE_HEIGHT
    - BOTTOM_MARGIN
    - FOOTER_HEIGHT
    + FOOTER_OFFSET
)

CONTENT_BOTTOM = FOOTER_TOP - 20

CONTENT_AREA_HEIGHT = (
    CONTENT_BOTTOM
    - CONTENT_TOP
)

# ==========================================================
# GRID
# ==========================================================

COLUMN_GAP = 14
ROW_GAP = 28

# ==========================================================
# HEADER / FOOTER
# ==========================================================

HEADER_HEIGHT = 90
FOOTER_HEIGHT = 70

HEADER_Y = TOP_MARGIN

FOOTER_Y = (
    PAGE_HEIGHT
    - BOTTOM_MARGIN
    - FOOTER_HEIGHT
)

# ==========================================================
# STANDARD CARD WIDTHS
# ==========================================================

CARD_WIDTH_1 = CONTENT_WIDTH

CARD_WIDTH_2 = (
    CONTENT_WIDTH
    - COLUMN_GAP
) // 2

CARD_WIDTH_3 = (
    CONTENT_WIDTH
    - COLUMN_GAP * 2
) // 3

CARD_WIDTH_4 = (
    CONTENT_WIDTH
    - COLUMN_GAP * 3
) // 4

# ==========================================================
# STANDARD CARD HEIGHTS
# ==========================================================

CARD_HEIGHT_SM = 100
CARD_HEIGHT_MD = 260
CARD_HEIGHT_LG = 300
CARD_HEIGHT_XL = 360

# ==========================================================
# PANEL PADDING
# ==========================================================

LEFT_PADDING = 36
RIGHT_PADDING = 36