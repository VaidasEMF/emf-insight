"""
Formatting Helpers
"""


def format_score(score):

    return f"{round(score)}/100"


def format_percent(value):

    return f"{round(value)}%"


def format_distance(distance):

    if distance is None:
        return "-"

    return f"{round(distance,1)} m"


def format_measurement(value, unit):

    if value is None:
        return "-"

    return f"{round(value,1)} {unit}"


def format_count(value):

    return str(int(value))


def format_yes_no(value):

    return "Yes" if value else "No"