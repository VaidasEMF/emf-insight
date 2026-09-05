# =====================
# HEATMAP MODULE
# =====================

"""
Atsakingas už:

✔ heatmap generavimą
✔ smooth gaussian
✔ permatomą overlay
✔ source influence
✔ zonų overlay
"""

print(
    "HEATMAP FUNCTION CALLED"
)

# =====================
# IMPORTS
# =====================

import numpy as np

from PIL import (
    Image as PILImage,
    ImageDraw,
)

from scipy.ndimage import gaussian_filter

import matplotlib.pyplot as plt

plt.set_cmap("RdYlGn_r")


# =====================
# COLOR
# =====================


def get_color(v):

    # =====================
    # LOW
    # =====================

    if v < 0.32:

        return (
            34,
            197,
            94,
            60,
        )

    # =====================
    # MODERATE
    # =====================

    elif v < 0.5:

        return (
            250,
            204,
            21,
            90,
        )

    # =====================
    # HIGH
    # =====================

    elif v < 0.75:

        return (
            249,
            115,
            22,
            125,
        )

    # =====================
    # VERY HIGH
    # =====================

    return (
        220,
        38,
        38,
        155,
    )

def render_heatmap(
    base_image,
    points,
    risk_fn,
    rooms=None,
    zones=None,
    sources=None,
    width=700,
    height=520,
):
   

    rooms = rooms or []
    zones = zones or []
    sources = sources or []
    points = points or []

   

    # =====================================================
    # ROOM GEOMETRY DEBUG
    # =====================================================

    if rooms:

        print(
            "ROOM MAX X:",
            max(
                p.get("x", 0)
                for r in rooms
                for p in r.get("polygon", [])
            ),
        )

        print(
            "ROOM MAX Y:",
            max(
                p.get("y", 0)
                for r in rooms
                for p in r.get("polygon", [])
            ),
        )

    # =====================================================
    # SAFE IMAGE
    # =====================================================

    scale = 1
    offset_x = 0
    offset_y = 0

    crop_x = 0
    crop_y = 0

    if (
        base_image is None
        or not hasattr(
            base_image,
            "convert",
        )
    ):

        print(
            "⚠ Invalid base image"
        )

        base = PILImage.new(
            "RGBA",
            (
                width,
                height,
            ),
            (
                255,
                255,
                255,
                255,
            ),
        )

    else:

        # =================================================
        # ORIGINAL BASE
        # =================================================

        base = base_image.convert(
            "RGBA"
        )

        original_w, original_h = (
            base.size
        )

        print(
            "BASE SIZE:",
            base.size,
        )


       
        # =====================================================
        # FLOOR PLAN CONTENT CROP
        # =====================================================

        rgba = base.convert("RGBA")

        arr = np.array(rgba)

        rgb = arr[:, :, :3]
        alpha = arr[:, :, 3]

        # Detect non-white content in the ORIGINAL
        # floor-plan image.
        #
        # This is intentionally independent from:
        # rooms
        # zones
        # measurement points

        min_channel = rgb.min(axis=2)

        mask = (
            (min_channel < 245)
            &
            (alpha > 10)
        )

        ys, xs = np.where(mask)

        if len(xs) == 0:

           

            crop_x = 0
            crop_y = 0
            crop_right = rgba.width
            crop_bottom = rgba.height

        else:

            # -------------------------------------------------
            # CONTENT BOUNDS
            # -------------------------------------------------

            content_left = int(
                xs.min()
            )

            content_top = int(
                ys.min()
            )

            content_right = int(
                xs.max()
            )

            content_bottom = int(
                ys.max()
            )

            # -------------------------------------------------
            # PADDING
            # -------------------------------------------------

            padding_x = max(
                12,
                int(
                    (content_right - content_left)
                    * 0.08
                ),
            )

            padding_y = max(
                12,
                int(
                    (content_bottom - content_top)
                    * 0.08
                ),
            )

            crop_x = max(
                0,
                content_left - padding_x,
            )

            crop_y = max(
                0,
                content_top - padding_y,
            )

            crop_right = min(
                rgba.width,
                content_right + padding_x + 1,
            )

            crop_bottom = min(
                rgba.height,
                content_bottom + padding_y + 1,
            )

       

        # =====================================================
        # CROP
        # =====================================================

        cropped = base.crop(
            (
                crop_x,
                crop_y,
                crop_right,
                crop_bottom,
            )
        )

        img_w, img_h = cropped.size

       

        # =====================================================
        # SCALE TO HEATMAP CANVAS
        # =====================================================

        scale = min(
            width / img_w,
            height / img_h,
        )

        new_w = int(
            img_w * scale
        )

        new_h = int(
            img_h * scale
        )

        cropped = cropped.resize(
            (
                new_w,
                new_h,
            ),
            PILImage.Resampling.LANCZOS,
        )

        # =====================================================
        # CANVAS
        # =====================================================

        canvas = PILImage.new(
            "RGBA",
            (
                width,
                height,
            ),
            (
                255,
                255,
                255,
                255,
            ),
        )

        offset_x = (
            width - new_w
        ) // 2

        offset_y = (
            height - new_h
        ) // 2

        canvas.paste(
            cropped,
            (
                offset_x,
                offset_y,
            ),
        )

        base = canvas

       

    # =====================================================
    # COORDINATE TRANSFORMATION
    # =====================================================

    def transform_x(
        value,
    ):

        return (
            (
                float(value)
                - crop_x
            )
            * scale
            + offset_x
        )

    def transform_y(
        value,
    ):

        return (
            (
                float(value)
                - crop_y
            )
            * scale
            + offset_y
        )

    

    # =====================================================
    # EMPTY CHECK
    # =====================================================

    if not points:

        return (
            base,
            0,
            0,
        )

    # =====================================================
    # INIT HEATMAP
    # =====================================================

    heat = PILImage.new(
        "RGBA",
        (
            width,
            height,
        ),
        (
            0,
            0,
            0,
            0,
        ),
    )

    grid = np.zeros(
        (
            height,
            width,
        )
    )

    # =====================================================
    # FIELD BUILD
    # =====================================================

   
    for p in points[:10]:

        print(
            p.get("id"),
            p.get("x"),
            p.get("y"),
        )

    spread = 20

    for p in points:

        px = int(
            transform_x(
                p.get(
                    "x",
                    0,
                )
            )
        )

        py = int(
            transform_y(
                p.get(
                    "y",
                    0,
                )
            )
        )

        rf = p.get(
            "m",
            {},
        ).get(
            "rf",
            0,
        )

        risk = risk_fn(
            p.get(
                "m",
                {},
            )
        )

        score = risk.get(
            "score",
            0,
        )

       

        for i in range(
            max(
                0,
                py - 60,
            ),
            min(
                height,
                py + 60,
            ),
        ):

            for j in range(
                max(
                    0,
                    px - 60,
                ),
                min(
                    width,
                    px + 60,
                ),
            ):

                dx = j - px
                dy = i - py

                d = np.hypot(
                    dx,
                    dy,
                )

                val = (
                    score
                    * np.exp(
                        -d / spread
                    )
                )

                grid[
                    i,
                    j
                ] += val

    # =====================================================
    # SMOOTH
    # =====================================================

    grid = gaussian_filter(
        grid,
        sigma=2.5,
    )

    grid = np.power(
        grid,
        0.90,
    )

    grid = gaussian_filter(
        grid,
        sigma=2.5,
    )

    if grid.max() > 0:

        grid = (
            grid
            / grid.max()
        )

   

    # =====================================================
    # DRAW HEAT FIELD
    # =====================================================

    for i in range(
        height
    ):

        for j in range(
            width
        ):

            v = grid[
                i,
                j
            ]

            if v < 0.03:

                continue

            v = np.power(
                v,
                0.92,
            )

            color = get_color(
                v
            )

            alpha = int(
                40
                + (
                    v
                    * 140
                )
            )

            alpha = min(
                185,
                alpha,
            )

            heat.putpixel(
                (
                    j,
                    i,
                ),
                (
                    color[0],
                    color[1],
                    color[2],
                    alpha,
                ),
            )

    base.paste(
        heat,
        (
            0,
            0,
        ),
        heat,
    )

    draw = ImageDraw.Draw(
        base
    )

    wall_draw = ImageDraw.Draw(
        base
    )

    # =====================================================
    # DRAW ROOMS
    # =====================================================

    for room in rooms:

        polygon = room.get(
            "polygon",
            [],
        )

        if len(polygon) < 2:

            continue

        pts = []

        for p in polygon:

            if isinstance(
                p,
                dict,
            ):

                x = int(
                    transform_x(
                        p.get(
                            "x",
                            0,
                        )
                    )
                )

                y = int(
                    transform_y(
                        p.get(
                            "y",
                            0,
                        )
                    )
                )

            else:

                x = int(
                    transform_x(
                        p[0]
                    )
                )

                y = int(
                    transform_y(
                        p[1]
                    )
                )

            pts.append(
                (
                    x,
                    y,
                )
            )

       

        wall_draw.polygon(
            pts,
            outline=(
                0,
                0,
                255,
                255,
            ),
            width=3,
        )

    # =====================================================
    # DRAW ZONES
    # =====================================================

    for zone in zones:

        polygon = zone.get(
            "polygon",
            [],
        )

        if len(polygon) < 2:

            continue

        pts = []

        for p in polygon:

            if not isinstance(
                p,
                dict,
            ):

                continue

            x = int(
                transform_x(
                    p.get(
                        "x",
                        0,
                    )
                )
            )

            y = int(
                transform_y(
                    p.get(
                        "y",
                        0,
                    )
                )
            )

            pts.append(
                (
                    x,
                    y,
                )
            )

        if len(pts) < 2:

            continue

        # -------------------------------------------------
        # ZONE GRID
        # -------------------------------------------------

        for gp in zone.get(
            "grid",
            [],
        ):

            gx = int(
                transform_x(
                    gp.get(
                        "x",
                        0,
                    )
                )
            )

            gy = int(
                transform_y(
                    gp.get(
                        "y",
                        0,
                    )
                )
            )

            wall_draw.polygon(
                [
                    (
                        gx,
                        gy - 5,
                    ),
                    (
                        gx + 5,
                        gy,
                    ),
                    (
                        gx,
                        gy + 5,
                    ),
                    (
                        gx - 5,
                        gy,
                    ),
                ],
                outline=(
                    168,
                    85,
                    247,
                ),
                fill=(
                    255,
                    255,
                    255,
                ),
            )

        # -------------------------------------------------
        # ZONE POLYGON
        # -------------------------------------------------

        wall_draw.line(
            pts + [pts[0]],
            fill=(
                255,
                0,
                255,
                255,
            ),
            width=3,
        )

        # -------------------------------------------------
        # ZONE LABEL
        # -------------------------------------------------

        cx = (
            sum(
                p[0]
                for p in pts
            )
            / len(pts)
        )

        cy = (
            sum(
                p[1]
                for p in pts
            )
            / len(pts)
        )

        zone_name = zone.get(
            "name",
            "",
        )

        if zone_name:

            label_x = int(
                cx - 35
            )

            label_y = int(
                cy - 10
            )

            wall_draw.rounded_rectangle(
                [
                    label_x - 6,
                    label_y - 4,
                    label_x + 70,
                    label_y + 16,
                ],
                radius=6,
                fill=(
                    15,
                    23,
                    42,
                    210,
                ),
            )

            wall_draw.text(
                (
                    label_x,
                    label_y,
                ),
                zone_name,
                fill=(
                    255,
                    255,
                    255,
                ),
            )

    # =====================================================
    # DRAW MEASUREMENT POINTS
    # =====================================================

   

    for p in points:

        raw_x = p.get(
            "x",
            0,
        )

        raw_y = p.get(
            "y",
            0,
        )

        x = int(
            transform_x(
                raw_x
            )
        )

        y = int(
            transform_y(
                raw_y
            )
        )

       

        # -------------------------------------------------
        # OUTER GLOW
        # -------------------------------------------------

        draw.ellipse(
            [
                x - 9,
                y - 9,
                x + 9,
                y + 9,
            ],
            fill=(
                255,
                255,
                255,
                35,
            ),
        )

        # -------------------------------------------------
        # MAIN POINT
        # -------------------------------------------------

        draw.ellipse(
            [
                x - 6,
                y - 6,
                x + 6,
                y + 6,
            ],
            fill=(
                255,
                255,
                255,
                240,
            ),
            outline=(
                15,
                23,
                42,
            ),
            width=2,
        )

        draw.text(
            (
                x + 8,
                y - 8,
            ),
            p.get(
                "id",
                "",
            ),
            fill=(
                15,
                23,
                42,
            ),
        )

    
    # =====================================================
    # RETURN
    # =====================================================

    min_val = float(
        grid.min()
    )

    max_val = float(
        grid.max()
    )

    return (
        base,
        min_val,
        max_val,
    )