"""
Room Priorities Layout

PHI Room Priorities Page
"""

from .base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    ROW_GAP,
)

# ==========================================================
# PAGE HEADER
# ==========================================================

TITLE_X = LEFT_MARGIN
TITLE_Y = 120

# ==========================================================
# PRIORITY GUIDE
# ==========================================================

PRIORITY_GUIDE_X = LEFT_MARGIN
PRIORITY_GUIDE_Y = 180

PRIORITY_GUIDE_WIDTH = CONTENT_WIDTH
PRIORITY_GUIDE_HEIGHT = 110

# ==========================================================
# ROOM TABLE
# ==========================================================

ROOM_TABLE_X = LEFT_MARGIN
ROOM_TABLE_Y = PRIORITY_GUIDE_Y + PRIORITY_GUIDE_HEIGHT + ROW_GAP

ROOM_TABLE_WIDTH = CONTENT_WIDTH
ROOM_TABLE_HEIGHT = 1180

# ==========================================================
# TABLE COLUMNS
# ==========================================================

COL_ROOM = 0.18
COL_FLOOR = 0.08
COL_SESSION = 0.10
COL_HEIGHT = 0.10
COL_POINTS = 0.08
COL_PRIORITY = 0.12
COL_DRIVER = 0.16
COL_RECOMMENDATION = 0.18

# ==========================================================
# TABLE
# ==========================================================

HEADER_HEIGHT = 55
ROW_HEIGHT = 70

# ==========================================================
# CONTINUATION
# ==========================================================

CONTINUED_X = LEFT_MARGIN
CONTINUED_Y = ROOM_TABLE_Y + ROOM_TABLE_HEIGHT + ROW_GAP

# ==========================================================
# FOOTER NOTE
# ==========================================================

FOOTER_NOTE_X = LEFT_MARGIN
FOOTER_NOTE_Y = CONTINUED_Y + ROW_GAP

FOOTER_NOTE_WIDTH = CONTENT_WIDTH
FOOTER_NOTE_HEIGHT = 120

# ==========================================================
# FOOTER SAFE AREA
# ==========================================================

FOOTER_SAFE_Y = FOOTER_NOTE_Y + FOOTER_NOTE_HEIGHT + 60