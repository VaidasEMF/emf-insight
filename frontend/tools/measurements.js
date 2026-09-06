
// =====================
// 🔥 MEASUREMENTS MODULE (FULL VERSION)
// =====================

// =====================
// 🔥 HANDLE MEASURE CLICK
// =====================

function handleMeasureClick(evt) {

    console.error(
        "🔥🔥🔥 HANDLE MEASURE CLICK"
    );

    AppState.ui.mode =
        "measure";

    // =====================
    // CANVAS POINT
    // =====================

    const p =
        getCanvasPoint(evt);

    console.error(
        "🔥 CLICK CANVAS POINT:",
        {
            x: p?.x,
            y: p?.y
        }
    );

    if (!p) {

        console.error(
            "❌ NO CANVAS POINT"
        );

        return;
    }

    const x =
        p.x;

    const y =
        p.y;

    // =====================
    // SNAP
    // =====================

    const snapped =
        getNearestGridPoint(
            x,
            y
        );

    if (!snapped) {

        console.error(
            "❌ NO GRID POINT FOUND"
        );

        updateStatus?.(
            "⚠ Click closer to grid point"
        );

        return;
    }

    const point =
        snapped;

    // =====================
    // 🔥 CURRENT FLOOR
    // =====================

    const floor =
        getCurrentFloor?.();

    // =====================
    // 🔥 FIND ROOM OWNER
    // =====================

    const roomOwner =
        floor?.rooms?.find(
            room =>
                Array.isArray(
                    room.grid
                ) &&
                room.grid.includes(
                    point
                )
        );

    // =====================
    // 🔥 FIND ZONE OWNER
    // =====================

    const zoneOwner =
        floor?.zones?.find(
            zone =>
                Array.isArray(
                    zone.grid
                ) &&
                zone.grid.includes(
                    point
                )
        );

    // =====================
    // 🔥 SELECTED POINT DEBUG
    // =====================

    console.error(
        "🔥🔥🔥 SELECTED MEASUREMENT POINT",
        {
            id:
                point.id,

            x:
                point.x,

            y:
                point.y,

            mode:
                AppState.ui.mode,

            floor:
                floor?.name ||
                null,

            floorIndex:
                AppState.project
                    ?.currentFloorIndex,

            room:
                roomOwner?.name ||
                roomOwner?.id ||
                null,

            zone:
                zoneOwner?.type ||
                zoneOwner?.id ||
                null,

            roomPoint:
                !!roomOwner,

            zonePoint:
                !!zoneOwner,

            measurements:
                point.measurements,

            rf:
                point.rf,

            electric:
                point.electric,

            magnetic:
                point.magnetic,

            measured:
                point.measured,

            completed:
                point.completed
        }
    );

    // =====================
    // 🔥 MEASUREMENT OBJECT
    // =====================

    if (
        !point.measurements
    ) {

        point.measurements =
            {};
    }

    console.error(
        "🔥 POINT BEFORE POPUP:",
        point
    );

    // =====================
    // 🔥 SELECT POINT
    // =====================

    window.selectedGridPoint =
        point;

    // =====================
    // 🔥 OPEN POPUP
    // =====================

    openMeasurementPopup?.(
        point
    );

    // =====================
    // 🔥 UI
    // =====================

    requestRender?.();

    updateProgressUI?.();

    updateStatus?.(
        "📊 Measurement point selected"
    );
}

// SAVE MEASUREMENT
function saveMeasurement() {

    console.error(
        "SAVE POINT",
        window.selectedGridPoint
    );




    const point =
        window.selectedGridPoint;

    if (!point) {



        return;
    }

    // =====================
    // 🔥 SAVE VALUES
    // =====================

    if (
        activeMeasureType === "rf" ||
        activeMeasureType === "all"
    ) {

        point.rf =

            parseFloat(

                document.getElementById(
                    "measureRF"
                ).value

            ) || 0;

        point.measuredRF =
            true;
    }

    if (
        activeMeasureType ===
        "electric" ||

        activeMeasureType ===
        "all"
    ) {

        point.electric =

            parseFloat(

                document.getElementById(
                    "measureElectric"
                ).value

            ) || 0;

        point.measuredE =
            true;
    }

    if (
        activeMeasureType ===
        "magnetic" ||

        activeMeasureType ===
        "all"
    ) {

        point.magnetic =

            parseFloat(

                document.getElementById(
                    "measureMagnetic"
                ).value

            ) || 0;

        point.measuredM =
            true;
    }

    // =====================
    // 🔥 COMPLETED
    // =====================

    point.completed =

        point.measuredRF &&
        point.measuredE &&
        point.measuredM;

    // =====================
    // 🔥 PARTIAL STATE
    // =====================

    point.partial =

        point.measuredRF ||
        point.measuredE ||
        point.measuredM;

    // =====================
    // 🔥 SAVE STATE
    // =====================

    point.measured =
        point.partial;

    point.measurements =
        point.measurements || {};

    point.measurements[
        sessionId || "default"
    ] = {

        rf:
            point.rf || 0,

        electric:
            point.electric || 0,

        magnetic:
            point.magnetic || 0,

        completed:
            point.completed,

        savedAt:
            Date.now()
    };

    // =====================
    // 🔥 COMPLETED
    // =====================

    point.completed =

        point.measuredRF &&
        point.measuredE &&
        point.measuredM;


    // =====================
    // 🔥 RISK
    // =====================

    point.risk =
        calculatePointRisk?.(
            point
        ) || "safe";

    // =====================
    // 🔥 UI
    // =====================

    updateStatus?.(
        "✅ Measurement saved"
    );

    updateProgressUI?.();

    updateAnalyticsUI?.();

    updateRoomAnalyticsUI?.();

    updateWorstRoomUI?.();

    updateLiveHUD?.();

    window.updateWorkflowUI?.();
    requestRender?.();

    saveProject?.();
}


function getThresholds() {
    if (measureType === "electric") return { warning: 5, danger: 61 };
    if (measureType === "magnetic") return { warning: 200, danger: 100000 };
    return { warning: 100, danger: 1000 };
}

// ==================================================
// 🔥 DRAW GRID POINTS LAYER
//
// Room Grid and Zone Grid are independent layers.
//
// IMPORTANT:
// - window.layerVisibility is the single source
//   of layer visibility.
// - Zone Grid is rendered separately from Room Grid.
// - Zone points have visual priority because Zone
//   owns its physical area.
// ==================================================

function drawGridPointsLayer(
    rooms
) {

    const floor =
        getCurrentFloor?.();

    const layers =
        window.layerVisibility || {};


    // ==================================================
    // EFFECTIVE GRID VISIBILITY
    //
    // Grid is a child of its parent layer.
    //
    // Room Grid can only be rendered when:
    //   1. Room Grid is ON
    //   2. Rooms are ON
    //
    // Zone Grid can only be rendered when:
    //   1. Zone Grid is ON
    //   2. Zones are ON
    //
    // IMPORTANT:
    // We do NOT modify layerVisibility here.
    // The user's individual Grid preference is preserved.
    // We only determine whether it is actually rendered.
    // ==================================================

    const showRoomGrid =
        layers.roomGrid !== false &&
        layers.rooms !== false;

    const showZoneGrid =
        layers.zoneGrid !== false &&
        layers.zones !== false;


    console.log(
        "GRID RENDER VISIBILITY",
        {
            rooms:
                layers.rooms,
            roomGrid:
                layers.roomGrid,

            zones:
                layers.zones,
            zoneGrid:
                layers.zoneGrid,

            showRoomGrid,
            showZoneGrid
        }
    );


    // ==================================================
    // ROOM GRID
    // ==================================================

    if (
        showRoomGrid &&
        Array.isArray(rooms)
    ) {

        ctx.save();

        rooms.forEach(
            room => {

                const points =
                    Array.isArray(
                        room?.grid
                    )
                        ? room.grid
                        : [];


                points.forEach(
                    point => {

                        // ----------------------------------
                        // Zone-owned Room points remain hidden
                        //
                        // Zone owns this physical area.
                        // ----------------------------------

                        if (
                            point?.zoneId
                        ) {

                            return;
                        }


                        drawGridPoint(
                            point
                        );
                    }
                );
            }
        );

        ctx.restore();
    }


    // ==================================================
    // ZONE GRID
    // ==================================================

    if (
        showZoneGrid &&
        Array.isArray(
            floor?.zones
        )
    ) {

        ctx.save();

        floor.zones.forEach(
            zone => {

                const points =
                    Array.isArray(
                        zone?.grid
                    )
                        ? zone.grid
                        : [];


                points.forEach(
                    point => {

                        drawGridPoint(
                            point
                        );
                    }
                );
            }
        );

        ctx.restore();
    }
}

function getMeasurementPointStatus(
    point
) {

    if (!point) {

        return {

            state:
                "notMeasured",

            profile: {

                rf: false,
                electric: false,
                magnetic: false
            },

            required: 0,

            measured: 0,

            partial: false,

            confirmed: false
        };
    }


    const activeSessionId =
        sessionId ||
        "default";


    const measurement =
        point.measurements?.[
        activeSessionId
        ] || {};


    const profile =
        measurement.profile ||
        point.measurementStatus?.profile ||
        null;


    /*
     * Backward compatibility.
     *
     * Old points without a saved profile
     * are treated as ALL.
     */

    const requiredProfile = {

        rf:
            profile?.rf !== false,

        electric:
            profile?.electric !== false,

        magnetic:
            profile?.magnetic !== false
    };


    const hasRF =
        measurement.rf !== undefined &&
        measurement.rf !== null &&
        measurement.rf !== "";


    const hasElectric =
        measurement.electric !== undefined &&
        measurement.electric !== null &&
        measurement.electric !== "";


    const hasMagnetic =
        measurement.magnetic !== undefined &&
        measurement.magnetic !== null &&
        measurement.magnetic !== "";


    const requiredValues = [];


    if (
        requiredProfile.rf
    ) {

        requiredValues.push(
            hasRF
        );
    }


    if (
        requiredProfile.electric
    ) {

        requiredValues.push(
            hasElectric
        );
    }


    if (
        requiredProfile.magnetic
    ) {

        requiredValues.push(
            hasMagnetic
        );
    }


    const required =
        requiredValues.length;


    const measured =
        requiredValues.filter(
            Boolean
        ).length;


    /*
     * No required measurement exists.
     */

    if (
        required === 0
    ) {

        return {

            state:
                "notMeasured",

            profile:
                requiredProfile,

            required,

            measured,

            partial:
                false,

            confirmed:
                false
        };
    }


    /*
     * Nothing measured yet.
     */

    if (
        measured === 0
    ) {

        return {

            state:
                "notMeasured",

            profile:
                requiredProfile,

            required,

            measured,

            partial:
                false,

            confirmed:
                false
        };
    }


    /*
     * ALL required modalities measured.
     */

    if (
        measured === required
    ) {

        return {

            state:
                "confirmed",

            profile:
                requiredProfile,

            required,

            measured,

            partial:
                false,

            confirmed:
                true
        };
    }


    /*
     * Some, but not all,
     * required modalities measured.
     */

    return {

        state:
            "partial",

        profile:
            requiredProfile,

        required,

        measured,

        partial:
            true,

        confirmed:
            false
    };
}



