"""
Room Heatmap

Generates SBM and ICNIRP heatmaps
for a single room.

Uses the existing PHI heatmap engine.
"""

from PIL import Image as PILImage
from PIL import ImageDraw
import numpy as np

from engine.analysis.heatmap.heatmap import (
    render_heatmap,
)

from engine.analysis.common.helpers.score_helpers import (
    normalize_sbm,
    normalize_icnirp,
)

from engine.pdf_components.pil.heatmap.heatmap_generator import (
    _load_base_image,
)


def _crop_room_heatmap(
    heatmap_image,
    room,
    base_image,
    width=700,
    height=520,
    padding_ratio=0.12,
):
    """
    Crop rendered room heatmap using the exact same
    coordinate transformation as render_heatmap().

    The heatmap engine first crops the real floor-plan
    content, scales it to the target canvas and centers it.
    We reproduce that transformation here so the room
    polygon and the heatmap stay aligned.
    """

    if heatmap_image is None:
        return None

    if not isinstance(
        room,
        dict,
    ):
        return heatmap_image

    polygon = room.get(
        "polygon",
        [],
    )

    if not isinstance(
        polygon,
        list,
    ):
        return heatmap_image

    points = [
        point
        for point in polygon
        if (
            isinstance(
                point,
                dict,
            )
            and "x" in point
            and "y" in point
        )
    ]

    if not points:
        return heatmap_image

    # ======================================================
    # ORIGINAL IMAGE
    # ======================================================

    base = base_image.convert(
        "RGBA"
    )

    original_w, original_h = (
        base.size
    )

    # ======================================================
    # REPRODUCE render_heatmap() CONTENT CROP
    # ======================================================

    rgba = base

    arr = np.array(
        rgba
    )

    rgb = arr[
        :,
        :,
        :3,
    ]

    alpha = arr[
        :,
        :,
        3,
    ]

    min_channel = rgb.min(
        axis=2
    )

    mask = (
        (min_channel < 245)
        &
        (alpha > 10)
    )

    ys, xs = np.where(
        mask
    )

    if len(xs) == 0:

        crop_x = 0
        crop_y = 0
        crop_right = original_w
        crop_bottom = original_h

    else:

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

        padding_x = max(
            12,
            int(
                (
                    content_right
                    - content_left
                )
                * 0.08
            ),
        )

        padding_y = max(
            12,
            int(
                (
                    content_bottom
                    - content_top
                )
                * 0.08
            ),
        )

        crop_x = max(
            0,
            content_left
            - padding_x,
        )

        crop_y = max(
            0,
            content_top
            - padding_y,
        )

        crop_right = min(
            original_w,
            content_right
            + padding_x
            + 1,
        )

        crop_bottom = min(
            original_h,
            content_bottom
            + padding_y
            + 1,
        )

    # ======================================================
    # SAME SCALE AS render_heatmap()
    # ======================================================

    cropped_width = (
        crop_right
        - crop_x
    )

    cropped_height = (
        crop_bottom
        - crop_y
    )

    if (
        cropped_width <= 0
        or cropped_height <= 0
    ):
        return heatmap_image

    scale = min(
        width / cropped_width,
        height / cropped_height,
    )

    new_w = int(
        cropped_width
        * scale
    )

    new_h = int(
        cropped_height
        * scale
    )

    offset_x = (
        width
        - new_w
    ) // 2

    offset_y = (
        height
        - new_h
    ) // 2

    # ======================================================
    # TRANSFORM ROOM POLYGON
    # ======================================================

    transformed = []

    for point in points:

        x = (
            (
                float(
                    point["x"]
                )
                - crop_x
            )
            * scale
            + offset_x
        )

        y = (
            (
                float(
                    point["y"]
                )
                - crop_y
            )
            * scale
            + offset_y
        )

        transformed.append(
            (
                x,
                y,
            )
        )

    # ======================================================
    # ROOM BOUNDING BOX
    # ======================================================

    min_x = min(
        point[0]
        for point in transformed
    )

    max_x = max(
        point[0]
        for point in transformed
    )

    min_y = min(
        point[1]
        for point in transformed
    )

    max_y = max(
        point[1]
        for point in transformed
    )

    # ======================================================
    # DYNAMIC ROOM PADDING
    # ======================================================

    room_width = (
        max_x
        - min_x
    )

    room_height = (
        max_y
        - min_y
    )

    padding_x = (
        room_width
        * padding_ratio
    )

    padding_y = (
        room_height
        * padding_ratio
    )

    left = max(
        0,
        int(
            min_x
            - padding_x
        ),
    )

    top = max(
        0,
        int(
            min_y
            - padding_y
        ),
    )

    right = min(
        heatmap_image.width,
        int(
            max_x
            + padding_x
        ),
    )

    bottom = min(
        heatmap_image.height,
        int(
            max_y
            + padding_y
        ),
    )

    # ======================================================
    # SAFETY
    # ======================================================

    if (
        right <= left
        or bottom <= top
    ):
        return heatmap_image

    print(
        "🔥 ROOM HEATMAP CROP:",
        room.get(
            "name",
            "Room",
        ),
        "| FLOOR:",
        room.get(
            "floor",
            "",
        ),
        "| ENGINE TRANSFORM:",
        round(scale, 4),
        "| OFFSET:",
        (
            offset_x,
            offset_y,
        ),
        "| ROOM CROP:",
        (
            left,
            top,
            right,
            bottom,
        ),
    )

    # ======================================================
    # FINAL CROP
    # ======================================================

    cropped = heatmap_image.crop(
        (
            left,
            top,
            right,
            bottom,
        )
    )

    # ======================================================
    # ROOM POLYGON MASK
    # ======================================================

    from PIL import ImageDraw

    mask = PILImage.new(
        "L",
        cropped.size,
        0,
    )

    mask_draw = ImageDraw.Draw(
        mask
    )

    local_polygon = []

    for x, y in transformed:

        local_polygon.append(
            (
                int(x - left),
                int(y - top),
            )
        )

    if len(local_polygon) >= 3:

        mask_draw.polygon(
            local_polygon,
            fill=255,
        )

        cropped.putalpha(
            mask
        )

    # ======================================================
    # ROOM BORDER
    # ======================================================

    border_draw = ImageDraw.Draw(
        cropped
    )

    if len(local_polygon) >= 2:

        border_draw.line(
            local_polygon
            + [local_polygon[0]],
            fill=(
                0,
                0,
                255,
                255,
            ),
            width=3,
            joint="curve",
        )


    # ======================================================
    # UPSCALE ROOM CROP
    # ======================================================
    #
    # The room crop is intentionally extracted from the
    # full heatmap canvas, but must not remain at the tiny
    # native crop size.
    #
    # Scale it dynamically to the largest size that fits
    # inside the requested heatmap area while preserving
    # the room's original aspect ratio.
    #

    crop_width, crop_height = (
        cropped.size
    )

    if (
        crop_width > 0
        and crop_height > 0
    ):

        upscale = min(
            width / crop_width,
            height / crop_height,
        )

        # Never downscale here.
        upscale = max(
            1.0,
            upscale,
        )

        target_width = max(
            1,
            int(
                crop_width
                * upscale
            ),
        )

        target_height = max(
            1,
            int(
                crop_height
                * upscale
            ),
        )

        if (
            target_width != crop_width
            or target_height != crop_height
        ):

            cropped = cropped.resize(
                (
                    target_width,
                    target_height,
                ),
                resample=PILImage.Resampling.LANCZOS,
            )


   

    return cropped

