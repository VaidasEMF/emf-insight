"""
Premium PDF Color Palette

Centralized color definitions used across
the PHI / EMF Maps PDF Design System.
"""

# ==========================================================
# BRAND
# ==========================================================

PRIMARY = "#071D49"
PRIMARY_LIGHT = "#0B4F8A"

ACCENT = "#DC2626"
ACCENT_LIGHT = "#FF3B30"

# ==========================================================
# NEUTRALS
# ==========================================================

WHITE = "#FFFFFF"
BLACK = "#000000"

BACKGROUND = "#F8FAFC"
SECTION_BG = BACKGROUND

CARD_BG = WHITE
CARD_BACKGROUND = CARD_BG

PANEL_BG = PRIMARY

# ==========================================================
# TEXT
# ==========================================================

TEXT_PRIMARY = "#1E293B"
TEXT = "#475569"
TEXT_SECONDARY = "#6B7280"
TEXT_LIGHT = "#94A3B8"
TEXT_MUTED = "#BFC7D5"
TEXT_DISABLED = "#7A879A"

TEXT_WHITE = WHITE
TEXT_RED = ACCENT

# ==========================================================
# BORDERS
# ==========================================================

BORDER = "#E2E8F0"
CARD_BORDER = "#CBD5E1"
DIVIDER = "#E2E8F0"

SHADOW = "#E9EDF5"

ACCENT_LINE = "#E2E8F0"
ACCENT_BAR_HEIGHT = 3

# ==========================================================
# STATUS
# ==========================================================

SUCCESS = "#22C55E"
WARNING = "#F59E0B"
ORANGE = "#F97316"
DANGER = "#DC2626"
INFO = "#3B82F6"

SUCCESS_BG = "#ECFDF5"
WARNING_BG = "#FEF3C7"
DANGER_BG = "#FEE2E2"
INFO_BG = "#DBEAFE"

# ==========================================================
# SCORE SCALE
# ==========================================================

SCORE_EXCELLENT = "#16A34A"
SCORE_GOOD = SUCCESS
SCORE_MODERATE = WARNING
SCORE_HIGH = ORANGE
SCORE_CRITICAL = DANGER

# ==========================================================
# RISK LEVELS
# ==========================================================

VERY_LOW = SUCCESS
LOW = SUCCESS

MODERATE = WARNING

HIGH = DANGER
VERY_HIGH = DANGER
CRITICAL = DANGER

# ==========================================================
# EMF TYPES
# ==========================================================

RF_COLOR = DANGER
ELECTRIC_COLOR = WARNING
MAGNETIC_COLOR = "#2563EB"

# ==========================================================
# HEATMAP
# ==========================================================

HEATMAP_GREEN = SUCCESS
HEATMAP_YELLOW = "#FACC15"
HEATMAP_ORANGE = ORANGE
HEATMAP_RED = DANGER
HEATMAP_PURPLE = "#7C3AED"

# ==========================================================
# PROPERTY SCORE CARD
# ==========================================================

SCORE_CARD_BG = ACCENT
SCORE_CARD_TEXT = WHITE
SCORE_CARD_SUBTITLE = "#FFDADA"

# ==========================================================
# PROPERTY OVERVIEW
# ==========================================================

OVERVIEW_TITLE = PRIMARY
OVERVIEW_LABEL = TEXT
OVERVIEW_VALUE = PRIMARY
OVERVIEW_BORDER = CARD_BORDER

# ==========================================================
# FOOTER
# ==========================================================

FOOTER_TITLE = WHITE
FOOTER_TEXT = TEXT_MUTED
FOOTER_SMALL = TEXT_DISABLED

# ==========================================================
# TRANSPARENT
# ==========================================================

TRANSPARENT = (0, 0, 0, 0)

# ==========================================================
# BACKWARD COMPATIBILITY
# ==========================================================

SOFT_BG = BACKGROUND
SOFT_BORDER = DIVIDER

SUBTEXT = TEXT_SECONDARY


# Old text aliases
SECONDARY_TEXT = TEXT_SECONDARY
PRIMARY_TEXT = TEXT_PRIMARY

# Old background aliases
SOFT_BG = BACKGROUND
SOFT_BORDER = DIVIDER

# Old component aliases
SUBTEXT = TEXT_SECONDARY
CARD_BACKGROUND = CARD_BG