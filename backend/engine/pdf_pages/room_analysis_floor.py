"""
Room Analysis Floor Page

Renders one Room Analysis page from a prepared
set of Room Analysis cards.

Room count is NOT hardcoded.

The page renderer receives the rooms that already
belong to this page from room_analysis_groups.py.

Card heights are calculated dynamically according
to the content complexity of each room.
"""

from engine.pdf_pages.base_page import (
    create_page,
    finish_page,
)

from engine.pdf_components.pil.header.report_header import (
    draw_report_header,
)

from engine.pdf_components.cards.room_analysis_card import (
    draw_room_analysis_card,
)

from engine.analysis.heatmap.room_heatmap import (
    generate_room_heatmap_images,
)

from engine.pdf_layouts.room_analysis_layout import (
    ASSESSMENT_Y,
)

from engine.pdf_layouts.base_layout import (
    LEFT_MARGIN,
    CONTENT_WIDTH,
    TOP_MARGIN,
    BOTTOM_MARGIN,
    ROW_GAP,
)


# ==========================================================
# CONSTANTS
# ==========================================================

PAGE_TOP = ASSESSMENT_Y

PAGE_BOTTOM = 80

MIN_CARD_HEIGHT = 220

MAX_CARD_HEIGHT = 430


# ==========================================================
# CARD COMPLEXITY
# ==========================================================

def _card_content_complexity(
    item,
):
    """
    Estimate Room Analysis card complexity.

    This is presentation logic only.

    Complexity increases with:

        - number of analytical zones
        - number of source-context rows
        - findings
        - recommendations

    No analytical values are calculated here.
    """

    if not isinstance(
        item,
        dict,
    ):
        return 0

    card = item.get(
        "card",
        {},
    )

    if not isinstance(
        card,
        dict,
    ):
        return 0

    zones = card.get(
        "zone_analysis",
        [],
    )

    if not isinstance(
        zones,
        list,
    ):
        zones = []

    source_context = card.get(
        "source_context",
        {},
    )

    if not isinstance(
        source_context,
        dict,
    ):
        source_context = {}

    sources = source_context.get(
        "sources",
        [],
    )

    if not isinstance(
        sources,
        list,
    ):
        sources = []

    findings = card.get(
        "findings",
        [],
    )

    if not isinstance(
        findings,
        list,
    ):
        findings = []

    recommendations = card.get(
        "recommendations",
        [],
    )

    if not isinstance(
        recommendations,
        list,
    ):
        recommendations = []

    # ------------------------------------------------------
    # Base
    # ------------------------------------------------------

    complexity = 1

    # ------------------------------------------------------
    # Zones
    # ------------------------------------------------------

    complexity += min(
        len(zones),
        4,
    )

    # ------------------------------------------------------
    # Sources
    # ------------------------------------------------------

    complexity += min(
        len(sources),
        4,
    )

    # ------------------------------------------------------
    # Findings
    # ------------------------------------------------------

    complexity += min(
        len(findings),
        2,
    )

    # ------------------------------------------------------
    # Recommendations
    #
    # Recommendations are currently not rendered
    # on the Room Analysis card, but complexity is
    # retained here for future presentation changes.
    # ------------------------------------------------------

    complexity += min(
        len(recommendations),
        1,
    )

    return complexity


# ==========================================================
# CARD HEIGHT
# ==========================================================

def _estimate_card_height(
    item,
    available_height,
    card_count,
):
    """
    Room Analysis card height.

    The card has a stable presentation height.
    Content density may increase the height slightly,
    but page space does not stretch the card.
    """

    complexity = _card_content_complexity(
        item
    )

    # ======================================================
    # BASE PRESENTATION HEIGHT
    # ======================================================

    base_height = 360

    # ======================================================
    # CONTENT EXPANSION
    # ======================================================

    extra_height = (
        max(
            0,
            complexity - 4,
        )
        * 18
    )

    estimated = (
        base_height
        + extra_height
    )

    # ======================================================
    # SAFETY
    # ======================================================

    estimated = max(
        MIN_CARD_HEIGHT,
        estimated,
    )

    estimated = min(
        MAX_CARD_HEIGHT,
        estimated,
    )

    return int(
        estimated
    )

# ==========================================================
# RENDER
# ==========================================================

