"""
PHI Design System

What Your Score Is Based On

Executive Summary methodology / score basis block.
"""

from pathlib import Path

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_center_text,
)

from engine.pdf_components.framework.font_manager import (
    FontManager,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)

from engine.pdf_components.framework.colors import (
    TEXT,
    TEXT_SECONDARY,
    PRIMARY,
    WHITE,
)


# ==========================================================
# LAYOUT
# ==========================================================

SIDE_PADDING = 18

HEADER_TOP = 22

CONTENT_TOP = 76

COLUMN_GAP = 24

NUMBER_SIZE = 38

ICON_SIZE = 64

TITLE_GAP = 10

ICON_GAP = 14

DESCRIPTION_GAP = 10

BOTTOM_INFO_HEIGHT = 48

BOTTOM_INFO_GAP = 18

SIDE_PADDING = 22

INFO_HEIGHT = 48

INFO_BOTTOM = 18

INFO_RADIUS = 10

INFO_ICON_SIZE = 34


# ==========================================================
# ICONS
# ==========================================================

ICON_DIR = (
    Path(__file__).resolve().parents[2]
    / "assets"
    / "score_basis"
).resolve()

ICON_FILES = {
    "measurement_device": (
        ICON_DIR / "measurement_device.png"
    ),

    "exposure_patterns": (
        ICON_DIR / "exposure_patterns.png"
    ),

    "biological_interpretation": (
        ICON_DIR / "biological_interpretation.png"
    ),

    "property_health_score": (
        ICON_DIR / "property_health_score.png"
    ),

    "info": (
        Path(__file__).resolve().parents[2]
        / "assets"
        / "icons"
        / "info.png"
    ),
}


# ==========================================================
# CENTERED PARAGRAPH
# ==========================================================

def draw_centered_paragraph(
    draw,
    x,
    y,
    width,
    text,
    font,
    fill=TEXT_SECONDARY,
    line_spacing=5,
):
    """
    Draw wrapped paragraph centered horizontally.
    """

    if not text:
        return y

    lines = FontManager.wrap_text(
        draw=draw,
        text=str(text),
        font=font,
        width=width,
    )

    current_y = y

    line_height = (
        font.size
        + line_spacing
    )

    for line in lines:

        bbox = draw.textbbox(
            (0, 0),
            line,
            font=font,
        )

        line_width = (
            bbox[2]
            - bbox[0]
        )

        line_x = (
            x
            + (width - line_width) / 2
        )

        draw.text(
            (
                line_x,
                current_y,
            ),
            line,
            font=font,
            fill=fill,
        )

        current_y += line_height

    return current_y


# ==========================================================
# CHEVRON
# ==========================================================

def draw_chevron(
    draw,
    x,
    y,
    size=16,
):
    """
    Draw small directional chevron.
    """



# ==========================================================
# DRAW
# ==========================================================

