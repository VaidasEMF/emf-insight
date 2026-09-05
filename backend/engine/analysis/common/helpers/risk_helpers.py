"""
Formatting Helpers

Common formatting utilities used across
Property Health Intelligence.
"""


def format_score(score):

    return f"{round(score)}/100"


def format_percent(value):

    return f"{round(value)}%"


def format_distance(distance):

    if distance is None:
        return "-"

    return f"{round(distance,1)} m"


def format_measurement(
    value,
    unit,
):

    if value is None:
        return "-"

    return f"{round(value,1)} {unit}"


def format_count(value):

    return str(int(value))


def format_yes_no(value):

    return "Yes" if value else "No"


def format_room(name):

    return name or "Unknown Room"


def format_source(name):

    return name or "Unknown Source"


def format_risk(label):

    return str(label).title()


def format_coordinates(
    x,
    y,
):

    return f"({round(x,1)}, {round(y,1)})"


def format_time(seconds):

    if seconds < 60:
        return f"{round(seconds)} s"

    minutes = seconds / 60

    if minutes < 60:
        return f"{round(minutes,1)} min"

    hours = minutes / 60

    return f"{round(hours,1)} h"


def safe_text(value):

    if value is None:
        return ""

    return str(value)