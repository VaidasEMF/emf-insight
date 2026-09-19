"""
Home Premium PDF Composition

Home-specific PDF page composition.

Business PDF composition remains untouched.
"""

from engine.pdf_pages.home_cover import (
    render_home_cover,
)

from engine.pdf_pages.home_property_overview import (
    render_home_property_overview,
)

from engine.pdf_pages.home_lifestyle import (
    render_home_lifestyle,
)


def render_home_pdf(
    story,
    project,
    analysis,
    presentation,
    user=None,
):
    """
    Render the Home Premium PDF.
    """

    # ------------------------------------------------------
    # PAGE 1 — COVER
    # ------------------------------------------------------

    render_home_cover(
        story=story,
        project=project,
        analysis=analysis,
        presentation=presentation,
        user=user,
    )

    # ------------------------------------------------------
    # PAGE 2 — PROPERTY OVERVIEW
    # ------------------------------------------------------

    render_home_property_overview(
        story=story,
        project=project,
        analysis=analysis,
        presentation=presentation,
        page_number=2,
        total_pages=7,
    )

    # ------------------------------------------------------
    # PAGE 3 — LIFESTYLE & HUMAN CONTEXT
    # ------------------------------------------------------

    render_home_lifestyle(
        story=story,
        project=project,
        analysis=analysis,
        presentation=presentation,
        page_number=3,
        total_pages=7,
    )