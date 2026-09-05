# =====================
# ROOM SUMMARY BLOCK
# =====================

from reportlab.platypus import (
    Spacer,
)

from engine.pdf_components.reportlab.sections.section_header import (
    render_section_header,
)

from engine.pdf_components.reportlab.cards.analysis.room_card import (
    render_room_card,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)





def render_room_summary(
    story,
    analysis,
    styles,
    sections=None,
):

    rooms = analysis.get(
        "room_summary",
        [],
    )

    if not rooms:

        return

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="ROOM PRIORITIES"
    )

    rooms = sorted(
        rooms,
        key=lambda r: r.get(
            "avg_rf",
            0,
        ),
        reverse=True,
    )

    # =====================
    # TABLE DATA
    # =====================

    #table_data = [
    #    [
    #        "ROOM",
    #        "HEALTH",
    #        "SCORE",
    #        "INTERPRETATION",
    #    ]
    #]

    # =====================
    # ROWS
    # =====================

    for idx, room in enumerate(
        rooms,
        start=1,
    ):

        room_name = room.get(
            "room",
            "Unknown",
        )

        
        score = round(
            room.get("avg_rf", 0),
            1,
        )

        if idx == 1:

            priority = "Moderate"
           

            text = (
                "Highest exposure area. This room should be prioritized during mitigation planning."
            )

        elif score >= 75:

            priority = "ACTION RECOMMENDED"
            

            text = (
                "Elevated exposure detected. Mitigation "
                "is recommended."
            )

        elif score >= 40:

            priority = "OPTIMIZATION ADVISED"
           

            text = (
                "Moderate exposure detected. Consider "
                "targeted improvements."
            )

        else:

            priority = "ACCEPTABLE CONDITIONS"
           

            text = (
                "Exposure levels are currently acceptable."
            )

        card = render_room_card(
            styles=styles,

            room_name=f"#{idx} • {room_name}",

            room_type=room.get(
                "type",
                "Room",
            ),

            score=score,

            risk=priority,

            point_count=room.get(
                "point_count",
                0,
            ),

            recommendation=text,
        )

        story.append(card)

        story.append(
           Spacer(
            1,
            SPACE_MD,
        )
        )    


