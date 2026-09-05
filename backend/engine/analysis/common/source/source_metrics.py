"""
Source Metrics
"""


def build_source_metrics(source):

    return {

        "name":
            source.get(
                "label",
                source.get(
                    "type",
                    "Source",
                ),
            ),

        "type":
            source.get(
                "type",
                "Unknown",
            ),

        "category":
            source.get(
                "category",
                "Unknown",
            ),

        "score":
            round(
                source.get(
                    "score",
                    0,
                )
            ),

        "distance":
            source.get(
                "distance",
            ),

    }