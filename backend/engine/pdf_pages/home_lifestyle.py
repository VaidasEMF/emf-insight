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
    lifestyle_area,
    page_number,
    total_pages,
):
    """
    Render one Home Lifestyle & Human Context page.
    """

    ctx = create_page(
        filename=f"home_lifestyle_{page_number}.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_home_lifestyle_context(
        draw=ctx.draw,
        lifestyle_area=lifestyle_area,
        fonts=ctx.fonts,
    )

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )