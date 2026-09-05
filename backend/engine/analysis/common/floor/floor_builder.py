"""
Floor Builder
"""

from engine.pdf_components.framework.colors import (
    PRIMARY,
)


def build_floor(
    floor,
):
    """
    Build Floor Overview presentation model.
    """

    return {

        "title": floor.get(
            "name",
            "Ground Floor",
        ),

        "assessment": floor.get(
            "assessment",
        ),

        "rooms": floor.get(
            "rooms",
            [],
        ),

        "summary": floor.get(
            "summary",
            [],
        ),

    }