"""
ReportLab page layout constants.
"""

from reportlab.lib.pagesizes import A4

from engine.pdf_components.framework.constants import (
    PAGE_WIDTH,
    PAGE_HEIGHT,
)



# ==========================================================
# HEADER
# ==========================================================

HEADER_HEIGHT = 96

HEADER_LEFT = 36
HEADER_RIGHT = 40

LOGO_SIZE = 42
LOGO_X = 28
LOGO_Y = 20

TITLE_X = 104
TITLE_Y = 14

COMPANY_X = 1130
COMPANY_Y = 20

REPORT_ID_X = 104
DATE_X = 290
PAGE_X = 1130

META_Y = 70

HEADER_BOTTOM = HEADER_HEIGHT + 24
CONTENT_TOP = HEADER_BOTTOM + 20




