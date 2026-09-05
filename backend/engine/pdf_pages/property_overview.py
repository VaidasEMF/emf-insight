"""
Property Overview Page

One-floor visual overview.

Structure
---------

- Header
- Floor heatmap + Primary EMF Sources
- Floor Overview + Key Exposure Areas
- Footer

Contains no business logic.

All vertical positioning is dynamic.
Each block returns its actual bottom Y position.
"""

# ==========================================================
# BASE PAGE
# ==========================================================

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)


# ==========================================================
# ANALYSIS
# ==========================================================

from engine.analysis.common.property.property_overview_builder import (
    build_property_overview,
)


# ==========================================================
# LAYOUT
# ==========================================================

from engine.pdf_layouts.property_overview_layout import (
    HEATMAP_X,
    HEATMAP_Y,
    HEATMAP_WIDTH,

    FLOOR_OVERVIEW_X,
    FLOOR_OVERVIEW_WIDTH,

    EXPOSURE_AREAS_X,
    EXPOSURE_AREAS_WIDTH,

    SECTION_GAP,
)

from engine.pdf_layouts.base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
)


# ==========================================================
# BLOCKS
# ==========================================================

from engine.pdf_components.blocks.property_heatmap import (
    draw_property_heatmap,
)

from engine.pdf_components.blocks.property_floor_overview import (
    draw_property_floor_overview,
)

from engine.pdf_components.blocks.property_exposure_areas import (
    draw_property_exposure_areas,
)

from engine.pdf_components.blocks.property_overview_footer import (
    draw_property_overview_footer,
)


# ==========================================================
# HEADER
# ==========================================================

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)


# ==========================================================
# RENDER
# ==========================================================

def render_property_overview(
    story,
    project,
    analysis,
    page_number,
    total_pages,
    floor_index=0,
):
    """
    Render one-floor Property Overview page.

    The page is composed dynamically from
    presentation blocks.

    No business logic is performed here.
    """

    # ======================================================
    # PAGE
    # ======================================================

    ctx = create_page(
        filename=(
            f"property_overview_"
            f"{floor_index}.png"
        ),
        page_number=page_number,
        total_pages=total_pages,
    )

    # ======================================================
    # REPORT HEADER
    # ======================================================

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="Property Overview",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )

    # ======================================================
    # BUILD PRESENTATION MODEL
    # ======================================================

    model = build_property_overview(
        analysis,
        floor_index=floor_index,
    )

    print(
        "🔥 PROPERTY PAGE:",
        page_number,
        "FLOOR INDEX:",
        floor_index,
        "MODEL FLOOR:",
        model.get(
            "floor_name",
        ),
    )

    # ======================================================
    # SELECT FLOOR
    # ======================================================

    floors = analysis.get(
        "floors",
        [],
    )

    floor_count = (
        len(floors)
        if isinstance(floors, list)
        else 0
    )

    if floor_index < floor_count - 1:

        next_floor_name = (
            floors[
                floor_index + 1
            ].get(
                "name",
                f"Floor {floor_index + 2}",
            )
        )

    else:

        next_floor_name = None

    # ======================================================
    # FLOOR
    # ======================================================

    floor_name = model.get(
        "floor_name",
        analysis.get(
            "floor_name",
            "MAIN FLOOR",
        ),
    )

    # ======================================================
    # MAIN FLOOR VISUAL
    #
    # Contains:
    #
    # - Floor title
    # - Floor description
    # - Floor plan
    # - SBM heatmap
    # - Primary EMF Sources
    #
    # The block calculates its own height.
    # ======================================================

    heatmap_bottom = draw_property_heatmap(
        img=ctx.img,
        draw=ctx.draw,

        heatmap=model.get(
            "heatmap",
            {},
        ),

        x=HEATMAP_X,
        y=HEATMAP_Y,

        width=HEATMAP_WIDTH,

        floor=floor_name,

        fonts=ctx.fonts,

        sources=model.get(
            "sources",
            [],
        ),
    )

    # ======================================================
    # LOWER SUMMARY
    # ======================================================

    lower_y = (
        heatmap_bottom
        + 80
    )

    # ======================================================
    # FLOOR OVERVIEW
    # ======================================================

    print(
        "🔥 BEFORE FLOOR CARD:",
        model.get("floor_name"),
        "ROOMS:",
        len(
            model.get(
                "rooms",
                [],
            )
        ),
        "POINTS:",
        len(
            model.get(
                "points",
                [],
            )
        ),
    )


    floor_overview_bottom = draw_property_floor_overview(
        img=ctx.img,
        draw=ctx.draw,

        project=project,
        analysis=model,

        fonts=ctx.fonts,

        x=FLOOR_OVERVIEW_X,
        y=lower_y,

        width=FLOOR_OVERVIEW_WIDTH,
    )

    # ======================================================
    # KEY EXPOSURE AREAS
    # ======================================================

    exposure_areas_bottom = draw_property_exposure_areas(
        img=ctx.img,
        draw=ctx.draw,

        project=project,
        analysis=analysis,

        fonts=ctx.fonts,

        x=EXPOSURE_AREAS_X,
        y=lower_y,

        width=EXPOSURE_AREAS_WIDTH,
    )

    # ======================================================
    # LOWER SECTION BOTTOM
    # ======================================================

    lower_bottom = max(
        floor_overview_bottom,
        exposure_areas_bottom,
    )

    # ======================================================
    # PROPERTY OVERVIEW FOOTER
    # ======================================================

    footer_y = (
        lower_bottom
        + 28
    )

    draw_property_overview_footer(
        draw=ctx.draw,
        fonts=ctx.fonts,
        x=LEFT_MARGIN,
        y=footer_y,
        width=CONTENT_WIDTH,
        floor_name=floor_name,
        next_floor_name=next_floor_name,
    )

    
    # ======================================================
    # FINISH
    # ======================================================

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )