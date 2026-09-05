"""
Recommendations Content

Home Wellness Recommendations presentation layer.

Builds the Recommendations PDF page from the
real analysis structure without introducing
new backend data requirements.
"""

from engine.pdf_components.cards.base_card import (
    draw_base_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
    TEXT,
    BORDER,
)

from engine.pdf_components.framework.typography import (
    draw_text,
    draw_paragraph,
)

from engine.pdf_components.framework.layout import (
    measure_paragraph_height,
)

from engine.pdf_components.framework.theme import (
    CARD_PADDING,
)

from engine.pdf_components.primitives.divider import (
    draw_horizontal_divider,
)

from engine.pdf_layouts.recommendations_layout import (
    CONTENT_X,
    CONTENT_Y,
    CONTENT_WIDTH,
    CONTENT_MAX_Y,
    SECTION_GAP,
    CARD_GAP,
)


# ==========================================================
# HELPERS
# ==========================================================


def _font(
    fonts,
    *names,
):
    for name in names:

        font = fonts.get(
            name
        )

        if font:
            return font

    return fonts.get(
        "body"
    )


def _text(
    value,
):
    if value is None:
        return ""

    return str(
        value
    )


def _zone_type(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return ""

    return str(
        zone.get(
            "type",
            "",
        )
    ).strip().lower()


def _zone_label(
    zone,
):
    if not isinstance(
        zone,
        dict,
    ):
        return "Area"

    name = (
        zone.get("name")
        or zone.get("label")
    )

    if name:
        return str(
            name
        )

    zone_type = _zone_type(
        zone
    )

    labels = {
        "sleep": "SLEEP",
        "children": "CHILD",
        "child": "CHILD",
        "work": "WORK",
        "rest": "REST",
    }

    return labels.get(
        zone_type,
        zone_type.replace(
            "_",
            " ",
        ).upper(),
    )


def _risk_label(
    value,
):
    if not value:
        return ""

    value = str(
        value
    ).strip().lower()

    labels = {
        "low": "GOOD PRACTICE",
        "moderate": "MODERATE",
        "high": "HIGH PRIORITY",
        "very high": "VERY HIGH",
        "critical": "CRITICAL",
        "good": "GOOD PRACTICE",
    }

    return labels.get(
        value,
        value.upper(),
    )


def _recommendation_text(
    recommendation,
):
    if not isinstance(
        recommendation,
        dict,
    ):
        return str(
            recommendation
        )

    return _text(
        recommendation.get(
            "text",
            "",
        )
    )


def _draw_section_title(
    draw,
    x,
    y,
    title,
    subtitle,
    fonts,
):
    title_font = _font(
        fonts,
        "subtitle",
        "title",
        "body_bold",
        "body",
    )

    body_font = _font(
        fonts,
        "small",
        "body",
        "body_bold",
    )

    draw_text(
        draw=draw,
        x=x,
        y=y,
        text=title,
        font=title_font,
        fill=PRIMARY,
    )

    current_y = y + 24

    if subtitle:

        draw_text(
            draw=draw,
            x=x,
            y=current_y,
            text=subtitle,
            font=body_font,
            fill=SECONDARY_TEXT,
        )

        current_y += 18

    return current_y


def _draw_compact_card(
    draw,
    x,
    y,
    width,
    title,
    text,
    fonts,
    min_height=0,
    title_fill=None,
    body_fill=None,
):
    title_font = _font(
        fonts,
        "body_bold",
        "subtitle",
        "body",
    )

    body_font = _font(
        fonts,
        "small",
        "body",
        "body_bold",
    )

    title_fill = (
        title_fill
        or PRIMARY
    )

    body_fill = (
        body_fill
        or TEXT
    )

    body_width = (
        width
        - CARD_PADDING * 2
    )

    paragraph_height = measure_paragraph_height(
        draw=draw,
        text=text or "",
        font=body_font,
        width=body_width,
        line_spacing=4,
    )

    title_height = (
        22
        if title
        else 0
    )

    height = max(
        min_height,
        CARD_PADDING * 2
        + title_height
        + paragraph_height,
    )

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    current_y = area["y"]

    if title:

        draw_text(
            draw=draw,
            x=area["x"],
            y=current_y,
            text=title,
            font=title_font,
            fill=title_fill,
        )

        current_y += 24

    if text:

        draw_paragraph(
            draw=draw,
            x=area["x"],
            y=current_y,
            width=body_width,
            text=text,
            font=body_font,
            fill=body_fill,
            line_spacing=4,
        )

    return (
        y + height
    )


def _draw_zone_card(
    draw,
    x,
    y,
    width,
    zone,
    fonts,
):
    """
    Draw a Home Mode lifestyle-zone recommendation card.

    The card presents:
        - lifestyle zone
        - priority / risk
        - daily occupancy when available
        - assessed floor / room context
        - short explanation

    All values are derived dynamically from the
    actual zone object.
    """

    # ======================================================
    # SAFE ZONE DATA
    # ======================================================

    if not isinstance(
        zone,
        dict,
    ):
        zone = {}

    # ======================================================
    # ZONE LABEL
    # ======================================================

    label = _zone_label(
        zone
    )

    # ======================================================
    # RISK / PRIORITY
    # ======================================================

    risk = _risk_label(
        zone.get(
            "risk"
        )
    )

    # ======================================================
    # DAILY OCCUPANCY
    #
    # Home Mode already stores this as:
    #
    #     hoursPerDay
    #
    # Do not invent a value if it is missing.
    # ======================================================

    hours_per_day = zone.get(
        "hoursPerDay"
    )

    occupancy_text = ""

    if (
        hours_per_day is not None
        and str(hours_per_day).strip() != ""
    ):

        occupancy_text = (
            f"{hours_per_day} h / day\n"
            "Time spent"
        )

    # ======================================================
    # FLOOR
    # ======================================================

    floor_index = zone.get(
        "floorIndex"
    )

    floor_text = None

    if floor_index is not None:

        try:

            floor_number = (
                int(floor_index) + 1
            )

            floor_text = (
                f"Floor {floor_number}"
            )

        except (
            TypeError,
            ValueError,
        ):

            floor_text = None

    # ======================================================
    # ROOM
    # ======================================================

    room_code = (
        zone.get(
            "roomCode"
        )
        or zone.get(
            "roomName"
        )
    )

    # ======================================================
    # ASSESSED IN
    # ======================================================

    location_parts = []

    if floor_text:
        location_parts.append(
            floor_text
        )

    if room_code:
        location_parts.append(
            f"Room {room_code}"
        )

    assessed_text = ""

    if location_parts:

        assessed_text = (
            "ASSESSED IN\n"
            + " · ".join(
                location_parts
            )
        )

    # ======================================================
    # WHY IT MATTERS
    # ======================================================

    zone_type = str(
        zone.get(
            "type",
            ""
        )
    ).lower()

    why_text = (
        "This lifestyle area is "
        "included in the assessment."
    )

    if zone_type == "sleep":

        why_text = (
            "Sleeping areas benefit from "
            "the lowest achievable exposure."
        )

    elif zone_type in (
        "child",
        "children",
    ):

        why_text = (
            "Children's areas benefit from "
            "a precautionary exposure approach."
        )

    elif zone_type == "work":

        why_text = (
            "Long-duration work areas should "
            "minimize unnecessary exposure."
        )

    elif zone_type == "rest":

        why_text = (
            "Frequently used rest areas should "
            "remain as comfortable and low-exposure "
            "as reasonably achievable."
        )

    # ======================================================
    # BUILD CARD TEXT
    # ======================================================

    text_parts = []

    if risk:

        text_parts.append(
            risk
        )

    if occupancy_text:

        text_parts.append(
            occupancy_text
        )

    if assessed_text:

        text_parts.append(
            assessed_text
        )

    text_parts.append(
        "WHY IT MATTERS\n"
        + why_text
    )

    text = "\n\n".join(
        text_parts
    )

    # ======================================================
    # CARD
    # ======================================================

    return _draw_compact_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title=label,
        text=text,
        fonts=fonts,
        min_height=190,
    )

