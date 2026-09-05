"""
Executive Summary Page

Composes the Executive Summary page.

Responsibilities:
- Create page
- Request Executive data
- Render blocks
- Finish page

No business logic.
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

from engine.analysis.common.executive.executive_builder import (
    build_executive,
)

# ==========================================================
# BLOCKS
# ==========================================================

from engine.pdf_components.blocks.executive_overview import (
    draw_executive_overview,
)

from engine.pdf_components.blocks.executive_kpi_row import (
    draw_executive_kpi_row,
)


from engine.pdf_components.blocks.executive_findings import (
    draw_executive_findings,
)

from engine.pdf_components.blocks.executive_priorities import (
    draw_executive_priorities,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)

from engine.pdf_components.blocks.score_basis import (
    draw_score_basis,
)


from engine.pdf_components.primitives.surface import (
    draw_surface,
)

# ==========================================================
# RENDER
# ==========================================================

def render_executive_summary(
    story,
    project,
    analysis,
    page_number,
    total_pages,
):
    """
    Render Executive Summary page.
    """

    # ------------------------------------------------------
    # PAGE
    # ------------------------------------------------------

    ctx = create_page(
        filename="executive_summary.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="Executive Summary",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )

   
    # ------------------------------------------------------
    # BUILD DATA
    # ------------------------------------------------------

    executive = build_executive(
        project,
        analysis,
    )

    # ------------------------------------------------------
    # OVERVIEW
    # ------------------------------------------------------

    draw_executive_overview(
        img=ctx.img,
        draw=ctx.draw,
        hero=executive["hero"],
        fonts=ctx.fonts,
    )

    # ------------------------------------------------------
    # KPI ROW
    # ------------------------------------------------------

    kpi_bottom = draw_executive_kpi_row(
        img=ctx.img,
        draw=ctx.draw,
        metrics=executive["metrics"],
        fonts=ctx.fonts,
    )

    # ------------------------------------------------------
    # FINDINGS + PRIORITIES
    # ------------------------------------------------------

    content_y = kpi_bottom + 22

    findings_bottom = draw_executive_findings(
        img=ctx.img,
        draw=ctx.draw,
        findings=executive["findings"],
        fonts=ctx.fonts,
        y=content_y,
    )

    priorities_bottom = draw_executive_priorities(
        img=ctx.img,
        draw=ctx.draw,
        priorities=executive["priorities"],
        fonts=ctx.fonts,
        y=content_y,
    )

    content_bottom = max(
        findings_bottom,
        priorities_bottom,
    )

  # ------------------------------------------------------
    # WHAT YOUR SCORE IS BASED ON
    # ------------------------------------------------------

    score_basis_y = content_bottom + 18

    # ------------------------------------------------------
    # DIAGNOSTIC COVER
    # ------------------------------------------------------

    from engine.pdf_components.primitives.surface import (
        draw_surface,
    )

    draw_surface(
        draw=ctx.draw,
        x=0,
        y=score_basis_y,
        width=ctx.img.width,
        height=470,
        fill="#FFFFFF",
    )

    # ------------------------------------------------------
    # SCORE BASIS
    # ------------------------------------------------------

    draw_score_basis(
        img=ctx.img,
        draw=ctx.draw,
        x=70,
        y=score_basis_y,
        width=1100,
        height=470,
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