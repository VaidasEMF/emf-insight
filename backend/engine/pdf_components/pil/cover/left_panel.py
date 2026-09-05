"""
Premium Cover Left Panel
"""

from datetime import datetime

from engine.pdf_components.framework.colors import (
    WHITE,
)

from engine.pdf_components.framework.typography import (
    draw_page_title,
    draw_subtitle,
    draw_label,
    draw_value,
)

from engine.pdf_components.primitives.divider import (
    draw_divider,
)

from engine.pdf_components.pil.header.logo import (
    draw_logo,
)

from engine.pdf_layouts.cover_layout import *


# ==========================================================
# COVER LEFT PANEL
# ==========================================================


def draw_cover_left_panel(
    draw,
    width,
    height,
    project,
    analysis,
    fonts,
):
    """
    Draw Premium Cover left information panel.
    """

    # ---------------------------------------------------------
    # Background
    # ---------------------------------------------------------

    draw.rectangle(
        (
            LEFT_PANEL_X,
            0,
            LEFT_PANEL_WIDTH,
            height,
        ),
        fill="#0F2147",
    )

    # ---------------------------------------------------------
    # Fonts
    # ---------------------------------------------------------

    title_font = fonts["page_title"]
    subtitle_font = fonts["subtitle"]
    body_font = fonts["body"]

    # ---------------------------------------------------------
    # Data
    # ---------------------------------------------------------

    project_name = project.get(
        "name",
        "EMF Assessment",
    )

    address = project.get(
        "address",
        "-",
    )

    company = project.get(
        "company",
        "",
    )

    report_date = datetime.now().strftime(
        "%d %b %Y",
    )

    report_id = analysis.get(
        "project_id",
        "-",
    )

    # ---------------------------------------------------------
    # Logo
    # ---------------------------------------------------------

    draw_logo(
        draw=draw,
        x=LOGO_X,
        y=LOGO_Y,
        size=LOGO_SIZE,
        font=subtitle_font,
    )

    # ---------------------------------------------------------
    # Title
    # ---------------------------------------------------------

    draw_page_title(
        draw=draw,
        x=TITLE_X,
        y=TITLE_Y,
        text="PROPERTY HEALTH\nASSESSMENT",
        font=title_font,
        fill=WHITE,
    )

    draw_subtitle(
        draw=draw,
        x=SUBTITLE_X,
        y=SUBTITLE_Y,
        text="Premium Property Health Report",
        font=subtitle_font,
        fill="#D8DFEC",
    )

    # ---------------------------------------------------------
    # Property information
    # ---------------------------------------------------------

    rows = [

        ("Property Name", project_name),

        ("Address", address),

        ("Prepared For", company),

        ("Report Date", report_date),

        ("Report ID", report_id),
    ]

    y = INFO_START_Y

    for label, value in rows:

        draw_label(
            draw=draw,
            x=INFO_LABEL_X,
            y=y,
            text=label,
            font=body_font,
        )

        draw_value(
            draw=draw,
            x=INFO_VALUE_X,
            y=y + 28,
            text=value,
            font=body_font,
            fill=WHITE,
        )

        draw_divider(
            draw=draw,
            x=DIVIDER_X1,
            y=y + INFO_BLOCK_HEIGHT,
            width=DIVIDER_X2 - DIVIDER_X1,
            fill="#3D527F",
        )

        y += INFO_BLOCK_HEIGHT

    # ---------------------------------------------------------
    # Bottom Accent
    # ---------------------------------------------------------

    draw_divider(
        draw=draw,
        x=DIVIDER_X1,
        y=BOTTOM_LINE_Y,
        width=DIVIDER_X2 - DIVIDER_X1,
        fill="#F04444",
        line_width=3,
    )