def _ordered_zones(
    zones,
):
    """
    Keep the canonical Home Mode order:

        Sleep
        Child
        Work
        Rest

    Only uses zone type already supported
    by the existing analysis data.
    """

    if not isinstance(
        zones,
        list,
    ):
        return []

    order = {
        "sleep": 0,
        "children": 1,
        "child": 1,
        "work": 2,
        "rest": 3,
    }

    valid = [
        zone
        for zone in zones
        if isinstance(
            zone,
            dict,
        )
    ]

    valid.sort(
        key=lambda zone: (
            order.get(
                _zone_type(
                    zone
                ),
                99,
            ),
            _zone_label(
                zone
            ),
        )
    )

    return valid


def _draw_zones(
    draw,
    x,
    y,
    width,
    zones,
    fonts,
):
    zones = _ordered_zones(
        zones
    )

    if not zones:

        return _draw_compact_card(
            draw=draw,
            x=x,
            y=y,
            width=width,
            title="NO LIFESTYLE ZONES",
            text=(
                "No lifestyle zones were identified "
                "in this assessment."
            ),
            fonts=fonts,
            min_height=100,
        )

    # ------------------------------------------------------
    # FOUR COLUMN HOME MODE GRID
    # ------------------------------------------------------

    visible = zones[
        :4
    ]

    count = len(
        visible
    )

    if count == 1:

        card_width = width

    else:

        card_width = (
            width
            - CARD_GAP * (
                count - 1
            )
        ) / count

    current_x = x
    row_bottom = y

    for zone in visible:

        bottom = _draw_zone_card(
            draw=draw,
            x=current_x,
            y=y,
            width=card_width,
            zone=zone,
            fonts=fonts,
        )

        row_bottom = max(
            row_bottom,
            bottom,
        )

        current_x += (
            card_width
            + CARD_GAP
        )

    return row_bottom


