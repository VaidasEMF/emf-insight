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
    # HOME PAGE DATA
    # ------------------------------------------------------

    lifestyle_areas = presentation.get(
        "lifestyle_areas",
        [],
    )

    if not isinstance(
        lifestyle_areas,
        list,
    ):
        lifestyle_areas = []

    # ------------------------------------------------------
    # PAGE COUNT
    # ------------------------------------------------------
    #
    # Mandatory pages:
    #   1. Cover
    #   2. Property Overview
    #
    # Plus one page for each Lifestyle Area.
    #
    # ------------------------------------------------------

    total_pages = (
        2
        + len(lifestyle_areas)
    )

    print(
        "🔥 HOME PDF PAGE COUNT:",
        "LIFESTYLE AREAS:",
        len(lifestyle_areas),
        "TOTAL PAGES:",
        total_pages,
        flush=True,
    )

    page_number = 1

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

    page_number += 1

    render_home_property_overview(
        story=story,
        project=project,
        analysis=analysis,
        presentation=presentation,
        page_number=page_number,
        total_pages=total_pages,
    )

    # ------------------------------------------------------
    # LIFESTYLE AREAS
    # ------------------------------------------------------

    for lifestyle_area in lifestyle_areas:

        print(
        "🔥 HOME PDF LIFESTYLE AREA:",
        lifestyle_area,
        flush=True,
    )

        page_number += 1

        render_home_lifestyle(
            story=story,
            project=project,
            analysis=analysis,
            presentation=presentation,
            lifestyle_area=lifestyle_area,
            page_number=page_number,
            total_pages=total_pages,
        )