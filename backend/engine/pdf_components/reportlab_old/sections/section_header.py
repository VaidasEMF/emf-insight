from reportlab.lib import colors

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    DIVIDER,
)

from engine.pdf_components.framework.constants import (
    CONTENT_WIDTH,
)

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)

def render_section_header(
    story,
    styles,
    number,
    title,
    color=PRIMARY,
):

    # =====================
    # NUMBER BADGE
    # =====================

    badge = Table(
        [[str(number)]],
        colWidths=[24],
        rowHeights=[24],
    )

    badge.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("ROUNDEDCORNERS", [5, 5, 5, 5]),
            ]
        )
    )

    # =====================
    # TITLE
    # =====================

    title_paragraph = Paragraph(
        f"<b>{title}</b>",
        styles["SectionTitle"],
    )

    # =====================
    # HEADER ROW
    # =====================

    row = Table(
        [[badge, title_paragraph]],
        colWidths=[
            30,
            CONTENT_WIDTH - 30,
        ],
    )

    row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    # =====================
    # DIVIDER
    # =====================

    divider = Table(
        [[""]],
        colWidths=[CONTENT_WIDTH],
        rowHeights=[1],
    )

    divider.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), DIVIDER),
            ]
        )
    )

    # =====================
    # APPEND
    # =====================

    story.append(Spacer(1, SPACE_XL))

    story.append(row)

    story.append(Spacer(1, 10))

    story.append(divider)

    story.append(Spacer(1, SPACE_MD))


from reportlab.platypus import (
    Table,
    TableStyle,
)

from engine.pdf_components.framework.colors import (
    DIVIDER,
)

from engine.pdf_components.framework.constants import (
    CONTENT_WIDTH,
)


def render_section_divider(
    story,
):
    """
    Draw simple divider line between sections.
    """

    divider = Table(
        [[""]],
        colWidths=[CONTENT_WIDTH],
        rowHeights=[1],
    )

    divider.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    DIVIDER,
                ),
            ]
        )
    )

    story.append(divider)    