def _draw_action_card(
    draw,
    x,
    y,
    width,
    index,
    recommendation,
    fonts,
):
    title_font = _font(
        fonts,
        "body_bold",
        "subtitle",
        "body",
    )

    body_font = _font(
        fonts,
        "small",
        "body",
        "body_bold",
    )

    text = _recommendation_text(
        recommendation
    )

    priority = ""

    impact = ""

    reduction = ""

    if isinstance(
        recommendation,
        dict,
    ):

        priority = _text(
            recommendation.get(
                "priority",
                "",
            )
        ).upper()

        impact = _text(
            recommendation.get(
                "impact",
                "",
            )
        ).upper()

        reduction = _text(
            recommendation.get(
                "reduction",
                "",
            )
        )

    body_width = (
        width
        - CARD_PADDING * 2
    )

    paragraph_height = measure_paragraph_height(
        draw=draw,
        text=text,
        font=body_font,
        width=body_width,
        line_spacing=4,
    )

    metadata = " · ".join(
        value
        for value in (
            priority,
            impact,
            reduction,
        )
        if value
    )

    metadata_height = (
        18
        if metadata
        else 0
    )

    height = max(
        126,
        CARD_PADDING * 2
        + 28
        + paragraph_height
        + metadata_height,
    )

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    number_font = _font(
        fonts,
        "subtitle",
        "title",
        "body_bold",
    )

    draw_text(
        draw=draw,
        x=area["x"],
        y=area["y"],
        text=f"{index:02d}",
        font=number_font,
        fill=PRIMARY,
    )

    current_y = (
        area["y"]
        + 28
    )

    draw_paragraph(
        draw=draw,
        x=area["x"],
        y=current_y,
        width=body_width,
        text=text,
        font=body_font,
        fill=TEXT,
        line_spacing=4,
    )

    current_y += (
        paragraph_height
        + 8
    )

    if metadata:

        draw_text(
            draw=draw,
            x=area["x"],
            y=current_y,
            text=metadata,
            font=body_font,
            fill=SECONDARY_TEXT,
        )

    return (
        y + height
    )


def _draw_priority_actions(
    draw,
    x,
    y,
    width,
    priority,
    fonts,
):
    actions = (
        priority[:3]
        if isinstance(
            priority,
            list,
        )
        else []
    )

    if not actions:

        return _draw_compact_card(
            draw=draw,
            x=x,
            y=y,
            width=width,
            title="NO PRIORITY ACTIONS",
            text=(
                "No priority actions were generated "
                "for this assessment."
            ),
            fonts=fonts,
            min_height=100,
        )

    count = len(
        actions
    )

    card_width = (
        width
        - CARD_GAP * (
            count - 1
        )
    ) / count

    current_x = x
    row_bottom = y

    for index, recommendation in enumerate(
        actions,
        start=1,
    ):

        bottom = _draw_action_card(
            draw=draw,
            x=current_x,
            y=y,
            width=card_width,
            index=index,
            recommendation=recommendation,
            fonts=fonts,
        )

        row_bottom = max(
            row_bottom,
            bottom,
        )

        current_x += (
            card_width
            + CARD_GAP
        )

    return row_bottom


