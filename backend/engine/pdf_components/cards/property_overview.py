"""
PHI Design System

Property Overview Card

Legacy compatibility wrapper.

The Property Overview page is now composed from
dedicated blocks rather than a single summary table.
"""

from engine.pdf_components.blocks.property_heatmap import (
    draw_property_heatmap,
)

from engine.pdf_components.blocks.property_sources import (
    draw_property_sources,
)

from engine.pdf_components.blocks.property_observations import (
    draw_property_observations,
)



def draw_property_overview(
    img,
    draw,
    project,
    analysis,
    fonts,
):
    """
    Legacy Property Overview entry point.

    The new Property Overview page is composed
    directly from dedicated blocks.

    This wrapper is kept only for compatibility.
    """

    # ------------------------------------------------------
    # PROPERTY MODEL
    # ------------------------------------------------------

    from engine.analysis.common.property.property_overview_builder import (
        build_property_overview,
    )

    model = build_property_overview(
        analysis,
    )


    # ------------------------------------------------------
    # NOTE
    # ------------------------------------------------------
    #
    # Do not render the old PROPERTY OVERVIEW table here.
    #
    # The page-level renderer
    # engine.pdf_pages.property_overview
    # is now responsible for layout and composition.
    #
    # This function intentionally does not draw anything.
    #

    return None