console.log(
    "RENDER FRAME FILE LOADED"
);

function renderFrame() {

    console.error(
        "🔥🔥🔥🔥 RENDER_FRAME ENTERED",
        Date.now()
    );

    console.log("RENDER START", {
        windowW: window.canvas?.width,
        windowH: window.canvas?.height,
        domW: document.getElementById("canvas")?.width,
        domH: document.getElementById("canvas")?.height
    });

    const c =
        document.getElementById("canvas");

    console.error(
        "FRAME CANVAS",
        c.width,
        c.height
    );

    console.error(
        "🔥🔥 CONTEXT AT RENDER START",
        {
            windowCtx:
                window.ctx,

            constructor:
                window.ctx?.constructor?.name,

            ctxCanvas:
                window.ctx?.canvas,

            sameCanvas:
                window.ctx?.canvas ===
                window.canvas,

            windowCanvas:
                window.canvas
        }
    );

    const ctx =
        window.ctx;

    const canvas =
        window.canvas;

    console.log("FRAME OBJECTS", {
        same:
            window.canvas ===
            document.getElementById("canvas"),

        windowW:
            window.canvas?.width,

        windowH:
            window.canvas?.height,

        domW:
            document.getElementById("canvas")?.width,

        domH:
            document.getElementById("canvas")?.height
    });

    console.log("CTX CANVAS", {
        sameCtx:
            ctx?.canvas === window.canvas,

        ctxW:
            ctx?.canvas?.width,

        ctxH:
            ctx?.canvas?.height
    });

    if (
        !ctx ||
        !canvas
    ) {
        return;
    }

    // =====================
    // 🔥 CLEAR FRAME
    // =====================

    ctx.setTransform(
        1, 0,
        0, 1,
        0, 0
    );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // =====================
    // 🔥 NO FLOOR SELECTED
    // =====================

    if (
        AppState.project
            ?.currentFloorIndex === null
    ) {


        return;
    }

    // =====================
    // 🔥 CURRENT FLOOR
    // =====================

    const floorIndex =
        AppState?.project
            ?.currentFloorIndex;

    const currentFloor =

        floorIndex === null ||

            floorIndex === undefined

            ? null

            : AppState.project.floors[
            floorIndex
            ];

    if (!currentFloor) {

        console.error(
            "NO CURRENT FLOOR"
        );

        return;
    }

    console.error(
        "🔥🔥🔥🔥 CURRENT FLOOR REACHED",
        {
            mode:
                AppMode.current,

            projectId:
                AppState.project?.project_id ??
                AppState.project?.id ??
                null,

            floorIndex,

            floorName:
                currentFloor.name,

            hasImage:
                !!currentFloor.image,

            hasImageData:
                !!currentFloor.imageData
        }
    );

    console.error("ACTIVE FLOOR", {
        index: floorIndex,
        name: currentFloor.name,
        image: currentFloor.image?.width + "x" + currentFloor.image?.height,
        rooms: currentFloor.rooms.length,
        zones: currentFloor.zones.length
    });

    console.error("RENDER CURRENT FLOOR", {
        id: currentFloor.id,
        name: currentFloor.name,
        rooms: currentFloor.rooms.length,
        zones: currentFloor.zones.length,
        sources: currentFloor.sources?.length,
        imageLoaded: !!currentFloor.image,
        imageData: !!currentFloor.imageData,
        scaleConfirmed: currentFloor.scaleConfirmed,
        currentScale: currentFloor.currentScale
    });

    console.error(
        "ROOM COUNT",
        currentFloor.rooms?.length
    );

    console.error(
        "ROOM SNAPSHOT",
        JSON.parse(
            JSON.stringify(currentFloor.rooms)
        )
    );


    console.error(
        "RENDER IMAGE CHECK",
        {
            mode:
                AppMode.current,

            floor:
                currentFloor?.name,

            floorImage:
                !!currentFloor?.image,

            floorImageData:
                !!currentFloor?.imageData,

            imageFile:
                currentFloor?.imageFileName,

            scale:
                currentFloor?.currentScale
        }
    );



    // =====================
    // 🔥 FLOOR IMAGE
    // =====================

    if (
        currentFloor.image
    ) {

        console.error(
            "🔥🔥🔥 FINAL IMAGE DRAW VALUES",
            {
                floor:
                    currentFloor.name,

                floorId:
                    currentFloor.id,

                imageComplete:
                    currentFloor.image?.complete,

                naturalWidth:
                    currentFloor.image?.naturalWidth,

                naturalHeight:
                    currentFloor.image?.naturalHeight,

                canvasWidth:
                    canvas.width,

                canvasHeight:
                    canvas.height,

                viewport: {
                    drawWidth:
                        EMFViewport.drawWidth,

                    drawHeight:
                        EMFViewport.drawHeight,

                    offsetX:
                        EMFViewport.offsetX,

                    offsetY:
                        EMFViewport.offsetY,

                    scale:
                        EMFViewport.scale,

                    zoom:
                        EMFViewport.zoom
                }
            }
        );

        console.error(
            "🔥🔥🔥 ABOUT TO DRAW IMAGE"
        );

        ctx.save();

        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );

        ctx.globalAlpha = 1;

        const image =
            currentFloor.image;

        const imageWidth =
            image.naturalWidth ||
            image.width;

        const imageHeight =
            image.naturalHeight ||
            image.height;

        const imageAspect =
            imageWidth /
            imageHeight;

        // ==================================================
        // 🔥 IMAGE SIZE
        // ==================================================
        //
        // IMPORTANT:
        // Use the same world scale as rooms / zones.
        // Do NOT use a hardcoded 559 × 395.
        //

        const drawWidth =
            imageWidth *
            EMFViewport.scale;

        const drawHeight =
            imageHeight *
            EMFViewport.scale;

        console.error(
            "🔥🔥🔥 FINAL IMAGE DRAW VALUES",
            {
                floor:
                    currentFloor.name,

                floorId:
                    currentFloor.id,

                imageWidth,
                imageHeight,

                scale:
                    EMFViewport.scale,

                drawWidth,
                drawHeight,

                offsetX:
                    EMFViewport.offsetX,

                offsetY:
                    EMFViewport.offsetY
            }
        );



        ctx.drawImage(
            image,
            EMFViewport.offsetX,
            EMFViewport.offsetY,
            drawWidth,
            drawHeight
        );

        ctx.restore();

        console.error(
            "🔥🔥🔥 IMAGE DRAW FINISHED"
        );

        // =====================
        // 🔥 HOME MODE
        // =====================

        if (AppMode.current === "home") {
            window.drawScaleTool?.();
            window.drawSourceLinks?.();
            window.drawSourcesLayer?.(currentFloor);

            window.drawOutdoorPlacementGuide?.(ctx);

            window.drawObjects?.();
        }

        // =====================
        // 🔥 BUSINESS MODE
        // =====================

        if (
            AppMode.current ===
            "business"
        ) {

            window.drawScaleTool?.();


            // ==================================================
            // 🔥 MAP LAYER VISIBILITY
            // ==================================================

            const layers =
                window.layerVisibility || {};


            // ==================================================
            // ROOMS
            // ==================================================

            if (
                layers.rooms !== false
            ) {

                window.drawRoomsLayer?.(
                    currentFloor
                );

                window.drawRoomTool?.();
            }


            // ==================================================
            // ZONES
            // ==================================================

            if (
                layers.zones !== false
            ) {

                window.drawZonesLayer?.(
                    currentFloor
                );
            }


            // ==================================================
            // SOURCE LINKS
            //
            // Links belong to Sources.
            // ==================================================

            if (
                layers.sources !== false
            ) {

                window.drawSourceLinks?.();

                window.drawSourcesLayer?.(
                    currentFloor
                );

                window.updateBusinessSourcePopupPosition?.();
            }


            // ==================================================
            // EDITOR PREVIEW
            //
            // Always available while editing.
            // ==================================================

            window.drawEditorPreviewLayer?.();


            // ==================================================
            // ROOM / ZONE GRID
            // ==================================================

            if (
                layers.roomGrid !== false ||
                layers.zoneGrid !== false
            ) {

                window.drawGridPointsLayer?.(
                    currentFloor.rooms || []
                );
            }


            // ==================================================
            // MEASUREMENT TOOLTIP
            // ==================================================

            const popup =
                document.getElementById(
                    "measurementPopup"
                );


            if (
                AppState.ui.mode !==
                "measure"
                &&
                popup?.style.display !==
                "block"
            ) {

                window.drawGridTooltip?.();
            }


            // ==================================================
            // SCALE
            // ==================================================

            window.drawScaleBar?.(
                currentFloor
            );


            // ==================================================
            // OVERLAY UI
            // ==================================================

            window.drawOverlayUI?.();


            // ==================================================
            // MEASUREMENT POPUP POSITION
            // ==================================================

            if (
                popup?.style.display ===
                "block"
            ) {

                window.positionMeasurementPopup?.();
            }
        }
    }
}

