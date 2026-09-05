from reportlab.platypus import (
    Paragraph,
    Spacer,
)


from engine.pdf_layouts.layouts import (
    auto_grid,
)
from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)

from engine.pdf_components.reportlab.sections.section_header import (
    render_section_header,
)

from engine.pdf_components.reportlab.cards.analysis.source_card import (
    render_source_card,
)


from engine.analysis.heatmap.zones import (
    point_in_polygon,
)

from engine.analysis.common.helpers.score_helpers import (
    weighted_exposure_score,
)

from engine.pdf_components.reportlab.cards.analysis.zone_card import (
    render_zone_card,
)

# =====================
# HELPERS
# =====================


def get_zone_points(
    points,
    zone,
):

    polygon = zone.get(
        "polygon",
        [],
    )

    result = []

    for p in points:

        try:

            inside = point_in_polygon(
                p.get("x", 0),
                p.get("y", 0),
                polygon,
            )

            if inside:

                result.append(
                    p,
                )

        except:

            continue

    return result


# =====================
# COMPUTE ZONE SCORE
# =====================


def compute_zone_score(
    points,
    fn,
    zone_type="general",
):

    if not points:

        return {
            "score": 0,
            "label": "Low",
        }

    scores = []

    for p in points:

        try:

            raw_score = fn(
                p.get(
                    "m",
                    {},
                )
            )["score"]

            weighted_score = weighted_exposure_score(
                raw_score,
                zone_type,
            )

            scores.append(
                weighted_score,
            )

        except:

            continue

    if not scores:

        return {
            "score": 0,
            "label": "Low",
        }

    avg = sum(scores) / len(scores)

    # =====================
    # CLASSIFICATION
    # =====================

    if avg >= 75:

        label = "High"

    elif avg >= 40:

        label = "Moderate"

    else:

        label = "Low"

    return {
        "score": avg,
        "label": label,
    }


# =====================
# RENDER
# =====================


def render_zones_block(
    story,
    analysis,
    styles,
    sections=None,
):
    
    print(
        "ZONE BLOCK DATA:",
        len(
            analysis.get(
                "zone_summary",
                []
            )
        )
    )

    zones = analysis.get(
        "zone_summary",
        [],
    )

    if not zones:

        return

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="EXPOSURE ZONES",
    )

    story.append(
        Paragraph(
            (
                "Lifestyle zones represent key living areas "
                "assessed according to measured exposure levels "
                "and potential health impact."
            ),
            styles["Body"],
        )
    )

    story.append(
        Spacer(
            1,
            SPACE_SM,
        )
    )

    cards = []

    for zone in zones[:4]:
        # =====================
        # ZONE META
        # =====================

        zone_name = zone.get(
            "name",
            "Zone",
        )

        zone_type = zone.get(
            "type",
            "general",
        )

        if zone_type == "sleep":

            zone_name = "🛏 Sleep Zone"

        elif zone_type == "work":

            zone_name = "💻 Work Area"

        elif zone_type == "child":

            zone_name = "👶 Child Area"

        elif zone_type == "rest":

            zone_name = "🛋 Recovery Area"

        else:

            zone_name = "Zone"

        
        
        risk = zone.get(
            "sbm",
            "Unknown",
        )

        risk = zone.get(
            "sbm",
            "Unknown",
        )

        avg_rf = zone.get(
            "avg_rf",
            0,
        )

        max_rf = zone.get(
            "max_rf",
            0,
        )

        avg_electric = zone.get(
            "avg_electric",
            0,
        )

        max_electric = zone.get(
            "max_electric",
            0,
        )

        avg_magnetic = zone.get(
            "avg_magnetic",
            0,
        )

        max_magnetic = zone.get(
            "max_magnetic",
            0,
        )

        point_count = zone.get(
            "point_count",
            0,
        )

       
        # =====================
        # RECOMMENDATION
        # =====================

        

        if risk == "Poor":

            recommendation = (
                f"{point_count} measurements. "
                "Immediate mitigation recommended."
            )

        elif risk == "Moderate":

            recommendation = (
                f"{point_count} measurements. "
                "Exposure optimization recommended."
            )

        else:

            recommendation = (
                f"{point_count} measurements. "
                "Exposure conditions acceptable."
            )



        # =====================
        # CARD
        # =====================

        if risk == "Poor":

            impact = "PRIORITY AREA"

            recommendation = {
                "text": "Priority mitigation area.",
                "priority": "high",
                "impact": "high",
                "category": "zone",
            }

        elif risk == "Moderate":

            impact = "OPTIMIZATION AREA"

            recommendation = {
                "text": "Exposure optimization recommended.",
                "priority": "medium",
                "impact": "moderate",
                "category": "zone",
            }

        else:

            impact = "ACCEPTABLE AREA"

            recommendation = {
                "text": "Exposure conditions acceptable.",
                "priority": "low",
                "impact": "low",
                "category": "zone",
            }

        print(
            zone.get("name"),
            "=>",
            zone_name,
        )   

        card = render_zone_card(
            styles=styles,
            zone_name=zone_name,
            zone_type=zone_type,
            risk=impact,

            avg_rf=avg_rf,
            max_rf=max_rf,

            avg_electric=avg_electric,
            max_electric=max_electric,

            avg_magnetic=avg_magnetic,
            max_magnetic=max_magnetic,

            point_count=point_count,
            recommendation=recommendation,
        )

        cards.append(
            card,
        )

    # =====================
    # GRID
    # =====================


    grid = auto_grid(
        cards,
        columns=2,
        width=270,
    )

    story.append(
        Spacer(
            1,
            SPACE_LG,
        )
    )

    story.append(grid)

    story.append(
        Spacer(
            1,
            SPACE_SM,
        )
    )

    story.append(
    Spacer(
        1,
        SPACE_MD,
    )
)
