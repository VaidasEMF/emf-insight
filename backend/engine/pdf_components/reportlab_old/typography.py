

from reportlab.lib.styles import (
    ParagraphStyle,
)

from reportlab.lib.enums import (
    TA_CENTER,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.typography_tokens import (
    FONT_SMALL,
    FONT_BODY,
    FONT_SECTION,
    FONT_METRIC,
    FONT_HERO,
)

from engine.pdf_components.framework.spacing import (
    SPACE_MD,
    SPACE_XL,
)

# =====================
# REGISTER TYPOGRAPHY
# =====================


def register_styles(
    styles,
    theme=None,
):

    # =====================
    # SAFE THEME
    # =====================

    if theme is None:

        theme = {}

    primary = theme.get(
        "primary",
        PRIMARY,
    )

    text = theme.get(
        "text",
        TEXT,
    )

    subtext = theme.get(
        "subtext",
        SECONDARY_TEXT,
    )

    # =====================
    # REPORT TITLE
    # =====================

    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            fontSize=FONT_HERO,
            leading=42,
            textColor=primary,
            spaceAfter=SPACE_XL,
        )
    )

    # =====================
    # SECTION TITLE
    # =====================

    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            fontSize=FONT_SECTION,
            leading=24,
            textColor=primary,
            spaceAfter=SPACE_MD,
        )
    )

    # =====================
    # CARD TITLE
    # =====================

    styles.add(
        ParagraphStyle(
            name="CardTitle",
            fontSize=FONT_SMALL,
            leading=12,
            textColor=SECONDARY_TEXT,
        )
    )

    # =====================
    # METRIC VALUE
    # =====================

    styles.add(
        ParagraphStyle(
            name="MetricValue",
            fontSize=FONT_METRIC,
            leading=36,
            textColor=text,
            alignment=TA_CENTER,
        )
    )

    # =====================
    # BODY
    # =====================

    styles.add(
        ParagraphStyle(
            name="Body",
            fontSize=FONT_BODY,
            leading=16,
            textColor=text,
        )
    )

    # =====================
    # BODY CENTER
    # =====================

    styles.add(
        ParagraphStyle(
            name="BodyCenter",
            parent=styles["Body"],
            alignment=TA_CENTER,
        )
    )

    # =====================
    # SMALL
    # =====================

    styles.add(
        ParagraphStyle(
            name="Small",
            fontSize=FONT_SMALL,
            leading=12,
            textColor=SECONDARY_TEXT,
        )
    )



    # =====================
    # SUBTITLE
    # =====================

    styles.add(
        ParagraphStyle(
            name="Subtitle",
            fontSize=11,
            leading=18,
            textColor=SECONDARY_TEXT,
        )
    )

    # =====================
    # HERO TITLE
    # =====================

    styles.add(
        ParagraphStyle(
            name="HeroTitle",
            fontSize=FONT_HERO,
            leading=42,
            textColor=primary,
            alignment=TA_CENTER,
        )
    )

    return styles
