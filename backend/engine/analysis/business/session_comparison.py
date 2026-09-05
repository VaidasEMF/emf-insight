"""
Business Session Comparison

Compares two measurement sessions using different
assessment frameworks (SBM / ICNIRP / Future PHI).

Used by:
- Session Comparison PDF page
- Trend analysis
- Before / After reports
"""

from engine.analysis.common.helpers.score_helpers import (
    avg_score,
    max_score,
)


def compare_frameworks(
    before_points,
    after_points,
    scoring_fn,
):
    """
    Compare two measurement sessions.

    Returns:
    {
        "before_avg": {...},
        "after_avg": {...},
        "before_max": {...},
        "after_max": {...},
        "improvement": float,
        "status": "Improved"
    }
    """

    before_avg = avg_score(
        before_points,
        scoring_fn,
    )

    after_avg = avg_score(
        after_points,
        scoring_fn,
    )

    before_max = max_score(
        before_points,
        scoring_fn,
    )

    after_max = max_score(
        after_points,
        scoring_fn,
    )

    improvement = round(
        before_avg["score"] - after_avg["score"],
        1,
    )

    if improvement > 0:
        status = "Improved"
    elif improvement < 0:
        status = "Worsened"
    else:
        status = "No Change"

    return {
        "before_avg": before_avg,
        "after_avg": after_avg,
        "before_max": before_max,
        "after_max": after_max,
        "improvement": improvement,
        "status": status,
    }