function drawGridPoint(
    point
) {

    if (!point) {
        return;
    }


    // ==================================================
    // WORLD → SCREEN
    // ==================================================

    const p =
        EMFViewport.worldPoint(
            point
        );


    // ==================================================
    // CURRENT FLOOR / ZONE
    // ==================================================

    const floor =
        getCurrentFloor?.();


    const containingZone =
        getZoneContainingPoint?.(
            point,
            floor
        );


    const roomMeasureBlocked =
        AppState.ui.mode ===
        "roomMeasure" &&
        !!containingZone;


    // ==================================================
    // CURRENT SESSION MEASUREMENT
    // ==================================================

    const currentSession =
        (
            typeof sessionId !==
            "undefined" &&
            sessionId
        )
            ? sessionId
            : "default";


    const measurement =
        point.measurements?.[
        currentSession
        ] || {};


    // ==================================================
    // ACTIVE MEASUREMENT TYPE
    // ==================================================

    const currentType =
        (
            typeof activeMeasureType !==
            "undefined"
        )
            ? activeMeasureType
            : (
                typeof measureType !==
                "undefined"
            )
                ? measureType
                : "all";


    // ==================================================
    // MEASUREMENT STATUS — PROFILE AWARE
    //
    // IMPORTANT:
    // Grid point colors represent measurement completion.
    // They do NOT represent EMF risk.
    //
    // The Measurement Profile determines which modalities
    // are required for this point.
    //
    // activeMeasureType only controls the current view.
    // It must NOT decide whether a point is complete.
    // ==================================================

    const pointProfile =
        measurement?.profile || null;


    // ==================================================
    // REQUIRED MODALITIES
    // ==================================================

    const requiredRF =
        pointProfile?.rf === true;


    const requiredElectric =
        pointProfile?.electric === true;


    const requiredMagnetic =
        pointProfile?.magnetic === true;


    // ==================================================
    // MEASURED VALUES
    // ==================================================

    const hasRF =
        measurement.rf !== null &&
        measurement.rf !== undefined &&
        measurement.rf !== "" &&
        Number(
            measurement.rf
        ) > 0;


    const hasElectric =
        measurement.electric !== null &&
        measurement.electric !== undefined &&
        measurement.electric !== "" &&
        Number(
            measurement.electric
        ) > 0;


    const hasMagnetic =
        measurement.magnetic !== null &&
        measurement.magnetic !== undefined &&
        measurement.magnetic !== "" &&
        Number(
            measurement.magnetic
        ) > 0
        ;


    // ==================================================
    // PROFILE-REQUIRED MEASUREMENTS
    // ==================================================

    const measuredRequiredCount =
        Number(
            requiredRF &&
            hasRF
        ) +
        Number(
            requiredElectric &&
            hasElectric
        ) +
        Number(
            requiredMagnetic &&
            hasMagnetic
        );


    const requiredCount =
        Number(
            requiredRF
        ) +
        Number(
            requiredElectric
        ) +
        Number(
            requiredMagnetic
        );


    // ==================================================
    // PROFILE STATUS
    // ==================================================

    const profileComplete =
        requiredCount > 0 &&
        measuredRequiredCount ===
        requiredCount;


    const profilePartial =
        requiredCount > 0 &&
        measuredRequiredCount > 0 &&
        measuredRequiredCount <
        requiredCount;


    const measuredCount =
        Number(hasRF) +
        Number(hasElectric) +
        Number(hasMagnetic);


    // ==================================================
    // DEFAULT POINT STYLE
    //
    // WHITE  = NOT MEASURED
    // VIOLET = PARTIAL
    // GREEN  = COMPLETE
    //
    // IMPORTANT:
    // THESE ARE MEASUREMENT STATES.
    // THEY ARE NOT RISK COLORS.
    // ==================================================

    let radius =
        4;


    let fill =
        "#ffffff";


    let stroke =
        "#cbd5e1";


    let lineWidth =
        1.5;

    // ==================================================
    // MEASUREMENT STATE VISUALIZATION
    // ==================================================
    //
    // Colors:
    // WHITE  = not measured
    // VIOLET = partial
    // GREEN  = complete
    //
    // These colors indicate measurement state only.
    // They are NOT risk colors.
    // ==================================================


    // ==================================================
    // ALL
    // ==================================================

    if (
        currentType ===
        "all"
    ) {

        if (
            profileComplete
        ) {

            radius =
                5;

            fill =
                "#22c55e";

            stroke =
                "#22c55e";
        }

        else if (
            profilePartial
        ) {

            radius =
                5;

            fill =
                "#8b5cf6";

            stroke =
                "#8b5cf6";
        }

        else {

            radius =
                4;

            fill =
                "#ffffff";

            stroke =
                "#cbd5e1";
        }
    }


    // ==================================================
    // RF
    // ==================================================

    else if (
        currentType ===
        "rf"
    ) {

        if (
            requiredRF &&
            hasRF
        ) {

            radius =
                5;

            fill =
                "#22c55e";

            stroke =
                "#22c55e";
        }

        else if (
            requiredRF &&
            !hasRF &&
            (
                hasElectric ||
                hasMagnetic
            )
        ) {

            radius =
                5;

            fill =
                "#8b5cf6";

            stroke =
                "#8b5cf6";
        }

        else {

            radius =
                4;

            fill =
                "#ffffff";

            stroke =
                "#cbd5e1";
        }
    }


    // ==================================================
    // ELECTRIC
    // ==================================================

    else if (
        currentType ===
        "electric"
    ) {

        if (
            requiredElectric &&
            hasElectric
        ) {

            radius =
                5;

            fill =
                "#22c55e";

            stroke =
                "#22c55e";
        }

        else if (
            requiredElectric &&
            !hasElectric &&
            (
                hasRF ||
                hasMagnetic
            )
        ) {

            radius =
                5;

            fill =
                "#8b5cf6";

            stroke =
                "#8b5cf6";
        }

        else {

            radius =
                4;

            fill =
                "#ffffff";

            stroke =
                "#cbd5e1";
        }
    }


    // ==================================================
    // MAGNETIC
    // ==================================================

    else if (
        currentType ===
        "magnetic"
    ) {

        if (
            requiredMagnetic &&
            hasMagnetic
        ) {

            radius =
                5;

            fill =
                "#22c55e";

            stroke =
                "#22c55e";
        }

        else if (
            requiredMagnetic &&
            !hasMagnetic &&
            (
                hasRF ||
                hasElectric
            )
        ) {

            radius =
                5;

            fill =
                "#8b5cf6";

            stroke =
                "#8b5cf6";
        }

        else {

            radius =
                4;

            fill =
                "#ffffff";

            stroke =
                "#cbd5e1";
        }
    }


    // ==================================================
    // ZONE POINT
    //
    // Keep zone grid points visually identifiable
    // when they have not been measured.
    // ==================================================

    if (
        point.type ===
        "zone" &&
        measuredCount ===
        0
    ) {

        fill =
            "#f3e8ff";

        stroke =
            "#a855f7";
    }


    // ==================================================
    // ROOM POINT BLOCKED BY ZONE
    //
    // Only applies while drawing room measurements.
    // ==================================================

    if (
        roomMeasureBlocked &&
        point.type !== "zone"
    ) {

        fill =
            "#e2e8f0";

        stroke =
            "#94a3b8";

        radius =
            4;

        lineWidth =
            1.5;
    }


    // ==================================================
    // SELECTED POINT
    // ==================================================

    if (
        window.selectedGridPoint ===
        point
    ) {

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            radius + 7,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#2563eb";

        ctx.lineWidth =
            3;

        ctx.stroke();
    }


    // ==================================================
    // HOVERED POINT
    // ==================================================

    if (
        window.hoveredGridPoint ===
        point
    ) {

        ctx.beginPath();


        if (
            point.type ===
            "zone"
        ) {

            const hoverRadius =
                radius + 4;


            ctx.moveTo(
                p.x,
                p.y -
                hoverRadius
            );


            ctx.lineTo(
                p.x +
                hoverRadius,
                p.y
            );


            ctx.lineTo(
                p.x,
                p.y +
                hoverRadius
            );


            ctx.lineTo(
                p.x -
                hoverRadius,
                p.y
            );


            ctx.closePath();

        }
        else {

            ctx.arc(
                p.x,
                p.y,
                radius + 4,
                0,
                Math.PI * 2
            );
        }


        ctx.strokeStyle =
            roomMeasureBlocked
                ? "#94a3b8"
                : "#2563eb";


        ctx.lineWidth =
            roomMeasureBlocked
                ? 2
                : 2.5;


        ctx.stroke();
    }


    // ==================================================
    // DRAW POINT
    // ==================================================

    ctx.beginPath();


    if (
        point.type ===
        "zone"
    ) {

        ctx.moveTo(
            p.x,
            p.y - radius
        );


        ctx.lineTo(
            p.x + radius,
            p.y
        );


        ctx.lineTo(
            p.x,
            p.y + radius
        );


        ctx.lineTo(
            p.x - radius,
            p.y
        );


        ctx.closePath();

    }
    else {

        ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            Math.PI * 2
        );
    }


    // ==================================================
    // FILL
    // ==================================================

    ctx.fillStyle =
        fill;

    ctx.fill();


    // ==================================================
    // STROKE
    // ==================================================

    ctx.strokeStyle =
        stroke;

    ctx.lineWidth =
        lineWidth;

    ctx.stroke();
}

function getRoomSector(
    x,
    y,
    room
) {

    console.error(
        "MIN/MAX:",
        {
            minX: Math.min(...room.polygon.map(p => p.x)),
            maxX: Math.max(...room.polygon.map(p => p.x)),
            minY: Math.min(...room.polygon.map(p => p.y)),
            maxY: Math.max(...room.polygon.map(p => p.y))
        }
    );



    const xs = room.polygon.map(p => p.x);



    const ys = room.polygon.map(p => p.y);



    const minX = Math.min(...xs);


    const maxX = Math.max(...xs);


    const minY = Math.min(...ys);

    const maxY = Math.max(...ys);



    const cx =
        (minX + maxX) / 2;

    const cy =
        (minY + maxY) / 2;

    const centerMarginX =
        (maxX - minX) * 0.2;

    const centerMarginY =
        (maxY - minY) * 0.2;

    if (

        Math.abs(x - cx)
        <
        centerMarginX

        &&

        Math.abs(y - cy)
        <
        centerMarginY

    ) {

        return "center";
    }

    if (
        x < cx &&
        y < cy
    ) {
        return "nw";
    }

    if (
        x >= cx &&
        y < cy
    ) {
        return "ne";
    }

    if (
        x < cx &&
        y >= cy
    ) {
        return "sw";
    }

    return "se";
}


function drawGridTooltip() {

    const point =
        window.hoveredGridPoint;

    const floor =
        getCurrentFloor?.();

    const containingZone =
        getZoneContainingPoint?.(
            point,
            floor
        );

    const roomMeasureBlocked =
        AppState.ui.mode ===
        "roomMeasure" &&
        !!containingZone;

    if (!point) {
        return;
    }

    const p =
        EMFViewport.worldPoint(
            point
        );

    const x =
        p.x + 22;

    const y =
        p.y - 26;

    // ==================================================
    // ZONE OWNERSHIP TOOLTIP
    // ==================================================

    if (
        roomMeasureBlocked
    ) {

        const tooltipWidth =
            220;

        const tooltipHeight =
            82;


        ctx.beginPath();

        ctx.roundRect(

            x,
            y,

            tooltipWidth,
            tooltipHeight,

            12
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.96)";

        ctx.fill();


        ctx.strokeStyle =
            "rgba(148,163,184,0.28)";

        ctx.lineWidth =
            1.5;

        ctx.stroke();


        // ----------------------------------------------
        // TITLE
        // ----------------------------------------------

        ctx.fillStyle =
            "#0f172a";

        ctx.font =
            "700 12px Inter";

        ctx.fillText(
            "Zone measurement point",
            x + 12,
            y + 22
        );


        // ----------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------

        ctx.fillStyle =
            "#475569";

        ctx.font =
            "11px Inter";

        ctx.fillText(
            "This point belongs to a Zone.",
            x + 12,
            y + 42
        );


        ctx.fillText(
            "Use Zone Measuring to measure it.",
            x + 12,
            y + 59
        );


        // ----------------------------------------------
        // ZONE NAME
        // ----------------------------------------------

        if (
            containingZone?.name
        ) {

            ctx.fillStyle =
                "#7c3aed";

            ctx.font =
                "600 10px Inter";

            ctx.fillText(
                containingZone.name,
                x + 12,
                y + 74
            );
        }


        return;
    }

    // =====================
    // 🔥 CARD
    // =====================

    ctx.beginPath();

    ctx.roundRect(

        x,
        y,

        112,
        56,

        12
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.88)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(148,163,184,0.18)";

    ctx.lineWidth = 2.5;

    ctx.stroke();

    // =====================
    // 🔥 SHADOW
    // =====================

    ctx.shadowColor =
        "rgba(15,23,42,0.10)";

    ctx.shadowBlur = 10;

    ctx.shadowOffsetY = 3;

    // =====================
    // 🔥 POINT ID
    // =====================

    ctx.fillStyle =
        "#0f172a";

    ctx.font =
        "600 11px Inter";

    ctx.fillText(
        point.code || point.id,
        x + 12,
        y + 18
    );

    // =====================
    // 🔥 DIVIDERS
    // =====================

    ctx.strokeStyle =
        "rgba(148,163,184,0.22)";

    ctx.beginPath();

    ctx.moveTo(
        x + 38,
        y + 24
    );

    ctx.lineTo(
        x + 38,
        y + 46
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x + 72,
        y + 24
    );

    ctx.lineTo(
        x + 72,
        y + 46
    );

    ctx.stroke();

    // =====================
    // 🔥 RF
    // =====================

    ctx.fillStyle =
        "#2563eb";

    ctx.font =
        "600 10px Inter";

    ctx.fillText(
        "RF",
        x + 14,
        y + 34
    );

    ctx.fillStyle =
        "#334155";

    ctx.font =
        "10px Inter";

    ctx.fillText(

        point.rf ?? 0,

        x + 14,
        y + 48
    );

    // =====================
    // 🔥 ELECTRIC
    // =====================

    ctx.fillStyle =
        "#f59e0b";

    ctx.font =
        "600 10px Inter";

    ctx.fillText(
        "E",
        x + 50,
        y + 34
    );

    ctx.fillStyle =
        "#334155";

    ctx.font =
        "10px Inter";

    ctx.fillText(

        point.electric ?? 0,

        x + 50,
        y + 48
    );

    // =====================
    // 🔥 MAGNETIC
    // =====================

    ctx.fillStyle =
        "#16a34a";

    ctx.font =
        "600 10px Inter";

    ctx.fillText(
        "M",
        x + 84,
        y + 34
    );

    ctx.fillStyle =
        "#334155";

    ctx.font =
        "10px Inter";

    ctx.fillText(

        point.magnetic ?? 0,

        x + 84,
        y + 48
    );

    // =====================
    // 🔥 RESET SHADOW
    // =====================

    ctx.shadowColor =
        "transparent";

    ctx.shadowBlur = 0;

    ctx.shadowOffsetY = 0;
}



