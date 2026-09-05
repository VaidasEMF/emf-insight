"""
Room Analysis Page
"""

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

from engine.analysis.common.room.room_builder import (
    build_room_analysis,
)

from engine.analysis.heatmap.room_heatmap import (
    generate_room_heatmap_images,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)

from engine.pdf_components.blocks.room_heatmap import (
    draw_room_heatmap,
)


from engine.pdf_components.blocks.room_coverage import (
    draw_room_coverage,
)

from engine.pdf_layouts.room_analysis_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    ROW_GAP,
)



def render_room_analysis(
    story,
    project,
    analysis,
    room,
    room_overview,
    page_number,
    total_pages,
):

    

    ctx = create_page(
        filename=f"room_analysis_{page_number}.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title=room.get(
            "name",
            "Room Analysis",
        ),
        title_font=ctx.fonts[
            "header_title"
        ],
        company_font=ctx.fonts[
            "company"
        ],
        meta_font=ctx.fonts[
            "header_meta"
        ],
    )

    # ==================================================
    # ROOM PDF MODEL
    # ==================================================

    model = build_room_analysis(
        room=room,
        room_overview=room_overview,
    )

    # ==================================================
    # ROOM HEATMAP
    # ==================================================

    sbm_image, icnirp_image = (
        generate_room_heatmap_images(
            analysis=analysis,
            room=room,
            session="session_1",
        )
    )


    # ==================================================
    # ROOM HEATMAP
    # ==================================================

    sbm_image, icnirp_image = (
        generate_room_heatmap_images(
            analysis=analysis,
            room=room,
            session="session_1",
        )
    )

    # ==================================================
    # HEATMAP MODEL
    # ==================================================

    heatmap_model = {
        "sbm": sbm_image,
        "icnirp": icnirp_image,
    }

    # ==================================================
    # DYNAMIC ROOM ANALYSIS LAYOUT
    # ==================================================

    content_x = LEFT_MARGIN
    content_width = CONTENT_WIDTH

    heatmap_y = 145

    heatmap_height = 390

    coverage_y = (
        heatmap_y
        + heatmap_height
        + ROW_GAP
    )

    coverage_height = 105

    # ==================================================
    # ROOM HEATMAP BLOCK
    # ==================================================

    draw_room_heatmap(
        img=ctx.img,
        draw=ctx.draw,

        heatmap=heatmap_model,

        room=room,

        model=model,

        fonts=ctx.fonts,

        x=content_x,
        y=heatmap_y,

        width=content_width,
        height=heatmap_height,
    )

    # ==================================================
    # ROOM COVERAGE
    # ==================================================

    draw_room_coverage(
        img=ctx.img,
        draw=ctx.draw,

        x=content_x,
        y=coverage_y,

        width=content_width,
        height=coverage_height,

        coverage=model.get(
            "coverage",
            {},
        ),

        fonts=ctx.fonts,
    )

    # ==================================================
    # FINISH
    # ==================================================

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )