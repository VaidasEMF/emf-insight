# =====================
# THEMES
# =====================

LIGHT_THEME = {
    "primary": "#0F172A",
    "secondary": "#1E3A8A",
    "success": "#16A34A",
    "warning": "#F59E0B",
    "danger": "#DC2626",
    "text": "#111827",
    "subtext": "#6B7280",
    "border": "#E5E7EB",
    "card_bg": "#FFFFFF",
    "soft_bg": "#F8FAFC",
    "divider": "#E2E8F0",
}


DARK_THEME = {
    "primary": "#F8FAFC",
    "secondary": "#93C5FD",
    "success": "#4ADE80",
    "warning": "#FBBF24",
    "danger": "#F87171",
    "text": "#F8FAFC",
    "subtext": "#CBD5E1",
    "border": "#334155",
    "card_bg": "#0F172A",
    "soft_bg": "#111827",
    "divider": "#1E293B",
}


CORPORATE_THEME = {
    "primary": "#1E293B",
    "secondary": "#334155",
    "success": "#059669",
    "warning": "#D97706",
    "danger": "#DC2626",
    "text": "#0F172A",
    "subtext": "#64748B",
    "border": "#CBD5E1",
    "card_bg": "#FFFFFF",
    "soft_bg": "#F8FAFC",
    "divider": "#E2E8F0",
}


# =====================
# GET THEME
# =====================


def get_theme(name="light"):

    themes = {
        "light": LIGHT_THEME,
        "dark": DARK_THEME,
        "corporate": CORPORATE_THEME,
    }

    return themes.get(
        name,
        LIGHT_THEME,
    )