// =====================
// DRAW MEASUREMENTS LAYER
// =====================
function drawMeasurementsLayer(floor) {

    console.error(
        "DRAW MEASUREMENTS FLOOR",
        floor
    );

    drawGridPointsLayer?.(
        floor?.rooms || []
    );
}

function getZoneAreaCoverage(
    zone
) {

    if (!zone) {

        return {

            measured: 0,
            total: 0,
            percent: 0
        };
    }


    const availableSectors =
        new Set();


    const measuredSectors =
        new Set();


    const points =
        Array.isArray(
            zone.grid
        )
            ? zone.grid
            : [];


    points.forEach(
        point => {

            // ==========================================
            // AVAILABLE SECTOR
            // ==========================================

            if (
                point.sector
            ) {

                availableSectors.add(
                    point.sector
                );
            }


            // ==========================================
            // CONFIRMED SECTOR
            // ==========================================
            //
            // A sector counts as measured only when
            // at least one point in that sector is
            // CONFIRMED according to its profile.
            //

            const status =
                getMeasurementPointStatus?.(
                    point
                );


            if (
                status?.state ===
                "confirmed"
            ) {

                if (
                    point.sector
                ) {

                    measuredSectors.add(
                        point.sector
                    );
                }
            }
        }
    );


    const total =
        availableSectors.size;


    const measured =
        measuredSectors.size;


    const percent =
        total > 0

            ? Math.round(
                (
                    measured /
                    total
                ) * 100
            )

            : 0;


    return {

        measured,

        total,

        percent
    };
}

function getRoomAreaCoverage(
    room
) {

    if (!room) {

        return {

            measured: 0,
            total: 0,
            percent: 0
        };
    }


    const availableSectors =
        new Set();


    const measuredSectors =
        new Set();


    const points =
        Array.isArray(
            room.grid
        )
            ? room.grid
            : [];


    points.forEach(
        point => {

            if (
                point.sector
            ) {

                availableSectors.add(
                    point.sector
                );
            }


            const status =
                getMeasurementPointStatus?.(
                    point
                );


            if (
                status?.state ===
                "confirmed"
            ) {

                if (
                    point.sector
                ) {

                    measuredSectors.add(
                        point.sector
                    );
                }
            }
        }
    );


    const total =
        availableSectors.size;


    const measured =
        measuredSectors.size;


    const percent =
        total > 0

            ? Math.round(
                (
                    measured /
                    total
                ) * 100
            )

            : 0;


    return {

        measured,

        total,

        percent
    };
}

function generateGrid() {



    console.time(
        "ROOM GRID"
    );

    console.time("GRID");

    console.log(
        "GENERATE GRID ROOM:",
        AppState.ui.selectedRoom.code
    );

    console.time(
        "GRID GENERATION"
    );

    console.log(
        "GENERATE GRID START"
    );

    console.log(
        "ROOMS:",
        window.roomTool?.rooms
    );

    const floor =
        getCurrentFloor();

    console.error("===== GENERATE GRID =====");

    console.error("ROOMS:", floor.rooms);

    console.error("SELECTED ROOM:", AppState.ui.selectedRoom);

    console.error("CURRENT SCALE:", floor.currentScale);

    if (!floor) return;

    const rooms =
        floor.rooms || [];

    // 🔥 validate
    for (const room of rooms) {

        if (!validateGridSize(room)) {
            return;
        }
    }


    // =====================
    // 🔥 GENERATE GRID
    // =====================
    const meters =

        window.selectedGridSize ||
        1;



    const roomsToGenerate =

        floor.rooms.filter(
            room => !room.grid?.length
        );

    console.error(
        "ROOMS TO GENERATE:",
        roomsToGenerate
    );

    roomsToGenerate.forEach(room => {

        console.error("START ROOM:", room.code);

        // 🔥 save room grid size
        room.gridSize =
            meters;

        // 🔥 room px spacing
        const currentScale =

            floor.currentScale;

        console.log(
            "GRID SIZE METERS:",
            room.gridSize
        );

        console.log(
            "METERS PER PIXEL:",
            floor.currentScale
        );

        console.log(
            "PIXELS PER METER:",
            1 / floor.currentScale
        );

        console.error(
            "CURRENT SCALE:",
            currentScale
        );

        console.error("CURRENT SCALE OK:", currentScale);

        if (!currentScale) {



            return;
        }

        console.log(
            "FLOOR SCALE:",
            floor.currentScale
        );

        console.log(
            "WINDOW SCALE:",
            window.scale
        );

        console.log(
            "WINDOW CURRENT SCALE:",
            window.currentScale
        );

        console.log(
            "CURRENT SCALE USED:",
            currentScale
        );

        const roomGridPx =

            (1 / floor.currentScale) *
            (room.gridSize || 1);




        if (
            roomGridPx < 5
        ) {



            return;
        }

        console.log(
            "GRID ROOM:",
            room
        );

        const hasMeasurements =

            room.grid?.some(

                p =>

                    p.rf ||
                    p.electric ||
                    p.magnetic
            );


        if (
            hasMeasurements &&
            !confirm(
                "Regenerating grid will remove measurements. Continue?"
            )
        ) {

            return;
        }

        // 🔥 reset room grid
        room.grid = [];

        console.error("GRID RESET");

        console.log(
            "RESET GRID",
            room
        );

        console.log(
            "GENERATING ROOM",
            room.name
        );



        console.log(
            "ROOM POLYGON",
            room.polygon
        );

        try {

            const xs =
                room.polygon.map(p => p.x);

            const ys =
                room.polygon.map(p => p.y);



        }
        catch (e) {

            console.error("MAP ERROR:", e);

            throw e;
        }



        console.error(
            "POLYGON:",
            room.polygon?.length
        );

        if (
            !room.polygon ||
            room.polygon.length < 3
        ) {
            return;
        }

        console.error(
            "ROOM GRID CREATED",
            room.code,
            room.grid.length
        );

        const xs =

            room.polygon.map(
                p => p.x
            );

        const ys =

            room.polygon.map(
                p => p.y
            );

        const minX =
            Math.min(...xs);

        const maxX =
            Math.max(...xs);

        const minY =
            Math.min(...ys);

        const maxY =
            Math.max(...ys);




        let tested = 0;


        let inside = 0;

        const centerPoint = {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };


        for (
            let x = minX;
            x <= maxX;
            x += roomGridPx
        ) {

            for (
                let y = minY;
                y <= maxY;
                y += roomGridPx
            ) {

                tested++;

                const testPoint = {
                    x,
                    y
                };

                const insideTest =
                    pointInPolygon(
                        testPoint,
                        room.polygon
                    );

                if (tested <= 10) {


                }

                if (insideTest) {

                    inside++;

                    try {

                        room.grid.push({

                            // ==================================================
                            // 🔥 PHI DOMAIN ID
                            // ==================================================

                            id:
                                window.PhiIdFactory
                                    ?.createMeasurementPointId?.() ||
                                (
                                    "measurement_point_" +
                                    Date.now()
                                ),

                            x,
                            y,

                            code:
                                "P" +
                                pointCounter++,

                            x,
                            y,

                            sector:
                                getRoomSector(
                                    x,
                                    y,
                                    room
                                ),

                            measurements: {},

                            measured: false
                        });

                    }
                    catch (e) {



                        throw e;
                    }
                }
            }
        }




    });


    // =====================
    // 🔥 ROOM GUIDANCE
    // =====================
    let totalPoints = 0;

    rooms.forEach(r => {
        totalPoints += (r.grid || []).length;
    });

    console.log("TOTAL GRID POINTS:", totalPoints);

    // =====================
    // 🔥 FLOW UPDATE
    // =====================
    gridCreated = true;

    AppState.ui.mode = "idle";

    window.scaleTool.active =
        false;

    console.log(
        "MODE CHANGED TO MEASURE"
    );

    const legendHud =
        document.getElementById(
            "legendHud"
        );

    if (legendHud) {

        legendHud.style.display =
            "block";
    }


    window.updateFlow?.();
    updateGuideText?.();
    updateRoomStatusUI?.();
    updateUIState?.();
    updateProgressUI?.();
    highlightNextStep?.();

    updateStatus?.("✅ Grid generated");

    window.updateWorkflowUI?.();

    console.error(
        "AFTER GRID",
        floor.rooms.map(r => ({
            code: r.code,
            grid: r.grid?.length
        }))
    );

    requestRender();

    console.log(
        "ROOMS AFTER GRID:",
        floor.rooms
    );

    console.timeEnd(
        "GRID GENERATION"
    );

    console.timeEnd("GRID");

    console.log(
        "GENERATE GRID END"
    );

    console.timeEnd(
        "ROOM GRID"
    );

    console.error(
        "ALL ROOMS",
        floor.rooms.map(r => ({
            code: r.code,
            grid: r.grid.length
        }))
    );

}



function openMeasurePanel(point) {



    // =====================
    // 🔥 SHOW LEGEND
    // =====================

    const legend =
        document.getElementById(
            "legendHud"
        );

    if (legend) {

        legend.style.display =
            "block";
    }

    const panel =
        document.getElementById(
            "measurePanel"
        );

    console.error(
        "OPENING MEASUREMENT POPUP",
        panel
    );

    panel.style.display =
        "block";


    // =====================
    // 🔥 WRAPPERS
    // =====================

    const rfWrap =
        document.getElementById(
            "measureRF"
        )?.closest("div");

    const electricWrap =
        document.getElementById(
            "measureElectric"
        )?.closest("div");

    const magneticWrap =
        document.getElementById(
            "measureMagnetic"
        )?.closest("div");

    // =====================
    // 🔥 RESET VISIBILITY
    // =====================

    rfWrap.style.display =
        "none";

    electricWrap.style.display =
        "none";

    magneticWrap.style.display =
        "none";

    // =====================
    // 🔥 SHOW ACTIVE TYPE
    // =====================

    // RF
    if (
        activeMeasureType === "rf"
    ) {

        rfWrap.style.display =
            "block";
    }

    // ELECTRIC
    else if (
        activeMeasureType ===
        "electric"
    ) {

        electricWrap.style.display =
            "block";
    }

    // MAGNETIC
    else if (
        activeMeasureType ===
        "magnetic"
    ) {

        magneticWrap.style.display =
            "block";
    }

    // ALL
    else {

        rfWrap.style.display =
            "block";

        electricWrap.style.display =
            "block";

        magneticWrap.style.display =
            "block";
    }

    // =====================
    // 🔥 POINT ID
    // =====================

    document.getElementById(
        "measurePointId"
    ).value =
        point.id || "";

    // =====================
    // 🔥 EXISTING VALUES
    // =====================

    const m =
        point.measurements?.[
        sessionId
        ] || {};

    // RF
    document.getElementById(
        "measureRF"
    ).value =

        activeMeasureType === "rf" ||
            activeMeasureType === "all"

            ? (m.rf || "")

            : "";

    // ELECTRIC
    document.getElementById(
        "measureElectric"
    ).value =

        activeMeasureType === "electric" ||
            activeMeasureType === "all"

            ? (m.electric || "")

            : "";

    // MAGNETIC
    document.getElementById(
        "measureMagnetic"
    ).value =

        activeMeasureType === "magnetic" ||
            activeMeasureType === "all"

            ? (m.magnetic || "")

            : "";
}


