import os


from engine.pdf_components.pil.canvas import (
    create_cover_canvas,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)

from engine.pdf_components.cards.cover_property_score import (
    draw_cover_property_score,
)

from engine.pdf_components.pil.cover.left_panel import (
    draw_cover_left_panel,
)

from engine.pdf_components.pil.footer.footer import (
    draw_cover_footer,
)

from engine.pdf_components.framework.colors import (
    SUCCESS,
    WARNING,
    DANGER,
)

from engine.pdf_components.save_cover import (
    save_cover,
)

from engine.pdf_layouts.cover_layout import (
    SCORE_X,
    SCORE_Y,
    SCORE_WIDTH,
    SCORE_HEIGHT,
)

from engine.pdf_components.cards.cover_plan import (
    draw_cover_plan,
)

from engine.analysis.common.summary.summary_builder import (
    build_summary,
)

from engine.pdf_components.cards.cover_property_metrics import (
    draw_cover_property_metrics,
)

from engine.analysis.common.property.property_overview_builder import (
    build_property_overview,
)


# ==========================================================
# RENDER COVER
# ==========================================================

def render_cover(
    story,
    project,
    analysis,
    user=None,
):

    # ======================================================
    # OUTPUT
    # ======================================================

    output_dir = os.path.join(
        os.path.dirname(__file__),
        "../../output",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    cover_path = os.path.join(
        output_dir,
        "premium_cover.png",
    )

    # ======================================================
    # SUMMARY
    # ======================================================

    summary = build_summary(
        analysis,
    )

    # ======================================================
    # PROPERTY SCORE
    # ======================================================

    score = summary.get(
        "score",
        0,
    )

    risk = summary.get(
        "label",
        "Unknown",
    )

    hero_color = summary.get(
        "color",
        DANGER,
    )

    # ======================================================
    # HERO COLOR
    # ======================================================

    if score >= 80:

        hero_color = SUCCESS

    elif score >= 60:

        hero_color = WARNING

    else:

        hero_color = DANGER

    # ======================================================
    # PROPERTY OVERVIEW MODEL
    # ======================================================

    property_model = build_property_overview(
        analysis,
    )

    if not isinstance(
        property_model,
        dict,
    ):
        property_model = {}

    property_metrics = property_model.get(
        "property_metrics",
        {},
    )

    if not isinstance(
        property_metrics,
        dict,
    ):
        property_metrics = {}

   

    # ======================================================
    # CANVAS
    # ======================================================

    img, draw, width, height = (
        create_cover_canvas()
    )

    # ======================================================
    # FONTS
    # ======================================================

    fonts = load_cover_fonts()

    # ======================================================
    # LEFT PANEL
    # ======================================================

    draw_cover_left_panel(
        draw=draw,
        width=width,
        height=height,
        project=project,
        analysis=analysis,
        fonts=fonts,
    )

    # ======================================================
    # PROPERTY SCORE
    # ======================================================

    draw_cover_property_score(
        draw=draw,
        img=img,

        x=SCORE_X,
        y=SCORE_Y,

        width=SCORE_WIDTH,
        height=SCORE_HEIGHT,

        title="PROPERTY SCORE",

        score=score,

        risk=risk,

        subtitle="RF EXPOSURE",

        fill=hero_color,

        fonts=fonts,
    )

    # ======================================================
    # PROPERTY OVERVIEW
    # ======================================================

    draw_cover_property_metrics(
        img=img,
        draw=draw,

        x=625,
        y=55,

        width=475,

        metrics=property_metrics,

        fonts=fonts,
    )

    # ======================================================
    # PROPERTY PLAN
    # ======================================================

    draw_cover_plan(
        img=img,
        analysis=analysis,
    )

    # ======================================================
    # FOOTER
    # ======================================================

    draw_cover_footer(
        draw=draw,
        project=project,
        analysis=analysis,
        fonts=fonts,
    )

    # ======================================================
    # SAVE
    # ======================================================

    save_cover(
        img=img,
        cover_path=cover_path,
        story=story,
    )