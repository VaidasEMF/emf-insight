"""
Building Biology Evaluation Guidelines
SBM-2015

Single Source of Truth for all EMF metrics,
units, thresholds and colors used by PHI.
"""

from reportlab.lib.colors import HexColor

# ---------------------------------------------------------------------
# STATUS COLORS
# ---------------------------------------------------------------------

STATUS_COLORS = {
    "Excellent": HexColor("#2E7D32"),
    "Good": HexColor("#7CB342"),
    "Moderate": HexColor("#FBC02D"),
    "Attention": HexColor("#FB8C00"),
    "Critical": HexColor("#D32F2F"),
    "Unknown": HexColor("#9E9E9E"),
}

# ---------------------------------------------------------------------
# SBM METRICS
# ---------------------------------------------------------------------

SBM = {

    "rf": {

        "label": "HF",
        "title": "High Frequency Radiation",

        "unit": "µW/m²",

        "thresholds": {

            "Excellent": (0.0, 0.1),
            "Good": (0.1, 10),
            "Attention": (10, 1000),
            "Critical": (1000, float("inf")),
        },
    },

    "electric": {

        "label": "LF Electric",
        "title": "Low Frequency Electric Field",

        "unit": "V/m",

        "thresholds": {

            "Excellent": (0.0, 1),
            "Good": (1, 5),
            "Attention": (5, 50),
            "Critical": (50, float("inf")),
        },
    },

    "magnetic": {

        "label": "LF Magnetic",
        "title": "Low Frequency Magnetic Field",

        "unit": "nT",

        "thresholds": {

            "Excellent": (0.0, 20),
            "Good": (20, 100),
            "Attention": (100, 500),
            "Critical": (500, float("inf")),
        },
    },

}

def get_metric(metric: str):
    return SBM[metric]


def get_label(metric: str):
    return SBM[metric]["label"]


def get_title(metric: str):
    return SBM[metric]["title"]


def get_unit(metric: str):
    return SBM[metric]["unit"]


def get_status_color(status: str):
    return STATUS_COLORS.get(status, STATUS_COLORS["Unknown"])

def get_status(metric: str, value: float) -> str:

    thresholds = SBM[metric]["thresholds"]

    for status, (low, high) in thresholds.items():

        if low <= value < high:
            return status

    return "Unknown"