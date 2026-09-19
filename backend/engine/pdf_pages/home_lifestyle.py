"""
Home Lifestyle & Human Context Page
"""

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

from engine.pdf_components.blocks.home_lifestyle_context import (
    draw_home_lifestyle_context,
)


def render_home_lifestyle(
    story,
    project,
    analysis,
    presentation,
    page_number,
    total_pages,
):
    """
    Render Home Lifestyle & Human Context page.
    """

    ctx = create_page(
        filename="home_lifestyle.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_home_lifestyle_context(
        draw=ctx.draw,
        presentation=presentation,
        fonts=ctx.fonts,
    )

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )