"""
Heatmap Generator

Generates SBM and ICNIRP heatmap images
used throughout the PDF report.
"""

import base64
import io
import os

from PIL import Image as PILImage

from engine.analysis.heatmap.heatmap import (
    render_heatmap,
)

from engine.analysis.common.helpers.score_helpers import (
    normalize_sbm,
    normalize_icnirp,
)


def _load_base_image(
    plan_image,
    width=700,
    height=520,
):
    """
    Load floor plan image.

    Supports:
        - base64 image
        - local file
        - blank canvas fallback
    """

    if isinstance(plan_image, str):

        # -------------------------------------------------
        # BASE64
        # -------------------------------------------------

        if plan_image.startswith("data:image"):

            _, encoded = plan_image.split(",", 1)

            image_data = base64.b64decode(encoded)

            return (
                PILImage
                .open(io.BytesIO(image_data))
                .convert("RGBA")
            )

        # -------------------------------------------------
        # FILE
        # -------------------------------------------------

        if os.path.exists(plan_image):

            return (
                PILImage
                .open(plan_image)
                .convert("RGBA")
            )

    # -------------------------------------------------
    # FALLBACK
    # -------------------------------------------------

    return PILImage.new(
        "RGBA",
        (width, height),
        (255, 255, 255),
    )


def generate_heatmap_images(
    analysis,
    points,
    width=700,
    height=520,
):
    """
    Generate SBM and ICNIRP heatmap images.

    Returns
    -------
    tuple[PIL.Image.Image, PIL.Image.Image]
        (sbm_image, icnirp_image)
    """

    rooms = analysis.get(
        "rooms",
        [],
    )

    zones = analysis.get(
        "zones",
        [],
    )

    sources = analysis.get(
        "sources",
        [],
    )

    base = _load_base_image(
        analysis.get("plan_image"),
    )

    # =====================================================
    # SBM
    # =====================================================

    img_sbm, _, _ = render_heatmap(
        base.copy(),
        points,
        normalize_sbm,
        rooms=rooms,
        zones=zones,
        sources=sources,
      
    )

    # =====================================================
    # ICNIRP
    # =====================================================

    img_icnirp, _, _ = render_heatmap(
        base.copy(),
        points,
        normalize_icnirp,
        rooms=rooms,
        zones=zones,
        sources=sources,
       
    )

    return (
        img_sbm,
        img_icnirp,
    )