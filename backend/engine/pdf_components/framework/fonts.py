import os

from PIL import ImageFont


def load_cover_fonts():
    """
    Load all fonts used by Premium PDF.

    Fonts are loaded from the project repository rather than
    relying on fonts installed in the operating system.
    """

    # ==========================================================
    # PROJECT FONT PATHS
    # ==========================================================

    fonts_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "fonts",
        )
    )

    arial_regular = os.path.join(
        fonts_dir,
        "arial.ttf",
    )

    arial_bold = os.path.join(
        fonts_dir,
        "arialbd.ttf",
    )

    # ==========================================================
    # FONT VALIDATION
    # ==========================================================

    if not os.path.isfile(arial_regular):
        raise FileNotFoundError(
            f"PDF font not found: {arial_regular}"
        )

    if not os.path.isfile(arial_bold):
        raise FileNotFoundError(
            f"PDF font not found: {arial_bold}"
        )

    print(
        ">>> PDF FONT PATH:",
        {
            "regular": arial_regular,
            "bold": arial_bold,
        },
        flush=True,
    )

    # ==========================================================
    # LOAD FONTS
    # ==========================================================

    try:

        return {

            # -------------------------------------------------
            # Titles
            # -------------------------------------------------

            "page_title": ImageFont.truetype(
                arial_bold,
                50,
            ),

            "title": ImageFont.truetype(
                arial_bold,
                48,
            ),

            "subtitle": ImageFont.truetype(
                arial_bold,
                28,
            ),

            # -------------------------------------------------
            # Body
            # -------------------------------------------------

            "body": ImageFont.truetype(
                arial_regular,
                20,
            ),

            "body_bold": ImageFont.truetype(
                arial_bold,
                20,
            ),

            "small": ImageFont.truetype(
                arial_regular,
                16,
            ),

            "caption": ImageFont.truetype(
                arial_regular,
                16,
            ),

            "tiny": ImageFont.truetype(
                arial_regular,
                14,
            ),

            # -------------------------------------------------
            # Header
            # -------------------------------------------------

            "header_title": ImageFont.truetype(
                arial_bold,
                30,
            ),

            "header_meta": ImageFont.truetype(
                arial_regular,
                14,
            ),

            # -------------------------------------------------
            # Hero Score
            # -------------------------------------------------

            "score": ImageFont.truetype(
                arial_bold,
                74,
            ),

            # -------------------------------------------------
            # KPI Cards
            # -------------------------------------------------

            "kpi_value": ImageFont.truetype(
                arial_bold,
                40,
            ),

            "room_score": ImageFont.truetype(
                arial_bold,
                30,
            ),

            "room_metric": ImageFont.truetype(
                arial_regular,
                22,
            ),

            # -------------------------------------------------
            # Branding
            # -------------------------------------------------

            "company": ImageFont.truetype(
                arial_bold,
                26,
            ),
        }

    except Exception as e:

        print(
            ">>> PDF FONT LOAD ERROR:",
            repr(e),
            flush=True,
        )

        raise