// =====================
// 🔥 SCALE STATE
// =====================

window.scalePoints = [];

window.scaleCalibrated = false;

window.scaleMetersPerPixel = null;

// =====================
// 🔥 START SCALE MODE
// =====================

function startScaleMode() {

    AppState.ui.mode =
        "scale";

    canvas.style.cursor =
        "crosshair";

    console.log(
        "SCALE MODE ENABLED"
    );

    requestRender?.();
}

// =====================
// 🔥 SCALE CLICK
// =====================

function handleScaleClick(
    point
) {

    console.log(
        "SCALE CLICK:",
        point
    );

    if (
        !point ||
        point.x == null ||
        point.y == null
    ) {

        console.error(
            "INVALID SCALE POINT"
        );

        return;
    }

    const tool =
        window.scaleTool;

    if (!tool.points) {

        tool.points = [];
    }

    tool.points.push({

        x: point.x,
        y: point.y
    });

    // =====================
    // 🔥 FINISH SCALE
    // =====================

    if (
        tool.points.length === 2
    ) {

        const dx =

            tool.points[1].x -
            tool.points[0].x;

        const dy =

            tool.points[1].y -
            tool.points[0].y;

        const pixels =

            Math.hypot(
                dx,
                dy
            );

        console.log(
            "PIXELS:",
            pixels
        );

        setTimeout(() => {

            const meters =
                prompt(
                    "Enter distance in meters"
                );

            if (
                meters &&
                !isNaN(meters)
            ) {

                tool.metersPerPixel =

                    parseFloat(
                        meters
                    ) / pixels;

                tool.calibrated =
                    true;

                AppState.ui.mode =
                    "idle";

                tool.active =
                    false;

                tool.points = [];

                console.log(
                    "SCALE CALIBRATED"
                );

                // 🔥 HOME

                updateHomeWorkflow?.();

                // 🔥 BUSINESS

                window.updateWorkflowUI?.();

                requestRender?.();
            }

        }, 50);
    }

    console.log(
        "POINTS:",
        tool.points
    );

    requestRender?.();
}

// =====================
// 🔥 DRAW OVERLAY
// =====================

function drawScaleOverlay() {

    if (
        AppState.ui.mode !== "scale"
    ) {
        return;
    }

    const points =
        window.scalePoints || [];

    ctx.save();

    ctx.fillStyle = "red";

    ctx.strokeStyle = "red";

    ctx.lineWidth = 3;

    // =====================
    // 🔥 POINTS
    // =====================

    points.forEach(p => {

        console.error(
            "DRAWING POINT",
            p.x,
            p.y
        );

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });



    ctx.restore();
}

// =====================
// 🔥 EXPORTS
// =====================

window.startScaleMode =
    startScaleMode;

window.handleScaleClick =
    handleScaleClick;

window.drawScaleOverlay =
    drawScaleOverlay;

window.updateHomeLocks?.();    