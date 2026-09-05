"""
Footer styles
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    SECONDARY_TEXT,
)

from .constants import (
    FOOTER_FONT_SIZE,
    FOOTER_SMALL_FONT_SIZE,
)

FOOTER_STYLES = {

    "company": {
        "fill": PRIMARY,
        "size": FOOTER_FONT_SIZE,
    },

    "text": {
        "fill": TEXT,
        "size": FOOTER_SMALL_FONT_SIZE,
    },

    "secondary": {
        "fill": SECONDARY_TEXT,
        "size": FOOTER_SMALL_FONT_SIZE,
    },

}