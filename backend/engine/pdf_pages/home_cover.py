"""
Home Premium PDF Cover

Home-specific cover renderer.

This renderer intentionally does not use the Business
summary or property overview builders.
"""

import os

from engine.pdf_components.pil.canvas import (
    create_cover_canvas,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)

from engine.pdf_components.pil.cover.left_panel import (
    draw_cover_left_panel,
)

from engine.pdf_components.pil.footer.footer import (
    draw_cover_footer,
)

from engine.pdf_components.save_cover import (
    save_cover,
)


def render_home_cover(
    story,
    project,
    analysis,
    presentation,
    user=None,
):
    """
    Render the Home Premium PDF cover.

    Home-specific presentation is used instead of
    Business measurement-oriented builders.
    """

    # ------------------------------------------------------
    # OUTPUT
    # ------------------------------------------------------

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
        "home_premium_cover.png",
    )

    # ------------------------------------------------------
    # CANVAS
    # ------------------------------------------------------

    img, draw, width, height = (
        create_cover_canvas()
    )

    # ------------------------------------------------------
    # FONTS
    # ------------------------------------------------------

    fonts = load_cover_fonts()

    # ------------------------------------------------------
    # LEFT PANEL
    # ------------------------------------------------------

    draw_cover_left_panel(
        draw=draw,
        width=width,
        height=height,
        project=project,
        analysis=analysis,
        fonts=fonts,
    )

    # ------------------------------------------------------
    # FINISH
    # ------------------------------------------------------

    save_cover(
        img=img,
        cover_path=cover_path,
        story=story,
    )