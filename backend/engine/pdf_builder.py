"""
PHI PDF Builder

Main entry point for PDF generation.
"""

# ==========================================================
# PYTHON
# ==========================================================

import os

# ==========================================================
# REPORTLAB
# ==========================================================

from reportlab.platypus import (
    SimpleDocTemplate,
)

# ==========================================================
# ANALYSIS
# ==========================================================

from engine.analysis.business.analysis import (
    build_business_analysis,
)

# ==========================================================
# COMPONENTS
# ==========================================================

from engine.pdf_components.watermark import (
    draw_watermark,
)

# ==========================================================
# PDF PAGES
# ==========================================================

from engine.pdf_pages.cover import (
    render_cover,
)

from engine.pdf_pages.executive_summary import (
    render_executive_summary,
)

from engine.pdf_pages.assessment_summary import (
    render_assessment_summary,
)

from engine.pdf_pages.property_overview import (
    render_property_overview,
)

from engine.analysis.common.room.room_analysis_groups import (
    build_room_analysis_groups,
)

from engine.analysis.common.room.room_analysis_card_builder import (
    build_room_analysis_card,
)

from engine.pdf_pages.source_analysis import (
    render_sources,
)

from engine.pdf_pages.recommendations import (
    render_recommendations,
)

from engine.pdf_pages.room_analysis_floor import (
    render_room_analysis_floor,
)

# ==========================================================
# PDF BUILDER
# ==========================================================