def _source_lines(
    sources,
):
    if not isinstance(
        sources,
        list,
    ):
        return []

    lines = []

    for source in sources:

        if not isinstance(
            source,
            dict,
        ):
            continue

        name = (
            source.get("label")
            or source.get("name")
            or source.get("type")
        )

        if not name:
            continue

        source_type = _text(
            source.get(
                "type",
                "",
            )
        ).replace(
            "_",
            " ",
        )

        if source_type:

            lines.append(
                f"• {name} · {source_type}"
            )

        else:

            lines.append(
                f"• {name}"
            )

    return lines


def _draw_sources(
    draw,
    x,
    y,
    width,
    sources,
    fonts,
):
    lines = _source_lines(
        sources
    )

    if not lines:

        text = (
            "No additional source-specific "
            "items were identified."
        )

    else:

        visible = lines[
            :4
        ]

        text = "\n".join(
            visible
        )

        remaining = (
            len(lines)
            - len(visible)
        )

        if remaining > 0:

            text += (
                f"\n• +{remaining} additional source(s)"
            )

    return _draw_compact_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title=None,
        text=text,
        fonts=fonts,
        min_height=112,
    )


def _draw_good_practices(
    draw,
    x,
    y,
    width,
    room_summary,
    fonts,
):
    good_rooms = []

    if isinstance(
        room_summary,
        list,
    ):

        for room in room_summary:

            if not isinstance(
                room,
                dict,
            ):
                continue

            risk = str(
                room.get(
                    "risk",
                    "",
                )
            ).lower()

            if risk in (
                "low",
                "good",
            ):

                name = (
                    room.get("room")
                    or room.get("name")
                    or "Area"
                )

                good_rooms.append(
                    str(name)
                )

    if good_rooms:

        text = (
            "Areas currently showing good conditions: "
            + ", ".join(
                good_rooms[:5]
            )
            + "."
        )

    else:

        text = (
            "Maintain the areas that currently "
            "show lower exposure and continue "
            "good source-distance practices."
        )

    return _draw_compact_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title=None,
        text=text,
        fonts=fonts,
        min_height=112,
    )


def _draw_proceed(
    draw,
    x,
    y,
    width,
    fonts,
):
    text = (
        "1. Focus on the Top 3 Priority Actions.\n"
        "2. Implement the practical changes.\n"
        "3. Maintain good practices.\n"
        "4. Re-measure to verify improvement."
    )

    return _draw_compact_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title="HOW TO PROCEED",
        text=text,
        fonts=fonts,
        min_height=112,
    )


def _draw_after_implementation(
    draw,
    x,
    y,
    width,
    fonts,
):
    text = (
        "Re-measure the affected area after "
        "implementation and compare the result "
        "with the original assessment."
    )

    return _draw_compact_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        title="AFTER IMPLEMENTATION",
        text=text,
        fonts=fonts,
        min_height=112,
    )


def _draw_score(
    draw,
    x,
    y,
    width,
    analysis,
    fonts,
):
    summary = analysis.get(
        "summary",
        {},
    )

    if not isinstance(
        summary,
        dict,
    ):
        summary = {}

    score = summary.get(
        "score",
        0,
    )

    label = (
        summary.get(
            "label"
        )
        or "UNKNOWN"
    )

    try:

        score_value = float(
            score
            or 0
        )

        if score_value.is_integer():

            score_text = str(
                int(
                    score_value
                )
            )

        else:

            score_text = str(
                round(
                    score_value,
                    1,
                )
            )

    except (
        TypeError,
        ValueError,
    ):

        score_text = "—"

    title_font = _font(
        fonts,
        "body_bold",
        "subtitle",
        "title",
    )

    score_font = _font(
        fonts,
        "title",
        "subtitle",
        "body_bold",
    )

    body_font = _font(
        fonts,
        "small",
        "body",
        "body_bold",
    )

    height = 112

    area = draw_base_card(
        draw=draw,
        x=x,
        y=y,
        width=width,
        height=height,
    )

    draw_text(
        draw=draw,
        x=area["x"],
        y=area["y"],
        text="PROPERTY HEALTH SCORE",
        font=title_font,
        fill=PRIMARY,
    )

    draw_text(
        draw=draw,
        x=area["x"],
        y=area["y"] + 30,
        text=score_text,
        font=score_font,
        fill=PRIMARY,
    )

    draw_text(
        draw=draw,
        x=area["x"] + 58,
        y=area["y"] + 38,
        text="/ 100",
        font=body_font,
        fill=SECONDARY_TEXT,
    )

    draw_text(
        draw=draw,
        x=area["x"],
        y=area["y"] + 72,
        text=str(label).upper(),
        font=body_font,
        fill=SECONDARY_TEXT,
    )

    return (
        y + height
    )


