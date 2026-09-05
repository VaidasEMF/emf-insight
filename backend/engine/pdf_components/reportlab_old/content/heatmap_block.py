# =====================
# HEATMAP BLOCK
# =====================

import os

from reportlab.platypus import (
    Paragraph,
    Spacer,
    Image,
)

from PIL import Image as PILImage

from engine import analysis
from engine.pdf_components.framework.constants import (
    SPACE_MD,
)

from engine.pdf_layouts.layouts import (
    two_col,
)

from engine.analysis.heatmap.heatmap import (
    render_heatmap,
)

from engine.analysis.common.helpers.score_helpers import (
    normalize_sbm,
    normalize_icnirp,
)

from engine.pdf_components.sections.section_title import (
    render_section_header,
)

from engine.pdf_components.cards.heatmap_card import (
    render_heatmap_card,
)

from engine.pdf_components.legends.risk_legend import (
    render_risk_legend,
)

from PIL import ImageDraw

import base64
import io

# =====================
# RENDER
# =====================


def render_heatmap_block(
    story,
    analysis,
    styles,
    sections=None,
):  
    
    

    print("🔥 HEATMAP BLOCK START")

    points = analysis.get(
        "points_before",
        [],
    )

    # =====================
    # FORCE ZONE GRID
    # =====================

    zone_points = []

    for z in analysis.get(
        "zones",
        []
    ):

        for gp in z.get(
            "grid",
            []
        ):

            m = gp.get(
                "measurements",
                {}
            ).get(
                "session_1",
                {}
            )

            if not m:
                continue

            zone_points.append({

                "id":
                    gp.get("id"),

                "x":
                    gp.get("x"),

                "y":
                    gp.get("y"),

                "m": {

                    "rf":
                        m.get("rf", 0),

                    "electric":
                        m.get(
                            "electric",
                            0
                        ),

                    "magnetic":
                        m.get(
                            "magnetic",
                            0
                        ),
                },
            })

    print(
        "PDF ZONE POINTS:",
        len(zone_points)
    )

    if zone_points:

        points = zone_points

    # =====================
    # NO POINTS
    # =====================

    if not points:

        print(
            "⚠ No points"
        )

        return

    # =====================
    # SECTION HEADER
    # =====================

    render_section_header(
        story=story,
        styles=styles,
        number=sections.next(),
        title="EXPOSURE OVERVIEW",
    )

    # =====================
    # OUTPUT DIR
    # =====================

    output_dir = os.path.join(
        os.path.dirname(__file__),
        "../../output",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    # =====================
    # DATA
    # =====================

    rooms = analysis.get(
        "rooms",
        [],
    )

    if rooms:
        import pprint

        print("\n===== 🔥 FIRST ROOM =====")
        pprint.pp(rooms[0])

    zones = analysis.get(
        "zones",
        [],
    )

    sources = analysis.get(
        "sources",
        [],
    )

   

    print("HEATMAP ROOMS:", len(rooms))
    print("HEATMAP ZONES:", len(zones))
    print("HEATMAP SOURCES:", len(sources))

    plan_path = analysis.get("plan_image")

   
    if isinstance(plan_path, str):

        if plan_path.startswith("data:image"):

            print("✅ BASE64 IMAGE DETECTED")

            header, encoded = plan_path.split(",", 1)

            image_data = base64.b64decode(encoded)

            base = PILImage.open(io.BytesIO(image_data)).convert("RGBA")

        # =====================
        # FILE PATH
        # =====================

        elif os.path.exists(plan_path):

            print("✅ FILE IMAGE FOUND")

            base = PILImage.open(plan_path).convert("RGBA")

        else:

            print("⚠ Invalid image path")

            base = PILImage.new(
                "RGBA",
                (700, 520),
                (255, 255, 255),
            )

    else:

        print("⚠ No image")

        base = PILImage.new(
            "RGBA",
            (700, 520),
            (255, 255, 255),
        )

        

    # =====================
    # SBM HEATMAP
    # =====================

    img_sbm, _, _ = render_heatmap(
        base.copy(),
        points,
        normalize_sbm,
        rooms=rooms,
        zones=zones,
        sources=sources,
    )

   
   

    sbm_path = os.path.join(
        output_dir,
        "heatmap_sbm.png",
    )

    img_sbm.save(sbm_path)

   

    # =====================
    # ICNIRP HEATMAP
    # =====================

    img_icnirp, _, _ = render_heatmap(
        base.copy(),
        points,
        normalize_icnirp,
        rooms=rooms,
        zones=zones,
        sources=sources,
    )

   

    icnirp_path = os.path.join(
        output_dir,
        "heatmap_icnirp.png",
    )

    img_icnirp.save(icnirp_path)

   
    # =====================
    # REPORTLAB IMAGES
    # =====================



    img1 = Image(
        sbm_path,
        width=240,
        height=185,
    )

    img2 = Image(
        icnirp_path,
        width=240,
        height=185,
    )


    # =====================
    # SUMMARY
    # =====================

    score = round(
        analysis.get(
            "summary",
            {},
        ).get(
            "score",
            0,
        )
    )

    risk = analysis.get(
        "summary",
        {},
    ).get(
        "label",
        "Unknown",
    )

    # =====================
    # WORST AREA
    # =====================

    top_points = analysis.get(
        "top_points",
        [],
    )

    worst_area = "Unknown"

    if top_points:

        worst_area = top_points[0].get(
            "room",
            "Unknown",
        )

    # =====================
    # CARDS
    # =====================

    sbm_card = render_heatmap_card(
        image=img1,
        title="SBM (Primary) — 120 cm",
        score=score,
        risk=risk,
        worst_area=worst_area,
        height_label="120 cm",
    )

    icnirp_card = render_heatmap_card(
        image=img2,
        title="ICNIRP (Regulatory) — 120 cm",
        score=score,
        risk="Regulatory",
        worst_area=worst_area,
        height_label="120 cm",
    )

    # =====================
    # GRID
    # =====================

    layout = two_col(
        sbm_card,
        icnirp_card,
    )

    story.append(layout)

    

    # =====================
    # LEGEND
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    legend = render_risk_legend(
        styles,
    )

  

    # =====================
    # COVERAGE
    # =====================

    coverage = analysis.get(
        "coverage",
        {},
    )

    coverage_percent = coverage.get(
        "coverage",
        0,
    )

    measured_points = coverage.get(
        "measured_points",
        0,
    )

    total_points = coverage.get(
        "total_points",
        0,
    )

    # =====================
    # RF STATS
    # =====================

    rf_values = []

    for p in points:

        rf = p.get(
            "m",
            {},
        ).get(
            "rf",
            0,
        )

        if rf > 0:

            rf_values.append(
                rf,
            )

    avg_rf = (
        round(
            sum(rf_values)
            / len(rf_values),
            1,
        )
        if rf_values
        else 0
    )

    max_rf = (
        round(
            max(rf_values),
            1,
        )
        if rf_values
        else 0
    )

    # =====================
    # ELECTRIC STATS
    # =====================

    electric_values = []

    for p in points:

        electric = p.get(
            "m",
            {},
        ).get(
            "electric",
            0,
        )

        electric_values.append(
            electric
        )

    avg_electric = (
        round(
            sum(electric_values)
            / len(electric_values),
            1,
        )
        if electric_values
        else 0
    )

    max_electric = (
        round(
            max(electric_values),
            1,
        )
        if electric_values
        else 0
    )

    # =====================
    # MAGNETIC STATS
    # =====================

    magnetic_values = []

    for p in points:

        magnetic = p.get(
            "m",
            {},
        ).get(
            "magnetic",
            0,
        )

        magnetic_values.append(
            magnetic
        )

    avg_magnetic = (
        round(
            sum(magnetic_values)
            / len(magnetic_values),
            1,
        )
        if magnetic_values
        else 0
    )

    max_magnetic = (
        round(
            max(magnetic_values),
            1,
        )
        if magnetic_values
        else 0
    )

    # =====================
    # HOTSPOTS
    # =====================

    hotspots = analysis.get(
        "hotspots",
        [],
    )

    hotspot_count = len(
        hotspots,
    )

    story.append(legend)

    # =====================
    # EXPOSURE INSIGHTS
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            "<b>KEY OBSERVATIONS</b>",
            styles["Body"],
        )
    )

    top_points = analysis.get(
        "top_points",
        [],
    )

    worst_room = "Unknown"

    if top_points:

        worst_room = top_points[0].get(
            "room",
            "Unknown",
        )

    observations = [

        f"• Highest measured exposure detected in {worst_room}",

        f"• {measured_points} of {total_points} measurement points completed",

        "• Exposure distribution is not uniform across the property",

        "• Areas with elevated exposure should be prioritized for mitigation",
    ]  

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            "<b>WHAT THIS MEANS</b>",
            styles["Body"],
        )
    )

    story.append(
        Spacer(
            1,
            6,
        )
    )

    story.append(
        Paragraph(
            (
                f"The assessment indicates that the highest "
                f"exposure levels were recorded in {worst_room}. "
                f"The heatmaps reveal how exposure is distributed "
                f"throughout the environment and help identify "
                f"areas where mitigation efforts may provide "
                f"the greatest benefit."
            ),
            styles["Body"],
        )
    )

    for item in observations:

        story.append(
            Paragraph(
                item,
                styles["Body"],
            )
        )  

    # =====================
    # HEATMAP STATS
    # =====================

    story.append(
        Spacer(
            1,
            SPACE_MD,
        )
    )

    story.append(
        Paragraph(
            (
                f"<b>RF</b> Avg: {avg_rf:.1f} | Max: {max_rf:.1f}<br/>"
                f"<b>Electric</b> Avg: {avg_electric:.1f} | Max: {max_electric:.1f}<br/>"
                f"<b>Magnetic</b> Avg: {avg_magnetic:.1f} | Max: {max_magnetic:.1f}"
            ),
            styles["Body"],
        )
    )

    # =====================
    # INTERPRETATION
    # =====================

    #story.append(
    #    Spacer(
    #        1,
    #        SPACE_MD,
    #    )
    #)

    #story.append(
    #Paragraph(
    #    (
    #        "The heatmaps illustrate the spatial "
    #        "distribution of measured RF exposure "
    #        "throughout the environment. "

    #        "SBM visualization emphasizes biological "
    #        "sensitivity and precautionary exposure "
    #        "assessment, while ICNIRP visualization "
    #        "represents compliance against regulatory "
    #        "reference levels. "

    #        "Areas with elevated coloration indicate "
    #        "locations where exposure intensity is "
    #        "significantly higher than surrounding zones."
    #    ),
    #    styles["Body"],
    #)
    #)

    print("✅ HEATMAP BLOCK FINISHED")
