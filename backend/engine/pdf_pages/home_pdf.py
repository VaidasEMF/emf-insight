"""
Home Premium PDF Composition

Home-specific PDF page composition.

Business PDF composition remains untouched.
"""

from engine.pdf_pages.home_cover import (
    render_home_cover,
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

    Home-specific pages are composed here.
    """

    render_home_cover(
        story=story,
        project=project,
        analysis=analysis,
        presentation=presentation,
        user=user,
    )