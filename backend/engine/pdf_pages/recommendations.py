"""
Recommendations Page

Home Wellness Recommendations page.
"""

# ==========================================================
# BASE PAGE
# ==========================================================

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

# ==========================================================
# CONTENT
# ==========================================================

from engine.pdf_components.blocks.recommendations_content import (
    draw_recommendations_content,
)

# ==========================================================
# REPORT HEADER
# ==========================================================

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)


# ==========================================================
# RENDER
# ==========================================================

def render_recommendations(
    story,
    project,
    analysis,
    page_number,
    total_pages,
):
    """
    Render Home Wellness Recommendations page.
    """

    print(
        "🔥🔥🔥 NEW RECOMMENDATIONS RENDERER ACTIVE 🔥🔥🔥"
    )

    # ------------------------------------------------------
    # PAGE
    # ------------------------------------------------------

    ctx = create_page(
        filename="recommendations.png",
        page_number=page_number,
        total_pages=total_pages,
    )

    # ------------------------------------------------------
    # REPORT HEADER
    # ------------------------------------------------------

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title="Recommendations",
        title_font=ctx.fonts["header_title"],
        company_font=ctx.fonts["company"],
        meta_font=ctx.fonts["header_meta"],
    )

    # ------------------------------------------------------
    # DEBUG DATA
    # ------------------------------------------------------

    home_recommendations = analysis.get(
        "home_recommendations",
        {},
    )

    if not isinstance(
        home_recommendations,
        dict,
    ):
        home_recommendations = {}

    recommendations = home_recommendations.get(
        "all",
        [],
    )

    priority = home_recommendations.get(
        "priority",
        [],
    )

    grouped = home_recommendations.get(
        "grouped",
        {},
    )

    print(
        "\n🔥🔥🔥 RECOMMENDATIONS PAGE DATA"
    )

    print(
        "ALL:",
        len(
            recommendations
        ),
    )

    print(
        "PRIORITY:",
        len(
            priority
        ),
    )

    print(
        "GROUPS:",
        list(
            grouped.keys()
        )
        if isinstance(
            grouped,
            dict,
        )
        else [],
    )

    # ------------------------------------------------------
    # CONTENT
    # ------------------------------------------------------
    print(
        "\n🔥🔥🔥 RECOMMENDATIONS ZONES DEBUG"
    )

    print(
        "ZONES:",
        analysis.get(
            "zones",
            [],
        ),
    )

    print(
        "SUMMARY:",
        analysis.get(
            "summary",
            {},
        ),
    )

    print(
        "HOME PRIORITY:",
        analysis.get(
            "home_recommendations",
            {},
        ).get(
            "priority",
            [],
        ),
    )

    draw_recommendations_content(
        draw=ctx.draw,
        analysis=analysis,
        fonts=ctx.fonts,
    )


    draw_recommendations_content(
        draw=ctx.draw,
        analysis=analysis,
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