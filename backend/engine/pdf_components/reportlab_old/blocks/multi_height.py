# =====================
# MULTI HEIGHT BLOCK
# =====================

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from reportlab.lib import colors

from reportlab.platypus import (
    Paragraph,
    Spacer,
)

from engine.pdf_components.reportlab.sections.section_header import render_section_header

from engine.pdf_components.framework.spacing import (
    SPACE_SM,
    SPACE_MD,
    SPACE_LG,
    SPACE_XL,
)
# =====================
# COMPUTE HEIGHT DATA
# =====================
def compute_height_summary(points):

    heights = {30: [], 80: [], 120: []}

    for p in points:

        m = p.get("m", {})

        h = m.get("height", 120)

        rf = m.get("rf", 0)

        if h in heights:
            heights[h].append(rf)

    result = {}

    for h, vals in heights.items():

        if vals:
            result[h] = sum(vals) / len(vals)
        else:
            result[h] = 0

    return result


# =====================
# LABEL
# =====================
def get_height_label(height):

    if height == 30:
        return "Sleeping / Child"

    elif height == 80:
        return "Seated"

    else:
        return "Standing"


# =====================
# RENDER
# =====================


def render_multi_height_block(
    story,
    analysis,
    styles,
    sections=None,
):
    """
    Reserved for future multi-height analysis.
    """

    return
