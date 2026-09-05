"""
PHI PDF Design System

Global geometry constants.

Contains ONLY:

- page geometry
- margins
- content area
- generic grid
- generic component geometry

Page-specific layouts belong in pdf_layouts/.
Spacing belongs in spacing.py.
Typography belongs in typography_tokens.py.
"""

# ==========================================================
# PAGE
# ==========================================================

PAGE_WIDTH = 1240
PAGE_HEIGHT = 1754

# ==========================================================
# MARGINS
# ==========================================================

LEFT_MARGIN = 70
RIGHT_MARGIN = 70

TOP_MARGIN = 60
BOTTOM_MARGIN = 20

# ==========================================================
# CONTENT AREA
# ==========================================================

CONTENT_WIDTH = (
    PAGE_WIDTH
    - LEFT_MARGIN
    - RIGHT_MARGIN
)

CONTENT_HEIGHT = (
    PAGE_HEIGHT
    - TOP_MARGIN
    - BOTTOM_MARGIN
)

# ==========================================================
# SAFE AREA
# ==========================================================

SAFE_LEFT = LEFT_MARGIN
SAFE_RIGHT = PAGE_WIDTH - RIGHT_MARGIN

SAFE_TOP = TOP_MARGIN
SAFE_BOTTOM = PAGE_HEIGHT - BOTTOM_MARGIN

# ==========================================================
# HEADER / FOOTER
# ==========================================================

HEADER_HEIGHT = 90
FOOTER_HEIGHT = 70

# ==========================================================
# GRID
# ==========================================================

COLUMN_GAP = 20
ROW_GAP = 20

# ==========================================================
# STANDARD CARD WIDTHS
# ==========================================================

CARD_WIDTH_1 = CONTENT_WIDTH

CARD_WIDTH_2 = (
    CONTENT_WIDTH - COLUMN_GAP
) // 2

CARD_WIDTH_3 = (
    CONTENT_WIDTH - COLUMN_GAP * 2
) // 3

CARD_WIDTH_4 = (
    CONTENT_WIDTH - COLUMN_GAP * 3
) // 4

# Legacy aliases

CARD_WIDTH_SM = CARD_WIDTH_2
CARD_WIDTH_MD = CARD_WIDTH_3
CARD_WIDTH_LG = CARD_WIDTH_1

# ==========================================================
# STANDARD CARD HEIGHTS
# ==========================================================

CARD_HEIGHT_XS = 60
CARD_HEIGHT_SM = 100
CARD_HEIGHT_MD = 160
CARD_HEIGHT_LG = 240
CARD_HEIGHT_XL = 320

# ==========================================================
# SECTION WIDTHS
# ==========================================================

SECTION_WIDTH = CONTENT_WIDTH
HALF_SECTION_WIDTH = CARD_WIDTH_2
QUARTER_SECTION_WIDTH = CARD_WIDTH_4

# ==========================================================
# CARD
# ==========================================================

CARD_PADDING_X = 24
CARD_PADDING_Y = 20

# ==========================================================
# RADII
# ==========================================================

RADIUS_SM = 8
RADIUS_MD = 18
RADIUS_LG = 24

PANEL_RADIUS = RADIUS_MD
BADGE_RADIUS = 8

# ==========================================================
# BORDERS
# ==========================================================

BORDER_WIDTH_SM = 0.5
BORDER_WIDTH_MD = 1

BORDER_WIDTH = BORDER_WIDTH_MD
DIVIDER_WIDTH = 0.5

# ==========================================================
# COMPONENTS
# ==========================================================

BADGE_HEIGHT = 34
PROGRESS_HEIGHT = 22
PILL_HEIGHT = 42

# ==========================================================
# EFFECTS
# ==========================================================

SHADOW_OFFSET = 3
SHADOW_SOFT = 0.04
SHADOW_MEDIUM = 0.08

# ==========================================================
# ACCENTS
# ==========================================================

ACCENT_LINE = 3
ACCENT_BAR_HEIGHT = 3


