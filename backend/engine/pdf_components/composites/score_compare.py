from engine.pdf_components.composites.score_block import (
    draw_score_block,
)

COLUMN_WIDTH = 140


def draw_score_compare(
    draw,
    x,
    y,
    sbm,
    icnirp,
    fonts,
):

    left_bottom = draw_score_block(
        draw=draw,
        x=x,
        y=y,
        label="SBM",
        score=sbm["score"],
        status=sbm["status"],
        color=sbm["color"],
        fonts=fonts,
    )

    right_bottom = draw_score_block(
        draw=draw,
        x=x + COLUMN_WIDTH,
        y=y,
        label="ICNIRP",
        score=icnirp["score"],
        status=icnirp["status"],
        color=icnirp["color"],
        fonts=fonts,
    )

    return max(
        left_bottom,
        right_bottom,
    )