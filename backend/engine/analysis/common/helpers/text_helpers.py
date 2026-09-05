"""
Text Helpers

Common text utilities used across
Property Health Intelligence.
"""


def safe_text(value):
    """
    Returns empty string instead of None.
    """

    if value is None:
        return ""

    return str(value)


def title(text):
    """
    Converts text to Title Case.
    """

    return safe_text(text).title()


def upper(text):
    """
    Converts text to UPPERCASE.
    """

    return safe_text(text).upper()


def lower(text):
    """
    Converts text to lowercase.
    """

    return safe_text(text).lower()


def capitalize(text):
    """
    Capitalizes first letter.
    """

    return safe_text(text).capitalize()


def bullet(text):
    """
    Adds bullet prefix.
    """

    return f"• {safe_text(text)}"


def sentence(text):
    """
    Ensures sentence ends with a period.
    """

    text = safe_text(text).strip()

    if not text:
        return ""

    if text.endswith((".", "!", "?")):
        return text

    return text + "."


def truncate(
    text,
    length=120,
):
    """
    Truncates long text.
    """

    text = safe_text(text)

    if len(text) <= length:
        return text

    return text[:length].rstrip() + "..."


def multiline(
    lines,
):
    """
    Joins list into multiline string.
    """

    return "\n".join(
        safe_text(line)
        for line in lines
        if line
    )


def comma_list(
    items,
):
    """
    Formats list using commas.
    """

    items = [
        safe_text(i)
        for i in items
        if i
    ]

    return ", ".join(items)


def yes_no(
    value,
):
    """
    Boolean → Yes / No.
    """

    return "Yes" if value else "No"


def plural(
    value,
    singular,
    plural_form=None,
):
    """
    Example:
        plural(1, "room")
        -> "1 room"

        plural(3, "room")
        -> "3 rooms"
    """

    if plural_form is None:
        plural_form = singular + "s"

    if value == 1:
        return f"{value} {singular}"

    return f"{value} {plural_form}"