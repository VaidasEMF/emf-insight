

# Cover footer
from engine.pdf_layouts.cover_layout import (
    FOOTER_X,
    FOOTER_Y,
)

# Report footer
from engine.pdf_layouts.base_layout import (
    FOOTER_TOP,
    CONTENT_X,
)

from engine.pdf_components.framework.constants import (
    PAGE_WIDTH,
    RIGHT_MARGIN,
    LEFT_MARGIN,
)
from ...framework.colors import (

    TEXT_WHITE,
)

from ...framework.typography import (
    draw_body,
    draw_caption,
    draw_small,
)


from engine.pdf_components.framework.colors import (
    BORDER,
    TEXT_SECONDARY,
)


def draw_cover_footer(
    draw,
    project,
    analysis,
    fonts,
):
    """
    Draw Premium Cover footer.
    """

    company_font = fonts["company"]
    body_font = fonts["body"]

    company = project.get(
        "company",
        "",
    )

    report_id = analysis.get(
        "project_id",
        "-",
    )

    draw_body(
        draw,
        FOOTER_X,
        FOOTER_Y,
        company or "EMF Maps",
        company_font,
        fill=TEXT_WHITE,
    )

    draw_caption(
        draw,
        FOOTER_X,
        FOOTER_Y + 38,
        "Professional Property Health Assessments",
        body_font,
    )

    draw_small(
        draw,
        FOOTER_X,
        FOOTER_Y + 92,
        "www.emfmaps.com",
        body_font,
    )

    draw_small(
        draw,
        FOOTER_X,
        FOOTER_Y + 122,
        "info@emfmaps.com",
        body_font,
    )


def draw_report_footer(
    draw,
    fonts,
):
    """
    Draw footer for report pages.
    """

    

    footer_y = FOOTER_TOP + 18

    # ---------------------------------------------------------
    # Left
    # ---------------------------------------------------------

    draw.text(
        (
            LEFT_MARGIN,
            footer_y,
        ),
        "© 2026 EMF Maps",
        fill=TEXT_SECONDARY,
        font=fonts["caption"],
    )

    # ---------------------------------------------------------
    # Center
    # ---------------------------------------------------------

    draw.text(
        (
            PAGE_WIDTH / 2,
            footer_y,
        ),
        "www.emfmaps.com",
        fill=TEXT_SECONDARY,
        font=fonts["caption"],
        anchor="ma",
    )

    # ---------------------------------------------------------
    # Right
    # ---------------------------------------------------------

    draw.text(
        (
            PAGE_WIDTH - RIGHT_MARGIN,
            footer_y,
        ),
        "PHI Premium",
        fill=TEXT_SECONDARY,
        font=fonts["caption"],
        anchor="ra",
    )

