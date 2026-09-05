# =====================
# HOTSPOTS BLOCK
# =====================

from reportlab.platypus import (
    Paragraph,
    Spacer,
)

from engine.pdf_components.reportlab.sections.section_header import (
    render_section_header,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)

# =====================
# RENDER
# =====================


def render_hotspots_block(
    story,
    analysis,
    styles,
    sections=None,
):

    hotspots = analysis.get(
        "hotspots",
        [],
    )

    # =====================
    # FILTER NOISE
    # =====================

    hotspots = [

        h

        for h in hotspots

        if h.get(
            "rf",
            0,
        ) >= 30
    ]

    # =====================
    # SORT DESC
    # =====================

    hotspots = sorted(
        hotspots,
        key=lambda x: x.get(
            "rf",
            0,
        ),
        reverse=True,
    )

    # =====================
    # LIMIT
    # =====================

    hotspots = hotspots[:5]

    if not hotspots:

        return

    # =====================
    # HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="EXPOSURE HOTSPOTS",
    )

    # =====================
    # ITEMS
    # =====================

    for index, item in enumerate(
        hotspots,
        start=1,
    ):

        rf = round(
            item.get(
                "rf",
                0,
            ),
            1,
        )

        room = item.get(
            "room",
            "Unknown Area",
        )

        severity = item.get(
            "severity",
            "Moderate",
        )

        txt = (
            f"<b>#{index}</b> "
            f"{room} — "
            f"<b>{rf}</b> RF "
            f"({severity})"
        )

        story.append(
            Paragraph(
                txt,
                styles["Body"],
            )
        )

        story.append(
            Spacer(
                1,
                SPACE_SM,
            )
        )

    story.append(
        Spacer(
            1,
            SPACE_LG,
        )
    )