def render_room_analysis_floor(
    story,
    project,
    analysis,
    floor_name,
    room_cards,
    page_number,
    total_pages,
):
    """
    Render one Room Analysis page.

    Card heights are content-driven.

    The renderer does NOT stretch a single room
    to fill the entire remaining page.

    Each room receives its own estimated
    presentation height.
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        room_cards,
        list,
    ):
        room_cards = []

    room_cards = [
        item
        for item in room_cards
        if isinstance(
            item,
            dict,
        )
    ]

    if not room_cards:
        return

    # ======================================================
    # PAGE
    # ======================================================

    ctx = create_page(
        filename=(
            f"room_analysis_floor_{page_number}.png"
        ),
        page_number=page_number,
        total_pages=total_pages,
    )

    # ======================================================
    # HEADER
    # ======================================================

    draw_report_header(
        draw=ctx.draw,
        project=project,
        ctx=ctx,
        title=(
            "Room Analysis — "
            + str(
                floor_name
            )
        ),
        title_font=ctx.fonts[
            "header_title"
        ],
        company_font=ctx.fonts[
            "company"
        ],
        meta_font=ctx.fonts[
            "header_meta"
        ],
    )

    # ======================================================
    # AVAILABLE PAGE SPACE
    # ======================================================

    available_height = max(
        1,
        ctx.img.height
        - PAGE_TOP
        - PAGE_BOTTOM,
    )

    card_count = len(
        room_cards
    )

    total_gaps = (
        max(
            0,
            card_count - 1,
        )
        * ROW_GAP
    )

    usable_height = max(
        1,
        available_height
        - total_gaps,
    )

    # ======================================================
    # ESTIMATE CARD HEIGHTS
    # ======================================================

    card_heights = []

    for item in room_cards:

        estimated_height = (
            _estimate_card_height(
                item=item,
                available_height=usable_height,
                card_count=card_count,
            )
        )

        card_heights.append(
            estimated_height
        )

    # ======================================================
    # TOTAL NATURAL HEIGHT
    # ======================================================

    natural_height = (
        sum(
            card_heights
        )
        + total_gaps
    )

    # ======================================================
    # SCALE ONLY IF NECESSARY
    #
    # Important:
    #
    # We do NOT stretch cards when there is
    # unused page space.
    #
    # We only reduce them if they genuinely
    # cannot fit.
    # ======================================================

    if natural_height > available_height:

        scale = (
            usable_height
            / max(
                1,
                sum(
                    card_heights
                ),
            )
        )

        card_heights = [
            max(
                MIN_CARD_HEIGHT,
                int(
                    height
                    * scale
                ),
            )
            for height in card_heights
        ]


    # ======================================================
    # RENDER CARDS
    # ======================================================

    current_y = PAGE_TOP

    for index, item in enumerate(
        room_cards
    ):

        room = item.get(
            "room",
            {},
        )

        room_overview = item.get(
            "room_overview",
            {},
        )

        if not isinstance(
            room,
            dict,
        ):
            room = {}

        if not isinstance(
            room_overview,
            dict,
        ):
            room_overview = {}

       

        # ==================================================
        # CARD MODEL
        # ==================================================

        card_model = item.get(
            "card",
            {},
        )

        if not isinstance(
            card_model,
            dict,
        ):
            card_model = {}

        # ==================================================
        # ROOM HEATMAP
        # ==================================================

        sbm_image, icnirp_image = (
            generate_room_heatmap_images(
                analysis=analysis,
                room=room,
                session="session_1",
            )
        )

        heatmap_model = {
            "sbm": sbm_image,
            "icnirp": icnirp_image,
        }

        # ==================================================
        # DRAW CARD
        # ==================================================

        draw_room_analysis_card(
            img=ctx.img,
            draw=ctx.draw,
            x=LEFT_MARGIN,
            y=current_y,
            width=CONTENT_WIDTH,
            height=card_heights[
                index
            ],
            model=card_model,
            heatmap=heatmap_model,
            fonts=ctx.fonts,
        )

        # ==================================================
        # NEXT CARD
        # ==================================================

        current_y += (
            card_heights[
                index
            ]
            + ROW_GAP
        )

    # ======================================================
    # FINISH
    # ======================================================

    finish_page(
        ctx=ctx,
        story=story,
        project=project,
        analysis=analysis,
    )

    