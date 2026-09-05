"""
Sources Page

Composes reusable PHI PDF components into the
Sources page.
"""

# ==========================================================
# BASE PAGE
# ==========================================================

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

# ==========================================================
# BLOCKS
# ==========================================================

from engine.pdf_components.blocks.sources_summary import (
    draw_sources_summary,
)

from engine.pdf_components.blocks.sources_table import (
    draw_sources_table,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)


# ==========================================================
# RENDER
# ==========================================================


def render_sources(
    story,
    project,
    analysis,
    page_number,
    total_pages,
):
    """
    Render Sources page.
    """

    # ------------------------------------------------------
    # PAGE
    # ------------------------------------------------------

    ctx = create_page(
        filename="sources.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="EMF Sources",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )


    # ------------------------------------------------------
    # DATA
    # ------------------------------------------------------

    summary = analysis.get(

        "sources_summary",

        None,

    )

    sources = analysis.get(

        "sources",

        [],

    )

    # ------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------

    draw_sources_summary(

        draw=ctx.draw,

        summary=summary,

        fonts=ctx.fonts,

    )

    # ------------------------------------------------------
    # TABLE
    # ------------------------------------------------------

    draw_sources_table(
        img=ctx.img,
        draw=ctx.draw,
        sources=sources,
        fonts=ctx.fonts,
    )

    # ------------------------------------------------------
    # FINISH
    # ------------------------------------------------------

    finish_page(

        ctx=ctx,

        story=story,

        project=project,

        analysis=analysis,

    )