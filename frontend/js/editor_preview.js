// =====================
// 🔥 EDITOR PREVIEW LAYER
// =====================

function drawEditorPreviewLayer() {

    console.error("EDITOR PREVIEW", {
        mode: AppState.ui.mode,
        currentZone,
        polygon: currentZone?.polygon?.length
    });

    // =====================
    // 🔥 EDIT ZONE PREVIEW
    // =====================

    const zone =
        AppState.ui.selectedZone;

    if (

        AppState.ui.mode === "editZone" &&
        zone &&
        zone.polygon

    ) {

        drawPolygonPreview(

            zone.polygon,

            "#00ffff",

            "rgba(0,255,255,0.15)"

        );

        EMFViewport.worldPoints(
            zone.polygon
        ).forEach(p => {

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                10,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#00ffff";

            ctx.fill();
        });

        return;
    }

    // =====================
    // 🔥 ROOM PREVIEW
    // =====================

    if (

        AppState.ui.mode === "room" &&
        AppState.ui.roomDraft &&
        AppState.ui.roomDraft.polygon &&
        AppState.ui.roomDraft.polygon.length > 0

    ) {

        drawPolygonPreview(
            AppState.ui.roomDraft.polygon,
            "orange",

        );
    }


    // =====================
    // 🔥 ZONE EDIT PREVIEW
    // =====================

    if (

        AppState.ui.mode === "editZone" &&
        AppState.ui.selectedZone &&
        AppState.ui.selectedZone.polygon

    ) {

        drawPolygonPreview(

            zone.polygon,

            "#00ffff",

            "rgba(0,255,255,0.15)"

        );

        EMFViewport.worldPoints(
            zone.polygon
        ).forEach(p => {

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                7,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#42a6b9";

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth =
                2;

            ctx.fill();
            ctx.stroke();

        });

        return;
    }

    if (

        AppState.ui.mode === "zone" &&
        currentZone &&
        currentZone.polygon &&
        currentZone.polygon.length > 0

    ) {

        drawPolygonPreview(
            currentZone.polygon,
            "magenta",
            "rgba(255,0,255,0.15)"
        );

        // =====================
        // 🔥 ZONE FINISH BUTTON
        // =====================

        if (
            currentZone.polygon.length >= 3
        ) {

            const last =
                EMFViewport.worldPoint(
                    currentZone.polygon[
                    currentZone.polygon.length - 1
                    ]
                );

            const bx =

                Math.min(
                    canvas.width - 110,
                    Math.max(
                        10,
                        last.x + 20
                    )
                );

            const by =

                Math.max(
                    10,
                    last.y - 50
                );

            ctx.fillStyle =
                "#22c55e";

            ctx.beginPath();

            ctx.roundRect(
                bx,
                by,
                90,
                34,
                8
            );

            ctx.fill();

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 14px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Finish",
                bx + 45,
                by + 22
            );

            window.zoneFinishButton = {

                x: bx,
                y: by,
                width: 90,
                height: 34
            };
        }
    }


}

// =====================
// 🔥 POLYGON PREVIEW
// =====================

function drawPolygonPreview(

    points,
    stroke,
    fill

) {



    ctx.save();
    // =====================
    // 🔥 RESET CANVAS STATE
    // =====================

    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;

    ctx.setLineDash([]);

    ctx.lineWidth = 3;

    ctx.strokeStyle = stroke;

    ctx.fillStyle = fill;

    ctx.globalCompositeOperation =
        "source-over";


    if (!points?.length) {

        ctx.restore();

        return;
    }

    const pts =
        EMFViewport.worldPoints(points);

    console.error("WORLD POINTS", points);
    console.error("SCREEN POINTS", pts);

    // =====================
    // 🔥 FILL
    // =====================
    if (
        points.length >= 2
    ) {

        ctx.beginPath();

        ctx.moveTo(
            pts[0].x,
            pts[0].y
        );

        pts.forEach(p => {

            ctx.lineTo(
                p.x,
                p.y
            );

        });
        /*
        ctx.lineTo(
            mouseX,
            mouseY
        );
        */
        ctx.closePath();

        ctx.fillStyle =
            fill;

        ctx.fill();
    }

    // =====================
    // 🔥 OUTLINE
    // =====================

    ctx.strokeStyle =
        stroke;

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        pts[0].x,
        pts[0].y
    );

    pts.forEach(p => {

        ctx.lineTo(
            p.x,
            p.y
        );

    });

    // preview edge
    /*
    if (

        mouseX !== null &&
        mouseY !== null

    ) {

        ctx.lineTo(
            mouseX,
            mouseY
        );
    }
    */
    ctx.stroke();

    // =====================
    // 🔥 VERTICES
    // =====================

    pts.forEach(p => {

        ctx.fillStyle =
            stroke;

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

window.drawEditorPreviewLayer =
    drawEditorPreviewLayer;