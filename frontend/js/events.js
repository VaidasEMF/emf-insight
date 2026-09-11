

const S = window.AppState.measurement;


function handleMouseDown(evt) {

    // ==================================================
    // 🔥 SCALE MODE — HIGHEST PRIORITY
    // ==================================================
    //
    // Scale does NOT require:
    // - current floor
    // - room
    // - zone
    // - measurement
    // - object system
    //
    // Dispatch immediately.
    //

    if (
        AppState.ui.mode ===
        "scale"
    ) {

        console.error(
            "🔥🔥🔥 START SCALE TOOL"
        );

        console.error(
            "🔥 SCALE STATE",
            {
                mode:
                    AppState.ui.mode,

                scaleToolActive:
                    window.scaleTool?.active,

                scalePoints:
                    window.scaleTool?.points?.length || 0,

                handler:
                    typeof window.handleScaleToolClick
            }
        );

        if (
            typeof window.handleScaleToolClick !==
            "function"
        ) {

            console.error(
                "❌ SCALE HANDLER NOT FOUND"
            );

            return;
        }

        window.handleScaleToolClick(
            evt
        );

        console.error(
            "🔥 SCALE TOOL CLICK DISPATCHED"
        );

        return;
    }


    // ==================================================
    // 🔥 CANVAS POINT
    // ==================================================

    let p;

    try {

        p =
            getCanvasPoint(evt);

        console.error(
            "🔥 POINT",
            p
        );

    } catch (err) {

        console.error(
            "❌ GET CANVAS POINT ERROR",
            err
        );

        return;
    }

    if (!p) {

        console.error(
            "❌ NO CANVAS POINT"
        );

        return;
    }


    console.error(
        "🔥 MODE NOW:",
        AppState.ui.mode
    );


    // ==================================================
    // 🔥 EDIT ZONE VERTEX
    // ==================================================

    const selectedZone =
        AppState.ui.selectedZone;

    if (
        AppState.ui.mode === "editZone" &&
        selectedZone
    ) {

        const vertexIndex =
            (
                selectedZone.polygon || []
            ).findIndex(
                pt =>
                    Math.hypot(
                        pt.x - p.x,
                        pt.y - p.y
                    ) < 15
            );

        console.error(
            "VERTEX HIT",
            vertexIndex
        );

        if (
            vertexIndex >= 0
        ) {

            window.draggingZoneVertex =
                true;

            window.draggedVertexIndex =
                vertexIndex;

            console.error(
                "START DRAG",
                vertexIndex
            );

            return;
        }
    }


    // ==================================================
    // 🔥 CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();

    if (!floor) {

        console.error(
            "❌ NO CURRENT FLOOR"
        );

        return;
    }


    // ==================================================
    // 🔥 CURRENT SESSION
    // ==================================================

    const sessionId =
        AppState.measurement
            ?.currentSession ||
        "session_1";





    // ==================================================
    // 🔥 MEASURE MODE
    //
    // THIS IS THE ONLY MEASURE BLOCK.
    //
    // Priority:
    //
    // 1. Zone point + Zone measurement
    //      → use Zone
    //
    // 2. Room point exists
    //      → use Room
    //
    // 3. No Room point + Zone point exists
    //      → use Zone
    //
    // Creating a Zone does NOT invalidate
    // an existing Room measurement.
    //
    // Only an actual Zone measurement
    // replaces the Room measurement.
    // ==================================================

    if (
        AppState.ui.mode ===
        "measure"
    ) {

        console.error(
            "🔥🔥🔥 MEASURE MODE CLICK"
        );


        // ==================================================
        // 🔥 MEASUREMENT CHECK
        // ==================================================

        const hasMeasurement =
            point => {

                if (
                    !point
                ) {

                    console.error(
                        "🔥 HAS MEASUREMENT: NO POINT"
                    );

                    return false;
                }

                if (
                    !point.measurements
                ) {

                    console.error(
                        "🔥 HAS MEASUREMENT: NO MEASUREMENTS",
                        {
                            point:
                                point.id
                        }
                    );

                    return false;
                }

                const data =
                    point.measurements[
                    sessionId
                    ];

                const result =
                    !!data &&
                    (
                        data.rf !== undefined ||
                        data.electric !== undefined ||
                        data.magnetic !== undefined
                    );

                console.error(
                    "🔥🔥🔥 HAS MEASUREMENT CHECK",
                    {
                        point:
                            point.id,

                        sessionId,

                        measurementKeys:
                            Object.keys(
                                point.measurements || {}
                            ),

                        data,

                        rf:
                            data?.rf,

                        electric:
                            data?.electric,

                        magnetic:
                            data?.magnetic,

                        completed:
                            data?.completed,

                        result
                    }
                );

                return result;
            };


        // ==================================================
        // 🔥 FIND ROOM POINT
        // ==================================================

        console.error(
            "🔥🔥🔥 ROOM GRID DEBUG",
            {
                floorName:
                    floor?.name || null,

                floorIndex:
                    AppState.project
                        ?.currentFloorIndex,

                click: {
                    x: p.x,
                    y: p.y
                },

                rooms:
                    (floor?.rooms || []).map(
                        room => ({
                            id:
                                room.id,

                            name:
                                room.name,

                            gridCount:
                                room.grid?.length || 0,

                            firstPoints:
                                (room.grid || [])
                                    .slice(0, 10)
                                    .map(
                                        point => ({
                                            id:
                                                point.id,

                                            x:
                                                point.x,

                                            y:
                                                point.y,

                                            measurements:
                                                point.measurements
                                        })
                                    )
                        })
                    ),

                zones:
                    (floor?.zones || []).map(
                        zone => ({
                            id:
                                zone.id,

                            type:
                                zone.type,

                            gridCount:
                                zone.grid?.length || 0
                        })
                    )
            }
        );


        console.error(
            "🔥🔥🔥 ROOM GRID POINTS RAW",
            (floor?.rooms || []).flatMap(
                room =>
                    (room.grid || []).map(
                        point => ({
                            room:
                                room.name ||
                                room.id,

                            id:
                                point.id,

                            x:
                                point.x,

                            y:
                                point.y,

                            distance:
                                Math.hypot(
                                    point.x - p.x,
                                    point.y - p.y
                                ),

                            measurements:
                                point.measurements
                        })
                    )
            )
        );


        // ==================================================
        // 🔥 FIND NEAREST ROOM POINT
        //
        // NORMAL "measure" MODE = ROOM ONLY.
        //
        // A Room point covered by a Zone is NOT selectable.
        // Zone points are NOT considered here at all.
        //
        // Zone measurements are handled exclusively by
        // AppState.ui.mode === "zoneMeasure".
        // ==================================================

        let roomPoint =
            null;

        let roomOwner =
            null;

        let roomDistance =
            Infinity;


        // ==================================================
        // 🔥 FIND ACTIVE ROOM POINT
        // ==================================================

        for (
            const room of
            (floor.rooms || [])
        ) {

            const grid =
                Array.isArray(
                    room.grid
                )
                    ? room.grid
                    : [];

            for (
                const point of
                grid
            ) {

                if (
                    point?.x === undefined ||
                    point?.y === undefined
                ) {

                    continue;
                }


                // ==================================================
                // 🔥 ROOM POINT COVERED BY ZONE
                // ==================================================

                if (
                    point.zoneId
                ) {

                    console.error(
                        "🔥 SKIP ROOM POINT — COVERED BY ZONE",
                        {
                            point:
                                point.id,

                            zoneId:
                                point.zoneId,

                            measurements:
                                point.measurements,

                            session:
                                sessionId
                        }
                    );

                    continue;
                }


                // ==================================================
                // 🔥 DISTANCE
                // ==================================================

                const distance =
                    Math.hypot(
                        Number(point.x) -
                        Number(p.x),

                        Number(point.y) -
                        Number(p.y)
                    );


                // ==================================================
                // 🔥 NEAREST ROOM POINT
                // ==================================================

                if (
                    distance <
                    roomDistance
                ) {

                    roomPoint =
                        point;

                    roomOwner =
                        room;

                    roomDistance =
                        distance;
                }
            }
        }


        // ==================================================
        // 🔥 ROOM HIT RESULT
        // ==================================================

        if (
            roomPoint &&
            roomDistance <= 20
        ) {

            console.error(
                "🔥🔥🔥 ROOM POINT HIT",
                {
                    point:
                        roomPoint.id,

                    room:
                        roomOwner?.name ||
                        roomOwner?.id,

                    distance:
                        roomDistance,

                    zoneId:
                        roomPoint.zoneId ||
                        null
                }
            );

        }
        else {

            console.error(
                "❌ NO ACTIVE ROOM MEASUREMENT POINT",
                {
                    nearest:
                        roomPoint?.id ||
                        null,

                    distance:
                        roomDistance === Infinity
                            ? null
                            : roomDistance
                }
            );

            roomPoint =
                null;

            roomOwner =
                null;

            roomDistance =
                Infinity;
        }


        // ==================================================
        // 🔥 FINAL ROOM MEASURE SELECTION
        // ==================================================

        let selectedPoint =
            null;

        let selectedOwner =
            null;

        let selectedType =
            null;


        if (
            roomPoint
        ) {

            selectedPoint =
                roomPoint;

            selectedOwner =
                roomOwner;

            selectedType =
                "room";
        }


        // ==================================================
        // 🔥 ROOM MEASURE RESOLUTION
        // ==================================================

        console.error(
            "🔥🔥🔥 ROOM MEASURE RESOLUTION",
            {
                click: {
                    x:
                        p.x,

                    y:
                        p.y
                },

                session:
                    sessionId,

                roomPoint:
                    roomPoint?.id ||
                    null,

                roomDistance:
                    roomDistance === Infinity
                        ? null
                        : roomDistance,

                room:
                    roomOwner?.name ||
                    roomOwner?.id ||
                    null,

                selected:
                    selectedPoint?.id ||
                    null,

                selectedType,

                zoneSelection:
                    "DISABLED"
            }
        );


        console.error(
            "🔥🔥🔥 AFTER ROOM RESOLUTION",
            {
                selectedPoint:
                    selectedPoint?.id ||
                    null,

                selectedType,

                selectedOwner:
                    selectedOwner?.name ||
                    selectedOwner?.id ||
                    null
            }
        );


        console.error(
            "🔥🔥🔥 BEFORE FINAL SELECTION",
            {
                selectedPoint:
                    selectedPoint?.id ||
                    null,

                selectedType,

                selectedOwner:
                    selectedOwner?.name ||
                    selectedOwner?.id ||
                    null
            }
        );


        // ==================================================
        // 🔥 RESOLUTION DEBUG
        // ==================================================

        console.error(
            "🔥🔥🔥 MEASUREMENT POINT RESOLUTION",
            {
                click: {
                    x:
                        p.x,

                    y:
                        p.y
                },

                session:
                    sessionId,

                roomPoint:
                    roomPoint?.id ||
                    null,

                roomDistance:
                    roomDistance === Infinity
                        ? null
                        : roomDistance,

                room:
                    roomOwner?.name ||
                    roomOwner?.code ||
                    roomOwner?.id ||
                    null,

                selected:
                    selectedPoint?.id ||
                    null,

                selectedType,

                priority:
                    selectedPoint
                        ? "ROOM"
                        : "NONE",

                zoneSelection:
                    "DISABLED_IN_ROOM_MEASURE"
            }
        );


        // ==================================================
        // 🔥 NOTHING FOUND
        // ==================================================

        if (
            !selectedPoint
        ) {

            console.error(
                "❌ NO MEASUREMENT POINT"
            );

            updateStatus?.(
                "⚠ Click closer to a measurement point"
            );

            return;
        }


        // ==================================================
        // 🔥 FINAL SELECTION DEBUG
        // ==================================================

        console.error(
            "🔥🔥🔥 SELECTED MEASUREMENT POINT",
            {
                id:
                    selectedPoint.id,

                x:
                    selectedPoint.x,

                y:
                    selectedPoint.y,

                mode:
                    AppState.ui.mode,

                floor:
                    floor.name ||
                    null,

                floorIndex:
                    AppState.project
                        ?.currentFloorIndex,

                room:
                    selectedOwner?.name ||
                    selectedOwner?.code ||
                    selectedOwner?.id ||
                    null,

                selectedType,

                roomPoint:
                    !!roomPoint,

                measurements:
                    selectedPoint.measurements,

                rf:
                    selectedPoint.rf,

                electric:
                    selectedPoint.electric,

                magnetic:
                    selectedPoint.magnetic,

                measured:
                    selectedPoint.measured,

                completed:
                    selectedPoint.completed,

                zoneId:
                    selectedPoint.zoneId ||
                    null
            }
        );


        // ==================================================
        // 🔥 ENSURE MEASUREMENT OBJECT
        // ==================================================

        if (
            !selectedPoint.measurements
        ) {

            selectedPoint.measurements =
                {};
        }


        // ==================================================
        // 🔥 ROOM POINT INSIDE ZONE
        // ==================================================

        console.error(
            "🔥🔥🔥 ROOM ZONE BLOCK CHECK",
            {
                selectedPoint:
                    selectedPoint?.id || null,

                selectedType,

                zoneId:
                    selectedPoint?.zoneId || null,

                mode:
                    AppState.ui.mode
            }
        );


        console.error(
            "🔥🔥🔥 ROOM ZONE BLOCK CHECK",
            {
                selectedPoint:
                    selectedPoint?.id || null,

                selectedType,

                zoneId:
                    selectedPoint?.zoneId || null,

                mode:
                    AppState.ui.mode,

                pointObject:
                    selectedPoint
            }
        );


        console.error(
            "🔥🔥🔥 CLICK ZONE TEST",
            {
                click: {
                    x: p.x,
                    y: p.y
                },

                zones:
                    (floor.zones || []).map(
                        zone => ({
                            id: zone.id,

                            inside:
                                pointInPolygon(
                                    {
                                        x: p.x,
                                        y: p.y
                                    },
                                    zone.polygon
                                )
                        })
                    )
            }
        );


        console.error(
            "🔥🔥🔥 FLOOR STATE COMPARISON",
            {
                localFloorZones:
                    floor?.zones?.length,

                currentFloorZones:
                    getCurrentFloor()?.zones?.length,

                sameFloor:
                    floor === getCurrentFloor(),

                localFloor:
                    floor,

                currentFloor:
                    getCurrentFloor()
            }
        );


        // ==================================================
        // 🔥 ROOM POINT INSIDE ZONE
        // ==================================================

        if (
            selectedType === "room"
        ) {

            const containingZone =
                getZoneContainingPoint(
                    selectedPoint,
                    floor
                );


            if (
                containingZone
            ) {

                console.error(
                    "⚠️ ROOM POINT BLOCKED — ZONE OWNS THIS AREA",
                    {
                        point:
                            selectedPoint?.id,

                        zone:
                            containingZone?.name ||
                            containingZone?.type ||
                            containingZone?.id ||
                            null,

                        zoneId:
                            containingZone?.id ||
                            null,

                        pointX:
                            selectedPoint?.x,

                        pointY:
                            selectedPoint?.y,

                        mode:
                            AppState.ui.mode
                    }
                );


                selectedPoint.disabledByZone =
                    true;

                selectedPoint.zoneId =
                    containingZone.id ||
                    selectedPoint.zoneId ||
                    null;


                updateStatus?.(
                    "⚠ This point belongs to a Zone. Use Zone Measuring."
                );

                return;
            }
        }


        // ==================================================
        // 🔥 SET SELECTED GRID POINT
        // ==================================================

        window.selectedGridPoint =
            selectedPoint;


        console.error(
            "🔥🔥🔥 SELECTED GRID POINT SET",
            {
                selectedGridPoint:
                    window.selectedGridPoint?.id ||
                    null
            }
        );


        // ==================================================
        // 🔥 POPUP
        // ==================================================

        if (
            window.justClosedMeasurementPopup
        ) {

            window.justClosedMeasurementPopup =
                false;

            return;
        }


        console.error(
            "🔥🔥🔥 CALLING OPEN MEASUREMENT POPUP",
            {
                point:
                    selectedPoint?.id ||
                    null,

                selectedGridPoint:
                    window.selectedGridPoint?.id ||
                    null,

                selectedType,

                popupFunction:
                    typeof window.openMeasurementPopup
            }
        );


        window.openMeasurementPopup?.(
            selectedPoint
        );


        // ==================================================
        // 🔥 UI
        // ==================================================

        requestRender?.();

        updateProgressUI?.();

        updateStatus?.(
            selectedType === "zone"
                ? "📊 Zone measurement point selected"
                : "📊 Measurement point selected"
        );

        return;
    }


    // ==================================================
    // 🔥 ZONE MEASURE MODE
    // ==================================================

    if (
        AppState.ui.mode ===
        "zoneMeasure"
    ) {

        console.error(
            "🔥🔥🔥 ZONE MEASURE MODE"
        );


        let selectedPoint =
            null;

        let selectedZone =
            null;

        let selectedDistance =
            Infinity;


        // ==================================================
        // 🔥 FIND NEAREST ZONE POINT
        // ==================================================

        for (
            const zone of
            (floor.zones || [])
        ) {

            for (
                const point of
                (zone.grid || [])
            ) {

                const distance =
                    Math.hypot(
                        point.x - p.x,
                        point.y - p.y
                    );

                if (
                    distance < 20 &&
                    distance < selectedDistance
                ) {

                    selectedPoint =
                        point;

                    selectedZone =
                        zone;

                    selectedDistance =
                        distance;
                }
            }
        }


        // ==================================================
        // 🔥 ZONE POINT RESOLUTION DEBUG
        // ==================================================

        console.error(
            "🔥🔥🔥 ZONE POINT RESOLUTION",
            {
                point:
                    selectedPoint?.id ||
                    null,

                zone:
                    selectedZone?.type ||
                    selectedZone?.name ||
                    selectedZone?.id ||
                    null,

                distance:
                    selectedDistance === Infinity
                        ? null
                        : selectedDistance,

                measurements:
                    selectedPoint?.measurements,

                session:
                    sessionId,

                currentSessionData:
                    selectedPoint
                        ?.measurements
                    ?.[sessionId]
            }
        );


        // ==================================================
        // 🔥 NOTHING FOUND
        // ==================================================

        if (
            !selectedPoint
        ) {

            console.error(
                "❌ NO ZONE MEASUREMENT POINT"
            );

            updateStatus?.(
                "⚠ Click closer to a zone measurement point"
            );

            return;
        }


        // ==================================================
        // 🔥 ENSURE MEASUREMENTS OBJECT
        // ==================================================

        if (
            !selectedPoint.measurements
        ) {

            selectedPoint.measurements =
                {};
        }


        // ==================================================
        // 🔥 SELECT ZONE POINT
        // ==================================================

        window.selectedGridPoint =
            selectedPoint;


        console.error(
            "🔥🔥🔥 SELECTED ZONE MEASUREMENT POINT",
            {
                point:
                    selectedPoint.id,

                zone:
                    selectedZone?.type ||
                    selectedZone?.name ||
                    selectedZone?.id ||
                    null,

                session:
                    sessionId,

                hasMeasurement:
                    !!selectedPoint
                        .measurements
                    ?.[sessionId],

                measurement:
                    selectedPoint
                        .measurements
                    ?.[sessionId]
            }
        );


        // ==================================================
        // 🔥 OPEN MEASUREMENT POPUP
        // ==================================================

        window.openMeasurementPopup?.(
            selectedPoint
        );


        console.error(
            "🔥🔥🔥 OPENING MEASUREMENT POPUP",
            {
                point:
                    selectedPoint?.id,

                type:
                    selectedType,

                mode:
                    AppState.ui.mode,

                popupFunction:
                    typeof window.openMeasurementPopup
            }
        );


        // ==================================================
        // 🔥 UI
        // ==================================================

        requestRender?.();

        updateProgressUI?.();

        updateStatus?.(
            "📊 Zone measurement point selected"
        );

        return;
    }


    // ==================================================
    // 🔥 ROOM MODE
    // ==================================================

    if (
        AppState.ui.mode ===
        "rooms"
    ) {

        console.error(
            "🔥 ROOM MODE — CHECK EXISTING ROOMS"
        );


        let existingRoom =
            null;


        // ==================================================
        // FIND EXISTING ROOM UNDER CLICK
        // ==================================================

        for (
            const room of
            (floor.rooms || [])
        ) {

            if (
                !room?.polygon ||
                room.polygon.length < 3
            ) {

                continue;
            }


            const inside =
                pointInPolygon(
                    p,
                    room.polygon
                );


            if (
                inside
            ) {

                existingRoom =
                    room;

                break;
            }
        }


        // ==================================================
        // EXISTING ROOM SELECT
        // ==================================================

        if (
            existingRoom
        ) {

            console.error(
                "🔥 EXISTING ROOM SELECTED",
                {
                    id:
                        existingRoom.id,

                    code:
                        existingRoom.code,

                    name:
                        existingRoom.name
                }
            );


            AppState.ui.selectedRoom =
                existingRoom;

            window.selectedRoom =
                existingRoom;

            selectedRoom =
                existingRoom;


            if (
                S
            ) {

                S.selectedRoom =
                    existingRoom;
            }


            AppState.ui.selectedZone =
                null;

            window.selectedZone =
                null;


            if (
                S
            ) {

                S.selectedZone =
                    null;
            }


            roomTool.active =
                false;

            roomTool.points =
                [];

            AppState.ui.mode =
                "idle";


            syncState?.();

            showRoomDetails?.(
                existingRoom
            );

            requestRender?.();

            return;
        }


        // ==================================================
        // NO EXISTING ROOM HIT
        // ==================================================

        console.error(
            "🔥 NO EXISTING ROOM — PASS TO ROOM TOOL"
        );


        handleRoomToolClick?.(
            evt
        );

        requestRender?.();

        return;
    }


    // ==================================================
    // 🔥 LEGACY ROOM MODE
    // ==================================================

    if (
        AppState.ui.mode ===
        "room"
    ) {

        window.handleRoomToolClick?.(
            evt
        );

        return;
    }


    // ==================================================
    // 🔥 MOUSE POSITION
    // ==================================================

    mouseX =
        p.x;

    mouseY =
        p.y;

    lastMouseX =
        p.x;

    lastMouseY =
        p.y;


    if (
        S?.interaction
    ) {

        S.interaction.mouseX =
            mouseX;

        S.interaction.mouseY =
            mouseY;

        S.interaction.lastMouseX =
            lastMouseX;

        S.interaction.lastMouseY =
            lastMouseY;
    }


    // ==================================================
    // 🔥 SCALE TOOL ACTIVE
    // ==================================================

    if (
        window.scaleTool?.active
    ) {

        window.handleScaleToolClick?.(
            evt
        );

        return;
    }


    // ==================================================
    // 🔥 OBJECT SYSTEM
    // ==================================================

    if (
        window.objectTool
    ) {

        const hitObject =
            window.getObjectAtPoint?.(
                p
            );

        window.hoveredObjectId =
            hitObject?.id ||
            null;


        // ==================================================
        // 🔥 EMPTY CANVAS → CLEAR SOURCE FOCUS
        // ==================================================

        if (
            !hitObject
        ) {

            if (
                window.viewingSourceId ||
                window.objectTool?.selectedObjectId
            ) {

                window.clearSourceFocus?.();

                return;
            }
        }
        else {

            // Another object/source was clicked.
            // View-only focus is no longer active.

            window.viewingSourceId =
                null;
        }


        // ==================================================
        // DELETE BUTTON HIT
        // ==================================================
        //
        // IMPORTANT:
        //
        // Outdoor Sources are Property-level.
        // Therefore deleting an Outdoor Source must remove it
        // from AppState.project.outdoorSources.
        //
        // Lifestyle Areas remain on the Floor.
        // Indoor Sources remain on the Floor.
        //

        const floorObjects = [

            ...(Array.isArray(floor.zones)
                ? floor.zones
                : []),

            ...(Array.isArray(floor.sources)
                ? floor.sources
                : [])
        ];


        const propertyOutdoorSources =
            Array.isArray(
                AppState.project?.outdoorSources
            )
                ? AppState.project.outdoorSources
                : [];


        const allObjects = [

            ...floorObjects,

            ...propertyOutdoorSources
        ];


        const selectedObject =
            allObjects.find(
                object =>
                    object?.id ===
                    window.objectTool
                        ?.selectedObjectId
            );


        if (
            selectedObject?.deleteButton
        ) {

            const dx =
                p.x -
                selectedObject
                    .deleteButton.x;

            const dy =
                p.y -
                selectedObject
                    .deleteButton.y;

            const d =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                d < 12
            ) {

                // ==================================================
                // DETERMINE SOURCE TYPE
                // ==================================================

                const isOutdoorSource =
                    window.OUTDOOR_SOURCE_TYPES?.includes(
                        selectedObject.type
                    ) ||
                    selectedObject.placementType ===
                    "outdoor";


                // ==================================================
                // 🔥 DELETE OUTDOOR SOURCE
                //
                // Property-level canonical source.
                // ==================================================

                if (
                    isOutdoorSource
                ) {

                    AppState.project.outdoorSources =
                        (
                            AppState.project
                                .outdoorSources ||
                            []
                        ).filter(
                            source =>
                                source?.id !==
                                selectedObject.id
                        );


                    console.log(
                        "🗑️ PROPERTY OUTDOOR SOURCE DELETED",
                        {
                            id:
                                selectedObject.id,

                            type:
                                selectedObject.type,

                            remaining:
                                AppState.project
                                    .outdoorSources
                                    .length
                        }
                    );


                    // --------------------------------------------------
                    // Refresh contextual relationships on every floor.
                    // --------------------------------------------------

                    (
                        AppState.project.floors ||
                        []
                    ).forEach(
                        projectFloor => {

                            window.refreshOutdoorLifestyleLinks?.(
                                projectFloor
                            );
                        }
                    );


                    // --------------------------------------------------
                    // Clear source UI state.
                    // --------------------------------------------------

                    window.objectTool
                        .selectedObjectId =
                        null;

                    window.activePopupSource =
                        null;

                    window.selectedOutdoorSource =
                        null;

                    window.lastPlacedSource =
                        null;


                    closeOutdoorSourcePopup?.();


                    const hoursPopup =
                        document.getElementById(
                            "hoursPopup"
                        );


                    if (
                        hoursPopup
                    ) {

                        hoursPopup.style.display =
                            "none";
                    }


                    saveProject?.();

                    window.updateWorkflowUI?.();

                    updateRoomProgressPanel?.();

                    updateWellnessCard?.();

                    requestRender?.();

                    return;
                }


                // ==================================================
                // 🔥 DELETE LIFESTYLE AREA
                // ==================================================

                const deletedZone =
                    (
                        floor.zones ||
                        []
                    ).find(
                        zone =>
                            zone?.id ===
                            selectedObject.id
                    );


                if (
                    deletedZone
                ) {

                    // --------------------------------------------------
                    // Re-enable Room measurement points previously
                    // disabled by this Lifestyle Area.
                    // --------------------------------------------------

                    (
                        floor.rooms ||
                        []
                    ).forEach(
                        room => {

                            (
                                room.grid ||
                                []
                            ).forEach(
                                point => {

                                    if (
                                        point?.zoneId ===
                                        deletedZone.id
                                    ) {

                                        point.disabledByZone =
                                            false;

                                        delete point.zoneId;
                                    }
                                }
                            );
                        }
                    );


                    floor.zones =
                        (
                            floor.zones ||
                            []
                        ).filter(
                            zone =>
                                zone?.id !==
                                deletedZone.id
                        );


                    // --------------------------------------------------
                    // Refresh contextual Outdoor Source relationships
                    // for this floor.
                    // --------------------------------------------------

                    window.refreshOutdoorLifestyleLinks?.(
                        floor
                    );


                    if (
                        AppState.ui
                            .selectedZone
                            ?.id ===
                        deletedZone.id
                    ) {

                        AppState.ui.selectedZone =
                            null;

                        window.selectedZone =
                            null;
                    }


                    console.log(
                        "🗑️ LIFESTYLE AREA DELETED",
                        {
                            id:
                                deletedZone.id,

                            type:
                                deletedZone.type,

                            floorId:
                                floor.id
                        }
                    );
                }


                // ==================================================
                // 🔥 DELETE FLOOR-LEVEL SOURCE
                //
                // This is ONLY for Indoor Sources.
                // Outdoor Sources were already handled above.
                // ==================================================

                const deletedFloorSource =
                    (
                        floor.sources ||
                        []
                    ).find(
                        source =>
                            source?.id ===
                            selectedObject.id
                    );


                if (
                    deletedFloorSource
                ) {

                    floor.sources =
                        (
                            floor.sources ||
                            []
                        ).filter(
                            source =>
                                source?.id !==
                                selectedObject.id
                        );


                    console.log(
                        "🗑️ FLOOR SOURCE DELETED",
                        {
                            id:
                                deletedFloorSource.id,

                            type:
                                deletedFloorSource.type,

                            floorId:
                                floor.id
                        }
                    );
                }


                // ==================================================
                // CLEAR SELECTION / POPUPS
                // ==================================================

                window.objectTool
                    .selectedObjectId =
                    null;


                const popup =
                    document.getElementById(
                        "hoursPopup"
                    );


                if (
                    popup
                ) {

                    popup.style.display =
                        "none";
                }


                saveProject?.();

                window.updateWorkflowUI?.();

                updateRoomProgressPanel?.();

                updateWellnessCard?.();

                requestRender?.();

                return;
            }
        }


        // ==================================================
        // 🔥 OUTDOOR PLACEMENT / PAN
        // ==================================================
        //
        // Outdoor mode:
        //
        // 1. Click ON floor plan
        //    → start PAN
        //
        // 2. Click OUTSIDE floor plan
        //    → place Outdoor source
        //
        // This check MUST happen before placeObject().
        // ==================================================

        const currentObjectType =
            window.objectTool?.currentType ||
            null;

        const currentObjectConfig =
            window.OBJECT_CONFIGS?.[
            currentObjectType
            ] || null;

        const isOutdoorPlacement =
            currentObjectConfig?.placementType ===
            "outdoor" ||
            window.OUTDOOR_SOURCE_TYPES?.includes(
                currentObjectType
            );

        if (
            isOutdoorPlacement
        ) {

            // --------------------------------------------------
            // IMPORTANT:
            // p = WORLD coordinate
            // planBounds = SCREEN/CANVAS coordinate
            // --------------------------------------------------

            const screenPoint =
                typeof EMFViewport?.worldPoint ===
                    "function"
                    ? EMFViewport.worldPoint(p)
                    : null;

            const planBounds =
                typeof EMFViewport?.planBounds ===
                    "function"
                    ? EMFViewport.planBounds()
                    : null;


            const insidePlan =
                !!screenPoint &&
                !!planBounds &&
                screenPoint.x >=
                planBounds.left &&
                screenPoint.x <=
                planBounds.right &&
                screenPoint.y >=
                planBounds.top &&
                screenPoint.y <=
                planBounds.bottom;


            console.error(
                "🔥 OUTDOOR PLACEMENT TEST",
                {
                    type:
                        currentObjectType,

                    placementType:
                        currentObjectConfig?.placementType,

                    isOutdoorPlacement,

                    worldPoint:
                        p,

                    screenPoint,

                    planBounds,

                    insidePlan
                }
            );


            // ==================================================
            // 🔥 CLICK ON IMAGE → PAN
            // ==================================================

            if (
                insidePlan
            ) {

                console.error(
                    "🔥🔥 OUTDOOR → PLAN → PAN START"
                );

                closeOutdoorSourcePopup?.();

                window.activePopupSource =
                    null;

                window.selectedOutdoorSource =
                    null;


                isPanning =
                    true;


                if (
                    S?.interaction
                ) {

                    S.interaction.isPanning =
                        true;
                }


                panStartX =
                    evt.clientX -
                    (
                        EMFViewport?.panX ||
                        0
                    );


                panStartY =
                    evt.clientY -
                    (
                        EMFViewport?.panY ||
                        0
                    );


                if (
                    window.canvas
                ) {

                    window.canvas.style.cursor =
                        "grabbing";
                }


                return;
            }

            // ==================================================
            // 🔥 CLICK OUTSIDE IMAGE → PLACE OUTDOOR
            // ==================================================

            console.error(
                "🔥🔥 OUTDOOR → OUTSIDE PLAN → PLACE"
            );


            closeIndoorDistancePopup?.();

            window.placeObject?.(
                evt
            );

            return;
        }


        // ==================================================
        // 🔥 NORMAL OBJECT PLACEMENT
        // ==================================================

        if (
            window.objectTool?.currentType
        ) {

            closeIndoorDistancePopup?.();

            window.placeObject?.(
                evt
            );

            setTimeout(() => {
                updateHomeSidebarStatus?.();
                updateHomeWorkflow?.();
                updateHomeLocks?.();
            }, 0);

            return;
                    }


        // ==================================================
        // 🔥 PLACE OBJECT
        // ==================================================

        if (
            window.objectTool?.currentType
        ) {

            closeIndoorDistancePopup?.();

            window.placeObject?.(evt);

            return;
        }


        // ==================================================
        // 🔥 PLACE OBJECT
        // ==================================================

        if (
            window.objectTool
                .currentType
        ) {

            closeIndoorDistancePopup?.();

            window.placeObject?.(
                evt
            );

            return;
        }


        // ==================================================
        // 🔥 SELECT OBJECT
        // ==================================================

        if (
            hitObject
        ) {

            window.objectTool
                .selectedObjectId =
                hitObject.id;


            // ==================================================
            // 🔥 FIND CLICKED LIFESTYLE AREA
            // ==================================================

            const clickedLifestyleArea =
                (
                    floor?.zones || []
                ).find(
                    zone =>
                        zone?.id ===
                        hitObject.id
                );


            // ==================================================
            // 🔥 LIFESTYLE AREA
            // ==================================================

            if (
                clickedLifestyleArea
            ) {

                window.objectTool
                    .selectedObjectId =
                    clickedLifestyleArea.id;


                window.objectTool
                    .draggingObject =
                    clickedLifestyleArea;


                window.activePopupZone =
                    clickedLifestyleArea;


                window.selectedLifestyleArea =
                    clickedLifestyleArea;


                // ==================================================
                // 🔥 DOUBLE CLICK → EDIT POPUP
                // ==================================================

                if (
                    evt.detail >= 2
                ) {

                    window.objectTool
                        .draggingObject =
                        null;


                    if (
                        window.dragState
                    ) {

                        window.dragState
                            .isDragging =
                            false;
                    }


                    window.showLifestyleAreaPopup?.(
                        clickedLifestyleArea
                    );


                    requestRender?.();

                    return;
                }


                // ==================================================
                // 🔥 SINGLE CLICK → SELECT + DRAG
                // ==================================================

                startDrag?.(
                    clickedLifestyleArea
                );


                requestRender?.();

                return;
            }


            // ==================================================
            // 🔥 FIND CLICKED SOURCE
            // ==================================================

            const clickedSource =
                (
                    floor?.sources || []
                ).find(
                    source =>
                        source?.id ===
                        hitObject.id
                )
                ||
                (
                    AppState.project
                        ?.outdoorSources || []
                ).find(
                    source =>
                        source?.id ===
                        hitObject.id
                );


            const isOutdoorSource =
                !!clickedSource &&
                (
                    window.OUTDOOR_SOURCE_TYPES?.includes(
                        clickedSource.type
                    )
                    ||
                    clickedSource.placementType ===
                    "outdoor"
                );


            // ==================================================
            // 🔥 SOURCE SELECTED
            // ==================================================

            if (
                clickedSource
            ) {

                window.objectTool
                    .selectedObjectId =
                    clickedSource.id;


                window.objectTool
                    .draggingObject =
                    clickedSource;


                window.lastPlacedSource =
                    clickedSource;


                window.activePopupSource =
                    clickedSource;


                selectedSource =
                    clickedSource;


                // ==================================================
                // 🔥 OUTDOOR SOURCE
                // ==================================================

                if (
                    isOutdoorSource
                ) {

                    window.selectedOutdoorSource =
                        clickedSource;


                    // Existing source = EDIT mode.

                    window.outdoorSourcePopupIsNew =
                        false;


                    // ==================================================
                    // DOUBLE CLICK → OUTDOOR POPUP
                    // ==================================================

                    if (
                        evt.detail >= 2
                    ) {

                        window.objectTool
                            .draggingObject =
                            null;


                        if (
                            window.dragState
                        ) {

                            window.dragState
                                .isDragging =
                                false;
                        }


                        showOutdoorSourcePopup?.(
                            clickedSource
                        );


                        requestRender?.();

                        return;
                    }


                    // ==================================================
                    // SINGLE CLICK → SELECT + DRAG
                    // ==================================================

                    startDrag?.(
                        clickedSource
                    );


                    requestRender?.();

                    return;
                }


                // ==================================================
                // 🔥 INDOOR SOURCE — HOME
                // ==================================================
                //
                // 1 click:
                //     select + drag
                //
                // 2 clicks:
                //     open Home Indoor Source popup
                //
                // IMPORTANT:
                // Do NOT use the Business
                // showIndoorDistancePopup() here.
                // ==================================================

                window.selectedIndoorSource =
                    clickedSource;


                // ==================================================
                // DOUBLE CLICK → HOME INDOOR POPUP
                // ==================================================

                if (
                    evt.detail >= 2
                ) {

                    window.objectTool
                        .draggingObject =
                        null;


                    if (
                        window.dragState
                    ) {

                        window.dragState
                            .isDragging =
                            false;
                    }


                    window.activePopupSource =
                        clickedSource;


                    window.showHomeIndoorSourcePopup?.(
                        clickedSource
                    );


                    requestRender?.();

                    return;
                }


                // ==================================================
                // SINGLE CLICK → SELECT + DRAG
                // ==================================================

                startDrag?.(
                    clickedSource
                );


                requestRender?.();

                return;
            }


            // ==================================================
            // 🔥 OTHER OBJECT
            // ==================================================

            startDrag?.(
                hitObject
            );


            // ==================================================
            // 🔥 H/DAY
            // ==================================================

            const wrap =
                document.getElementById(
                    "zoneHoursWrap"
                );


            const input =
                document.getElementById(
                    "zoneHoursInput"
                );


            const value =
                document.getElementById(
                    "zoneHoursValue"
                );


            if (
                wrap &&
                input &&
                value
            ) {

                if (
                    hitObject.zoneType
                ) {

                    wrap.style.display =
                        "block";


                    input.value =
                        hitObject.hours ||
                        1;


                    value.innerText =
                        (
                            hitObject.hours ||
                            1
                        ) +
                        " h/day";

                }
                else {

                    wrap.style.display =
                        "none";
                }
            }


            requestRender?.();

            return;
        }

    }




    // ==================================================
    // 🔥 ZONE SELECT
    // ==================================================

    if (
        floor.zones
    ) {

        for (
            const zone of
            floor.zones
        ) {

            if (
                pointInPolygon(
                    {
                        x:
                            p.x,

                        y:
                            p.y
                    },
                    zone.polygon
                )
            ) {

                AppState.ui.selectedZone =
                    zone;

                window.selectedZone =
                    AppState.ui.selectedZone;

                if (
                    S
                ) {

                    S.selectedZone =
                        AppState.ui.selectedZone;
                }


                console.error(
                    "ZONE SELECTED",
                    zone.id
                );


                const room =
                    (
                        floor.rooms || []
                    ).find(
                        r =>
                            r.id ===
                            zone.roomId
                    );


                if (
                    room
                ) {

                    selectedRoom =
                        room;

                    AppState.ui.selectedRoom =
                        room;

                    window.selectedRoom =
                        AppState.ui.selectedRoom;


                    if (
                        S
                    ) {

                        S.selectedRoom =
                            room;
                    }
                }


                syncState?.();

                requestRender?.();

                return;
            }
        }
    }


    // ==================================================
    // 🔥 ROOM SELECT
    // ==================================================

    if (
        AppState.ui.mode !==
        "zone"
    ) {

        if (
            floor.rooms
        ) {

            for (
                const room of
                floor.rooms
            ) {

                console.error(
                    "CHECK ROOM",
                    room.code
                );


                if (
                    pointInPolygon(
                        p,
                        room.polygon
                    )
                ) {

                    AppState.ui.selectedRoom =
                        room;

                    window.selectedRoom =
                        AppState.ui.selectedRoom;


                    console.log(
                        "SELECTED ROOM:",
                        selectedRoom?.code
                    );

                    console.log(
                        "SELECTED ROOM GRID:",
                        selectedRoom?.grid?.length
                    );

                    console.log(
                        "LOCAL:",
                        selectedRoom?.code
                    );

                    console.log(
                        "WINDOW:",
                        window.selectedRoom?.code
                    );


                    roomTool.active =
                        false;

                    roomTool.points =
                        [];

                    AppState.ui.mode =
                        "idle";


                    console.error(
                        "ROOM HIT",
                        room.code
                    );


                    if (
                        S
                    ) {

                        S.selectedRoom =
                            selectedRoom;
                    }


                    showRoomDetails?.(
                        room
                    );


                    AppState.ui.selectedZone =
                        null;


                    if (
                        S
                    ) {

                        S.selectedZone =
                            AppState.ui.selectedZone;
                    }


                    syncState?.();

                    requestRender?.();

                    return;
                }
            }
        }
    }


    // ==================================================
    // 🔥 FINISH ZONE
    // ==================================================

    if (
        AppState.ui.mode ===
        "zone" &&
        window.zoneFinishButton
    ) {

        const btn =
            window.zoneFinishButton;

        const rect =
            canvas.getBoundingClientRect();

        const sx =
            evt.clientX -
            rect.left;

        const sy =
            evt.clientY -
            rect.top;


        console.error(
            "FINISH TEST",
            {
                sx,
                sy,
                btn
            }
        );


        if (
            sx >= btn.x &&
            sx <=
            btn.x +
            btn.width &&
            sy >= btn.y &&
            sy <=
            btn.y +
            btn.height
        ) {

            console.error(
                "ZONE FINISH CLICK"
            );

            finishZone();

            return;
        }
    }


    // ==================================================
    // 🔥 ZONE DRAW
    // ==================================================

    if (
        AppState.ui.mode ===
        "zone"
    ) {

        if (
            !AppState.ui.zoneDraft
        ) {

            AppState.ui.zoneDraft = {

                id:
                    window.PhiIdFactory
                        ?.createZoneId?.() ||
                    (
                        "zone_" +
                        Date.now()
                    ),

                type:
                    window.selectedZoneType ||
                    "sleep",

                gridSize:
                    window.selectedZoneGrid ||
                    0.5,

                hoursPerDay:
                    null,

                polygon: [],

                grid: []
            };

            window.currentZone =
                AppState.ui.zoneDraft;

            console.log(
                "NEW ZONE CREATED",
                AppState.ui.zoneDraft
            );
        }


        // ==================================================
        // 🔥 MUST STAY INSIDE ROOM
        // ==================================================

        const roomUnderPoint =
            Boundaries.findRoomAt(
                p,
                floor
            );

        if (
            !roomUnderPoint
        ) {

            updateStatus?.(
                "⚠ Zone points must stay inside room"
            );

            return;
        }


        console.error(
            "BEFORE ADD POINT",
            p.x,
            p.y
        );


        AppState.ui.zoneDraft
            .polygon
            .push({
                x:
                    p.x,

                y:
                    p.y
            });


        console.error(
            "ZONE POLYGON",
            AppState.ui.zoneDraft
                .polygon
        );


        console.error(
            "ZONE LENGTH",
            AppState.ui.zoneDraft
                .polygon
                .length
        );


        console.error(
            "CURRENT ZONE",
            AppState.ui.zoneDraft
        );


        console.log(
            "ZONE POINT ADDED:",
            AppState.ui.zoneDraft
                .polygon
                .length
        );


        requestRender?.();

        return;
    }


    // ==================================================
    // 🔥 START PAN
    // ==================================================
    //
    // PAN is a viewport navigation operation.
    //
    // PAN is allowed when:
    // - no object is currently being placed
    // - OR SPACE is pressed
    //
    // This must work in Home:
    // - Plan
    // - Scale
    // - Lifestyle Areas
    // - EMF Sources
    // - normal idle/select states
    //
    // Active object placement always keeps priority.
    // ==================================================

    const activeMode =
        AppState.ui?.mode ||
        null;


    const hasActiveObjectPlacement =
        !!window.objectTool?.currentType;


    // --------------------------------------------------
    // PAN PERMISSION
    // --------------------------------------------------

    const canPan =
        spacePressed ||
        (
            !hasActiveObjectPlacement &&
            (
                !activeMode ||
                activeMode === "idle" ||
                activeMode === "select" ||
                activeMode === "sources"
            )
        );


    if (
        canPan
    ) {

        isPanning =
            true;


        if (
            S?.interaction
        ) {

            S.interaction.isPanning =
                true;
        }


        // ==================================================
        // PAN START POSITION
        // ==================================================

        panStartX =
            evt.clientX -
            (
                EMFViewport?.panX ||
                0
            );


        panStartY =
            evt.clientY -
            (
                EMFViewport?.panY ||
                0
            );


        // ==================================================
        // CURSOR
        // ==================================================

        if (
            window.canvas
        ) {

            window.canvas.style.cursor =
                "grabbing";
        }


        console.log(
            "🔥 PAN START",
            {
                mode:
                    activeMode,

                hasActiveObjectPlacement,

                spacePressed,

                panStartX,

                panStartY,

                panX:
                    EMFViewport?.panX,

                panY:
                    EMFViewport?.panY
            }
        );


        return;
    }




    // ==================================================
    // 🔥 HIDE POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "hoursPopup"
        );


    if (
        popup
    ) {

        popup.style.display =
            "none";
    }
}


function handleMouseMove(evt) {

    // ==================================================
    // CANVAS
    // ==================================================

    const canvas =
        window.canvas;

    if (
        !canvas
    ) {
        return;
    }


    // ==================================================
    // 🔥 PAN MOVE
    //
    // PAN is a viewport operation.
    // It is NOT limited to Outdoor placement.
    //
    // Object dragging has priority earlier in this
    // function, so this does not interfere with
    // Lifestyle / Indoor / Outdoor object dragging.
    // ==================================================

    if (
        isPanning
    ) {

        if (
            !window.EMFViewport
        ) {

            return;
        }


        // ----------------------------------------------
        // UPDATE VIEWPORT
        // ----------------------------------------------

        EMFViewport.panX =
            evt.clientX -
            panStartX;

        EMFViewport.panY =
            evt.clientY -
            panStartY;


        // ----------------------------------------------
        // KEEP OFFSET IN SYNC
        // ----------------------------------------------

        EMFViewport.offsetX =
            EMFViewport.panX;

        EMFViewport.offsetY =
            EMFViewport.panY;


        // ----------------------------------------------
        // CURSOR
        // ----------------------------------------------

        if (
            window.canvas
        ) {

            window.canvas.style.cursor =
                "grabbing";
        }


        // ----------------------------------------------
        // RENDER
        // ----------------------------------------------

        requestRender?.();

        return;
    }


    // ==================================================
    // WORLD POINT
    // ==================================================

    if (
        !window.EMFViewport ||
        typeof EMFViewport.canvasToWorld !==
        "function"
    ) {

        console.error(
            "❌ EMFViewport.canvasToWorld NOT AVAILABLE"
        );

        return;
    }


    const p =
        EMFViewport.canvasToWorld(
            evt,
            canvas
        );


    if (
        !p ||
        !Number.isFinite(p.x) ||
        !Number.isFinite(p.y)
    ) {

        return;
    }


    // ==================================================
    // DRAG ZONE VERTEX
    // ==================================================

    if (
        window.draggingZoneVertex &&
        AppState.ui.selectedZone &&
        window.draggedVertexIndex >= 0
    ) {

        AppState.ui.selectedZone.polygon[
            window.draggedVertexIndex
        ] = {

            x:
                p.x,

            y:
                p.y
        };


        requestRender?.();

        return;
    }


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();

    if (
        !floor
    ) {

        return;
    }







    // ==================================================
    // NORMAL DRAG
    //
    // Kept for existing Business / legacy drag behaviour.
    // It is intentionally AFTER the new object drag block.
    // ==================================================

    updateDrag?.(
        p.x,
        p.y
    );


    // ==================================================
    // MOUSE POSITION
    // ==================================================

    const x =
        p.x;

    const y =
        p.y;


    mouseX =
        x;

    mouseY =
        y;


    window.mouseX =
        x;

    window.mouseY =
        y;


    AppState.mouseX =
        x;

    AppState.mouseY =
        y;


    if (
        S?.interaction
    ) {

        S.interaction.mouseX =
            x;

        S.interaction.mouseY =
            y;
    }


    // ==================================================
    // PAN
    //
    // Existing general PAN mode.
    //
    // Outdoor placement PAN is handled at the very top
    // of this function.
    // ==================================================

    if (
        isPanning
    ) {

        if (
            spacePressed &&
            isMeasurementMode
        ) {

            canvas.style.cursor =
                "grabbing";
        }


        if (
            !window.EMFViewport
        ) {

            return;
        }


        EMFViewport.panX =
            evt.clientX -
            panStartX;

        EMFViewport.panY =
            evt.clientY -
            panStartY;


        EMFViewport.offsetX =
            EMFViewport.panX;

        EMFViewport.offsetY =
            EMFViewport.panY;


        canvas.style.cursor =
            "grabbing";


        requestRender?.();

        return;
    }


    // ==================================================
    // SOURCE DRAG
    // ==================================================

    if (
        draggingSource
    ) {

        draggingSource.x =
            p.x;

        draggingSource.y =
            p.y;


        requestRender?.();

        return;
    }


    // ==================================================
    // VERTEX EDIT
    // ==================================================

    if (
        editingVertex
    ) {

        editingVertex.point.x =
            p.x;

        editingVertex.point.y =
            p.y;


        requestRender?.();

        return;
    }


    // ==================================================
    // ROOM HOVER
    // ==================================================

    hoveredRoom =
        null;


    if (
        floor?.rooms?.length
    ) {

        for (
            const room of floor.rooms
        ) {

            if (
                !room?.polygon ||
                !room.polygon.length
            ) {

                continue;
            }


            if (
                pointInPolygon(
                    p.x,
                    p.y,
                    room.polygon
                )
            ) {

                hoveredRoom =
                    room;

                break;
            }
        }
    }


    // ==================================================
    // ZONE HOVER
    // ==================================================

    hoveredZone =
        null;


    S.hoveredZone =
        null;


    if (
        floor?.zones?.length
    ) {

        for (
            const zone of floor.zones
        ) {

            if (
                !zone?.polygon ||
                !zone.polygon.length
            ) {

                continue;
            }


            if (
                pointInPolygon(
                    p.x,
                    p.y,
                    zone.polygon
                )
            ) {

                hoveredZone =
                    zone;

                S.hoveredZone =
                    zone;

                break;
            }
        }
    }


    // ==================================================
    // GRID POINT HOVER RESET
    // ==================================================

    window.hoveredGridPoint =
        null;


    // ==================================================
    // MEASUREMENT STATE
    // ==================================================

    const mode =
        AppState?.ui?.mode ||
        "idle";


    const measurementInteraction =
        AppState?.ui?.measurementInteraction ||
        "inactive";


    const isMeasurementMode =
        mode === "measure" ||
        mode === "roomMeasure" ||
        mode === "zoneMeasure";


    const isZoneMode =
        mode === "zoneMeasure";


    // ==================================================
    // MEASUREMENT GRID HOVER
    // ==================================================

    if (
        isMeasurementMode
    ) {

        // ==================================================
        // ZONE MEASUREMENT
        // ==================================================

        if (
            isZoneMode
        ) {

            const zones =
                floor?.zones ||
                [];


            for (
                const zone of zones
            ) {

                const grid =
                    Array.isArray(
                        zone?.grid
                    )
                        ? zone.grid
                        : [];


                for (
                    const point of grid
                ) {

                    const dx =
                        point.x -
                        p.x;

                    const dy =
                        point.y -
                        p.y;


                    const dist =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        dist < 20
                    ) {

                        window.hoveredGridPoint =
                            point;


                        canvas.style.cursor =
                            "pointer";


                        requestRender?.();

                        return;
                    }
                }
            }
        }


        // ==================================================
        // ROOM MEASUREMENT
        // ==================================================

        else {

            const rooms =
                floor?.rooms ||
                [];


            for (
                const room of rooms
            ) {

                const grid =
                    Array.isArray(
                        room?.grid
                    )
                        ? room.grid
                        : [];


                for (
                    const point of grid
                ) {

                    if (
                        point?.disabledByZone
                    ) {

                        continue;
                    }


                    const dx =
                        point.x -
                        p.x;

                    const dy =
                        point.y -
                        p.y;


                    const dist =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        dist < 20
                    ) {

                        window.hoveredGridPoint =
                            point;


                        canvas.style.cursor =
                            "pointer";


                        requestRender?.();

                        return;
                    }
                }
            }
        }


        // ==================================================
        // NO MEASUREMENT POINT
        // ==================================================

        if (
            measurementInteraction ===
            "awaitingPoint"
        ) {

            canvas.style.cursor =
                "crosshair";
        }

        else {

            canvas.style.cursor =
                "default";
        }


        requestRender?.();

        return;
    }


    // ==================================================
    // NORMAL BUSINESS / OBJECT HOVER
    // ==================================================

    const hoverObject =
        window.getObjectAtPoint?.(
            p
        );


    if (
        hoverObject
    ) {

        canvas.style.cursor =
            "grab";
    }

    else {

        canvas.style.cursor =
            "default";
    }


    // ==================================================
    // HOVER SOURCE ID
    // ==================================================

    AppState.ui.hoveredSourceId =
        hoverObject?.id ||
        null;


    // ==================================================
    // 🔥 OBJECT DRAG
    // ==================================================

    if (
        window.objectTool?.draggingObject
    ) {

        const currentFloor =
            AppState.project
                ?.floors?.[
            AppState.project
                ?.currentFloorIndex
            ];


        if (
            !currentFloor
        ) {

            return;
        }


        // ==================================================
        // FLOOR OBJECTS
        // ==================================================

        const floorObjects = [

            ...(currentFloor.zones || []),

            ...(currentFloor.sources || [])

        ];


        // ==================================================
        // PROPERTY OUTDOOR OBJECTS
        // ==================================================

        const outdoorSources =
            Array.isArray(
                AppState.project
                    ?.outdoorSources
            )
                ? AppState.project
                    .outdoorSources
                : [];


        // ==================================================
        // ALL OBJECTS
        // ==================================================

        const allObjects = [

            ...floorObjects,

            ...outdoorSources

        ];


        // ==================================================
        // SELECTED OBJECT
        // ==================================================

        const selectedObject =
            allObjects.find(
                object =>
                    object?.id ===
                    window.objectTool
                        .selectedObjectId
            );


        if (
            !selectedObject
        ) {

            return;
        }


        // ==================================================
        // OUTDOOR?
        // ==================================================

        const isOutdoor =
            window.OUTDOOR_SOURCE_TYPES?.includes(
                selectedObject.type
            ) ||

            selectedObject.placementType ===
            "outdoor";


        // ==================================================
        // OUTDOOR BOUNDARY
        // ==================================================
        //
        // Outdoor Source may move anywhere around
        // the floor plan.
        //
        // It must never enter the actual floor-plan
        // image.
        //
        // NO outdoorBounds()
        // NO artificial 20% perimeter.
        //
        // ==================================================

        if (
            isOutdoor
        ) {

            const screenPoint =
                typeof EMFViewport?.worldPoint ===
                    "function"

                    ? EMFViewport.worldPoint(
                        p
                    )

                    : null;


            const planBounds =
                typeof EMFViewport?.planBounds ===
                    "function"

                    ? EMFViewport.planBounds()

                    : null;


            const insidePlan =
                !!screenPoint &&
                !!planBounds &&

                screenPoint.x >=
                planBounds.left &&

                screenPoint.x <=
                planBounds.right &&

                screenPoint.y >=
                planBounds.top &&

                screenPoint.y <=
                planBounds.bottom;


            if (
                insidePlan
            ) {

                return;
            }
        }


        // ==================================================
        // MOVE
        // ==================================================

        selectedObject.x =
            p.x;

        selectedObject.y =
            p.y;


        // ==================================================
        // OUTDOOR CONTEXT
        // ==================================================

        if (
            isOutdoor
        ) {

            window.refreshOutdoorLifestyleLinks?.();
        }


        requestRender?.();
    }

}



