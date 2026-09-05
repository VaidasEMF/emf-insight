# =====================
# SOURCE PROFILES
# =====================

SOURCE_PROFILES = {
    # =====================
    # RF SOURCES
    # =====================
    "wifi": {
        "label": "WiFi Network",
        "risk": "moderate",
        "weight": 1.0,
        "category": "rf",
    },
    "router": {
        "label": "Wireless Router",
        "risk": "moderate",
        "weight": 1.2,
        "category": "rf",
    },
    "tower": {
        "label": "Mobile Tower",
        "risk": "high",
        "weight": 2.5,
        "category": "rf",
    },
    "smart_meter": {
        "label": "Smart Meter",
        "risk": "high",
        "weight": 2.0,
        "category": "rf",
    },

    # =====================
    # FRONTEND ALIASES
    # =====================

    "wifi_router": {
        "label": "WiFi Router",
        "risk": "moderate",
        "weight": 1.2,
        "category": "rf",
    },

    "mobile_tower": {
        "label": "Mobile Tower",
        "risk": "high",
        "weight": 2.5,
        "category": "rf",
    },

    # =====================
    # ELECTRICAL
    # =====================
    "substation": {
        "label": "Electrical Substation",
        "risk": "high",
        "weight": 3.0,
        "category": "magnetic",
    },
    "electrical_panel": {
        "label": "Electrical Panel",
        "risk": "moderate",
        "weight": 1.6,
        "category": "magnetic",
    },
    "hv_line": {
        "label": "High Voltage Line",
        "risk": "high",
        "weight": 3.2,
        "category": "magnetic",
    },


        "power_lines": {
        "label": "Power Lines",
        "risk": "high",
        "weight": 3.2,
        "category": "magnetic",
    },
    # =====================
    # ENERGY
    # =====================
    "solar": {
        "label": "Solar System",
        "risk": "low",
        "weight": 1.0,
        "category": "electrical",
    },
    "battery_storage": {
        "label": "Battery Storage",
        "risk": "moderate",
        "weight": 1.8,
        "category": "electrical",
    },
    "ev_charger": {
        "label": "EV Charger",
        "risk": "moderate",
        "weight": 1.7,
        "category": "magnetic",
    },

        "battery_storage": {
        "label": "Battery Storage",
        "risk": "moderate",
        "weight": 1.8,
        "category": "electrical",
    },
    # =====================
    # APPLIANCES
    # =====================
    "heat_pump": {
        "label": "Heat Pump / AC",
        "risk": "moderate",
        "weight": 1.3,
        "category": "magnetic",
    },
    "electric_stove": {
        "label": "Electric Stove",
        "risk": "moderate",
        "weight": 1.5,
        "category": "magnetic",
    },
    "water_heater": {
        "label": "Water Heater",
        "risk": "low",
        "weight": 1.0,
        "category": "electrical",
    },
    "wind_turbine": {
        "label": "Wind Turbine",
        "risk": "moderate",
        "weight": 2.0,
        "category": "rf",
    },


        "generic": {
        "label": "Generic EMF Source",
        "risk": "moderate",
        "weight": 1.0,
        "category": "mixed",
    },

    
}



# =====================
# CATEGORY LOOKUP
# =====================

def get_source_category(
    source_type,
):

    profile = SOURCE_PROFILES.get(
        source_type,
        SOURCE_PROFILES.get(
            "generic",
            {},
        ),
    )

    return profile.get(
        "category",
        "mixed",
    )
