"""
Exposure Overview Layout

Contains only layout constants used by the Exposure Overview page.
"""

from .base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    COLUMN_GAP,
)

# ==========================================================
# HEATMAP COMPARISON
# ==========================================================

HEATMAP_X = LEFT_MARGIN
HEATMAP_Y = 250

HEATMAP_WIDTH = (CONTENT_WIDTH - COLUMN_GAP) // 2
HEATMAP_HEIGHT = 420

# ==========================================================
# EXPOSURE BY TYPE
# ==========================================================

EXPOSURE_X = HEATMAP_X + HEATMAP_WIDTH + COLUMN_GAP
EXPOSURE_Y = HEATMAP_Y

EXPOSURE_WIDTH = HEATMAP_WIDTH
EXPOSURE_HEIGHT = HEATMAP_HEIGHT

# ==========================================================
# MAJOR SOURCES
# ==========================================================

SOURCES_X = LEFT_MARGIN
SOURCES_Y = HEATMAP_Y + HEATMAP_HEIGHT + 40

SOURCES_WIDTH = CONTENT_WIDTH
SOURCES_HEIGHT = 220

# ==========================================================
# MEASUREMENT COVERAGE
# ==========================================================

COVERAGE_X = LEFT_MARGIN
COVERAGE_Y = SOURCES_Y + SOURCES_HEIGHT + 40

COVERAGE_WIDTH = (CONTENT_WIDTH - COLUMN_GAP) // 2
COVERAGE_HEIGHT = 180

# ==========================================================
# KEY OBSERVATIONS
# ==========================================================

OBSERVATIONS_X = COVERAGE_X + COVERAGE_WIDTH + COLUMN_GAP
OBSERVATIONS_Y = COVERAGE_Y

OBSERVATIONS_WIDTH = COVERAGE_WIDTH
OBSERVATIONS_HEIGHT = COVERAGE_HEIGHT

# ==========================================================
# FOOTER INFO
# ==========================================================

FOOTER_INFO_X = LEFT_MARGIN
FOOTER_INFO_Y = COVERAGE_Y + COVERAGE_HEIGHT + 40

FOOTER_INFO_WIDTH = CONTENT_WIDTH
FOOTER_INFO_HEIGHT = 140