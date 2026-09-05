import os
import numpy as np
import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from PIL import Image as PILImage, ImageDraw
from scipy.ndimage import gaussian_filter


def risk_icnirp_ratio(m):
    L = get_limits_icnirp()

    rf = m.get("rf") or 0
    electric = m.get("electric") or 0
    magnetic = m.get("magnetic") or 0

    S_rf = rf / L["rf"]
    S_e = electric / L["electric"]
    S_m = magnetic / L["magnetic"]

    return (S_rf + S_e + S_m) / 3


# =====================
# EUROPAEM (simple model)
# =====================


def risk_europaem(m):
    rf = m.get("rf", 0)
    e = m.get("electric", 0)
    b = m.get("magnetic", 0)

    # labai paprastas normalizavimas (vėliau galėsim patobulinti)
    score = rf / 1000 + e / 10 + b / 100  # RF  # electric  # magnetic

    return score


# =====================
# UNIFIED SCORING
# =====================


def normalize_icnirp(m):
    r = risk_icnirp_ratio(m)
    score = min(100, r * 100)

    return {"score": score, "label": classify(r), "color": get_color(score)}


def normalize_sbm(m):
    level = risk_sbm(m)
    score = sbm_to_100(level)

    return {"score": score, "label": classify_sbm(level), "color": get_color(score)}


def normalize_europaem(m):
    r = risk_europaem(m)
    score = min(100, r * 100)

    return {"score": score, "label": classify(r), "color": get_color(score)}


def get_color(score):
    if score < 25:
        return "green"
    elif score < 50:
        return "yellow"
    elif score < 75:
        return "orange"
    else:
        return "red"


# =====================
# SBM SCORING
# =====================


def sbm_rf_score(rf):
    if rf < 0.1:
        return 0
    elif rf < 10:
        return 1
    elif rf < 1000:
        return 2
    else:
        return 3


def sbm_electric_score(e):
    if e < 1:
        return 0
    elif e < 5:
        return 1
    elif e < 50:
        return 2
    else:
        return 3


def sbm_magnetic_score(m):
    if m < 20:
        return 0
    elif m < 100:
        return 1
    elif m < 500:
        return 2
    else:
        return 3


def risk_sbm(m):
    rf = m.get("rf", 0)
    e = m.get("electric", 0)
    b = m.get("magnetic", 0)

    scores = [sbm_rf_score(rf), sbm_electric_score(e), sbm_magnetic_score(b)]

    return max(scores)


def classify_sbm(score):
    score = int(round(score))
    score = max(0, min(score, 3))  # 🔥 clamp

    return ["No concern", "Slight concern", "Severe concern", "Extreme concern"][score]


def sbm_to_100(score):
    score = int(round(score))
    score = max(0, min(score, 3))

    return {0: 0, 1: 25, 2: 70, 3: 100}[score]


def get_limits_europaem():
    return {"rf": 100, "electric": 10, "magnetic": 0.1}


def risk_europaem(m):
    L = get_limits_europaem()

    rf = m.get("rf") or 0
    electric = m.get("electric") or 0
    magnetic = m.get("magnetic") or 0

    S_rf = rf / L["rf"]
    S_e = electric / L["electric"]
    S_m = magnetic / L["magnetic"]

    return (S_rf + S_e + S_m) / 3


# =====================
# RISK MODELS
# =====================
def get_limits_icnirp():
    return {"rf": 10_000_000, "electric": 5000, "magnetic": 0.2}


def risk_icnirp_ratio(m):
    print("USING RATIO ICNIRP")


def risk_icnirp_ratio(m):
    L = get_limits_icnirp()

    rf = m.get("rf") or 0
    electric = m.get("electric") or 0
    magnetic = m.get("magnetic") or 0

    S_rf = rf / L["rf"]
    S_e = electric / L["electric"]
    S_m = magnetic / L["magnetic"]

    return (S_rf + S_e + S_m) / 3


def get_limits_sbm():
    return {"rf": 1000, "electric": 50, "magnetic": 0.1}


def risk_sbm(m):
    L = get_limits_sbm()

    rf = m.get("rf") or 0
    electric = m.get("electric") or 0
    magnetic = m.get("magnetic") or 0

    S_rf = rf / L["rf"]
    S_e = electric / L["electric"]
    S_m = magnetic / L["magnetic"]

    return (S_rf + S_e + S_m) / 3


def classify_icnirp(score):
    if score < 30:
        return "Low"
    if score < 70:
        return "Moderate"
    return "High"


def classify_sbm(score):
    if score < 20:
        return "No concern"
    if score < 40:
        return "Slight concern"
    if score < 70:
        return "Severe concern"
    return "Extreme concern"


def classify(score):
    if score < 0.1:
        return "Very Low"
    elif score < 0.3:
        return "Low"
    elif score < 0.7:
        return "Moderate"
    elif score < 1.0:
        return "Elevated"
    else:
        return "High (exceeds guideline)"


def generate_ai_summary(data):
    avg = data.get("sleep_avg", 0)

    if avg < 20:
        level = "Low"
        rec = "No major concerns."
    elif avg < 50:
        level = "Moderate"
        rec = "Consider minor adjustments."
    elif avg < 100:
        level = "High"
        rec = "Reduce EMF sources near sleep areas."
    else:
        level = "Extreme"
        rec = "Immediate mitigation recommended."

    return f"""
Overall Risk: {level}

Recommendations:
- Move bed away from high exposure zones
- Reduce wireless device proximity
- Increase distance from electrical sources
"""


def classify(r):
    if r < 0.1:
        return "Very Low"
    elif r < 0.3:
        return "Low"
    elif r < 0.7:
        return "Moderate"
    elif r < 1.0:
        return "Elevated"
    else:
        return "High (exceeds guideline)"


def find_best_zone(points, risk_fn):

    if not points:
        return None

    best = None
    min_risk = float("inf")

    for p in points:

        px = p["x"]
        py = p["y"]

        total = 0
        count = 0

        for q in points:

            dx = px - q["x"]
            dy = py - q["y"]
            d = (dx**2 + dy**2) ** 0.5

            if d < 100:  # 🔥 lovos zona ~1m
                total += risk_fn(q["m"])
                count += 1

        if count == 0:
            continue

        avg = total / count

        if avg < min_risk:
            min_risk = avg
            best = (px, py)

    return best


# =====================
# COLLECT POINTS (SESSION SAFE)
# =====================
def collect_points(project, phase="session_1"):
    print("PROJECT STRUCTURE:", project)

    pts = []

    counter = 1  # 🔥 fallback ID jei nėra

    for f in project.get("floors", []):
        for r in f.get("rooms", []):

            room_name = r.get("name", "R1")

            for g in r.get("grid", []):

                measurements = g.get("measurements", {})
                if not measurements:
                    continue

                m = measurements.get(phase)
                if not m:
                    continue

                # =====================
                # SAFE PARSE
                # =====================
                try:
                    rf = float(m.get("rf", 0))
                    electric = float(m.get("electric", 0))
                    magnetic = float(m.get("magnetic", 0))
                except:
                    continue

                # =====================
                # 🔥 ID LOGIKA (LABAI SVARBU)
                # =====================
                point_id = g.get("id")

                if not point_id:
                    # fallback jei nėra id
                    point_id = f"{room_name}_P{counter}"
                    counter += 1

                # =====================
                # ADD POINT
                # =====================
                pts.append(
                    {
                        "id": point_id,  # 🔥 svarbiausia
                        "x": g["x"],
                        "y": g["y"],
                        "m": {"rf": rf, "electric": electric, "magnetic": magnetic},
                        "zone": g.get("zone", "work"),
                        "room": room_name,
                    }
                )

    print(f"[collect_points] session={phase}, points={len(pts)}")

    return pts


# =====================
# ANALYSIS
# =====================
def avg_risk(points, fn):
    if not points:
        return 0
    return sum(fn(p["m"]) for p in points) / len(points)


def analyze_room(points):

    sleep = []
    work = []
    max_point = None
    max_risk = -1

    for p in points:
        r = risk_sbm(p["m"])

        if p.get("zone") == "sleep":
            sleep.append(r)
        else:
            work.append(r)

        if r > max_risk:
            max_risk = r
            max_point = p

    def avg(arr):
        return sum(arr) / len(arr) if arr else 0

    return {
        "sleep_avg": avg(sleep),
        "work_avg": avg(work),
        "max_point": max_point,
        "max_risk": max_risk,
    }


def calc_improvement(pointsA, pointsB):

    if not pointsA or not pointsB:
        return None

    a = avg_risk(pointsA, risk_sbm)
    b = avg_risk(pointsB, risk_sbm)

    change = ((a - b) / a * 100) if a else 0

    return round(a, 1), round(b, 1), round(change, 1)


# =====================
# UNIFIED SCORING CORE
# =====================


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def get_color(score):
    # 0–100 → spalva
    if score < 25:
        return "#2ecc71"  # green
    if score < 50:
        return "#f1c40f"  # yellow
    if score < 75:
        return "#e67e22"  # orange
    return "#e74c3c"  # red


def normalize_icnirp(m):
    risk = risk_icnirp_ratio(m)  # float (0..∞)
    score = min(100, risk * 100)  # 0–100

    if score < 25:
        label = "Low"
    elif score < 50:
        label = "Moderate"
    elif score < 75:
        label = "High"
    else:
        label = "Very High"

    return {"score": score, "label": label}


def normalize_sbm(m):
    level = int(round(risk_sbm(m)))  # 0–3
    level = clamp(level, 0, 3)
    # diskretus → 0–100 (logiškesnė gradacija)
    mapping = {0: 0, 1: 25, 2: 70, 3: 100}
    score = mapping[level]
    return {"score": score, "label": classify_sbm(level), "color": get_color(score)}


def normalize_europaem(m):
    r = risk_europaem(m)  # float
    score = clamp(r * 100, 0, 100)
    return {
        "score": score,
        "label": classify(r),  # jei turi atskirą – naudok jį
        "color": get_color(score),
    }


# =====================
# AGGREGATION (AVG saugiai)
# =====================
import numpy as np


def avg_score(points, normalizer):
    if not points:
        return {"score": 0, "label": "No data", "color": "#bdc3c7"}

    scores = [normalizer(p["m"])["score"] for p in points]
    s = clamp(float(np.mean(scores)), 0, 100)
    return {"score": s, "label": badge_label(s), "color": get_color(s)}


def badge_label(score):
    if score < 25:
        return "LOW"
    if score < 50:
        return "MODERATE"
    if score < 75:
        return "HIGH"
    return "VERY HIGH"


# =====================
# HEATMAP (BASIC STABLE)
# =====================
def dist3D(x1, y1, z1, x2, y2, z2):
    return np.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2)


def source_influence(x, y, z, sources):

    total = 0

    for s in sources:
        sx = s.get("x", 0)
        sy = s.get("y", 0)
        sz = s.get("z", 1.5)

        power = s.get("power", 50)

        d = dist3D(x, y, z, sx, sy, sz)

        total += power * np.exp(-d / 150)

    return total


def get_heat_color(v):
    r = int(255 * v)
    g = int(255 * (1 - v * 0.9))  # 🔥 mažiau geltonos
    b = int(50 * (1 - v))  # 🔥 šiek tiek mėlynos pradžioje
    return r, g, b


def render_heatmap(project, points, risk_fn, name):

    import numpy as np
    from PIL import Image as PILImage, ImageDraw
    from scipy.ndimage import gaussian_filter

    print("HEATMAP START")

    W, H = 600, 450
    step = 8

    import base64
    from io import BytesIO

    if project.get("plan_image"):
        try:
            img_data = project["plan_image"].split(",")[1]
            img_bytes = base64.b64decode(img_data)
            base = PILImage.open(BytesIO(img_bytes)).convert("RGBA")
            base = base.resize((W, H))
        except:
            base = PILImage.new("RGBA", (W, H), (245, 245, 245))
    else:
        base = PILImage.new("RGBA", (W, H), (245, 245, 245))

    spread = 180
    step = 4

    grid = np.zeros((H, W))

    # =====================
    # BUILD FIELD
    # =====================
    for i in range(0, H, step):
        for j in range(0, W, step):

            total = 0

            for p in points:

                dx = j - p["x"]
                dy = i - p["y"]
                d = np.hypot(dx, dy)

                r = risk_fn(p["m"])

                total += r * np.exp(-d / spread)

            grid[i, j] = total

    # =====================
    # SMOOTH
    # =====================
    # grid = gaussian_filter(grid, 12)

    # =====================
    # 🔥 NORMALIZE (PERCENTILE)
    # =====================
    p_low = np.percentile(grid, 5)
    p_high = np.percentile(grid, 95)

    if p_high - p_low > 0:
        grid = (grid - p_low) / (p_high - p_low)
    else:
        grid = grid * 0

    grid = np.clip(grid, 0, 1)

    # =====================
    # COLOR MAP (🟢🟡🔴)
    # =====================
    heat = PILImage.new("RGBA", (W, H))

    for j in range(W):

        v = grid[i, j]

        if v < 0.05:
            heat.putpixel((j, i), (0, 0, 0, 0))
            continue

        r, g, b = get_heat_color(v)

        heat.putpixel((j, i), (r, g, b, 180))

    # =====================
    # MERGE
    # =====================
    base = base.convert("RGBA")
    blended = PILImage.alpha_composite(base, heat)

    draw = ImageDraw.Draw(blended)

    # =====================
    # TOP POINTS (CLEAN)
    # =====================
    if not points:
        return

    # 🔥 surikiuojam visus
    sorted_pts = sorted(points, key=lambda p: risk_fn(p["m"]), reverse=True)

    top_main = sorted_pts[0]  # blogiausias
    others = sorted_pts[1:3]  # kiti 2

    # =====================
    # 🔴 MAIN POINT (highlight)
    # =====================
    x = int(top_main["x"])
    y = int(top_main["y"])

    draw.ellipse([x - 12, y - 12, x + 12, y + 12], outline="red", width=4)

    label = top_main.get("id", "T1")  # vietoj T1 naudoja realų ID

    # 🔥 label tik vienam
    label = f"T1"
    draw.text((x + 10, y - 10), label, fill=(0, 0, 0))

    # =====================
    # 🟡 OTHER POINTS (small)
    # =====================
    for p in others:
        x = int(p["x"])
        y = int(p["y"])

        draw.ellipse([x - 6, y - 6, x + 6, y + 6], outline="orange", width=2)

    # =====================
    # BED ZONE
    # =====================
    best = find_best_zone(points, risk_fn)

    if best:
        bx, by = int(best[0]), int(best[1])

        # 🟩 zona
        draw.rectangle([bx - 40, by - 25, bx + 40, by + 25], outline="green", width=4)

        draw.text((bx, by - 30), "BEST", fill=(0, 128, 0))

    # =====================
    # MARKERS (T1, T2, T3)
    # =====================
    top = sorted(points, key=lambda p: risk_fn(p["m"]), reverse=True)[:3]

    labels = ["T1", "T2", "T3"]
    colors_map = [(0, 180, 0), (220, 0, 0), (255, 165, 0)]  # green, red, orange

    for i, p in enumerate(top):

        x = int(p["x"])
        y = int(p["y"])

        color = colors_map[i]

        # 🔴 didelis apskritimas
        draw.ellipse([x - 18, y - 18, x + 18, y + 18], fill=color, outline="white")

        # tekstas
        draw.text((x - 10, y - 8), labels[i], fill="white")

    # =====================
    # VALUE BOX (T2 pavyzdys)
    # =====================
    if top:
        p = top[0]  # blogiausias

        x = int(p["x"]) + 40
        y = int(p["y"]) - 40

        text = f"""T2
    {p["m"]["electric"]} V/m
    {p["m"]["magnetic"]} nT
    {p["m"]["rf"]} µW/m²"""

        # box
        draw.rounded_rectangle(
            [x, y, x + 130, y + 80], radius=10, fill=(220, 0, 0, 180)
        )

        draw.text((x + 8, y + 5), "T2", fill="white")

        draw.text((x + 8, y + 25), f"{p['m']['electric']} V/m", fill="white")

        draw.text((x + 8, y + 40), f"{p['m']['magnetic']} nT", fill="white")

        draw.text((x + 8, y + 55), f"{p['m']['rf']} µW/m²", fill="white")

    # =====================
    # SAVE
    # =====================
    path = f"output/{name}.png"

    import os

    os.makedirs("output", exist_ok=True)

    blended.save(path)

    print("HEATMAP DONE")

    return path, float(p_low), float(p_high)


