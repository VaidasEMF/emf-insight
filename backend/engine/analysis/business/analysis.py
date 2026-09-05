# =====================
# ANALYSIS BUILDER
# =====================

"""
Sujungia visą analizę į vieną struktūrą:
→ PDF builder naudos tik šitą objektą
"""

# =====================
# IMPORTS
# =====================



import math

from engine.utils import (
    simplify_polygon,
    align_rooms,
    point_in_polygon,
    is_rectangle,
    normalize_rectangle,
)



from engine.analysis.heatmap.heatmap import (
    render_heatmap,
)

from engine.sessions import compare_frameworks

from engine.analysis.common.scoring import (
    avg_score,
    normalize_sbm,
    normalize_icnirp,
)

from engine.confidence import (
    compute_confidence,
)

from engine.sleep import (
    analyze_sleep_zones,
)

from engine.health import (
    build_room_health_index,
)

from engine.mitigation import (
    build_mitigation_matrix,
)

from engine.environment import (
    compute_environmental_quality,
)

from engine.narrative import (
    build_environment_narrative,
)

from engine.certification import (
    build_certification,
)

from engine.compliance import (
    build_compliance,
)

from engine.hotspots import (
    build_hotspots,
)

from .room_summary import (
    build_room_summary,
)

from .source_summary import (
    build_source_summary,
)

from .zone_summary import (
    build_zone_summary,
)

from .coverage import (
    compute_coverage,
)

from engine.source_profiles import (
    SOURCE_PROFILES,
    get_source_category,
)

from engine.analysis.common.room.room_overview_builder import (
    build_room_overview,
)

from engine.analysis.common.measurement.measurement_scope import (
    normalize_measurement_scope,
    evaluate_measurement_point,
)

from engine.analysis.business.recommendations import (
    build_recommendations,
)

from engine.analysis.home.home_recommendations_builder import (
    build_home_recommendations,
)

# =====================
# HELPER
# =====================


def compute_source_attribution(
    point,
    sources,
):

    
    weights = []

    

    for s in sources:


        category = get_source_category(
            s.get(
                "type",
                "generic",
            )
        )

       

        dx = point["x"] - s["x"]
        dy = point["y"] - s["y"]

        dist = (
            math.sqrt(
                dx * dx + dy * dy
            )
            + 1
        )

        power = s.get(
            "power",
            1.0,
        )

        weight = (
            power / dist
        )

        weights.append(
            (
                s,
                weight,
            )
        )

    total = sum(
        w
        for _, w in weights
    )

    result = {}

    for s, w in weights:

        pct = (
            (w / total) * 100
            if total > 0
            else 0
        )

        source_id = s.get(
            "id",
            s.get(
                "type",
                "unknown",
            )
        )

        result[source_id] = (
            result.get(
                source_id,
                0,
            )
            + pct
        )

    return result


# =====================
# MAIN ANALYSIS
# =====================