# ==========================================================
# COLLECT ROOM POINTS
# ==========================================================

def _collect_room_points(
    room,
    session="session_1",
):
    """
    Collect measured points from a room grid.

    Converts frontend grid-point structure into
    the normalized measurement-point structure
    expected by render_heatmap().
    """

    points = []

    for grid_point in room.get(
        "grid",
        [],
    ):

        if not isinstance(
            grid_point,
            dict,
        ):
            continue

        # --------------------------------------------------
        # ONLY MEASURED POINTS
        # --------------------------------------------------

        measurements = grid_point.get(
            "measurements",
            {},
        )

        if not isinstance(
            measurements,
            dict,
        ):
            continue

        session_measurements = measurements.get(
            session,
            {},
        )

        if not isinstance(
            session_measurements,
            dict,
        ):
            continue

        if not session_measurements:
            continue

        # --------------------------------------------------
        # NORMALIZED POINT
        # --------------------------------------------------

        points.append(
            {
                "id": grid_point.get(
                    "id",
                ),

                "x": grid_point.get(
                    "x",
                    0,
                ),

                "y": grid_point.get(
                    "y",
                    0,
                ),

                "room": room.get(
                    "name",
                    "",
                ),

                "floor": room.get(
                    "floor",
                    "",
                ),

                "m": {
                    "rf": session_measurements.get(
                        "rf",
                        0,
                    ),

                    "electric": session_measurements.get(
                        "electric",
                        0,
                    ),

                    "magnetic": session_measurements.get(
                        "magnetic",
                        0,
                    ),

                    "height": session_measurements.get(
                        "height",
                        120,
                    ),
                },
            }
        )

    return points


