# =====================
# SOURCE RECOMMENDATIONS
# =====================

SOURCE_RECOMMENDATIONS = {
    # =====================
    # WIFI
    # =====================
    "wifi": [
        {
            "text": ("Relocate WiFi access points " "away from sleeping areas."),
            "priority": "medium",
            "impact": "high",
            "category": "rf",
            "reduction": "20–35%",
        },
        {
            "text": ("Enable night-time WiFi " "reduction schedules."),
            "priority": "low",
            "impact": "moderate",
            "category": "rf",
            "reduction": "10–20%",
        },
    ],
    # =====================
    # ROUTER
    # =====================
    "router": [
        {
            "text": ("Increase distance from " "wireless routers."),
            "priority": "medium",
            "impact": "high",
            "category": "rf",
            "reduction": "15–30%",
        },
        {
            "text": ("Avoid placing routers near " "prolonged occupancy areas."),
            "priority": "medium",
            "impact": "moderate",
            "category": "rf",
            "reduction": "10–20%",
        },
    ],
    # =====================
    # MOBILE TOWER
    # =====================
    "tower": [
        {
            "text": ("Consider RF shielding strategies " "for external exposure."),
            "priority": "high",
            "impact": "high",
            "category": "rf",
            "reduction": "30–60%",
        },
        {
            "text": ("Reduce prolonged occupancy near " "tower-facing walls."),
            "priority": "medium",
            "impact": "moderate",
            "category": "rf",
            "reduction": "10–25%",
        },
    ],
    # =====================
    # SUBSTATION
    # =====================
    "substation": [
        {
            "text": ("Increase distance from electrical " "substation infrastructure."),
            "priority": "high",
            "impact": "high",
            "category": "magnetic",
            "reduction": "25–45%",
        },
        {
            "text": ("Magnetic field optimization " "assessment is recommended."),
            "priority": "medium",
            "impact": "high",
            "category": "magnetic",
            "reduction": "20–35%",
        },
    ],
    # =====================
    # SMART METER
    # =====================
    "smart_meter": [
        {
            "text": ("Avoid prolonged occupancy adjacent " "to smart meters."),
            "priority": "high",
            "impact": "high",
            "category": "rf",
            "reduction": "20–40%",
        },
        {
            "text": ("Consider shielding or distance " "optimization strategies."),
            "priority": "medium",
            "impact": "moderate",
            "category": "rf",
            "reduction": "15–30%",
        },
    ],
    # =====================
    # SOLAR
    # =====================
    "solar": [
        {
            "text": ("Inspect inverter placement relative " "to occupied areas."),
            "priority": "low",
            "impact": "moderate",
            "category": "electrical",
            "reduction": "5–15%",
        },
    ],
    # =====================
    # ELECTRICAL PANEL
    # =====================
    "electrical_panel": [
        {
            "text": ("Increase distance from electrical " "distribution panels."),
            "priority": "medium",
            "impact": "high",
            "category": "magnetic",
            "reduction": "20–35%",
        },
        {
            "text": ("Avoid sleeping areas adjacent " "to electrical infrastructure."),
            "priority": "high",
            "impact": "high",
            "category": "magnetic",
            "reduction": "25–45%",
        },
    ],
    # =====================
    # HIGH VOLTAGE LINE
    # =====================
    "hv_line": [
        {
            "text": ("Reduce prolonged occupancy near " "high-voltage infrastructure."),
            "priority": "high",
            "impact": "high",
            "category": "magnetic",
            "reduction": "30–50%",
        },
        {
            "text": (
                "Professional magnetic field " "mitigation assessment is recommended."
            ),
            "priority": "high",
            "impact": "high",
            "category": "magnetic",
            "reduction": "25–40%",
        },
    ],
    # =====================
    # EV CHARGER
    # =====================
    "ev_charger": [
        {
            "text": ("Avoid prolonged occupancy near " "EV charging equipment."),
            "priority": "medium",
            "impact": "moderate",
            "category": "magnetic",
            "reduction": "10–25%",
        },
    ],
    # =====================
    # BATTERY STORAGE
    # =====================
    "battery_storage": [
        {
            "text": ("Maintain separation distance from " "battery storage systems."),
            "priority": "medium",
            "impact": "moderate",
            "category": "electrical",
            "reduction": "10–20%",
        },
    ],
    # =====================
    # HEAT PUMP
    # =====================
    "heat_pump": [
        {
            "text": ("Increase distance from heat pump " "compressor systems."),
            "priority": "medium",
            "impact": "moderate",
            "category": "magnetic",
            "reduction": "10–20%",
        },
    ],
    # =====================
    # ELECTRIC STOVE
    # =====================
    "electric_stove": [
        {
            "text": ("Limit prolonged close-range exposure " "during stove operation."),
            "priority": "low",
            "impact": "moderate",
            "category": "magnetic",
            "reduction": "5–15%",
        },
    ],
    # =====================
    # WATER HEATER
    # =====================
    "water_heater": [
        {
            "text": ("Verify adequate separation distance " "from occupied areas."),
            "priority": "low",
            "impact": "low",
            "category": "electrical",
            "reduction": "5–10%",
        },
    ],
    # =====================
    # WIND TURBINE
    # =====================
    "wind_turbine": [
        {
            "text": (
                "Evaluate long-term occupancy patterns "
                "relative to turbine infrastructure."
            ),
            "priority": "medium",
            "impact": "moderate",
            "category": "rf",
            "reduction": "10–20%",
        },
    ],
}


# =====================
# RISK RECOMMENDATIONS
# =====================

RISK_RECOMMENDATIONS = {

    "low": [
        {
            "text":
                "Current exposure conditions remained within lower precautionary ranges.",

            "priority":
                "low",

            "impact":
                "low",

            "category":
                "general",
        }
    ],

    "moderate": [
        {
            "text":
                "Exposure optimization strategies are recommended.",

            "priority":
                "medium",

            "impact":
                "moderate",

            "category":
                "general",
        }
    ],

    "high": [
        {
            "text":
                "Priority mitigation planning is recommended.",

            "priority":
                "high",

            "impact":
                "high",

            "category":
                "general",
        }
    ],

    "very high": [
        {
            "text":
                "Immediate exposure mitigation is strongly recommended.",

            "priority":
                "high",

            "impact":
                "very_high",

            "category":
                "general",
        }
    ],
}
