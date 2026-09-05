from engine.pdf_components.framework.colors import (
    PRIMARY,
    SECONDARY_TEXT,
)

from engine.pdf_components.framework.typography import (
    draw_center_text,
)

from engine.pdf_components.utils import (
    draw_png_icon,
)

from engine.pdf_components.framework.theme import (
    KPI_ICON_SIZE,
)


ICON_TOP = -4

TITLE_GAP = 8

SUBTITLE_GAP = 6

BOTTOM_PADDING = 8


def draw_metric_value(
    draw,
    img,
    x_center,
    y,
    value,
    subtitle="",
    icon=None,
    accent=PRIMARY,
    fonts=None,
):
    """
    Draw metric icon, value and subtitle.

    Icon is optional.
    Value and subtitle are always rendered.
    """

    value_font = fonts["kpi_value"]

    subtitle_font = fonts["caption"]

    current_y = y + ICON_TOP

    # ======================================================
    # ICON
    # ======================================================

    if icon:

        icon_size = KPI_ICON_SIZE

        draw_png_icon(
            img=img,
            icon_file=icon,
            x=int(
                x_center
                - icon_size / 2
            ),
            y=int(current_y),
            size=icon_size,
        )

        current_y += (
            icon_size
            + TITLE_GAP
        )

    # ======================================================
    # VALUE
    # ======================================================

    draw_center_text(
        draw=draw,
        x_center=x_center,
        y=current_y,
        text=str(value),
        font=value_font,
        fill=accent,
    )

    current_y += (
        value_font.size
        + 10
    )

    # ======================================================
    # SUBTITLE
    # ======================================================

    if subtitle:

        draw_center_text(
            draw=draw,
            x_center=x_center,
            y=current_y,
            text=subtitle,
            font=subtitle_font,
            fill=SECONDARY_TEXT,
        )

        current_y += (
            subtitle_font.size
            + SUBTITLE_GAP
        )

    # ======================================================
    # RETURN
    # ======================================================

    return (
        current_y
        + BOTTOM_PADDING
    )