# ==========================================================
# COLLECT ROOM ZONES
# ==========================================================

def _collect_room_zones(
    room,
    analysis,
):
    """
    Collect zones belonging to the selected room.

    Supports:
        - room name relation
        - room id relation
        - zone grid room relation
        - grid-point zoneId relation
    """

    room_id = room.get(
        "id",
    )

    room_name = room.get(
        "name",
        "",
    )

    room_grid = room.get(
        "grid",
        [],
    )

    room_zone_ids = set()

    # ------------------------------------------------------
    # Zone IDs referenced by room grid
    # ------------------------------------------------------

    for grid_point in room_grid:

        if not isinstance(
            grid_point,
            dict,
        ):
            continue

        zone_id = grid_point.get(
            "zoneId",
        )

        if zone_id:

            room_zone_ids.add(
                zone_id
            )

    # ------------------------------------------------------
    # ALL ANALYSIS ZONES
    # ------------------------------------------------------

    analysis_zones = analysis.get(
        "zones",
        [],
    )

    if not isinstance(
        analysis_zones,
        list,
    ):

        return []

    room_zones = []

    for zone in analysis_zones:

        if not isinstance(
            zone,
            dict,
        ):
            continue

        zone_id = zone.get(
            "id",
        )

        # --------------------------------------------------
        # Direct zone ID relation
        # --------------------------------------------------

        if (
            zone_id
            and zone_id in room_zone_ids
        ):

            room_zones.append(
                zone
            )

            continue

        # --------------------------------------------------
        # Room ID relation
        # --------------------------------------------------

        if zone.get(
            "roomId",
        ) == room_id:

            room_zones.append(
                zone
            )

            continue

        # --------------------------------------------------
        # Room name relation
        # --------------------------------------------------

        if zone.get(
            "room",
        ) == room_name:

            room_zones.append(
                zone
            )

            continue

        # --------------------------------------------------
        # Zone grid relation
        # --------------------------------------------------

        zone_grid = zone.get(
            "grid",
            [],
        )

        if not isinstance(
            zone_grid,
            list,
        ):
            continue

        belongs_to_room = False

        for zone_point in zone_grid:

            if not isinstance(
                zone_point,
                dict,
            ):
                continue

            if zone_point.get(
                "zoneId",
            ) in room_zone_ids:

                belongs_to_room = True

                break

            if zone_point.get(
                "room",
            ) == room_name:

                belongs_to_room = True

                break

        if belongs_to_room:

            room_zones.append(
                zone
            )

    return room_zones


# ==========================================================
# COLLECT ROOM SOURCES
# ==========================================================

def _collect_room_sources(
    room,
    analysis,
):
    """
    Collect EMF sources belonging to the selected room.
    """

    room_id = room.get(
        "id",
    )

    room_name = room.get(
        "name",
        "",
    )

    room_grid = room.get(
        "grid",
        [],
    )

    room_zone_ids = set()

    for grid_point in room_grid:

        if not isinstance(
            grid_point,
            dict,
        ):
            continue

        zone_id = grid_point.get(
            "zoneId",
        )

        if zone_id:

            room_zone_ids.add(
                zone_id
            )

    analysis_sources = analysis.get(
        "sources",
        [],
    )

    if not isinstance(
        analysis_sources,
        list,
    ):

        return []

    room_sources = []

    for source in analysis_sources:

        if not isinstance(
            source,
            dict,
        ):
            continue

        # --------------------------------------------------
        # FLOOR FILTER
        # --------------------------------------------------

        source_floor_index = source.get(
            "floorIndex",
        )

        room_floor_index = room.get(
            "floorIndex",
        )

        if (
            source_floor_index is not None
            and room_floor_index is not None
            and source_floor_index
            != room_floor_index
        ):

            continue

        # --------------------------------------------------
        # DIRECT ROOM RELATION
        # --------------------------------------------------

        if source.get(
            "roomId",
        ) == room_id:

            room_sources.append(
                source
            )

            continue

        if source.get(
            "room",
        ) == room_name:

            room_sources.append(
                source
            )

            continue

        # --------------------------------------------------
        # LINKED ZONES
        # --------------------------------------------------

        linked_zone_ids = source.get(
            "linkedZoneIds",
            [],
        )

        if not isinstance(
            linked_zone_ids,
            list,
        ):

            linked_zone_ids = []

        if room_zone_ids.intersection(
            linked_zone_ids
        ):

            room_sources.append(
                source
            )

            continue

    return room_sources


