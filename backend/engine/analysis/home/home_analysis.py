"""
Heatmap Normalization

Normalizes measurement values into
0–100 heatmap intensity.
"""


def clamp(
    value,
    minimum=0,
    maximum=100,
):
    """
    Clamp value between minimum and maximum.
    """

    return max(
        minimum,
        min(
            maximum,
            value,
        ),
    )


# ==========================================================
# RF
# ==========================================================

def normalize_rf(
    value,
):
    """
    RF (µW/m²)

    100 µW/m² ≈ 100%
    """

    return clamp(
        (float(value) / 100) * 100,
    )


# ==========================================================
# ELECTRIC
# ==========================================================

def normalize_electric(
    value,
):
    """
    Electric Field (V/m)

    50 V/m ≈ 100%
    """

    return clamp(
        (float(value) / 50) * 100,
    )


# ==========================================================
# MAGNETIC
# ==========================================================

def normalize_magnetic(
    value,
):
    """
    Magnetic Field (mG)

    2 mG ≈ 100%
    """

    return clamp(
        (float(value) / 2) * 100,
    )


# ==========================================================
# COMBINED SBM
# ==========================================================

def normalize_sbm(
    measurements,
):
    """
    Combined biological exposure.
    """

    rf = normalize_rf(
        measurements.get(
            "rf",
            0,
        )
    )

    electric = normalize_electric(
        measurements.get(
            "electric",
            0,
        )
    )

    magnetic = normalize_magnetic(
        measurements.get(
            "magnetic",
            0,
        )
    )

    score = (

        rf * 0.45 +

        magnetic * 0.35 +

        electric * 0.20

    )

    return clamp(score)


# ==========================================================
# ICNIRP
# ==========================================================

def normalize_icnirp(
    measurements,
):
    """
    Regulatory model.
    """

    rf = float(
        measurements.get(
            "rf",
            0,
        )
    )

    return clamp(
        (rf / 1000) * 100,
    )