function drawScaleBar(floor) {

    // ==================================================
    // HIDE DURING SCALE EDITING
    // ==================================================

    if (
        window.scaleTool?.active
    ) {

        return;
    }


    // ==================================================
    // REQUIRED SCALE
    // ==================================================

    const metersPerPixel =
        Number(
            floor?.currentScale
        );


    if (
        !isFinite(metersPerPixel) ||
        metersPerPixel <= 0
    ) {

        return;
    }


    // ==================================================
    // CALIBRATION REFERENCE
    // ==================================================

    const referenceMeters =
        Number(
            floor?.scaleReferenceMeters
        );


    const referencePixels =
        Number(
            floor?.scaleReferencePixels
        );


    if (
        !isFinite(referenceMeters) ||
        referenceMeters <= 0 ||
        !isFinite(referencePixels) ||
        referencePixels <= 0
    ) {

        return;
    }


    // ==================================================
    // CANVAS
    // ==================================================

    const ctx =
        window.ctx;

    const canvas =
        window.canvas;


    if (
        !ctx ||
        !canvas
    ) {

        return;
    }


    // ==================================================
    // UNITS
    // ==================================================

    const units =
        getProjectUnits?.() ||
        "m";


    // ==================================================
    // VIEWPORT
    // ==================================================

    const viewport =
        window.EMFViewport;


    const viewportScale =
        Number(
            viewport?.scale
        ) > 0
            ? Number(
                viewport.scale
            )
            : 1;


    const viewportZoom =
        Number(
            viewport?.zoom
        ) > 0
            ? Number(
                viewport.zoom
            )
            : 1;


    const screenScale =
        viewportScale *
        viewportZoom;


    // ==================================================
    // EXACT SCREEN WIDTH
    // ==================================================
    //
    // referencePixels = distance selected by user
    // in world coordinates.
    //
    // ==================================================

    let barWidth =
        referencePixels *
        screenScale;


    if (
        !isFinite(barWidth) ||
        barWidth <= 0
    ) {

        return;
    }


    // ==================================================
    // UNIT CONVERSION
    // ==================================================

    let displayDistance;


    if (
        units === "ft"
    ) {

        displayDistance =
            referenceMeters /
            0.3048;

    }
    else {

        displayDistance =
            referenceMeters;
    }


    // ==================================================
    // LABEL PRECISION
    // ==================================================

    let labelValue;


    if (
        displayDistance < 1
    ) {

        labelValue =
            Number(
                displayDistance.toFixed(
                    2
                )
            );

    }
    else if (
        displayDistance < 10
    ) {

        labelValue =
            Number(
                displayDistance.toFixed(
                    1
                )
            );

    }
    else {

        labelValue =
            Number(
                displayDistance.toFixed(
                    0
                )
            );
    }


    const label =
        `${labelValue} ${units}`;


    // ==================================================
    // POSITION
    // ==================================================

    const x =
        28;

    const y =
        canvas.height -
        28;

    const tickHeight =
        12;


    // ==================================================
    // DRAW
    // ==================================================

    ctx.save();


    // ==================================================
    // MAIN BAR
    // ==================================================

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x +
        barWidth,
        y
    );

    ctx.lineWidth =
        4;

    ctx.strokeStyle =
        "#ef1111";

    ctx.stroke();


    // ==================================================
    // TICKS
    // ==================================================

    ctx.beginPath();

    ctx.moveTo(
        x,
        y -
        tickHeight / 2
    );

    ctx.lineTo(
        x,
        y +
        tickHeight / 2
    );


    ctx.moveTo(
        x +
        barWidth,
        y -
        tickHeight / 2
    );

    ctx.lineTo(
        x +
        barWidth,
        y +
        tickHeight / 2
    );


    ctx.lineWidth =
        3;

    ctx.strokeStyle =
        "#ef1111";

    ctx.stroke();


    // ==================================================
    // LABEL
    // ==================================================

    ctx.font =
        "600 12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    const labelX =
        x +
        barWidth / 2;

    const labelY =
        y -
        12;


    const textWidth =
        ctx.measureText(
            label
        ).width;


    // ==================================================
    // LABEL BACKGROUND
    // ==================================================

    ctx.fillStyle =
        "rgba(255,255,255,0.94)";


    ctx.fillRect(

        labelX -
        textWidth / 2 -
        5,

        labelY -
        8,

        textWidth +
        10,

        16
    );


    // ==================================================
    // LABEL TEXT
    // ==================================================

    ctx.fillStyle =
        "#111827";


    ctx.fillText(

        label,

        labelX,

        labelY
    );


    ctx.restore();
}


window.drawScaleBar =
    drawScaleBar;

window.renderFrame =
    renderFrame;

// =====================
// 🔥 OVERLAY UI
// =====================



window.drawOverlayUI?.();