// =====================
function findNextIncompletePoint(
    current
) {

    const floor =
        getCurrentFloor();

    if (!floor) {
        return null;
    }

    const allPoints =
        [];

    // room grid
    (floor.rooms || []).forEach(room => {

        (room.grid || []).forEach(p => {

            if (
                !p.disabledByZone
            ) {

                allPoints.push(p);
            }
        });
    });

    // zone grid
    (floor.zones || []).forEach(zone => {

        (zone.grid || []).forEach(p => {

            allPoints.push(p);
        });
    });

    let best =
        null;

    let bestDist =
        Infinity;

    allPoints.forEach(p => {

        const m =
            p.measurements?.[
            sessionId
            ] || {};

        let complete =
            false;

        // RF
        if (
            activeMeasureType ===
            "rf"
        ) {

            complete =
                m.rf > 0;
        }

        // ELECTRIC
        else if (
            activeMeasureType ===
            "electric"
        ) {

            complete =
                m.electric > 0;
        }

        // MAGNETIC
        else if (
            activeMeasureType ===
            "magnetic"
        ) {

            complete =
                m.magnetic > 0;
        }

        // ALL
        else {

            complete =
                m.rf > 0 &&
                m.electric > 0 &&
                m.magnetic > 0;
        }

        if (complete) {
            return;
        }

        const d =
            Math.hypot(
                p.x - current.x,
                p.y - current.y
            );

        if (d < bestDist) {

            bestDist =
                d;

            best =
                p;
        }
    });

    return best;
}


function getAllGridPoints() {

    const floor =
        getCurrentFloor();

    if (!floor) return [];

    let points = [];

    // 🔥 room grid
    (floor.rooms || []).forEach(room => {

        points.push(
            ...(room.grid || [])
        );
    });

    // 🔥 zone detail grid
    (floor.zones || []).forEach(zone => {

        points.push(
            ...(zone.grid || [])
        );
    });

    return points;
}

function getNearestGridPoint(
    x,
    y
) {

    console.error(
        "🔥 GET NEAREST GRID POINT"
    );

    const floor =
        getCurrentFloor();

    if (!floor) {
        return null;
    }

    const currentSession =
        window.sessionId ||
        sessionId ||
        "session_1";

    const SNAP_LIMIT = 18;

    // ==================================================
    // 🔥 MEASUREMENT STATE
    // ==================================================

    function isMeasured(
        point
    ) {

        if (!point) {
            return false;
        }

        // --------------------------------------------------
        // CURRENT SESSION MEASUREMENT
        // --------------------------------------------------

        const sessionMeasurement =
            point.measurements?.[
            currentSession
            ];

        if (
            sessionMeasurement
        ) {

            if (
                sessionMeasurement.partial ||
                sessionMeasurement.completed ||
                sessionMeasurement.measured
            ) {

                return true;
            }

            if (
                Number(
                    sessionMeasurement.rf
                ) > 0 ||

                Number(
                    sessionMeasurement.electric
                ) > 0 ||

                Number(
                    sessionMeasurement.magnetic
                ) > 0
            ) {

                return true;
            }
        }

        // --------------------------------------------------
        // LEGACY / DIRECT POINT STATE
        // --------------------------------------------------

        if (
            point.measured ||
            point.completed ||
            point.partial
        ) {

            return true;
        }

        return (
            Number(point.rf || 0) > 0 ||
            Number(point.electric || 0) > 0 ||
            Number(point.magnetic || 0) > 0
        );
    }

    // ==================================================
    // 🔥 FIND NEAREST ZONE POINT
    // ==================================================

    let nearestZonePoint =
        null;

    let nearestZoneDistance =
        SNAP_LIMIT;

    for (
        const zone of
        (floor.zones || [])
    ) {

        for (
            const point of
            (zone.grid || [])
        ) {

            const d =
                Math.hypot(
                    x - point.x,
                    y - point.y
                );

            if (
                d <= nearestZoneDistance
            ) {

                nearestZoneDistance =
                    d;

                nearestZonePoint =
                    point;
            }
        }
    }

    // ==================================================
    // 🔥 FIND NEAREST ROOM POINT
    // ==================================================

    let nearestRoomPoint =
        null;

    let nearestRoomDistance =
        SNAP_LIMIT;

    for (
        const room of
        (floor.rooms || [])
    ) {

        for (
            const point of
            (room.grid || [])
        ) {

            /*
             * A Room point covered by a Zone is normally
             * disabled for new Room measurements.
             *
             * BUT:
             *
             * if it was already measured before the Zone
             * was created, its measurement remains valid
             * until the Zone point is actually measured.
             */

            if (
                point.disabledByZone &&
                !isMeasured(point)
            ) {

                console.error(
                    "SKIP UNMEASURED ROOM POINT UNDER ZONE:",
                    point.id
                );

                continue;
            }

            const d =
                Math.hypot(
                    x - point.x,
                    y - point.y
                );

            if (
                d <= nearestRoomDistance
            ) {

                nearestRoomDistance =
                    d;

                nearestRoomPoint =
                    point;
            }
        }
    }

    // ==================================================
    // 🔥 NO POINT
    // ==================================================

    if (
        !nearestZonePoint &&
        !nearestRoomPoint
    ) {

        console.error(
            "❌ NO GRID POINT FOUND"
        );

        return null;
    }

    // ==================================================
    // 🔥 ZONE / ROOM PRIORITY
    // ==================================================

    const zoneMeasured =
        isMeasured(
            nearestZonePoint
        );

    const roomMeasured =
        isMeasured(
            nearestRoomPoint
        );

    // ==================================================
    // CASE 1
    // ZONE POINT IS ALREADY MEASURED
    //
    // → ZONE WINS
    // ==================================================

    if (
        nearestZonePoint &&
        zoneMeasured
    ) {

        console.error(
            "🔥 POINT SELECTION → ZONE MEASUREMENT",
            {
                zonePoint:
                    nearestZonePoint.id,

                roomPoint:
                    nearestRoomPoint?.id ||
                    null,

                zoneMeasured,
                roomMeasured
            }
        );

        return nearestZonePoint;
    }

    // ==================================================
    // CASE 2
    // ZONE EXISTS BUT IS NOT MEASURED
    // ROOM WAS ALREADY MEASURED
    //
    // → KEEP ROOM MEASUREMENT
    // ==================================================

    if (
        nearestRoomPoint &&
        roomMeasured
    ) {

        console.error(
            "🔥 POINT SELECTION → EXISTING ROOM MEASUREMENT",
            {
                roomPoint:
                    nearestRoomPoint.id,

                zonePoint:
                    nearestZonePoint?.id ||
                    null,

                zoneMeasured,
                roomMeasured
            }
        );

        return nearestRoomPoint;
    }

    // ==================================================
    // CASE 3
    // ZONE EXISTS BUT NOTHING IS MEASURED
    //
    // → SELECT ZONE FOR NEW MEASUREMENT
    // ==================================================

    if (
        nearestZonePoint
    ) {

        console.error(
            "🔥 POINT SELECTION → NEW ZONE MEASUREMENT",
            {
                zonePoint:
                    nearestZonePoint.id,

                roomPoint:
                    nearestRoomPoint?.id ||
                    null,

                zoneMeasured,
                roomMeasured
            }
        );

        return nearestZonePoint;
    }

    // ==================================================
    // CASE 4
    // NORMAL ROOM POINT
    // ==================================================

    console.error(
        "🔥 POINT SELECTION → ROOM MEASUREMENT",
        {
            roomPoint:
                nearestRoomPoint?.id ||
                null
        }
    );

    return nearestRoomPoint;
}

// =====================================================
// 🔥 MEASUREMENT INTERACTION STATE
//
// mode = workflow mode
// measurementInteraction = what the measurement
// tool is currently doing.
//
// inactive
// awaitingPoint
// pointSelected
// =====================================================

function setMeasurementInteractionState(
    state,
    target = null
) {

    if (
        !AppState ||
        !AppState.ui
    ) {
        return;
    }


    const allowedStates = [

        "inactive",
        "awaitingPoint",
        "pointSelected"

    ];


    if (
        !allowedStates.includes(
            state
        )
    ) {

        state =
            "inactive";
    }


    AppState.ui.measurementInteraction =
        state;


    if (
        target !== null
    ) {

        AppState.ui.measurementTarget =
            target;
    }


    // ==================================================
    // CURSOR
    // ==================================================

    const canvasEl =
        document.getElementById(
            "canvas"
        );


    if (canvasEl) {

        if (
            state ===
            "awaitingPoint"
        ) {

            canvasEl.style.cursor =
                "crosshair";

        }

        else if (
            state ===
            "pointSelected"
        ) {

            canvasEl.style.cursor =
                "crosshair";

        }

        else {

            canvasEl.style.cursor =
                "default";
        }
    }


    console.log(
        "🔥 MEASUREMENT INTERACTION",
        {
            state,
            target:
                AppState.ui.measurementTarget,
            mode:
                AppState.ui.mode
        }
    );


    updateMeasurementUIVisibility?.();

    requestRender?.();
}


// =====================================================
// START MEASUREMENT WORKFLOW
// =====================================================

function startMeasurementMode(
    target
) {

    const normalizedTarget =
        target === "zone"
            ? "zone"
            : "room";


    AppState.ui.mode =
        normalizedTarget === "zone"
            ? "zoneMeasure"
            : "measure";


    AppState.ui.measurementTarget =
        normalizedTarget;


    AppState.ui.measurementInteraction =
        "awaitingPoint";


    window.selectedGridPoint =
        null;


    window.justClosedMeasurementPopup =
        false;


    updateStatus?.(
        normalizedTarget === "zone"
            ? "🎯 Select a Zone measurement point"
            : "📊 Select a Room measurement point"
    );


    setMeasurementInteractionState(
        "awaitingPoint",
        normalizedTarget
    );


    updateMeasurementUIVisibility?.();

    updateWorkflowUI?.();

    requestRender?.();
}


// =====================================================
// STOP / FINISH MEASUREMENT
// =====================================================
function stopMeasurementMode() {

    console.log(
        "🛑 STOP MEASUREMENT"
    );


    AppState.ui.mode =
        "idle";


    AppState.ui.measurementInteraction =
        "inactive";


    AppState.ui.measurementTarget =
        null;


    AppState.ui.selectedRoom =
        null;


    AppState.ui.selectedZone =
        null;


    window.selectedGridPoint =
        null;


    window.justClosedMeasurementPopup =
        false;


    // ==================================================
    // CURSOR
    // ==================================================

    const canvasEl =
        document.getElementById(
            "canvas"
        );


    if (canvasEl) {

        canvasEl.style.cursor =
            "default";
    }


    // ==================================================
    // 🔥 UPDATE WORKFLOW UI
    // ==================================================

    updateMeasurementWorkflowUIVisibility?.();


    updateStatus?.(
        "↩ Measurement finished"
    );


    requestRender?.();


    console.log(
        "✅ MEASUREMENT STOPPED",
        {
            mode:
                AppState.ui.mode,

            interaction:
                AppState.ui.measurementInteraction,

            target:
                AppState.ui.measurementTarget
        }
    );
}

