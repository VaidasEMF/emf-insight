# =====================
# ZONES MODULE
# =====================

"""
Atsakingas už:

✔ zonų (lova, darbo vieta) aprašymą
✔ point-in-polygon patikrinimą
✔ height override logiką
"""

# =====================
# POINT IN POLYGON
# =====================


def point_in_polygon(x, y, polygon):
    """
    Ray casting algoritmas

    polygon: [(x1,y1), (x2,y2), ...]
    """

    inside = False
    n = len(polygon)

    if n < 3:
        return False

    p1x, p1y = polygon[0]

    for i in range(n + 1):
        p2x, p2y = polygon[i % n]

        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y + 1e-9) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside

        p1x, p1y = p2x, p2y

    return inside


# =====================
# GET HEIGHT FOR PIXEL
# =====================


def get_zone_height(x, y, zones, default_height=120):
    """
    Jei taškas patenka į zoną → grąžina jos height
    """

    if not zones:
        return default_height

    for z in zones:
        polygon = z.get("polygon")
        if not polygon:
            continue

        if point_in_polygon(x, y, polygon):
            return z.get("height", default_height)

    return default_height


# =====================
# APPLY ZONES TO POINTS
# =====================


def apply_zones_to_points(points, zones):
    """
    Kiekvienam point priskiria zoną (jei patenka)
    """

    if not zones:
        return points

    updated = []

    for p in points:
        x = p.get("x")
        y = p.get("y")

        new_p = p.copy()

        for z in zones:
            if point_in_polygon(x, y, z.get("polygon", [])):
                new_p["zone"] = z.get("type", "custom")
                new_p["m"]["height"] = z.get("height", 120)

        updated.append(new_p)

    return updated


# =====================
# DRAW ZONES (PDF)
# =====================


def draw_zones(draw, zones):
    """
    Nupiešia zonų ribas ant heatmap (pvz lova)
    """

    if not zones:
        return

    for z in zones:
        polygon = z.get("polygon")

        if not polygon:
            continue

        # kontūras
        draw.polygon(polygon, outline=(0, 100, 255))

        # label
        label = f"{z.get('type', 'zone')} ({z.get('height')} cm)"

        x, y = polygon[0]
        draw.text((x + 5, y + 5), label, fill=(0, 0, 0))
