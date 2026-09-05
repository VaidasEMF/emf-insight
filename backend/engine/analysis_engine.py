# =====================
# IMPORTS
# =====================
from engine.config import THRESHOLDS


# =====================
# GET THRESHOLDS
# =====================
def get_thresholds(measure_type):
    return THRESHOLDS.get(measure_type, THRESHOLDS["rf"])


from engine.config import THRESHOLDS


def get_thresholds(measure_type, zone_type=None):

    base = THRESHOLDS.get(measure_type, THRESHOLDS["rf"])

    warning = base["warning"]
    danger = base["danger"]

    # 🔥 ZONE ADJUSTMENTS
    if zone_type == "bed":
        warning *= 0.3
        danger *= 0.5

    elif zone_type == "work":
        warning *= 0.7
        danger *= 0.8

    return {"warning": warning, "danger": danger}


# =====================
# 🔥 POINT IN POLYGON
# =====================
def point_in_polygon(x, y, polygon):

    inside = False
    j = len(polygon) - 1

    for i in range(len(polygon)):

        xi, yi = polygon[i]["x"], polygon[i]["y"]
        xj, yj = polygon[j]["x"], polygon[j]["y"]

        intersect = ((yi > y) != (yj > y)) and (
            x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi
        )

        if intersect:
            inside = not inside

        j = i

    return inside


def apply_risk(points, zones=None):

    for p in points:

        value = p.get("rf", 0)

        zone_type = None

        # =====================
        # 🔥 DETECT ZONE
        # =====================
        if zones:
            for z in zones:

                poly = z.get("polygon", [])

                if not poly:
                    continue

                if point_in_polygon(p["x"], p["y"], poly):
                    zone_type = z.get("type")
                    break

        t = get_thresholds("rf", zone_type)

        # =====================
        # 🔥 RISK
        # =====================
        if value > t["danger"]:
            p["risk"] = "high"
        elif value > t["warning"]:
            p["risk"] = "moderate"
        else:
            p["risk"] = "low"

        p["zone"] = zone_type

    return points


# =====================
# 🔥 PROJECT ANALYSIS
# =====================


def analyze_project(project):

    return {
        "risk": "low",
        "summary": "Analysis placeholder",
        "recommendations": [],
    }
