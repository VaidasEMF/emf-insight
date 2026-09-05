# =====================
# HEATMAP BLOCK
# =====================

import os

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Image,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)

from engine.pdf_layouts.layouts import (
    two_col,
)


from engine.pdf_components.reportlab.sections.section_header import (
    render_section_header,
)

from engine.pdf_components.reportlab.cards.insights.heatmap_card import (
    render_heatmap_card,
)

from engine.pdf_components.reportlab.legends.risk_legend import (
    render_risk_legend,
)

from engine.pdf_components.pil.heatmap.heatmap_generator import (
    generate_heatmap_images,
)

from engine.analysis.common.heatmap.heatmap_stats import (
    build_heatmap_statistics,
)

from engine.analysis.common.property.heatmap_observations import (
    build_heatmap_observations,
)


# =====================
# RENDER
# =====================


def render_heatmap_block(
    story,
    analysis,
    styles,
    sections=None,
):  
    
    

    print("🔥 HEATMAP BLOCK START")

    points = analysis.get(
        "points_before",
        [],
    )

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="EXPOSURE OVERVIEW",
    )

    # =====================
    # OUTPUT DIR
    # =====================

    output_dir = os.path.join(
        os.path.dirname(__file__),
        "../../output",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    stats = build_heatmap_statistics(
        points,
    )

    

    sbm_path, icnirp_path = generate_heatmap_images(
        analysis=analysis,
        points=points,
        output_dir=output_dir,
    )

   
    # =====================
    # REPORTLAB IMAGES
    # =====================



    img1 = Image(
        sbm_path,
        width=240,
        height=185,
    )

    img2 = Image(
        icnirp_path,
        width=240,
        height=185,
    )


    # =====================
    # SUMMARY
    # =====================

    score = round(
        analysis.get(
            "summary",
            {},
        ).get(
            "score",
            0,
        )
    )

    risk = analysis.get(
        "summary",
        {},
    ).get(
        "label",
        "Unknown",
    )

    heatmap_summary = build_heatmap_observations(
        analysis,
    )

    worst_room = heatmap_summary["worst_room"]

    observations = heatmap_summary["observations"]

    # =====================
    # CARDS
    # =====================

    sbm_card = render_heatmap_card(
        image=img1,
        title="SBM (Primary) — 120 cm",
        score=score,
        risk=risk,
        worst_area=worst_room,
        height_label="120 cm",
    )

    icnirp_card = render_heatmap_card(
        image=img2,
        title="ICNIRP (Regulatory) — 120 cm",
        score=score,
        risk="Regulatory",
        worst_area=worst_room,
        height_label="120 cm",
    )

    # =====================
    # GRID
    # =====================

    layout = two_col(
        sbm_card,
        icnirp_card,
    )

    story.append(layout)

    

    # =====================
    # LEGEND
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    legend = render_risk_legend(
        styles,
    )


    # =====================
    # EXPOSURE INSIGHTS
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            "<b>KEY INSIGHTS</b>",
            styles["Body"],
        )
    )


    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            "<b>WHAT THIS MEANS</b>",
            styles["Body"],
        )
    )

    story.append(
        Spacer(
            1,
            6,
        )
    )

    story.append(
        Paragraph(
            (
                f"The assessment indicates that the highest "
                f"exposure levels were recorded in {worst_room}. "
                f"The heatmaps reveal how exposure is distributed "
                f"throughout the environment and help identify "
                f"areas where mitigation efforts may provide "
                f"the greatest benefit."
            ),
            styles["Body"],
        )
    )

    for item in observations:

        story.append(
            Paragraph(
                item,
                styles["Body"],
            )
        )  

    # =====================
    # HEATMAP STATS
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            (
                f"<b>RF</b> Avg: {stats['avg_rf']:.1f} | Max: {stats['max_rf']:.1f}<br/>"
                f"<b>Electric</b> Avg: {stats['avg_electric']:.1f} | Max: {stats['max_electric']:.1f}<br/>"
                f"<b>Magnetic</b> Avg: {stats['avg_magnetic']:.1f} | Max: {stats['max_magnetic']:.1f}"
            ),
            styles["Body"],
        )
    )
    

    print("✅ HEATMAP BLOCK FINISHED")
