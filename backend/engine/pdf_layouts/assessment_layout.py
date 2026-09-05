"""
Assessment Summary Layout
"""

from engine.pdf_layouts.base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
)

# ==========================================================
# HERO
# ==========================================================

HERO_X = LEFT_MARGIN
HERO_Y = 105
HERO_WIDTH = CONTENT_WIDTH
HERO_HEIGHT =295


# ==========================================================
# KPI
# ==========================================================

KPI_X = LEFT_MARGIN
KPI_WIDTH = CONTENT_WIDTH

KPI_CARD_GAP = 12
KPI_HEIGHT = 315

# ==========================================================
# SECTIONS
# ==========================================================

SECTION_GAP = 24


# ==========================================================
# EXPOSURE ROW
# ==========================================================

SECTION_GAP = 24

EXPOSURE_X = LEFT_MARGIN

EXPOSURE_WIDTH = int(
    CONTENT_WIDTH * 0.62
)

EXPOSURE_HEIGHT = 440


WHAT_MEANS_X = (
    EXPOSURE_X
    + EXPOSURE_WIDTH
    + SECTION_GAP
)

WHAT_MEANS_WIDTH = (
    CONTENT_WIDTH
    - EXPOSURE_WIDTH
    - SECTION_GAP
)

INTERPRETATION_HEIGHT = 440


# ==========================================================
# FINDINGS / NEXT STEPS
# ==========================================================

FINDINGS_X = LEFT_MARGIN

FINDINGS_WIDTH = int(
    CONTENT_WIDTH * 0.50
    - SECTION_GAP / 2
)

NEXT_STEP_X = (
    FINDINGS_X
    + FINDINGS_WIDTH
    + SECTION_GAP
)

NEXT_STEP_WIDTH = (
    CONTENT_WIDTH
    - FINDINGS_WIDTH
    - SECTION_GAP
)

FINDINGS_HEIGHT = 220
NEXT_STEP_HEIGHT = 220


# ==========================================================
# METHODOLOGY
# ==========================================================

METHODOLOGY_X = LEFT_MARGIN
METHODOLOGY_WIDTH = CONTENT_WIDTH
METHODOLOGY_HEIGHT = 130