function handleClick(evt) {

    console.log(
        "HANDLE CLICK RUNNING"
    );

    console.log(
        "CLICK MODE:",
        AppState.ui.mode
    );



    // =====================
    // 🔥 MOUSE POSITION
    // =====================

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;

    const x =
        (evt.clientX - rect.left) *
        scaleX;

    const y =
        (evt.clientY - rect.top) *
        scaleY;

    console.error("=========== MOUSE DEBUG ===========");

    console.error(
        "IMAGE:",
        window.planImage?.width,
        window.planImage?.height
    );

    console.error(
        "CANVAS:",
        canvas.width,
        canvas.height
    );

    console.error(
        "RECT:",
        rect.width,
        rect.height
    );

    console.error(
        "scaleX:",
        scaleX,
        "scaleY:",
        scaleY
    );

    console.error(
        "MOUSE:",
        x,
        y
    );

    console.error("==================================");

    // =====================
    // 🔥 SCALE
    // =====================

    if (
        AppState.ui.mode ===
        "scale"
    ) {

        handleScaleClick?.(
            evt
        );

        requestRender?.();

        return;
    }

    // =====================
    // 🔥 SCALE OBJECT
    // =====================

    if (
        AppState.ui.mode ===
        "scale_object"
    ) {

        handleScaleObjectClick?.(
            evt
        );

        requestRender?.();

        return;
    }

    // =====================
    // 🔥 ROOM
    // =====================

    if (
        AppState.ui.mode ===
        "rooms"
    ) {

        console.log(
            "ROOM CLICK"
        );

        console.trace(
            "ROOM CLICK TRACE"
        );

        handleRoomToolClick?.(
            evt
        );

        requestRender?.();

        return;
    }

    // =====================
    // 🔥 MEASURE
    // =====================

    if (
        AppState.ui.mode ===
        "measure"
    ) {



        // measure logic čia

        return;
    }


    // =====================
    // 🔥 SOURCE
    // =====================

    if (
        AppState.ui.mode ===
        "source"
    ) {

        handleSourceClick?.(
            evt
        );

        requestRender?.();

        return;
    }

    // =====================
    // 🔥 NO FLOOR SAFE
    // =====================

    if (!floor) {

        console.warn(
            "NO FLOOR"
        );

        return;
    }


}


