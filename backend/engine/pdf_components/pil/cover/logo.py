import os

from PIL import Image


def draw_logo(
    img,
    x,
    y,
    size,
    logo_path=None,
):
    """
    Draw PHI logo on Premium Cover.

    If logo file does not exist,
    a simple placeholder is drawn.
    """

    if logo_path is None:

        logo_path = os.path.join(
            os.path.dirname(__file__),
            "../../../assets/logo.png",
        )

    try:

        if os.path.exists(logo_path):

            logo = Image.open(logo_path).convert("RGBA")

            logo.thumbnail(
                (size, size),
                Image.LANCZOS,
            )

            px = x + (size - logo.width) // 2
            py = y + (size - logo.height) // 2

            img.paste(
                logo,
                (px, py),
                logo,
            )

            return

    except Exception:

        pass

    # fallback placeholder

    from PIL import ImageDraw

    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle(
        (
            x,
            y,
            x + size,
            y + size,
        ),
        radius=16,
        outline="#D6DCE8",
        width=2,
        fill="white",
    )

    draw.text(
        (
            x + size // 2 - 12,
            y + size // 2 - 10,
        ),
        "PHI",
        fill="#2563EB",
    )