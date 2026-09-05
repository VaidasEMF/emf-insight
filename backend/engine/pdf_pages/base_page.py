"""
PHI PDF Design System

Base PDF Page
"""

import os

from dataclasses import dataclass

from reportlab.platypus import (
    PageBreak,
)

from engine.pdf_components.pil.canvas import (
    create_cover_canvas,
)

from engine.pdf_components.framework.fonts import (
    load_cover_fonts,
)

from engine.pdf_components.save_cover import (
    save_cover,
)



from engine.pdf_components.pil.footer.footer import (
    draw_report_footer,
)


# ==========================================================
# PAGE CONTEXT
# ==========================================================


@dataclass
class PageContext:

    img: object
    draw: object
    fonts: dict
    page_path: str

    page_number: int
    total_pages: int    


# ==========================================================
# OUTPUT
# ==========================================================


def get_output_path(
    filename,
):
    """
    Output PNG path.
    """

    output_dir = os.path.join(
        os.path.dirname(__file__),
        "../../output",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    return os.path.join(
        output_dir,
        filename,
    )


# ==========================================================
# CREATE PAGE
# ==========================================================



def create_page(
    *,
    filename,
    page_number=1,
    total_pages=1,
):
    """
    Create new page.
    """

    img, draw, _, _ = create_cover_canvas()

    fonts = load_cover_fonts()

    return PageContext(

        img=img,
        draw=draw,
        fonts=fonts,

        page_path=get_output_path(filename),

        page_number=page_number,
        total_pages=total_pages,
    )


# ==========================================================
# FINISH PAGE
# ==========================================================



def finish_page(
    ctx,
    story,
    project,
    analysis,
):
    """
    Finish page.
    """
    print(">>> FINISH_PAGE START", ctx.page_path)
    print("ASSESSMENT PAGE FINISH")

 

    draw_report_footer(
        draw=ctx.draw,
        fonts=ctx.fonts,
    )

    save_cover(

        img=ctx.img,

        cover_path=ctx.page_path,

        story=story,

    )

    story.append(
        PageBreak(),
    )

    print(">>> STORY AFTER PAGEBREAK =", len(story))