# =====================
# OVERVIEW BLOCK
# =====================

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Table,
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
def render_overview_block(
    story,
    analysis,
    styles,
    sections=None,
):

    sbm = analysis["scores"]["sbm"]
    icnirp = analysis["scores"]["icnirp"]

    top = analysis.get("top_points", [])[:5]

    # =====================
    # TITLE
    # =====================
    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="OVERVIEW",
    )

    story.append(Spacer(1, SPACE_MD))

    # =====================
    # DESCRIPTION
    # =====================
    story.append(
        Paragraph(
            (
                "This analysis compares biological "
                "exposure sensitivity (SBM) with "
                "regulatory exposure limits (ICNIRP)."
            ),
            styles["Body"],
        )
    )

    story.append(Spacer(1, SPACE_SM))

    # =====================
    # SCORES
    # =====================
    data = [
        ["Framework", "Score", "Level"],
        ["SBM", round(sbm["score"]), sbm["label"]],
        ["ICNIRP", round(icnirp["score"]), icnirp["label"]],
    ]

    table = Table(data, colWidths=[160, 120, 160])

    story.append(table)

    story.append(Spacer(1, SPACE_MD))

    # =====================
    # TOP POINTS
    # =====================
    if top:

        story.append(
            Paragraph(
                "<b>Top Risk Areas</b>",
                styles["Body"],
            )
        )

        story.append(Spacer(1, SPACE_SM))

        for p in top:

            rf = p.get("m", {}).get("rf", 0)

            txt = f"{p.get('id')} — " f"{p.get('room')} " f"({round(rf,1)} RF)"

            story.append(Paragraph(f"• {txt}", styles["Body"]))

    story.append(Spacer(1, SPACE_LG))
