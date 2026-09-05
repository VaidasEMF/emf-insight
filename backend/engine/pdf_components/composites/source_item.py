"""
PHI Design System

Source Item Composite

Dynamic EMF source row used by:

- Property Overview
- Room Analysis
- Source Analysis
- Recommendations
"""

from pathlib import Path

from PIL import Image

from engine.pdf_components.framework.typography import (
    draw_text,
)

from engine.pdf_components.framework.colors import (
    PRIMARY,
    TEXT_SECONDARY,
    DANGER,
    WARNING,
    SUCCESS,
)


# ==========================================================
# DYNAMIC LAYOUT
# ==========================================================

ICON_SIZE = 44
ICON_GAP = 12

NUMBER_SIZE = 30
NUMBER_GAP = 8

STATUS_RIGHT_PADDING = 4
STATUS_WIDTH = 42
STATUS_GAP = 4

TITLE_SUBTITLE_GAP = 4

ROW_TOP_PADDING = 4
ROW_BOTTOM_PADDING = 12

MIN_ROW_HEIGHT = 48


# ==========================================================
# TEXT HELPERS
# ==========================================================

def _text_width(
    draw,
    text,
    font,
):
    if not text:
        return 0

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    return (
        bbox[2]
        - bbox[0]
    )


def _truncate_text(
    draw,
    text,
    font,
    max_width,
):
    if not text:
        return ""

    if _text_width(
        draw,
        text,
        font,
    ) <= max_width:
        return text

    suffix = "..."

    candidate = text

    while len(candidate) > 1:

        candidate = candidate[:-1]

        test = (
            candidate
            + suffix
        )

        if _text_width(
            draw,
            test,
            font,
        ) <= max_width:
            return test

    return suffix


# ==========================================================
# FLOOR SOURCE ICONS
# ==========================================================

FLOOR_ICON_DIR = (
    Path(__file__).resolve().parents[2]
    / "assets"
    / "floors"
)


def _load_floor_icon(
    name,
    size=ICON_SIZE,
):
    """
    Load dynamic floor/source icon.

    Primary:

        assets/floors/wifi_primary.png

    Fallback:

        assets/floors/wifi.png
    """

    if not name:
        return None

    name = str(
        name
    ).strip().lower()

    # ------------------------------------------------------
    # PRIMARY
    # ------------------------------------------------------

    path = (
        FLOOR_ICON_DIR
        / f"{name}_primary.png"
    )

    # ------------------------------------------------------
    # FALLBACK
    # ------------------------------------------------------

    if not path.exists():

        path = (
            FLOOR_ICON_DIR
            / f"{name}.png"
        )

    # ------------------------------------------------------
    # DEBUG
    # ------------------------------------------------------

    print(
        f"[FLOOR ICON] {name} -> {path}"
    )

    if not path.exists():

        print(
            f"[FLOOR ICON] MISSING: {path}"
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
            f"[FLOOR ICON] ERROR: "
            f"{path}: {exc}"
        )

        return None


def _draw_floor_icon(
    img,
    x,
    y,
    name,
    size=ICON_SIZE,
):
    """
    Draw dynamic floor/source icon.
    """

    icon = _load_floor_icon(
        name=name,
        size=size,
    )

    if icon is None:
        return False

    img.paste(
        icon,
        (
            int(x),
            int(y),
        ),
        icon,
    )

    return True


# ==========================================================
# SOURCE NUMBER
# ==========================================================

def _draw_source_number(
    draw,
    x,
    y,
    number,
    font,
):
    """
    Draw source number inside a dark blue circle.
    """

    draw.ellipse(
        (
            x,
            y,
            x + NUMBER_SIZE,
            y + NUMBER_SIZE,
        ),
        fill="#0F2147",
    )

    draw_text(
        draw=draw,
        x=x + NUMBER_SIZE / 2,
        y=y + NUMBER_SIZE / 2,
        text=str(number),
        font=font,
        fill="#FFFFFF",
        anchor="mm",
    )


# ==========================================================
# DRAW
# ==========================================================

