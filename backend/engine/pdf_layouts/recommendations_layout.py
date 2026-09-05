"""
PHI Recommendations Page Layout

Dynamic layout for the Home Wellness Recommendations page.
"""

from .base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    CONTENT_TOP,
    CONTENT_BOTTOM,
    COLUMN_GAP,
    ROW_GAP,
    CARD_WIDTH_2,
    CARD_WIDTH_3,
)


# ==========================================================
# PAGE HEADER
# ==========================================================

TITLE_X = LEFT_MARGIN
TITLE_Y = CONTENT_TOP


# ==========================================================
# CONTENT GEOMETRY
# ==========================================================

CONTENT_X = LEFT_MARGIN
CONTENT_Y = CONTENT_TOP + 58
CONTENT_WIDTH = CONTENT_WIDTH

CONTENT_MAX_Y = CONTENT_BOTTOM


# ==========================================================
# WHY
# ==========================================================

WHY_X = CONTENT_X
WHY_Y = CONTENT_Y
WHY_WIDTH = CONTENT_WIDTH


# ==========================================================
# MOST IMPORTANT AREAS
# ==========================================================

AREAS_Y_GAP = ROW_GAP

AREAS_WIDTH = CONTENT_WIDTH
AREAS_CARD_WIDTH = CARD_WIDTH_3


# ==========================================================
# PRIORITY ACTIONS
# ==========================================================

PRIORITY_Y_GAP = ROW_GAP

PRIORITY_CARD_WIDTH = CARD_WIDTH_3


# ==========================================================
# OTHER SOURCES
# ==========================================================

SOURCES_Y_GAP = ROW_GAP

SOURCES_WIDTH = CONTENT_WIDTH


# ==========================================================
# WHAT IS ALREADY GOOD
# ==========================================================

GOOD_Y_GAP = ROW_GAP

GOOD_WIDTH = CARD_WIDTH_2


# ==========================================================
# HOW TO PROCEED
# ==========================================================

PROCEED_Y_GAP = ROW_GAP

PROCEED_WIDTH = CONTENT_WIDTH


# ==========================================================
# PROPERTY HEALTH SCORE
# ==========================================================

SCORE_Y_GAP = ROW_GAP

SCORE_WIDTH = CONTENT_WIDTH


# ==========================================================
# CARD PADDING / VISUAL RHYTHM
# ==========================================================

SECTION_GAP = 24
CARD_GAP = COLUMN_GAP

# ==========================================================
# LEGACY COMPATIBILITY
# ==========================================================
#
# These constants are kept because legacy recommendation
# blocks may still be imported elsewhere.
#
# The new Recommendations page does NOT use them.
# ==========================================================

# ----------------------------------------------------------
# Legacy INFO
# ----------------------------------------------------------

INFO_X = CONTENT_X
INFO_Y = CONTENT_Y

INFO_WIDTH = CONTENT_WIDTH
INFO_HEIGHT = 140


# ----------------------------------------------------------
# Legacy SUMMARY
# ----------------------------------------------------------

SUMMARY_X = INFO_X
SUMMARY_Y = INFO_Y

SUMMARY_WIDTH = INFO_WIDTH
SUMMARY_HEIGHT = INFO_HEIGHT


# ----------------------------------------------------------
# Legacy KPI
# ----------------------------------------------------------

KPI_X = CONTENT_X
KPI_Y = INFO_Y + INFO_HEIGHT + ROW_GAP

KPI_WIDTH = CONTENT_WIDTH
KPI_HEIGHT = 110

KPI_GRID_X = KPI_X
KPI_GRID_Y = KPI_Y
KPI_GRID_WIDTH = KPI_WIDTH
KPI_GRID_HEIGHT = KPI_HEIGHT

PRIORITY_GUIDE_X = KPI_X
PRIORITY_GUIDE_Y = KPI_Y
PRIORITY_GUIDE_WIDTH = KPI_WIDTH
PRIORITY_GUIDE_HEIGHT = KPI_HEIGHT


# ----------------------------------------------------------
# Legacy HIGH
# ----------------------------------------------------------

HIGH_X = CONTENT_X
HIGH_Y = KPI_Y + KPI_HEIGHT + ROW_GAP

HIGH_WIDTH = CONTENT_WIDTH
HIGH_HEIGHT = 250

HIGH_PRIORITY_X = HIGH_X
HIGH_PRIORITY_Y = HIGH_Y
HIGH_PRIORITY_WIDTH = HIGH_WIDTH
HIGH_PRIORITY_HEIGHT = HIGH_HEIGHT


# ----------------------------------------------------------
# Legacy MEDIUM
# ----------------------------------------------------------

MEDIUM_X = CONTENT_X
MEDIUM_Y = HIGH_Y + HIGH_HEIGHT + ROW_GAP

MEDIUM_WIDTH = CONTENT_WIDTH
MEDIUM_HEIGHT = 220

MODERATE_PRIORITY_X = MEDIUM_X
MODERATE_PRIORITY_Y = MEDIUM_Y
MODERATE_PRIORITY_WIDTH = MEDIUM_WIDTH
MODERATE_PRIORITY_HEIGHT = MEDIUM_HEIGHT


# ----------------------------------------------------------
# Legacy LOW
# ----------------------------------------------------------

LOW_X = CONTENT_X
LOW_Y = MEDIUM_Y + MEDIUM_HEIGHT + ROW_GAP

LOW_WIDTH = CONTENT_WIDTH
LOW_HEIGHT = 220

GOOD_PRACTICES_X = LOW_X
GOOD_PRACTICES_Y = LOW_Y
GOOD_PRACTICES_WIDTH = LOW_WIDTH
GOOD_PRACTICES_HEIGHT = LOW_HEIGHT


# ----------------------------------------------------------
# Legacy FOOTER
# ----------------------------------------------------------

FOOTER_Y = LOW_Y + LOW_HEIGHT + ROW_GAP

FOOTER_CARD_WIDTH = CARD_WIDTH_3
FOOTER_CARD_HEIGHT = 160

FOOTER_CARD1_X = CONTENT_X
FOOTER_CARD2_X = (
    FOOTER_CARD1_X
    + FOOTER_CARD_WIDTH
    + COLUMN_GAP
)
FOOTER_CARD3_X = (
    FOOTER_CARD2_X
    + FOOTER_CARD_WIDTH
    + COLUMN_GAP
)

FOOTER1_X = FOOTER_CARD1_X
FOOTER2_X = FOOTER_CARD2_X
FOOTER3_X = FOOTER_CARD3_X

FOOTER_CARD1_Y = FOOTER_Y
FOOTER_CARD2_Y = FOOTER_Y
FOOTER_CARD3_Y = FOOTER_Y

FOOTER_WIDTH = FOOTER_CARD_WIDTH
FOOTER_HEIGHT = FOOTER_CARD_HEIGHT

BOTTOM_CARD_Y = FOOTER_Y

BOTTOM_CARD_WIDTH = FOOTER_CARD_WIDTH
BOTTOM_CARD_HEIGHT = FOOTER_CARD_HEIGHT

BOTTOM_CARD1_X = FOOTER_CARD1_X
BOTTOM_CARD2_X = FOOTER_CARD2_X
BOTTOM_CARD3_X = FOOTER_CARD3_X

BOTTOM_CARD1_Y = FOOTER_Y
BOTTOM_CARD2_Y = FOOTER_Y
BOTTOM_CARD3_Y = FOOTER_Y

FOOTER_SAFE_Y = (
    FOOTER_Y
    + FOOTER_CARD_HEIGHT
    + 60
)