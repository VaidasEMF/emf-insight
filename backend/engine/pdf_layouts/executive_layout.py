from .base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    COLUMN_GAP,
    CARD_WIDTH_2,
    CARD_WIDTH_4,
    CARD_HEIGHT_XL,
)


# ==========================================================
# PAGE HEADER
# ==========================================================

TITLE_X = LEFT_MARGIN
TITLE_Y = 120

SUBTITLE_X = TITLE_X
SUBTITLE_Y = TITLE_Y + 48


# ==========================================================
# HERO
# ==========================================================

HERO_X = LEFT_MARGIN
HERO_Y = 150

HERO_WIDTH = CONTENT_WIDTH
HERO_HEIGHT = 260


# ==========================================================
# KPI ROW
# ==========================================================

KPI_Y = HERO_Y + HERO_HEIGHT + 24

KPI_WIDTH = CARD_WIDTH_4
KPI_HEIGHT = 350

KPI1_X = LEFT_MARGIN

KPI2_X = (
    KPI1_X
    + KPI_WIDTH
    + COLUMN_GAP
)

KPI3_X = (
    KPI2_X
    + KPI_WIDTH
    + COLUMN_GAP
)

KPI4_X = (
    KPI3_X
    + KPI_WIDTH
    + COLUMN_GAP
)

KPI_GRID_X = LEFT_MARGIN
KPI_GRID_Y = KPI_Y
KPI_GRID_WIDTH = CONTENT_WIDTH
KPI_GRID_HEIGHT = KPI_HEIGHT


# ==========================================================
# KEY FINDINGS
# ==========================================================

KEY_FINDINGS_X = LEFT_MARGIN

KEY_FINDINGS_Y = (
    KPI_Y
    + KPI_HEIGHT
    + 2
)

KEY_FINDINGS_WIDTH = CARD_WIDTH_2
KEY_FINDINGS_HEIGHT = 300


# ==========================================================
# RECOMMENDED PRIORITIES
# ==========================================================

WHAT_MEANS_X = (
    KEY_FINDINGS_X
    + KEY_FINDINGS_WIDTH
    + COLUMN_GAP
)

WHAT_MEANS_Y = KEY_FINDINGS_Y

WHAT_MEANS_WIDTH = CARD_WIDTH_2
WHAT_MEANS_HEIGHT = 300


# ==========================================================
# ABOUT THIS ASSESSMENT
# ==========================================================

ABOUT_X = LEFT_MARGIN

ABOUT_Y = (
    KEY_FINDINGS_Y
    + KEY_FINDINGS_HEIGHT
    + 32
)

ABOUT_WIDTH = CONTENT_WIDTH
ABOUT_HEIGHT = 250