# =====================
# LEGEND
# =====================
def draw_legend(path):

    W, H = 300, 50
    img = PILImage.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    for x in range(W):
        v = x / W
        r = int(255 * v)
        g = int(255 * (1 - v))
        draw.line([(x, 0), (x, 20)], fill=(r, g, 0))

    draw.text((0, 25), "Low", fill=(0, 0, 0))
    draw.text((240, 25), "High", fill=(0, 0, 0))

    img.save(path)
    return path


def build_legend():
    d = Drawing(300, 50)

    # gradient blokai
    colors_list = [(0, "green"), (25, "yellow"), (50, "orange"), (75, "red")]

    x = 0
    width = 60

    for val, color in colors_list:
        d.add(Rect(x, 20, width, 15, fillColor=color))
        d.add(String(x, 5, str(val), fontSize=8))
        x += width

    d.add(String(250, 5, "100", fontSize=8))

    return d


from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib import colors


def build_legend():

    d = Drawing(320, 60)

    labels = ["Low", "Moderate", "High", "Very High"]

    color_blocks = [colors.green, colors.yellow, colors.orange, colors.red]

    values = [0, 25, 50, 75, 100]

    x = 0
    width = 70

    for i in range(4):
        d.add(Rect(x, 25, width, 15, fillColor=color_blocks[i]))
        d.add(String(x + 5, 5, str(values[i]), fontSize=8))
        d.add(String(x + 5, 45, labels[i], fontSize=8))
        x += width

    d.add(String(280, 5, "100", fontSize=8))

    return d


from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib import colors


def build_gradient_legend(min_val, max_val):

    d = Drawing(320, 70)

    # =====================
    # GRADIENT BAR
    # =====================
    steps = 100
    width = 300
    height = 12

    for i in range(steps):
        v = i / steps
        r = int(255 * v)
        g = int(255 * (1 - v))
        b = 0

        d.add(
            Rect(
                i * (width / steps),
                30,
                width / steps,
                height,
                fillColor=colors.Color(r / 255, g / 255, b / 255),
            )
        )

    # =====================
    # LABELS (virš)
    # =====================
    d.add(String(0, 50, "Low", fontSize=8))
    d.add(String(90, 50, "Moderate", fontSize=8))
    d.add(String(180, 50, "High", fontSize=8))
    d.add(String(260, 50, "Very High", fontSize=8))

    # =====================
    # SCALE (apačioj)
    # =====================
    d.add(String(0, 15, f"{round(min_val,2)}", fontSize=7))
    d.add(String(260, 15, f"{round(max_val,2)}", fontSize=7))

    return d


# =====================
# AVG SCORE (UNIFIED)
# =====================
import numpy as np


def avg_score(points, normalizer):
    if not points:
        return {"score": 0, "label": "No data", "color": "#999999"}

    scores = []

    for p in points:
        try:
            data = normalizer(p["m"])
            scores.append(data["score"])
        except:
            continue

    if not scores:
        return {"score": 0, "label": "No data", "color": "#999999"}

    avg = float(np.mean(scores))
    avg = max(0, min(avg, 100))

    return {"score": avg, "label": badge_label(avg), "color": get_color(avg)}


# =====================
# BADGE LABEL
# =====================
def badge_label(score):
    if score < 25:
        return "Low"
    elif score < 50:
        return "Moderate"
    elif score < 75:
        return "High"
    else:
        return "Very High"


# =====================
# COLOR SYSTEM
# =====================
def get_color(score):
    if score < 25:
        return "#2ecc71"  # green
    elif score < 50:
        return "#f1c40f"  # yellow
    elif score < 75:
        return "#e67e22"  # orange
    else:
        return "#e74c3c"  # red


# =====================
# GRADIENT LEGEND
# =====================
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib import colors


def build_gradient_legend(min_val, max_val):

    d = Drawing(320, 70)

    steps = 100
    width = 300
    height = 12

    # gradient bar
    for i in range(steps):
        v = i / steps

        r = int(255 * v)
        g = int(255 * (1 - v))
        b = 0

        d.add(
            Rect(
                i * (width / steps),
                30,
                width / steps,
                height,
                fillColor=colors.Color(r / 255, g / 255, b / 255),
            )
        )

    # labels (virš)
    d.add(String(0, 50, "Low", fontSize=8))
    d.add(String(90, 50, "Moderate", fontSize=8))
    d.add(String(180, 50, "High", fontSize=8))
    d.add(String(250, 50, "Very High", fontSize=8))

    # scale (apačia)
    d.add(String(0, 15, f"{round(min_val,2)}", fontSize=7))
    d.add(String(250, 15, f"{round(max_val,2)}", fontSize=7))

    return d