function setMeasureType(t) {

    // =====================================================
    // NORMALIZE MEASUREMENT TYPE
    // =====================================================

    const allowedTypes = [
        "all",
        "rf",
        "electric",
        "magnetic"
    ];


    if (
        !allowedTypes.includes(t)
    ) {

        t =
            "all";
    }


    // =====================================================
    // UPDATE MEASUREMENT STATE
    // =====================================================

    measureType =
        t;

    activeMeasureType =
        t;


    console.log(
        "🔥 MEASUREMENT TYPE CHANGED",
        {
            measureType,
            activeMeasureType
        }
    );


    // =====================================================
    // UPDATE EXISTING MEASUREMENT ENGINE
    // =====================================================

    updateLegend();

    updateThresholds();


    // =====================================================
    // MEASUREMENT TYPE BUTTONS
    // =====================================================

    const buttons = {

        all:
            document.getElementById(
                "measurementTypeAll"
            ),

        rf:
            document.getElementById(
                "measurementTypeRF"
            ),

        electric:
            document.getElementById(
                "measurementTypeElectric"
            ),

        magnetic:
            document.getElementById(
                "measurementTypeMagnetic"
            )
    };


    // =====================================================
    // RESET BUTTON STATES
    // =====================================================

    Object.values(
        buttons
    ).forEach(
        button => {

            if (!button) {
                return;
            }


            button.classList.remove(
                "active"
            );


            button.setAttribute(
                "aria-pressed",
                "false"
            );
        }
    );


    // =====================================================
    // ACTIVATE CURRENT BUTTON
    // =====================================================

    const activeButton =
        buttons[t];


    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );


        activeButton.setAttribute(
            "aria-pressed",
            "true"
        );
    }


    // =====================================================
    // UPDATE MEASUREMENT UI STATE
    // =====================================================

    updateMeasurementUIVisibility();


    // =====================================================
    // 🔥 ALWAYS REFRESH MEASUREMENT INFO
    //
    // Measurement type changed explicitly.
    // Do not depend on AppState.ui.mode here.
    // =====================================================

    updateMeasurementInfo?.();


    // =====================================================
    // REFRESH VIEW
    // =====================================================

    requestRender?.();
}


function updateMeasurementUIVisibility() {

    const info =
        document.getElementById(
            "measurementInfo"
        );

    const buttons = [
        document.getElementById(
            "measurementTypeAll"
        ),
        document.getElementById(
            "measurementTypeRF"
        ),
        document.getElementById(
            "measurementTypeElectric"
        ),
        document.getElementById(
            "measurementTypeMagnetic"
        )
    ];


    // ==================================================
    // CURRENT WORKFLOW MODE
    // ==================================================

    const mode =
        AppState?.ui?.mode || "";


    const isMeasuring =
        mode === "measure" ||
        mode === "roomMeasure" ||
        mode === "zoneMeasure";


    console.log(
        "MEASUREMENT UI VISIBILITY",
        {
            mode,
            isMeasuring
        }
    );


    // ==================================================
    // MEASUREMENT INFO
    //
    // The info panel belongs to the active
    // measurement workflow.
    //
    // It is hidden while simply reviewing
    // existing measurements.
    // ==================================================

    if (info) {

        info.style.display =
            isMeasuring
                ? "block"
                : "none";
    }


    // ==================================================
    // MEASUREMENT TYPE BUTTONS
    //
    // ALL / RF / E / M are VIEW / FILTER controls.
    //
    // They must remain enabled even when mode === idle,
    // because existing measurements can be reviewed
    // without starting a new measurement workflow.
    //
    // IMPORTANT:
    // Do NOT modify measureType or activeMeasureType here.
    // setMeasureType() is the single function responsible
    // for changing the selected modality.
    // ==================================================

    buttons.forEach(
        button => {

            if (!button) {
                return;
            }


            button.disabled =
                false;


            button.classList.remove(
                "disabled"
            );
        }
    );


    // ==================================================
    // INFO CONTENT
    //
    // Only refresh workflow information while actively
    // measuring.
    // ==================================================

    if (
        isMeasuring
    ) {

        updateMeasurementInfo();
    }
}

function updateMeasurementInfo() {

    const measureInfo =
        document.getElementById(
            "measureInfo"
        );


    if (!measureInfo) {
        return;
    }


    // ==================================================
    // ELEMENTS
    // ==================================================

    const titleEl =
        document.getElementById(
            "measurementInfoTitle"
        );

    const descriptionEl =
        document.getElementById(
            "measurementInfoDescription"
        );

    const coverageEl =
        document.getElementById(
            "measurementInfoCoverage"
        );


    if (
        !titleEl ||
        !descriptionEl ||
        !coverageEl
    ) {
        return;
    }


    // ==================================================
    // CURRENT WORKFLOW MODE
    // ==================================================

    const mode =
        AppState?.ui?.mode || "";


    const isMeasurementWorkflow =
        mode === "measure" ||
        mode === "roomMeasure" ||
        mode === "zoneMeasure";


    // ==================================================
    // ACTIVE MEASUREMENT TYPE
    //
    // This is a VIEW / FILTER state.
    // ==================================================

    const type =
        (
            typeof activeMeasureType !==
            "undefined" &&
            activeMeasureType
        )
            ? activeMeasureType
            : (
                typeof measureType !==
                "undefined" &&
                measureType
            )
                ? measureType
                : "all";


    // ==================================================
    // NORMALIZE TYPE
    // ==================================================

    const normalizedType =
        [
            "all",
            "rf",
            "electric",
            "magnetic"
        ].includes(type)
            ? type
            : "all";



    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    // ==================================================
    // LABEL
    // ==================================================

    const label =
        normalizedType === "rf"
            ? "RF"
            : normalizedType === "electric"
                ? "Electric"
                : normalizedType === "magnetic"
                    ? "Magnetic"
                    : "ALL";


    // ==================================================
    // NO FLOOR
    // ==================================================

    if (!floor) {

        titleEl.innerText =
            "Measuring: " +
            label;


        descriptionEl.innerText =
            "No floor selected.";


        coverageEl.innerText =
            (
                normalizedType === "all"
                    ? "Measurement completion: "
                    : label + " coverage: "
            ) +
            "0 / 0 points";


        return;
    }


    // ==================================================
    // ALL
    //
    // IMPORTANT:
    //
    // ALL must use the SAME authoritative
    // Room Measurement Statistics used by
    // Room / Floor coverage.
    //
    // Do NOT rebuild the point list here.
    //
    // getRoomMeasurementStats() already handles:
    //
    // Room points outside Zones
    // +
    // Zone-owned points
    //
    // and prevents double counting.
    // ==================================================

    if (
        normalizedType === "all"
    ) {

        let total =
            0;

        let completed =
            0;


        const rooms =
            Array.isArray(
                floor.rooms
            )
                ? floor.rooms
                : [];


        rooms.forEach(
            room => {

                const stats =
                    getRoomMeasurementStats?.(
                        room
                    );


                if (!stats) {
                    return;
                }


                total +=
                    Number(
                        stats.total
                    ) || 0;


                // ------------------------------------------
                // ALL = COMPLETION
                //
                // Only confirmed points count as completed.
                //
                // This intentionally uses:
                //
                // stats.completed
                //
                // NOT stats.measured.
                //
                // measured = confirmed + partial
                // completed = confirmed only
                // ------------------------------------------

                completed +=
                    Number(
                        stats.completed
                    ) || 0;
            }
        );


        titleEl.innerText =
            "Measuring: ALL";


        descriptionEl.innerText =
            "ALL shows overall measurement completion according to each point's saved Profile.";


        coverageEl.innerText =
            "Measurement completion: " +
            completed +
            " / " +
            total +
            " points";


        // ----------------------------------------------
        // DEBUG
        // ----------------------------------------------

        console.log(
            "MEASUREMENT INFO UPDATED",
            {
                mode,
                isMeasurementWorkflow,
                type: normalizedType,
                total,
                completed,
                floorCoverage:
                    getFloorCoverage?.(
                        floor
                    )
            }
        );


        return;
    }


    // ==================================================
    // COLLECT AUTHORITATIVE POINTS
    //
    // For RF / Electric / Magnetic views we still need
    // the individual modality value.
    //
    // Room points belonging to Zones are excluded.
    // Zone points are then added separately.
    // ==================================================

    const points = [];


    // ==================================================
    // ROOM GRID
    // ==================================================

    (
        floor.rooms ||
        []
    ).forEach(
        room => {

            (
                room?.grid ||
                []
            ).forEach(
                point => {

                    if (!point) {
                        return;
                    }


                    // ----------------------------------
                    // Zone-owned Room points are counted
                    // through the Zone grid.
                    // ----------------------------------

                    if (
                        point.zoneId
                    ) {
                        return;
                    }


                    points.push(
                        point
                    );
                }
            );
        }
    );


    // ==================================================
    // ZONE GRID
    // ==================================================

    (
        floor.zones ||
        []
    ).forEach(
        zone => {

            (
                zone?.grid ||
                []
            ).forEach(
                point => {

                    if (!point) {
                        return;
                    }


                    points.push(
                        point
                    );
                }
            );
        }
    );


    // ==================================================
    // CURRENT SESSION
    // ==================================================

    const currentSession =
        (
            typeof sessionId !==
            "undefined" &&
            sessionId
        )
            ? sessionId
            : "default";


    // ==================================================
    // GET MEASUREMENT
    // ==================================================

    function getMeasurement(
        point
    ) {

        if (!point) {
            return null;
        }


        return (
            point.measurements?.[
            currentSession
            ] ||
            null
        );
    }


    // ==================================================
    // VALUE CHECK
    // ==================================================

    function hasValue(
        point,
        key
    ) {

        const measurement =
            getMeasurement(
                point
            );


        if (!measurement) {
            return false;
        }


        const value =
            measurement[key];


        return (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            Number(value) > 0
        );
    }


    // ==================================================
    // MODALITY COVERAGE
    // ==================================================

    let coverage =
        0;


    let description =
        "";


    if (
        normalizedType === "rf"
    ) {

        coverage =
            points.filter(
                point =>
                    hasValue(
                        point,
                        "rf"
                    )
            ).length;


        description =
            "RF view shows RF measurement coverage only.";
    }


    else if (
        normalizedType === "electric"
    ) {

        coverage =
            points.filter(
                point =>
                    hasValue(
                        point,
                        "electric"
                    )
            ).length;


        description =
            "Electric view shows Electric measurement coverage only.";
    }


    else if (
        normalizedType === "magnetic"
    ) {

        coverage =
            points.filter(
                point =>
                    hasValue(
                        point,
                        "magnetic"
                    )
            ).length;


        description =
            "Magnetic view shows Magnetic measurement coverage only.";
    }


    // ==================================================
    // UPDATE UI
    // ==================================================

    const total =
        points.length;


    titleEl.innerText =
        "Measuring: " +
        label;


    descriptionEl.innerText =
        description;


    coverageEl.innerText =
        label +
        " coverage: " +
        coverage +
        " / " +
        total +
        " points";


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "MEASUREMENT INFO UPDATED",
        {
            mode,
            isMeasurementWorkflow,
            type: normalizedType,
            total,
            coverage
        }
    );
}

function calculatePointRisk(point) {

    const rf =
        point.rf || 0;

    const electric =
        point.electric || 0;

    const magnetic =
        point.magnetic || 0;

    // =====================
    // 🔥 SIMPLE RISK
    // =====================

    if (
        rf > 1000 ||
        electric > 10 ||
        magnetic > 200
    ) {

        return "HIGH";
    }

    if (
        rf > 100 ||
        electric > 3 ||
        magnetic > 50
    ) {

        return "MODERATE";
    }

    return "SAFE";
}

window.calculatePointRisk =
    calculatePointRisk;

window.generateGrid =
    generateGrid;

// =====================
// EXPORTS
// =====================

window.drawGridPointsLayer =
    drawGridPointsLayer;

window.drawMeasurementsLayer =
    drawMeasurementsLayer;

window.drawGridTooltip =
    drawGridTooltip;

window.handleMeasureClick =
    handleMeasureClick;


// =====================
// 🔥 MEASUREMENT POPUP
// =====================

