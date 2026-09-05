"""
PHI Design System

Property Floor Heatmap Card
"""

from PIL import Image

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.composites.card_header import (
    draw_card_header,
)

from engine.pdf_components.composites.source_item import (
    draw_source_item,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    BORDER,
    TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_label,
    draw_paragraph,
    draw_text,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_components.framework.icons import (
    get_icon,
)


# ==========================================================
# LAYOUT
# ==========================================================

HEADER_GAP = 12
DIVIDER_GAP = 14

CONTENT_TOP_PADDING = 8
CONTENT_BOTTOM_PADDING = 16

MAP_GAP = 20

SOURCE_PANEL_PADDING = 14

SOURCE_HEADER_GAP = 10
SOURCE_FLOOR_GAP = 10

SOURCE_FOOTER_GAP = 14

SOURCE_MIN_WIDTH = 240
SOURCE_MAX_WIDTH = 320

# ==========================================================
# SOURCE NUMBER BADGES
# ==========================================================

SOURCE_NUMBER_SIZE = 26
SOURCE_NUMBER_COLOR = "#112F70"
SOURCE_NUMBER_TEXT = "#FFFFFF"


# ==========================================================
# SOURCE PANEL WIDTH
# ==========================================================

def _calculate_source_panel_width(
    total_width,
    source_count,
):
    """
    Calculate Primary EMF Sources panel width
    dynamically from the available card width.

    The panel becomes slightly wider when more
    source information has to be displayed.
    """

    if source_count <= 0:
        return 0

    available_width = (
        total_width
        - MAP_GAP
    )

    preferred_width = int(
        available_width * 0.34
    )

    return max(
        SOURCE_MIN_WIDTH,
        min(
            preferred_width,
            SOURCE_MAX_WIDTH,
        ),
    )


# ==========================================================
# HEADER HEIGHT
# ==========================================================

def _calculate_header_height(
    title,
    subtitle,
    fonts,
):
    """
    Calculate actual header height.
    """

    height = 0

    if title:

        height += max(
            fonts["subtitle"].size,
            24,
        )

    if subtitle:

        height += (
            HEADER_GAP
            + fonts["body"].size
        )

    if title or subtitle:

        height += DIVIDER_GAP
        height += 1

    return height


# ==========================================================
# SOURCE ROW HEIGHT
# ==========================================================

def _calculate_source_row_height(
    draw,
    img,
    source,
    fonts,
    width,
):
    """
    Measure one source row dynamically.

    The actual draw_source_item() implementation
    returns the real bottom Y position.
    """

    row_start = 0

    row_bottom = draw_source_item(
        img=img,
        draw=draw,
        x=-10000,
        y=row_start,
        width=width,
        source=source,
        fonts=fonts,
    )

    return max(
        34,
        int(row_bottom - row_start),
    )


# ==========================================================
# SOURCE PANEL HEIGHT
# ==========================================================

def _calculate_source_panel_height(
    draw,
    img,
    sources,
    fonts,
    width,
):
    """
    Calculate the required source panel height
    dynamically from the actual source content.
    """

    if not sources:
        return 0

    current_y = SOURCE_PANEL_PADDING

    # ------------------------------------------------------
    # HEADER
    # ------------------------------------------------------

    header_height = max(
        fonts["small"].size,
        24,
    )

    current_y += header_height

    current_y += SOURCE_HEADER_GAP

    # ------------------------------------------------------
    # FLOOR LABEL
    # ------------------------------------------------------

    current_y += max(
        fonts["caption"].size,
        12,
    )

    current_y += SOURCE_FLOOR_GAP

    # ------------------------------------------------------
    # DIVIDER
    # ------------------------------------------------------

    current_y += 1
    current_y += 10

    # ------------------------------------------------------
    # SOURCE ROWS
    # ------------------------------------------------------

    for index, source in enumerate(
        sources
    ):

        row_height = (
            _calculate_source_row_height(
                draw=draw,
                img=img,
                source=source,
                fonts=fonts,
                width=width,
            )
        )

        current_y += row_height

        if index < len(sources) - 1:

            current_y += 12

    # ------------------------------------------------------
    # FOOTER
    # ------------------------------------------------------

    footer_text = (
        "Source impact levels reflect "
        "contribution to overall exposure "
        "on this floor."
    )

    footer_lines = 3

    current_y += SOURCE_FOOTER_GAP

    current_y += (
        fonts["caption"].size
        * footer_lines
    )

    current_y += SOURCE_PANEL_PADDING

    return int(current_y)


# ==========================================================
# DRAW SOURCE NUMBER
# ==========================================================

def _draw_source_number(
    draw,
    x,
    y,
    number,
    fonts,
):
    """
    Draw source index inside a dark blue circular badge.
    """



    # ------------------------------------------------------
    # CIRCLE
    # ------------------------------------------------------

    draw.ellipse(
        (
            x,
            y,
            x + SOURCE_NUMBER_SIZE,
            y + SOURCE_NUMBER_SIZE,
        ),
        fill=SOURCE_NUMBER_COLOR,
    )

    # ------------------------------------------------------
    # NUMBER
    # ------------------------------------------------------

    draw_text(
        draw=draw,
        x=x + SOURCE_NUMBER_SIZE / 2,
        y=y + SOURCE_NUMBER_SIZE / 2,
        text=str(number),
        font=fonts["caption"],
        fill=SOURCE_NUMBER_TEXT,
        anchor="mm",
    )


# ==========================================================
# DRAW
# ==========================================================

def draw_heatmap_card(
    img,
    draw,
    heatmap,
    x,
    y,
    width,
    height=None,
    title=None,
    subtitle=None,
    floor=None,
    fonts=None,
    sources=None,
):
    """
    Draw Property Overview heatmap card.

    Structure:

        Header
            Floor title
            Description

        Main content
            Heatmap
            Primary EMF Sources

    Everything is dynamically sized.
    """

    sources = sources or []

    # ======================================================
    # SAFETY
    # ======================================================

    if width is None:
        raise ValueError(
            "Heatmap card width must be specified."
        )

    width = int(width)

    if width <= 0:
        raise ValueError(
            "Heatmap card width must be greater than zero."
        )

    # ======================================================
    # PREPARE HEATMAP
    # ======================================================

    prepared_heatmap = None

    if heatmap is not None:

        prepared_heatmap = (
            heatmap.convert("RGBA")
        )

    # ======================================================
    # SOURCE PANEL WIDTH
    # ======================================================

    source_panel_width = (
        _calculate_source_panel_width(
            total_width=width,
            source_count=len(sources),
        )
    )

    # ======================================================
    # CONTENT WIDTHS
    # ======================================================

    if source_panel_width > 0:

        map_width = (
            width
            - source_panel_width
            - MAP_GAP
        )

    else:

        map_width = width

    map_width = max(
        1,
        int(map_width),
    )

    # ======================================================
    # HEATMAP SIZE
    # ======================================================

    heatmap_width = 0
    heatmap_height = 0

    if prepared_heatmap is not None:

        original_width, original_height = (
            prepared_heatmap.size
        )

        if (
            original_width > 0
            and original_height > 0
        ):

            heatmap_width = map_width

            heatmap_height = int(
                heatmap_width
                * (
                    original_height
                    / original_width
                )
            )

           

    # ======================================================
    # HEADER
    # ======================================================

    header_height = (
        _calculate_header_height(
            title=title,
            subtitle=subtitle,
            fonts=fonts,
        )
    )

    # ======================================================
    # SOURCE HEIGHT
    # ======================================================

    source_panel_height = 0

    if sources:

        source_panel_height = (
            _calculate_source_panel_height(
                draw=draw,
                img=img,
                sources=sources,
                fonts=fonts,
                width=(
                    source_panel_width
                    - SOURCE_PANEL_PADDING * 2
                ),
            )
        )

    # ======================================================
    # CARD HEIGHT
    # ======================================================

    calculated_height = (
        header_height
        + CONTENT_TOP_PADDING
        + max(
            heatmap_height,
            source_panel_height,
            1,
        )
        + CONTENT_BOTTOM_PADDING
    )

    if height is not None:

        actual_height = int(
            height
        )

    else:

        actual_height = calculated_height


    # ======================================================
    # FIT HEATMAP INTO CARD CONTENT AREA
    # ======================================================

    if (
        height is not None
        and prepared_heatmap is not None
        and heatmap_height > 0
    ):

        available_height = max(
            1,
            actual_height
            - header_height
            - CONTENT_TOP_PADDING
            - CONTENT_BOTTOM_PADDING,
        )

        if heatmap_height > available_height:

            fit_scale = (
                available_height
                / heatmap_height
            )

            heatmap_width = max(
                1,
                int(
                    heatmap_width
                    * fit_scale
                ),
            )

            heatmap_height = max(
                1,
                int(
                    heatmap_height
                    * fit_scale
                ),
            )    

    
    # ======================================================
    # CARD
    # ======================================================

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=actual_height,
    )

    current_y = area["y"]

    # ======================================================
    # HEADER
    # ======================================================

    if title:

        current_y = draw_card_header(
            draw=draw,
            img=img,

            icon=get_icon("room"),

            x=area["x"],
            y=current_y,

            title=title,

            font=fonts["subtitle"],

            color=PRIMARY,
        )

    # ======================================================
    # SUBTITLE
    # ======================================================

    if subtitle:

        current_y = draw_paragraph(
            draw=draw,

            x=area["x"],
            y=current_y,

            width=area["width"],

            text=subtitle,

            font=fonts["body"],

            fill=PRIMARY,

            line_spacing=5,
        )

    # ======================================================
    # HEADER DIVIDER
    # ======================================================

    if title or subtitle:

        current_y += HEADER_GAP

        draw_horizontal_divider(
            draw=draw,

            x=area["x"],
            y=current_y,

            width=area["width"],

            color=BORDER,
        )

        current_y += DIVIDER_GAP

    # ======================================================
    # CONTENT Y
    # ======================================================

    content_y = (
        current_y
        + CONTENT_TOP_PADDING
    )

    # ======================================================
    # HEATMAP
    # ======================================================

    if prepared_heatmap is not None:

        original_width, original_height = (
            prepared_heatmap.size
        )

        if (
            original_width > 0
            and original_height > 0
        ):

            rendered_width = max(
                1,
                int(
                    heatmap_width
                ),
            )

            rendered_height = max(
                1,
                int(
                    heatmap_height
                ),
            )

            heatmap_image = (
                prepared_heatmap.resize(
                    (
                        rendered_width,
                        rendered_height,
                    ),
                    Image.Resampling.LANCZOS,
                )
            )

            image_x = (
                area["x"]
                + (
                    map_width
                    - rendered_width
                ) / 2
            )

            image_y = content_y

            img.paste(
                heatmap_image,
                (
                    int(image_x),
                    int(image_y),
                ),
                heatmap_image,
            )

    # ======================================================
    # SOURCE PANEL
    # ======================================================

    if sources:

        panel_y = content_y

        panel_width = source_panel_width

        panel_x = (
            area["x"]
            + area["width"]
            - panel_width
        )

        panel_height = source_panel_height

        # --------------------------------------------------
        # PANEL
        # --------------------------------------------------

        draw.rounded_rectangle(
            (
                panel_x,
                panel_y,
                panel_x + panel_width,
                panel_y + panel_height,
            ),
            radius=10,
            outline=BORDER,
            width=1,
        )

        source_x = (
            panel_x
            + SOURCE_PANEL_PADDING
        )

        source_width = (
            panel_width
            - SOURCE_PANEL_PADDING * 2
        )

        source_y = (
            panel_y
            + SOURCE_PANEL_PADDING
        )

        # --------------------------------------------------
        # HEADER
        #
        # IMPORTANT:
        # No icon here.
        # --------------------------------------------------

        source_y = draw_card_header(
            draw=draw,
            img=img,

            icon=None,

            x=source_x,
            y=source_y,

            title="PRIMARY EMF SOURCES",

            font=fonts["small"],

            color=PRIMARY,
        )

        source_y += SOURCE_HEADER_GAP

        # --------------------------------------------------
        # FLOOR LABEL
        # --------------------------------------------------

        draw_label(
            draw=draw,

            x=source_x,
            y=source_y,

            text="This Floor",

            font=fonts["caption"],

            fill=TEXT,
        )

        source_y += (
            fonts["caption"].size
            + SOURCE_FLOOR_GAP
        )

        # --------------------------------------------------
        # DIVIDER
        # --------------------------------------------------

        draw_horizontal_divider(
            draw=draw,

            x=source_x,
            y=source_y,

            width=source_width,

            color=BORDER,
        )

        source_y += 10

        # --------------------------------------------------
        # SOURCE ITEMS
        # --------------------------------------------------

        for index, source in enumerate(
            sources
        ):

            # --------------------------------------------------
            # SOURCE NUMBER
            # --------------------------------------------------

            _draw_source_number(
                draw=draw,
                x=source_x,
                y=source_y + 2,
                number=index + 1,
                fonts=fonts,
            )

            # ----------------------------------------------
            # SOURCE ITEM
            #
            # Shift source item to the right so
            # the number has its own dedicated column.
            # ----------------------------------------------

            item_x = (
                source_x
                + SOURCE_NUMBER_SIZE
                + 14
            )

            item_width = (
                source_width
                - SOURCE_NUMBER_SIZE
                - 14
            )

            source_y = (
                draw_source_item(
                    img=img,
                    draw=draw,

                    x=item_x,
                    y=source_y,

                    width=item_width,

                    source=source,

                    fonts=fonts,
                )
            )

            # ----------------------------------------------
            # DIVIDER
            # ----------------------------------------------

            if index < (
                len(sources) - 1
            ):

                draw_horizontal_divider(
                    draw=draw,

                    x=source_x,
                    y=source_y + 4,

                    width=source_width,

                    color=BORDER,
                )

                source_y += 12

        # --------------------------------------------------
        # FOOTER
        #
        # Always anchored to the bottom of the
        # dynamically calculated panel.
        # --------------------------------------------------

        footer_text = (
            "Source impact levels reflect "
            "contribution to overall exposure "
            "on this floor."
        )

        footer_height = (
            fonts["caption"].size * 3
        )

        footer_y = (
            panel_y
            + panel_height
            - SOURCE_PANEL_PADDING
            - footer_height
        )

        draw_paragraph(
            draw=draw,
            x=source_x,
            y=footer_y,
            width=source_width,
            text=footer_text,
            font=fonts["caption"],
            fill=TEXT,
            line_spacing=4,
        )

    # ======================================================
    # RETURN
    # ======================================================

    return (
        y
        + actual_height
    )