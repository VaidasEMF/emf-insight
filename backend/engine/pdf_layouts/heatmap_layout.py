"""
Heatmap Layout

Premium Heatmap Page
"""

from .base_layout import *

# ==========================================================
# HERO
# ==========================================================

HEATMAP_CARD_X = LEFT_MARGIN
HEATMAP_CARD_Y = 140

HEATMAP_CARD_WIDTH = CONTENT_WIDTH
HEATMAP_CARD_HEIGHT = 520


# ==========================================================
# SECOND ROW
# ==========================================================

SECOND_ROW_Y = (
    HEATMAP_CARD_Y
    + HEATMAP_CARD_HEIGHT
    + ROW_GAP
)

EXPOSURE_X = LEFT_MARGIN
EXPOSURE_Y = SECOND_ROW_Y

EXPOSURE_WIDTH = CARD_WIDTH_2
EXPOSURE_HEIGHT = 980

SOURCES_X = (
    EXPOSURE_X
    + EXPOSURE_WIDTH
    + COLUMN_GAP
)

SOURCES_Y = SECOND_ROW_Y

SOURCES_WIDTH = CARD_WIDTH_2
SOURCES_HEIGHT = 980


# ==========================================================
# THIRD ROW
# ==========================================================

THIRD_ROW_Y = (
    SECOND_ROW_Y
    + EXPOSURE_HEIGHT
    + ROW_GAP
)

STANDARD_X = LEFT_MARGIN
STANDARD_Y = THIRD_ROW_Y

STANDARD_WIDTH = CARD_WIDTH_3
STANDARD_HEIGHT = 190

INTERPRETATION_X = (
    STANDARD_X
    + STANDARD_WIDTH
    + COLUMN_GAP
)

INTERPRETATION_Y = THIRD_ROW_Y

INTERPRETATION_WIDTH = CARD_WIDTH_3
INTERPRETATION_HEIGHT = 190

COVERAGE_X = (
    INTERPRETATION_X
    + INTERPRETATION_WIDTH
    + COLUMN_GAP
)

COVERAGE_Y = THIRD_ROW_Y

COVERAGE_WIDTH = CARD_WIDTH_3
COVERAGE_HEIGHT = 190


# ==========================================================
# OBSERVATIONS
# ==========================================================

OBSERVATIONS_X = LEFT_MARGIN

OBSERVATIONS_Y = (
    THIRD_ROW_Y
    + STANDARD_HEIGHT
    + ROW_GAP
)

OBSERVATIONS_WIDTH = CONTENT_WIDTH
OBSERVATIONS_HEIGHT = 260