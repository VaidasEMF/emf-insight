"""
Assessment Summary Page
"""

# ==========================================================
# BASE PAGE
# ==========================================================

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

from engine.analysis.common.property.property_overview_builder import (
    build_property_overview,
)


# ==========================================================
# LAYOUT
# ==========================================================

from engine.pdf_layouts.assessment_layout import (
    HERO_X,
    HERO_Y,
    HERO_WIDTH,

    KPI_X,
    KPI_WIDTH,

    SECTION_GAP,

    EXPOSURE_X,
    EXPOSURE_WIDTH,
    EXPOSURE_HEIGHT,

    WHAT_MEANS_X,
    WHAT_MEANS_WIDTH,
    INTERPRETATION_HEIGHT,

    FINDINGS_X,
    FINDINGS_WIDTH,
   

    NEXT_STEP_X,
    NEXT_STEP_WIDTH,
   
  
)

from engine.pdf_components.cards.premium_info_card import (
    draw_premium_info_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
)


# ==========================================================
# ANALYSIS
# ==========================================================

from engine.analysis.common.assessment.assessment_metrics import (
    build_assessment_metrics,
)

from engine.analysis.common.assessment.assessment_summary import (
    build_assessment_summary,
)

from engine.analysis.common.assessment.assessment_findings import (
    build_assessment_findings,
    build_next_step,
)


# ==========================================================
# BLOCKS
# ==========================================================

from engine.pdf_components.blocks.assessment_hero import (
    draw_assessment_hero,
)

from engine.pdf_components.blocks.assessment_kpi_row import (
    draw_assessment_kpi_row,
)

from engine.pdf_components.blocks.property_exposure_summary import (
    draw_property_exposure_summary,
)

from engine.pdf_components.blocks.property_interpretation import (
    draw_property_interpretation,
)

from engine.pdf_components.blocks.assessment_findings import (
    draw_assessment_findings,
)

from engine.pdf_components.blocks.assessment_actions import (
    draw_assessment_actions,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)


# ==========================================================
# PAGE
# ==========================================================

def render_assessment_summary(
    story,
    project,
    analysis,
    page_number,
    total_pages,
):
    """
    Render Assessment Summary page.
    """

    # ------------------------------------------------------
    # PAGE
    # ------------------------------------------------------

    ctx = create_page(
        filename="assessment_summary.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="Assessment Summary",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )


    # ======================================================
    # DATA
    # ======================================================

    metrics = build_assessment_metrics(
        analysis,
    )

    hero = build_assessment_summary(
        analysis,
    )

    property_model = build_property_overview(
        analysis,
    )

    findings = build_assessment_findings(
        analysis,
    )

    next_step = build_next_step(
        analysis,
    )


    # ======================================================
    # HERO
    # ======================================================

    hero_bottom = draw_assessment_hero(
        draw=ctx.draw,
        img=ctx.img,

        x=HERO_X,
        y=HERO_Y,

        width=HERO_WIDTH,

        hero=hero,

        fonts=ctx.fonts,
    )


    # ======================================================
    # KPI
    # ======================================================

    kpi_y = hero_bottom + 24

    kpi_bottom = draw_assessment_kpi_row(
        img=ctx.img,
        draw=ctx.draw,

        x=KPI_X,
        y=kpi_y,

        width=KPI_WIDTH,

        metrics=metrics,

        fonts=ctx.fonts,
    )


    # ======================================================
    # EXPOSURE / WHAT THIS MEANS
    # ======================================================
    section_y = kpi_bottom + SECTION_GAP

    # ------------------------------------------------------
    # EXPOSURE OVERVIEW
    # ------------------------------------------------------

    exposure_bottom = int(
        draw_property_exposure_summary(
            img=ctx.img,
            draw=ctx.draw,

            x=EXPOSURE_X,
            y=section_y,
            width=EXPOSURE_WIDTH,

            height=EXPOSURE_HEIGHT,

            exposure_summary=property_model.get(
                "exposure_summary",
                [],
            ),

            fonts=ctx.fonts,
        )
    )


    # ------------------------------------------------------
    # WHAT THIS MEANS
    # ------------------------------------------------------



    means_bottom = draw_property_interpretation(
        img=ctx.img,
        draw=ctx.draw,

        x=WHAT_MEANS_X,
        y=section_y,
        width=WHAT_MEANS_WIDTH,

        interpretation=property_model.get(
            "interpretation",
            [],
        ),

        fonts=ctx.fonts,
    )

    # ======================================================
    # NEXT ROW
    # ======================================================

    section_bottom = max(
        int(exposure_bottom or section_y),
        int(means_bottom or section_y),
    )

    findings_y = (
        section_bottom
        + SECTION_GAP
    )

    # ======================================================
    # KEY FINDINGS / NEXT STEPS
    # ======================================================

    findings_bottom = draw_assessment_findings(
        img=ctx.img,
        draw=ctx.draw,

        x=FINDINGS_X,
        y=findings_y,

        width=FINDINGS_WIDTH,

        findings=findings,

        fonts=ctx.fonts,
    )

    findings_height = (
        findings_bottom
        - findings_y
    )

    next_steps_bottom = draw_assessment_actions(
        img=ctx.img,
        draw=ctx.draw,

        x=NEXT_STEP_X,
        y=findings_y,

        width=NEXT_STEP_WIDTH,

        next_step=next_step,

        fonts=ctx.fonts,

        height=findings_height,
    )


    # ======================================================
    # CONTENT BOTTOM
    # ======================================================

    content_bottom = max(
        findings_bottom,
        next_steps_bottom,
    )

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )