//Owner:
//Render Manager

//Responsibility:
//Canvas Rendering

//Should not:
//Modify State


let renderQueued = false;

// ---------------------
// Rooms Layer
// ---------------------

function drawRoomsLayer(floor) {

    console.error("ROOM VIEWPORT", {
        scale: EMFViewport.scale,
        drawWidth: EMFViewport.drawWidth,
        drawHeight: EMFViewport.drawHeight,
        offsetX: EMFViewport.offsetX,
        offsetY: EMFViewport.offsetY
    });

    console.error(
        "ENTER drawRoomsLayer"
    );

    console.log(
        "ROOM DRAFT",
        AppState.ui.roomDraft
    );

    ctx.save();

    if (!floor) {
        ctx.restore();
        return;
    }

    // =====================================================
    // ROOM LAYER VISIBILITY
    // =====================================================
    // Rooms are controlled ONLY by the unified layer state.
    //
    // IMPORTANT:
    // Room Grid and Zone Grid are separate layers.
    // Do not use window.gridLayers here.
    // =====================================================

    const roomsVisible =
        window.layerVisibility?.rooms !== false;

    console.error(
        "ROOMS LAYER VISIBILITY:",
        roomsVisible
    );

    // =====================================================
    // CURRENT ROOM PREVIEW
    // =====================================================
    //
    // Draft drawing is kept independent from saved Room
    // polygons so the room-creation workflow continues to work.
    //
    // However, if Rooms layer is explicitly OFF, do not render
    // the normal Room layer.
    // =====================================================

    if (
        roomsVisible &&
        AppState.ui.roomDraft &&
        AppState.ui.roomDraft.polygon &&
        AppState.ui.roomDraft.polygon.length > 0
    ) {

        console.log(
            "ROOM DRAFT PREVIEW",
            AppState.ui.roomDraft
        );

        const poly =
            AppState.ui.roomDraft.polygon;

        ctx.save();

        // =====================
        // STYLE
        // =====================

        ctx.strokeStyle =
            "#ff9800";

        ctx.lineWidth =
            4;

        ctx.fillStyle =
            "rgba(255,152,0,0.12)";

        // =====================
        // POLYGON
        // =====================

        ctx.beginPath();

        const p0 =
            EMFViewport.worldPoint(
                poly[0]
            );

        ctx.moveTo(
            p0.x,
            p0.y
        );

        for (
            let i = 1;
            i < poly.length;
            i++
        ) {

            const p =
                EMFViewport.worldPoint(
                    poly[i]
                );

            ctx.lineTo(
                p.x,
                p.y
            );
        }

        // =====================
        // PREVIEW LINE
        // =====================

        if (
            poly.length < 3
        ) {

            const mouse =
                EMFViewport.worldToScreen(
                    AppState.mouseX,
                    AppState.mouseY
                );

            ctx.lineTo(
                mouse.x,
                mouse.y
            );
        }

        // =====================
        // FILL
        // =====================

        if (
            poly.length >= 2
        ) {

            ctx.fill();
        }

        // =====================
        // STROKE
        // =====================

        ctx.stroke();

        // =====================
        // RESET PATH
        // =====================

        ctx.beginPath();

        // =====================
        // VERTICES
        // =====================

        poly.forEach(p => {

            ctx.beginPath();

            const v =
                EMFViewport.worldPoint(
                    p
                );

            ctx.arc(
                v.x,
                v.y,
                7,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ff9800";

            ctx.fill();
        });

        // =====================
        // FINISH BUTTON
        // =====================

        if (
            poly.length >= 3
        ) {

            const last =
                EMFViewport.worldPoint(
                    poly[
                    poly.length - 1
                    ]
                );

            const bx =
                last.x + 16;

            const by =
                last.y - 18;

            // reset path

            ctx.beginPath();

            // button bg

            ctx.fillStyle =
                "green";

            ctx.save();

            ctx.globalCompositeOperation =
                "source-over";

            ctx.globalAlpha =
                1;

            ctx.fillRect(
                bx,
                by,
                130,
                40
            );

            ctx.restore();

            // border

            ctx.strokeStyle =
                "#ff9800";

            ctx.lineWidth =
                2;

            ctx.strokeRect(
                bx,
                by,
                130,
                40
            );

            // text

            ctx.fillStyle =
                "#fff";

            ctx.font =
                "bold 14px Arial";

            ctx.fillText(
                "Finish Room",
                bx + 18,
                by + 25
            );

            // hitbox

            console.error(
                "DRAWING FINISH BUTTON"
            );

            window.finishRoomButton = {

                x: bx,
                y: by,
                width: 130,
                height: 40

            };
        }

        ctx.restore();
    }

    // =====================================================
    // IMPORTANT
    // =====================================================
    //
    // If Rooms layer is OFF, stop here.
    //
    // This hides:
    // - Room polygons
    // - Room fills
    // - Room labels
    // - Room vertices
    //
    // It does NOT affect:
    // - Room Grid
    // - Zone Grid
    // - Zones
    // - Sources
    // - Heatmap
    // =====================================================

    if (!roomsVisible) {

        ctx.restore();

        return;
    }

    const rooms =
        floor.rooms || [];

    console.error(
        "DRAW ROOMS",
        rooms
    );

    // =====================================================
    // DRAW SAVED ROOMS
    // =====================================================

    rooms.forEach(room => {

        if (
            !room ||
            !room.polygon ||
            room.polygon.length < 3
        ) {
            return;
        }

        ctx.save();

        ctx.globalAlpha =
            1;

        ctx.globalCompositeOperation =
            "source-over";

        ctx.shadowBlur =
            0;

        ctx.setLineDash([]);

        // =================================================
        // ROOM STATUS
        // =================================================

        let status =
            "SAFE";

        try {

            status =
                getRoomRisk?.(room) ||
                room.status ||
                "SAFE";

        } catch {

            status =
                room.status ||
                "SAFE";
        }

        // =================================================
        // ROOM COLORS
        // =================================================

        let fillColor =
            "rgba(59,130,246,0.06)";

        let strokeColor =
            "#22c55e";

        if (
            status === "MODERATE"
        ) {

            fillColor =
                "rgba(250,204,21,0.06)";

            strokeColor =
                "#facc15";
        }

        if (
            status === "HIGH"
        ) {

            fillColor =
                "rgba(255,152,0,0.06)";

            strokeColor =
                "#ff9800";
        }

        if (
            status === "EXTREME"
        ) {

            fillColor =
                "rgba(255,77,109,0.06)";

            strokeColor =
                "#ff4d6d";
        }

        // =================================================
        // SELECTED ROOM
        // =================================================

        if (
            AppState.ui.selectedRoom?.id === room.id
        ) {

            strokeColor =
                "#2563eb";

            ctx.lineWidth =
                4;

            ctx.shadowColor =
                "#2563eb";

            ctx.shadowBlur =
                12;
        }

        // =================================================
        // ROOM POLYGON
        // =================================================

        const pts =
            EMFViewport.worldPoints(
                room.polygon
            );

        EMFViewport.drawPolygon(
            ctx,
            pts
        );

        // =================================================
        // FILL
        // =================================================

        ctx.fillStyle =
            fillColor;

        ctx.fill();

        // =================================================
        // STROKE
        // =================================================

        ctx.strokeStyle =
            strokeColor;

        if (
            AppState.ui.selectedRoom?.id === room.id
        ) {

            ctx.lineWidth =
                5;

            ctx.shadowColor =
                "#2563eb";

            ctx.shadowBlur =
                12;

        } else {

            ctx.lineWidth =
                3;

            ctx.shadowBlur =
                0;
        }

        ctx.stroke();

        // =================================================
        // ROOM CENTER
        // =================================================

        const screenCenter =
            EMFViewport.screenCenter(
                room.polygon
            );

        // =================================================
        // ROOM STATUS
        // =================================================

        ctx.font =
            "bold 12px Inter";

        ctx.fillStyle =
            "#16a34a";

        ctx.fillText(
            status,
            screenCenter.x,
            screenCenter.y + 4
        );

        // =================================================
        // RESET AFTER ROOM FILL / SHADOWS
        // =================================================

        ctx.globalAlpha =
            1;

        ctx.shadowBlur =
            0;

        ctx.shadowColor =
            "transparent";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        // =================================================
        // ROOM CODE
        // =================================================

        ctx.font =
            "bold 18px Arial";

        ctx.lineWidth =
            4;

        ctx.strokeStyle =
            "#ffffff";

        ctx.strokeText(
            room.code || "",
            screenCenter.x,
            screenCenter.y - 10
        );

        ctx.fillStyle =
            "#1e293b";

        ctx.fillText(
            room.code || "",
            screenCenter.x,
            screenCenter.y - 10
        );

        // =================================================
        // ROOM NAME
        // =================================================

        if (
            room.name &&
            room.name !== "Room"
        ) {

            ctx.font =
                "13px Arial";

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth =
                3;

            ctx.strokeText(
                room.name,
                screenCenter.x,
                screenCenter.y + 12
            );

            ctx.fillStyle =
                "#475569";

            ctx.fillText(
                room.name,
                screenCenter.x,
                screenCenter.y + 12
            );
        }

        // =================================================
        // ROOM VERTICES
        // =================================================

        room.polygon.forEach(world => {

            const p =
                EMFViewport.worldPoint(
                    world
                );

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(59,130,246,0.55)";

            ctx.fill();
        });

        ctx.restore();

    });

    ctx.restore();
}


// ---------------------
// Scale Layer
// ---------------------
function drawScaleLayer() {
    if (!scaleSet || scale <= 0) return;
    const meterPx = scale * scaleMeters;
    const startX = 40, startY = canvas.height - 40;
    ctx.strokeStyle = "red"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(startX + meterPx, startY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(startX, startY - 8); ctx.lineTo(startX, startY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(startX + meterPx, startY - 8); ctx.lineTo(startX + meterPx, startY + 8); ctx.stroke();
    ctx.fillStyle = "red"; ctx.font = "14px Arial"; ctx.fillText(scaleMeters + " m", startX + meterPx / 2 - 10, startY - 12);
}




// ---------------------
// Heatmap Layer
// ---------------------
function drawHeatmapLayer(floor) { if (!heatmapEnabled) return; drawHeatmapSmooth?.(); }

// ---------------------
// EXPORTS
// ---------------------

console.error(
    "EXPORT drawRoomsLayer",
    drawRoomsLayer
);

window.drawRoomsLayer = drawRoomsLayer;

window.drawSourcesLayer = drawSourcesLayer;


window.drawScaleLayer = drawScaleLayer;
window.drawHeatmapLayer = drawHeatmapLayer;



function drawSourcesLayer(floor) {

    if (
        window.layerVisibility?.sources === false
    ) {
        return;
    }

    if (
        !floor?.sources
    ) {
        return;
    }


    floor.sources.forEach(
        s => {

            console.error(
                "DRAW",
                s.type,
                sourceIcons[s.type]
            );


            const p =
                EMFViewport.worldPoint(
                    s
                );


            const icon =
                sourceIcons[s.type];


            const ICON_SIZE =
                36;

            const ICON_HALF =
                ICON_SIZE / 2;


            // ==================================================
            // SOURCE ICON
            // ==================================================

            if (
                icon?.complete
            ) {

                ctx.drawImage(
                    icon,

                    p.x -
                    ICON_HALF,

                    p.y -
                    ICON_HALF,

                    ICON_SIZE,
                    ICON_SIZE
                );
            }


            // ==================================================
            // VIEW-ONLY SOURCE FOCUS
            //
            // Visual indication only.
            // Does NOT select or activate the source.
            // ==================================================

            if (
                window.viewingSourceId === s.id ||
                window.objectTool?.selectedObjectId === s.id
            ) {

                ctx.strokeStyle =
                    "#2563eb";

                ctx.lineWidth =
                    3;

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    24,
                    0,
                    Math.PI * 2
                );

                ctx.stroke();
            }


            // ==================================================
            // SOURCE LABEL
            // ==================================================

            ctx.font =
                "11px Arial";

            ctx.fillStyle =
                "#111";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "top";


            const cfg =
                OBJECT_CONFIGS?.[
                s.type
                ];


            const label =
                cfg?.label ||
                s.type;


            ctx.fillText(
                label,
                p.x,
                p.y +
                ICON_HALF +
                6
            );


            // ==================================================
            // DISTANCE / DIRECTION
            // ==================================================

            if (
                s.exactDistance
            ) {

                let info =
                    `${s.exactDistance}m`;


                if (
                    s.direction
                ) {

                    info +=
                        ` • ${s.direction}`;
                }


                ctx.font =
                    "10px Arial";

                ctx.fillStyle =
                    "#666";


                ctx.fillText(
                    info,
                    p.x,
                    p.y +
                    ICON_HALF +
                    20
                );
            }

        }
    );
}
