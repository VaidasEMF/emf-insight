from PIL import Image as PILImage
from PIL import ImageDraw


def create_cover_canvas():
    """
    Create Premium Cover canvas.
    """

    width = 1240
    height = 1754

    img = PILImage.new(
        "RGB",
        (width, height),
        "#FFFFFF",
    )

    draw = ImageDraw.Draw(img)

    return img, draw, width, height