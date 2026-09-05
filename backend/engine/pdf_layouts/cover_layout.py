"""
Premium Cover Layout

Layout constants for the Premium Cover page.
"""

from .base_layout import *

# ==========================================================
# PANELS
# ==========================================================

LEFT_PANEL_WIDTH = 570
RIGHT_PANEL_WIDTH = PAGE_WIDTH - LEFT_PANEL_WIDTH

LEFT_PANEL_X = 0
LEFT_PANEL_Y = 0

RIGHT_PANEL_X = LEFT_PANEL_WIDTH
RIGHT_PANEL_Y = 0
RIGHT_PANEL_HEIGHT = PAGE_HEIGHT

# ==========================================================
# BOTTOM STRIP
# ==========================================================

BOTTOM_STRIP_HEIGHT = 140

BOTTOM_STRIP_X = 0
BOTTOM_STRIP_Y = PAGE_HEIGHT - BOTTOM_STRIP_HEIGHT
BOTTOM_STRIP_WIDTH = PAGE_WIDTH

# ==========================================================
# LOGO
# ==========================================================

LOGO_X = LEFT_PADDING
LOGO_Y = 55
LOGO_SIZE = 72

# ==========================================================
# TITLE
# ==========================================================

TITLE_X = LEFT_PADDING
TITLE_Y = 165

TITLE_LINE_SPACING = 14

# ==========================================================
# SUBTITLE
# ==========================================================

SUBTITLE_X = LEFT_PADDING
SUBTITLE_Y = 300

# ==========================================================
# PROJECT INFORMATION
# ==========================================================

INFO_LABEL_X = LEFT_PADDING
INFO_VALUE_X = LEFT_PADDING

INFO_START_Y = 380
INFO_BLOCK_HEIGHT = 88

INFO_DIVIDER_MARGIN = 18

# ==========================================================
# DIVIDERS
# ==========================================================

DIVIDER_X1 = LEFT_PADDING
DIVIDER_X2 = LEFT_PANEL_WIDTH - RIGHT_PADDING

BOTTOM_LINE_Y = 860

# ==========================================================
# SCORE CARD
# ==========================================================

SCORE_X = LEFT_PADDING
SCORE_Y = 930

SCORE_WIDTH = 430
SCORE_HEIGHT = 360

# ==========================================================
# COVERAGE CARD
# ==========================================================

COVERAGE_X = 360
COVERAGE_Y = SCORE_Y

# ==========================================================
# RIGHT PANEL
# ==========================================================

OVERVIEW_X = RIGHT_PANEL_X + 60
OVERVIEW_Y = 80

PLAN_X = RIGHT_PANEL_X + 50
PLAN_Y = 620

# ==========================================================
# PROPERTY OVERVIEW
# ==========================================================

OVERVIEW_TITLE_X = RIGHT_PANEL_X + 60
OVERVIEW_TITLE_Y = 50

OVERVIEW_CARD_X = RIGHT_PANEL_X + 60
OVERVIEW_CARD_Y = 120

# ==========================================================
# FOOTER
# ==========================================================

FOOTER_X = LEFT_PADDING
FOOTER_Y = 1370