function getZoneContainingPoint(
    point,
    floor
) {

    if (
        !point ||
        !floor
    ) {

        return null;
    }


    const zones =
        Array.isArray(
            floor.zones
        )
            ? floor.zones
            : [];


    for (
        const zone of zones
    ) {

        if (
            !Array.isArray(
                zone.polygon
            ) ||
            zone.polygon.length < 3
        ) {

            continue;
        }


        const inside =
            pointInPolygon(
                {
                    x: point.x,
                    y: point.y
                },
                zone.polygon
            );


        if (inside) {

            return zone;
        }
    }


    return null;
}

// =====================
// 🔥 SOURCE EDIT
// =====================

function handleSourceDoubleClick(
    evt
) {

    const p =
        getCanvasPoint(evt);

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }


    for (
        const s of floor.sources || []
    ) {

        const d =
            Math.hypot(
                p.x - s.x,
                p.y - s.y
            );


        if (
            d < 22
        ) {

            // ==================================================
            // 🔥 BUSINESS
            //
            // Business uses the new unified
            // Business Source popup for both
            // Indoor and Outdoor sources.
            // ==================================================

            if (
                window.AppMode?.current ===
                "business"
            ) {

                window.lastPlacedSource =
                    s;

                window.activePopupSource =
                    s;

                closeIndoorDistancePopup?.();

                closeSourcePopup?.();

                closeOutdoorSourcePopup?.();

                showBusinessSourcePopup?.(
                    s
                );

                return;
            }


            // ==================================================
            // 🔥 HOME
            //
            // Preserve existing Home behaviour.
            // ==================================================

            const isIndoor =

                window.INDOOR_SOURCE_TYPES
                    ?.includes(
                        s.type
                    );


            if (
                isIndoor
            ) {

                showIndoorDistancePopup?.(
                    s
                );

            }

            else {

                showOutdoorSourcePopup?.(
                    s
                );
            }


            return;
        }
    }
}

