import base64
from io import BytesIO

from PIL import Image as PILImage


def load_plan_image(plan_data):
    """
    Load floor plan image from base64 string.

    Returns:
        PIL.Image | None
    """

    if not (
        isinstance(plan_data, str)
        and plan_data.startswith("data:image")
    ):
        return None

    _, encoded = plan_data.split(",", 1)

    return PILImage.open(
        BytesIO(
            base64.b64decode(encoded)
        )
    ).convert("RGB")