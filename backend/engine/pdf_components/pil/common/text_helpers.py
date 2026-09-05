"""
Text Helpers
"""


def bullet(text):

    return f"• {text}"


def sentence(text):

    text = str(text).strip()

    if not text.endswith("."):
        text += "."

    return text


def capitalize(text):

    return str(text).capitalize()


def uppercase(text):

    return str(text).upper()


def safe_text(value):

    if value is None:
        return ""

    return str(value)