# ==========================================================
# MAIN RENDERER
# ==========================================================


def draw_recommendations_content(
    draw,
    analysis,
    fonts,
):
    """
    Draw the complete Recommendations page.

    The layout is intentionally compact so that
    all major sections remain visible on one page.
    """

    home = analysis.get(
        "home_recommendations",
        {},
    )

    if not isinstance(
        home,
        dict,
    ):
        home = {}

    priority = home.get(
        "priority",
        [],
    )

    zones = analysis.get(
        "zones",
        [],
    )

    sources = analysis.get(
        "sources",
        [],
    )

    room_summary = analysis.get(
        "room_summary",
        [],
    )

    current_y = CONTENT_Y

    # ======================================================
    # WHY
    # ======================================================

    current_y = _draw_section_title(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        title="WHY THESE RECOMMENDATIONS?",
        subtitle=None,
        fonts=fonts,
    )

    current_y = _draw_compact_card(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        width=CONTENT_WIDTH,
        title=None,
        text=(
            "Recommendations prioritize measured exposure, "
            "identified sources, lifestyle zones, and the "
            "current Property Health assessment."
        ),
        fonts=fonts,
        min_height=72,
    )

    current_y += SECTION_GAP

    # ======================================================
    # MOST IMPORTANT AREAS
    # ======================================================

    current_y = _draw_section_title(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        title="YOUR MOST IMPORTANT AREAS",
        subtitle=(
            "Areas are prioritized by the available lifestyle-zone context."
        ),
        fonts=fonts,
    )

    current_y = _draw_zones(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        width=CONTENT_WIDTH,
        zones=zones,
        fonts=fonts,
    )

    current_y += SECTION_GAP

    # ======================================================
    # TOP 3
    # ======================================================

    current_y = _draw_section_title(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        title="YOUR TOP 3 PRIORITY ACTIONS",
        subtitle=(
            "Start with these actions for the greatest practical impact."
        ),
        fonts=fonts,
    )

    current_y = _draw_priority_actions(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        width=CONTENT_WIDTH,
        priority=priority,
        fonts=fonts,
    )

    current_y += SECTION_GAP

    # ======================================================
    # SOURCES + GOOD PRACTICES
    # ======================================================

    current_y = _draw_section_title(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        title="OTHER SOURCES TO CONSIDER",
        subtitle=None,
        fonts=fonts,
    )

    two_col_width = (
        CONTENT_WIDTH
        - CARD_GAP
    ) / 2

    sources_bottom = _draw_sources(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        width=two_col_width,
        sources=sources,
        fonts=fonts,
    )

    good_bottom = _draw_good_practices(
        draw=draw,
        x=(
            CONTENT_X
            + two_col_width
            + CARD_GAP
        ),
        y=current_y,
        width=two_col_width,
        room_summary=room_summary,
        fonts=fonts,
    )

    current_y = max(
        sources_bottom,
        good_bottom,
    )

    current_y += SECTION_GAP

    # ======================================================
    # BOTTOM ACTION ROW
    # ======================================================

    bottom_width = (
        CONTENT_WIDTH
        - CARD_GAP * 2
    ) / 3

    proceed_bottom = _draw_proceed(
        draw=draw,
        x=CONTENT_X,
        y=current_y,
        width=bottom_width,
        fonts=fonts,
    )

    after_x = (
        CONTENT_X
        + bottom_width
        + CARD_GAP
    )

    after_bottom = _draw_after_implementation(
        draw=draw,
        x=after_x,
        y=current_y,
        width=bottom_width,
        fonts=fonts,
    )

    score_x = (
        after_x
        + bottom_width
        + CARD_GAP
    )

    score_bottom = _draw_score(
        draw=draw,
        x=score_x,
        y=current_y,
        width=bottom_width,
        analysis=analysis,
        fonts=fonts,
    )

    current_y = max(
        proceed_bottom,
        after_bottom,
        score_bottom,
    )

    return min(
        current_y,
        CONTENT_MAX_Y,
    )