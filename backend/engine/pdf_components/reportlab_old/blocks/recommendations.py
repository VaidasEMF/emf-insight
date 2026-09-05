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

from engine.analysis.business.recommendations import (
    build_recommendations,
    sort_recommendations,
    group_recommendations,
    render_action_group,
    build_recommendation_card,
)



def render_recommendations_block(
    story,
    analysis,
    styles,
    sections=None,
):

    recommendations = build_recommendations(
        analysis,
    )


    recommendations = sort_recommendations(
        recommendations,
    )

   

    if not recommendations:
        return
    
    print("\n=== FINAL RECOMMENDATIONS ===")

    for i, r in enumerate(recommendations):
        print(i, r)

    recommendations = recommendations[:8]

    grouped = group_recommendations(
        recommendations,
    )

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="RECOMMENDATIONS",
    )

    if False:
        matrix = analysis.get(
            "mitigation",
            [],
        )

        if matrix:

            story.append(
                Paragraph(
                    "Mitigation Priority Matrix",
                    styles["SectionTitle"],
                )
            )

            story.append(
                Spacer(
                    1,
                    SPACE_MD,
                )
            )

            for item in matrix[:5]:

                txt = (
                    f"<b>{item['category']}</b> — "
                    f"{item['text']} "
                    f"(Reduction: {item['reduction']})"
                )

                story.append(
                    Paragraph(
                        f"• {txt}",
                        styles["Body"],
                    )
                )

            story.append(
                Spacer(
                    1,
                    SPACE_LG,
                )
            )

    render_action_group(
        story=story,
        styles=styles,
        title="Priority Actions",
        items=recommendations[:5],
    )

    

    # =====================
    # BUILD CARDS
    # =====================

    for phase, items in grouped.items():

        story.append(
            Spacer(
                1,
                SPACE_MD,
            )
        )

        story.append(
            Paragraph(
                phase,
                styles["SectionTitle"],
            )
        )

        story.append(
            Spacer(
                1,
                SPACE_SM,
            )
        )

        for item in items:

            card = build_recommendation_card(
                styles,
                item,
            )

            story.append(card)

            story.append(
                Spacer(
                    1,
                    SPACE_MD,
                )
            )
