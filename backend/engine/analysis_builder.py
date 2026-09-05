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

print(
    "🔥🔥🔥 ANALYSIS_BUILDER IMPORTED 🔥🔥🔥"
)

import math

from engine.utils import (
    simplify_polygon,
    align_rooms,
    point_in_polygon,
    is_rectangle,
    normalize_rectangle,
)

from engine.analysis.business.recommendations import (
    build_recommendations,
)

from engine.analysis.heatmap.heatmap import (
    render_heatmap,
)

from engine.sessions import compare_frameworks

from engine.analysis.common.helpers.score_helpers import (
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

from engine.analysis.home.home_recommendations_builder import (
    build_home_recommendations,
)

# =====================
# HELPER
# =====================


def compute_source_attribution(point, sources):

    print("✅ USING ANALYSIS BUILDER ATTRIBUTION")

    weights = []

    for s in sources:

        dx = point["x"] - s["x"]
        dy = point["y"] - s["y"]

        dist = math.sqrt(dx * dx + dy * dy) + 1

        power = s.get("power", 1.0)

        weight = power / dist

        weights.append((s, weight))

    total = sum(w for _, w in weights)

    result = {}


    
def build_analysis(project, sessionA, sessionB):

    # =====================
    # RAW DATA
    # =====================

    floors = project.get("floors", [])

    zones = []
    sources = []

    for floor in floors:

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

        print(
            "✅ FINAL SOURCES:",
            len(sources)
        )

        for s in sources:

            print(
                "SOURCE:",
                s.get("type"),
                s.get("id"),
            )

    pts_before = []
    pts_after = []

    # =====================
    # COLLECT POINTS
    # =====================

    for f in floors:

        for r in f.get("rooms", []):

            for g in r.get("grid", []):

                measurements = g.get("measurements", {})

                # =====================
                # SESSION A
                # =====================

                if sessionA in measurements:

                    mm = measurements[sessionA]

                    pts_before.append(
                        {
                            "id": g.get("id"),
                            "x": g["x"],
                            "y": g["y"],
                            "room": r.get("name"),
                            "floor": f.get("name"),
                            "m": {
                                "rf": mm.get("rf", 0),
                                "electric": mm.get("electric", 0),
                                "magnetic": mm.get("magnetic", 0),
                                "height": mm.get("height", 120),
                            },
                        }
                    )

                # =====================
                # SESSION B
                # =====================

                if sessionB and sessionB in measurements:

                    mm = measurements[sessionB]

                    pts_after.append(
                        {
                            "id": g.get("id"),
                            "x": g["x"],
                            "y": g["y"],
                            "room": r.get("name"),
                            "floor": f.get("name"),
                            "m": {
                                "rf": mm.get("rf", 0),
                                "electric": mm.get("electric", 0),
                                "magnetic": mm.get("magnetic", 0),
                                "height": mm.get("height", 120),
                            },
                        }
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


    # =====================
    # CLEAN ZONES
    # =====================

    print(
        "ZONE NORMALIZATION DISABLED"
    )

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
    # ROOM SUMMARY
    # =====================

    room_summary = {}

    for p in pts_before:

        room = p.get("room", "Unknown")

        if room not in room_summary:

            room_summary[room] = {"room": room, "values": []}

        room_summary[room]["values"].append(p["m"]["rf"])

    final_rooms = []

    for r in room_summary.values():

        vals = r["values"]

        avg_rf = avg(vals)

        max_rf = max(vals) if vals else 0

        # =====================
        # SBM CLASS
        # =====================

        if avg_rf < 30:

            sbm = "Low"
            risk = "low"

        elif avg_rf < 100:

            sbm = "Moderate"
            risk = "moderate"

        else:

            sbm = "High"
            risk = "high"

        final_rooms.append(
            {
                "room": r["room"],
                "avg_rf": avg_rf,
                "max_rf": max_rf,
                "sbm": sbm,
                "risk": risk,
            }
        )

    room_summary = final_rooms

    # =====================
    # SOURCE SUMMARY
    # =====================

    source_summary = []

    for s in sources:

        source_summary.append({

            "id":
                s.get("id"),

            "type":
                s.get("type"),

            "distance":
                s.get(
                    "exactDistance"
                ),

            "direction":
                s.get(
                    "direction"
                ),

            "placement":
                s.get(
                    "placementMode"
                )
        })

    # =====================
    # ASSIGN ZONE RISK
    # =====================

    for z in zones:

        name = z.get("name")

        match = next((r for r in room_summary if r["room"] == name), None)

        if match:

            z["risk"] = match["risk"]

    # =====================
    # HEATMAP
    # =====================

    heatmap_path = None

    try:

        from PIL import Image as PILImage

        base = PILImage.new("RGBA", (600, 450), (255, 255, 255))

        img, _, _ = render_heatmap(
            base, pts_before, normalize_sbm, zones=zones, sources=sources
        )

        print("FIRST ZONE POLYGON:")
        print(
            zones[0]["polygon"]
        )

        import os

        output_dir = os.path.join(os.path.dirname(__file__), "../output")

        os.makedirs(output_dir, exist_ok=True)

        heatmap_path = os.path.join(output_dir, "heatmap.png")

        img.save(heatmap_path)

        

    except Exception as e:

        print("⚠ HEATMAP ERROR:", e)

    # =====================
    # FINAL STRUCTURE
    # =====================

    print(
        "🔥 ANALYSIS BUILDER USED"
    )

    import os

    print(
        "🔥🔥🔥🔥🔥 ANALYSIS BUILDER FILE:",
        os.path.abspath(__file__),
    )

    print(
        "🔥🔥🔥 SUMMARY SCORE SOURCE:",
        avg_sbm,
    )

    print(
        "🔥🔥🔥 SUMMARY LABEL SOURCE:",
        (
            "Low"
            if avg_sbm < 30
            else "Moderate"
            if avg_sbm < 70
            else "High"
        ),
    )

    analysis = {
        "points_before": pts_before,
        "points_after": pts_after,
        "zones": zones,
        "session": session_data,
        "sources": sources,
        "scores": {
            "sbm": {
                "score": avg_sbm,
                "label": (
                    "Low" if avg_sbm < 30 else "Moderate" if avg_sbm < 70 else "High"
                ),
            },
            "icnirp": {
                "score": avg_icnirp,
                "label": (
                    "Low"
                    if avg_icnirp < 30
                    else "Moderate" if avg_icnirp < 70 else "High"
                ),
            },
        },
        "summary": {
            "score": avg_sbm,
            "label": (
                "Low" if avg_sbm < 30 else "Moderate" if avg_sbm < 70 else "High"
            ),
        },
        "top_points": top_points,

        "room_summary":
            room_summary,

        "source_summary":
            source_summary,

        "worst_point":
            worst_point,

        "heatmap_path": heatmap_path,
        "plan_image": project.get(
            "image",
        ),
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

    