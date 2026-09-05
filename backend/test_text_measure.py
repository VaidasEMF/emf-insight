from PIL import Image, ImageDraw, ImageFont

from engine.pdf_components.framework.text_measure import (
    measure_paragraph,
    measure_bullet_list,
)

from engine.pdf_components.framework.text_measure import (
    measure_paragraph,
    measure_bullet_list,
    measure_card_height,
)


# ==========================================================
# TEST CANVAS
# ==========================================================

img = Image.new(
    "RGB",
    (1000, 1000),
    "white",
)

draw = ImageDraw.Draw(img)


# ==========================================================
# TEST FONT
# ==========================================================

font = ImageFont.truetype(
    "arial.ttf",
    14,
)


# ==========================================================
# TEST PARAGRAPH
# ==========================================================

text = (
    "The property achieved an overall Property Health "
    "Score of 100/100 (Excellent). This score summarizes "
    "cumulative biological electromagnetic exposure "
    "measured throughout the assessment."
)

result = measure_paragraph(
    draw=draw,
    text=text,
    font=font,
    width=300,
    line_spacing=6,
)

long_text = (
    "The property achieved an overall Property Health Score "
    "of 100/100 (Excellent). This score summarizes cumulative "
    "biological electromagnetic exposure measured throughout "
    "the assessment and highlights where mitigation efforts "
    "will have the greatest impact on long-term environmental "
    "quality. Additional measurements may be recommended "
    "to improve assessment confidence and coverage."
)

long_result = measure_paragraph(
    draw=draw,
    text=long_text,
    font=font,
    width=300,
    line_spacing=6,
)

# ==========================================================
# HEIGHT COMPARISON TEST
# ==========================================================

short_text = (
    "Highest exposure detected in Room 2."
)

medium_text = (
    "Highest measured exposure was detected "
    "in Room 2 during the assessment."
)

long_text_2 = (
    "Highest measured exposure was detected in "
    "Room 2 during the assessment. The measured "
    "levels indicate that this area should receive "
    "priority attention and additional measurements "
    "may be recommended before mitigation decisions."
)


short_result = measure_paragraph(
    draw=draw,
    text=short_text,
    font=font,
    width=300,
    line_spacing=6,
)

medium_result = measure_paragraph(
    draw=draw,
    text=medium_text,
    font=font,
    width=300,
    line_spacing=6,
)

long_result_2 = measure_paragraph(
    draw=draw,
    text=long_text_2,
    font=font,
    width=300,
    line_spacing=6,
)


print()
print("========================================")
print("HEIGHT COMPARISON")
print("========================================")

print(
    "SHORT  :",
    short_result["lines"],
    "lines /",
    short_result["height"],
    "px",
)

print(
    "MEDIUM :",
    medium_result["lines"],
    "lines /",
    medium_result["height"],
    "px",
)

print(
    "LONG   :",
    long_result_2["lines"],
    "lines /",
    long_result_2["height"],
    "px",
)

print("========================================")

print()
print("========================================")
print("LONG TEXT TEST")
print("========================================")
print("HEIGHT:", long_result["height"])
print("LINES :", long_result["lines"])
print("========================================")

print()
print("========================================")
print("PARAGRAPH TEST")
print("========================================")
print("WIDTH :", result["width"])
print("HEIGHT:", result["height"])
print("LINES :", result["lines"])


# ==========================================================
# TEST FINDINGS
# ==========================================================

findings = [
    "Highest measured exposure detected in Room 2.",
    "3 of 27 planned measurement points completed.",
    "Exposure is not uniformly distributed across the property.",
    "Mitigation should prioritize the highest exposure areas.",
]

bullet_result = measure_bullet_list(
    draw=draw,
    items=findings,
    font=font,
    width=260,
    item_spacing=10,
    line_spacing=5,
)

print()
print("========================================")
print("BULLET LIST TEST")
print("========================================")
print("HEIGHT:", bullet_result["height"])
print("ITEMS :", bullet_result["items"])
print("LINES :", bullet_result["lines"])
print("========================================")
print()


# ==========================================================
# CARD HEIGHT TEST
# ==========================================================

card_height = measure_card_height(
    content_height=bullet_result["height"],
    header_height=32,
    header_gap=18,
    top_padding=0,
    bottom_padding=24,
)

print()
print("========================================")
print("CARD HEIGHT TEST")
print("========================================")
print(
    "CONTENT HEIGHT:",
    bullet_result["height"],
)
print(
    "CARD HEIGHT:",
    card_height,
)
print("========================================")

