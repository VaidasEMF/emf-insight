# =====================
# BRAND CONFIG SYSTEM
# =====================

DEFAULT_BRAND = {
    "company": "EMF Maps",
    "primary": "#1E3A8A",
    "secondary": "#0F172A",
    "accent": "#2563EB",
    "logo": "assets/logo.png",
    "website": "www.emfmaps.com",
    "footer": ("Confidential environmental " "diagnostics report."),
    "theme": "light",
}


# =====================
# GET BRAND CONFIG
# =====================


def get_branding(project=None):

    if not project:

        return DEFAULT_BRAND

    branding = project.get(
        "branding",
        {},
    )

    return {
        "company": branding.get(
            "company",
            DEFAULT_BRAND["company"],
        ),
        "primary": branding.get(
            "primary",
            DEFAULT_BRAND["primary"],
        ),
        "secondary": branding.get(
            "secondary",
            DEFAULT_BRAND["secondary"],
        ),
        "accent": branding.get(
            "accent",
            DEFAULT_BRAND["accent"],
        ),
        "logo": branding.get(
            "logo",
            DEFAULT_BRAND["logo"],
        ),
        "website": branding.get(
            "website",
            DEFAULT_BRAND["website"],
        ),
        "footer": branding.get(
            "footer",
            DEFAULT_BRAND["footer"],
        ),
        "theme": branding.get(
            "theme",
            DEFAULT_BRAND["theme"],
        ),
    }
