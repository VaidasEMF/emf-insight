# =====================
# SOURCES MODULE
# =====================

"""
Atsakingas už:

✔ EMF šaltinių modeliavimą
✔ atstumo slopinimą (attenuation)
✔ sienų slopinimą
✔ kryptinį poveikį (optional)
"""

import math

from engine.source_profiles import (
    SOURCE_PROFILES,
)

# =====================
# BASIC ATTENUATION
# =====================


def distance_decay(d, power=1.0, spread=100):
    """
    Eksponentinis slopinimas nuo atstumo
    """
    return power * math.exp(-d / spread)


# =====================
# WALL ATTENUATION
# =====================


def apply_wall_loss(value, walls=0):
    """
    Kiekviena siena sumažina signalą
    """
    # pvz: -30% per sieną
    loss_per_wall = 0.7

    return value * (loss_per_wall**walls)


# =====================
# DIRECTIONAL FACTOR
# =====================


def directional_factor(source, x, y):
    """
    Jei šaltinis kryptinis (pvz bokštas)
    """

    direction = source.get("direction")

    if not direction:
        return 1.0

    sx, sy = source["x"], source["y"]

    dx = x - sx
    dy = y - sy

    angle = math.degrees(math.atan2(dy, dx))

    diff = abs(angle - direction)

    # jei labai nukrypęs → silpniau
    if diff > 90:
        return 0.3
    elif diff > 45:
        return 0.6
    else:
        return 1.0


# =====================
# SOURCE IMPACT
# =====================


def compute_source_impact(source, x, y):
    """
    Apskaičiuoja vieno šaltinio įtaką taške
    """

    sx = source.get("x", 0)
    sy = source.get("y", 0)

    dx = x - sx
    dy = y - sy

    d = math.hypot(dx, dy)

    base_power = source.get("power", 1.0)

    # atstumo slopinimas
    val = distance_decay(d, base_power)

    # sienos
    walls = source.get("walls", 0)
    val = apply_wall_loss(val, walls)

    # kryptis
    val *= directional_factor(source, x, y)

    return val


# =====================
# COMBINE SOURCES
# =====================


def compute_sources_field(x, y, sources):
    """
    Sudeda visų šaltinių poveikį
    """

    total = 0

    for s in sources:
        try:
            total += compute_source_impact(s, x, y)
        except:
            continue

    return total


# =====================
# PRESET SOURCE TYPES
# =====================


def build_source(x, y, type="wifi"):
    """
    Greitas šaltinio sukūrimas
    """

    if type == "wifi":
        return {"type": "wifi", "x": x, "y": y, "power": 1.0, "spread": 120}

    if type == "tower":
        return {
            "type": "tower",
            "x": x,
            "y": y,
            "power": 3.0,
            "spread": 300,
            "direction": 0,
        }

    if type == "smart_meter":
        return {"type": "smart_meter", "x": x, "y": y, "power": 2.0, "spread": 150}

    # default
    return {"type": "generic", "x": x, "y": y, "power": 1.0, "spread": 100}




# =====================
# GET PROFILE
# =====================


def get_source_profile(source_type):

    return SOURCE_PROFILES.get(
        source_type,
        {
            "label": "Unknown Source",
            "risk": "moderate",
            "weight": 1.0,
        },
    )


# =====================
# COMPUTE SOURCE LOAD
# =====================


def compute_source_load(sources):

    results = []

    for s in sources:

        source_type = s.get(
            "type",
            "unknown",
        )

        profile = get_source_profile(
            source_type,
        )

        impact = round(profile["weight"] * 100)

        results.append(
            {
                "type": source_type,
                "label": profile["label"],
                "risk": profile["risk"],
                "impact": impact,
            }
        )

    return sorted(
        results,
        key=lambda x: x["impact"],
        reverse=True,
    )



# =====================
# PRIMARY SOURCE
# =====================


def get_primary_source(
    sources,
):

    if not sources:

        return None

    ranked = []

    for s in sources:

        profile = get_source_profile(
            s.get("type"),
        )

        ranked.append(
            (
                profile["weight"],
                s,
            )
        )

    ranked.sort(
        key=lambda x: x[0],
        reverse=True,
    )

    return ranked[0][1]
