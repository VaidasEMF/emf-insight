"""
Exposure weighting utilities.
"""

ZONE_WEIGHTS = {
    "bed": 3.0,
    "work": 2.0,
    "living": 1.5,
    "general": 1.0,
    "hall": 0.5,
}


def get_zone_weight(zone_type: str) -> float:
    """
    Return exposure weight for a zone type.
    """
    return ZONE_WEIGHTS.get(zone_type, 1.0)


def weighted_exposure_score(
    score: float,
    zone_type: str,
) -> float:
    """
    Apply zone weighting to an exposure score.

    Result is capped at 100.
    """

    return min(
        score * get_zone_weight(zone_type),
        100,
    )