"""
PHI PDF Design System

Property Overview Layout

One-floor visual overview page.

Structure

Header
Floor heatmap
Primary EMF Sources
Floor Overview
Key Exposure Areas
Footer
"""

from .base_layout import *


# ==========================================================
# PAGE TITLE
# ==========================================================

TITLE_Y = 120


# ==========================================================
# FLOOR HEADER
# ==========================================================

FLOOR_HEADER_Y = 128

FLOOR_TITLE_X = LEFT_MARGIN

FLOOR_TITLE_WIDTH = CONTENT_WIDTH

FLOOR_DESCRIPTION_GAP = 8


# ==========================================================
# FLOOR SELECTOR
# ==========================================================

FLOOR_SELECTOR_WIDTH = 190

FLOOR_SELECTOR_HEIGHT = 38

FLOOR_SELECTOR_X = (
    LEFT_MARGIN
    + CONTENT_WIDTH
    - FLOOR_SELECTOR_WIDTH
)

FLOOR_SELECTOR_Y = (
    FLOOR_HEADER_Y
    - 4
)


# ==========================================================
# MAIN HEATMAP
# ==========================================================

HEATMAP_X = LEFT_MARGIN

HEATMAP_Y = 190

HEATMAP_WIDTH = CONTENT_WIDTH

# IMPORTANT:
#
# No fixed HEATMAP_HEIGHT.
#
# Heatmap card height is calculated dynamically
# by the heatmap card itself from the rendered
# floor-plan image.
#

HEATMAP_HEIGHT = None


# ==========================================================
# HEATMAP CONTENT
# ==========================================================

HEATMAP_PADDING = 18

HEATMAP_PLAN_GAP = 12

HEATMAP_MIN_HEIGHT = 480


# ==========================================================
# SOURCE MARKERS
# ==========================================================

SOURCE_MARKER_SIZE = 34

SOURCE_MARKER_GAP = 8


# ==========================================================
# LOWER SECTION
# ==========================================================

SECTION_GAP = 20

LOWER_SECTION_GAP = 20


# ==========================================================
# LOWER TWO-COLUMN LAYOUT
# ==========================================================

LOWER_COLUMN_GAP = 18


# ----------------------------------------------------------
# FLOOR OVERVIEW
# ----------------------------------------------------------

FLOOR_OVERVIEW_X = LEFT_MARGIN

FLOOR_OVERVIEW_Y = None

FLOOR_OVERVIEW_WIDTH = (
    CONTENT_WIDTH * 0.60
)

FLOOR_OVERVIEW_HEIGHT = None


# ----------------------------------------------------------
# KEY EXPOSURE AREAS
# ----------------------------------------------------------

KEY_EXPOSURE_AREAS_X = (
    FLOOR_OVERVIEW_X
    + FLOOR_OVERVIEW_WIDTH
    + LOWER_COLUMN_GAP
)

KEY_EXPOSURE_AREAS_Y = None

KEY_EXPOSURE_AREAS_WIDTH = (
    CONTENT_WIDTH
    - FLOOR_OVERVIEW_WIDTH
    - LOWER_COLUMN_GAP
)

KEY_EXPOSURE_AREAS_HEIGHT = None


# ==========================================================
# PRIMARY EMF SOURCES
# ==========================================================

SOURCES_X = LEFT_MARGIN

SOURCES_Y = None

SOURCES_WIDTH = CONTENT_WIDTH

SOURCES_HEIGHT = None


# ==========================================================
# FLOOR ASSESSMENT
# ==========================================================

FLOOR_ASSESSMENT_X = LEFT_MARGIN

FLOOR_ASSESSMENT_Y = None

FLOOR_ASSESSMENT_WIDTH = CONTENT_WIDTH

FLOOR_ASSESSMENT_HEIGHT = None


# ==========================================================
# LEGACY ALIASES
# ==========================================================

#
# Temporary compatibility aliases.
#
# Existing modules may still import these names.
# Do not use them for new Property Overview code.
#


# ----------------------------------------------------------
# OLD HEATMAP / PANEL
# ----------------------------------------------------------

PANEL_X = HEATMAP_X

PANEL_WIDTH = HEATMAP_WIDTH

PANEL_HEIGHT = None


# ----------------------------------------------------------
# OLD SBM / ICNIRP
# ----------------------------------------------------------

SBM_X = HEATMAP_X

SBM_Y = HEATMAP_Y

ICNIRP_X = HEATMAP_X

ICNIRP_Y = HEATMAP_Y


# ----------------------------------------------------------
# OLD SUMMARY
# ----------------------------------------------------------

SUMMARY_X = FLOOR_OVERVIEW_X

SUMMARY_Y = None

SUMMARY_WIDTH = FLOOR_OVERVIEW_WIDTH

SUMMARY_HEIGHT = None


# ----------------------------------------------------------
# OLD OBSERVATIONS
# ----------------------------------------------------------

OBSERVATIONS_X = FLOOR_ASSESSMENT_X

OBSERVATIONS_Y = None

OBSERVATIONS_WIDTH = FLOOR_ASSESSMENT_WIDTH

OBSERVATIONS_HEIGHT = None


# ----------------------------------------------------------
# OLD BOTTOM
# ----------------------------------------------------------

BOTTOM_Y = None


# ==========================================================
# GENERIC CARD GAP
# ==========================================================

CARD_GAP = 16


# ==========================================================
# LOWER PROPERTY SUMMARY
# ==========================================================

LOWER_SECTION_GAP = 20
LOWER_COLUMN_GAP = 18

# ==========================================================
# FLOOR OVERVIEW — LEFT
# ==========================================================

FLOOR_OVERVIEW_X = LEFT_MARGIN

FLOOR_OVERVIEW_Y = None

FLOOR_OVERVIEW_WIDTH = (
    CONTENT_WIDTH * 0.60
)

FLOOR_OVERVIEW_HEIGHT = None

# ==========================================================
# KEY EXPOSURE AREAS — RIGHT
# ==========================================================

EXPOSURE_AREAS_X = (
    FLOOR_OVERVIEW_X
    + FLOOR_OVERVIEW_WIDTH
    + LOWER_COLUMN_GAP
)

EXPOSURE_AREAS_Y = None

EXPOSURE_AREAS_WIDTH = (
    CONTENT_WIDTH
    - FLOOR_OVERVIEW_WIDTH
    - LOWER_COLUMN_GAP
)

EXPOSURE_AREAS_HEIGHT = None