window.handleSourceDoubleClick =
    handleSourceDoubleClick;

// =====================
// 🔥 DELETE SELECTED
// =====================

document.addEventListener(
    "keydown",
    evt => {

        if (
            evt.key !== "Delete"
        ) {
            return;
        }

        const selectedId =

            window.objectTool
                ?.selectedObjectId;

        if (!selectedId) {
            return;
        }

        const floor =
            getCurrentFloor?.();

        if (!floor) {
            return;
        }

        floor.sources =

            floor.sources.filter(

                s =>
                    s.id !== selectedId

            );

        window.objectTool
            .selectedObjectId =
            null;

        saveProject?.();

        requestRender?.();
    }
);

// ==================================================
// 🔥 ESC → CLEAR VIEW-ONLY SOURCE FOCUS
// ==================================================

document.addEventListener(
    "keydown",
    evt => {

        if (
            evt.key !== "Escape"
        ) {
            return;
        }


        // Only handle Escape when
        // a view-only source is focused.

        if (
            !window.viewingSourceId
        ) {
            return;
        }


        evt.preventDefault();
        evt.stopPropagation();


        window.clearSourceFocus?.();
    }
);

// ==================================================
// SPACE → TEMPORARY PAN MODE
// ==================================================

window.addEventListener(
    "keydown",
    evt => {

        if (
            evt.code !== "Space"
        ) {

            return;
        }


        // Prevent page scrolling
        evt.preventDefault();


        spacePressed =
            true;


        // Update cursor immediately
        if (
            window.canvas
        ) {

            window.canvas.style.cursor =
                "grab";
        }
    }
);


