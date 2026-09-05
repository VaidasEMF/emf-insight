import os

from PIL import (
    Image as PILImage,
    ImageEnhance,
)

from engine.pdf_components.plan_loader import load_plan_image

from engine.pdf_components.grid import (
    PLAN_WIDTH,
    PLAN_HEIGHT,

)

from engine.pdf_layouts.cover_layout import (
    PLAN_X,
    PLAN_Y,
)

from engine.pdf_components.framework.constants import (
    PAGE_WIDTH,
)

def render_plan(
    img,
    analysis,
):
    """
    Render floor plan with optional heatmap overlay.

    Returns:
        PIL.Image | None
    """

    heatmap_path = analysis.get("heatmap_path")
    plan_data = analysis.get("plan_image")

    plan = load_plan_image(plan_data)

    print("=" * 60)
    print("PLAN RENDERER")
    print("analysis keys:", analysis.keys())

    print("plan_image:", bool(analysis.get("plan_image")))
    print("annotated_plan:", bool(analysis.get("annotated_plan")))
    print("plan_with_rooms:", bool(analysis.get("plan_with_rooms")))
    print("rendered_plan:", bool(analysis.get("rendered_plan")))
    print("=" * 60)

    if plan is None:
        return None

    # --------------------------------------------------
    # Resize
    # --------------------------------------------------

    scale = min(
        PLAN_WIDTH / plan.width,
        PLAN_HEIGHT / plan.height,
    )

    scale *= 0.95

    new_width = int(plan.width * scale)
    new_height = int(plan.height * scale)

    plan = plan.resize(
        (new_width, new_height),
        PILImage.Resampling.LANCZOS,
    )

    # --------------------------------------------------
    # Position
    # --------------------------------------------------

    plan_x = PLAN_X

    plan_y = PLAN_Y

    # --------------------------------------------------
    # Heatmap Overlay
    # --------------------------------------------------

    if (
        heatmap_path
        and os.path.exists(heatmap_path)
    ):

        heatmap = (
            PILImage.open(
                heatmap_path
            )
            .convert("RGBA")
            .resize(plan.size)
        )

        heatmap.putalpha(40)

        plan_rgba = plan.convert("RGBA")
        plan_rgba.alpha_composite(heatmap)

        plan = plan_rgba.convert("RGB")

        # Improve visibility

        plan = ImageEnhance.Contrast(
            plan
        ).enhance(
            1.25
        )

        plan = ImageEnhance.Sharpness(
            plan
        ).enhance(
            1.40
        )

    # --------------------------------------------------
    # Paste
    # --------------------------------------------------

    img.paste(
        plan,
        (
            plan_x,
            plan_y,
        ),
    )

    return {
        "x": plan_x,
        "y": plan_y,
        "width": new_width,
        "height": new_height,
    }