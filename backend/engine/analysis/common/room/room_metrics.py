"""
Room Metrics

Build room-level metrics.
"""


def build_room_metrics(room):

    points = room.get(
        "points",
        [],
    )

    sources = room.get(
        "sources",
        [],
    )

    score = room.get(
        "score",
        0,
    )

    return {

        "name":
            room.get(
                "name",
                "Unknown",
            ),

        "score":
            round(score),

        "risk":
            room.get(
                "risk",
                "Unknown",
            ),

        "point_count":
            len(points),

        "source_count":
            len(sources),

        "zone_count":
            len(
                room.get(
                    "zones",
                    [],
                )
            ),

    }