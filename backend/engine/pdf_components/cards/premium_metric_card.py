"""
PHI Design System

Premium Metric Card
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.card_footer import (
    draw_card_footer,
)

from engine.pdf_components.composites.metric_value import (
    draw_metric_value,
)

from engine.pdf_components.framework.colors import (
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)

# ==========================================================
# LAYOUT
# ==========================================================

SIDE_PADDING = 18

DESCRIPTION_MARGIN = 14

FOOTER_MARGIN = 12

TITLE_SCALE = 0.90

TITLE_HEADER_HEIGHT = 28

DESCRIPTION_LINE_SPACING = 4


# ==========================================================
# CENTERED PARAGRAPH
# ==========================================================

def _draw_centered_paragraph(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill,
    line_spacing=4,
):
    """
    Draw multiline paragraph centered horizontally.
    """

    if not text:
        return y

    words = str(text).split()

    lines = []

    current_line = ""

    # ------------------------------------------------------
    # WORD WRAPPING
    # ------------------------------------------------------

    for word in words:

        test_line = (
            word
            if not current_line
            else current_line + " " + word
        )

        bbox = draw.textbbox(
            (0, 0),
            test_line,
            font=font,
        )

        test_width = (
            bbox[2]
            - bbox[0]
        )

        if (
            test_width <= width
            or not current_line
        ):
            current_line = test_line

        else:
            lines.append(
                current_line
            )

            current_line = word

    if current_line:
        lines.append(
            current_line
        )

    # ------------------------------------------------------
    # DRAW
    # ------------------------------------------------------

    current_y = y

    line_height = (
        font.size
        + line_spacing
    )

    for line in lines:

        draw_center_text(
            draw=draw,
            x_center=x + width / 2,
            y=current_y,
            text=line,
            font=font,
            fill=fill,
        )

        current_y += line_height

    return current_y


# ==========================================================
# CARD
# ==========================================================

def draw_premium_metric_card(
    img,
    draw,
    x,
    y,
    width,
    height=None,
    title="",
    value="",
    subtitle="",
    description="",
    icon=None,
    accent=None,
    fonts=None,
):
    """
    Universal Premium Metric Card.
    """

    # ------------------------------------------------------
    # Fonts
    # ------------------------------------------------------

    base_title_font = (
        fonts.get("body")
        or fonts.get("caption")
    )

    # KPI TITLE — BOLD + SMALLER
    title_font = (
        fonts.get("body_bold")
        or fonts.get("subtitle_bold")
        or fonts.get("bold")
        or base_title_font
    )

    if hasattr(title_font, "font_variant"):
        title_font = title_font.font_variant(
            size=max(
                1,
                int(title_font.size * 0.88),
            )
        )

    body_font = (
        fonts.get("caption")
        or fonts.get("small")
        or fonts.get("body")
    )

    # ------------------------------------------------------
    # Card
    # ------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    # ------------------------------------------------------
    # Header geometry
    #
    # We still use draw_card_header() to preserve
    # the existing PHI header spacing.
    #
    # Title itself is drawn separately centered.
    # ------------------------------------------------------

    header_bottom = draw_card_header(
        draw=draw,
        x=area["x"],
        y=area["y"],
        title="",
        font=title_font,
        color="#071D49",
    )

    # ------------------------------------------------------
    # CENTERED KPI TITLE
    # ------------------------------------------------------

    title_center_x = (
        area["x"]
        + area["width"] / 2
    )

    title_y = (
        area["y"]
        + 8
    )

    draw_center_text(
        draw=draw,
        x_center=title_center_x,
        y=title_y,
        text=str(title).upper(),
        font=title_font,
        fill="#071D49",
    )

    # ------------------------------------------------------
    # Metric
    # ------------------------------------------------------

    metric_bottom = draw_metric_value(
        draw=draw,
        img=img,
        x_center=(
            area["x"]
            + area["width"] / 2
        ),
        y=header_bottom + 44,
        value=value,
        subtitle=subtitle,
        icon=icon,
        accent=accent,
        fonts=fonts,
    )

    # ------------------------------------------------------
    # DESCRIPTION
    # ------------------------------------------------------

    if description:

        description_width = (
            area["width"]
            - SIDE_PADDING * 2
        )

        description_lines = FontManager.wrap_text(
            draw=draw,
            text=str(description),
            font=body_font,
            width=description_width,
        )

        if description_lines:

            line_height = (
                body_font.size
                + 3
            )

            description_height = (
                len(description_lines)
                * line_height
            )

            # --------------------------------------------------
            # FIXED BOTTOM POSITION
            # --------------------------------------------------

            description_bottom = (
                area["y"]
                + area["height"]
                - 10
            )

            description_y = (
                description_bottom
                - description_height
            )

            # --------------------------------------------------
            # DIVIDER
            # --------------------------------------------------

            divider_y = (
                description_y
                - 10
            )

            draw_card_footer(
                draw=draw,
                x=(
                    area["x"]
                    + SIDE_PADDING
                ),
                y=divider_y,
                width=(
                    area["width"]
                    - SIDE_PADDING * 2
                ),
            )

            # --------------------------------------------------
            # CENTERED DESCRIPTION
            # --------------------------------------------------

            center_x = (
                area["x"]
                + area["width"] / 2
            )

            current_y = description_y

            for line in description_lines:

                draw_center_text(
                    draw=draw,
                    x_center=center_x,
                    y=current_y,
                    text=line,
                    font=body_font,
                    fill=TEXT,
                )

                current_y += line_height