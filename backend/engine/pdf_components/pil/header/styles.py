"""
Header styles
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    SECONDARY_TEXT,
)

HEADER_STYLES = {

    "title": {
        "fill": PRIMARY,
        "size": 36,
    },

    "subtitle": {
        "fill": SECONDARY_TEXT,
        "size": 18,
    },

    "section": {
        "fill": PRIMARY,
        "size": 22,
    },

    "body": {
        "fill": TEXT,
        "size": 14,
    },

}