def draw_score_basis(
    img,
    draw,
    x,
    y,
    width,
    height,
    fonts,
):
    """
    Draw:

        WHAT YOUR SCORE IS BASED ON

        01 Measured Exposure
        02 Exposure Patterns
        03 Biological Interpretation
        04 Property Health Score

        Information statement at bottom.
    """


    # ------------------------------------------------------
    # FONTS
    # ------------------------------------------------------

    title_font = (
        fonts.get("subtitle")
        or fonts.get("title")
        or fonts.get("body")
    )

    item_title_font = (
        fonts.get("subtitle")
        or fonts.get("body")
    )

    body_font = (
        fonts.get("body")
        or fonts.get("small")
        or fonts.get("caption")
    )

    if hasattr(body_font, "font_variant"):

        score_basis_title_font = (
            body_font.font_variant(
                size=int(
                    body_font.size * 1.15
                )
            )
        )

    else:

        score_basis_title_font = body_font

    small_font = (
        fonts.get("small")
        or fonts.get("caption")
        or body_font
    )

    # ------------------------------------------------------
    # CARD
    # ------------------------------------------------------

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    
    #     ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    header_y = (
        area["y"]
        + HEADER_TOP
    )

    header_icon = (
        ICON_DIR / "waves.png"
    )

    header_icon_size = 42

    if (
        header_icon
        and header_icon.exists()
    ):

        draw_png_icon(
            img=img,
            icon_file=str(header_icon),
            x=int(
                area["x"]
                + SIDE_PADDING
            ),
            y=int(
                header_y
                - 5
            ),
            size=header_icon_size,
        )

        header_text_x = (
            area["x"]
            + SIDE_PADDING
            + header_icon_size
            + 18
        )

    else:

        header_text_x = (
            area["x"]
            + SIDE_PADDING
        )

    draw_text(
        draw=draw,
        x=header_text_x,
        y=header_y,
        text="WHAT YOUR SCORE IS BASED ON",
        font=title_font,
        fill=PRIMARY,
    )

    # ------------------------------------------------------
    # ITEMS
    # ------------------------------------------------------

    items = [
        {
            "number": "01",
            "title": "Measured\nExposure",
            "description": (
                "Actual EMF measurements "
                "collected across the "
                "assessed property."
            ),
            "icon": "measurement_device",
        },
        {
            "number": "02",
            "title": "Exposure\nPatterns",
            "description": (
                "Measured levels are "
                "evaluated across rooms, "
                "zones and exposure "
                "categories."
            ),
            "icon": "exposure_patterns",
        },
        {
            "number": "03",
            "title": "Biological\nInterpretation",
            "description": (
                "Results are interpreted "
                "using the Standardized "
                "Biological Model "
                "(SBM)."
            ),
            "icon": "biological_interpretation",
        },
        {
            "number": "04",
            "title": "Property\nHealth Score",
            "description": (
                "The combined assessment "
                "produces the Property Health "
                "Score and identifies priority "
                "areas for action."
            ),
            "icon": "property_health_score",
        },
    ]

    # ------------------------------------------------------
    # COLUMN GEOMETRY
    # ------------------------------------------------------
 
    content_y = (
        area["y"]
        + CONTENT_TOP
    )
    
   
    available_width = (
        area["width"]
        - SIDE_PADDING * 2
    )

    column_width = (
        available_width
        - COLUMN_GAP * 3
    ) / 4

    current_x = (
        area["x"]
        + SIDE_PADDING
    )

    # ------------------------------------------------------
    # DRAW FOUR COMPONENTS
    # ------------------------------------------------------
    print("🔥 SCORE BASIS: BEFORE COMPONENTS")
  

    for index, item in enumerate(items):

        # --------------------------------------------------
        # COLUMN CENTER
        # --------------------------------------------------

        column_center = (
            current_x
            + column_width / 2
        )

        # --------------------------------------------------
        # NUMBER
        # --------------------------------------------------

        number_size = 34

        number_x = (
            column_center
            - number_size / 2
        )

        number_y = content_y

        draw.ellipse(
            (
                number_x,
                number_y,
                number_x + number_size,
                number_y + number_size,
            ),
            fill="#7EA8E8",
        )

        draw_center_text(
            draw=draw,
            x_center=column_center,
            y=(
                number_y
                + (number_size - small_font.size) / 2
                - 1
            ),
            text=item["number"],
            font=small_font,
            fill=WHITE,
        )
        # --------------------------------------------------
        # TITLE
        # --------------------------------------------------

        title_y = (
            number_y
            + number_size
            + TITLE_GAP
        )

        title_lines = str(
            item["title"]
        ).split("\n")

        title_line_height = (
            body_font.size + 3
        )

        for line_index, line in enumerate(
            title_lines
        ):

            draw_center_text(
                draw=draw,
                x_center=column_center,
                y=(
                    title_y
                    + line_index
                    * title_line_height
                ),
                text=line,
                font=score_basis_title_font,
                fill=PRIMARY,
            )

        title_bottom = (
            title_y
            + len(title_lines)
            * title_line_height
        )

        # --------------------------------------------------
        # ICON
        # --------------------------------------------------

        icon_file = ICON_FILES.get(
            item["icon"]
        )

        icon_y = (
            title_bottom
            + 24
        )

        if icon_file is not None:

            icon_file = Path(icon_file)

            if icon_file.exists():

                draw_png_icon(
                    img=img,
                    icon_file=str(icon_file),
                    x=int(
                        column_center
                        - ICON_SIZE / 2
                    ),
                    y=int(icon_y),
                    size=ICON_SIZE,
                )

        # --------------------------------------------------
        # DESCRIPTION
        # --------------------------------------------------

        description_y = (
            icon_y
            + ICON_SIZE
            + DESCRIPTION_GAP
        )

        description_lines = FontManager.wrap_text(
            draw=draw,
            text=item["description"],
            font=small_font,
            width=column_width - 12,
        )

        description_line_height = (
            small_font.size + 4
        )

        for line_index, line in enumerate(
            description_lines
        ):

            draw_center_text(
                draw=draw,
                x_center=column_center,
                y=(
                    description_y
                    + line_index
                    * description_line_height
                ),
                text=line,
                font=small_font,
                fill=TEXT_SECONDARY,
            )

        

        # --------------------------------------------------
        # HORIZONTAL ARROW
        # --------------------------------------------------

        if index < 3:

            arrow_center_x = (
                current_x
                + column_width
                + COLUMN_GAP / 2
            )

            arrow_center_y = (
                icon_y
                + ICON_SIZE / 2
            )

            arrow_size = 18

            draw.line(
                (
                    arrow_center_x - arrow_size / 2,
                    arrow_center_y - arrow_size / 2,
                    arrow_center_x + arrow_size / 2,
                    arrow_center_y,
                ),
                fill=PRIMARY,
                width=3,
            )

            draw.line(
                (
                    arrow_center_x + arrow_size / 2,
                    arrow_center_y,
                    arrow_center_x - arrow_size / 2,
                    arrow_center_y + arrow_size / 2,
                ),
                fill=PRIMARY,
                width=3,
            )

        # --------------------------------------------------
        # NEXT COLUMN
        # --------------------------------------------------

        current_x += (
            column_width
            + COLUMN_GAP
        )

    # ======================================================
    # INFORMATION BAR
    # ======================================================

    
    info_y = (
        area["y"]
        + area["height"]
        - BOTTOM_INFO_HEIGHT
        - 8
    )

    info_x = (
        area["x"]
        + SIDE_PADDING
    )

    info_width = (
        area["width"]
        - SIDE_PADDING * 2
    )

    draw.rounded_rectangle(
        (
            info_x,
            info_y,
            info_x + info_width,
            info_y + INFO_HEIGHT,
        ),
        radius=INFO_RADIUS,
        fill="#EEF4FF",
    )

    # ------------------------------------------------------
    # INFO ICON
    # ------------------------------------------------------

    info_icon = (
        Path(__file__).resolve().parents[2]
        / "assets"
        / "icons"
        / "info.png"
    )

    INFO_ICON_SIZE = 30

    if (
        info_icon
        and info_icon.exists()
    ):

        draw_png_icon(
            img=img,
            icon_file=str(info_icon),
            x=int(
                info_x
                + 12
            ),
            y=int(
                info_y
                + (
                    INFO_HEIGHT
                    - INFO_ICON_SIZE
                ) / 2
            ),
            size=INFO_ICON_SIZE,
        )

        info_text_x = (
            info_x
            + 52
        )

        info_text_width = (
            info_width
            - 64
        )

    else:

        info_text_x = (
            info_x
            + 16
        )

        info_text_width = (
            info_width
            - 32
        )


    # ------------------------------------------------------
    # INFO TEXT
    # ------------------------------------------------------

    info_text = (
        "The assessment combines measured exposure, "
        "property context and biological interpretation — "
        "not a single measurement or threshold."
    )

    draw_centered_paragraph(
        draw=draw,
        x=info_text_x,
        y=(
            info_y
            + 8
        ),
        width=info_text_width,
        text=info_text,
        font=small_font,
        fill=PRIMARY,
        line_spacing=4,
    )

    # ------------------------------------------------------
    # RETURN
    # ------------------------------------------------------
  
    return y + height