def build_pdf(
    project,
    sessionA,
    sessionB,
    pid,
    plan="premium",
    preview=False,
    user=None,
):
    """
    Build PHI PDF report.
    """

    # ------------------------------------------------------
    # OUTPUT
    # ------------------------------------------------------

    output_dir = os.path.join(
        os.path.dirname(__file__),
        "../output",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    pdf_path = os.path.join(
        output_dir,
        f"{pid}.pdf",
    )

    # ------------------------------------------------------
    # DOCUMENT
    # ------------------------------------------------------

    doc = SimpleDocTemplate(
        pdf_path,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0,
    )

    story = []

    # ------------------------------------------------------
    # ANALYSIS
    # ------------------------------------------------------
    

    analysis = build_business_analysis(
        project,
        sessionA,
        sessionB,
    )

    analysis["project_id"] = pid

    # ------------------------------------------------------
    # COVER
    # ------------------------------------------------------

    render_cover(
        story=story,
        project=project,
        analysis=analysis,
        user=user,
    )

    # ------------------------------------------------------
    # PDF PAGES
    # ------------------------------------------------------

    floors = analysis.get(
        "floors",
        [],
    )

    if not isinstance(
        floors,
        list,
    ):
        floors = []

    floor_count = len(
        floors
    )

    # ------------------------------------------------------
    # PAGE COUNT
    # ------------------------------------------------------

    base_page_count = 4

    total_pages = (
        base_page_count
        + floor_count
    )

    page_number = 1

    # ======================================================
    # EXECUTIVE SUMMARY
    # ======================================================

    render_executive_summary(
        story=story,
        project=project,
        analysis=analysis,
        page_number=page_number,
        total_pages=total_pages,
    )

    page_number += 1


    # ======================================================
    # ASSESSMENT SUMMARY
    # ======================================================

    render_assessment_summary(
        story=story,
        project=project,
        analysis=analysis,
        page_number=page_number,
        total_pages=total_pages,
    )

    page_number += 1


    # ======================================================
    # PROPERTY OVERVIEW — ALL FLOORS
    # ======================================================

    if floor_count:

        for floor_index in range(
            floor_count
        ):

            print(
                "🔥 RENDER PROPERTY FLOOR:",
                floor_index,
                "PAGE:",
                page_number,
            )

            render_property_overview(
                story=story,
                project=project,
                analysis=analysis,
                page_number=page_number,
                total_pages=total_pages,
                floor_index=floor_index,
            )

            page_number += 1

    else:

        # --------------------------------------------------
        # FALLBACK
        # --------------------------------------------------

        render_property_overview(
            story=story,
            project=project,
            analysis=analysis,
            page_number=page_number,
            total_pages=total_pages,
            floor_index=0,
        )

        page_number += 1


    # ======================================================
    # ROOM ANALYSIS — ALL ROOMS
    # ======================================================

    from engine.pdf_pages.room_analysis import (
        render_room_analysis,
    )


    # ------------------------------------------------------
    # BUILD ROOM LIST FROM FLOORS
    # ------------------------------------------------------
    #
    # Important:
    # Do NOT use analysis["rooms"] here.
    #
    # analysis["floors"] contains the real floor -> room
    # relationship and therefore preserves:
    #
    #   Main Floor / Room 1
    #   Main Floor / Room 2
    #   Floor 2   / Room 1
    #
    # ------------------------------------------------------

    pdf_rooms = []

    analysis_floors = analysis.get(
        "floors",
        [],
    )

    if isinstance(
        analysis_floors,
        list,
    ):

        for floor_index, floor in enumerate(
            analysis_floors
        ):


            if not isinstance(
                floor,
                dict,
            ):
                continue

            floor_name = floor.get(
                "name",
                f"Floor {floor_index + 1}",
            )

            floor_rooms = floor.get(
                "rooms",
                [],
            )

            if not isinstance(
                floor_rooms,
                list,
            ):
                continue

            for room in floor_rooms:

                if not isinstance(
                    room,
                    dict,
                ):
                    continue

                # --------------------------------------------------
                # COPY RAW ROOM
                # --------------------------------------------------

                room_model = dict(
                    room
                )

                # --------------------------------------------------
                # ADD FLOOR CONTEXT
                # --------------------------------------------------

                room_model["floor"] = (
                    floor_name
                )

                room_model["floor_name"] = (
                    floor_name
                )

                room_model["floorIndex"] = (
                    floor_index
                )

                pdf_rooms.append(
                    room_model
                )


    print(
        "🔥 PDF ROOMS FROM FLOORS:",
        [
            (
                r.get("floor"),
                r.get("name"),
                r.get("id"),
            )
            for r in pdf_rooms
        ],
    )


    # ======================================================
    # RENDER ROOMS
    # ======================================================

    room_overviews = analysis.get(
        "room_overviews",
        [],
    )

    print(
        "🔥 PDF ROOM OVERVIEWS:",
        len(room_overviews),
    )

    # ======================================================
    # ROOM ANALYSIS — ALL ROOMS
    # ======================================================

    room_overviews = analysis.get(
        "room_overviews",
        [],
    )


    # ------------------------------------------------------
    # INDEX NORMALIZED ROOM MODELS BY ROOM ID
    # ------------------------------------------------------

    room_overview_by_id = {}

    for overview in room_overviews:

        if not isinstance(
            overview,
            dict,
        ):
            continue

        room_id = overview.get(
            "room_id",
            overview.get(
                "id",
            ),
        )

        if room_id:

            room_overview_by_id[
                room_id
            ] = overview


    print(
        "🔥 ROOM OVERVIEW INDEX:",
        len(
            room_overview_by_id
        ),
    )

    print(
        "🔥🔥🔥 PDF ROOMS BEFORE RENDER:"
    )

    for i, r in enumerate(pdf_rooms):

        print(
            "   ROOM",
            i,
            "| ID:",
            r.get("id") if isinstance(r, dict) else None,
            "| FLOOR:",
            r.get("floor") if isinstance(r, dict) else None,
            "| NAME:",
            r.get("name") if isinstance(r, dict) else None,
        )


    # ======================================================
    # ROOM ANALYSIS GROUPS
    # ======================================================

    room_analysis_groups = (
        build_room_analysis_groups(
            rooms=pdf_rooms,
            room_overviews=list(
                room_overview_by_id.values()
            ),
        )
    )

   

    for group in room_analysis_groups:

        

        for index, item in enumerate(
            group.get(
                "rooms",
                [],
            ),
            start=1,
        ):

            room = item.get(
                "room",
                {},
            )

            overview = item.get(
                "room_overview",
                {},
            )

           

            card_model = build_room_analysis_card(
                room=room,
                room_overview=overview,
            )

            # ----------------------------------------------
            # STORE CARD MODEL
            # ----------------------------------------------

            item[
                "card"
            ] = card_model

            
                
            
    # ======================================================
    # RENDER ROOM ANALYSIS FLOOR PAGES
    # ======================================================

    for group in room_analysis_groups:

        if not isinstance(
            group,
            dict,
        ):
            continue

        floor_name = group.get(
            "floor",
            "",
        )

        rooms_in_group = group.get(
            "rooms",
            [],
        )

        if not isinstance(
            rooms_in_group,
            list,
        ):
            continue

        # --------------------------------------------------
        # Build card models
        # --------------------------------------------------

        room_cards = []

        for item in rooms_in_group:

            if not isinstance(
                item,
                dict,
            ):
                continue

            card_model = item.get(
                "card",
            )

            if not isinstance(
                card_model,
                dict,
            ):
                continue

            room_cards.append(
                {
                    "room": item.get(
                        "room",
                        {},
                    ),
                    "room_overview": item.get(
                        "room_overview",
                        {},
                    ),
                    "card": card_model,
                }
            )

        if not room_cards:

            continue

        # --------------------------------------------------
        # DEBUG
        # --------------------------------------------------

       
        for index, card in enumerate(
            room_cards,
            start=1,
        ):

            print(
                "   ROOM",
                index,
                "|",
                card.get(
                    "room",
                    {},
                ).get(
                    "name",
                    "Room",
                ),
                "| RF:",
                card.get(
                    "avg_rf",
                    0,
                ),
                "| RISK:",
                card.get(
                    "risk",
                    "unknown",
                ),
            )

        # --------------------------------------------------
        # RENDER FLOOR PAGE
        # --------------------------------------------------

        render_room_analysis_floor(
            story=story,
            project=project,
            analysis=analysis,
            floor_name=floor_name,
            room_cards=room_cards,
            page_number=page_number,
            total_pages=total_pages,
        )

        page_number += 1


    # ======================================================
    # SOURCES
    # ======================================================

    render_sources(
        story=story,
        project=project,
        analysis=analysis,
        page_number=page_number,
        total_pages=total_pages,
    )

    page_number += 1


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    render_recommendations(
        story=story,
        project=project,
        analysis=analysis,
        page_number=page_number,
        total_pages=total_pages,
    )

    page_number += 1

    print(
        "PDF pages finished"
    )

    # ------------------------------------------------------
    # WATERMARK
    # ------------------------------------------------------

    def add_preview_watermark(
        canvas,
        doc,
    ):

        if preview:

            draw_watermark(
                canvas,
                "PREVIEW",
            )

    # ------------------------------------------------------
    # BUILD
    # ------------------------------------------------------

    doc.build(
        story,
        onFirstPage=add_preview_watermark,
        onLaterPages=add_preview_watermark,
    )

    print(
        "PDF GENERATED:",
        pdf_path,
    )

    return pdf_path