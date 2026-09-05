"""
Reusable Report Header
"""

from PIL import ImageDraw

from engine.pdf_components.framework.colors import (
    PRIMARY,
    WHITE,
)

from engine.pdf_components.pil.header.logo import (
    draw_logo,
)

from .constants import (
    PAGE_WIDTH,
    HEADER_HEIGHT,
    HEADER_LEFT,
    HEADER_RIGHT,
    LOGO_SIZE,
    TITLE_X,
    TITLE_Y,
    COMPANY_X,
    COMPANY_Y,
    META_Y,
    LOGO_Y,
    REPORT_ID_X,
    DATE_X,
    PAGE_X,
)



def draw_report_header(
    draw,
    project,
    ctx,
    title,
    title_font,
    company_font,
    meta_font=None,
):
    """
    Draw standard report header.
    """

    if meta_font is None:
        meta_font = company_font

    meta = project.get("meta", {})

    company = meta.get("company", "EMF Maps")
    report_id = meta.get("report_id", "")
    generated_at = meta.get("generated_at", "")

    page_number = ctx.page_number
    total_pages = ctx.total_pages

    # ---------------------------------------------------------
    # Background
    # ---------------------------------------------------------

    draw.rounded_rectangle(
    (
    24,
    12,
    PAGE_WIDTH-24,
    HEADER_HEIGHT,
    ),
    radius=16,
    fill=PRIMARY,
    )

    # ---------------------------------------------------------
    # Logo
    # ---------------------------------------------------------

    draw_logo(
        draw=draw,
        x=HEADER_LEFT,
        y=LOGO_Y,
        size=LOGO_SIZE,
        font=company_font,
    )

    # ---------------------------------------------------------
    # Title
    # ---------------------------------------------------------

    draw.text(
        (
            TITLE_X,
            TITLE_Y,
        ),
        title,
        fill=WHITE,
        font=title_font,
    )

    # ---------------------------------------------------------
    # Company
    # ---------------------------------------------------------

    draw.text(
        (
            COMPANY_X,
            COMPANY_Y,
        ),
        company,
        fill=WHITE,
        font=company_font,
        anchor="ra",
    )

    # ---------------------------------------------------------
    # Report ID
    # ---------------------------------------------------------

    draw.text(
        (
            REPORT_ID_X,
            META_Y,
        ),
        f"Report ID: {report_id}",
        fill=WHITE,
        font=meta_font,
    )

    # ---------------------------------------------------------
    # Generated
    # ---------------------------------------------------------

    draw.text(
        (
            DATE_X,
            META_Y,
        ),
        f"Generated: {generated_at}",
        fill=WHITE,
        font=meta_font,
    )

    # ---------------------------------------------------------
    # Page
    # ---------------------------------------------------------

    draw.text(
        (
            PAGE_X,
            META_Y,
        ),
        f"Page {page_number}/{total_pages}",
        fill=WHITE,
        font=meta_font,
        anchor="ra",
    )

    # ---------------------------------------------------------
    # Bottom divider
    # ---------------------------------------------------------

    draw.line(
        (
            HEADER_LEFT,
            HEADER_HEIGHT,
            PAGE_WIDTH - HEADER_RIGHT,
            HEADER_HEIGHT,
        ),
        fill=WHITE,
        width=1,
    )