function openMeasurementPopup(
    point
) {

    const popup =
        document.getElementById(
            "measurementPopup"
        );


    if (
        !popup ||
        !point
    ) {

        return;
    }

    popup.style.pointerEvents =
        "auto";


    // ==================================================
    // 🔥 MEASUREMENT POPUP DRAG
    // ==================================================

    if (
        !popup.dataset.dragReady
    ) {

        const header =
            popup.querySelector(
                ".measurement-popup-header"
            );

        if (header) {

            let dragging =
                false;

            let startX =
                0;

            let startY =
                0;

            let startLeft =
                0;

            let startTop =
                0;


            header.addEventListener(
                "mousedown",
                function (event) {

                    if (
                        event.button !== 0
                    ) {
                        return;
                    }


                    const rect =
                        popup.getBoundingClientRect();


                    dragging =
                        true;

                    startX =
                        event.clientX;

                    startY =
                        event.clientY;

                    startLeft =
                        rect.left;

                    startTop =
                        rect.top;


                    popup.style.transform =
                        "none";


                    header.style.cursor =
                        "grabbing";


                    event.preventDefault();

                    event.stopPropagation();
                }
            );


            document.addEventListener(
                "mousemove",
                function (event) {

                    if (!dragging) {
                        return;
                    }


                    const dx =
                        event.clientX -
                        startX;

                    const dy =
                        event.clientY -
                        startY;


                    let left =
                        startLeft +
                        dx;

                    let top =
                        startTop +
                        dy;


                    const rect =
                        popup.getBoundingClientRect();

                    const padding =
                        12;


                    left =
                        Math.max(
                            padding,
                            Math.min(
                                left,
                                window.innerWidth -
                                rect.width -
                                padding
                            )
                        );


                    top =
                        Math.max(
                            padding,
                            Math.min(
                                top,
                                window.innerHeight -
                                rect.height -
                                padding
                            )
                        );


                    popup.style.left =
                        left +
                        "px";

                    popup.style.top =
                        top +
                        "px";
                }
            );


            document.addEventListener(
                "mouseup",
                function () {

                    if (!dragging) {
                        return;
                    }


                    dragging =
                        false;

                    header.style.cursor =
                        "grab";
                }
            );


            header.style.cursor =
                "grab";

            popup.dataset.dragReady =
                "true";
        }
    }




    // ==================================================
    // STORE POINT
    // ==================================================

    window.selectedGridPoint =
        point;


    // ==================================================
    // MEASUREMENT PROFILE
    // ==================================================

    const profile =
        AppState.project
            ?.measurementProfile ||
        {
            rf: true,
            electric: false,
            magnetic: false
        };


    console.log(
        "🔥 POPUP PROFILE",
        profile
    );


    // ==================================================
    // ACTIVE SESSION
    // ==================================================

    const activeSessionId =
        sessionId ||
        "default";


    const sessionMeasurement =
        point.measurements?.[
        activeSessionId
        ] || null;


    // ==================================================
    // FIND ROOM
    // ==================================================

    const floor =
        getCurrentFloor?.();


    const room =
        (floor?.rooms || [])
            .find(
                r =>
                    (
                        point.roomId &&
                        r.id === point.roomId
                    ) ||
                    (
                        point.roomCode &&
                        r.code === point.roomCode
                    )
            );


    // ==================================================
    // ROOM CODE
    // ==================================================

    const roomCode =
        point.roomCode ||
        room?.code ||
        "R1";


    // ==================================================
    // ROOM NAME
    // ==================================================

    const roomName =
        point.roomName ||
        room?.name ||
        "Room";


    // ==================================================
    // POINT TITLE
    // ==================================================

    const title =
        document.getElementById(
            "popupPointTitle"
        );


    if (title) {

        title.innerText =
            point.code ||
            point.id ||
            "Measurement point";
    }


    // ==================================================
    // META
    // ==================================================

    const meta =
        document.getElementById(
            "popupPointMeta"
        );


    if (meta) {

        meta.innerText =
            "Measurement point";
    }


    // ==================================================
    // ROOM NAME
    // ==================================================

    const roomNameEl =
        document.getElementById(
            "popupRoomName"
        );


    if (roomNameEl) {

        roomNameEl.innerText =
            roomName;
    }


    // ==================================================
    // GRID SIZE
    // ==================================================

    const gridSizeEl =
        document.getElementById(
            "popupGridSize"
        );


    if (gridSizeEl) {

        gridSizeEl.innerText =
            (
                point.gridSize ||
                room?.gridSize ||
                1
            ) +
            " m";
    }


    // ==================================================
    // MODE BADGE
    // ==================================================

    const modeBadge =
        document.getElementById(
            "popupModeBadge"
        );


    if (modeBadge) {

        const activeModes = [];


        if (
            profile.rf === true
        ) {

            activeModes.push(
                "RF"
            );
        }


        if (
            profile.electric === true
        ) {

            activeModes.push(
                "E"
            );
        }


        if (
            profile.magnetic === true
        ) {

            activeModes.push(
                "M"
            );
        }


        modeBadge.innerText =
            activeModes.length
                ? activeModes.join(" + ")
                : "ALL";
    }


    // ==================================================
    // STATUS ELEMENT
    // ==================================================

    const statusEl =
        document.getElementById(
            "popupMeasurementStatus"
        );


    // ==================================================
    // WRAPPERS
    // ==================================================

    const rfWrap =
        document.getElementById(
            "popupRFWrap"
        );


    const electricWrap =
        document.getElementById(
            "popupElectricWrap"
        );


    const magneticWrap =
        document.getElementById(
            "popupMagneticWrap"
        );


    // ==================================================
    // INPUTS
    // ==================================================

    const rf =
        document.getElementById(
            "popupRF"
        );


    const electric =
        document.getElementById(
            "popupElectric"
        );


    const magnetic =
        document.getElementById(
            "popupMagnetic"
        );


    // ==================================================
    // GET EXISTING VALUE
    //
    // Priority:
    // 1. direct point value
    // 2. active session measurement
    //
    // NEVER use "0" as fallback.
    // ==================================================

    function getExistingValue(
        directValue,
        sessionValue
    ) {

        if (
            directValue !== undefined &&
            directValue !== null
        ) {

            return directValue;
        }


        if (
            sessionValue !== undefined &&
            sessionValue !== null
        ) {

            return sessionValue;
        }


        return "";
    }


    const existingRF =
        getExistingValue(
            point.rf,
            sessionMeasurement?.rf
        );


    const existingElectric =
        getExistingValue(
            point.electric,
            sessionMeasurement?.electric
        );


    const existingMagnetic =
        getExistingValue(
            point.magnetic,
            sessionMeasurement?.magnetic
        );


    console.error(
        "🔥 EXISTING POINT VALUES",
        {
            rf:
                existingRF,

            electric:
                existingElectric,

            magnetic:
                existingMagnetic,

            sessionMeasurement
        }
    );


    // ==================================================
    // CONFIGURE FIELD
    // ==================================================

    function configureField(
        wrap,
        input,
        enabled,
        existingValue,
        labelColor
    ) {

        if (!wrap) {

            return;
        }


        // ----------------------------------------------
        // ALWAYS SHOW FIELD
        // ----------------------------------------------

        wrap.style.display =
            "flex";


        // ----------------------------------------------
        // LABELS
        // ----------------------------------------------

        const textNodes =
            wrap.querySelectorAll(
                ".measurement-row-label span, .measurement-label, .field-label"
            );


        if (enabled) {

            wrap.style.opacity =
                "1";


            textNodes.forEach(
                el => {

                    el.style.opacity =
                        "1";

                    el.style.color =
                        labelColor ||
                        "#1e293b";

                    el.style.fontWeight =
                        "600";
                }
            );

        }

        else {

            wrap.style.opacity =
                existingValue !== ""
                    ? "0.72"
                    : "0.52";


            textNodes.forEach(
                el => {

                    el.style.opacity =
                        existingValue !== ""
                            ? "0.72"
                            : "0.52";

                    el.style.color =
                        "#94a3b8";

                    el.style.fontWeight =
                        "500";
                }
            );
        }


        // ----------------------------------------------
        // INPUT
        // ----------------------------------------------

        if (!input) {

            return;
        }


        input.value =
            existingValue !== ""
                ? existingValue
                : "";


        input.disabled =
            !enabled;


        input.readOnly =
            !enabled;


        input.tabIndex =
            enabled
                ? 0
                : -1;


        if (!enabled) {

            input.placeholder =
                existingValue !== ""
                    ? ""
                    : "—";


            input.style.background =
                "#f8fafc";


            input.style.color =
                existingValue !== ""
                    ? "#64748b"
                    : "#94a3b8";


            input.style.cursor =
                "not-allowed";


            input.style.borderColor =
                "#e2e8f0";

        }

        else {

            input.placeholder =
                "";


            input.style.background =
                "#ffffff";


            input.style.color =
                "#0f172a";


            input.style.cursor =
                "text";


            input.style.borderColor =
                "#dbe4f0";
        }
    }


    // ==================================================
    // APPLY PROFILE
    // ==================================================

    configureField(
        rfWrap,
        rf,
        profile.rf === true,
        existingRF,
        "#1e293b"
    );


    configureField(
        electricWrap,
        electric,
        profile.electric === true,
        existingElectric,
        "#1e293b"
    );


    configureField(
        magneticWrap,
        magnetic,
        profile.magnetic === true,
        existingMagnetic,
        "#1e293b"
    );


    // ==================================================
    // DETERMINE CURRENT STATUS
    // ==================================================

    const rfRequired =
        profile.rf === true;


    const electricRequired =
        profile.electric === true;


    const magneticRequired =
        profile.magnetic === true;


    const requiredValues = [];


    if (rfRequired) {

        requiredValues.push(
            existingRF
        );
    }


    if (electricRequired) {

        requiredValues.push(
            existingElectric
        );
    }


    if (magneticRequired) {

        requiredValues.push(
            existingMagnetic
        );
    }


    const hasAnyMeasurement =
        (
            existingRF !== ""
        ) ||
        (
            existingElectric !== ""
        ) ||
        (
            existingMagnetic !== ""
        );


    const allRequiredMeasured =
        requiredValues.length > 0 &&
        requiredValues.every(
            value =>
                value !== "" &&
                value !== null &&
                value !== undefined
        );


    // ==================================================
    // STATUS
    // ==================================================

    if (
        point.measurementStatus?.state ===
        "confirmed"
    ) {

        if (statusEl) {

            statusEl.innerText =
                "✓ CONFIRMED";

            statusEl.className =
                "popup-measurement-status status-confirmed";
        }

    }

    else if (
        allRequiredMeasured
    ) {

        if (statusEl) {

            statusEl.innerText =
                "READY TO SAVE";

            statusEl.className =
                "popup-measurement-status status-complete";
        }

    }

    else if (
        hasAnyMeasurement
    ) {

        if (statusEl) {

            statusEl.innerText =
                "PARTIAL";

            statusEl.className =
                "popup-measurement-status status-partial";
        }

    }

    else {

        if (statusEl) {

            statusEl.innerText =
                "NOT MEASURED";

            statusEl.className =
                "popup-measurement-status";
        }
    }


    // ==================================================
    // SAVE BUTTON
    // ==================================================

    const saveButton =
        document.getElementById(
            "measurementSaveButton"
        );


    if (saveButton) {

        if (
            allRequiredMeasured
        ) {

            saveButton.innerText =
                "Save ✓";

        }

        else {

            saveButton.innerText =
                "Save Draft";
        }


        saveButton.disabled =
            false;
    }


    // ==================================================
    // EXISTING DATA NOTICE
    // ==================================================

    const notice =
        document.getElementById(
            "measurementProfileNotice"
        );


    const hasInactiveExistingData =

        (
            profile.rf !== true &&
            existingRF !== ""
        ) ||

        (
            profile.electric !== true &&
            existingElectric !== ""
        ) ||

        (
            profile.magnetic !== true &&
            existingMagnetic !== ""
        );


    if (notice) {

        notice.style.display =
            hasInactiveExistingData
                ? "flex"
                : "none";
    }


    // ==================================================
    // FIRST ACTIVE INPUT
    // ==================================================

    let firstActiveInput =
        null;


    if (
        profile.rf === true &&
        rf
    ) {

        firstActiveInput =
            rf;

    }

    else if (
        profile.electric === true &&
        electric
    ) {

        firstActiveInput =
            electric;

    }

    else if (
        profile.magnetic === true &&
        magnetic
    ) {

        firstActiveInput =
            magnetic;
    }


    // ==================================================
    // POSITION
    //
    // Measurement popup is NOT a modal overlay.
    // The map and measurement points remain visible.
    //
    // Position is calculated AFTER the popup is visible,
    // so workflow/header geometry is already available.
    // ==================================================

    const screen =
        EMFViewport.worldPoint(
            point
        );


    const canvas =
        document.querySelector(
            "canvas"
        );


    if (!canvas) {

        return;
    }


    const rect =
        canvas.getBoundingClientRect();


    // ==================================================
    // COMPACT POPUP SIZE
    // ==================================================

    popup.style.width =
        "280px";

    popup.style.maxWidth =
        "calc(100vw - 24px)";

    popup.style.boxSizing =
        "border-box";


    // ==================================================
    // SHOW FIRST
    //
    // Important:
    // The workflow bar must already have a real
    // layout before we calculate the final position.
    // ==================================================

    popup.style.display =
        "block";


    // ==================================================
    // POSITION AFTER LAYOUT
    // ==================================================

    requestAnimationFrame(
        () => {

            const viewportPadding =
                12;


            // ==================================================
            // WORKFLOW BOUNDARY
            // ==================================================

            const workflowBar =
                document.getElementById(
                    "businessWorkflowBar"
                );


            const workflowRect =
                workflowBar?.getBoundingClientRect();


            const workflowBottom =
                workflowRect &&
                    workflowRect.bottom > 0
                    ? workflowRect.bottom
                    : 0;


            const minimumTop =
                Math.max(
                    workflowBottom +
                    8,
                    viewportPadding
                );


            // ==================================================
            // AVAILABLE HEIGHT
            // ==================================================

            const availableHeight =
                Math.max(
                    160,
                    window.innerHeight -
                    minimumTop -
                    viewportPadding
                );


            popup.style.maxHeight =
                availableHeight +
                "px";


            // ==================================================
            // INITIAL POSITION
            // ==================================================

            popup.style.left =
                rect.left +
                screen.x +
                30 +
                "px";


            popup.style.top =
                rect.top +
                screen.y -
                20 +
                "px";


            // ==================================================
            // MEASURE ACTUAL POPUP
            // ==================================================

            const popupRect =
                popup.getBoundingClientRect();


            let finalLeft =
                popupRect.left;


            let finalTop =
                popupRect.top;


            // ==================================================
            // RIGHT EDGE
            // ==================================================

            if (
                finalLeft +
                popupRect.width >
                window.innerWidth -
                viewportPadding
            ) {

                finalLeft =
                    window.innerWidth -
                    popupRect.width -
                    viewportPadding;
            }


            // ==================================================
            // LEFT EDGE
            // ==================================================

            if (
                finalLeft <
                viewportPadding
            ) {

                finalLeft =
                    viewportPadding;
            }


            // ==================================================
            // TOP EDGE / WORKFLOW BAR
            // ==================================================

            if (
                finalTop <
                minimumTop
            ) {

                finalTop =
                    minimumTop;
            }


            // ==================================================
            // BOTTOM EDGE
            // ==================================================

            if (
                finalTop +
                popupRect.height >
                window.innerHeight -
                viewportPadding
            ) {

                finalTop =
                    window.innerHeight -
                    popupRect.height -
                    viewportPadding;
            }


            // ==================================================
            // FINAL TOP SAFETY
            //
            // Important when popup is taller than the
            // available space.
            // ==================================================

            if (
                finalTop <
                minimumTop
            ) {

                finalTop =
                    minimumTop;
            }


            popup.style.left =
                finalLeft +
                "px";


            popup.style.top =
                finalTop +
                "px";


            console.log(
                "🔥 MEASUREMENT POPUP POSITION",
                {
                    popupTop:
                        finalTop,

                    popupHeight:
                        popupRect.height,

                    workflowBottom,

                    minimumTop,

                    viewportHeight:
                        window.innerHeight
                }
            );
        }
    );
    // ==================================================
    // KEYBOARD CONTROLS
    // ==================================================
    //
    // Enter = Save
    // Escape = Close
    //
    // This is intentionally attached to the popup
    // itself so it works regardless of which input
    // currently has focus.
    // ==================================================

    popup.onkeydown =
        function (event) {

            // ------------------------------------------
            // ESCAPE
            // ------------------------------------------

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();
                event.stopPropagation();


                const closeButton =
                    popup.querySelector(
                        ".measurement-popup-close"
                    );


                if (closeButton) {

                    closeButton.click();

                    return;
                }


                // Fallback:
                // hide popup directly if no close
                // button is available.

                popup.style.display =
                    "none";


                return;
            }


            // ------------------------------------------
            // ENTER
            // ------------------------------------------

            if (
                event.key ===
                "Enter"
            ) {

                // Do not allow Enter to insert
                // anything into an input.

                event.preventDefault();
                event.stopPropagation();


                if (
                    saveButton &&
                    !saveButton.disabled
                ) {

                    saveButton.click();

                }
            }
        };


    // ==================================================
    // FOCUS
    // ==================================================

    setTimeout(
        () => {

            firstActiveInput?.focus();

        },
        50
    );

}
// =====================
// 🔥 POSITION MEASUREMENT POPUP
// =====================