# ==========================================================
# GENERATE ROOM HEATMAPS
# ==========================================================

def generate_room_heatmap_images(
    analysis,
    room,
    session="session_1",
    base_image=None,
    width=700,
    height=520,
):
    """
    Generate SBM and ICNIRP heatmaps
    for one room.

    Returns
    -------
    tuple
        (
            sbm_image,
            icnirp_image,
        )
    """

    # ======================================================
    # SAFETY
    # ======================================================

    if not isinstance(
        room,
        dict,
    ):

        raise ValueError(
            "Room heatmap requires a room dictionary."
        )

    if not isinstance(
        analysis,
        dict,
    ):

        raise ValueError(
            "Room heatmap requires analysis dictionary."
        )

    # ======================================================
    # POINTS
    # ======================================================

    room_points = _collect_room_points(
        room=room,
        session=session,
    )

    # ======================================================
    # ZONES
    # ======================================================

    room_zones = _collect_room_zones(
        room=room,
        analysis=analysis,
    )

    # ======================================================
    # SOURCES
    # ======================================================

    room_sources = _collect_room_sources(
        room=room,
        analysis=analysis,
    )

    # ======================================================
    # BASE IMAGE
    # ======================================================

    if base_image is None:

        room_floor = room.get(
            "floor",
            "",
        )

        floor_image_data = None

        for floor in analysis.get(
            "floors",
            [],
        ):

            if not isinstance(
                floor,
                dict,
            ):
                continue

            if floor.get(
                "name",
                "",
            ) == room_floor:

                floor_image_data = floor.get(
                    "imageData",
                )

                

                break

        if floor_image_data is None:

            

            floor_image_data = analysis.get(
                "plan_image",
            )

        base_image = _load_base_image(
            floor_image_data,
            width=width,
            height=height,
        )

   

    # ======================================================
    # SBM
    # ======================================================

   

    polygon = room.get(
        "polygon",
        [],
    )

    if polygon:

        xs = [
            point.get("x", 0)
            for point in polygon
            if isinstance(point, dict)
        ]

        ys = [
            point.get("y", 0)
            for point in polygon
            if isinstance(point, dict)
        ]

        if xs and ys:

            print(
                "🔥 ROOM POLYGON BBOX:",
                "MIN X:", min(xs),
                "MAX X:", max(xs),
                "MIN Y:", min(ys),
                "MAX Y:", max(ys),
            )

    sbm_image, _, _ = render_heatmap(

        base_image.copy(),

        room_points,

        normalize_sbm,

        rooms=[
            room
        ],

        zones=room_zones,

        sources=room_sources,

        width=width,

        height=height,
    )

   

    # ======================================================
    # ICNIRP
    # ======================================================

    icnirp_image, _, _ = render_heatmap(

        base_image.copy(),

        room_points,

        normalize_icnirp,

        rooms=[
            room
        ],

        zones=room_zones,

        sources=room_sources,

        width=width,

        height=height,
    )

    

    sbm_image = _crop_room_heatmap(
        heatmap_image=sbm_image,
        room=room,
        base_image=base_image,
        width=width,
        height=height,
    )

   

    icnirp_image = _crop_room_heatmap(
        heatmap_image=icnirp_image,
        room=room,
        base_image=base_image,
        width=width,
        height=height,
    )


    return (
        sbm_image,
        icnirp_image,
    )