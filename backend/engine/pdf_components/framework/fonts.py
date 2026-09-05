from PIL import ImageFont


def load_cover_fonts():
    """
    Load all fonts used by Premium PDF.
    """

    try:

        return {

        
            # -------------------------------------------------
            # Titles
            # -------------------------------------------------

            "page_title": ImageFont.truetype(
                "arialbd.ttf",
                50,
            ),

            "title": ImageFont.truetype(
                "arialbd.ttf",
                48,
            ),

            "subtitle": ImageFont.truetype(
                "arialbd.ttf",
                28,
            ),

           # -------------------------------------------------
            # Body
            # -------------------------------------------------

            "body": ImageFont.truetype(
                "arial.ttf",
                20,
            ),

            "body_bold": ImageFont.truetype(
                "arialbd.ttf",
                20,
            ),

            "small": ImageFont.truetype(
                "arial.ttf",
                16,
            ),

            "caption": ImageFont.truetype(
                "arial.ttf",
                16,
            ),

            "tiny": ImageFont.truetype(
                "arial.ttf",
                14,
            ),

            # -------------------------------------------------
            # Header
            # -------------------------------------------------

            "header_title": ImageFont.truetype(
                "arialbd.ttf",
                30,
            ),

            "header_meta": ImageFont.truetype(
                "arial.ttf",
                14,
            ),

            # -------------------------------------------------
            # Hero Score
            # -------------------------------------------------

            "score": ImageFont.truetype(
                "arialbd.ttf",
                74,
            ),

            # -------------------------------------------------
            # KPI Cards
            # -------------------------------------------------

            "kpi_value": ImageFont.truetype(
                "arialbd.ttf",
                40,
            ),


            "room_score": ImageFont.truetype(
                "arialbd.ttf",
                30,
            ),

            "room_metric": ImageFont.truetype(
                "arial.ttf",
                22,
            ),

            # -------------------------------------------------
            # Branding
            # -------------------------------------------------

            "company": ImageFont.truetype(
                "arialbd.ttf",
                26,
            ),
        }

    except Exception:

        default = ImageFont.load_default()

        return {

            "page_title": default,
            "title": default,
            "subtitle": default,

            "body": default,
            "small": default,
            "caption": default,
            "tiny": default,

            "header_title": default,
            "header_meta": default,

            "score": default,
            "kpi_value": default,

            "company": default,
            "body_bold": default,

            "room_score": default,
            "room_metric": default,
        }