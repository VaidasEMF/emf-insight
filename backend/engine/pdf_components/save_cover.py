from reportlab.lib.pagesizes import A4
from reportlab.platypus import Image


def save_cover(
    img,
    cover_path,
    story,
):
    """
    Save cover image and append it to PDF.
    """

    img.save(cover_path)

    page_w, page_h = A4

    story.append(
        Image(
            cover_path,
            width=page_w - 20,
            height=page_h - 20,
        )
    )