"""
Compatibility wrapper.

Old imports:
    pil.tables.info_table

New implementation:
    cards.info_table
"""

from engine.pdf_components.cards.info_table import (
    draw_info_table,
)

__all__ = [
    "draw_info_table",
]