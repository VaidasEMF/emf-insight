from reportlab.lib.styles import (
    ParagraphStyle,
)

from reportlab.platypus import (
    Paragraph,
)

from ..base_card import (
    build_card,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    SUCCESS,
    WARNING,
    DANGER,
    TEXT,
)

from engine.pdf_components.framework.constants import (
    CARD_WIDTH_LG,
)


def render_insight_box(
    styles,
    title,
    items,
    variant="info",
    width=CARD_WIDTH_LG,
):

    if variant == "success":

        accent = SUCCESS

    elif variant == "warning":

        accent = WARNING

    elif variant == "danger":

        accent = DANGER

    else:

        accent = PRIMARY

    title_style = ParagraphStyle(
        "InsightTitle",
        parent=styles["Body"],
        fontSize=11,
        leading=14,
        textColor=accent,
    )

    body_style = ParagraphStyle(
        "InsightBody",
        parent=styles["Body"],
        fontSize=10,
        leading=15,
        textColor=TEXT,
    )

    rows = [

        [
            Paragraph(
                f"<b>{title}</b>",
                title_style,
            )
        ]

    ]

    for item in items:

        rows.append(
            [
                Paragraph(
                    f"• {item}",
                    body_style,
                )
            ]
        )

    return build_card(
        rows=rows,
        width=width,
        accent=accent,
    )