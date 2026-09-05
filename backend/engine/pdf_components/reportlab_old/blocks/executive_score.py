# =====================
# EXECUTIVE SCORE PAGE
# =====================

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

from reportlab.lib import colors

from engine.pdf_components.reportlab.cards.kpi.metric_cards import (
    render_metric_card,
)

from engine.pdf_components.reportlab.sections.section_header import (
    render_section_divider,
)

from engine.pdf_components.framework.constants import (
    CONTENT_WIDTH,
    CARD_WIDTH_SM,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
    SPACE_XXL,
)

# =====================
# HELPERS
# =====================


def get_risk_variant(score):

    if score >= 75:

        return "danger"

    elif score >= 40:

        return "warning"

    return "success"


def get_score_color(score):

    if score < 25:

        return "#22C55E"

    elif score < 50:

        return "#FACC15"

    elif score < 75:

        return "#FB923C"

    return "#EF4444"


# =====================
# RENDER
# =====================


def render_executive_score_page(
    story,
    analysis,
    styles,
    sections=None,
):

    summary = analysis.get(
        "summary",
        {},
    )

    score = round(
        summary.get(
            "score",
            0,
        )
    )

    label = summary.get(
        "label",
        "Unknown",
    )

    variant = get_risk_variant(score)

    # =====================
    # HERO SCORE
    # =====================

    story.append(Spacer(1, SPACE_XXL))

    hero = Table(
        [
            [
                Paragraph(
                    (
                        f"<font color='{get_score_color(score)}'>"
                        f"<font size='52'><b>{score}</b></font>"
                        "</font>"
                        "<br/><br/>"
                        "<font size='15' color='#64748B'>"
                        "Overall Biological Exposure Score"
                        "</font>"
                    ),
                    styles["Body"],
                )
            ]
        ],
        colWidths=[CONTENT_WIDTH],
    )

    hero.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.white,
                ),
                                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    2,
                    colors.HexColor("#E2E8F0"),
                ),
                (
                    "ROUNDEDCORNERS",
                    [12, 12, 12, 12],
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    52,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    52,
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),
            ]
        )
    )

    story.append(hero)

    story.append(Spacer(1, SPACE_MD))

    story.append(
        Paragraph(
            label.upper(),
            styles["SectionTitle"],
        )
    )

    story.append(Spacer(1, SPACE_XL))

    # =====================
    # KPI DASHBOARD
    # =====================

    risk_card = render_metric_card(
        styles=styles,
        title="RISK LEVEL",
        value=label.upper(),
        subtitle="SBM Classification",
        variant=variant,
        width=CARD_WIDTH_SM,
    )

    score_card = render_metric_card(
        styles=styles,
        title="SBM SCORE",
        value=str(score),
        subtitle="Biological",
        variant=variant,
        width=CARD_WIDTH_SM,
    )

    icnirp_card = render_metric_card(
        styles=styles,
        title="ICNIRP",
        value="PASS",
        subtitle="Regulatory",
        variant="success",
        width=CARD_WIDTH_SM,
    )

    status_card = render_metric_card(
        styles=styles,
        title="STATUS",
        value="ACTIVE",
        subtitle="Assessment",
        variant="info",
        width=CARD_WIDTH_SM,
    )

    dashboard = Table(
        [[
            risk_card,
            score_card,
            icnirp_card,
            status_card,
        ]],
        colWidths=[
            CARD_WIDTH_SM,
            CARD_WIDTH_SM,
            CARD_WIDTH_SM,
            CARD_WIDTH_SM,
        ],
    )

    dashboard.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    story.append(dashboard)

   

    story.append(Spacer(1, SPACE_XXL))

    # =====================
    # EXECUTIVE SUMMARY
    # =====================

    summary_text = (
        "This assessment evaluates biological "
        "electromagnetic exposure patterns across "
        "the measured environment using cumulative "
        "RF analysis, environmental field mapping, "
        "and weighted exposure modeling."
    )

    story.append(Paragraph(summary_text, styles["BodyCenter"]))

    story.append(Spacer(1, SPACE_LG))

    render_section_divider(story)

    story.append(PageBreak())
