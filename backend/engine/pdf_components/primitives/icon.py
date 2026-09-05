"""
PHI Design System

Universal PNG Icon Renderer
"""

from pathlib import Path

from PIL import Image

from engine.pdf_components.framework.icons import (
    get_icon,
)


def draw_icon(
    img=None,
    x=0,
    y=0,
    icon="",
    size=28,
    draw=None,
    font=None,
    fill=None,
):
    """
    Draw PNG icon.

    `icon` may be either:
    - registered icon name
    - direct PNG file path
    """

    if img is None:
        return

    # ------------------------------------------------------
    # RESOLVE ICON PATH
    # ------------------------------------------------------

    if isinstance(
        icon,
        (str, Path),
    ):

        icon_path = Path(icon)

        # Direct file path
        if icon_path.suffix.lower() == ".png":

            path = icon_path

        # Registered icon name
        else:

            path = get_icon(
                str(icon),
            )

    else:

        path = None

    # ------------------------------------------------------
    # VALIDATE
    # ------------------------------------------------------

    if path is None:

        print(
            f"[ICON] Missing icon: {icon}"
        )

        return

    path = Path(path)

    if not path.exists():

        print(
            f"[ICON] File not found: {path}"
        )

        return

    # ------------------------------------------------------
    # LOAD
    # ------------------------------------------------------

    icon_img = (
        Image.open(path)
        .convert("RGBA")
    )

    # ------------------------------------------------------
    # RESIZE
    # ------------------------------------------------------

    icon_img.thumbnail(
        (
            size,
            size,
        ),
        Image.Resampling.LANCZOS,
    )

    # ------------------------------------------------------
    # DRAW
    # ------------------------------------------------------

    img.paste(
        icon_img,
        (
            int(round(x)),
            int(round(y)),
        ),
        icon_img,
    )