window.addEventListener(
    "keyup",
    evt => {

        if (
            evt.code !== "Space"
        ) {

            return;
        }


        evt.preventDefault();


        spacePressed =
            false;


        // Restore measurement cursor
        const mode =
            AppState?.ui?.mode ||
            "idle";

        const interaction =
            AppState?.ui
                ?.measurementInteraction ||
            "inactive";


        if (
            mode === "measure" ||
            mode === "roomMeasure" ||
            mode === "zoneMeasure"
        ) {

            if (
                interaction ===
                "awaitingPoint"
            ) {

                window.canvas.style.cursor =
                    "crosshair";

            }

            else {

                window.canvas.style.cursor =
                    "default";
            }
        }

        else {

            window.canvas.style.cursor =
                "default";
        }
    }
);


function handleMouseUp() {

    // ==================================================
    // REMEMBER INTERACTION STATE BEFORE RESET
    // ==================================================

    const wasDraggingObject =
        !!window.objectTool?.draggingObject;

    const wasDraggingSource =
        !!draggingSource;


    // =====================
    // STOP ZONE DRAG
    // =====================

    if (
        window.draggingZoneVertex
    ) {

        window.draggingZoneVertex =
            false;

        window.draggedVertexIndex =
            -1;


        const zone =
            AppState.ui.selectedZone;


        generateZoneGrid?.(
            zone
        );


        saveProject?.();

        requestRender?.();

        return;
    }


    // =====================
    // OBJECT DRAG
    // =====================

    if (
        window.objectTool
    ) {

        window.objectTool
            .draggingObject =
            false;
    }


    // ==================================================
    // SAVE AFTER OBJECT DRAG
    //
    // This includes:
    //
    // - Lifestyle Area movement
    // - Indoor Source movement
    // - Property-level Outdoor Source movement
    //
    // PAN does NOT trigger save.
    // ==================================================

    if (
        wasDraggingObject ||
        wasDraggingSource
    ) {

        saveProject?.();
    }


    // =====================
    // NORMAL DRAG STATE
    // =====================

    stopDrag?.();


    // =====================
    // PAN
    // =====================

    isPanning =
        false;


    if (
        S?.interaction
    ) {

        S.interaction.isPanning =
            false;
    }


    // =====================
    // SOURCE DRAG
    // =====================

    draggingSource =
        null;


    if (
        S?.interaction
    ) {

        S.interaction.draggingSource =
            null;
    }


    // =====================
    // VERTEX EDIT
    // =====================

    editingVertex =
        null;


    if (
        S?.interaction
    ) {

        S.interaction.editingVertex =
            null;
    }


    // =====================
    // CURSOR
    // =====================

    if (
        window.canvas
    ) {

        window.canvas.style.cursor =
            "default";
    }


    // =====================
    // SYNC
    // =====================

    if (
        typeof syncState ===
        "function"
    ) {

        syncState();
    }


    // =====================
    // RENDER
    // =====================

    requestRender?.();
}


window.handleClick =
    handleClick;

window.handleMouseDown =
    handleMouseDown;

window.handleMouseMove =
    handleMouseMove;

window.handleMouseUp =
    handleMouseUp;