function positionMeasurementPopup() {

    const popup =
        document.getElementById(
            "measurementPopup"
        );

    const point =
        window.selectedGridPoint;

    const canvas =
        window.canvas ||
        document.querySelector(
            "canvas"
        );

    if (
        !popup ||
        !point ||
        !canvas
    ) {
        return;
    }


    // ==================================================
    // DO NOT REPOSITION WHILE USER IS DRAGGING
    // ==================================================

    if (
        popup.dataset.dragging ===
        "true"
    ) {
        return;
    }


    const screen =
        EMFViewport.worldPoint(
            point
        );


    const canvasRect =
        canvas.getBoundingClientRect();


    // ==================================================
    // INITIAL POSITION
    // ==================================================

    let left =
        canvasRect.left +
        screen.x +
        30;

    let top =
        canvasRect.top +
        screen.y -
        20;


    // ==================================================
    // POPUP SIZE
    // ==================================================

    const popupRect =
        popup.getBoundingClientRect();

    const popupWidth =
        popupRect.width;

    const popupHeight =
        popupRect.height;


    if (
        popupWidth <= 0 ||
        popupHeight <= 0
    ) {
        return;
    }


    // ==================================================
    // VIEWPORT
    // ==================================================

    const margin =
        12;

    const viewportWidth =
        window.innerWidth;

    const viewportHeight =
        window.innerHeight;


    // ==================================================
    // HORIZONTAL
    // ==================================================

    if (
        left +
        popupWidth +
        margin >
        viewportWidth
    ) {

        left =
            canvasRect.left +
            screen.x -
            popupWidth -
            30;
    }


    left =
        Math.max(
            margin,
            Math.min(
                left,
                viewportWidth -
                popupWidth -
                margin
            )
        );


    // ==================================================
    // VERTICAL
    // ==================================================

    if (
        top +
        popupHeight +
        margin >
        viewportHeight
    ) {

        top =
            canvasRect.top +
            screen.y -
            popupHeight -
            20;
    }


    top =
        Math.max(
            margin,
            Math.min(
                top,
                viewportHeight -
                popupHeight -
                margin
            )
        );


    // ==================================================
    // FINAL POSITION
    // ==================================================

    popup.style.left =
        Math.round(
            left
        ) +
        "px";

    popup.style.top =
        Math.round(
            top
        ) +
        "px";
}

// =====================
// 🔥 DRAG MEASUREMENT POPUP
// =====================

function setupMeasurementPopupDrag() {

    const popup =
        document.getElementById(
            "measurementPopup"
        );

    const header =
        popup?.querySelector(
            ".measurement-popup-header"
        );

    if (
        !popup ||
        !header
    ) {
        return;
    }


    // ==================================================
    // PREVENT DUPLICATE LISTENERS
    // ==================================================

    if (
        header.dataset.dragReady ===
        "true"
    ) {
        return;
    }

    header.dataset.dragReady =
        "true";


    let dragging =
        false;

    let pointerId =
        null;

    let startX =
        0;

    let startY =
        0;

    let startLeft =
        0;

    let startTop =
        0;


    // ==================================================
    // POINTER DOWN
    // ==================================================

    header.addEventListener(
        "pointerdown",
        evt => {

            if (
                evt.button !== 0
            ) {
                return;
            }


            dragging =
                true;

            pointerId =
                evt.pointerId;


            popup.dataset.dragging =
                "true";

            popup.dataset.dragged =
                "true";


            const rect =
                popup.getBoundingClientRect();


            startLeft =
                rect.left;

            startTop =
                rect.top;


            startX =
                evt.clientX;

            startY =
                evt.clientY;


            header.style.cursor =
                "grabbing";


            // Capture this pointer.
            // Canvas can no longer steal the drag.

            try {

                header.setPointerCapture(
                    evt.pointerId
                );

            }
            catch (
            error
            ) {

                console.warn(
                    "Popup pointer capture failed",
                    error
                );
            }


            evt.preventDefault();

            evt.stopPropagation();
        }
    );


    // ==================================================
    // POINTER MOVE
    // ==================================================

    header.addEventListener(
        "pointermove",
        evt => {

            if (
                !dragging ||
                evt.pointerId !==
                pointerId
            ) {
                return;
            }


            const dx =
                evt.clientX -
                startX;

            const dy =
                evt.clientY -
                startY;


            let left =
                startLeft +
                dx;

            let top =
                startTop +
                dy;


            const rect =
                popup.getBoundingClientRect();


            const margin =
                12;


            const maxLeft =
                window.innerWidth -
                rect.width -
                margin;


            const maxTop =
                window.innerHeight -
                rect.height -
                margin;


            left =
                Math.max(
                    margin,
                    Math.min(
                        left,
                        maxLeft
                    )
                );


            top =
                Math.max(
                    margin,
                    Math.min(
                        top,
                        maxTop
                    )
                );


            popup.style.left =
                Math.round(
                    left
                ) +
                "px";


            popup.style.top =
                Math.round(
                    top
                ) +
                "px";


            evt.preventDefault();

            evt.stopPropagation();
        }
    );


    // ==================================================
    // POINTER UP
    // ==================================================

    const finishDrag =
        evt => {

            if (
                !dragging
            ) {
                return;
            }


            if (
                pointerId !== null &&
                evt.pointerId !==
                pointerId
            ) {
                return;
            }


            dragging =
                false;


            popup.dataset.dragging =
                "false";


            header.style.cursor =
                "grab";


            try {

                if (
                    header.hasPointerCapture(
                        pointerId
                    )
                ) {

                    header.releasePointerCapture(
                        pointerId
                    );
                }

            }
            catch (
            error
            ) {
                // Ignore pointer release errors
            }


            pointerId =
                null;


            evt.preventDefault();

            evt.stopPropagation();
        };


    header.addEventListener(
        "pointerup",
        finishDrag
    );


    header.addEventListener(
        "pointercancel",
        finishDrag
    );
}
// =====================
// 🔥 CLOSE POPUP
// =====================

function closeMeasurementPopup() {

    const popup =
        document.getElementById(
            "measurementPopup"
        );

    if (popup) {

        popup.style.display =
            "none";
    }

    window.selectedGridPoint =
        null;

    requestRender?.();
}

window.openMeasurementPopup =
    openMeasurementPopup;

window.closeMeasurementPopup =
    closeMeasurementPopup;

window.positionMeasurementPopup =
    positionMeasurementPopup;

// =====================
// 🔥 ENTER = SAVE
// =====================

[
    "popupRF",
    "popupElectric",
    "popupMagnetic"
].forEach(id => {

    const input =
        document.getElementById(id);

    if (!input) return;

    input.onkeydown = e => {

        if (e.key === "Enter") {

            const popup =
                document.getElementById(
                    "measurementPopup"
                );

            if (
                popup?.style.display ===
                "block"
            ) {

                saveMeasurementFromPopup?.();
            }
        }
    };
});

