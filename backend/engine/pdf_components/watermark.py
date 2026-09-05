from reportlab.lib.colors import Color

# =====================
# WATERMARK
# =====================


def draw_watermark(
    canvas,
    text="PREVIEW",
):

    canvas.saveState()

    canvas.setFont(
        "Helvetica-Bold",
        60,
    )

    canvas.setFillColor(
        Color(
            0.7,
            0.7,
            0.7,
            alpha=0.15,
        )
    )

    canvas.translate(
        300,
        400,
    )

    canvas.rotate(
        45,
    )

    canvas.drawCentredString(
        0,
        0,
        text,
    )

    canvas.restoreState()
