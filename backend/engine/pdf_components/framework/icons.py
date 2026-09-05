"""
PHI Design System

Central Icon Registry
"""

from pathlib import Path


ICON_DIR = (
    Path(__file__)
    .parents[2]
    / "assets"
    / "icons"
)


ICONS = {

    # ======================================================
    # BRANDING
    # ======================================================

    "logo": ICON_DIR / "phi_logo.png",
    "logo_dark": ICON_DIR / "phi_logo1.png",
    "logo_light": ICON_DIR / "phi_logo2.png",

    # ======================================================
    # PLATFORM
    # ======================================================

    "dashboard": ICON_DIR / "dashboard.png",
    "summary": ICON_DIR / "summary.png",
    "assessment": ICON_DIR / "assessment.png",
    "analysis": ICON_DIR / "analysis.png",
    "report": ICON_DIR / "report.png",
    "pdf": ICON_DIR / "pdf.png",
    "export": ICON_DIR / "export.png",
    "settings": ICON_DIR / "settings.png",
    "ai": ICON_DIR / "ai.png",
    "database": ICON_DIR / "database.png",

    # ======================================================
    # PROPERTY
    # ======================================================

    "property": ICON_DIR / "property.png",
    "address": ICON_DIR / "address.png",
    "location": ICON_DIR / "location.png",
    "map": ICON_DIR / "map.png",

    # ======================================================
    # BUILDING
    # ======================================================

    "floors": ICON_DIR / "floors.png",
    "rooms": ICON_DIR / "rooms.png",
    "zones": ICON_DIR / "zones.png",

    "bedroom": ICON_DIR / "bedroom.png",
    "living_room": ICON_DIR / "living_room.png",
    "kitchen": ICON_DIR / "kitchen.png",
    "bathroom": ICON_DIR / "bathroom.png",
    "office": ICON_DIR / "office.png",
    "garage": ICON_DIR / "garage.png",

    "door": ICON_DIR / "door.png",
    "window": ICON_DIR / "window.png",
    "stairs": ICON_DIR / "stairs.png",

    # ======================================================
    # MEASUREMENTS
    # ======================================================

    "measurement": ICON_DIR / "measurements.png",
    "measurements": ICON_DIR / "measurements.png",
    "measurement_point": ICON_DIR / "measurement_point.png",

    "coverage": ICON_DIR / "coverage.png",
    "heatmap": ICON_DIR / "heatmap.png",

    "health_score": ICON_DIR / "health_score.png",
    "heartbeat": ICON_DIR / "heartbeat.png",

    # ======================================================
    # EMF SOURCES
    # ======================================================

    "rf": ICON_DIR / "rf.png",
    "electric": ICON_DIR / "electric.png",
    "magnetic": ICON_DIR / "magnetic.png",
    "dirty_electricity": ICON_DIR / "dirty_electricity.png",

    "wifi": ICON_DIR / "wifi.png",
    "router": ICON_DIR / "router.png",
    "bluetooth": ICON_DIR / "bluetooth.png",

    "mobile_tower": ICON_DIR / "mobile_tower.png",
    "power_line": ICON_DIR / "power_line.png",
    "transformer": ICON_DIR / "transformer.png",
    "smart_meter": ICON_DIR / "smart_meter.png",

    "solar": ICON_DIR / "solar.png",
    "battery": ICON_DIR / "battery.png",

    "electric_vehicle": ICON_DIR / "eletric_vehicle.png",

    "cloud": ICON_DIR / "cloud.png",
    "spectrum": ICON_DIR / "spectrum.png",

    # ======================================================
    # STATUS
    # ======================================================

    "shield": ICON_DIR / "shield.png",
    "safe": ICON_DIR / "safe.png",
    "check": ICON_DIR / "check.png",

    "warning": ICON_DIR / "warning.png",
    "critical": ICON_DIR / "critical.png",

    "clipboard": ICON_DIR / "clipboard.png",
    "recommendation": ICON_DIR / "recommendation.png",

    # ======================================================
    # USERS
    # ======================================================

    "user": ICON_DIR / "user.png",
    "consultant": ICON_DIR / "consultant.png",

    # ======================================================
    # TIME
    # ======================================================

    "calendar": ICON_DIR / "calendar.png",


    "finding": ICON_DIR / "finding.png",
    "priority": ICON_DIR / "priority.png",
    "info": ICON_DIR / "info.png",
    "success": ICON_DIR / "success.png",

    "danger": ICON_DIR / "critical.png",
    "fail": ICON_DIR / "critical.png",

    "good": ICON_DIR / "safe.png",
    "low": ICON_DIR / "safe.png",

    "moderate": ICON_DIR / "warning.png",
    "medium": ICON_DIR / "warning.png",
}


def get_icon(name):
    """
    Return absolute icon path.
    """

    path = ICONS.get(name)

    if path is None:
        return None

    return str(path)