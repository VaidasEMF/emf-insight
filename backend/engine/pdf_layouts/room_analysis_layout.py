"""
Room Analysis Layout

Professional Room Analysis Page
"""

from .base_layout import *

# ==========================================================
# HERO
# ==========================================================

ASSESSMENT_X = LEFT_MARGIN
ASSESSMENT_Y = 140

ASSESSMENT_WIDTH = CONTENT_WIDTH
ASSESSMENT_HEIGHT = 400

# ==========================================================
# SECOND ROW
# ==========================================================

SECOND_ROW_Y = (
    ASSESSMENT_Y
    + ASSESSMENT_HEIGHT
    + ROW_GAP
)

COVERAGE_X = LEFT_MARGIN
COVERAGE_Y = SECOND_ROW_Y

COVERAGE_WIDTH = CARD_WIDTH_2
COVERAGE_HEIGHT = 210

SOURCES_X = (
    COVERAGE_X
    + COVERAGE_WIDTH
    + COLUMN_GAP
)

SOURCES_Y = SECOND_ROW_Y

SOURCES_WIDTH = CARD_WIDTH_2
SOURCES_HEIGHT = 210

# ==========================================================
# THIRD ROW
# ==========================================================

THIRD_ROW_Y = (
    SECOND_ROW_Y
    + COVERAGE_HEIGHT
    + ROW_GAP
)



FINDINGS_X = LEFT_MARGIN
FINDINGS_Y = THIRD_ROW_Y

FINDINGS_WIDTH = CARD_WIDTH_2
FINDINGS_HEIGHT = 240

RECOMMENDATIONS_X = (
    FINDINGS_X
    + FINDINGS_WIDTH
    + COLUMN_GAP
)

RECOMMENDATIONS_Y = THIRD_ROW_Y

RECOMMENDATIONS_WIDTH = CARD_WIDTH_2
RECOMMENDATIONS_HEIGHT = 240