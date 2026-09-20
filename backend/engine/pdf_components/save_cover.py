from reportlab.lib.pagesizes import A4
from reportlab.platypus import Image

from PIL import Image as PILImage



def save_cover(
    img,
    cover_path,
    story,
):
    """
    Save cover image and append it to PDF.
    """

    print(
        ">>> SOURCE IMG:",
        img.size,
        "PATH:",
        cover_path,
        flush=True,
    )

    img.save(cover_path)

    check = PILImage.open(cover_path)

    print(
        ">>> PDF IMAGE:",
        cover_path,
        "SIZE:",
        check.size,
        flush=True,
    )

    page_w, page_h = A4

    pdf_image = Image(
        cover_path,
        width=page_w - 20,
        height=page_h - 20,
    )

    print(
        ">>> REPORTLAB IMAGE:",
        pdf_image.__dict__,
        flush=True,
    )

    story.append(pdf_image)