// =====================
// 🔥 AUTO SELECT
// =====================

[
    "popupRF",
    "popupElectric",
    "popupMagnetic"
].forEach(id => {

    const input =
        document.getElementById(id);

    if (!input) return;

    input.onfocus = () => {

        input.select();
    };
});


// =====================
// 🔥 AUTO SELECT
// =====================

[
    "popupRF",
    "popupElectric",
    "popupMagnetic"
].forEach(id => {

    const input =
        document.getElementById(id);

    if (!input) return;

    input.onfocus = () => {

        input.select();
    };
});

function updateMeasurementCursor() {

    const canvas =
        document.getElementById(
            "canvas"
        );

    if (!canvas) {
        return;
    }


    const mode =
        AppState?.ui?.mode || "";


    const interaction =
        AppState?.ui
            ?.measurementInteraction ||
        "inactive";


    const isMeasuring =
        mode === "measure" ||
        mode === "roomMeasure" ||
        mode === "zoneMeasure";


    if (
        isMeasuring &&
        (
            interaction === "awaitingPoint" ||
            interaction === "pointSelected"
        )
    ) {

        canvas.style.cursor =
            "crosshair";

        return;
    }


    canvas.style.cursor =
        "default";
}

function saveMeasurementFromPopup() {

    console.error(
        "🔥 SAVE MEASUREMENT POPUP START",
        window.selectedGridPoint
    );


    const point =
        window.selectedGridPoint;


    if (!point) {

        console.warn(
            "⚠️ SAVE: no selected grid point"
        );

        return;
    }


    // ==================================================
    // INPUTS
    // ==================================================

    const rfInput =
        document.getElementById(
            "popupRF"
        );

    const electricInput =
        document.getElementById(
            "popupElectric"
        );

    const magneticInput =
        document.getElementById(
            "popupMagnetic"
        );


    // ==================================================
    // ACTIVE PROFILE
    // ==================================================

    const rfRequired =
        !!rfInput &&
        !rfInput.disabled;


    const electricRequired =
        !!electricInput &&
        !electricInput.disabled;


    const magneticRequired =
        !!magneticInput &&
        !magneticInput.disabled;


    console.log(
        "🔥 ACTIVE MEASUREMENT PROFILE",
        {
            rfRequired,
            electricRequired,
            magneticRequired
        }
    );


    if (
        !rfRequired &&
        !electricRequired &&
        !magneticRequired
    ) {

        alert(
            "No measurement type is active."
        );

        return;
    }


    // ==================================================
    // READ VALUE
    //
    // Empty = null
    // 0 = valid measurement
    // ==================================================

    function readMeasurementValue(
        input
    ) {

        if (!input) {
            return null;
        }


        const raw =
            String(
                input.value ?? ""
            ).trim();


        if (
            raw === ""
        ) {

            return null;
        }


        const value =
            Number(
                raw
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            return null;
        }


        return value;
    }


    const rfValue =
        readMeasurementValue(
            rfInput
        );


    const electricValue =
        readMeasurementValue(
            electricInput
        );


    const magneticValue =
        readMeasurementValue(
            magneticInput
        );


    // ==================================================
    // EXISTING POINT VALUES
    //
    // Disabled modalities are preserved.
    // ==================================================

    if (rfRequired) {

        point.rf =
            rfValue;
    }


    if (electricRequired) {

        point.electric =
            electricValue;
    }


    if (magneticRequired) {

        point.magnetic =
            magneticValue;
    }


    // ==================================================
    // REQUIRED MODALITY STATUS
    //
    // IMPORTANT:
    // Completion is based ONLY on the
    // active Measurement Profile.
    //
    // Risk is NOT involved here.
    // ==================================================

    const rfMeasured =
        !rfRequired ||
        (
            point.rf !== null &&
            point.rf !== undefined &&
            point.rf !== ""
        );


    const electricMeasured =
        !electricRequired ||
        (
            point.electric !== null &&
            point.electric !== undefined &&
            point.electric !== ""
        );


    const magneticMeasured =
        !magneticRequired ||
        (
            point.magnetic !== null &&
            point.magnetic !== undefined &&
            point.magnetic !== ""
        );


    const requiredCount =
        Number(rfRequired) +
        Number(electricRequired) +
        Number(magneticRequired);


    const measuredRequiredCount =
        Number(
            rfRequired &&
            rfMeasured
        ) +
        Number(
            electricRequired &&
            electricMeasured
        ) +
        Number(
            magneticRequired &&
            magneticMeasured
        );


    const anyRequiredMeasured =
        measuredRequiredCount > 0;


    const allRequiredMeasured =
        requiredCount > 0 &&
        measuredRequiredCount ===
        requiredCount;


    // ==================================================
    // POINT FLAGS
    //
    // These are PROFILE-AWARE.
    // ==================================================

    point.measuredRF =
        point.rf !== null &&
        point.rf !== undefined &&
        point.rf !== "";


    point.measuredE =
        point.electric !== null &&
        point.electric !== undefined &&
        point.electric !== "";


    point.measuredM =
        point.magnetic !== null &&
        point.magnetic !== undefined &&
        point.magnetic !== "";


    point.measured =
        anyRequiredMeasured;


    point.partial =
        anyRequiredMeasured &&
        !allRequiredMeasured;


    point.completed =
        allRequiredMeasured;


    // ==================================================
    // SESSION MEASUREMENT
    // ==================================================

    point.measurements =
        point.measurements ||
        {};


    const activeSessionId =
        sessionId ||
        "default";


    const existingMeasurement =
        point.measurements[
        activeSessionId
        ] || {};


    const measurementId =
        existingMeasurement.id ||

        window.PhiIdFactory
            ?.createMeasurementId?.() ||

        (
            "measurement_" +
            Date.now()
        );


    // ==================================================
    // SAVE SESSION MEASUREMENT
    // ==================================================

    point.measurements[
        activeSessionId
    ] = {

        ...existingMeasurement,

        id:
            measurementId,

        profile: {

            rf:
                rfRequired,

            electric:
                electricRequired,

            magnetic:
                magneticRequired
        },

        rf:
            point.rf ??
            null,

        electric:
            point.electric ??
            null,

        magnetic:
            point.magnetic ??
            null,

        measuredRF:
            point.measuredRF,

        measuredE:
            point.measuredE,

        measuredM:
            point.measuredM,

        partial:
            point.partial,

        completed:
            point.completed,

        savedAt:
            Date.now()
    };


    // ==================================================
    // MEASUREMENT STATUS
    // ==================================================

    const profile =
    {
        rf:
            rfRequired,

        electric:
            electricRequired,

        magnetic:
            magneticRequired
    };


    if (
        allRequiredMeasured
    ) {

        point.measurementStatus = {

            state:
                "confirmed",

            confirmedAt:
                Date.now(),

            sessionId:
                activeSessionId,

            profile:
                profile
        };

    }

    else if (
        anyRequiredMeasured
    ) {

        point.measurementStatus = {

            state:
                "partial",

            savedAt:
                Date.now(),

            sessionId:
                activeSessionId,

            profile:
                profile
        };

    }

    else {

        point.measurementStatus = {

            state:
                "notMeasured",

            sessionId:
                activeSessionId,

            profile:
                profile
        };
    }


    // ==================================================
    // RISK
    //
    // Kept separate from completion state.
    // ==================================================

    point.risk =
        calculatePointRisk?.(
            point
        ) ||
        "SAFE";


    // ==================================================
    // UPDATE POPUP STATUS
    // ==================================================

    const statusEl =
        document.getElementById(
            "popupMeasurementStatus"
        );


    const saveButton =
        document.getElementById(
            "measurementSaveButton"
        );


    if (
        allRequiredMeasured
    ) {

        if (statusEl) {

            statusEl.innerText =
                "✓ CONFIRMED";

            statusEl.className =
                "popup-measurement-status status-confirmed";
        }


        if (saveButton) {

            saveButton.innerText =
                "Save ✓";
        }

    }

    else if (
        anyRequiredMeasured
    ) {

        if (statusEl) {

            statusEl.innerText =
                "PARTIAL";

            statusEl.className =
                "popup-measurement-status status-partial";
        }


        if (saveButton) {

            saveButton.innerText =
                "Save Draft";
        }

    }

    else {

        if (statusEl) {

            statusEl.innerText =
                "NOT MEASURED";

            statusEl.className =
                "popup-measurement-status";
        }


        if (saveButton) {

            saveButton.innerText =
                "Save Draft";
        }
    }


    // ==================================================
    // SAVE PROJECT
    // ==================================================

    saveProject?.();


    // ==================================================
    // WORKFLOW / UI
    // ==================================================

    window.updateWorkflowUI?.();

    updateProgressUI?.();

    updateRoomStatusUI?.();

    updateUIState?.();

    updateGuideText?.();

    // ==================================================
    // 🔥 MEASUREMENT INFO
    //
    // Refresh immediately after the measurement state
    // has been saved so coverage/completion reflects
    // the newly confirmed point without requiring
    // another MAP-layer interaction.
    // ==================================================

    updateMeasurementInfo?.();


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "🔥 POINT AFTER SAVE",
        {

            id:
                point.id,

            rf:
                point.rf,

            electric:
                point.electric,

            magnetic:
                point.magnetic,

            profile:
                profile,

            anyRequiredMeasured:
                anyRequiredMeasured,

            allRequiredMeasured:
                allRequiredMeasured,

            measured:
                point.measured,

            partial:
                point.partial,

            completed:
                point.completed,

            measurementStatus:
                point.measurementStatus
        }
    );


    console.log(
        "🔥 SAVE RESULT",
        allRequiredMeasured
            ? "✓ CONFIRMED"
            : anyRequiredMeasured
                ? "⚠ PARTIAL"
                : "○ NOT MEASURED"
    );


    // ==================================================
    // CLOSE POPUP AFTER SAVE
    //
    // Save Draft and Save Confirmed both close
    // the measurement popup.
    //
    // Point status remains:
    // WHITE  = NOT MEASURED
    // BLUE   = PARTIAL
    // GREEN  = CONFIRMED
    // ==================================================

    setTimeout(
        () => {

            closeMeasurementPopup?.();

            window.selectedGridPoint =
                null;

            requestRender?.();

        },
        600
    );
}



function updateLegend() {

    let max = 100;
    let mid = 50;
    let unit = "µW/m²";

    if (
        measureType === "electric"
    ) {

        max = 10;
        mid = 5;
        unit = "V/m";
    }

    if (
        measureType === "magnetic"
    ) {

        max = 200;
        mid = 100;
        unit = "nT";
    }

    // =====================================================
    // LEGEND VALUES
    // =====================================================
    //
    // These elements are optional because the current
    // Business toolbar does not necessarily render them.
    //
    // Measurement type switching must NOT fail just because
    // the legacy legend UI is absent.
    // =====================================================

    const midVal =
        document.getElementById(
            "midVal"
        );

    const maxVal =
        document.getElementById(
            "maxVal"
        );

    if (midVal) {

        midVal.innerText =
            mid + " " + unit;
    }

    if (maxVal) {

        maxVal.innerText =
            max + "+ " + unit;
    }
}


// =====================
// 🔥 MEASUREMENT
// =====================

window.saveMeasurementFromPopup =
    saveMeasurementFromPopup;

window.saveMeasurement =
    saveMeasurement;


// =====================
// 🔥 GRID
// =====================

window.findNextIncompletePoint =
    findNextIncompletePoint;

window.getAllGridPoints =
    getAllGridPoints;

window.getNearestGridPoint =
    getNearestGridPoint;


// =====================
// 🔥 UI
// =====================

window.openMeasurePanel =
    openMeasurePanel;

window.setMeasureType =
    setMeasureType;

window.updateLegend =
    updateLegend;


// =====================
// 🔥 ANALYSIS
// =====================

window.getThresholds =
    getThresholds;


window.getRoomAreaCoverage =
    getRoomAreaCoverage;

window.setMeasurementInteractionState =
    setMeasurementInteractionState;

window.startMeasurementMode =
    startMeasurementMode;

window.stopMeasurementMode =
    stopMeasurementMode;







