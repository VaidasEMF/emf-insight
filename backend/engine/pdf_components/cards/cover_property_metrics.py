"""
Premium Cover Property Metrics

Dynamic Property Overview metrics used on the
Premium Property Health Report cover.

Cover-specific PNG icons are loaded directly from:

    engine/assets/cover/

Icons:
    coverage.png
    measurements.png
    rooms.png
    zones.png
    floors.png
"""

from pathlib import Path

from PIL import Image

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
)


# ==========================================================
# COVER ICON DIRECTORY
# ==========================================================

COVER_ICON_DIR = (
    Path(__file__).resolve().parents[2]
    / "assets"
    / "cover"
)


# ==========================================================
# LAYOUT
# ==========================================================

CARD_RADIUS = 18

CARD_PADDING = 22

ICON_SIZE = 48

ICON_TEXT_GAP = 14

ROW_HEIGHT = 60

TITLE_TOP = 20

ROW_START_TOP = 62

VALUE_RIGHT_PADDING = 22


# ==========================================================
# ICON LOADER
# ==========================================================

def _load_cover_icon(
    name,
    size=ICON_SIZE,
):
    """
    Load cover-specific PNG icon.

    Location:

        engine/assets/cover/
    """

    path = (
        COVER_ICON_DIR
        / f"{name}.png"
    )

    print(
        f"[COVER ICON] {name}: {path}"
    )

    if not path.exists():

        print(
            f"[COVER ICON] MISSING: {path}"
        )

        return None

    try:

        icon = (
            Image.open(path)
            .convert("RGBA")
        )

        icon.thumbnail(
            (
                size,
                size,
            ),
            Image.Resampling.LANCZOS,
        )

        return icon

    except Exception as exc:

        print(
            f"[COVER ICON] FAILED: "
            f"{path} -> {exc}"
        )

        return None


# ==========================================================
# DRAW ICON
# ==========================================================

def _draw_cover_icon(
    img,
    x,
    y,
    name,
    size=ICON_SIZE,
):
    """
    Draw cover-specific PNG icon.
    """

    icon = _load_cover_icon(
        name=name,
        size=size,
    )

    if icon is None:
        return

    img.paste(
        icon,
        (
            int(round(x)),
            int(round(y)),
        ),
        icon,
    )


# ==========================================================
# DRAW PROPERTY OVERVIEW
# ==========================================================

def draw_cover_property_metrics(
    img,
    draw,
    x,
    y,
    width,
    metrics,
    fonts,
):
    """
    Draw dynamic Property Overview card.

    Metrics:

        Coverage
        Measurements
        Rooms
        Zones
        Floors
    """

    # ======================================================
    # CARD HEIGHT
    # ======================================================

    height = (
        CARD_PADDING * 2
        + 34
        + ROW_HEIGHT * 5
    )

    # ======================================================
    # CARD
    # ======================================================

    draw.rounded_rectangle(
        (
            x,
            y,
            x + width,
            y + height,
        ),
        radius=CARD_RADIUS,
        fill="#FFFFFF",
        outline="#D9E0EA",
        width=2,
    )

    # ======================================================
    # TITLE
    # ======================================================

    draw_text(
        draw=draw,
        x=x + CARD_PADDING,
        y=y + TITLE_TOP,
        text="PROPERTY OVERVIEW",
        font=fonts["subtitle"],
        fill=PRIMARY,
    )

    # ======================================================
    # DATA
    # ======================================================

    items = [

        (
            "coverage",
            "Coverage",
            metrics.get(
                "coverage",
                0,
            ),
        ),

        (
            "measurements",
            "Measurements",
            metrics.get(
                "measurements",
                0,
            ),
        ),

        (
            "rooms",
            "Rooms",
            metrics.get(
                "rooms",
                0,
            ),
        ),

        (
            "zones",
            "Zones",
            metrics.get(
                "zones",
                0,
            ),
        ),

        (
            "floors",
            "Floors",
            metrics.get(
                "floors",
                0,
            ),
        ),
    ]

    # ======================================================
    # ROW START
    # ======================================================

    current_y = (
        y
        + ROW_START_TOP
    )

    # ======================================================
    # ROWS
    # ======================================================

    for index, (
        icon_name,
        label,
        value,
    ) in enumerate(items):

        # --------------------------------------------------
        # ICON
        # --------------------------------------------------

        icon_x = (
            x
            + CARD_PADDING
        )

        icon_y = (
            current_y
            + (
                ROW_HEIGHT
                - ICON_SIZE
            ) / 2
        )

        _draw_cover_icon(
            img=img,
            x=icon_x,
            y=icon_y,
            name=icon_name,
            size=ICON_SIZE,
        )

        # --------------------------------------------------
        # LABEL
        # --------------------------------------------------

        text_x = (
            icon_x
            + ICON_SIZE
            + ICON_TEXT_GAP
        )

        draw_text(
            draw=draw,
            x=text_x,
            y=current_y + ROW_HEIGHT / 2,
            text=label,
            font=fonts["body"],
            fill=TEXT_SECONDARY,
            anchor="lm",
        )

        # --------------------------------------------------
        # VALUE
        # --------------------------------------------------

        draw_text(
            draw=draw,
            x=(
                x
                + width
                - VALUE_RIGHT_PADDING
            ),
            y=current_y + ROW_HEIGHT / 2,
            text=str(value),
            font=fonts["subtitle"],
            fill=PRIMARY,
            anchor="rm",
        )

        # --------------------------------------------------
        # DIVIDER
        # --------------------------------------------------

        if index < len(items) - 1:

            draw.line(
                (
                    x + CARD_PADDING,
                    current_y + ROW_HEIGHT,
                    x + width - CARD_PADDING,
                    current_y + ROW_HEIGHT,
                ),
                fill="#E3E8F0",
                width=1,
            )

        current_y += ROW_HEIGHT

    # ======================================================
    # RETURN
    # ======================================================

    return y + height