def build_business_analysis(
    project,
    sessionA,
    sessionB,
):

    # =====================
    # MEASUREMENT SCOPE
    # =====================
    #
    # Business Survey Measurement Scope is defined once
    # for the entire assessment.
    #
    # It determines which measurement domains are required
    # at each measurement point.
    #
    # Supported domains:
    #
    #     rf
    #     electric
    #     magnetic
    #
    # IMPORTANT:
    #
    # Scope is explicit assessment configuration.
    # It must NOT be inferred from individual measurement
    # values.
    #
    # Backward compatibility:
    #
    # If the project does not yet contain an explicit scope,
    # normalize_measurement_scope() falls back to the current
    # full measurement model.
    #
    # =====================

    measurement_scope = normalize_measurement_scope(
        project.get(
            "measurement_scope"
        )
    )

  


    # =====================
    # RAW DATA
    # =====================

    floors = project.get(
        "floors",
        []
    )

   

    for i, floor in enumerate(floors):

       

        for s in floor.get(
            "sources",
            []
        ):
            print(
                "SOURCE:",
                s.get("type"),
                s.get("id"),
            )

    rooms = []
    zones = []
    sources = []

    for floor in floors:

        rooms.extend(
            floor.get(
                "rooms",
                []
            )
        )

        zones.extend(
            floor.get(
                "zones",
                []
            )
        )

        sources.extend(
            floor.get(
                "sources",
                []
            )
        )

       


   

    pts_before = []
    pts_after = []

    # =====================
    # COLLECT POINTS
    # =====================
    #
    # Measurement values are preserved as actual values.
    #
    # IMPORTANT:
    #
    # Missing measurement != 0
    #
    # A domain can be:
    #
    #     measured
    #     missing
    #     not_in_scope
    #     invalid
    #
    # Measurement Scope determines which domains are
    # required for point completeness.
    #
    # =====================


    def build_measurement_point(
        grid_point,
        measurement,
    ):
        """
        Normalize one raw measurement point.

        IMPORTANT:

        We do NOT replace missing values with zero.

        The original measurement values are preserved,
        while domain-specific status is calculated
        according to the Business Measurement Scope.
        """

        measurement = (
            measurement
            if isinstance(
                measurement,
                dict,
            )
            else {}
        )


        # --------------------------------------------------
        # Measurement status
        # --------------------------------------------------

        evaluation = evaluate_measurement_point(
            measurement=measurement,
            measurement_scope=measurement_scope,
        )


        statuses = evaluation.get(
            "statuses",
            {},
        )


        # --------------------------------------------------
        # Preserve actual values
        # --------------------------------------------------

        rf = measurement.get(
            "rf"
        )

        electric = measurement.get(
            "electric"
        )

        magnetic = measurement.get(
            "magnetic"
        )

        height = measurement.get(
            "height",
            120,
        )


        # --------------------------------------------------
        # Build normalized point
        # --------------------------------------------------

        return {

            "id":
                grid_point.get(
                    "id"
                ),

            "x":
                grid_point.get(
                    "x"
                ),

            "y":
                grid_point.get(
                    "y"
                ),

            "room":
                grid_point.get(
                    "_room_name"
                ),

            "floor":
                grid_point.get(
                    "_floor_name"
                ),

            "m": {

                "rf":
                    rf,

                "electric":
                    electric,

                "magnetic":
                    magnetic,

                "height":
                    height,

            },

            # ----------------------------------------------
            # Measurement status
            # ----------------------------------------------

            "measurement_status":
                statuses,

            "measurement_complete":
                evaluation.get(
                    "complete",
                    False,
                ),

            "measurement_scope":
                evaluation.get(
                    "scope",
                    measurement_scope,
                ),

        }


    # ======================================================
    # COLLECT FLOOR / ROOM / GRID POINTS
    # ======================================================

    for f in floors:

        for r in f.get(
            "rooms",
            []
        ):

            for g in r.get(
                "grid",
                []
            ):

                measurements = g.get(
                    "measurements",
                    {}
                )


                # ==================================================
                # SESSION A
                # ==================================================

                if sessionA in measurements:

                    mm = measurements[
                        sessionA
                    ]


                    point = dict(
                        g
                    )


                    point[
                        "_room_name"
                    ] = r.get(
                        "name"
                    )


                    point[
                        "_floor_name"
                    ] = f.get(
                        "name"
                    )


                    normalized_point = (
                        build_measurement_point(
                            point,
                            mm,
                        )
                    )


                    pts_before.append(
                        normalized_point
                    )


                # ==================================================
                # SESSION B
                # ==================================================

                if (
                    sessionB
                    and
                    sessionB in measurements
                ):

                    mm = measurements[
                        sessionB
                    ]


                    point = dict(
                        g
                    )


                    point[
                        "_room_name"
                    ] = r.get(
                        "name"
                    )


                    point[
                        "_floor_name"
                    ] = f.get(
                        "name"
                    )


                    normalized_point = (
                        build_measurement_point(
                            point,
                            mm,
                        )
                    )


                    pts_after.append(
                        normalized_point
                    )


    # =====================
    # SESSION COMPARISON
    # =====================

    session_data = None

    if pts_after:

        session_data = {
            "sbm": compare_frameworks(pts_before, pts_after, normalize_sbm),
            "icnirp": compare_frameworks(pts_before, pts_after, normalize_icnirp),
        }


    room_summary = build_room_summary(
        pts_before
    )

    # =====================
    # ROOM OVERVIEW MODELS
    # =====================

    room_summary_by_key = {}

    for room_data in room_summary:

        key = (
            room_data.get(
                "floor",
                "",
            ),
            room_data.get(
                "room",
                "",
            ),
        )

        room_summary_by_key[key] = room_data


    room_overviews = []

    # ==================================================
    # FLOOR ELEVATIONS
    # ==================================================

    floor_elevations = {}


    for index, floor_data in enumerate(
        floors
    ):

        if not isinstance(
            floor_data,
            dict,
        ):
            continue


        
        elevation = floor_data.get(
            "elevation_m"
        )

        if elevation is None:

            if index == 0:

                elevation = 0.0

            else:

                continue


        try:

            elevation = float(
                elevation
            )

        except (
            TypeError,
            ValueError,
        ):

            continue


        floor_elevations[
            index
        ] = elevation

        print(
            "🔥🔥🔥 FLOOR ELEVATION INPUT:",
            index,
            "| NAME:",
            floor_data.get(
                "name"
            ),
            "| ELEVATION:",
            elevation,
            "| KEYS:",
            list(
                floor_data.keys()
            ),
        )


       

        try:

            elevation = float(
                elevation
            )

        except (
            TypeError,
            ValueError,
        ):

            continue


        floor_elevations[
            index
        ] = elevation


    print(
        "🔥🔥🔥🔥🔥 FLOOR ELEVATIONS:",
        floor_elevations,
    )


    for floor_index, floor in enumerate(
        floors
    ):

        if not isinstance(
            floor,
            dict,
        ):
            continue

        floor_name = floor.get(
            "name",
            f"Floor {floor_index + 1}",
        )

        floor_rooms = floor.get(
            "rooms",
            [],
        )

        if not isinstance(
            floor_rooms,
            list,
        ):
            continue


       


        for room in floor_rooms:

            if not isinstance(
                room,
                dict,
            ):
                continue

            room_name = room.get(
                "name",
                "Room",
            )

            key = (
                floor_name,
                room_name,
            )

            summary = room_summary_by_key.get(
                key,
                {},
            )

                        # ==================================================
            # ROOM MEASUREMENT POINTS
            # ==================================================
            #
            # Use the actual Business Survey measurement points.
            #
            # These are the exposure-truth points used by the
            # measurement / scoring pipeline.
            #
            # ==================================================

            room_measurement_points = []

            for point in pts_before:

                if not isinstance(
                    point,
                    dict,
                ):
                    continue

                point_floor = point.get(
                    "floor",
                    "",
                )

                point_room = point.get(
                    "room",
                    "",
                )

                if (
                    point_floor == floor_name
                    and
                    point_room == room_name
                ):

                    room_measurement_points.append(
                        point
                    )


           

       
            # ==================================================
            # BUILD NORMALIZED ROOM MODEL
            # ==================================================

            room_for_overview = {
                **room,

                "measurement_points":
                    room_measurement_points,
            }

            


            # ==================================================
            # FLOOR SCALE
            # ==================================================

            floor_scale = floor.get(
                "currentScale",
                0,
            )

           


            # ==================================================
            # FLOOR ELEVATION
            # ==================================================

            floor_elevation_m = (
                float(
                    floor.get(
                        "elevation_m",
                    )
                )
                if
                floor.get(
                    "elevation_m"
                ) is not None
                else 0.0
            )


            

            if isinstance(
                sources,
                list,
            ):

                for source in sources:

                    if not isinstance(
                        source,
                        dict,
                    ):
                        continue

                    


            # ==================================================
            # ROOM OVERVIEW
            # ==================================================

            room_overview = build_room_overview(
                room=room_for_overview,

                room_summary=summary,

                floor_name=floor_name,

                floor_index=floor_index,

                floor_scale=floor.get(
                    "currentScale",
                    0,
                ),

                floor_elevation_m=floor.get(
                    "elevation_m",
                    0,
                ),

                sources=sources,

                zones=zones,

                rooms=floor_rooms,

                floor_elevations=floor_elevations,
                measurement_scope=measurement_scope,
            )
          


            # ==================================================
            # EXPLICIT FLOOR CONTEXT
            # ==================================================

            room_overview["floor"] = (
                floor_name
            )

            room_overview["floor_name"] = (
                floor_name
            )

            room_overview["floorIndex"] = (
                floor_index
            )

            # ==================================================
            # KEEP ORIGINAL ROOM DATA
            # ==================================================

            room_overview["room_id"] = (
                room.get(
                    "id",
                )
            )

            room_overviews.append(
                room_overview
            )


   

    
    for room_overview in room_overviews:

        print(
            "🔥 ROOM:",
            room_overview.get(
                "floor"
            ),
            room_overview.get(
                "name"
            ),
            "GRID:",
            room_overview.get(
                "total_grid_points"
            ),
            "MEASURED:",
            room_overview.get(
                "measured_count"
            ),
            "COVERAGE:",
            room_overview.get(
                "coverage"
            ),
            "RF:",
            room_overview.get(
                "avg_rf"
            ),
            "RISK:",
            room_overview.get(
                "risk"
            ),
        )

    zone_summary = build_zone_summary(
        pts_before,
        zones,
    )

   

    coverage = compute_coverage(
        project,
        pts_before,
    )

    report_status = {

        "valid":
            coverage["coverage"] >= 25,

        "coverage":
            coverage["coverage"],

        "label":
            coverage["label"],
    }

    # =====================
    # CLEAN ZONES
    # =====================

    #for z in zones:

    #    poly = z.get("polygon", [])

    #    poly = simplify_polygon(poly)

    #    if is_rectangle(poly):

    #        poly = normalize_rectangle(poly)

    #    z["polygon"] = poly

    #zones = align_rooms(zones)

    # =====================
    # ZONE ASSIGNMENT
    # =====================

    for p in pts_before:

        p["zone_type"] = None

        for z in zones:

            if point_in_polygon(p["x"], p["y"], z.get("polygon", [])):

                p["zone_type"] = z.get("type")

                break

    # =====================
    # SOURCE ATTRIBUTION
    # =====================

  

    for p in pts_before:

        attr = compute_source_attribution(p, sources)


        p["attribution"] = attr

        if attr:

            p["dominant_source"] = max(attr, key=attr.get)

              

        else:

            p["dominant_source"] = None


    source_debug = {}

    for p in pts_before:

        ds = p.get(
            "dominant_source"
        )

        if ds:

            source_debug[ds] = (
                source_debug.get(ds, 0)
                + 1
            )

    

    source_summary = build_source_summary(
        sources,
        pts_before,
    )

   
    top_sources = source_summary[:3]


    # =====================
    # SCORES
    # =====================

    def avg(arr):

        return sum(arr) / len(arr) if arr else 0

    avg_sbm = avg([p["m"]["rf"] for p in pts_before])

    avg_icnirp = avg_sbm

    # =====================
    # TOP POINTS
    # =====================

    top_points = sorted(
        pts_before, key=lambda p: p.get("m", {}).get("rf", 0), reverse=True
    )[:10]

    # =====================
    # WORST POINT
    # =====================

    worst_point = max(
        pts_before, key=lambda p: p.get("m", {}).get("rf", 0), default=None
    )


    
    # =====================
    # ASSIGN ZONE RISK
    # =====================

    for z in zones:

        name = z.get("name")

        match = next((r for r in room_summary if r["room"] == name), None)

        if match:

            z["risk"] = match["risk"]


    # =====================
    # FORCE ZONE HEATMAP
    # =====================

    heatmap_points = []

    for z in zones:

        for gp in z.get("grid", []):

            m = gp.get(
                "measurements",
                {}
            ).get(
                sessionA,
                {}
            )

            if not m:
                continue

            heatmap_points.append({

                "id":
                    gp.get("id"),

                "x":
                    gp.get("x"),

                "y":
                    gp.get("y"),

                "m": {

                    "rf":
                        m.get("rf", 0),

                    "electric":
                        m.get(
                            "electric",
                            0
                        ),

                    "magnetic":
                        m.get(
                            "magnetic",
                            0
                        ),

                    "height":
                        m.get(
                            "height",
                            120
                        ),
                },
            })

   

    # =====================
    # HEATMAP
    # =====================

    heatmap_path = None

    try:

        from PIL import Image as PILImage

        base = PILImage.new("RGBA", (600, 450), (255, 255, 255))

        img, _, _ = render_heatmap(
            base,
            heatmap_points,
            normalize_sbm,
            rooms=rooms,
            zones=zones,
            sources=sources
        )

        import os

        output_dir = os.path.join(os.path.dirname(__file__), "../output")

        os.makedirs(output_dir, exist_ok=True)

        heatmap_path = os.path.join(output_dir, "heatmap.png")

        img.save(heatmap_path)

        

    except Exception as e:

        print("⚠ HEATMAP ERROR:", e)

    # =====================
    # FLOOR-SPECIFIC ANALYSIS
    # =====================
    #
    # Keep each floor as an independent structure.
    # Existing global rooms / zones / sources / points
    # remain untouched for the other PDF pages.
    #

    floor_analysis = []

    for floor_index, floor in enumerate(
        project.get(
            "floors",
            [],
        )
    ):

        floor_name = floor.get(
            "name",
            f"Floor {floor_index + 1}",
        )

        floor_rooms = floor.get(
            "rooms",
            [],
        )

        floor_zones = floor.get(
            "zones",
            [],
        )

        floor_sources = floor.get(
            "sources",
            [],
        )

        # --------------------------------------------------
        # POINTS BELONGING TO THIS FLOOR
        # --------------------------------------------------

        floor_points = [
            point
            for point in pts_before
            if point.get("floor") == floor_name
        ]

        floor_points_after = [
            point
            for point in pts_after
            if point.get("floor") == floor_name
        ]

        floor_analysis.append(
            {
                "index": floor_index,

                "id": floor.get(
                    "id",
                    floor_index,
                ),

                "name": floor_name,

                # ------------------------------------------
                # FLOOR PLAN
                # ------------------------------------------

                "imageData": floor.get(
                    "imageData",
                ),

                "image": floor.get(
                    "image",
                ),

                "canvasWidth": floor.get(
                    "canvasWidth",
                ),

                "canvasHeight": floor.get(
                    "canvasHeight",
                ),

                "imageWidth": floor.get(
                    "imageWidth",
                ),

                "imageHeight": floor.get(
                    "imageHeight",
                ),

                # ------------------------------------------
                # FLOOR OBJECTS
                # ------------------------------------------

                "rooms": floor_rooms,

                "zones": floor_zones,

                "sources": floor_sources,

                # ------------------------------------------
                # FLOOR MEASUREMENTS
                # ------------------------------------------

                "points": floor_points,

                "points_after": floor_points_after,
            }
        )


  

    # =====================
    # FINAL STRUCTURE
    # =====================

    zone_summary = build_zone_summary(
        pts_before,
        zones,
    )

    print(
        "PROJECT IMAGE:",
        project.get(
            "image",
        )
    )

    print(
        "PROJECT KEYS:",
        project.keys()
    )

    floors = project.get(
        "floors",
        []
    )

    print(
        "FLOOR COUNT:",
        len(floors)
    )

    if floors:

        floor = floors[0]

        print(
            "FLOOR KEYS:",
            floor.keys()
        )

        print(
            "IMAGE DATA EXISTS:",
            "imageData" in floor
        )

        print(
            "IMAGE EXISTS:",
            "image" in floor
        )


    # =====================
    # PLAN IMAGE
    # =====================

    plan_image = None

    floors = project.get(
        "floors",
        [],
    )

    # 🔥 DEBUG
    print("\n=== PROJECT DEBUG ===")
    print("FLOORS COUNT:", len(floors))

    if floors:

        floor = floors[0]

        print("\n=== FLOOR DEBUG ===")
        print("FLOOR KEYS:")

        if isinstance(floor, dict):
            print(list(floor.keys()))

            print(
                "canvasWidth:",
                floor.get("canvasWidth")
            )

            print(
                "canvasHeight:",
                floor.get("canvasHeight")
            )

            print(
                "imageWidth:",
                floor.get("imageWidth")
            )

            print(
                "imageHeight:",
                floor.get("imageHeight")
            )

    plan_image = None

    if floors:

        plan_image = floors[0].get(
            "imageData"
        )

        if plan_image:

            import base64
            import io
            from PIL import Image as PILImage

            raw = plan_image.split(",")[1]

            img = PILImage.open(
                io.BytesIO(
                    base64.b64decode(raw)
                )
            )

            print(
                "🚨 ORIGINAL IMAGE SIZE:",
                img.size
            )

        from io import BytesIO
        import base64
        from PIL import Image

        if plan_image:

            raw = plan_image.split(",")[1]

            img = Image.open(
                BytesIO(
                    base64.b64decode(raw)
                )
            )

            print(
                "ORIGINAL PLAN SIZE:",
                img.size
            )

        print(
            "PLAN IMAGE FOUND:",
            bool(plan_image)
        )

    print(
        "🔥 BUSINESS ANALYSIS USED"
    )

    analysis = {

        # =====================
        # RAW DATA
        # =====================

        "floors":
            floor_analysis,

        # =====================
        # MEASUREMENT CONFIGURATION
        # =====================

        "measurement_scope":
            measurement_scope,

        # Raw room objects
        "rooms":
            rooms,

        # Normalized Room PDF models
        "room_overviews":
            room_overviews,

        "points_before": pts_before,

        "points_after": pts_after,

        "points": pts_before,

        "zones": zones,
        "sources": sources,

        # =====================
        # BUSINESS SUMMARIES
        # =====================

        "room_summary": room_summary,
        "source_summary": source_summary,
        "top_sources": top_sources,
        "zone_summary": zone_summary,
     

        # COVERAGE
        "coverage": coverage,
        "report_status": report_status,

        # =====================
        # SESSION COMPARISON
        # =====================

        "session": session_data,

        # =====================
        # SCORES
        # =====================

        "scores": {

            "sbm": {

                "score": avg_sbm,

                "label": (
                    "Low"
                    if avg_sbm < 30
                    else "Moderate"
                    if avg_sbm < 70
                    else "High"
                ),
            },

            "icnirp": {

                "score": avg_icnirp,

                "label": (
                    "Low"
                    if avg_icnirp < 30
                    else "Moderate"
                    if avg_icnirp < 70
                    else "High"
                ),
            },
        },

        "summary": {

            "score": min(
                round(avg_sbm),
                100,
            ),

            "label": (

                "Critical"
                if avg_sbm < 20

                else "High"
                if avg_sbm < 40

                else "Moderate"
                if avg_sbm < 60

                else "Good"
                if avg_sbm < 80

                else "Excellent"
            ),
        },

        # =====================
        # FINDINGS
        # =====================

        "top_points": top_points,

        "worst_point": worst_point,

        # =====================
        # RECOMMENDATIONS
        # =====================

        "recommendations": [],

        # =====================
        # VISUALS
        # =====================

        "heatmap_path": heatmap_path,

        "plan_image": plan_image
              
    }

    # =====================
    # RECOMMENDATIONS
    # =====================

    analysis["recommendations"] = (
        build_recommendations(
            analysis,
        )
    )

    # =====================
    # HOME RECOMMENDATIONS
    # =====================

    analysis["home_recommendations"] = (
        build_home_recommendations(
            analysis,
        )
    )

    # =====================
    # CONFIDENCE
    # =====================

    analysis["confidence"] = compute_confidence(
        analysis,
    )

    analysis["sleep"] = analyze_sleep_zones(
        zones,
    )

    analysis["room_health"] = build_room_health_index(
        zones,
    )

    analysis["mitigation"] = build_mitigation_matrix(
        analysis.get(
            "recommendations",
            [],
        )
    )

    analysis["environment"] = compute_environmental_quality(
        analysis,
    )

    analysis["narrative"] = build_environment_narrative(
        analysis,
    )

    analysis["certification"] = build_certification(
        analysis,
    )

    analysis["compliance"] = build_compliance(
        analysis,
    )

    analysis["hotspots"] = build_hotspots(
        pts_before,
    )

    print(
        "ROOMS:",
        len(
            analysis.get(
                "room_summary",
                []
            )
        )
    )

    print(
        "SOURCES:",
        len(
            analysis.get(
                "source_summary",
                []
            )
        )
    )

    print(
        "ZONES:",
        len(
            analysis.get(
                "zones",
                []
            )
        )
    )

   

    return analysis
