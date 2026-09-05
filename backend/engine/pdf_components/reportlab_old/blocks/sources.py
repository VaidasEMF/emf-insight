# =====================
# SOURCES BLOCK
# =====================

from reportlab.platypus import (
    Paragraph,
    Spacer,
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

from engine.pdf_layouts.layouts import (
    auto_grid,
)

from engine.analysis.heatmap.sources import (
    compute_source_impact,
)

# =====================
# SOURCE IMPACT
# =====================


def estimate_source_impact(
    source,
    points,
):

    if not points:

        return 0

    values = []

    for point in points:

        try:

            val = compute_source_impact(
                source,
                point["x"],
                point["y"],
            )

            values.append(val)

        except:
            continue

    if not values:

        return 0

    return sum(values) / len(values)


# =====================
# BUILD RECOMMENDATION
# =====================


def build_recommendation(
    impact,
):

    if impact == "high":

        return (
            "Immediate reduction, shielding, "
            "or relocation strategies are "
            "recommended."
        )

    elif impact == "moderate":

        return "Exposure optimization and " "distance improvements are " "recommended."

    return (
        "Current exposure contribution "
        "appears within acceptable "
        "biological limits."
    )


# =====================
# RENDER
# =====================


def render_sources_block(
    story,
    analysis,
    styles,
    sections=None,
):

    sources = analysis.get(
        "source_summary",
        [],
    )

    if not sources:

        return

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="INDOOR SOURCES"
    )



    # =====================
    # SOURCE CARDS
    # =====================

    cards = []

    for source in sources[:6]:

        source_name = (
            source.get(
                "type",
                "Unknown Source",
            )
            .replace("_", " ")
            .title()
        )

        source_type = source.get(
            "type",
            "Emitter",
        )

        score = source.get(
            "score",
            0,
        )

      

        # =====================
        # CARD
        # =====================

        risk = source.get(
            "risk",
            "Low",
        )

        if risk in [
            "Very High",
            "High",
        ]:

            impact = "PRIORITY SOURCE"

        elif risk == "Moderate":

            impact = "MODERATE SOURCE"

        else:

            impact = "LOW IMPACT SOURCE"

        details = (
            f"Score: {int(source.get('score', 0))}"
            f"<br/>Measurements: {source.get('point_count', 0)}"
        )

       
        
        card = render_source_card(
            styles=styles,
            source_name=source_name,
            source_type=source_type,
            impact=impact,
            recommendation=source.get(
                "recommendation",
                "",
            ),
            details=details,
        )

        cards.append(card)

    # =====================
    # AUTO GRID
    # =====================

    grid = auto_grid(
        cards,
        columns=2,
        width=255,
    )

    story.append(grid)

    
   
   