def draw_source_item(
    img,
    draw,
    x,
    y,
    width,
    source,
    fonts,
    number=None,
):
    """
    Draw one dynamic EMF source row.

    Layout:

        NUMBER   ICON   TITLE             STATUS
                        SUBTITLE

    Height is calculated from actual content.
    """

    title_font = fonts["small"]

    small_font = fonts["small"]

    number_font = fonts["caption"]

    # ======================================================
    # SOURCE DATA
    # ======================================================

    title = str(
        source.get(
            "title",
            "-",
        )
    )

    subtitle = str(
        source.get(
            "subtitle",
            "",
        )
    )

    room = str(
        source.get(
            "room",
            "",
        )
    )

    status = str(
        source.get(
            "status",
            "",
        )
    )

    # ------------------------------------------------------
    # ROOM
    # ------------------------------------------------------

    if room:

        if subtitle:

            subtitle = (
                f"{subtitle} • {room}"
            )

        else:

            subtitle = room

    # ======================================================
    # TEXT WIDTH
    # ======================================================

    

    text_width = max(
        60,
        width
        - NUMBER_SIZE
        - NUMBER_GAP
        - ICON_SIZE
        - ICON_GAP
        - STATUS_WIDTH
        - STATUS_GAP
        - STATUS_RIGHT_PADDING,
    )

    # ======================================================
    # TITLE
    # ======================================================

    title = _truncate_text(
        draw=draw,
        text=title,
        font=title_font,
        max_width=text_width,
    )

    # ======================================================
    # SUBTITLE
    # ======================================================

    subtitle = _truncate_text(
        draw=draw,
        text=subtitle,
        font=small_font,
        max_width=text_width,
    )

    # ======================================================
    # TEXT HEIGHT
    # ======================================================

    title_height = max(
        title_font.size,
        1,
    )

    subtitle_height = (
        small_font.size
        if subtitle
        else 0
    )

    # ======================================================
    # ROW HEIGHT
    # ======================================================

    text_height = (
        title_height
        + (
            TITLE_SUBTITLE_GAP
            + subtitle_height
            if subtitle
            else 0
        )
    )

    content_height = max(
        ICON_SIZE,
        text_height,
    )

    row_height = max(
        MIN_ROW_HEIGHT,
        ROW_TOP_PADDING
        + content_height
        + ROW_BOTTOM_PADDING,
    )

    

    # ======================================================
    # CONTENT Y
    # ======================================================

    content_y = (
        y
        + (
            row_height
            - content_height
        ) / 2
    )

    # ======================================================
    # NUMBER
    # ======================================================

    if number is not None:

        number_x = x

        number_y = (
            y
            + (
                row_height
                - NUMBER_SIZE
            ) / 2
        )

        _draw_source_number(
            draw=draw,
            x=number_x,
            y=number_y,
            number=number,
            font=number_font,
        )


    # ======================================================
    # ICON + TEXT POSITION
    # ======================================================

    icon_x = (
        x
        + NUMBER_SIZE
        - 30
    )

    icon_y = (
        y
        + (
            row_height
            - ICON_SIZE
        ) / 2
    )

    text_x = (
        icon_x
        + ICON_SIZE
        + 8
    )


    # ======================================================
    # ICON
    # ======================================================

    _draw_floor_icon(
        img=img,
        x=icon_x,
        y=icon_y,
        name=source.get(
            "icon",
            "",
        ),
        size=ICON_SIZE,
    )


    # ======================================================
    # TITLE
    # ======================================================

    title_y = (
        y
        + (
            row_height
            - title_height
        ) / 2
    )

    draw_text(
        draw=draw,
        x=text_x,
        y=title_y,
        text=title,
        font=title_font,
        fill=PRIMARY,
    )


    # ======================================================
    # SUBTITLE
    # ======================================================

    if subtitle:

        subtitle_y = (
            title_y
            + title_height
            + TITLE_SUBTITLE_GAP
        )

        draw_text(
            draw=draw,
            x=text_x,
            y=subtitle_y,
            text=subtitle,
            font=small_font,
            fill=TEXT_SECONDARY,
        )


    # ======================================================
    # STATUS
    # ======================================================

    if status:

        status_colors = {
            "High": DANGER,
            "Moderate": WARNING,
            "Low": SUCCESS,
        }

        status_color = status_colors.get(
            status,
            TEXT_SECONDARY,
        )

        draw_text(
            draw=draw,
            x=(
                x
                + width
                - STATUS_RIGHT_PADDING
            ),
            y=title_y,
            text=status,
            font=small_font,
            fill=status_color,
            anchor="ra",
        )


    # ======================================================
    # RETURN
    # ======================================================

    return y + row_height