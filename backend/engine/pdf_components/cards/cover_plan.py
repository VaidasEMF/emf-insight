"""
Cover Plan Card

Wrapper around plan renderer.
"""

from engine.pdf_components.plan_renderer import (
    render_plan,
)


def draw_cover_plan(
    img,
    analysis,
):
    """
    Draw property floor plan for Premium Cover.

    Returns
    -------
    bool
        True if plan was rendered successfully.
    """

    return render_plan(
        img=img,
        analysis=analysis,
    )