# =====================
# BUILD PDF
# =====================
def build_pdf(project, pts_before, pts_after, pid):

    print("🔥 BUILD_PDF START")

    # 🔥 DEFAULT (visada egzistuos)
    min_val, max_val = 0, 1
    min_val2, max_val2 = 0, 1

    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Image,
        Table,
        TableStyle,
        HRFlowable,
    )

    # =====================
    # PATH
    # =====================
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(BASE_DIR, "output")
    os.makedirs(output_dir, exist_ok=True)

    pdf_path = os.path.join(output_dir, f"{pid}.pdf")

    doc = SimpleDocTemplate(pdf_path)
    styles = getSampleStyleSheet()
    story = []

    story.append(Spacer(1, 10))
    story.append(build_legend())
    story.append(Spacer(1, 15))

    # =====================
    # TITLE
    # =====================
    story.append(Paragraph("EMF Exposure Report", styles["Title"]))
    story.append(Spacer(1, 20))

    story.append(Spacer(1, 10))
    story.append(build_gradient_legend(min_val, max_val))
    story.append(Spacer(1, 20))

    # =====================
    # ICNIRP SECTION
    # =====================
    story.append(Paragraph("Room 1 – ICNIRP", styles["Heading2"]))
    story.append(Spacer(1, 10))

    # 🔥 SAUGUS heatmap (kad nelūžtų)
    try:
        hm_before, min_val, max_val = render_heatmap(
            project, pts_before, risk_icnirp_ratio, "icnirp"
        )

    except Exception as e:
        print("HEATMAP ERROR:", e)
        hm_before, min_val, max_val = None, 0, 1

    # IMAGE
    if hm_before and os.path.exists(hm_before):
        img = Image(hm_before, width=300, height=220)
    else:
        img = Spacer(1, 220)

    # 🔥 TOP POINTS
    top = (
        sorted(pts_before, key=lambda p: risk_icnirp_ratio(p["m"]), reverse=True)[:3]
        if pts_before
        else []
    )

    # =====================
    # TABLE
    # =====================

    table_data = [["Location", "Electric", "Magnetic", "RF", "Risk"]]

    for i, p in enumerate(top):
        m = p["m"]

        # 🔥 RF atskirai (teisingai)
        rf = round(m["rf"], 1)

        # 🔥 unified scoring
        data = normalize_icnirp(m)

        table_data.append(
            [
                f"T{i+1}",
                round(m["electric"], 1),
                round(m["magnetic"], 1),
                rf,
                f"{round(data['score'])} / 100 ({data['label']})",
            ]
        )

    from reportlab.platypus import Table as RLTable

    table = RLTable(table_data, colWidths=[70, 80, 80, 90, 120])

    table.setStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ]
    )

    # =====================
    # PLANAS (heatmap)
    # =====================
    story.append(img)
    story.append(Spacer(1, 20))  # 🔥 padidintas nuo 10 → 20

    # =====================
    # LENTELĖ PO PLANU
    # =====================
    story.append(table)
    story.append(Spacer(1, 15))

    if top:
        top_index = 1  # nes tai top[0]
        story.append(
            Paragraph(
                f"Highest exposure detected near {top[0].get('id', 'T1')} zone.",
                styles["Italic"],
            )
        )

    story.append(Spacer(1, 20))

    # =====================
    # 🔥 GRADIENT LEGENDA
    # =====================
    story.append(build_gradient_legend(min_val, max_val))
    story.append(Spacer(1, 30))

    # =====================
    # SBM SECTION
    # =====================
    story.append(Paragraph("Room 1 – SBM", styles["Heading2"]))
    story.append(Spacer(1, 10))

    # 🔥 fallback (jei nėra pts_after)
    sbm_points = pts_after if pts_after else pts_before

    # 🔥 default (kad niekada nelūžtų)
    min_val2, max_val2 = 0, 1

    try:
        result = render_heatmap(project, sbm_points, risk_sbm, "sbm")

        if result:
            hm_after, min_val2, max_val2 = result
        else:
            hm_after = None

    except Exception as e:
        print("SBM HEATMAP ERROR:", e)
        hm_after = None

    # IMAGE
    if hm_after and os.path.exists(hm_after):
        img2 = Image(hm_after, width=300, height=220)
    else:
        img2 = Spacer(1, 220)

    story.append(build_gradient_legend(min_val2, max_val2))

    # =====================
    # TABLE
    # =====================
    table_data2 = [["Location", "Electric", "Magnetic", "RF", "Risk"]]

    rf = round(m["rf"], 1)
    data = normalize_sbm(m)

    table_data2.append(
        [
            f"T{i+1}",
            round(m["electric"], 1),
            round(m["magnetic"], 1),
            rf,
            f"{round(data['score'])} / 100 ({data['label']})",
        ]
    )

    table2 = RLTable(table_data2, colWidths=[50, 60, 60, 90, 110])

    table2.setStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ]
    )

    # =====================
    # PLANAS (SBM)
    # =====================
    story.append(img2)
    story.append(Spacer(1, 10))

    # =====================
    # LENTELĖ PO PLANU
    # =====================
    story.append(table2)
    story.append(Spacer(1, 15))

    # =====================
    # SBM TOP POINTS (SAFE)
    # =====================
    top_sbm = []

    if sbm_points:
        top_sbm = sorted(sbm_points, key=lambda p: risk_sbm(p["m"]), reverse=True)

    # =====================
    # INSIGHT
    # =====================
    if top_sbm:
        story.append(
            Paragraph(
                f"Highest exposure detected near {top_sbm[0].get('id', 'T1')} zone.",
                styles["Italic"],
            )
        )

    # =====================
    # 🔥 AVG SBM (UNIFIED)
    # =====================

    avg_sbm_data = avg_score(sbm_points, normalize_sbm)

    story.append(
        Paragraph(
            f"Avg: {round(avg_sbm_data['score'])} / 100 ({avg_sbm_data['label']})",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 10))

    # =====================
    # 🔥 GRADIENT LEGENDA
    # =====================
    story.append(build_gradient_legend(min_val2, max_val2))
    story.append(Spacer(1, 30))

    # =====================
    # FINAL BUILD
    # =====================
    print("🔥 BUILDING PDF:", pdf_path)

    doc.build(story)

    print("✅ PDF SAVED:", pdf_path)

    return pdf_path
