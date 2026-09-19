"""
Home Property Overview Page

Home-specific context overview.

Business PDF is intentionally not used here.
"""

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

from engine.pdf_components.blocks.home_property_overview import (
    draw_home_property_overview,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)


def render_home_property_overview(
    story,
    project,
    analysis,
    presentation,
    page_number,
    total_pages,
):
    """
    Render Home Property Overview page.
    """

    ctx = create_page(
        filename="home_property_overview.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="Property Overview",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )

    draw_home_property_overview(
        draw=ctx.draw,
        project=project,
        presentation=presentation,
        fonts=ctx.fonts,
    )

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )