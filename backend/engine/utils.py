# =====================
# UTILS MODULE
# =====================

"""
Bendros pagalbinės funkcijos:

✔ safe parsing (float, int)
✔ clamp / normalize
✔ dict ir list helperiai
✔ session suradimas
✔ projekto traversal helperiai
"""


def straighten_polygon(polygon, threshold=10):
    """
    Jei linija beveik horizontali / vertikali → ištiesina
    """
    if len(polygon) < 2:
        return polygon

    new_poly = [polygon[0]]

    for i in range(1, len(polygon)):
        p1 = new_poly[-1]
        p2 = polygon[i]

        dx = abs(p2["x"] - p1["x"])
        dy = abs(p2["y"] - p1["y"])

        # beveik vertikali
        if dx < threshold:
            p2["x"] = p1["x"]

        # beveik horizontali
        elif dy < threshold:
            p2["y"] = p1["y"]

        new_poly.append(p2)

    return new_poly


def simplify_polygon(poly, step=2):
    if not poly or len(poly) < 6:
        return poly
    return poly[::step]


import math


def is_rectangle(poly, angle_threshold=15):
    """
    Tikrina ar polygon panašus į stačiakampį
    """
    if len(poly) < 4:
        return False

    def angle(p1, p2, p3):
        a = (p1["x"] - p2["x"], p1["y"] - p2["y"])
        b = (p3["x"] - p2["x"], p3["y"] - p2["y"])

        dot = a[0] * b[0] + a[1] * b[1]
        mag_a = math.hypot(*a)
        mag_b = math.hypot(*b)

        if mag_a * mag_b == 0:
            return 0

        cos_angle = dot / (mag_a * mag_b)
        angle_deg = math.degrees(math.acos(max(min(cos_angle, 1), -1)))

        return angle_deg

    angles = []

    for i in range(len(poly)):
        p1 = poly[i - 1]
        p2 = poly[i]
        p3 = poly[(i + 1) % len(poly)]

        ang = angle(p1, p2, p3)
        angles.append(ang)

    # tikrinam ar visi kampai ~90°
    for ang in angles:
        if abs(ang - 90) > angle_threshold:
            return False

    return True


def point_in_polygon(x, y, polygon):
    """
    Ray casting algoritmas
    """
    inside = False
    n = len(polygon)

    for i in range(n):
        x1, y1 = polygon[i]["x"], polygon[i]["y"]
        x2, y2 = polygon[(i + 1) % n]["x"], polygon[(i + 1) % n]["y"]

        if ((y1 > y) != (y2 > y)) and (
            x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-9) + x1
        ):
            inside = not inside

    return inside


def normalize_rectangle(poly):
    """
    Padaro idealiai stačiakampį iš beveik stačiakampio
    """
    xs = [p["x"] for p in poly]
    ys = [p["y"] for p in poly]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    return [
        {"x": min_x, "y": min_y},
        {"x": max_x, "y": min_y},
        {"x": max_x, "y": max_y},
        {"x": min_x, "y": max_y},
        {"x": min_x, "y": min_y},
    ]


def align_rooms(zones, threshold=10):
    """
    Sulygina kambarių sienas pagal X ir Y
    """
    all_x = []
    all_y = []

    # surenkam visus x ir y
    for z in zones:
        for p in z.get("polygon", []):
            all_x.append(p["x"])
            all_y.append(p["y"])

    # helper: grupuoja reikšmes
    def cluster(values):
        groups = []
        for v in values:
            placed = False
            for g in groups:
                if abs(g[0] - v) < threshold:
                    g.append(v)
                    placed = True
                    break
            if not placed:
                groups.append([v])
        return [int(sum(g) / len(g)) for g in groups]

    aligned_x = cluster(all_x)
    aligned_y = cluster(all_y)

    # helper: rasti artimiausią
    def snap(val, candidates):
        return min(candidates, key=lambda c: abs(c - val))

    # pritaikom
    for z in zones:
        for p in z.get("polygon", []):
            p["x"] = snap(p["x"], aligned_x)
            p["y"] = snap(p["y"], aligned_y)

    return zones


# =====================
# SAFE PARSE
# =====================


def safe_float(val, default=0.0):
    try:
        return float(val)
    except:
        return default


def safe_int(val, default=0):
    try:
        return int(val)
    except:
        return default


# =====================
# CLAMP
# =====================


def clamp(v, vmin=0.0, vmax=1.0):
    return max(vmin, min(vmax, v))


# =====================
# NORMALIZE VALUE
# =====================


def normalize(v, vmin, vmax):
    if vmax - vmin == 0:
        return 0
    return (v - vmin) / (vmax - vmin)


# =====================
# GET FIRST ELEMENT
# =====================


def get_first(lst, default=None):
    if lst and len(lst) > 0:
        return lst[0]
    return default


# =====================
# FIND AVAILABLE SESSIONS
# =====================


def find_available_sessions(project: dict):
    sessions = set()

    for f in project.get("floors", []):
        for r in f.get("rooms", []):
            for g in r.get("grid", []):
                measurements = g.get("measurements", {})
                for key in measurements.keys():
                    sessions.add(key)

    return list(sessions)


# =====================
# GET FIRST AVAILABLE SESSION
# =====================


def get_first_session(project: dict, default="session_1"):
    sessions = find_available_sessions(project)

    if sessions:
        return sessions[0]

    return default


# =====================
# SAFE GET NESTED
# =====================


def safe_get(dct, *keys, default=None):
    current = dct

    for k in keys:
        if isinstance(current, dict):
            current = current.get(k)
        else:
            return default

        if current is None:
            return default

    return current


# =====================
# FLATTEN POINTS (optional)
# =====================


def flatten_points(project):
    pts = []

    for f in project.get("floors", []):
        for r in f.get("rooms", []):
            for g in r.get("grid", []):
                pts.append(g)

    return pts


# =====================
# DEBUG PRINT (SAFE)
# =====================


def debug_print(title, data, limit=3):
    print(f"\n=== {title} ===")

    if isinstance(data, list):
        print(f"Total items: {len(data)}")
        for i, item in enumerate(data[:limit]):
            print(f"[{i}]: {item}")
    else:
        print(data)
