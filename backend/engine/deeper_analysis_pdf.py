
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


SECTION_DEFINITIONS = [
    ("assessment_overview", "1. Assessment Overview"),
    ("measurement_summary", "2. Measurement Summary"),
    ("lifestyle_area_analysis", "3. Lifestyle Area Analysis"),
    ("exposure_context", "4. Exposure & Context"),
    ("risk_confidence", "5. Risk & Confidence"),
    ("prioritised_recommendations", "6. Prioritised Recommendations"),
    ("assessment_limitations", "7. Assessment Limitations"),
]


def _format_label(value):
    return str(value).replace("_", " ").title()


def _format_value(value):
    if value is None:
        return "Not available"

    if isinstance(value, bool):
        return "Yes" if value else "No"

    if isinstance(value, float):
        return f"{value:g}"

    return str(value)


def _render_value(value, styles, depth=0):
    elements = []

    if isinstance(value, dict):
        if not value:
            return [Paragraph("None", styles["BodyText"])]

        for key, item in value.items():
            label = escape(_format_label(key))

            elements.append(
                Paragraph(label, styles["FieldLabel"])
            )

            elements.extend(
                _render_value(item, styles, depth + 1)
            )

            elements.append(Spacer(1, 4))

        return elements

    if isinstance(value, list):
        if not value:
            return [Paragraph("None", styles["BodyText"])]

        for item in value:
            elements.append(
                Paragraph("&bull;", styles["Bullet"])
            )

            elements.extend(
                _render_value(item, styles, depth + 1)
            )

            elements.append(Spacer(1, 5))

        return elements

    text = escape(_format_value(value))

    return [
        Paragraph(text, styles["BodyText"])
    ]


def _draw_footer(canvas, doc):
    canvas.saveState()

    canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
    canvas.line(
        20 * mm,
        15 * mm,
        A4[0] - 20 * mm,
        15 * mm,
    )

    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))

    canvas.drawString(
        20 * mm,
        10 * mm,
        "EMF INSIGHT | DEEPER UNDERSTANDING",
    )

    canvas.drawRightString(
        A4[0] - 20 * mm,
        10 * mm,
        f"Page {doc.page}",
    )

    canvas.restoreState()


def build_deeper_analysis_pdf(report_data):
    """
    Generate a PDF from one saved HomeDeeperAnalysis report.

    Does not recalculate measurements, risk or recommendations.
    """

    if not isinstance(report_data, dict):
        raise ValueError("Invalid Deeper Analysis report data")

    analysis = report_data.get("analysis") or {}
    sections = analysis.get("sections")

    if not isinstance(sections, dict):
        raise ValueError("Analysis sections are unavailable")

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=22 * mm,
        title="EMF Insight - Deeper Understanding",
        author="EMF Insight",
    )

    base_styles = getSampleStyleSheet()

    styles = {
        "Title": ParagraphStyle(
            "DeeperTitle",
            parent=base_styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=23,
            leading=29,
            textColor=colors.HexColor("#0f172a"),
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "Subtitle": ParagraphStyle(
            "DeeperSubtitle",
            parent=base_styles["Normal"],
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#0d9488"),
            alignment=TA_CENTER,
            spaceAfter=18,
        ),
        "Section": ParagraphStyle(
            "DeeperSection",
            parent=base_styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#0f766e"),
            spaceBefore=14,
            spaceAfter=10,
            keepWithNext=True,
        ),
        "FieldLabel": ParagraphStyle(
            "DeeperFieldLabel",
            parent=base_styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#475569"),
            spaceBefore=5,
            spaceAfter=2,
        ),
        "BodyText": ParagraphStyle(
            "DeeperBody",
            parent=base_styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=14,
            textColor=colors.HexColor("#1e293b"),
        ),
        "Bullet": ParagraphStyle(
            "DeeperBullet",
            parent=base_styles["BodyText"],
            fontSize=9,
            textColor=colors.HexColor("#0d9488"),
            leftIndent=8,
        ),
    }

    story = []

    # --------------------------------------------------
    # REPORT COVER / METADATA
    # --------------------------------------------------

    analysis_type = (
        "Follow-up Analysis"
        if report_data.get("credit_used") == "home_deeper_repeat"
        else "Initial Analysis"
    )

    cycle_number = report_data.get(
        "measurement_cycle_number"
    ) or 1

    analysis_id = report_data.get("analysis_id", "N/A")
    coverage = report_data.get("coverage_percent")

    created_at = report_data.get("created_at")

    story.append(Spacer(1, 22 * mm))

    story.append(
        Paragraph(
            "EMF INSIGHT",
            styles["Subtitle"],
        )
    )

    story.append(
        Paragraph(
            "DEEPER UNDERSTANDING",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            escape(
                f"{analysis_type} - Measurement Cycle {cycle_number}"
            ),
            styles["Subtitle"],
        )
    )

    metadata = [
        ["Analysis ID", _format_value(analysis_id)],
        ["Measurement Cycle", _format_value(cycle_number)],
        ["Coverage", (
            f"{_format_value(coverage)}%"
            if coverage is not None
            else "Not available"
        )],
        ["Report Date", _format_value(created_at)],
    ]

    metadata_table = Table(
        metadata,
        colWidths=[55 * mm, 85 * mm],
    )

    metadata_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#334155")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )

    story.append(metadata_table)
    story.append(Spacer(1, 15 * mm))

    story.append(
        Paragraph(
            "Your measurement-based analysis and "
            "personalised recommendations.",
            styles["BodyText"],
        )
    )

    # --------------------------------------------------
    # SEVEN ANALYSIS SECTIONS
    # --------------------------------------------------

    for section_key, section_title in SECTION_DEFINITIONS:
        story.append(
            Paragraph(
                escape(section_title),
                styles["Section"],
            )
        )

        section_data = sections.get(section_key)

        if section_data is None:
            section_data = "Not available"

        story.extend(
            _render_value(section_data, styles)
        )

        story.append(Spacer(1, 8))

    # --------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------

    doc.build(
        story,
        onFirstPage=_draw_footer,
        onLaterPages=_draw_footer,
    )

    buffer.seek(0)

    return buffer.getvalue()
