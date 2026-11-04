window.objectTool = {

    active: false,

    currentType: null,

    objects: [],

    editingHoursId: null,

    // =====================
    // ðŸ”¥ INTERACTION
    // =====================

    selectedObjectId: null,

    selectedToolbarAction: null,

    draggingObject: false
};

/// =====================
// ðŸ”¥ OBJECT IMAGES
// =====================

const OBJECT_IMAGES = {};

// =====================
// ðŸ”¥ OBJECT CONFIGS
// =====================

window.OBJECT_CONFIGS = {

    [OBJECT_TYPES.BED]: {

        label: "Bed",

        image:
            "assets/icons/bed.png",

        width: 52,

        height: 52,

        color: "#3b82f6",

        radius: 90,

        risk: 0,

        defaultHours: 8,

        zoneType: "sleep",
    },

    [OBJECT_TYPES.WORK_AREA]: {

        label: "Work Desk",

        image:
            "assets/icons/work.png",

        width: 42,

        height: 42,

        color: "#8b5cf6",

        radius: 70,

        risk: 0,

        defaultHours: 6,

        zoneType: "work",
    },

    [OBJECT_TYPES.SOFA]: {

        label: "Relax Area",

        image:
            "assets/icons/sofa.png",

        width: 52,

        height: 52,

        color: "#f59e0b",

        radius: 100,

        risk: 0,

        defaultHours: 4,

        zoneType: "relax",
    },

    [OBJECT_TYPES.CHILD_AREA]: {

        label: "Child Area",

        image:
            "assets/icons/child.png",

        width: 52,

        height: 52,

        color: "#ec4899",

        radius: 90,

        risk: 0,

        defaultHours: 6,

        zoneType: "child",
    },

    [OBJECT_TYPES.WIFI_ROUTER]: {

        label: "WiFi Router",

        image:
            "assets/icons/routerwifi.png",

        width: 42,

        height: 42,

        color: "#ef4444",

        radius: 110,

        risk: 8,
    },

    [OBJECT_TYPES.ELECTRICAL_PANEL]: {

        label: "Electrical Panel",

        image:
            "assets/icons/electricalpanel.png",

        width: 42,

        height: 42,

        color: "#f59e0b",

        radius: 90,

        risk: 12,

        placementType:
            "indoor",
    },

    [OBJECT_TYPES.MOBILE_TOWER]: {

        label: "Mobile Tower",

        image:
            "assets/icons/mobiletowerrf.png",

        width: 48,

        height: 48,

        color: "#dc2626",

        radius: 170,

        risk: 16,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.SOLAR_INVERTER]: {

        label: "Solar Inverter",

        image:
            "assets/icons/solarpanel.png",

        width: 48,

        height: 48,

        color: "#10b981",

        radius: 85,

        risk: 2,

        placementType:
            "outdoor",
    },

    // ==================================================
    // ðŸ”¥ LEGACY SOURCE ALIAS
    // ==================================================
    //
    // Existing saved projects may contain
    // type: "solar" instead of "solar_inverter".
    // Keep both identifiers supported.
    //

    solar: {

        label:
            "Solar Inverter",

        image:
            "assets/icons/solarpanel.png",

        width:
            48,

        height:
            48,

        color:
            "#10b981",

        radius:
            85,

        risk:
            2,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.EV_CHARGER]: {

        label: "EV Charger",

        image:
            "assets/icons/evstation.png",

        width: 48,

        height: 48,

        color: "#14b8a6",

        radius: 95,

        risk: 4,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.SMART_METER]: {

        label: "Smart Meter",

        image:
            "assets/icons/smartmeter.png",

        width: 46,

        height: 46,

        color: "#f97316",

        radius: 120,

        risk: 10,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.BLUETOOTH]: {

        label: "Bluetooth",

        image:
            "assets/icons/bluetooth.png",

        width: 42,

        height: 42,

        color: "#8b5cf6",

        radius: 80,

        risk: 4,

        placementType:
            "indoor",
    },

    [OBJECT_TYPES.HEAT_PUMP]: {

        label: "Heat Pump",

        image:
            "assets/icons/heatpump.png",

        width: 42,

        height: 42,

        color: "#06b6d4",

        radius: 95,

        risk: 2,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.BATTERY_STORAGE]: {

        label: "Battery Storage",

        image:
            "assets/icons/batterystorage.png",

        width: 42,

        height: 42,

        color: "#22c55e",

        radius: 110,

        risk: 3,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.HIGH_VOLTAGE_LINE]: {

        label: "High Voltage Line",

        image:
            "assets/icons/highvoltageline.png",

        width: 54,

        height: 54,

        color: "#7c3aed",

        radius: 240,

        risk: 18,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.POWER_LINES]: {

        label: "Power Lines",

        image:
            "assets/icons/powerlines.png",

        width: 56,

        height: 56,

        color: "#f59e0b",

        radius: 220,

        risk: 12,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.ELECTRICAL_SUBSTATION]: {

        label: "Electrical Substation",

        image:
            "assets/icons/electricsubstation.png",

        width: 58,

        height: 58,

        color: "#ef4444",

        radius: 220,

        risk: 20,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.GENERATOR]: {

        label: "Generator",

        image:
            "assets/icons/generator.png",

        width: 46,

        height: 46,

        color: "#f97316",

        radius: 130,

        risk: 8,

        placementType:
            "outdoor",
    },

    [OBJECT_TYPES.WIND_TURBINE]: {

        label: "Wind Turbine",

        image:
            "assets/icons/windturbine.png",

        width: 58,

        height: 58,

        color: "#0ea5e9",

        radius: 260,

        risk: 6,

        placementType:
            "outdoor",
    },
};



// ==================================================
// SOURCE TYPE ALIASES
// ==================================================
//
// Stored source types must resolve to the same
// configs used by the source renderer / hit-test.
//

OBJECT_CONFIGS["battery"] =
    OBJECT_CONFIGS[
    OBJECT_TYPES.BATTERY_STORAGE
    ];

OBJECT_CONFIGS["battery_storage"] =
    OBJECT_CONFIGS[
    OBJECT_TYPES.BATTERY_STORAGE
    ];


OBJECT_CONFIGS["substation"] =
    OBJECT_CONFIGS[
    OBJECT_TYPES.ELECTRICAL_SUBSTATION
    ];

OBJECT_CONFIGS["electrical_substation"] =
    OBJECT_CONFIGS[
    OBJECT_TYPES.ELECTRICAL_SUBSTATION
    ];

// =====================
// ðŸ”¥ PRELOAD IMAGES
// =====================

Object.entries(
    OBJECT_TYPES
).forEach(([key, meta]) => {

    const img =
        new Image();

    img.src =
        meta.image;

    img.onerror = () => {

        console.log(
            "IMAGE FAILED"
        );
    };

    OBJECT_IMAGES[key] =
        img;
});



// ==================================================
// ðŸ”¥ START OBJECT PLACEMENT
// ==================================================

function startObjectPlacement(
    type
) {

    console.log(
        "START OBJECT",
        type
    );


    // ==================================================
    // OBJECT CONFIG
    // ==================================================

    const configs =
        (
            typeof OBJECT_CONFIGS !==
                "undefined"

                ? OBJECT_CONFIGS

                : window.OBJECT_CONFIGS
        ) || {};


    const meta =
        configs?.[type];


    // ==================================================
    // CLASSIFICATION
    // ==================================================
    //
    // Lifestyle Area:
    //   identified by meta.zoneType
    //
    // Outdoor Source:
    //   identified by OUTDOOR_SOURCE_TYPES
    //   OR config placementType === "outdoor"
    //
    // Indoor Source:
    //   identified by INDOOR_SOURCE_TYPES
    //   OR config placementType === "indoor"
    //
    // ==================================================

    const isLifestyle =
        !!meta?.zoneType;


    const isOutdoor =
        window.OUTDOOR_SOURCE_TYPES?.includes(
            type
        ) ||
        meta?.placementType ===
        "outdoor";


    const isIndoor =
        window.INDOOR_SOURCE_TYPES?.includes(
            type
        ) ||
        meta?.placementType ===
        "indoor";


    // ==================================================
    // SAFETY
    // ==================================================

    if (
        !isLifestyle &&
        !isOutdoor &&
        !isIndoor
    ) {

        console.warn(
            "âŒ UNKNOWN OBJECT PLACEMENT TYPE",
            {
                type,
                meta,
                isLifestyle,
                isOutdoor,
                isIndoor
            }
        );

        return;
    }


    // ==================================================
    // DETERMINE PLACEMENT TYPE
    // ==================================================

    let placementType =
        "indoor";


    if (
        isLifestyle
    ) {

        placementType =
            "zone";

    }

    else if (
        isOutdoor
    ) {

        placementType =
            "outdoor";

    }

    else if (
        isIndoor
    ) {

        placementType =
            "indoor";
    }


    // ==================================================
    // OBJECT TOOL SAFETY
    // ==================================================

    if (
        !window.objectTool
    ) {

        window.objectTool = {

            currentType:
                null,

            placementType:
                null,

            showOutdoorGuide:
                false
        };
    }


    // ==================================================
    // PLACEMENT STATE
    // ==================================================

    window.objectTool.currentType =
        type;

    window.objectTool.placementType =
        placementType;

    window.objectTool.showOutdoorGuide =
        placementType ===
        "outdoor";


    // ==================================================
    // CLEAR PREVIOUS SELECTION
    // ==================================================

    window.objectTool.selectedObjectId =
        null;

    window.lastPlacedObject =
        null;

    window.lastPlacedSource =
        null;

    window.activePopupSource =
        null;

    window.selectedOutdoorSource =
        null;


    // ==================================================
    // CLOSE OLD POPUPS
    // ==================================================

    if (
        typeof closeIndoorDistancePopup ===
        "function"
    ) {

        closeIndoorDistancePopup();
    }

    if (
        typeof closeOutdoorSourcePopup ===
        "function"
    ) {

        closeOutdoorSourcePopup();
    }


    // ==================================================
    // STATUS
    // ==================================================

    const status =
        document.getElementById(
            "statusText"
        );


    if (
        status
    ) {

        if (
            placementType ===
            "zone"
        ) {

            status.innerText =
                "Click on the floor plan to place Lifestyle Area.";

        }

        else if (
            placementType ===
            "outdoor"
        ) {

            status.innerText =
                "Click outside the floor plan to place outdoor source.";

        }

        else {

            status.innerText =
                "Click on the floor plan to place source.";
        }
    }


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "ðŸ”¥ CURRENT OBJECT PLACEMENT",
        {
            type,
            placementType,
            zoneType:
                meta?.zoneType ||
                null,
            meta,
            isLifestyle,
            isOutdoor,
            isIndoor,
            showOutdoorGuide:
                window.objectTool
                    .showOutdoorGuide
        }
    );


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();
}

function findNearestLifestyleZoneForOutdoor(
    source,
    floor = null
) {

    // ==================================================
    // CURRENT FLOOR
    //
    // IMPORTANT:
    //
    // Outdoor Source is Property-level.
    // Therefore the floor must be supplied explicitly
    // when calculating contextual relationships.
    //
    // Fallback to current floor is kept for compatibility
    // with existing calls during this refactor.
    // ==================================================

    const targetFloor =
        floor ||
        getCurrentFloor?.();


    console.log(
        "ðŸ”¥ OUTDOOR CONTEXT INPUT",
        {
            floorFound:
                !!targetFloor,

            floorId:
                targetFloor?.id ||
                null,

            zoneCount:
                targetFloor?.zones?.length ||
                0,

            source: {
                id:
                    source?.id,

                type:
                    source?.type,

                x:
                    source?.x,

                y:
                    source?.y
            }
        }
    );


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !targetFloor ||
        !source ||
        !Array.isArray(
            targetFloor.zones
        ) ||
        targetFloor.zones.length === 0
    ) {

        return null;
    }


    // ==================================================
    // SOURCE POSITION
    //
    // Outdoor position is contextual only.
    // It must NOT be converted to metres.
    // ==================================================

    const sourceX =
        Number(
            source.x
        );

    const sourceY =
        Number(
            source.y
        );


    if (
        !Number.isFinite(
            sourceX
        ) ||
        !Number.isFinite(
            sourceY
        )
    ) {

        console.warn(
            "âš ï¸ OUTDOOR CONTEXT: INVALID SOURCE POSITION",
            {
                sourceId:
                    source?.id,

                x:
                    source?.x,

                y:
                    source?.y
            }
        );

        return null;
    }


    // ==================================================
    // FIND NEAREST LIFESTYLE AREA
    //
    // Home Lifestyle Areas may currently be represented
    // as point-like objects with x/y.
    //
    // Do NOT require polygon geometry here.
    // ==================================================

    let nearestZone =
        null;

    let nearestDistance =
        Infinity;


    for (
        const zone of targetFloor.zones
    ) {

        if (
            !zone
        ) {

            continue;
        }


        const zoneX =
            Number(
                zone.x
            );

        const zoneY =
            Number(
                zone.y
            );




        // ==================================================
        // INVALID LIFESTYLE AREA
        // ==================================================

        if (
            !Number.isFinite(
                zoneX
            ) ||
            !Number.isFinite(
                zoneY
            )
        ) {



            continue;
        }


        // ==================================================
        // CONTEXTUAL DISTANCE
        //
        // IMPORTANT:
        //
        // This is canvas/world spatial relevance only.
        // It is NOT metres.
        // It is NOT outdoor geographic distance.
        // It is NOT Risk.
        // ==================================================

        const distance =
            Math.hypot(
                sourceX -
                zoneX,

                sourceY -
                zoneY
            );




        if (
            distance <
            nearestDistance
        ) {

            nearestDistance =
                distance;

            nearestZone =
                zone;
        }
    }


    // ==================================================
    // RESULT
    // ==================================================

    console.log(
        "ðŸ”¥ OUTDOOR NEAREST LIFESTYLE AREA",
        {
            sourceId:
                source?.id,

            sourceType:
                source?.type,

            floorId:
                targetFloor?.id,

            zoneId:
                nearestZone?.id ||
                null,

            zoneType:
                nearestZone?.type ||
                null,

            contextualDistance:
                Number.isFinite(
                    nearestDistance
                )
                    ? nearestDistance
                    : null
        }
    );


    return nearestZone;
}


// ==================================================
// ðŸ”¥ REFRESH OUTDOOR â†’ LIFESTYLE CONTEXT
// ==================================================
//
// Outdoor Sources are Property-level entities.
//
// They are NOT stored on floor.sources.
//
// The relationship to Lifestyle Areas is derived
// separately for each floor.
//
// IMPORTANT:
// - never write source.linkedZoneIds
// - never move Outdoor Source into floor.sources
// - never create a permanent floor ownership link
//
// ==================================================

// ==================================================
// ðŸ”¥ REFRESH OUTDOOR â†’ LIFESTYLE RELATIONSHIPS
// ==================================================
//
// Outdoor Sources are Property-level entities.
//
// They are stored once in:
//     AppState.project.outdoorSources
//
// Each floor receives its own DERIVED contextual
// relationship to the Lifestyle Areas on that floor.
//
// The relationship is NOT stored on the Outdoor Source
// as permanent linkedZoneIds.
// ==================================================

function refreshOutdoorLifestyleLinks(
    targetFloor = null
) {

    const project =
        AppState?.project;


    if (
        !project
    ) {

        return [];
    }


    const floors =
        Array.isArray(
            project.floors
        )
            ? project.floors
            : [];


    const outdoorSources =
        Array.isArray(
            project.outdoorSources
        )
            ? project.outdoorSources
            : [];


    // ==================================================
    // TARGET FLOORS
    // ==================================================

    const targetFloors =
        targetFloor
            ? [targetFloor]
            : floors;


    const allRelationships =
        [];


    // ==================================================
    // CALCULATE RELATIONSHIP PER FLOOR
    // ==================================================

    targetFloors.forEach(
        floor => {

            if (
                !floor
            ) {

                return;
            }


            const zones =
                Array.isArray(
                    floor.zones
                )
                    ? floor.zones
                    : [];


            const relationships =
                [];


            // ------------------------------------------------
            // No Lifestyle Areas on this floor.
            // ------------------------------------------------

            if (
                zones.length === 0
            ) {

                floor.outdoorSourceRelationships =
                    [];

                return;
            }


            // ------------------------------------------------
            // Every Property Outdoor Source
            // gets a contextual relationship.
            // ------------------------------------------------

            outdoorSources.forEach(
                source => {

                    if (
                        !source ||
                        !source.id
                    ) {

                        return;
                    }


                    const nearestZone =
                        findNearestLifestyleZoneForOutdoor(
                            source,
                            floor
                        );


                    if (
                        !nearestZone
                    ) {

                        return;
                    }


                    const relationship = {

                        sourceId:
                            source.id,

                        floorId:
                            floor.id,

                        targetAreaId:
                            nearestZone.id,

                        targetAreaType:
                            "lifestyle",

                        spatialRelationship:
                            "nearest_lifestyle_area",

                        distanceBasis:
                            "canvas_context",

                        spatialConfidence:
                            source.spatialConfidence ||
                            "approximate"
                    };


                    relationships.push(
                        relationship
                    );


                    allRelationships.push(
                        relationship
                    );
                }
            );


            // ==================================================
            // STORE DERIVED FLOOR CONTEXT
            // ==================================================

            floor.outdoorSourceRelationships =
                relationships;


            console.log(
                "ðŸ”¥ OUTDOOR â†’ LIFESTYLE RELATIONSHIPS",
                {
                    floorId:
                        floor.id,

                    outdoorSources:
                        outdoorSources.length,

                    lifestyleAreas:
                        zones.length,

                    relationships
                }
            );
        }
    );


    return allRelationships;
}

window.refreshOutdoorLifestyleLinks =
    refreshOutdoorLifestyleLinks;





function placeObject(evt) {

    const tool =
        window.objectTool;

    if (
        !tool ||
        !tool.currentType
    ) {
        return;
    }


    const type =
        tool.currentType;

    const meta =
        window.OBJECT_CONFIGS?.[type] ||
        {};


    const currentFloor =
        getCurrentFloor?.();

    if (
        !currentFloor
    ) {
        console.warn(
            "âš ï¸ PLACE OBJECT: NO CURRENT FLOOR"
        );

        return;
    }


    const p =
        getCanvasPoint(evt);


    // ==================================================
    // OBJECT CLASSIFICATION
    // ==================================================

    const isLifestyle =
        !!meta?.zoneType;

    const isOutdoor =
        window.OUTDOOR_SOURCE_TYPES?.includes(
            type
        );

    const isIndoor =
        window.INDOOR_SOURCE_TYPES?.includes(
            type
        );


    console.log(
        "ðŸ”¥ PLACE OBJECT",
        {
            type,
            isLifestyle,
            isOutdoor,
            isIndoor,
            floorId:
                currentFloor.id ||
                null,
            worldPoint:
                p
        }
    );


    // ==================================================
    // BASIC OBJECT
    // ==================================================

    const newObject = {

        id:
            `object_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        type:
            type,

        objectType:
            type,

        x:
            p.x,

        y:
            p.y,

        floorIndex:
            AppState.project?.currentFloorIndex ??
            0,

        linkedZoneIds:
            [],

        distanceCategory:
            null,

        exactDistance:
            null,

        distancePreset:
            null,

        direction:
            null,

        placementMode:
            isOutdoor
                ? "outdoor"
                : (
                    isLifestyle
                        ? "zone"
                        : "indoor"
                ),

        placementType:
            isOutdoor
                ? "outdoor"
                : (
                    isLifestyle
                        ? "zone"
                        : "indoor"
                ),

        zoneType:
            meta?.zoneType ||
            null,

        // Home Wellness — selected Lifestyle dimensions
        ...(isLifestyle &&
            window.AppMode?.current === "home" &&
            window.objectTool?.pendingLifestyleDimensions
            ? {
                lifestylePreset:
                    window.objectTool.pendingLifestyleDimensions.presetKey,

                lifestylePresetLabel:
                    window.objectTool.pendingLifestyleDimensions.presetLabel,

                lifestylePresetImage:
                    window.objectTool.pendingLifestyleDimensions.presetImage,

                furnitureDimensions: {
                    width:
                        window.objectTool.pendingLifestyleDimensions.furnitureWidth,

                    depth:
                        window.objectTool.pendingLifestyleDimensions.furnitureDepth
                },

                measurementZoneDimensions: {
                    width:
                        window.objectTool.pendingLifestyleDimensions.measurementZoneWidth,

                    depth:
                        window.objectTool.pendingLifestyleDimensions.measurementZoneDepth
                }
            }
            : {}),

        state:
            "placed",

        hours:
            null,

        hoursConfirmed:
            false,

        isPreviewUnlocked:
            false
    };


    // ==================================================
    // LIFESTYLE AREA
    // ==================================================

    if (
        isLifestyle
    ) {

        const screenPoint =
            typeof EMFViewport?.worldPoint === "function"
                ? EMFViewport.worldPoint(
                    p
                )
                : null;

        const planBounds =
            typeof EMFViewport?.planBounds === "function"
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
            !insidePlan
        ) {

            console.warn(
                "âš ï¸ LIFESTYLE AREA MUST BE INSIDE FLOOR PLAN"
            );

            return;
        }


        currentFloor.zones =
            Array.isArray(
                currentFloor.zones
            )
                ? currentFloor.zones
                : [];


        currentFloor.zones.push(
            newObject
        );

        // HOME WELLNESS — generate guided measurement points
        if (window.AppMode?.current === "home") {

            const generatePoints =
                window.HomeMeasurements?.generateLifestyleMeasurementPoints;

            console.log("[HOME ZONE] Measurement point generator", {
                available: typeof generatePoints === "function",
                zoneId: newObject.id,
                x: newObject.x,
                y: newObject.y,
                dimensions: newObject.measurementZoneDimensions,
                scale: currentFloor.currentScale
            });

            newObject.measurementPoints =
                typeof generatePoints === "function"
                    ? generatePoints(newObject, currentFloor)
                    : [];

            console.log("[HOME ZONE] Measurement points created", {
                zoneId: newObject.id,
                count: newObject.measurementPoints.length,
                points: newObject.measurementPoints
            });
        }
        console.log(
            "🔥 LIFESTYLE AREA ADDED",
            {
                id:
                    newObject.id,

                type:
                    newObject.type,

                floorId:
                    currentFloor.id
            }
        );


        // --------------------------------------------------
        // Refresh Property Outdoor Source context
        // for this floor.
        // --------------------------------------------------

        window.refreshOutdoorLifestyleLinks?.(
            currentFloor
        );

        // --------------------------------------------------
        // ðŸ”¥ REFRESH HOME WORKFLOW LOCKS
        //
        // Lifestyle Area now exists on the current floor.
        // This must immediately unlock EMF Sources.
        // --------------------------------------------------

        window.updateHomeLocks?.();

        window.updateHomeSidebarStatus?.();

        renderHomeFloorTabs?.();

        window.updateWorkflowUI?.();

        window.updateFlow?.();


        // --------------------------------------------------
        // Existing Home behaviour
        // --------------------------------------------------

        newObject.isPreviewUnlocked =
            true;


        tool.currentType =
            null;

        tool.placementType =
            null;

        tool.showOutdoorGuide =
            false;

        // Clear pending Home Lifestyle dimensions after successful placement.
        if (
            window.AppMode?.current === "home" &&
            tool.pendingLifestyleDimensions
        ) {
            tool.pendingLifestyleDimensions = null;
        }


        window.lastPlacedObject =
            newObject;


        if (
            typeof saveProject === "function"
        ) {
            saveProject();
        }


        requestRender?.();

        return;
    }


    // ==================================================
    // OUTDOOR SOURCE
    // ==================================================

    if (
        isOutdoor
    ) {

        const screenPoint =
            typeof EMFViewport?.worldPoint === "function"
                ? EMFViewport.worldPoint(
                    p
                )
                : null;

        const planBounds =
            typeof EMFViewport?.planBounds === "function"
                ? EMFViewport.planBounds()
                : null;


        // --------------------------------------------------
        // Outdoor Source may be placed anywhere outside
        // the actual floor-plan image.
        //
        // There is intentionally NO outdoorBounds()
        // restriction here.
        // --------------------------------------------------

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

            console.warn(
                "âš ï¸ OUTDOOR SOURCE MUST BE OUTSIDE FLOOR PLAN"
            );

            return;
        }


        // --------------------------------------------------
        // Property-level canonical storage
        // --------------------------------------------------

        AppState.project.outdoorSources =
            Array.isArray(
                AppState.project.outdoorSources
            )
                ? AppState.project.outdoorSources
                : [];


        // --------------------------------------------------
        // Outdoor Source is approximate spatial context.
        // It must NOT imply exact geographic distance.
        // --------------------------------------------------

        newObject.spatialConfidence =
            "approximate";

        newObject.distanceBasis =
            "user_estimated";

        newObject.exactDistance =
            null;


        AppState.project.outdoorSources.push(
            newObject
        );


        console.log(
            "ðŸ”¥ PROPERTY OUTDOOR SOURCE ADDED",
            {
                id:
                    newObject.id,

                type:
                    newObject.type,

                x:
                    newObject.x,

                y:
                    newObject.y,

                propertyOutdoorSourceCount:
                    AppState.project
                        .outdoorSources
                        .length
            }
        );


        // --------------------------------------------------
        // Calculate contextual relationship for the
        // current floor.
        //
        // IMPORTANT:
        // The relationship is derived and stored on the
        // floor context, NOT on the Property Source.
        // --------------------------------------------------

        window.refreshOutdoorLifestyleLinks?.(
            currentFloor
        );


        tool.currentType =
            null;

        tool.placementType =
            null;

        tool.showOutdoorGuide =
            false;


        window.lastPlacedSource =
            newObject;

        window.activePopupSource =
            newObject;

        window.selectedOutdoorSource =
            newObject;


        // ==================================================
        // ðŸ”¥ NEW OUTDOOR SOURCE
        //
        // Closing the popup without Save must remove
        // this newly-created source.
        // ==================================================

        window.outdoorSourcePopupIsNew =
            true;

        // --------------------------------------------------
        // Outdoor Source popup
        // --------------------------------------------------

        if (
            typeof showOutdoorSourcePopup === "function"
        ) {

            showOutdoorSourcePopup(
                newObject
            );
        }


        if (
            typeof saveProject === "function"
        ) {
            saveProject();
        }


        requestRender?.();

        return;
    }

    // ==================================================
    // INDOOR SOURCE
    // ==================================================

    if (
        isIndoor ||
        !isLifestyle
    ) {

        currentFloor.sources =
            Array.isArray(
                currentFloor.sources
            )
                ? currentFloor.sources
                : [];


        currentFloor.sources.push(
            newObject
        );

        renderHomeCurrentFloorCard?.();
        renderHomeFloorTabs?.();
        updateHomeProfessionalAssessment?.();


        console.log(
            "ðŸ”¥ INDOOR SOURCE ADDED",
            {
                id:
                    newObject.id,

                type:
                    newObject.type,

                floorId:
                    currentFloor.id
            }
        );


        // --------------------------------------------------
        // Existing indoor contextual relationship
        // --------------------------------------------------

        const nearestZone =
            window.findNearestZone?.(
                newObject
            );


        if (
            nearestZone
        ) {

            newObject.linkedZoneIds =
                [
                    nearestZone.id
                ];
        }


        tool.currentType =
            null;

        tool.placementType =
            null;

        tool.showOutdoorGuide =
            false;


        window.lastPlacedSource =
            newObject;

        window.activePopupSource =
            newObject;


        if (
            typeof showIndoorDistancePopup === "function"
        ) {

            showIndoorDistancePopup(
                newObject
            );
        }


        if (
            typeof saveProject === "function"
        ) {
            saveProject();
        }


        requestRender?.();

        updateHomeSidebarStatus?.();
        updateHomeWorkflow?.();
        updateHomeLocks?.();
        renderHomeCurrentFloorCard?.();

        return;
    }
}


function calculateBedRisk(
    bed
) {

    const tool =
        window.objectTool;

    let risk = 0;

    tool.objects.forEach(obj => {

        if (
            obj.id === bed.id
        ) {
            return;
        }

        const meta =
            OBJECT_CONFIGS[
            obj.type
            ];

        if (!meta?.risk) {
            return;
        }

        const d =
            Math.hypot(

                obj.x - bed.x,

                obj.y - bed.y
            );

        const influence =
            Math.max(
                0,

                1 - (
                    d /
                    meta.radius
                )
            );

        risk +=
            influence *
            meta.risk;
    });

    return Math.round(
        risk
    );
}

function drawOutdoorPlacementGuide(ctx) {
    if (!ctx) return;

    const isOutdoor =
        window.objectTool?.currentType &&
        window.OUTDOOR_SOURCE_TYPES?.includes(
            window.objectTool.currentType
        );

    if (!isOutdoor) return;

    const canvas = window.canvas;
    if (!canvas) return;

    const b = EMFViewport.planBounds();
    if (!b) return;

    ctx.save();

    // =========================================================
    // OUTDOOR BACKGROUND
    // =========================================================

    const outdoorFill = "rgba(16,185,129,0.08)";
    const outdoorStroke = "rgba(16,185,129,0.45)";

    ctx.fillStyle = outdoorFill;

    // LEFT
    if (b.left > 0) {
        ctx.fillRect(
            0,
            0,
            b.left,
            canvas.height
        );
    }

    // RIGHT
    if (b.right < canvas.width) {
        ctx.fillRect(
            b.right,
            0,
            canvas.width - b.right,
            canvas.height
        );
    }

    // TOP
    if (b.top > 0) {
        ctx.fillRect(
            b.left,
            0,
            b.right - b.left,
            b.top
        );
    }

    // BOTTOM
    if (b.bottom < canvas.height) {
        ctx.fillRect(
            b.left,
            b.bottom,
            b.right - b.left,
            canvas.height - b.bottom
        );
    }

    // =========================================================
    // FLOOR PLAN BORDER
    // =========================================================

    ctx.strokeStyle = outdoorStroke;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);

    ctx.strokeRect(
        b.left,
        b.top,
        b.right - b.left,
        b.bottom - b.top
    );

    ctx.setLineDash([]);

    // =========================================================
    // OUTDOOR LABELS
    // =========================================================

    ctx.fillStyle = "#059669";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // LEFT
    if (b.left > 90) {
        ctx.fillText(
            "OUTDOOR",
            b.left / 2,
            (b.top + b.bottom) / 2
        );
    }

    // RIGHT
    if (canvas.width - b.right > 90) {
        ctx.fillText(
            "OUTDOOR",
            b.right + (canvas.width - b.right) / 2,
            (b.top + b.bottom) / 2
        );
    }

    // TOP
    if (b.top > 70) {
        ctx.fillText(
            "OUTDOOR",
            (b.left + b.right) / 2,
            b.top / 2
        );
    }

    // BOTTOM
    if (canvas.height - b.bottom > 70) {
        ctx.fillText(
            "OUTDOOR",
            (b.left + b.right) / 2,
            b.bottom + (canvas.height - b.bottom) / 2
        );
    }

    // =========================================================
    // MOVE FLOOR PLAN INSTRUCTION
    // =========================================================

    const centerX = canvas.width / 2;
    const guideWidth = 330;
    const guideHeight = 58;

    // Keep guide inside visible canvas
    const guideLeft = Math.max(
        12,
        Math.min(
            centerX - guideWidth / 2,
            canvas.width - guideWidth - 12
        )
    );

    const guideTop = 26;

    // Background
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.strokeStyle = "rgba(16,185,129,0.40)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(
        guideLeft,
        guideTop,
        guideWidth,
        guideHeight,
        12
    );

    ctx.fill();
    ctx.stroke();

    // Arrows
    ctx.fillStyle = "#059669";
    ctx.font = "bold 21px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "â†•",
        guideLeft + 45,
        guideTop + 29
    );

    ctx.fillText(
        "â†”",
        guideLeft + guideWidth - 45,
        guideTop + 29
    );

    // Main text
    ctx.fillStyle = "#065f46";
    ctx.font = "bold 13px Arial";

    ctx.fillText(
        "MOVE FLOOR PLAN",
        centerX,
        guideTop + 20
    );

    // Secondary text
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px Arial";

    ctx.fillText(
        "Drag the plan to find outdoor space",
        centerX,
        guideTop + 40
    );

    ctx.restore();
}

window.drawOutdoorPlacementGuide =
    drawOutdoorPlacementGuide;

// =====================
// ðŸ”¥ DRAW OBJECTS
// =====================

// ==================================================
// ðŸ”¥ DRAW OBJECTS
// ==================================================

function drawOutdoorSources() {
    const ctx = window.ctx;
    const project = window.AppState?.project;
    const sources = Array.isArray(project?.outdoorSources)
        ? project.outdoorSources
        : [];

    if (!ctx || !window.EMFViewport || !sources.length) return;

    ctx.save();

    try {
        for (const source of sources) {
            if (!source || !Number.isFinite(Number(source.x)) ||
                !Number.isFinite(Number(source.y))) continue;

            const type = source.type;
            if (!window.OUTDOOR_SOURCE_TYPES?.includes(type)) continue;

            const meta = OBJECT_CONFIGS?.[type];
            if (!meta) continue;

            const p = EMFViewport.worldPoint(source);
            const img = OBJECT_IMAGES?.[type];

            if (img?.complete && img.naturalWidth > 0) {
                ctx.drawImage(
                    img,
                    p.x - meta.width / 2,
                    p.y - meta.height / 2,
                    meta.width,
                    meta.height
                );
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = meta.color || "#059669";
                ctx.fill();
            }

            if (meta.label) {
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "#1e293b";
                ctx.fillText(meta.label, p.x, p.y + (meta.height || 48) / 2 + 3);
            }
        }
    } finally {
        ctx.restore();
    }
}

function drawHomeMeasurementPointsLayer() {
    if (window.AppMode?.current !== "home") return;

    const project = window.AppState?.project;
    const floor = project?.floors?.[project.currentFloorIndex || 0];
    const canvasCtx = window.ctx;

    if (!floor || !canvasCtx || !window.EMFViewport?.worldPoint) return;

    const zones = Array.isArray(floor.zones) ? floor.zones : [];

    canvasCtx.save();

    let globalPointNumber = 0;

    zones.forEach(zone => {
        if (
            !zone?.zoneType ||
            !zone.measurementZoneDimensions ||
            !Array.isArray(zone.measurementPoints)
        ) return;

        zone.measurementPoints.forEach(point => {

            globalPointNumber++;
            if (
                !Number.isFinite(Number(point.x)) ||
                !Number.isFinite(Number(point.y))
            ) return;

            const screen = window.EMFViewport.worldPoint({
                x: Number(point.x),
                y: Number(point.y)
            });

            const status = point.status ||
                (point.measured ? "measured" : "pending");

            const isMeasured = status === "measured";
            const isPartial = status === "partial";

            const color = isMeasured
                ? "#06b6d4"
                : isPartial
                    ? "#8b5cf6"
                    : "#94a3b8";

            const radius = 10;

            canvasCtx.beginPath();
            canvasCtx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);

            canvasCtx.fillStyle = isMeasured || isPartial
                ? color
                : "#ffffff";

            canvasCtx.strokeStyle = color;
            canvasCtx.lineWidth = 2;

            canvasCtx.fill();
            canvasCtx.stroke();

            canvasCtx.fillStyle = isMeasured || isPartial
                ? "#ffffff"
                : "#64748b";

            canvasCtx.font = "600 11px Arial";
            canvasCtx.textAlign = "center";
            canvasCtx.textBaseline = "middle";
            canvasCtx.fillText(
                String(globalPointNumber),
                screen.x,
                screen.y
            );
        });
    });

    canvasCtx.restore();
}

window.drawHomeMeasurementPointsLayer = drawHomeMeasurementPointsLayer;

window.drawOutdoorSources = drawOutdoorSources;
function drawObjects() {

    const tool =
        window.objectTool;

    const project =
        AppState?.project;

    const currentFloor =
        project?.floors?.[
        project?.currentFloorIndex || 0
        ];


    if (
        !currentFloor
    ) {

        return;
    }


    // ==================================================
    // OBJECT COLLECTIONS
    // ==================================================

    const floorZones =
        Array.isArray(
            currentFloor.zones
        )
            ? currentFloor.zones
            : [];


    const floorSources =
        Array.isArray(
            currentFloor.sources
        )
            ? currentFloor.sources
            : [];


    const propertyOutdoorSources =
        Array.isArray(
            project?.outdoorSources
        )
            ? project.outdoorSources
            : [];


    // ==================================================
    // FILTER LEGACY OUTDOOR DUPLICATES
    // ==================================================

    const propertyOutdoorIds =
        new Set(
            propertyOutdoorSources
                .map(
                    source =>
                        source?.id
                )
                .filter(Boolean)
        );


    const filteredFloorSources =
        floorSources.filter(
            source => {

                if (
                    !source
                ) {

                    return false;
                }


                const isOutdoor =
                    window.OUTDOOR_SOURCE_TYPES?.includes(
                        source.type
                    ) ||

                    source.placementType ===
                    "outdoor";


                if (
                    isOutdoor &&
                    propertyOutdoorIds.has(
                        source.id
                    )
                ) {

                    return false;
                }


                return true;
            }
        );


    // ==================================================
    // ALL VISIBLE OBJECTS
    // ==================================================
    //
    // Lifestyle Areas:
    //     current floor
    //
    // Indoor Sources:
    //     current floor
    //
    // Outdoor Sources:
    //     Property-wide
    //
    // ==================================================

    const allObjects = [

        ...floorZones,

        ...filteredFloorSources,

        ...propertyOutdoorSources

    ];


    console.log(
        "ðŸ”¥ DRAW OBJECTS",
        {
            floorId:
                currentFloor.id,

            zones:
                floorZones.length,

            indoorSources:
                filteredFloorSources.length,

            propertyOutdoorSources:
                propertyOutdoorSources.length,

            total:
                allObjects.length
        }
    );


    // ==================================================
    // DRAW
    // ==================================================

    ctx.save();

    // ==================================================
    // ðŸ”¥ OUTDOOR â†’ LIFESTYLE VISUAL LINKS
    // ==================================================
    //
    // Draw derived contextual relationships BEFORE
    // drawing the actual objects so the source / zone
    // icons remain visually on top.
    //
    // IMPORTANT:
    // This is contextual only.
    // It is NOT a risk indicator.
    // It is NOT a measured exposure path.
    // ==================================================

    const outdoorRelationships =
        Array.isArray(
            currentFloor.outdoorSourceRelationships
        )
            ? currentFloor.outdoorSourceRelationships
            : [];


    outdoorRelationships.forEach(
        relationship => {

            const source =
                propertyOutdoorSources.find(
                    item =>
                        item?.id ===
                        relationship.sourceId
                );


            const targetZone =
                floorZones.find(
                    zone =>
                        zone?.id ===
                        relationship.targetAreaId
                );


            if (
                !source ||
                !targetZone
            ) {

                return;
            }


            const sourcePoint =
                EMFViewport.worldPoint(
                    source
                );


            const zonePoint =
                EMFViewport.worldPoint(
                    targetZone
                );


            // ==================================================
            // CONNECTION LINE
            // ==================================================

            ctx.save();


            ctx.beginPath();

            ctx.setLineDash(
                [
                    6,
                    5
                ]
            );


            ctx.moveTo(
                sourcePoint.x,
                sourcePoint.y
            );


            ctx.lineTo(
                zonePoint.x,
                zonePoint.y
            );


            ctx.strokeStyle =
                "rgba(37,99,235,0.55)";

            ctx.lineWidth =
                1.5;


            ctx.stroke();


            // ==================================================
            // CONTEXT LABEL
            // ==================================================

            const midX =
                (
                    sourcePoint.x +
                    zonePoint.x
                ) / 2;


            const midY =
                (
                    sourcePoint.y +
                    zonePoint.y
                ) / 2;


            const zoneMeta =
                OBJECT_CONFIGS?.[
                targetZone.type
                ];


            const zoneLabel =
                zoneMeta?.label ||
                targetZone.zoneType ||
                "Lifestyle Area";


            ctx.setLineDash(
                []
            );


            ctx.font =
                "600 9px Inter";


            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            // small readable white background
            // behind contextual text

            const text =
                `Potentially relevant to ${zoneLabel}`;


            const textWidth =
                ctx.measureText(
                    text
                ).width;


            ctx.fillStyle =
                "rgba(255,255,255,0.88)";


            ctx.fillRect(

                midX -
                textWidth / 2 -
                5,

                midY -
                8,

                textWidth +
                10,

                16
            );


            ctx.fillStyle =
                "#475569";


            ctx.fillText(
                text,
                midX,
                midY
            );


            ctx.restore();
        }
    );


    allObjects.forEach(
        obj => {

            if (
                !obj
            ) {

                return;
            }


            // ==================================================
            // SCREEN POSITION
            // ==================================================

            const p =
                EMFViewport.worldPoint(
                    obj
                );

            if (
                obj.placementType === "outdoor" ||
                window.OUTDOOR_SOURCE_TYPES?.includes(obj.type)
            ) {
                console.log("[DRAW OBJECT]", {
                    type: obj.type,
                    x: obj.x,
                    y: obj.y,
                    screen: p
                });
            }

            if (
                window.OUTDOOR_SOURCE_TYPES?.includes(obj.type) ||
                obj.placementType === "outdoor"
            ) {
                console.log("[DRAW OBJECTS LOOP]", obj?.type, obj?.id);
            }

            // ==================================================
            // RESOLVE CANONICAL CONFIG TYPE
            // ==================================================

            let configType =
                obj.type;


            // --------------------------------------------------
            // Lifestyle Area semantic types
            // --------------------------------------------------

            if (
                obj.zoneType ===
                "sleep"
            ) {

                configType =
                    OBJECT_TYPES.BED;

            }

            else if (
                obj.zoneType ===
                "work"
            ) {

                configType =
                    OBJECT_TYPES.WORK_AREA;

            }

            else if (
                obj.zoneType ===
                "relax"
            ) {

                configType =
                    OBJECT_TYPES.SOFA;

            }

            else if (
                obj.zoneType ===
                "child"
            ) {

                configType =
                    OBJECT_TYPES.CHILD_AREA;
            }


            // ==================================================
            // CONFIG
            // ==================================================

            const meta =
                OBJECT_CONFIGS?.[
                configType
                ];


            if (
                !meta
            ) {

                console.warn(
                    "âŒ OBJECT CONFIG NOT FOUND",
                    {
                        id:
                            obj.id,

                        type:
                            obj.type,

                        zoneType:
                            obj.zoneType,

                        configType
                    }
                );

                return;
            }


            // ==================================================
            // HOME WELLNESS — SAVED LIFESTYLE ZONE BOUNDARY
            // ==================================================

            const isHomeLifestyle =
                window.AppMode?.current === "home" &&
                !!obj.zoneType &&
                obj.measurementZoneDimensions &&
                Number.isFinite(
                    Number(obj.measurementZoneDimensions.width)
                ) &&
                Number.isFinite(
                    Number(obj.measurementZoneDimensions.depth)
                );

            const metersPerPlanPixel =
                Number(currentFloor.currentScale);

            if (
                isHomeLifestyle &&
                metersPerPlanPixel > 0
            ) {
                const zoneWidthPlanPx =
                    Number(obj.measurementZoneDimensions.width) /
                    metersPerPlanPixel;

                const zoneDepthPlanPx =
                    Number(obj.measurementZoneDimensions.depth) /
                    metersPerPlanPixel;

                const leftPoint =
                    EMFViewport.worldPoint({
                        x: obj.x - zoneWidthPlanPx / 2,
                        y: obj.y
                    });

                const rightPoint =
                    EMFViewport.worldPoint({
                        x: obj.x + zoneWidthPlanPx / 2,
                        y: obj.y
                    });

                const topPoint =
                    EMFViewport.worldPoint({
                        x: obj.x,
                        y: obj.y - zoneDepthPlanPx / 2
                    });

                const bottomPoint =
                    EMFViewport.worldPoint({
                        x: obj.x,
                        y: obj.y + zoneDepthPlanPx / 2
                    });

                const zoneWidth =
                    Math.abs(rightPoint.x - leftPoint.x);

                const zoneHeight =
                    Math.abs(bottomPoint.y - topPoint.y);

                ctx.save();

                ctx.beginPath();

                ctx.rect(
                    p.x - zoneWidth / 2,
                    p.y - zoneHeight / 2,
                    zoneWidth,
                    zoneHeight
                );

                ctx.fillStyle =
                    "rgba(37, 99, 235, 0.12)";

                ctx.fill();

                ctx.strokeStyle =
                    tool?.selectedObjectId === obj.id
                        ? "#2563eb"
                        : "rgba(37, 99, 235, 0.85)";

                ctx.lineWidth =
                    tool?.selectedObjectId === obj.id
                        ? 2.5
                        : 1.5;

                ctx.setLineDash(
                    tool?.selectedObjectId === obj.id
                        ? []
                        : [6, 4]
                );

                ctx.stroke();

                ctx.restore();
            }


            // ==================================================
            // HEATMAP
            // ==================================================

            if (
                meta.radius &&
                meta.color
            ) {

                const radius =
                    meta.radius *
                    EMFViewport.scale;


                const gradient =
                    ctx.createRadialGradient(

                        p.x,
                        p.y,
                        10,

                        p.x,
                        p.y,
                        radius
                    );


                gradient.addColorStop(
                    0,
                    meta.color +
                    "55"
                );

                gradient.addColorStop(
                    0.4,
                    meta.color +
                    "22"
                );

                gradient.addColorStop(
                    1,
                    meta.color +
                    "00"
                );


                ctx.beginPath();

                ctx.fillStyle =
                    gradient;


                ctx.arc(
                    p.x,
                    p.y,
                    radius,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }


            // ==================================================
            // BED SAFE ZONE
            // ==================================================

            if (
                configType ===
                OBJECT_TYPES.BED
            ) {

                const score =
                    calculateBedRisk?.(
                        obj
                    ) || 0;


                if (
                    score < 3
                ) {

                    const safeGradient =
                        ctx.createRadialGradient(

                            p.x,
                            p.y,
                            10,

                            p.x,
                            p.y,
                            120
                        );


                    safeGradient.addColorStop(
                        0,
                        "rgba(59,130,246,0.18)"
                    );

                    safeGradient.addColorStop(
                        1,
                        "rgba(59,130,246,0)"
                    );


                    ctx.beginPath();

                    ctx.fillStyle =
                        safeGradient;


                    ctx.arc(
                        p.x,
                        p.y,
                        120,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                }
            }


            // ==================================================
            // IMAGE
            // ==================================================
            //
            // IMPORTANT:
            // Use canonical configType.
            //
            // This fixes:
            // sleep â†’ bed.png
            // work  â†’ work.png
            // relax â†’ sofa.png
            // child â†’ child.png
            //
            // ==================================================

            const img =
                isHomeLifestyle && obj.lifestylePresetImage
                    ? (
                        window.homeLifestylePresetImages?.[obj.lifestylePresetImage] ||
                        OBJECT_IMAGES?.[configType]
                    )
                    : OBJECT_IMAGES?.[configType];

            if (
                isHomeLifestyle &&
                obj.lifestylePresetImage &&
                !window.homeLifestylePresetImages?.[obj.lifestylePresetImage]
            ) {
                window.homeLifestylePresetImages ??= {};

                const presetImg = new Image();

                presetImg.onload = () => {
                    window.requestRender?.();
                };

                presetImg.src = obj.lifestylePresetImage;

                window.homeLifestylePresetImages[obj.lifestylePresetImage] = presetImg;
            }


            // ==================================================
            // SELECTED
            // ==================================================

            const selected =
                tool?.selectedObjectId ===
                obj.id;


            // ==================================================
            // OBJECT TYPE
            // ==================================================

            const isIndoorSource =
                String(
                    obj?.placementType ||
                    ""
                ).toLowerCase() ===
                "indoor";


            if (
                img &&
                img.complete &&
                img.naturalWidth > 0
            ) {

                // ==================================================
                // SELECT GLOW
                // ==================================================
                //
                // Indoor Source:
                // no blue circular glow.
                //
                // Other objects:
                // keep existing selection glow.
                //
                // ==================================================

                if (
                    selected &&
                    !isIndoorSource
                ) {

                    ctx.shadowColor =
                        "rgba(59,130,246,0.55)";

                    ctx.shadowBlur =
                        20;
                }





                ctx.drawImage(

                    img,

                    p.x -
                    meta.width / 2,

                    p.y -
                    meta.height / 2,

                    meta.width,

                    meta.height
                );


                ctx.shadowBlur =
                    0;


                // ==================================================
                // SELECT BORDER
                // ==================================================

                if (
                    selected
                ) {

                    ctx.beginPath();

                    ctx.strokeStyle =
                        "#2563eb";

                    ctx.lineWidth =
                        2;


                    ctx.roundRect(

                        p.x -
                        meta.width / 2 -
                        4,

                        p.y -
                        meta.height / 2 -
                        4,

                        meta.width +
                        8,

                        meta.height +
                        8,

                        10
                    );

                    ctx.stroke();
                }

            }

            else {

                // ==================================================
                // FALLBACK MARKER
                // ==================================================

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    8,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    meta.color ||
                    "#2563eb";

                ctx.fill();


                if (
                    selected
                ) {

                    ctx.beginPath();

                    ctx.strokeStyle =
                        "#2563eb";

                    ctx.lineWidth =
                        2;

                    ctx.arc(
                        p.x,
                        p.y,
                        13,
                        0,
                        Math.PI * 2
                    );

                    ctx.stroke();
                }
            }



            // ==================================================
            // OBJECT LABEL
            // ==================================================

            const isOutdoorSource =
                window.OUTDOOR_SOURCE_TYPES?.includes(obj.type) ||
                obj.placementType === "outdoor";

            const isIndoorCanvasLabelSource =
                window.INDOOR_SOURCE_TYPES?.includes(obj.type) ||
                obj.placementType === "indoor";

            const isHomeLifestyleObject =
                window.AppMode?.current === "home" &&
                (
                    obj.placementType === "zone" ||
                    obj.placementMode === "zone"
                ) &&
                !!(
                    obj.lifestylePreset ||
                    obj.lifestylePresetKey
                );

            const canvasObjectLabel =
                isHomeLifestyleObject
                    ? (
                        obj.lifestylePresetLabel ||
                        meta.label
                    )
                    : meta.label;

            const shouldDrawCanvasLabel =
                !isIndoorCanvasLabelSource ||
                isOutdoorSource;

            if (
                shouldDrawCanvasLabel &&
                canvasObjectLabel
            ) {
                ctx.fillStyle = "#1e293b";
                ctx.textAlign = "center";
                ctx.font = "600 10px Inter";

                ctx.fillText(
                    canvasObjectLabel,
                    p.x,
                    p.y - meta.height / 2 - 8
                );
            }



            // ==================================================
            // DISTANCE PRESET
            // ==================================================

            if (
                obj.distancePreset
            ) {

                ctx.font =
                    "10px Inter";

                ctx.fillStyle =
                    "#ef4444";

                ctx.textAlign =
                    "center";


                ctx.fillText(

                    obj.distancePreset,

                    p.x,

                    p.y +
                    meta.height / 2 +
                    18
                );
            }


            // ==================================================
            // MANUAL DISTANCE
            // ==================================================

            if (
                obj.exactDistance !==
                null &&
                obj.exactDistance !==
                undefined &&
                obj.exactDistance !==
                ""
            ) {

                ctx.font =
                    "10px Inter";

                ctx.fillStyle =
                    "#475569";

                ctx.textAlign =
                    "center";


                ctx.fillText(

                    `~${obj.exactDistance} m`,

                    p.x,

                    p.y +
                    meta.height / 2 +
                    32
                );
            }


            // ==================================================
            // OUTDOOR CONFIDENCE
            // ==================================================

            const isOutdoor =
                window.OUTDOOR_SOURCE_TYPES?.includes(
                    obj.type
                ) ||

                obj.placementType ===
                "outdoor";


            if (
                isOutdoor &&
                obj.spatialConfidence ===
                "approximate"
            ) {

                ctx.font =
                    "9px Inter";

                ctx.fillStyle =
                    "#64748b";

                ctx.textAlign =
                    "center";


                ctx.fillText(

                    "Approximate",

                    p.x,

                    p.y +
                    meta.height / 2 +
                    46
                );
            }
        }
    );


    ctx.restore();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "âœ… DRAW OBJECTS COMPLETE",
        {
            floorId:
                currentFloor.id,

            zones:
                floorZones.length,

            indoorSources:
                filteredFloorSources.length,

            outdoorSources:
                propertyOutdoorSources.length
        }
    );
}

window.findNearestLifestyleZoneForOutdoor =
    findNearestLifestyleZoneForOutdoor;

// =====================
// ðŸ”¥ ROOM SCORE
// =====================

function calculateRoomRisk(
    room
) {

    const tool =
        window.objectTool;

    let risk = 0;

    tool.objects.forEach(obj => {

        const meta =
            OBJECT_CONFIGS[
            obj.type
            ];

        if (!meta?.risk) {
            return;
        }

        const inside =

            isPointInsideRoom(
                {
                    x: obj.x,
                    y: obj.y
                },

                room.polygon
            );

        if (inside) {

            risk +=
                meta.risk;
        }
    });

    return risk;
}

// =====================
// ðŸ”¥ ROOM RECOMMENDATIONS
// =====================

function getRoomRecommendations(
    room
) {

    const tool =
        window.objectTool;

    const recommendations =
        [];

    tool.objects.forEach(obj => {

        const meta =
            OBJECT_CONFIGS[
            obj.type
            ];

        if (!meta) {
            return;
        }

        const inside =

            isPointInsideRoom(
                {
                    x: obj.x,
                    y: obj.y
                },

                room.polygon
            );

        if (!inside) {
            return;
        }

        // =====================
        // ðŸ”¥ WIFI
        // =====================

        if (
            obj.type === "wifi"
        ) {

            recommendations.push(

                "Consider moving WiFi further from sleeping areas"
            );
        }

        // =====================
        // ðŸ”¥ PANEL
        // =====================

        if (
            obj.type ===
            "electrical_panel"
        ) {

            recommendations.push(

                "Avoid placing beds near electrical panels"
            );
        }

        // =====================
        // ðŸ”¥ SMART METER
        // =====================

        if (
            obj.type ===
            "smart_meter"
        ) {

            recommendations.push(

                "Smart meters may increase nighttime RF exposure"
            );
        }

        // =====================
        // ðŸ”¥ TOWER
        // =====================

        if (
            obj.type ===
            "tower"
        ) {

            recommendations.push(

                "External tower exposure detected near the room"
            );
        }

        // =====================
        // ðŸ”¥ EV
        // =====================

        if (
            obj.type ===
            "ev_charger"
        ) {

            recommendations.push(

                "Avoid long-duration occupancy near EV charging areas"
            );
        }
    });

    return [
        ...new Set(
            recommendations
        )
    ];
}

// =====================
// ðŸ”¥ SELECT OBJECT
// =====================

function getObjectAtPoint(
    p
) {

    const currentFloor =
        AppState.project
            ?.floors?.[
        AppState.project
            ?.currentFloorIndex ?? 0
        ];

    if (
        !currentFloor ||
        !p
    ) {
        return null;
    }


    // ==================================================
    // FLOOR OBJECTS
    //
    // Lifestyle Areas + Indoor Sources
    // ==================================================

    const floorObjects = [

        ...(Array.isArray(currentFloor.zones)
            ? currentFloor.zones
            : []),

        ...(Array.isArray(currentFloor.sources)
            ? currentFloor.sources
            : [])
    ];


    // ==================================================
    // PROPERTY-LEVEL OUTDOOR SOURCES
    //
    // Outdoor Sources belong to the Property, not
    // to an individual Floor.
    // ==================================================

    const propertyOutdoorSources =
        Array.isArray(
            AppState.project?.outdoorSources
        )
            ? AppState.project.outdoorSources
            : [];


    // ==================================================
    // PREVENT LEGACY DUPLICATES
    //
    // If an older project still contains an Outdoor
    // Source inside currentFloor.sources and the same
    // source already exists at Property level, use the
    // Property-level object only.
    // ==================================================

    const propertyOutdoorIds =
        new Set(
            propertyOutdoorSources
                .map(
                    source => source?.id
                )
                .filter(
                    Boolean
                )
        );


    const filteredFloorObjects =
        floorObjects.filter(
            object => {

                const isOutdoor =
                    window.OUTDOOR_SOURCE_TYPES?.includes(
                        object?.type
                    );

                if (
                    isOutdoor &&
                    propertyOutdoorIds.has(
                        object?.id
                    )
                ) {
                    return false;
                }

                return true;
            }
        );


    // ==================================================
    // ALL VISIBLE OBJECTS
    // ==================================================

    const allObjects = [

        ...filteredFloorObjects,

        ...propertyOutdoorSources
    ];


    // ==================================================
    // HIT TEST
    // ==================================================

    for (
        let i =
            allObjects.length - 1;

        i >= 0;

        i--
    ) {

        const obj =
            allObjects[i];


        if (
            !obj
        ) {
            continue;
        }

        // HOME WELLNESS — HIT TEST FOR FULL LIFESTYLE ZONE
        if (
            window.AppMode?.current === "home" &&
            obj.zoneType &&
            obj.measurementZoneDimensions
        ) {
            const scale = Number(currentFloor.currentScale);
            const width = Number(obj.measurementZoneDimensions.width);
            const depth = Number(obj.measurementZoneDimensions.depth);

            if (
                scale > 0 &&
                width > 0 &&
                depth > 0
            ) {
                const halfWidth = width / scale / 2;
                const halfDepth = depth / scale / 2;

                if (
                    p.x >= obj.x - halfWidth &&
                    p.x <= obj.x + halfWidth &&
                    p.y >= obj.y - halfDepth &&
                    p.y <= obj.y + halfDepth
                ) {
                    return obj;
                }
            }
        }

        const meta =
            window.OBJECT_CONFIGS?.[
            obj.type
            ];


        if (
            !meta
        ) {
            continue;
        }


        const width =
            Number(meta.width) ||
            36;

        const height =
            Number(meta.height) ||
            36;


        const halfWidth =
            width / 2;

        const halfHeight =
            height / 2;


        if (
            p.x >=
            obj.x -
            halfWidth &&

            p.x <=
            obj.x +
            halfWidth &&

            p.y >=
            obj.y -
            halfHeight &&

            p.y <=
            obj.y +
            halfHeight
        ) {

            return obj;
        }
    }


    return null;
}

window.getObjectAtPoint =
    getObjectAtPoint;




// =====================
// ðŸ”¥ UPDATE HOURS
// =====================

function updateZoneHours(
    value
) {

    const obj =
        window.objectTool
            ?.objects
            ?.find(o =>

                o.id ===

                window.objectTool
                    .selectedObjectId
            );

    if (!obj) {
        return;
    }

    obj.hours =
        Number(value);

    const label =
        document.getElementById(
            "zoneHoursValue"
        );

    if (label) {

        label.innerText =
            value + " h/day";
    }

    requestRender?.();

    updateWellnessCard?.();
}

function showHoursPopup(
    obj
) {

    const popup =
        document.getElementById(
            "hoursPopup"
        );

    const input =
        document.getElementById(
            "hoursInput"
        );

    const value =
        document.getElementById(
            "hoursValue"
        );

    const doneBtn =
        document.getElementById(
            "hoursDoneBtn"
        );

    const canvas =
        document.getElementById(
            "canvas"
        );

    if (
        !popup ||
        !input ||
        !value ||
        !canvas
    ) {
        return;
    }

    const rect =
        canvas.getBoundingClientRect();

    popup.style.display =
        "block";

    const p =
        EMFViewport.worldPoint(
            obj
        );

    popup.style.left =
        rect.left +
        p.x +
        20 +
        "px";

    popup.style.top =
        rect.top +
        p.y -
        110 +
        "px";

    input.value =
        obj.hours || 8;

    value.innerText =
        input.value +
        " h/day";

    input.oninput = () => {

        obj.hours =
            Number(
                input.value
            );

        value.innerText =
            obj.hours +
            " h/day";

        updateWellnessCard?.();
    };

    const distancePopup =
        document.getElementById(
            "sourceDistancePopup"
        );

    if (distancePopup) {

        distancePopup.style.display =
            "none";
    }

    doneBtn.onclick = () => {

        popup.style.display = "none";

        obj.hoursConfirmed = true;

        updateHomeLocks?.();

        updateHomeWorkflow?.();

        updateCurrentExposure?.();

        updateWellnessCard?.();

        requestRender?.();
    };

}


// ==================================================
// HOME â€” INDOOR SOURCE â†’ LIFESTYLE AREA DISTANCE
// ==================================================
//
// Same floor:
//     calibrated floor-plan distance
//
// d = sqrt(dxÂ² + dyÂ²) Ã— metersPerPixel
//
// Cross floor:
//     true 3D only when defensible Z/elevation exists.
//
// IMPORTANT:
//     Do NOT use viewport zoom as physical scale.
//     floor.currentScale is the calibrated
//     meters-per-pixel value.
// ==================================================

function calculateHomeIndoorSourceDistance(
    source,
    zone,
    floor
) {

    if (
        !source ||
        !zone ||
        !floor
    ) {

        return null;
    }


    // ==================================================
    // SCALE
    // ==================================================

    const metersPerPixel =
        Number(
            floor.currentScale
        );


    if (
        !Number.isFinite(
            metersPerPixel
        ) ||
        metersPerPixel <= 0
    ) {

        console.warn(
            "âš ï¸ INDOOR DISTANCE â€” SCALE UNAVAILABLE",
            {
                floorId:
                    floor.id,

                currentScale:
                    floor.currentScale
            }
        );

        return null;
    }


    // ==================================================
    // XY
    // ==================================================

    const sourceX =
        Number(
            source.x
        );

    const sourceY =
        Number(
            source.y
        );

    const zoneX =
        Number(
            zone.x
        );

    const zoneY =
        Number(
            zone.y
        );


    if (
        !Number.isFinite(sourceX) ||
        !Number.isFinite(sourceY) ||
        !Number.isFinite(zoneX) ||
        !Number.isFinite(zoneY)
    ) {

        return null;
    }


    const dx =
        sourceX -
        zoneX;


    const dy =
        sourceY -
        zoneY;


    // ==================================================
    // FLOOR RELATIONSHIP
    // ==================================================

    const sourceFloor =
        source.floorIndex ??
        source.floor ??
        AppState.project
            ?.currentFloorIndex ??
        0;


    const zoneFloor =
        zone.floorIndex ??
        zone.floor ??
        AppState.project
            ?.currentFloorIndex ??
        0;


    const sameFloor =
        Number(sourceFloor) ===
        Number(zoneFloor);


    // ==================================================
    // SAME FLOOR
    // ==================================================

    if (
        sameFloor
    ) {

        const distancePixels =
            Math.hypot(
                dx,
                dy
            );


        const distanceMeters =
            distancePixels *
            metersPerPixel;


        return {

            distanceMeters,

            distancePixels,

            sameFloor:
                true,

            has3D:
                false,

            basis:
                "calibrated_floor_geometry_2d",

            spatialConfidence:
                "high"
        };
    }


    // ==================================================
    // CROSS FLOOR
    //
    // Only calculate true 3D when Z values are
    // actually available in real-world meters.
    // ==================================================

    const sourceZ =
        Number(
            source.z
        );


    const zoneZ =
        Number(
            zone.z
        );


    if (
        Number.isFinite(sourceZ) &&
        Number.isFinite(zoneZ)
    ) {

        const dxMeters =
            dx *
            metersPerPixel;


        const dyMeters =
            dy *
            metersPerPixel;


        const dzMeters =
            sourceZ -
            zoneZ;


        const distance3D =
            Math.sqrt(
                (
                    dxMeters *
                    dxMeters
                ) +
                (
                    dyMeters *
                    dyMeters
                ) +
                (
                    dzMeters *
                    dzMeters
                )
            );


        return {

            distanceMeters:
                distance3D,

            distancePixels:
                Math.hypot(
                    dx,
                    dy
                ),

            sameFloor:
                false,

            has3D:
                true,

            basis:
                "cross_floor_3d",

            spatialConfidence:
                "high"
        };
    }


    // ==================================================
    // CROSS FLOOR â€” NO DEFENSIBLE Z
    //
    // Never fake a 3D distance from XY only.
    // ==================================================

    return {

        distanceMeters:
            null,

        distancePixels:
            Math.hypot(
                dx,
                dy
            ),

        sameFloor:
            false,

        has3D:
            false,

        basis:
            "cross_floor_3d_unavailable",

        spatialConfidence:
            "unknown"
    };
}


window.calculateHomeIndoorSourceDistance =
    calculateHomeIndoorSourceDistance;


// ==================================================
// HOME â€” DELETE LIFESTYLE AREA CONFIRMATION
// ==================================================

function showDeleteLifestyleAreaConfirm(
    zone,
    onConfirm
) {

    document
        .getElementById(
            "deleteLifestyleAreaConfirmModal"
        )
        ?.remove();


    const zoneLabel =
        zone?.name ||
        (
            String(
                zone?.zoneType ||
                zone?.type ||
                ""
            ).toLowerCase() === "sleep"
                ? "Sleep Area"
                : String(
                    zone?.zoneType ||
                    zone?.type ||
                    ""
                ).toLowerCase() === "work"
                    ? "Work Area"
                    : String(
                        zone?.zoneType ||
                        zone?.type ||
                        ""
                    ).toLowerCase() === "relax"
                        ? "Relax Area"
                        : String(
                            zone?.zoneType ||
                            zone?.type ||
                            ""
                        ).toLowerCase() === "child"
                            ? "Child Area"
                            : "Lifestyle Area"
        );


    const zoneType =
        String(
            zone?.zoneType ||
            zone?.type ||
            ""
        ).toLowerCase();


    const zoneConfig =
        window.OBJECT_CONFIGS?.[
        zone?.type
        ] ||
        {};


    const zoneImage =
        zoneConfig.image ||
        (
            zoneType === "sleep"
                ? "assets/icons/bed.png"
                : zoneType === "work"
                    ? "assets/icons/work.png"
                    : zoneType === "relax"
                        ? "assets/icons/sofa.png"
                        : zoneType === "child"
                            ? "assets/icons/child.png"
                            : null
        );

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteLifestyleAreaConfirmModal";


    modal.className =
        "delete-measurement-modal";


    modal.innerHTML = `

        <div
            class="delete-measurement-backdrop"
        ></div>


        <div
            class="delete-measurement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteLifestyleAreaTitle"
        >

            <div
                class="delete-measurement-header"
            >

                <div
                    class="delete-measurement-icon"
                >
                    ðŸ—‘
                </div>


                <button
                    type="button"
                    class="delete-measurement-close"
                    id="deleteLifestyleAreaClose"
                    aria-label="Close"
                >
                    âœ•
                </button>

            </div>


            <div
                class="delete-measurement-content"
            >

                <div
                    id="deleteLifestyleAreaTitle"
                    class="delete-measurement-title"
                >
                    Delete Lifestyle Area?
                </div>


                <div
    class="delete-measurement-point"
    style="
        display:flex;
        align-items:center;
        gap:8px;
    "
>
    ${zoneImage
            ? `
                <img
                    src="${zoneImage}"
                    alt=""
                    style="
                        width:24px;
                        height:24px;
                        object-fit:contain;
                        flex:0 0 24px;
                    "
                >
            `
            : ""
        }

    <span>
        ${zoneLabel}
    </span>
</div>


                <div
                    class="delete-measurement-text"
                >
                    This will remove this Lifestyle Area
                    from the current floor.
                </div>


                <div
                    class="delete-measurement-note"
                >

                    <span>
                        â„¹
                    </span>

                    <span>
                        Contextual source relationships
                        will be recalculated. Sources
                        themselves will not be deleted.
                    </span>

                </div>

            </div>


            <div
                class="delete-measurement-actions"
            >

                <button
                    type="button"
                    id="deleteLifestyleAreaCancel"
                    class="delete-measurement-cancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteLifestyleAreaConfirm"
                    class="delete-measurement-confirm"
                >
                    ðŸ—‘ Delete Lifestyle Area
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

    const indoorDeleteDialog =
        modal.querySelector(
            ".delete-measurement-dialog"
        );

    if (indoorDeleteDialog) {

        indoorDeleteDialog.style.width =
            "70%";

        indoorDeleteDialog.style.maxWidth =
            "420px";
    }


    const closeButton =
        document.getElementById(
            "deleteLifestyleAreaClose"
        );


    const cancelButton =
        document.getElementById(
            "deleteLifestyleAreaCancel"
        );


    const confirmButton =
        document.getElementById(
            "deleteLifestyleAreaConfirm"
        );


    const backdrop =
        modal.querySelector(
            ".delete-measurement-backdrop"
        );


    function closeModal() {

        modal.classList.remove(
            "is-visible"
        );


        setTimeout(
            () => {

                modal.remove();

            },
            160
        );
    }


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    backdrop?.addEventListener(
        "click",
        closeModal
    );


    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();

            onConfirm?.();
        }
    );


    function handleEscape(
        event
    ) {

        if (
            event.key === "Escape"
        ) {

            event.preventDefault();
            event.stopPropagation();

            closeModal();

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        }
    }


    document.addEventListener(
        "keydown",
        handleEscape
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-visible"
            );

        }
    );


    setTimeout(
        () => {

            cancelButton?.focus();

        },
        80
    );
}


window.showDeleteLifestyleAreaConfirm =
    showDeleteLifestyleAreaConfirm;



// ==================================================
// DELETE INDOOR SOURCE CONFIRMATION
// ==================================================

function showDeleteIndoorSourceConfirm(
    source,
    onConfirm
) {

    document
        .getElementById(
            "deleteIndoorSourceConfirmModal"
        )
        ?.remove();


    const sourceLabel =
        source?.label ||
        source?.name ||
        window.OBJECT_CONFIGS?.[
            source?.type
        ]?.label ||
        source?.type ||
        "Indoor Source";


    const sourceConfig =
        window.OBJECT_CONFIGS?.[
        source?.type
        ] ||
        {};


    const sourceImage =
        sourceConfig.image ||
        null;


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteIndoorSourceConfirmModal";


    modal.className =
        "delete-measurement-modal";


    modal.innerHTML = `

        <div
            class="delete-measurement-backdrop"
        ></div>


        <div
            class="delete-measurement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteIndoorSourceTitle"
        >

            <div
                class="delete-measurement-header"
            >

                <div
                    class="delete-measurement-icon"
                >
                    ðŸ—‘
                </div>


                <button
                    type="button"
                    class="delete-measurement-close"
                    id="deleteIndoorSourceClose"
                    aria-label="Close"
                >
                    âœ•
                </button>

            </div>


            <div
                class="delete-measurement-content"
            >

                <div
                    id="deleteIndoorSourceTitle"
                    class="delete-measurement-title"
                >
                    Delete Indoor Source?
                </div>


                <div
                    class="delete-measurement-point"
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                    "
                >

                    ${sourceImage
            ? `
                                <img
                                    src="${sourceImage}"
                                    alt=""
                                    style="
                                        width:24px;
                                        height:24px;
                                        object-fit:contain;
                                        flex:0 0 24px;
                                    "
                                >
                            `
            : ""
        }

                    <span>
                        ${sourceLabel}
                    </span>

                </div>


                <div
                    class="delete-measurement-text"
                >
                    This will remove this Indoor Source
                    from the current floor.
                </div>


                <div
                    class="delete-measurement-note"
                >

                    <span>
                        â„¹
                    </span>

                    <span>
                        Lifestyle Area relationships
                        will be recalculated.
                        Other sources will not be deleted.
                    </span>

                </div>

            </div>


            <div
                class="delete-measurement-actions"
            >

                <button
                    type="button"
                    id="deleteIndoorSourceCancel"
                    class="delete-measurement-cancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteIndoorSourceConfirm"
                    class="delete-measurement-confirm"
                >
                    ðŸ—‘ Delete Indoor Source
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "deleteIndoorSourceClose"
        );


    const cancelButton =
        document.getElementById(
            "deleteIndoorSourceCancel"
        );


    const confirmButton =
        document.getElementById(
            "deleteIndoorSourceConfirm"
        );


    const backdrop =
        modal.querySelector(
            ".delete-measurement-backdrop"
        );


    function closeModal() {

        modal.classList.remove(
            "is-visible"
        );


        setTimeout(
            () => {

                modal.remove();

            },
            160
        );
    }


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    backdrop?.addEventListener(
        "click",
        closeModal
    );


    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();

            onConfirm?.();
        }
    );


    function handleEscape(
        event
    ) {

        if (
            event.key === "Escape"
        ) {

            event.preventDefault();
            event.stopPropagation();

            closeModal();

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        }
    }


    document.addEventListener(
        "keydown",
        handleEscape
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-visible"
            );

        }
    );


    setTimeout(
        () => {

            cancelButton?.focus();

        },
        80
    );
}


window.showDeleteIndoorSourceConfirm =
    showDeleteIndoorSourceConfirm;

// ==================================================
// HOME â€” LIFESTYLE AREA POPUP
// ==================================================

function showLifestyleAreaPopup(
    zone,
    options = {}
) {


    if (!zone) {

        console.warn(
            "âš ï¸ LIFESTYLE POPUP â€” NO ZONE"
        );

        return;
    }


    const popup =
        document.getElementById(
            "lifestyleAreaPopup"
        );


    const canvas =
        window.canvas;


    if (
        !popup ||
        !canvas
    ) {

        console.error(
            "âŒ LIFESTYLE POPUP INIT FAILED",
            {
                popup:
                    !!popup,

                canvas:
                    !!canvas
            }
        );

        return;
    }


    // ==================================================
    // POPUP MUST RECEIVE POINTER EVENTS
    // ==================================================

    if (
        popup.parentElement !==
        document.body
    ) {

        document.body.appendChild(
            popup
        );
    }


    popup.style.pointerEvents =
        "auto";

    popup.style.zIndex =
        "999999";


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (!floor) {

        console.warn(
            "âš ï¸ LIFESTYLE POPUP â€” NO CURRENT FLOOR"
        );

        return;
    }


    // ==================================================
    // ACTIVE ZONE
    // ==================================================

    window.activePopupZone =
        zone;

    window.selectedLifestyleArea =
        zone;


    // ==================================================
    // ELEMENTS
    // ==================================================

    const summary =
        document.getElementById(
            "lifestyleAreaSummary"
        );


    const hoursInput =
        document.getElementById(
            "lifestyleAreaHoursInput"
        );


    const contextualSources =
        document.getElementById(
            "lifestyleAreaContextualSources"
        );


    const saveBtn =
        document.getElementById(
            "lifestyleAreaSaveBtn"
        );


    const deleteBtn =
        document.getElementById(
            "lifestyleAreaDeleteBtn"
        );


    const closeBtn =
        document.getElementById(
            "lifestyleAreaPopupClose"
        );


    // ==================================================
    // ðŸ”¥ LIFESTYLE AREA POPUP â€” DRAG
    //
    // Drag only the popup header.
    // This moves the popup on screen.
    // It does NOT move the floor plan.
    //
    // Buttons / inputs / sources remain interactive.
    // ==================================================

    const popupHeader =
        document.getElementById(
            "lifestyleAreaPopupHeader"
        );


    if (
        popupHeader &&
        !popup._lifestylePopupDragInitialized
    ) {

        let isDraggingPopup =
            false;


        let dragStartX =
            0;


        let dragStartY =
            0;


        let popupStartLeft =
            0;


        let popupStartTop =
            0;


        // ==================================================
        // POINTER DOWN
        // ==================================================

        popupHeader.addEventListener(
            "pointerdown",
            event => {

                // ------------------------------------------
                // X button must remain a normal button.
                // ------------------------------------------

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                const rect =
                    popup.getBoundingClientRect();


                isDraggingPopup =
                    true;


                dragStartX =
                    event.clientX;


                dragStartY =
                    event.clientY;


                popupStartLeft =
                    rect.left;


                popupStartTop =
                    rect.top;


                popup.style.left =
                    `${popupStartLeft}px`;


                popup.style.top =
                    `${popupStartTop}px`;


                popup.style.right =
                    "auto";


                popup.style.bottom =
                    "auto";


                popupHeader.style.cursor =
                    "grabbing";


                try {

                    popupHeader.setPointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    // Ignore browsers without
                    // pointer capture support.
                }
            }
        );


        // ==================================================
        // POINTER MOVE
        // ==================================================

        popupHeader.addEventListener(
            "pointermove",
            event => {

                if (
                    !isDraggingPopup
                ) {

                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                const deltaX =
                    event.clientX -
                    dragStartX;


                const deltaY =
                    event.clientY -
                    dragStartY;


                const popupWidth =
                    popup.offsetWidth;


                const popupHeight =
                    popup.offsetHeight;


                const margin =
                    8;


                const maxLeft =
                    Math.max(
                        margin,
                        window.innerWidth -
                        popupWidth -
                        margin
                    );


                const maxTop =
                    Math.max(
                        margin,
                        window.innerHeight -
                        popupHeight -
                        margin
                    );


                const nextLeft =
                    Math.max(
                        margin,
                        Math.min(
                            maxLeft,
                            popupStartLeft +
                            deltaX
                        )
                    );


                const nextTop =
                    Math.max(
                        margin,
                        Math.min(
                            maxTop,
                            popupStartTop +
                            deltaY
                        )
                    );


                popup.style.left =
                    `${nextLeft}px`;


                popup.style.top =
                    `${nextTop}px`;
            }
        );


        // ==================================================
        // POINTER UP
        // ==================================================

        const finishPopupDrag =
            event => {

                if (
                    !isDraggingPopup
                ) {

                    return;
                }


                isDraggingPopup =
                    false;


                popupHeader.style.cursor =
                    "grab";


                try {

                    popupHeader.releasePointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    // Ignore.
                }
            };


        popupHeader.addEventListener(
            "pointerup",
            finishPopupDrag
        );


        popupHeader.addEventListener(
            "pointercancel",
            finishPopupDrag
        );


        popup._lifestylePopupDragInitialized =
            true;
    }


    // ==================================================
    // LABEL / TYPE
    // ==================================================

    const zoneType =
        String(
            zone.zoneType ||
            zone.type ||
            ""
        ).toLowerCase();


    const zoneConfig =
        window.OBJECT_CONFIGS?.[
        zone.type
        ] ||
        {};


    // ==================================================
    // REAL ASSET ICON + SELECTED PRESET
    // ==================================================

    const rawPresetType = String(
        zone.zoneType || zone.type || ""
    ).toLowerCase();

    const presetTypeMap = {
        bed: "bed",
        sleep: "bed",
        work: "work_area",
        work_area: "work_area",
        desk: "work_area",
        sofa: "sofa",
        relax: "sofa",
        rest: "sofa",
        child: "child_area",
        child_area: "child_area"
    };

    const presetType =
        presetTypeMap[rawPresetType] ||
        (
            HOME_LIFESTYLE_PRESETS[rawPresetType]
                ? rawPresetType
                : null
        );

    const presetKey =
        zone.lifestylePreset ||
        zone.lifestylePresetKey ||
        zone.presetKey ||
        "";

    const selectedPreset =
        HOME_LIFESTYLE_PRESETS[presetType]?.presets?.[presetKey];

    const presetLabel =
        zone.lifestylePresetLabel ||
        zone.presetLabel ||
        selectedPreset?.label ||
        "";

    const zoneImage =
        selectedPreset?.image ||
        zoneConfig.image ||
        (
            zoneType === "sleep"
                ? "assets/icons/bed.png"
                : zoneType === "work"
                    ? "assets/icons/work.png"
                    : zoneType === "relax"
                        ? "assets/icons/sofa.png"
                        : zoneType === "child"
                            ? "assets/icons/child.png"
                            : null
        );

    const zoneLabel =
        zone.name ||
        zoneConfig.label ||
        (
            zoneType === "sleep"
                ? "Sleep Area"
                : zoneType === "work"
                    ? "Work Area"
                    : zoneType === "relax"
                        ? "Relax Area"
                        : zoneType === "child"
                            ? "Child Area"
                            : "Lifestyle Area"
        );

    // ==================================================
    // SUMMARY
    // ==================================================
    // ==================================================

    if (summary) {
        summary.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
            width:100%;
            box-sizing:border-box;
        ">
            ${zoneImage
                ? `<img
                        src="${zoneImage}"
                        alt=""
                        style="
                            width:36px;
                            height:36px;
                            object-fit:contain;
                            flex:0 0 36px;
                        "
                    >`
                : ""
            }

            <div style="flex:1;min-width:0;">
                <div style="
                    font-size:14px;
                    font-weight:700;
                    color:#0f172a;
                ">
                    ${zoneLabel}
                </div>

                ${presetLabel
                ? `<div style="
                            margin-top:3px;
                            font-size:12px;
                            color:#64748b;
                        ">
                            ${presetLabel}
                        </div>`
                : ""
            }
            </div>

            ${presetType
                ? `<button
                        type="button"
                        id="btnEditLifestylePreset"
                        style="
                            flex:0 0 auto;
                            padding:6px 11px;
                            border:1px solid #cbd5e1;
                            border-radius:7px;
                            background:#fff;
                            color:#334155;
                            font-size:12px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >Edit</button>`
                : ""
            }
        </div>
    `;

        const editButton = document.getElementById(
            "btnEditLifestylePreset"
        );

        if (editButton && presetType) {
            editButton.addEventListener("click", () => {
                if (window.AppMode?.current !== "home") return;

                editingLifestyleZone = zone;

                openLifestyleSizeSelector(presetType);
            });
        }
    }
    // ==================================================
    // HOME WELLNESS — LIFESTYLE DIMENSIONS UI
    // ==================================================

    document.getElementById(
        "lifestyleAreaDimensions"
    )?.remove();



    // ==================================================
    // TIME SPENT
    //
    // IMPORTANT:
    // null / undefined = not configured yet.
    // Default = 8 h/day.
    //
    // Explicit 0 remains 0.
    // ==================================================

    let currentHours = 8;


    if (
        zone.hours !== null &&
        zone.hours !== undefined &&
        zone.hours !== ""
    ) {

        const parsedHours =
            Number(
                zone.hours
            );


        if (
            Number.isFinite(
                parsedHours
            )
        ) {

            currentHours =
                Math.max(
                    0,
                    Math.min(
                        24,
                        parsedHours
                    )
                );
        }
    }
    else if (
        zone.hoursPerDay !== null &&
        zone.hoursPerDay !== undefined &&
        zone.hoursPerDay !== ""
    ) {

        const parsedHoursPerDay =
            Number(
                zone.hoursPerDay
            );


        if (
            Number.isFinite(
                parsedHoursPerDay
            )
        ) {

            currentHours =
                Math.max(
                    0,
                    Math.min(
                        24,
                        parsedHoursPerDay
                    )
                );
        }
    }


    if (
        hoursInput
    ) {

        hoursInput.value =
            currentHours;
    }


    // ==================================================
    // TIME SPENT â€” MOUSE WHEEL
    //
    // Wheel up   = +0.5 h
    // Wheel down = -0.5 h
    //
    // Range = 0â€“24 h/day
    // ==================================================

    if (
        hoursInput &&
        !hoursInput._lifestyleHoursWheelHandler
    ) {

        const handleHoursWheel =
            event => {

                event.preventDefault();
                event.stopPropagation();


                const current =
                    Number(
                        hoursInput.value
                    );


                const base =
                    Number.isFinite(
                        current
                    )
                        ? current
                        : 0;


                const delta =
                    event.deltaY < 0
                        ? 0.5
                        : -0.5;


                const next =
                    Math.max(
                        0,
                        Math.min(
                            24,
                            base + delta
                        )
                    );


                hoursInput.value =
                    next;


                hoursInput.dispatchEvent(
                    new Event(
                        "input",
                        {
                            bubbles:
                                true
                        }
                    )
                );
            };


        hoursInput.addEventListener(
            "wheel",
            handleHoursWheel,
            {
                passive:
                    false
            }
        );


        hoursInput._lifestyleHoursWheelHandler =
            handleHoursWheel;
    }


    // ==================================================
    // TIME SPENT â€” ARROW KEYS
    // ==================================================

    if (
        hoursInput &&
        !hoursInput._lifestyleHoursKeyHandler
    ) {

        const handleHoursKey =
            event => {

                if (
                    event.key !== "ArrowUp" &&
                    event.key !== "ArrowDown"
                ) {

                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                const current =
                    Number(
                        hoursInput.value
                    );


                const base =
                    Number.isFinite(
                        current
                    )
                        ? current
                        : 0;


                const delta =
                    event.key === "ArrowUp"
                        ? 0.5
                        : -0.5;


                const next =
                    Math.max(
                        0,
                        Math.min(
                            24,
                            base + delta
                        )
                    );


                hoursInput.value =
                    next;
            };


        hoursInput.addEventListener(
            "keydown",
            handleHoursKey
        );


        hoursInput._lifestyleHoursKeyHandler =
            handleHoursKey;
    }



    if (summary) {
        summary.insertAdjacentHTML(
            "afterend",
            `
            <div id="lifestyleAreaDimensions" style="
                margin-top:8px;
                font-family:inherit;
            ">
                <div style="
                    font-size:12px;
                    font-weight:700;
                    color:#334155;
                    margin-bottom:5px;
                ">Dimensions</div>

                <div style="
                    display:grid;
                    grid-template-columns:minmax(0,1fr) minmax(0,1fr);
                    gap:6px;
                ">
                    <div style="
                        min-width:0;
                        border:1px solid #e2e8f0;
                        border-radius:8px;
                        padding:7px;
                        background:#f8fafc;
                    ">
                        <div style="
                            font-size:11px;
                            font-weight:700;
                            color:#334155;
                            margin-bottom:6px;
                        ">Furniture</div>

                        <label for="lifestyleFurnitureWidth" style="
                            display:block;
                            font-size:11px;
                            color:#64748b;
                            margin-bottom:3px;
                        ">Width (W), m</label>
                        <input id="lifestyleFurnitureWidth"
                               type="number" min="0.1" max="30"
                               step="0.1" inputmode="decimal"
                               readonly
                               style="
                                   display:block;
                                   width:100%;
                                   height:30px;
                                   box-sizing:border-box;
                                   padding:4px 6px;
                                   margin:0 0 7px;
                                   border:1px solid #cbd5e1;
                                   border-radius:6px;
                                   background:#fff;
                                   color:#0f172a;
                                   font-size:12px;
                               ">

                        <label for="lifestyleFurnitureDepth" style="
                            display:block;
                            font-size:11px;
                            color:#64748b;
                            margin-bottom:3px;
                        ">Depth (D), m</label>
                        <input id="lifestyleFurnitureDepth"
                               type="number" min="0.1" max="30"
                               step="0.1" inputmode="decimal"
                               readonly
                               style="
                                   display:block;
                                   width:100%;
                                   height:30px;
                                   box-sizing:border-box;
                                   padding:4px 6px;
                                   margin:0;
                                   border:1px solid #cbd5e1;
                                   border-radius:6px;
                                   background:#fff;
                                   color:#0f172a;
                                   font-size:12px;
                               ">
                    </div>

                    <div style="
                        min-width:0;
                        border:1px solid #bfdbfe;
                        border-radius:8px;
                        padding:7px;
                        background:#eff6ff;
                    ">
                        <div style="
                            font-size:11px;
                            font-weight:700;
                            color:#1e40af;
                            margin-bottom:6px;
                        ">Measurement Zone</div>

                        <label for="lifestyleZoneWidth" style="
                            display:block;
                            font-size:11px;
                            color:#64748b;
                            margin-bottom:3px;
                        ">Width (W), m</label>
                        <input id="lifestyleZoneWidth"
                               type="number" min="0.1" max="50"
                               step="0.1" inputmode="decimal"
                               readonly
                               style="
                                   display:block;
                                   width:100%;
                                   height:30px;
                                   box-sizing:border-box;
                                   padding:4px 6px;
                                   margin:0 0 7px;
                                   border:1px solid #93c5fd;
                                   border-radius:6px;
                                   background:#fff;
                                   color:#0f172a;
                                   font-size:12px;
                               ">

                        <label for="lifestyleZoneDepth" style="
                            display:block;
                            font-size:11px;
                            color:#64748b;
                            margin-bottom:3px;
                        ">Depth (D), m</label>
                        <input id="lifestyleZoneDepth"
                               type="number" min="0.1" max="50"
                               step="0.1" inputmode="decimal"
                               readonly
                               style="
                                   display:block;
                                   width:100%;
                                   height:30px;
                                   box-sizing:border-box;
                                   padding:4px 6px;
                                   margin:0;
                                   border:1px solid #93c5fd;
                                   border-radius:6px;
                                   background:#fff;
                                   color:#0f172a;
                                   font-size:12px;
                               ">
                    </div>
                </div>

                <div
    id="lifestyleAreaBoundaryWarning"
    style="
        display:none;
        align-items:flex-start;
        gap:6px;
        margin-top:7px;
        padding:7px 8px;
        border:1px solid #fed7aa;
        border-radius:7px;
        background:#fff7ed;
        color:#9a3412;
        font-size:11px;
        line-height:1.35;
    "
>
    <span aria-hidden="true">⚠</span>
    <span>
        Measurement zone extends beyond the room.
        Only the area inside the room counts toward room coverage and analysis.
    </span>
</div>
            </div>
            `
        );

        const lifestyleDimensionInputs = [
            "lifestyleFurnitureWidth",
            "lifestyleFurnitureDepth",
            "lifestyleZoneWidth",
            "lifestyleZoneDepth"
        ];

        const activePresetKey =
            zone.lifestylePreset ||
            zone.lifestylePresetKey ||
            zone.presetKey ||
            "";

        const isCustomLifestylePreset = activePresetKey === "custom";

        lifestyleDimensionInputs.forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;

            input.readOnly = !isCustomLifestylePreset;
            input.style.background = isCustomLifestylePreset
                ? "#ffffff"
                : "#f1f5f9";

            input.style.cursor = isCustomLifestylePreset
                ? "text"
                : "default";
        });

        // ==================================================
        // INITIALIZE LIFESTYLE DIMENSION INPUTS
        // Must run AFTER lifestyleAreaDimensions is inserted.
        // ==================================================

        const furnitureWidthInput =
            document.getElementById("lifestyleFurnitureWidth");

        const furnitureDepthInput =
            document.getElementById("lifestyleFurnitureDepth");

        const zoneWidthInput =
            document.getElementById("lifestyleZoneWidth");

        const zoneDepthInput =
            document.getElementById("lifestyleZoneDepth");

        const furnitureDims = zone.furnitureDimensions || {};
        const measurementDims = zone.measurementZoneDimensions || {};

        if (furnitureWidthInput) {
            furnitureWidthInput.value = furnitureDims.width ?? "";
        }

        if (furnitureDepthInput) {
            furnitureDepthInput.value = furnitureDims.depth ?? "";
        }

        if (zoneWidthInput) {
            zoneWidthInput.value = measurementDims.width ?? "";
        }

        if (zoneDepthInput) {
            zoneDepthInput.value = measurementDims.depth ?? "";
        }

        updateLifestyleAreaBoundaryWarning(zone, floor);

        [zoneWidthInput, zoneDepthInput].forEach(input => {
            if (!input || input._boundaryWarningHandlerAttached) {
                return;
            }

            input.addEventListener("input", () => {
                const width = Number(zoneWidthInput?.value);
                const depth = Number(zoneDepthInput?.value);

                if (
                    Number.isFinite(width) && width > 0 &&
                    Number.isFinite(depth) && depth > 0
                ) {
                    zone.measurementZoneDimensions = {
                        ...(zone.measurementZoneDimensions || {}),
                        width,
                        depth
                    };

                    updateLifestyleAreaBoundaryWarning(zone, floor);
                }
            });

            input._boundaryWarningHandlerAttached = true;
        });
    }

    // ==================================================
    // CONTEXTUAL SOURCES
    // ==================================================

    if (
        contextualSources
    ) {

        contextualSources.innerHTML =
            "";


        // ==================================================
        // INDOOR SOURCES
        // ==================================================
        //
        // HOME CONTEXTUAL RELATIONSHIP
        //
        // Indoor Source:
        //     source X/Y/Z
        //          +
        //     Lifestyle Area X/Y/Z
        //          â†“
        //     calibrated floor scale
        //          â†“
        //     automatic spatial distance
        //
        // IMPORTANT:
        // - No manual distance.
        // - No canvas-pixel display.
        // - No "nearest source only" fallback.
        // - Existing linkedZoneIds are NOT used as the
        //   primary distance calculation.
        // - Sources are sorted by actual calculated
        //   distance to this Lifestyle Area.
        // ==================================================

        const indoorSources =
            Array.isArray(
                floor.sources
            )
                ? floor.sources.filter(
                    source => {

                        if (
                            !source
                        ) {

                            return false;
                        }


                        const isOutdoor =
                            window.OUTDOOR_SOURCE_TYPES
                                ?.includes(
                                    source.type
                                )
                            ||
                            source.placementType ===
                            "outdoor";


                        return !isOutdoor;
                    }
                )
                : [];


        // ==================================================
        // CALIBRATED FLOOR SCALE
        // ==================================================
        //
        // floor.currentScale = meters per plan pixel.
        //
        // Never use EMFViewport.scale here.
        // That is display / viewport scaling,
        // not physical floor-plan calibration.
        // ==================================================

        const metersPerPixel =
            Number(
                floor.currentScale
            );


        const hasCalibratedScale =
            floor.scaleConfirmed === true &&
            Number.isFinite(
                metersPerPixel
            ) &&
            metersPerPixel > 0;


        // ==================================================
        // LIFESTYLE AREA POSITION
        // ==================================================

        const zoneX =
            Number(
                zone.x
            );

        const zoneY =
            Number(
                zone.y
            );


        // ==================================================
        // LIFESTYLE AREA Z
        // ==================================================
        //
        // Home Lifestyle Areas currently use point-like
        // X/Y coordinates.
        //
        // Z may come from:
        // - zone.z
        // - zone.position.z
        // - floor elevation
        //
        // If no explicit Z exists, the current floor's
        // elevation is the defensible floor-level Z.
        // ==================================================

        const zoneExplicitZ =
            Number(
                zone.z ??
                zone.position?.z
            );


        const zoneZ =
            Number.isFinite(
                zoneExplicitZ
            )
                ? zoneExplicitZ
                : Number(
                    floor.elevation_m
                );


        // ==================================================
        // FIND CONTEXTUAL INDOOR SOURCES
        // ==================================================
        //
        // Calculate the real source â†’ Lifestyle Area
        // distance for EVERY Indoor Source on the
        // current floor.
        //
        // This avoids:
        //     linkedZoneIds â†’ arbitrary relationship
        //
        // and avoids:
        //     canvas pixels â†’ displayed metres
        //
        // The result is based on actual calibrated
        // floor-plan geometry.
        // ==================================================

        const indoorCandidates =
            indoorSources.map(
                source => {

                    const sourceX =
                        Number(
                            source.x ??
                            source.position?.x
                        );


                    const sourceY =
                        Number(
                            source.y ??
                            source.position?.y
                        );


                    const sourceExplicitZ =
                        Number(
                            source.z ??
                            source.position?.z
                        );


                    const sourceZ =
                        Number.isFinite(
                            sourceExplicitZ
                        )
                            ? sourceExplicitZ
                            : Number(
                                floor.elevation_m
                            );


                    const hasXY =
                        Number.isFinite(
                            sourceX
                        ) &&
                        Number.isFinite(
                            sourceY
                        ) &&
                        Number.isFinite(
                            zoneX
                        ) &&
                        Number.isFinite(
                            zoneY
                        );


                    const sameFloor =
                        (
                            source.floorId &&
                            floor.id
                        )
                            ? source.floorId ===
                            floor.id
                            : true;


                    let distanceResult =
                        null;


                    // ==================================================
                    // CALCULATED DISTANCE
                    // ==================================================

                    if (
                        hasCalibratedScale &&
                        hasXY
                    ) {

                        const dxPixels =
                            sourceX -
                            zoneX;


                        const dyPixels =
                            sourceY -
                            zoneY;


                        const dxMeters =
                            dxPixels *
                            metersPerPixel;


                        const dyMeters =
                            dyPixels *
                            metersPerPixel;


                        // ------------------------------------------------
                        // Same floor
                        // ------------------------------------------------

                        if (
                            sameFloor
                        ) {

                            const dzMeters =
                                (
                                    Number.isFinite(
                                        sourceZ
                                    ) &&
                                    Number.isFinite(
                                        zoneZ
                                    )
                                )
                                    ? sourceZ -
                                    zoneZ
                                    : 0;


                            const distance3D =
                                Math.sqrt(
                                    (
                                        dxMeters *
                                        dxMeters
                                    ) +
                                    (
                                        dyMeters *
                                        dyMeters
                                    ) +
                                    (
                                        dzMeters *
                                        dzMeters
                                    )
                                );


                            distanceResult = {

                                distanceMeters:
                                    distance3D,

                                distance3D:
                                    distance3D,

                                distance2D:
                                    Math.hypot(
                                        dxMeters,
                                        dyMeters
                                    ),

                                dxMeters,

                                dyMeters,

                                dzMeters,

                                basis:
                                    "calibrated_floor_geometry_3d",

                                spatialConfidence:
                                    "high",

                                sameFloor:
                                    true
                            };
                        }

                        // ------------------------------------------------
                        // Cross floor
                        // ------------------------------------------------
                        //
                        // Do NOT fabricate a 2D distance.
                        // ------------------------------------------------

                        else {

                            const hasZ =
                                Number.isFinite(
                                    sourceZ
                                ) &&
                                Number.isFinite(
                                    zoneZ
                                );


                            if (
                                hasZ
                            ) {

                                const dzMeters =
                                    sourceZ -
                                    zoneZ;


                                const distance3D =
                                    Math.sqrt(
                                        (
                                            dxMeters *
                                            dxMeters
                                        ) +
                                        (
                                            dyMeters *
                                            dyMeters
                                        ) +
                                        (
                                            dzMeters *
                                            dzMeters
                                        )
                                    );


                                distanceResult = {

                                    distanceMeters:
                                        distance3D,

                                    distance3D:
                                        distance3D,

                                    distance2D:
                                        Math.hypot(
                                            dxMeters,
                                            dyMeters
                                        ),

                                    dxMeters,

                                    dyMeters,

                                    dzMeters,

                                    basis:
                                        "cross_floor_3d",

                                    spatialConfidence:
                                        "high",

                                    sameFloor:
                                        false
                                };
                            }

                            else {

                                distanceResult = {

                                    distanceMeters:
                                        null,

                                    distance3D:
                                        null,

                                    distance2D:
                                        null,

                                    basis:
                                        "cross_floor_3d_unavailable",

                                    spatialConfidence:
                                        "unknown",

                                    sameFloor:
                                        false
                                };
                            }
                        }
                    }


                    return {

                        source,

                        distanceResult
                    };
                }
            );


        // ==================================================
        // CONTEXTUAL INDOOR SOURCES
        // ==================================================
        //
        // Keep every Indoor Source for which a defensible
        // spatial relationship can be calculated.
        //
        // Sort nearest â†’ farthest.
        //
        // We do NOT silently discard other Indoor Sources
        // just because one is nearest.
        // ==================================================

        const indoorRelated =
            indoorCandidates
                .filter(
                    item =>
                        item.distanceResult &&
                        (
                            item.distanceResult
                                .distanceMeters !==
                            null
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.distanceResult
                            .distanceMeters -
                        b.distanceResult
                            .distanceMeters
                );


        // ==================================================
        // SOURCES WITHOUT DEFENSIBLE DISTANCE
        // ==================================================
        //
        // Keep them available as contextual sources,
        // but do not invent a number.
        // ==================================================

        const indoorWithoutDistance =
            indoorCandidates.filter(
                item =>
                    !item.distanceResult ||
                    item.distanceResult
                        .distanceMeters ===
                    null
            );


        // ==================================================
        // DEBUG
        // ==================================================

        console.log(
            "ðŸ”¥ HOME LIFESTYLE â†’ INDOOR CONTEXT",
            {
                lifestyleAreaId:
                    zone.id,

                lifestyleArea:
                    zoneLabel,

                floorId:
                    floor.id,

                floorName:
                    floor.name,

                currentScale:
                    floor.currentScale,

                scaleConfirmed:
                    floor.scaleConfirmed,

                indoorSourceCount:
                    indoorSources.length,

                calculatedIndoorCount:
                    indoorRelated.length,

                unavailableIndoorCount:
                    indoorWithoutDistance.length,

                distances:
                    indoorRelated.map(
                        item => ({
                            sourceId:
                                item.source.id,

                            sourceType:
                                item.source.type,

                            distanceMeters:
                                item.distanceResult
                                    .distanceMeters,

                            basis:
                                item.distanceResult
                                    .basis
                        })
                    )
            }
        );


        // ==================================================
        // OUTDOOR CONTEXT
        // ==================================================

        const relationships =
            Array.isArray(
                floor.outdoorSourceRelationships
            )
                ? floor.outdoorSourceRelationships
                : [];


        const outdoorSources =
            Array.isArray(
                AppState.project
                    ?.outdoorSources
            )
                ? AppState.project
                    .outdoorSources
                : [];


        const outdoorRelatedIds =
            relationships
                .filter(
                    relationship =>
                        relationship &&
                        relationship.targetAreaId ===
                        zone.id
                )
                .map(
                    relationship =>
                        relationship.sourceId
                );


        const outdoorRelated =
            outdoorSources.filter(
                source =>
                    outdoorRelatedIds.includes(
                        source.id
                    )
            );


        // ==================================================
        // SOURCE RENDER
        // ==================================================

        function renderSource(
            source,
            environment,
            distanceResult = null
        ) {

            if (!source) {
                return;
            }


            // ==================================================
            // SOURCE CONFIG
            // ==================================================

            const config =
                window.OBJECT_CONFIGS?.[
                source.type
                ] || {};


            const sourceImage =
                config.image ||
                null;


            const label =
                config.label ||
                source.label ||
                source.type ||
                "Source";


            const state =
                String(
                    source.state ||
                    "UNKNOWN"
                ).toUpperCase();


            // ==================================================
            // SECONDARY TEXT
            // ==================================================

            let secondary =
                environment === "outdoor"
                    ? "Approximate"
                    : "Distance unavailable";


            // ==================================================
            // INDOOR DISTANCE
            // ==================================================

            if (
                environment === "indoor" &&
                distanceResult &&
                Number.isFinite(
                    Number(
                        distanceResult.distanceMeters
                    )
                )
            ) {

                secondary =
                    window.formatProjectDistance
                        ? window.formatProjectDistance(
                            Number(
                                distanceResult.distanceMeters
                            )
                        )
                        : `${Number(
                            distanceResult.distanceMeters
                        ).toFixed(1)} m`;
            }


            // ==================================================
            // LEGACY / DIRECT SOURCE DISTANCE FALLBACK
            // ==================================================

            else if (
                environment === "indoor" &&
                Number.isFinite(
                    Number(
                        source.exactDistance
                    )
                )
            ) {

                secondary =
                    window.formatProjectDistance
                        ? window.formatProjectDistance(
                            Number(
                                source.exactDistance
                            )
                        )
                        : `${Number(
                            source.exactDistance
                        ).toFixed(1)} m`;
            }


            // ==================================================
            // ROW
            // ==================================================

            const row =
                document.createElement(
                    "div"
                );


            row.style.cssText = `
        display:flex;
        align-items:flex-start;
        gap:9px;
        padding:8px 0;
        border-bottom:1px solid #edf2f7;
    `;


            // ==================================================
            // ICON
            // ==================================================

            const iconWrap =
                document.createElement(
                    "div"
                );


            iconWrap.style.cssText = `
        width:28px;
        min-width:28px;
        height:28px;
        display:flex;
        align-items:center;
        justify-content:center;
    `;


            if (sourceImage) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    sourceImage;

                img.alt =
                    "";

                img.style.cssText = `
            width:24px;
            height:24px;
            object-fit:contain;
            display:block;
        `;


                iconWrap.appendChild(
                    img
                );

            }
            else {

                iconWrap.textContent =
                    "ðŸ“¡";

            }


            // ==================================================
            // TEXT
            // ==================================================

            const textWrap =
                document.createElement(
                    "div"
                );


            textWrap.style.cssText = `
        min-width:0;
        flex:1;
    `;


            const title =
                document.createElement(
                    "div"
                );


            title.style.cssText = `
        font-size:13px;
        font-weight:600;
        color:#1e293b;
        line-height:18px;
    `;


            title.textContent =
                label;


            const meta =
                document.createElement(
                    "div"
                );


            meta.style.cssText = `
        margin-top:2px;
        font-size:11px;
        color:#64748b;
        line-height:16px;
    `;


            meta.textContent =
                `${state} Â· ${secondary}`;


            textWrap.appendChild(
                title
            );

            textWrap.appendChild(
                meta
            );


            row.appendChild(
                iconWrap
            );

            row.appendChild(
                textWrap
            );


            contextualSources.appendChild(
                row
            );
        }


        // ==================================================
        // INDOOR SECTION
        // ==================================================

        if (
            indoorRelated.length
        ) {

            const heading =
                document.createElement(
                    "div"
                );


            heading.style.cssText =
                `
                    margin-top:4px;
                    margin-bottom:3px;
                    font-size:11px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:.04em;
                    color:#64748b;
                `;


            heading.textContent =
                "Indoor";


            contextualSources.appendChild(
                heading
            );


            indoorRelated.forEach(
                item => {

                    renderSource(
                        item.source,
                        "indoor",
                        item.distanceResult
                    );
                }
            );
        }


        // ==================================================
        // OUTDOOR SECTION
        // ==================================================

        if (
            outdoorRelated.length
        ) {

            const heading =
                document.createElement(
                    "div"
                );


            heading.style.cssText =
                `
                    margin-top:12px;
                    margin-bottom:3px;
                    font-size:11px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:.04em;
                    color:#64748b;
                `;


            heading.textContent =
                "Outdoor";


            contextualSources.appendChild(
                heading
            );


            outdoorRelated.forEach(
                source => {

                    renderSource(
                        source,
                        "outdoor"
                    );
                }
            );
        }


        // ==================================================
        // EMPTY
        // ==================================================

        if (
            !indoorRelated.length &&
            !outdoorRelated.length
        ) {

            contextualSources.innerHTML =
                `
                    <div
                        style="
                            padding:10px 0;
                            font-size:12px;
                            color:#94a3b8;
                        "
                    >
                        No contextual sources yet.
                    </div>
                `;
        }
    }



    // ==================================================
    // POSITION POPUP
    // ==================================================

    const rect = canvas.getBoundingClientRect();

    const p = EMFViewport.worldPoint(zone);

    // Keep the popup within the available viewport.
    const popupWidth = Math.min(340, window.innerWidth - 24);

    popup.style.width = `${popupWidth}px`;
    popup.style.maxWidth = "calc(100vw - 24px)";
    popup.style.maxHeight = "calc(100vh - 24px)";
    popup.style.overflowY = "auto";
    popup.style.overflowX = "hidden";
    popup.style.boxSizing = "border-box";

    let left = rect.left + p.x + 28;
    let top = rect.top + p.y - 90;

    // Prefer the right side of the selected Lifestyle Area.
    if (left + popupWidth > window.innerWidth - 12) {
        left = rect.left + p.x - popupWidth - 28;
    }

    // Show first so the browser can measure the actual height.
    popup.style.display = "block";

    const popupRect = popup.getBoundingClientRect();
    const actualWidth = popupRect.width;
    const actualHeight = popupRect.height;

    // Keep the entire popup inside the visible viewport.
    left = Math.max(
        12,
        Math.min(left, window.innerWidth - actualWidth - 12)
    );

    top = Math.max(
        12,
        Math.min(top, window.innerHeight - actualHeight - 12)
    );

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;


    popup.style.display =
        "block";


    // ==================================================
    // CLOSE POPUP
    // ==================================================

    const closePopup =
        () => {

            popup.style.display =
                "none";


            window.activePopupZone =
                null;


            window.selectedLifestyleArea =
                null;


            requestRender?.();
        };

    // ==================================================
    // CLOSE ON OUTSIDE CLICK
    // ==================================================

    if (popup._lifestyleOutsideClickHandler) {
        document.removeEventListener(
            "pointerdown",
            popup._lifestyleOutsideClickHandler,
            true
        );
    }

    popup._lifestyleOutsideClickHandler = event => {
        if (popup.style.display === "none") {
            return;
        }

        if (!popup.contains(event.target)) {
            closePopup();
        }
    };

    document.addEventListener(
        "pointerdown",
        popup._lifestyleOutsideClickHandler,
        true
    );


    // ==================================================
    // SAVE
    // ==================================================

    if (
        saveBtn
    ) {

        saveBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();


                const value =
                    Number(
                        hoursInput?.value
                    );


                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    zone.hours =
                        Math.max(
                            0,
                            Math.min(
                                24,
                                value
                            )
                        );


                    // Keep legacy field synchronized
                    // if it exists in this project model.

                    if (
                        Object.prototype.hasOwnProperty
                            .call(
                                zone,
                                "hoursPerDay"
                            )
                    ) {

                        zone.hoursPerDay =
                            zone.hours;
                    }
                }


                // Save the edited physical dimensions in meters.
                const fw = Number(
                    document.getElementById("lifestyleFurnitureWidth")?.value
                );

                const fd = Number(
                    document.getElementById("lifestyleFurnitureDepth")?.value
                );

                const zw = Number(
                    document.getElementById("lifestyleZoneWidth")?.value
                );

                const presetKey =
                    zone.lifestylePreset ||
                    zone.lifestylePresetKey ||
                    zone.presetKey ||
                    "";

                const isCustom = presetKey === "custom";

                if (!isCustom) {
                    const presetTypeMap = {
                        bed: "bed",
                        sleep: "bed",
                        work: "work_area",
                        work_area: "work_area",
                        desk: "work_area",
                        sofa: "sofa",
                        relax: "sofa",
                        rest: "sofa",
                        child: "child_area",
                        child_area: "child_area"
                    };

                    const rawType = String(
                        zone.zoneType || zone.type || ""
                    ).toLowerCase();

                    const presetType =
                        presetTypeMap[rawType] ||
                        (HOME_LIFESTYLE_PRESETS[rawType] ? rawType : null);

                    const preset = HOME_LIFESTYLE_PRESETS[presetType]?.presets?.[presetKey];

                    if (preset) {
                        zone.furnitureDimensions = {
                            ...(zone.furnitureDimensions || {}),
                            width: preset.furniture[0],
                            depth: preset.furniture[1]
                        };

                        zone.measurementZoneDimensions = {
                            ...(zone.measurementZoneDimensions || {}),
                            width: preset.zone[0],
                            depth: preset.zone[1]
                        };
                    }
                }

                const zd = Number(
                    document.getElementById("lifestyleZoneDepth")?.value
                );

                const validDimensions =
                    [fw, fd, zw, zd].every(
                        value =>
                            Number.isFinite(value) &&
                            value > 0 &&
                            value <= 50
                    );

                if (!validDimensions) {
                    alert(
                        "Enter valid furniture and measurement zone dimensions in meters."
                    );
                    return;
                }

                zone.furnitureDimensions = {
                    ...(zone.furnitureDimensions || {}),
                    width: fw,
                    depth: fd
                };

                zone.measurementZoneDimensions = {
                    ...(zone.measurementZoneDimensions || {}),
                    width: zw,
                    depth: zd
                };



                zone.hoursConfirmed =
                    true;


                window.activePopupZone =
                    null;


                window.selectedLifestyleArea =
                    null;


                popup.style.display =
                    "none";


                window.refreshOutdoorLifestyleLinks?.(
                    floor
                );


                window.updateHomeLocks?.();

                window.updateHomeSidebarStatus?.();

                window.updateHomeWorkflow?.();

                window.renderHomeFloorTabs?.();

                window.updateWorkflowUI?.();

                window.updateFlow?.();

                window.updateCurrentExposure?.();

                window.updateWellnessCard?.();

                saveProject?.();

                requestRender?.();


                console.log(
                    "âœ… LIFESTYLE AREA SAVED",
                    {
                        id:
                            zone.id,

                        hours:
                            zone.hours
                    }
                );
            };
    }

    // ==================================================
    // HOME INDOOR POPUP BUTTON STYLES
    // Match Outdoor Source popup
    // ==================================================

    if (deleteBtn) {

        deleteBtn.style.cssText = `
        min-width:64px;
        height:34px;
        padding:0 14px;
        border:1px solid #ff4d4f;
        border-radius:6px;
        background:#fff;
        color:#ff4d4f;
        font-size:14px;
        font-weight:400;
        cursor:pointer;
        box-sizing:border-box;
    `;
    }


    if (saveBtn) {

        saveBtn.style.cssText = `
        min-width:58px;
        height:34px;
        padding:0 14px;
        border:1px solid #2563eb;
        border-radius:6px;
        background:#2563eb;
        color:#fff;
        font-size:14px;
        font-weight:400;
        cursor:pointer;
        box-sizing:border-box;
    `;
    }



    // ==================================================
    // DELETE
    // ==================================================

    if (
        deleteBtn
    ) {

        deleteBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();


                window.showDeleteLifestyleAreaConfirm?.(
                    zone,
                    () => {

                        const index =
                            Array.isArray(
                                floor.zones
                            )
                                ? floor.zones.findIndex(
                                    item =>
                                        item?.id ===
                                        zone.id
                                )
                                : -1;


                        if (
                            index < 0
                        ) {

                            return;
                        }


                        floor.zones.splice(
                            index,
                            1
                        );


                        // ------------------------------------------
                        // Recalculate Outdoor contextual relationships
                        // ------------------------------------------

                        window.refreshOutdoorLifestyleLinks?.(
                            floor
                        );


                        // ------------------------------------------
                        // Clear Room ownership
                        // ------------------------------------------

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
                                            zone.id
                                        ) {

                                            point.disabledByZone =
                                                false;

                                            delete point.zoneId;
                                        }
                                    }
                                );
                            }
                        );


                        // ------------------------------------------
                        // Clear selection
                        // ------------------------------------------

                        if (
                            AppState.ui
                                ?.selectedZone
                                ?.id ===
                            zone.id
                        ) {

                            AppState.ui.selectedZone =
                                null;

                            window.selectedZone =
                                null;
                        }


                        window.activePopupZone =
                            null;

                        window.selectedLifestyleArea =
                            null;


                        popup.style.display =
                            "none";


                        // ------------------------------------------
                        // UI
                        // ------------------------------------------

                        window.updateHomeLocks?.();

                        window.updateHomeSidebarStatus?.();

                        window.updateHomeWorkflow?.();

                        window.renderHomeFloorTabs?.();

                        window.updateWorkflowUI?.();

                        window.updateFlow?.();

                        window.updateCurrentExposure?.();

                        window.updateWellnessCard?.();


                        saveProject?.();

                        requestRender?.();


                        console.log(
                            "ðŸ—‘ï¸ LIFESTYLE AREA DELETED",
                            {
                                id:
                                    zone.id,

                                floorId:
                                    floor.id
                            }
                        );
                    }
                );
            };
    }


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    if (
        closeBtn
    ) {

        closeBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();

                closePopup();
            };
    }


    // ==================================================
    // POPUP POINTER GUARD
    //
    // Prevent canvas handlers from receiving popup
    // clicks.
    // ==================================================

    if (
        !popup._lifestylePointerGuard
    ) {

        popup.addEventListener(
            "pointerdown",
            event => {

                event.stopPropagation();
            }
        );


        popup.addEventListener(
            "click",
            event => {

                event.stopPropagation();
            }
        );


        popup._lifestylePointerGuard =
            true;
    }


    // ==================================================
    // KEYBOARD
    // ==================================================

    if (
        !popup._lifestyleKeyboardHandler
    ) {

        const handleLifestylePopupKeydown =
            event => {

                // ------------------------------------------
                // ESC â†’ CLOSE WITHOUT SAVING
                // ------------------------------------------

                if (
                    event.key === "Escape" ||
                    event.key === "Esc"
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                    closePopup();

                    return;
                }


                // ------------------------------------------
                // ENTER â†’ SAVE
                // ------------------------------------------

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                    saveBtn?.click();

                    return;
                }
            };


        popup.addEventListener(
            "keydown",
            handleLifestylePopupKeydown
        );


        popup._lifestyleKeyboardHandler =
            handleLifestylePopupKeydown;
    }


    // ==================================================
    // FOCUS
    // ==================================================

    popup.setAttribute(
        "tabindex",
        "-1"
    );


    requestAnimationFrame(
        () => {

            try {

                popup.focus({
                    preventScroll:
                        true
                });

            } catch (
            err
            ) {

                popup.focus();
            }
        }
    );


}

// ==================================================
// HOME INDOOR SOURCE POPUP
// ==================================================

function showHomeIndoorSourcePopup(
    source,
    options = {}
) {

    if (!source) {

        console.warn(
            "âš ï¸ HOME INDOOR POPUP â€” NO SOURCE"
        );

        return;
    }


    const popup =
        document.getElementById(
            "homeIndoorSourcePopup"
        );


    const canvas =
        window.canvas;


    if (
        !popup ||
        !canvas
    ) {

        console.error(
            "âŒ HOME INDOOR POPUP INIT FAILED",
            {
                popup:
                    !!popup,

                canvas:
                    !!canvas
            }
        );

        return;
    }


    // ==================================================
    // POPUP DOM
    // ==================================================

    if (
        popup.parentElement !==
        document.body
    ) {

        document.body.appendChild(
            popup
        );
    }


    popup.style.pointerEvents =
        "auto";

    popup.style.zIndex =
        "999999";


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (!floor) {

        console.warn(
            "âš ï¸ HOME INDOOR POPUP â€” NO FLOOR"
        );

        return;
    }


    // ==================================================
    // ACTIVE SOURCE
    // ==================================================

    window.activePopupSource =
        source;

    window.selectedIndoorSource =
        source;


    // ==================================================
    // ELEMENTS
    // ==================================================

    const summary =
        document.getElementById(
            "homeIndoorSourceSummary"
        );


    const stateContainer =
        document.getElementById(
            "homeIndoorSourceState"
        );


    const floorElement =
        document.getElementById(
            "homeIndoorSourceFloor"
        );


    const lifestyleContainer =
        document.getElementById(
            "homeIndoorSourceLifestyleAreas"
        );


    const saveBtn =
        document.getElementById(
            "homeIndoorSourceSaveBtn"
        );


    const deleteBtn =
        document.getElementById(
            "homeIndoorSourceDeleteBtn"
        );


    const closeBtn =
        document.getElementById(
            "homeIndoorSourcePopupClose"
        );


    // ==================================================
    // POPUP DRAG / PAN
    //
    // IMPORTANT:
    // Dragging the popup header moves ONLY
    // the popup.
    //
    // It does NOT move the floor plan.
    // ==================================================

    const popupHeader =
        document.getElementById(
            "homeIndoorSourcePopupHeader"
        );


    if (
        popupHeader &&
        !popup._homeIndoorPopupDragInitialized
    ) {

        let isDraggingPopup =
            false;

        let dragStartX =
            0;

        let dragStartY =
            0;

        let popupStartLeft =
            0;

        let popupStartTop =
            0;


        popupHeader.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                const rect =
                    popup.getBoundingClientRect();


                isDraggingPopup =
                    true;


                dragStartX =
                    event.clientX;


                dragStartY =
                    event.clientY;


                popupStartLeft =
                    rect.left;


                popupStartTop =
                    rect.top;


                popup.style.left =
                    `${popupStartLeft}px`;

                popup.style.top =
                    `${popupStartTop}px`;

                popup.style.right =
                    "auto";

                popup.style.bottom =
                    "auto";


                popupHeader.style.cursor =
                    "grabbing";


                try {

                    popupHeader.setPointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    // Ignore.
                }
            }
        );


        popupHeader.addEventListener(
            "pointermove",
            event => {

                if (
                    !isDraggingPopup
                ) {

                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                const deltaX =
                    event.clientX -
                    dragStartX;


                const deltaY =
                    event.clientY -
                    dragStartY;


                const width =
                    popup.offsetWidth;


                const height =
                    popup.offsetHeight;


                const margin =
                    8;


                const maxLeft =
                    Math.max(
                        margin,
                        window.innerWidth -
                        width -
                        margin
                    );


                const maxTop =
                    Math.max(
                        margin,
                        window.innerHeight -
                        height -
                        margin
                    );


                const left =
                    Math.max(
                        margin,
                        Math.min(
                            maxLeft,
                            popupStartLeft +
                            deltaX
                        )
                    );


                const top =
                    Math.max(
                        margin,
                        Math.min(
                            maxTop,
                            popupStartTop +
                            deltaY
                        )
                    );


                popup.style.left =
                    `${left}px`;

                popup.style.top =
                    `${top}px`;
            }
        );


        const finishPopupDrag =
            event => {

                if (
                    !isDraggingPopup
                ) {

                    return;
                }


                isDraggingPopup =
                    false;


                popupHeader.style.cursor =
                    "grab";


                try {

                    popupHeader.releasePointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    // Ignore.
                }
            };


        popupHeader.addEventListener(
            "pointerup",
            finishPopupDrag
        );


        popupHeader.addEventListener(
            "pointercancel",
            finishPopupDrag
        );


        popup._homeIndoorPopupDragInitialized =
            true;
    }


    // ==================================================
    // SOURCE CONFIG
    // ==================================================

    const config =
        window.OBJECT_CONFIGS?.[
        source.type
        ] || {};


    const sourceImage =
        config.image ||
        null;


    const sourceLabel =
        config.label ||
        source.label ||
        source.type ||
        "Indoor Source";


    // ==================================================
    // SUMMARY
    // ==================================================
    if (summary) {
        const rawType = String(
            zone.zoneType || zone.type || ""
        ).toLowerCase();

        const presetTypeMap = {
            bed: "bed",
            sleep: "bed",
            work: "work_area",
            desk: "work_area",
            work_area: "work_area",
            sofa: "sofa",
            relax: "sofa",
            rest: "sofa",
            child: "child_area",
            child_area: "child_area"
        };

        const presetType =
            presetTypeMap[rawType] ||
            (HOME_LIFESTYLE_PRESETS[rawType] ? rawType : null);

        const presetKey =
            zone.lifestylePreset ||
            zone.lifestylePresetKey ||
            zone.presetKey ||
            "";

        const presetConfig = presetType
            ? HOME_LIFESTYLE_PRESETS[presetType]?.presets?.[presetKey]
            : null;

        const presetLabel =
            zone.lifestylePresetLabel ||
            zone.presetLabel ||
            presetConfig?.label ||
            "";

        summary.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
            width:100%;
        ">
            ${sourceImage ? `
                <img
                    src="${sourceImage}"
                    alt=""
                    style="
                        width:36px;
                        height:36px;
                        object-fit:contain;
                        flex:0 0 36px;
                    "
                >
            ` : ""}

            <div style="flex:1;min-width:0;">
                <div style="
                    font-size:14px;
                    font-weight:700;
                    color:#0f172a;
                "${zone.lifestylePresetLabel || sourceLabel || "Lifestyle Area"}</div>

                <div style="
                    margin-top:3px;
                    font-size:12px;
                    color:${presetLabel ? "#64748b" : "#b45309"};
                ">${presetLabel || "Preset not saved"}</div>
            </div>

            ${presetType ? `
                <button
                    type="button"
                    id="btnEditLifestylePreset"
                    style="
                        flex:0 0 auto;
                        padding:6px 11px;
                        border:1px solid #cbd5e1;
                        border-radius:7px;
                        background:#fff;
                        color:#334155;
                        font-size:12px;
                        font-weight:600;
                        cursor:pointer;
                    "
                >Edit</button>
            ` : ""}
        </div>
    `;

        const editButton = document.getElementById(
            "btnEditLifestylePreset"
        );

        if (editButton && presetType) {
            editButton.addEventListener("click", () => {
                if (window.AppMode?.current !== "home") return;

                editingLifestyleZone = zone;
                openLifestyleSizeSelector(presetType);
            });
        }


    }

    // ==================================================
    // OPERATING STATE
    // ==================================================

    const currentState =
        String(
            source.state ||
            "UNKNOWN"
        ).toUpperCase();


    if (stateContainer) {

        stateContainer
            .querySelectorAll(
                'input[name="homeIndoorSourceState"]'
            )
            .forEach(
                radio => {

                    radio.checked =
                        radio.value ===
                        currentState;
                }
            );
    }


    // ==================================================
    // FLOOR
    // ==================================================

    if (floorElement) {

        floorElement.textContent =
            floor.name ||
            floor.label ||
            "Current Floor";
    }


    // ==================================================
    // LIFESTYLE AREAS
    // ==================================================

    if (lifestyleContainer) {

        lifestyleContainer.innerHTML =
            "";


        const lifestyleAreas =
            Array.isArray(
                floor.zones
            )
                ? floor.zones
                : [];


        if (
            !lifestyleAreas.length
        ) {

            lifestyleContainer.innerHTML =
                `
                    <div
                        style="
                            padding:8px 0;
                            font-size:12px;
                            color:#94a3b8;
                        "
                    >
                        No Lifestyle Areas yet.
                    </div>
                `;

        }
        else {

            const metersPerPixel =
                Number(
                    floor.currentScale
                );


            const hasScale =
                floor.scaleConfirmed === true &&
                Number.isFinite(
                    metersPerPixel
                ) &&
                metersPerPixel > 0;


            const sourceX =
                Number(
                    source.x ??
                    source.position?.x
                );


            const sourceY =
                Number(
                    source.y ??
                    source.position?.y
                );


            const sourceZRaw =
                Number(
                    source.z ??
                    source.position?.z
                );


            const sourceZ =
                Number.isFinite(
                    sourceZRaw
                )
                    ? sourceZRaw
                    : Number(
                        floor.elevation_m
                    );


            const items =
                lifestyleAreas.map(
                    zone => {

                        const zoneX =
                            Number(
                                zone.x
                            );


                        const zoneY =
                            Number(
                                zone.y
                            );


                        const zoneZRaw =
                            Number(
                                zone.z ??
                                zone.position?.z
                            );


                        const zoneZ =
                            Number.isFinite(
                                zoneZRaw
                            )
                                ? zoneZRaw
                                : Number(
                                    floor.elevation_m
                                );


                        let distanceMeters =
                            null;


                        if (
                            hasScale &&
                            Number.isFinite(
                                sourceX
                            ) &&
                            Number.isFinite(
                                sourceY
                            ) &&
                            Number.isFinite(
                                zoneX
                            ) &&
                            Number.isFinite(
                                zoneY
                            )
                        ) {

                            const dx =
                                (
                                    sourceX -
                                    zoneX
                                ) *
                                metersPerPixel;


                            const dy =
                                (
                                    sourceY -
                                    zoneY
                                ) *
                                metersPerPixel;


                            const dz =
                                (
                                    Number.isFinite(
                                        sourceZ
                                    ) &&
                                    Number.isFinite(
                                        zoneZ
                                    )
                                )
                                    ? sourceZ -
                                    zoneZ
                                    : 0;


                            distanceMeters =
                                Math.sqrt(
                                    (
                                        dx * dx
                                    ) +
                                    (
                                        dy * dy
                                    ) +
                                    (
                                        dz * dz
                                    )
                                );
                        }


                        return {
                            zone,
                            distanceMeters
                        };
                    }
                );


            items.sort(
                (
                    a,
                    b
                ) => {

                    if (
                        a.distanceMeters ===
                        null
                    ) {

                        return 1;
                    }

                    if (
                        b.distanceMeters ===
                        null
                    ) {

                        return -1;
                    }

                    return (
                        a.distanceMeters -
                        b.distanceMeters
                    );
                }
            );


            items.forEach(
                item => {

                    const zone =
                        item.zone;


                    const zoneType =
                        String(
                            zone.zoneType ||
                            zone.type ||
                            ""
                        ).toLowerCase();


                    const zoneConfig =
                        window.OBJECT_CONFIGS?.[
                        zone.type
                        ] || {};


                    const zoneImage =
                        zoneConfig.image ||
                        (
                            zoneType === "sleep"
                                ? "assets/icons/bed.png"
                                : zoneType === "work"
                                    ? "assets/icons/work.png"
                                    : zoneType === "relax"
                                        ? "assets/icons/sofa.png"
                                        : zoneType === "child"
                                            ? "assets/icons/child.png"
                                            : null
                        );


                    const zoneLabel =
                        zone.name ||
                        zoneConfig.label ||
                        (
                            zoneType === "sleep"
                                ? "Sleep Area"
                                : zoneType === "work"
                                    ? "Work Area"
                                    : zoneType === "relax"
                                        ? "Relax Area"
                                        : zoneType === "child"
                                            ? "Child Area"
                                            : "Lifestyle Area"
                        );


                    const row =
                        document.createElement(
                            "div"
                        );


                    row.style.cssText = `
    display:flex;
    align-items:center;
    gap:8px;
    padding:7px 0;
    border-bottom:1px solid #edf2f7;
`;


                    const icon =
                        document.createElement(
                            "div"
                        );


                    icon.style.cssText = `
                        width:26px;
                        height:26px;
                        flex:0 0 26px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                    `;


                    if (
                        zoneImage
                    ) {

                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            zoneImage;

                        img.alt =
                            "";

                        img.style.cssText = `
                            width:23px;
                            height:23px;
                            object-fit:contain;
                        `;


                        icon.appendChild(
                            img
                        );

                    }
                    else {

                        icon.textContent =
                            "â€¢";
                    }


                    const text =
                        document.createElement(
                            "div"
                        );


                    text.style.cssText = `
    min-width:0;
    flex:1;
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:2px;
`;


                    const label =
                        document.createElement(
                            "div"
                        );


                    label.style.cssText = `
    font-size:12px;
    font-weight:600;
    color:#334155;
    line-height:1.25;
`;


                    label.textContent =
                        zoneLabel;


                    const distance =
                        document.createElement(
                            "div"
                        );


                    distance.style.cssText = `
    font-size:11px;
    color:#64748b;
    line-height:1.25;
`;


                    if (
                        Number.isFinite(
                            item.distanceMeters
                        )
                    ) {

                        distance.textContent =
                            window.formatProjectDistance
                                ? window.formatProjectDistance(
                                    item.distanceMeters
                                )
                                : `${item.distanceMeters.toFixed(1)} m`;

                    }
                    else {

                        distance.textContent =
                            "Distance unavailable";
                    }


                    text.appendChild(
                        label
                    );

                    text.appendChild(
                        distance
                    );


                    row.appendChild(
                        icon
                    );

                    row.appendChild(
                        text
                    );



                    lifestyleContainer.appendChild(
                        row
                    );
                }
            );
        }
    }


    // ==================================================
    // POSITION
    // ==================================================

    const rect =
        canvas.getBoundingClientRect();


    const p =
        EMFViewport.worldPoint(
            source
        );


    const popupWidth =
        Math.min(
            360,
            window.innerWidth - 32
        );


    const popupHeight =
        Math.min(
            popup.offsetHeight ||
            360,
            window.innerHeight - 32
        );


    let left =
        rect.left +
        p.x +
        28;


    let top =
        rect.top +
        p.y -
        90;


    if (
        left +
        popupWidth >
        window.innerWidth -
        16
    ) {

        left =
            rect.left +
            p.x -
            popupWidth -
            28;
    }


    if (
        top +
        popupHeight >
        window.innerHeight -
        16
    ) {

        top =
            window.innerHeight -
            popupHeight -
            16;
    }


    popup.style.left =
        `${Math.max(
            16,
            left
        )}px`;


    popup.style.top =
        `${Math.max(
            16,
            top
        )}px`;


    popup.style.display =
        "block";


    // ==================================================
    // CLOSE
    // ==================================================

    const closePopup =
        () => {

            popup.style.display =
                "none";

            window.activePopupSource =
                null;

            window.selectedIndoorSource =
                null;

            requestRender?.();
        };


    // ==================================================
    // SAVE
    // ==================================================

    if (saveBtn) {

        saveBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();


                const selectedState =
                    stateContainer
                        ?.querySelector(
                            'input[name="homeIndoorSourceState"]:checked'
                        )
                        ?.value ||
                    "UNKNOWN";


                source.state =
                    selectedState;


                popup.style.display =
                    "none";


                window.activePopupSource =
                    null;

                window.selectedIndoorSource =
                    null;


                window.updateHomeLocks?.();

                window.updateHomeSidebarStatus?.();

                window.updateHomeWorkflow?.();

                window.renderHomeFloorTabs?.();

                window.updateWorkflowUI?.();

                window.updateFlow?.();

                window.updateCurrentExposure?.();

                window.updateWellnessCard?.();

                saveProject?.();

                requestRender?.();


                console.log(
                    "âœ… HOME INDOOR SOURCE SAVED",
                    {
                        id:
                            source.id,

                        state:
                            source.state
                    }
                );
            };
    }

    // ==================================================
    // HOME INDOOR POPUP BUTTON STYLES
    // Match Outdoor Source popup
    // ==================================================

    if (deleteBtn) {

        deleteBtn.style.cssText = `
        min-width:64px;
        height:34px;
        padding:0 14px;
        border:1px solid #ff4d4f;
        border-radius:6px;
        background:#fff;
        color:#ff4d4f;
        font-size:14px;
        font-weight:400;
        cursor:pointer;
        box-sizing:border-box;
    `;
    }


    if (saveBtn) {

        saveBtn.style.cssText = `
        min-width:58px;
        height:34px;
        padding:0 14px;
        border:1px solid #2563eb;
        border-radius:6px;
        background:#2563eb;
        color:#fff;
        font-size:14px;
        font-weight:400;
        cursor:pointer;
        box-sizing:border-box;
    `;
    }



    // ==================================================
    // DELETE â€” CONFIRMATION
    // ==================================================

    if (deleteBtn) {

        deleteBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();


                window.selectedIndoorSource =
                    source;


                window.activePopupSource =
                    source;


                // ==================================================
                // SHOW CONFIRMATION
                // ==================================================

                showDeleteIndoorSourceConfirm(
                    source,
                    () => {

                        const sources =
                            Array.isArray(
                                floor.sources
                            )
                                ? floor.sources
                                : [];


                        const index =
                            sources.findIndex(
                                item =>
                                    item?.id ===
                                    source.id
                            );


                        if (
                            index < 0
                        ) {

                            return;
                        }


                        // ==================================================
                        // ACTUAL DELETE
                        // ==================================================

                        sources.splice(
                            index,
                            1
                        );


                        window.activePopupSource =
                            null;


                        window.selectedIndoorSource =
                            null;


                        popup.style.display =
                            "none";


                        // ==================================================
                        // REFRESH HOME UI
                        // ==================================================

                        window.updateHomeLocks?.();

                        window.updateHomeSidebarStatus?.();

                        window.updateHomeWorkflow?.();

                        window.renderHomeFloorTabs?.();

                        window.updateWorkflowUI?.();

                        window.updateFlow?.();

                        window.updateCurrentExposure?.();

                        window.updateWellnessCard?.();


                        // ==================================================
                        // SAVE + RENDER
                        // ==================================================

                        saveProject?.();

                        requestRender?.();


                        console.log(
                            "ðŸ—‘ï¸ HOME INDOOR SOURCE DELETED",
                            {
                                id:
                                    source.id,

                                floorId:
                                    floor.id
                            }
                        );

                    }
                );
            };
    }


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    if (closeBtn) {

        closeBtn.onclick =
            event => {

                event?.preventDefault();
                event?.stopPropagation();

                closePopup();
            };
    }


    // ==================================================
    // POINTER GUARD
    // ==================================================

    if (
        !popup._homeIndoorPointerGuard
    ) {

        popup.addEventListener(
            "pointerdown",
            event => {

                event.stopPropagation();
            }
        );


        popup.addEventListener(
            "click",
            event => {

                event.stopPropagation();
            }
        );


        popup._homeIndoorPointerGuard =
            true;
    }


    // ==================================================
    // KEYBOARD
    // ==================================================

    if (
        !popup._homeIndoorKeyboardHandler
    ) {

        const handleKeydown =
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                    closePopup();

                    return;
                }


                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                    saveBtn?.click();
                }
            };


        popup.addEventListener(
            "keydown",
            handleKeydown
        );


        popup._homeIndoorKeyboardHandler =
            handleKeydown;
    }

    // ==================================================
    // GLOBAL LIFESTYLE POPUP KEYBOARD HANDLER
    // ==================================================

    if (popup._lifestyleGlobalKeyHandler) {
        document.removeEventListener(
            "keydown",
            popup._lifestyleGlobalKeyHandler,
            true
        );
    }

    popup._lifestyleGlobalKeyHandler = event => {
        if (popup.style.display === "none") {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closePopup();
            return;
        }

        if (event.key === "Enter") {
            // Let Enter work normally inside multiline fields.
            if (event.target?.tagName === "TEXTAREA") {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            saveBtn?.click();
        }
    };

    document.addEventListener(
        "keydown",
        popup._lifestyleGlobalKeyHandler,
        true
    );


    // ==================================================
    // FOCUS
    // ==================================================

    popup.setAttribute(
        "tabindex",
        "-1"
    );


    requestAnimationFrame(
        () => {

            try {

                popup.focus({
                    preventScroll:
                        true
                });

            } catch (
            error
            ) {

                popup.focus();
            }
        }
    );


    console.log(
        "ðŸ”¥ HOME INDOOR SOURCE POPUP OPEN",
        {
            id:
                source.id,

            type:
                source.type,

            floorId:
                floor.id
        }
    );
}


window.showHomeIndoorSourcePopup =
    showHomeIndoorSourcePopup;

function updateOutdoorDistanceCategoryLabels() {

    const container =
        document.getElementById(
            "outdoorDistanceCategory"
        );

    if (!container) {
        return;
    }


    const units =
        typeof getProjectUnits === "function"
            ? getProjectUnits()
            : "m";


    const labels = {

        under_1m:
            units === "ft"
                ? "Less than 3 ft"
                : "Less than 1 m",

        "1_3m":
            units === "ft"
                ? "3-10 ft"
                : "1-3 m",

        "3_10m":
            units === "ft"
                ? "10-30 ft"
                : "3-10 m",

        "10_30m":
            units === "ft"
                ? "30-100 ft"
                : "10-30 m",

        "30_100m":
            units === "ft"
                ? "100-300 ft"
                : "30-100 m",

        "100m_plus":
            units === "ft"
                ? "300 ft or more"
                : "100 m or more",

        unknown:
            "Unknown"
    };


    container
        .querySelectorAll(
            'input[name="outdoorDistanceCategory"]'
        )
        .forEach(input => {

            const span =
                input.parentElement?.querySelector(
                    "span"
                );

            if (!span) {
                return;
            }


            const label =
                labels[input.value];

            if (label) {
                span.textContent =
                    label;
            }

        });
}



/* ==================================================
   HOME WELLNESS — LIFESTYLE SIZE SELECTOR
   Home-only. Keeps existing placement mechanism.
================================================== */

const HOME_LIFESTYLE_PRESETS = {
    bed: {
        title: "Sleep Zone",
        presets: {
            single: {
                label: "Single bed",
                image: "assets/lifestyle-zones/sleep/single-bed.png",
                furniture: [0.9, 2.0],
                zone: [1.8, 3.0]
            },
            double: {
                label: "Double bed",
                image: "assets/lifestyle-zones/sleep/double-bed.png",
                furniture: [1.6, 2.0],
                zone: [2.5, 3.0]
            },
            king: {
                label: "King size bed",
                image: "assets/lifestyle-zones/sleep/king-bed.png",
                furniture: [1.8, 2.0],
                zone: [2.7, 3.0]
            },
            daybed: {
                label: "Day bed / sofa bed",
                image: "assets/lifestyle-zones/sleep/daybed-sofa-bed.png",
                furniture: [1.0, 2.0],
                zone: [1.5, 2.5]
            },
            custom: {
                label: "Custom size",
                image: "assets/lifestyle-zones/sleep/custom.png",
                furniture: [1.6, 2.0],
                zone: [2.5, 3.0]
            }
        }
    },


    work_area: {
        title: "Work Zone",
        presets: {
            compact: {
                label: "Compact desk",
                image: "assets/lifestyle-zones/work/work-compact-desk.png",
                furniture: [0.8, 0.6],
                zone: [1.8, 1.6]
            },
            standard: {
                label: "Standard desk",
                image: "assets/lifestyle-zones/work/work-standard-desk.png",
                furniture: [1.2, 0.7],
                zone: [2.2, 1.8]
            },
            large: {
                label: "Large desk (L-shape)",
                image: "assets/lifestyle-zones/work/work-large-desk.png",
                furniture: [1.6, 1.4],
                zone: [2.6, 2.4]
            },
            shared: {
                label: "Shared workspace",
                image: "assets/lifestyle-zones/work/work-shared-workspace.png",
                furniture: [2.0, 0.8],
                zone: [3.0, 2.0]
            },
            custom: {
                label: "Custom size",
                image: "assets/lifestyle-zones/work/work-custom-size.png",
                furniture: [1.2, 0.7],
                zone: [2.2, 1.8]
            }
        }
    },



    sofa: {
        title: "Rest Zone",
        presets: {
            armchair: {
                label: "Armchair",
                image: "assets/lifestyle-zones/rest/rest-armchair.png",
                furniture: [0.9, 0.9],
                zone: [1.8, 1.8]
            },
            small: {
                label: "Small sofa",
                image: "assets/lifestyle-zones/rest/rest-small-sofa.png",
                furniture: [1.5, 0.9],
                zone: [2.4, 1.8]
            },
            large: {
                label: "Large sofa",
                image: "assets/lifestyle-zones/rest/rest-large-sofa.png",
                furniture: [2.0, 0.9],
                zone: [2.9, 1.8]
            },
            sectional: {
                label: "Sectional sofa",
                image: "assets/lifestyle-zones/rest/rest-sectional-sofa.png",
                furniture: [2.6, 1.8],
                zone: [3.5, 2.7]
            },
            custom: {
                label: "Custom size",
                image: "assets/lifestyle-zones/rest/rest-custom-size.png",
                furniture: [1.5, 0.9],
                zone: [2.4, 1.8]
            }
        }
    },



    child_area: {
        title: "Child Zone",
        presets: {
            bed: {
                label: "Child bed",
                image: "assets/lifestyle-zones/child/child-bed.png",
                furniture: [0.9, 1.8],
                zone: [1.8, 2.8]
            },
            play: {
                label: "Play area",
                image: "assets/lifestyle-zones/child/child-play-area.png",
                furniture: [2.0, 2.0],
                zone: [2.5, 2.5]
            },
            study: {
                label: "Study area",
                image: "assets/lifestyle-zones/child/child-study-area.png",
                furniture: [1.0, 0.6],
                zone: [2.0, 1.8]
            },
            combined: {
                label: "Combined room",
                image: "assets/lifestyle-zones/child/child-combined-room.png",
                furniture: [2.5, 2.5],
                zone: [3.0, 3.0]
            },
            custom: {
                label: "Custom size",
                image: "assets/lifestyle-zones/child/child-custom-size.png",
                furniture: [2.0, 2.0],
                zone: [2.5, 2.5]
            }
        }
    }

};

let pendingLifestyleType = null;

let editingLifestyleZone = null;

function openLifestyleSizeSelector(type) {
    if (window.AppMode?.current !== "home") {
        console.warn("Lifestyle size selector is Home Wellness only.");
        return;
    }

    const config = HOME_LIFESTYLE_PRESETS[type];
    const modal = document.getElementById("homeLifestyleSizeModal");
    const select = document.getElementById("homeLifestylePreset");
    const title = document.getElementById("homeLifestyleSizeTitle");

    if (!config || !modal || !select || !title) {
        console.error(
            "Lifestyle size selector elements/config missing.",
            { type, config, modal, select, title }
        );
        return;
    }

    pendingLifestyleType = type;

    title.textContent = config.title;
    select.replaceChildren();

    // Build preset options.
    Object.entries(config.presets).forEach(([key, preset]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = preset.label;
        select.appendChild(option);
    });

    const editingZone = editingLifestyleZone;

    // Restore the selected preset for the existing zone.
    if (editingZone) {
        const savedKey =
            editingZone.lifestylePreset ||
            editingZone.lifestylePresetKey ||
            editingZone.presetKey;

        if (savedKey && config.presets[savedKey]) {
            select.value = savedKey;
        }
    }

    // Apply the selected preset's dimensions.
    // Standard presets use fixed dimensions; only Custom is editable.
    updateLifestylePresetFields();


    renderLifestylePresetCards();
    updateLifestyleDimensionGuidelines();

    modal.style.display = "flex";


}


function updateLifestylePresetFields() {
    const config = HOME_LIFESTYLE_PRESETS[pendingLifestyleType];
    const select = document.getElementById("homeLifestylePreset");
    const preset = config?.presets?.[select?.value];

    if (!preset || !select) return;

    const isCustom = select.value === "custom";

    const values = isCustom
        ? null
        : {
            homeLifestyleFurnitureWidth: preset.furniture[0],
            homeLifestyleFurnitureDepth: preset.furniture[1],
            homeLifestyleZoneWidth: preset.zone[0],
            homeLifestyleZoneDepth: preset.zone[1]
        };

    const fields = [
        "homeLifestyleFurnitureWidth",
        "homeLifestyleFurnitureDepth",
        "homeLifestyleZoneWidth",
        "homeLifestyleZoneDepth"
    ];

    fields.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        input.readOnly = !isCustom;

        if (!isCustom && values) {
            input.value = values[id];
        }
    });

    const customDimensions = document.getElementById(
        "homeLifestyleCustomDimensions"
    );

    if (customDimensions) {
        customDimensions.style.display = isCustom ? "grid" : "none";
    }

    updateLifestyleDimensionGuidelines();
}

function updateLifestylePresetOverlay(preset, isCustom) {
    const overlay = document.getElementById("homeLifestylePresetOverlay");
    if (!overlay) return;

    if (!preset || isCustom) {
        overlay.style.display = "none";
        overlay.innerHTML = "";
        return;
    }

    const [fw, fd] = preset.furniture;
    const [zw, zd] = preset.zone;

    if (![fw, fd, zw, zd].every(Number.isFinite) ||
        fw <= 0 || fd <= 0 || zw <= 0 || zd <= 0) {
        overlay.style.display = "none";
        overlay.innerHTML = "";
        return;
    }

    const select = document.getElementById("homeLifestylePreset");
    const presetKey = select?.value;

    const isPlayArea = presetKey === "play";
    const isCombined = presetKey === "combined";
    const isActivityArea = isPlayArea || isCombined;

    const footprintLabel = isPlayArea
        ? "Play area footprint"
        : "Combined activity footprint";

    const depthLabel = isPlayArea
        ? "Play area depth"
        : "Combined activity depth";

    // Fixed SVG coordinate system.
    const W = 420;
    const H = 280;
    const cx = W / 2;
    const cy = H / 2;

    const scale = Math.min(
        220 / Math.max(zw, fw),
        150 / Math.max(zd, fd)
    );

    const zoneW = zw * scale;
    const zoneH = zd * scale;
    const furnitureW = fw * scale;
    const furnitureH = fd * scale;

    const zx = cx - zoneW / 2;
    const zy = cy - zoneH / 2;
    const fx = cx - furnitureW / 2;
    const fy = cy - furnitureH / 2;

    const zr = zx + zoneW;
    const zb = zy + zoneH;
    const fr = fx + furnitureW;
    const fb = fy + furnitureH;

    // Dimension line positions.
    const zoneWidthY = Math.max(26, zy - 28);
    const zoneDepthX = Math.min(W - 34, zr + 27);
    const footprintWidthY = Math.min(H - 27, zb + 24);
    const footprintDepthX = Math.max(34, zx - 27);

    const label = (x, y, text, color, rotate = false) => `
  <g ${rotate ? `transform="rotate(-90 ${x} ${y})"` : ""}>
    <text x="${x}" y="${y}"
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="Arial, sans-serif"
      font-size="11"
      font-weight="600"
      fill="${color}"
      stroke="#f5f1e9"
      stroke-width="2.5"
      paint-order="stroke fill">
      ${text}
    </text>
  </g>
`;

    overlay.style.display = "block";

    overlay.innerHTML = `
        <svg
            viewBox="0 0 ${W} ${H}"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Furniture footprint and measurement zone dimensions"
            style="display:block;width:100%;height:100%;">

            <defs>
                <marker
                    id="presetZoneArrow"
                    markerWidth="7"
                    markerHeight="7"
                    refX="3.5"
                    refY="3.5"
                    orient="auto-start-reverse">
                    <path d="M0,0 L7,3.5 L0,7 Z" fill="#1677ee"/>
                </marker>

                <marker
                    id="presetFurnitureArrow"
                    markerWidth="7"
                    markerHeight="7"
                    refX="3.5"
                    refY="3.5"
                    orient="auto-start-reverse">
                    <path d="M0,0 L7,3.5 L0,7 Z" fill="#475569"/>
                </marker>
            </defs>

            <!-- Measurement zone boundary -->
            <rect
                x="${zx}"
                y="${zy}"
                width="${zoneW}"
                height="${zoneH}"
                rx="2"
                fill="#60a5fa"
                fill-opacity="0.08"
                stroke="#1677ee"
                stroke-width="2"
                stroke-dasharray="6 4"/>

            <!-- Activity footprint boundary -->
            ${isActivityArea ? `
                <rect
                    x="${fx}"
                    y="${fy}"
                    width="${furnitureW}"
                    height="${furnitureH}"
                    rx="3"
                    fill="#ec4899"
                    fill-opacity="0.04"
                    stroke="#db4b91"
                    stroke-width="1.8"
                    stroke-dasharray="5 4"/>
            ` : ""}

            <!-- Measurement zone width -->
            <line
                x1="${zx}"
                y1="${zoneWidthY}"
                x2="${zr}"
                y2="${zoneWidthY}"
                stroke="#1677ee"
                stroke-width="1.6"
                marker-start="url(#presetZoneArrow)"
                marker-end="url(#presetZoneArrow)"/>

            ${label(
        cx,
        zoneWidthY - 12,
        "Measurement zone width",
        "#1261c9"
    )}

            <!-- Measurement zone depth -->
            <line
                x1="${zoneDepthX}"
                y1="${zy}"
                x2="${zoneDepthX}"
                y2="${zb}"
                stroke="#1677ee"
                stroke-width="1.6"
                marker-start="url(#presetZoneArrow)"
                marker-end="url(#presetZoneArrow)"/>

            ${label(
        zoneDepthX + 12,
        cy,
        "Measurement zone depth",
        "#1261c9",
        true
    )}

            <!-- Footprint / furniture width -->
            <line
                x1="${fx}"
                y1="${footprintWidthY}"
                x2="${fr}"
                y2="${footprintWidthY}"
                stroke="${isActivityArea ? "#db4b91" : "#475569"}"
                stroke-width="1.6"
                marker-start="url(#presetFurnitureArrow)"
                marker-end="url(#presetFurnitureArrow)"/>

            ${label(
        cx,
        footprintWidthY + 13,
        isActivityArea ? footprintLabel : "Furniture width",
        isActivityArea ? "#b83280" : "#334155"
    )}

            <!-- Footprint / furniture depth -->
            <line
                x1="${footprintDepthX}"
                y1="${fy}"
                x2="${footprintDepthX}"
                y2="${fb}"
                stroke="${isActivityArea ? "#db4b91" : "#475569"}"
                stroke-width="1.6"
                marker-start="url(#presetFurnitureArrow)"
                marker-end="url(#presetFurnitureArrow)"/>

            ${label(
        footprintDepthX - 12,
        cy,
        isActivityArea ? depthLabel : "Furniture depth",
        isActivityArea ? "#b83280" : "#334155",
        true
    )}

        </svg>
    `;
}


function renderLifestylePresetCards() {
    const type = pendingLifestyleType;
    const config = HOME_LIFESTYLE_PRESETS[type];
    const container = document.getElementById("homeLifestylePresetCards");
    const select = document.getElementById("homeLifestylePreset");

    if (!config || !container || !select) return;

    const presets = config.presets;
    const selectedKey = select.value;

    container.innerHTML = "";
    Object.entries(presets).forEach(([key, preset]) => {
        const isSelected = key === selectedKey;

        const card = document.createElement("button");

        card.type = "button";
        card.dataset.presetKey = key;
        card.setAttribute("aria-pressed", String(isSelected));
        card.setAttribute("aria-label", `${preset.label}${isSelected ? ", selected" : ""}`);

        Object.assign(card.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "8px",
            padding: "8px",
            minWidth: "0",
            width: "100%",
            boxSizing: "border-box",
            border: isSelected ? "2px solid #3985f6" : "1px solid #dbe3ed",
            borderRadius: "10px",
            background: isSelected ? "#eff6ff" : "#ffffff",
            cursor: "pointer",
            color: "#243247",
            font: "inherit",
            textAlign: "left",
            transition: "border-color 120ms ease, background 120ms ease"
        });

        // Preset illustration
        const image = document.createElement("img");

        image.src = preset.image || "";
        image.alt = preset.label;
        image.loading = "lazy";

        Object.assign(image.style, {
            display: "block",
            width: "100%",
            aspectRatio: "4 / 3",
            objectFit: "contain",
            borderRadius: "6px",
            background: "#f5f1e9"
        });

        image.onerror = () => {
            image.style.visibility = "hidden";
        };

        // Card information
        const details = document.createElement("div");

        Object.assign(details.style, {
            display: "grid",
            gridTemplateColumns: "20px minmax(0, 1fr)",
            columnGap: "6px",
            rowGap: "4px",
            alignItems: "start",
            minWidth: "0"
        });

        // Selection indicator
        const indicator = document.createElement("span");

        indicator.textContent = isSelected ? "●" : "○";

        Object.assign(indicator.style, {
            fontSize: "17px",
            lineHeight: "1.2",
            color: isSelected ? "#3985f6" : "#94a3b8",
            textAlign: "center"
        });

        const textContent = document.createElement("div");

        Object.assign(textContent.style, {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "0"
        });

        // Preset name
        const name = document.createElement("strong");

        name.textContent = preset.label;

        Object.assign(name.style, {
            fontSize: "12px",
            lineHeight: "1.35",
            overflowWrap: "anywhere",
            color: "#172b4d"
        });

        textContent.appendChild(name);

        // Furniture and measurement-zone dimensions
        if (key === "custom") {
            const customText = document.createElement("span");

            customText.textContent = "Set your own dimensions";

            Object.assign(customText.style, {
                fontSize: "11px",
                lineHeight: "1.35",
                color: "#64748b"
            });

            textContent.appendChild(customText);
        } else {
            const [fw, fd] = preset.furniture;
            const [zw, zd] = preset.zone;

            const furnitureDimensions = document.createElement("span");
            furnitureDimensions.textContent =
                `${fw.toFixed(1)} × ${fd.toFixed(1)} m`;

            Object.assign(furnitureDimensions.style, {
                fontSize: "11px",
                lineHeight: "1.35",
                color: "#64748b"
            });

            const zoneDimensions = document.createElement("span");
            zoneDimensions.textContent =
                `Zone: ${zw.toFixed(1)} × ${zd.toFixed(1)} m`;

            Object.assign(zoneDimensions.style, {
                fontSize: "11px",
                lineHeight: "1.35",
                color: "#64748b"
            });

            textContent.append(furnitureDimensions, zoneDimensions);
        }

        details.append(indicator, textContent);
        card.append(image, details);

        // Select preset and refresh dimensions, preview and card states
        card.addEventListener("click", () => {
            if (select.value === key) return;

            select.value = key;
            updateLifestylePresetFields();
            renderLifestylePresetCards();
        });

        container.appendChild(card);
    });

    // Update the main Lifestyle preset preview.

    const previewImage =
        document.getElementById("homeLifestylePreviewImage");

    const previewTitle =
        document.getElementById("homeLifestylePreviewTitle");

    const previewDescription =
        document.getElementById("homeLifestylePreviewDescription");

    const previewDimensions =
        document.getElementById("homeLifestylePreviewDimensions");

    const customDimensions =
        document.getElementById("homeLifestyleCustomDimensions");

    const dimensionGuidance =
        document.getElementById("homeLifestyleDimensionGuidance");

    const selectedPreset = presets[selectedKey];
    const isCustom = selectedKey === "custom";

    if (selectedPreset) {
        if (previewImage) {
            previewImage.src = selectedPreset.image || "";
            previewImage.alt = selectedPreset.label || "Lifestyle furniture";
            previewImage.style.display =
                (!isCustom && selectedPreset.image) ? "block" : "none";

            // Combined room: visually reduce the illustration,
            // keeping the measurement overlay at its original size.
            previewImage.style.transform =
                selectedKey === "combined" ? "scale(0.82)" : "scale(1)";

            previewImage.style.transformOrigin = "center center";
            previewImage.style.transition = "transform 180ms ease";
        }

        updateLifestylePresetOverlay(selectedPreset, isCustom);
        updateLifestyleCustomPreview();

        if (previewTitle) {
            previewTitle.textContent = selectedPreset.label || "Custom size";
        }

        if (previewDescription) {
            previewDescription.textContent = isCustom
                ? "Enter your furniture and measurement zone dimensions."
                : "Furniture and measurement zone dimensions.";
        }


        if (previewDimensions) {
            if (isCustom) {
                previewDimensions.innerHTML = "";
                previewDimensions.style.display = "none";
            } else {
                const [fw, fd] = selectedPreset.furniture;
                const [zw, zd] = selectedPreset.zone;

                previewDimensions.style.display = "block";

                const isPlayArea = selectedKey === "play";
                const isCombinedRoom = selectedKey === "combined";

                const footprintTitle = isPlayArea
                    ? "Play area footprint (m)"
                    : isCombinedRoom
                        ? "Combined activity footprint (m)"
                        : "Furniture size (m)";

                const footprintDescription = isPlayArea
                    ? "Defined play area dimensions"
                    : isCombinedRoom
                        ? "Combined activity area dimensions"
                        : "Physical furniture dimensions";

                previewDimensions.innerHTML = `
            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:10px;
            ">
                <div style="
                    grid-column:1/-1;
                    display:flex;
                    align-items:center;
                    gap:8px;
                    padding-bottom:8px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <span style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        width:32px;
                        height:32px;
                        flex-shrink:0;
                        border-radius:50%;
                        background:#eff6ff;
                        color:#2563eb;
                        font-size:17px;
                    ">▤</span>
                    <div>
                        <div style="
                            font-size:13px;
                            font-weight:700;
                            color:#172b4d;
                        ">${footprintTitle}</div>
                        <div style="
                            font-size:11px;
                            color:#64748b;
                        ">${footprintDescription}</div>
                    </div>
                </div>

                <div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:4px;">
                        Width
                    </div>
                    <div style="
                        padding:8px 10px;
                        border-radius:7px;
                        background:#f1f5f9;
                        color:#172b4d;
                        font-size:14px;
                        font-weight:600;
                    ">${fw.toFixed(1)} m</div>
                </div>

                <div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:4px;">
                        Depth
                    </div>
                    <div style="
                        padding:8px 10px;
                        border-radius:7px;
                        background:#f1f5f9;
                        color:#172b4d;
                        font-size:14px;
                        font-weight:600;
                    ">${fd.toFixed(1)} m</div>
                </div>

                <div style="
                    grid-column:1/-1;
                    display:flex;
                    align-items:center;
                    gap:8px;
                    margin-top:8px;
                    padding-top:10px;
                    border-top:1px solid #e2e8f0;
                ">
                    <span style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        width:32px;
                        height:32px;
                        flex-shrink:0;
                        border-radius:50%;
                        background:#eff6ff;
                        color:#2563eb;
                        font-size:17px;
                    ">📏</span>
                    <div>
                        <div style="
                            font-size:13px;
                            font-weight:700;
                            color:#172b4d;
                        ">Measurement zone size (m)</div>
                        <div style="
                            font-size:11px;
                            color:#64748b;
                        ">EMF measurement area around the furniture</div>
                    </div>
                </div>

                <div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:4px;">
                        Width
                    </div>
                    <div style="
                        padding:8px 10px;
                        border-radius:7px;
                        background:#f1f5f9;
                        color:#172b4d;
                        font-size:14px;
                        font-weight:600;
                    ">${zw.toFixed(1)} m</div>
                </div>

                <div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:4px;">
                        Depth
                    </div>
                    <div style="
                        padding:8px 10px;
                        border-radius:7px;
                        background:#f1f5f9;
                        color:#172b4d;
                        font-size:14px;
                        font-weight:600;
                    ">${zd.toFixed(1)} m</div>
                </div>
            </div>
        `;
            }
        }


        if (customDimensions) {
            customDimensions.style.display = isCustom ? "grid" : "none";
        }

        if (dimensionGuidance) {
            dimensionGuidance.style.display = isCustom ? "block" : "none";
        }
    }

    updateLifestyleCustomPreview();
    validateLifestyleCustomDimensions();
}


function updateLifestyleCustomPreview() {
    const select = document.getElementById("homeLifestylePreset");
    const image = document.getElementById("homeLifestylePreviewImage");
    const preview = document.getElementById("homeLifestyleCustomPreview");

    if (!select || !image || !preview) return;

    const isCustom = select.value === "custom";

    image.style.display = isCustom ? "none" : "block";
    preview.style.display = isCustom ? "flex" : "none";

    if (!isCustom) {
        preview.innerHTML = "";
        return;
    }

    const getNumber = id => {
        const el = document.getElementById(id);
        return !el || el.value.trim() === "" ? NaN : Number(el.value);
    };

    const fw = getNumber("homeLifestyleFurnitureWidth");
    const fd = getNumber("homeLifestyleFurnitureDepth");
    const zw = getNumber("homeLifestyleZoneWidth");
    const zd = getNumber("homeLifestyleZoneDepth");

    if (![fw, fd, zw, zd].every(Number.isFinite) ||
        fw <= 0 || fd <= 0 || zw <= 0 || zd <= 0) {
        preview.innerHTML = `
          <div style="color:#64748b;font-size:13px;text-align:center;padding:20px;">
            Enter all four dimensions to preview the furniture and zone.
          </div>`;
        return;
    }

    // One shared scale preserves the real proportions.
    // The complete drawing fits regardless of the entered dimensions.
    const scale = Math.min(
        220 / Math.max(fw, zw),
        145 / Math.max(fd, zd)
    );

    const zoneW = zw * scale;
    const zoneH = zd * scale;
    const furnitureW = fw * scale;
    const furnitureH = fd * scale;

    const cx = 210;
    const cy = 145;

    const zx = cx - zoneW / 2;
    const zy = cy - zoneH / 2;
    const fx = cx - furnitureW / 2;
    const fy = cy - furnitureH / 2;

    const zr = zx + zoneW;
    const zb = zy + zoneH;
    const fr = fx + furnitureW;
    const fb = fy + furnitureH;

    const fmt = v => Number(v.toFixed(2)).toString();

    // Place labels outside the drawing to avoid overlap.
    const zoneWidthY = Math.max(25, zy - 24);
    const zoneDepthX = Math.min(365, zr + 25);
    const furnitureDepthX = Math.max(55, fx - 23);
    const furnitureWidthY = Math.min(255, Math.max(fb + 18, zb + 22));

    preview.innerHTML = `
      <svg viewBox="0 0 420 280"
        role="img"
        aria-label="Proportional furniture and measurement zone preview"
        style="display:block;width:100%;height:100%;max-height:220px;overflow:visible;">

        <defs>
          <marker id="lifestyleZoneArrow"
            markerWidth="6" markerHeight="6" refX="3" refY="3"
            orient="auto-start-reverse">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/>
          </marker>
          <marker id="lifestyleFurnitureArrow"
            markerWidth="6" markerHeight="6" refX="3" refY="3"
            orient="auto-start-reverse">
            <path d="M0,0 L6,3 L0,6 Z" fill="#475569"/>
          </marker>
        </defs>

        <!-- Measurement zone -->
        <rect x="${zx}" y="${zy}" width="${zoneW}" height="${zoneH}"
          rx="3" fill="#dbeafe" fill-opacity="0.5"
          stroke="#2563eb" stroke-width="2" stroke-dasharray="6 4"/>

        <!-- Furniture -->
        <rect x="${fx}" y="${fy}" width="${furnitureW}" height="${furnitureH}"
          rx="3" fill="#94a3b8" fill-opacity="0.55"
          stroke="#475569" stroke-width="1.7"/>

        <!-- Zone width -->
        <line x1="${zx}" y1="${zoneWidthY}"
          x2="${zr}" y2="${zoneWidthY}"
          stroke="#2563eb" stroke-width="1.5"
          marker-start="url(#lifestyleZoneArrow)"
          marker-end="url(#lifestyleZoneArrow)"/>
        <text x="${cx}" y="${zoneWidthY - 7}"
          text-anchor="middle" font-size="11" font-weight="600"
          fill="#1d4ed8">ZONE WIDTH: ${fmt(zw)} m</text>

        <!-- Zone depth -->
        <line x1="${zoneDepthX}" y1="${zy}"
          x2="${zoneDepthX}" y2="${zb}"
          stroke="#2563eb" stroke-width="1.5"
          marker-start="url(#lifestyleZoneArrow)"
          marker-end="url(#lifestyleZoneArrow)"/>
        <text x="${zoneDepthX + 10}" y="${cy}"
          text-anchor="middle" font-size="10" font-weight="600"
          fill="#1d4ed8"
          transform="rotate(90 ${zoneDepthX + 10} ${cy})">
          ZONE DEPTH: ${fmt(zd)} m
        </text>

        <!-- Furniture width -->
        <line x1="${fx}" y1="${furnitureWidthY}"
          x2="${fr}" y2="${furnitureWidthY}"
          stroke="#475569" stroke-width="1.5"
          marker-start="url(#lifestyleFurnitureArrow)"
          marker-end="url(#lifestyleFurnitureArrow)"/>
        <text x="${cx}" y="${furnitureWidthY + 13}"
          text-anchor="middle" font-size="10" font-weight="600"
          fill="#334155">
          FURNITURE WIDTH: ${fmt(fw)} m
        </text>

        <!-- Furniture depth -->
        <line x1="${furnitureDepthX}" y1="${fy}"
          x2="${furnitureDepthX}" y2="${fb}"
          stroke="#475569" stroke-width="1.5"
          marker-start="url(#lifestyleFurnitureArrow)"
          marker-end="url(#lifestyleFurnitureArrow)"/>
        <text x="${furnitureDepthX - 9}" y="${cy}"
          text-anchor="middle" font-size="10" font-weight="600"
          fill="#334155"
          transform="rotate(-90 ${furnitureDepthX - 9} ${cy})">
          FURNITURE DEPTH: ${fmt(fd)} m
        </text>
      </svg>

      <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:2px;font-size:10px;color:#475569;">
        <span><span style="color:#2563eb;">━━</span> Measurement zone</span>
        <span><span style="color:#475569;">━━</span> Furniture</span>
      </div>
    `;
}


function updateLifestyleDimensionGuidelines() {
    const units = window.getProjectUnits?.() ||
        window.AppState?.project?.units ||
        "m";

    const isFeet = ["ft", "feet", "foot", "imperial"].includes(
        String(units).toLowerCase()
    );

    const convert = value => isFeet
        ? `${(value * 3.280839895).toFixed(1)} ft`
        : `${value.toFixed(1)} m`;

    const guidelines = [
        ["homeLifestyleGuidelineFurnitureWidth", 0.5, 3, "Furniture width"],
        ["homeLifestyleGuidelineFurnitureDepth", 1.5, 3, "Furniture depth"],
        ["homeLifestyleGuidelineZoneWidth", 1, 10, "Measurement zone width"],
        ["homeLifestyleGuidelineZoneDepth", 1, 10, "Measurement zone depth"]
    ];

    guidelines.forEach(([id, min, max, label]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML =
                `${label}: <strong>${convert(min)}–${convert(max)}</strong>`;
        }
    });
}


function validateLifestyleCustomDimensions() {
    const select = document.getElementById("homeLifestylePreset");
    const error = document.getElementById("homeLifestyleDimensionError");

    if (!select || select.value !== "custom") {
        if (error) error.style.display = "none";
        return true;
    }

    const fields = [
        { id: "homeLifestyleFurnitureWidth", label: "Furniture width", min: 0.5, max: 3 },
        { id: "homeLifestyleFurnitureDepth", label: "Furniture depth", min: 1.5, max: 3 },
        { id: "homeLifestyleZoneWidth", label: "Measurement zone width", min: 1, max: 10 },
        { id: "homeLifestyleZoneDepth", label: "Measurement zone depth", min: 1, max: 10 }
    ];

    let message = "";

    for (const field of fields) {
        const input = document.getElementById(field.id);
        const value = Number(input?.value);

        if (!input || input.value.trim() === "" || !Number.isFinite(value)) {
            message = `${field.label}: enter a valid number.`;
            break;
        }

        if (value < field.min || value > field.max) {
            message = `${field.label} must be between ${field.min} and ${field.max} m.`;
            break;
        }
    }

    if (!message) {
        const fw = Number(document.getElementById("homeLifestyleFurnitureWidth").value);
        const fd = Number(document.getElementById("homeLifestyleFurnitureDepth").value);
        const zw = Number(document.getElementById("homeLifestyleZoneWidth").value);
        const zd = Number(document.getElementById("homeLifestyleZoneDepth").value);

        if (zw < fw || zd < fd) {
            message = "The measurement zone must be at least as large as the furniture in both dimensions.";
        }
    }

    if (error) {
        error.textContent = message;
        error.style.display = message ? "block" : "none";
    }

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) input.setAttribute("aria-invalid", String(!!message));
    });

    return !message;
}



(function setupLifestyleCustomPreview() {
    if (window.__lifestyleCustomPreviewReady) return;
    window.__lifestyleCustomPreviewReady = true;

    const fieldIds = new Set([
        "homeLifestyleFurnitureWidth",
        "homeLifestyleFurnitureDepth",
        "homeLifestyleZoneWidth",
        "homeLifestyleZoneDepth"
    ]);

    document.addEventListener("input", event => {
        if (!fieldIds.has(event.target?.id)) return;

        updateLifestyleCustomPreview();
        validateLifestyleCustomDimensions();
    });

    document.addEventListener("change", event => {
        if (!fieldIds.has(event.target?.id)) return;

        updateLifestyleCustomPreview();
        validateLifestyleCustomDimensions();
    });
})();




function closeLifestyleSizeSelector() {
    const modal = document.getElementById("homeLifestyleSizeModal");
    if (modal) modal.style.display = "none";

    pendingLifestyleType = null;
}

// Home Wellness Lifestyle modal keyboard and backdrop behavior.
(function setupLifestyleModalInteractions() {
    if (window.__lifestyleModalInteractionsReady) return;
    window.__lifestyleModalInteractionsReady = true;

    document.addEventListener("keydown", event => {
        const modal = document.getElementById("homeLifestyleSizeModal");

        if (!modal || modal.style.display === "none") return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeLifestyleSizeSelector();
            return;
        }

        if (event.key === "Enter") {
            const target = event.target;

            // Allow Enter to select a card or interact with form controls.
            if (
                target?.tagName === "BUTTON" ||
                target?.tagName === "SELECT" ||
                target?.tagName === "TEXTAREA"
            ) {
                return;
            }

            // Do not trigger placement while the user is editing a number.
            if (target?.tagName === "INPUT") return;

            event.preventDefault();
            confirmLifestyleSizeSelector();
        }
    });

    document.addEventListener("click", event => {
        const modal = document.getElementById("homeLifestyleSizeModal");

        if (!modal || modal.style.display === "none") return;

        // Close only when the backdrop itself is clicked.
        if (event.target === modal) {
            closeLifestyleSizeSelector();
        }
    });
})();
function confirmLifestyleSizeSelector() {
    if (window.AppMode?.current !== "home") return;

    const type = pendingLifestyleType;
    if (!type) return;

    const select = document.getElementById("homeLifestylePreset");
    const presetKey = select?.value;
    const preset = HOME_LIFESTYLE_PRESETS[type]?.presets?.[presetKey];

    if (!preset) {
        console.error("[LIFESTYLE EDIT] Preset not found", {
            type,
            presetKey
        });
        return;
    }

    const isCustom = presetKey === "custom";

    // Read the dimensions currently displayed in the selector.
    const readDimension = id =>
        Number(document.getElementById(id)?.value);

    const furnitureWidth = readDimension("homeLifestyleFurnitureWidth");
    const furnitureDepth = readDimension("homeLifestyleFurnitureDepth");
    const zoneWidth = readDimension("homeLifestyleZoneWidth");
    const zoneDepth = readDimension("homeLifestyleZoneDepth");

    if (isCustom && !validateLifestyleCustomDimensions()) {
        return;
    }

    if (
        ![furnitureWidth, furnitureDepth, zoneWidth, zoneDepth].every(
            value => Number.isFinite(value) && value > 0
        )
    ) {
        alert("Enter valid dimensions greater than zero.");
        return;
    }

    if (zoneWidth < furnitureWidth || zoneDepth < furnitureDepth) {
        alert(
            "The measurement zone must be at least as large as the furniture footprint."
        );
        return;
    }

    // Standard presets must always use their configured dimensions.
    const dimensions = isCustom
        ? {
            furnitureWidth,
            furnitureDepth,
            measurementZoneWidth: zoneWidth,
            measurementZoneDepth: zoneDepth
        }
        : {
            furnitureWidth: preset.furniture[0],
            furnitureDepth: preset.furniture[1],
            measurementZoneWidth: preset.zone[0],
            measurementZoneDepth: preset.zone[1]
        };

    const selectedData = {
        presetKey,
        presetLabel: preset.label,
        presetImage: preset.image,
        ...dimensions
    };

    // EDIT EXISTING ZONE — do not start a new placement.
    if (editingLifestyleZone) {
        const zone = editingLifestyleZone;

        // Keep both preset keys in sync for existing readers.
        zone.lifestylePreset = presetKey;
        zone.lifestylePresetKey = presetKey;
        zone.lifestylePresetLabel = preset.label;

        zone.furnitureDimensions = {
            ...(zone.furnitureDimensions || {}),
            width: dimensions.furnitureWidth,
            depth: dimensions.furnitureDepth
        };

        zone.measurementZoneDimensions = {
            ...(zone.measurementZoneDimensions || {}),
            width: dimensions.measurementZoneWidth,
            depth: dimensions.measurementZoneDepth
        };

        // Update the preset image if this preset defines one.
        if (preset.image) {
            zone.lifestylePresetImage = preset.image;
        }

        editingLifestyleZone = null;

        closeLifestyleSizeSelector();

        // Persist and redraw the same zone.
        window.saveProject?.();
        window.requestRender?.();

        if (typeof showLifestyleAreaPopup === "function") {
            showLifestyleAreaPopup(zone);
        } else {
            window.showLifestyleAreaPopup?.(zone);
        }

        console.log("[LIFESTYLE EDIT SAVED]", {
            id: zone.id,
            presetKey: zone.lifestylePreset,
            presetLabel: zone.lifestylePresetLabel,
            furnitureDimensions: zone.furnitureDimensions,
            measurementZoneDimensions: zone.measurementZoneDimensions
        });

        return;
    }

    // CREATE NEW ZONE — preserve the existing placement workflow.
    window.objectTool ??= {};
    window.objectTool.pendingLifestyleDimensions = selectedData;

    closeLifestyleSizeSelector();
    window.startObjectPlacement(type);
}

window.openLifestyleSizeSelector = openLifestyleSizeSelector;
window.closeLifestyleSizeSelector = closeLifestyleSizeSelector;
window.confirmLifestyleSizeSelector = confirmLifestyleSizeSelector;


window.updateOutdoorDistanceCategoryLabels =
    updateOutdoorDistanceCategoryLabels;


// ==================================================
// HOME WELLNESS — LIFESTYLE ZONE ROOM BOUNDARY CHECK
// ==================================================

function isLifestyleMeasurementZoneInsideRoom(zone, floor) {
    if (!zone || !floor || !Array.isArray(floor.rooms)) {
        return null;
    }

    const scale = Number(floor.currentScale);
    const widthM = Number(zone.measurementZoneDimensions?.width);
    const depthM = Number(zone.measurementZoneDimensions?.depth);

    if (
        !Number.isFinite(scale) || scale <= 0 ||
        !Number.isFinite(widthM) || widthM <= 0 ||
        !Number.isFinite(depthM) || depthM <= 0
    ) {
        return null;
    }

    const widthPx = widthM / scale;
    const depthPx = depthM / scale;

    const corners = [
        { x: zone.x - widthPx / 2, y: zone.y - depthPx / 2 },
        { x: zone.x + widthPx / 2, y: zone.y - depthPx / 2 },
        { x: zone.x + widthPx / 2, y: zone.y + depthPx / 2 },
        { x: zone.x - widthPx / 2, y: zone.y + depthPx / 2 }
    ];

    const pointInsidePolygon = (point, polygon) => {
        if (!Array.isArray(polygon) || polygon.length < 3) {
            return false;
        }

        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const a = polygon[i];
            const b = polygon[j];

            const intersects =
                ((a.y > point.y) !== (b.y > point.y)) &&
                (point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x);

            if (intersects) inside = !inside;
        }

        return inside;
    };

    const candidateRooms = floor.rooms.filter(room =>
        Array.isArray(room.polygon) &&
        room.polygon.length >= 3 &&
        pointInsidePolygon({ x: zone.x, y: zone.y }, room.polygon)
    );

    if (!candidateRooms.length) {
        return false;
    }

    return candidateRooms.some(room =>
        corners.every(corner => pointInsidePolygon(corner, room.polygon))
    );
}

function updateLifestyleAreaBoundaryWarning(zone, floor) {
    const warning = document.getElementById("lifestyleAreaBoundaryWarning");
    if (!warning) return;

    const result = isLifestyleMeasurementZoneInsideRoom(zone, floor);

    // Unknown geometry should not show a potentially false warning.
    warning.style.display = result === false ? "flex" : "none";
}

window.showLifestyleAreaPopup =
    showLifestyleAreaPopup;

window.showHoursPopup =
    showHoursPopup;

window.updateZoneHours =
    updateZoneHours;

// =====================
// ðŸ”¥ EXPORTS
// =====================

window.startObjectPlacement =
    startObjectPlacement;

window.placeObject =
    placeObject;

window.drawObjects =
    drawObjects;


/* HOME WELLNESS — LIFESTYLE PLACEMENT PREVIEW */
window.drawHomeLifestylePlacementPreview = function () {
    const tool = window.objectTool;
    const pending = tool?.pendingLifestyleDimensions;
    const floor = window.AppState?.project?.floors?.[
        window.AppState?.project?.currentFloorIndex || 0
    ];
    const canvas = window.canvas;

    if (
        !pending ||
        !tool?.currentType ||
        !tool?.previewPoint ||
        !floor ||
        !canvas ||
        !Number.isFinite(floor.currentScale) ||
        floor.currentScale <= 0
    ) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load the exact selected Lifestyle preset image.
    window.homeLifestylePresetImages ??= {};

    let img = null;

    if (pending.presetImage) {
        img = window.homeLifestylePresetImages[pending.presetImage];

        if (!img) {
            img = new Image();
            img.src = pending.presetImage;

            window.homeLifestylePresetImages[pending.presetImage] = img;
        }
    }
    const center = window.EMFViewport?.worldPoint?.(tool.previewPoint);

    if (!center) return;

    // currentScale = meters per floor-plan pixel.
    const furnitureWidthPx =
        pending.furnitureWidth / floor.currentScale;
    const furnitureDepthPx =
        pending.furnitureDepth / floor.currentScale;

    const zoneWidthPx =
        pending.measurementZoneWidth / floor.currentScale;
    const zoneDepthPx =
        pending.measurementZoneDepth / floor.currentScale;

    // Project world dimensions into canvas/screen coordinates.
    const projectPoint = (x, y) =>
        window.EMFViewport.worldPoint({ x, y });

    const fw = projectPoint(
        tool.previewPoint.x + furnitureWidthPx / 2,
        tool.previewPoint.y
    );
    const fd = projectPoint(
        tool.previewPoint.x,
        tool.previewPoint.y + furnitureDepthPx / 2
    );
    const zw = projectPoint(
        tool.previewPoint.x + zoneWidthPx / 2,
        tool.previewPoint.y
    );
    const zd = projectPoint(
        tool.previewPoint.x,
        tool.previewPoint.y + zoneDepthPx / 2
    );

    const furnitureW = Math.abs(fw.x - center.x) * 2;
    const furnitureH = Math.abs(fd.y - center.y) * 2;
    const zoneW = Math.abs(zw.x - center.x) * 2;
    const zoneH = Math.abs(zd.y - center.y) * 2;

    ctx.save();

    // Measurement-zone boundary.
    ctx.beginPath();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(37,99,235,0.95)";
    ctx.fillStyle = "rgba(37,99,235,0.09)";
    ctx.rect(
        center.x - zoneW / 2,
        center.y - zoneH / 2,
        zoneW,
        zoneH
    );
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Furniture preview.
    ctx.globalAlpha = 0.72;

    if (img?.complete && img.naturalWidth > 0) {
        ctx.drawImage(
            img,
            center.x - furnitureW / 2,
            center.y - furnitureH / 2,
            furnitureW,
            furnitureH
        );
    } else {
        ctx.strokeStyle = "#2563eb";
        ctx.strokeRect(
            center.x - furnitureW / 2,
            center.y - furnitureH / 2,
            furnitureW,
            furnitureH
        );
    }

    ctx.restore();
};


// =====================
// ðŸ”¥ PRELOAD OBJECT IMAGES
// =====================

Object.entries(
    OBJECT_CONFIGS
).forEach(

    ([type, config]) => {

        const img =
            new Image();

        img.src =
            config.image;

        OBJECT_IMAGES[type] =
            img;
    }
);

window.calculateRoomRisk =
    calculateRoomRisk;

window.getRoomRecommendations =
    getRoomRecommendations;

window.calculateBedRisk =
    calculateBedRisk;

window.getObjectAtPoint =
    getObjectAtPoint;

window.OBJECT_CONFIGS =
    OBJECT_CONFIGS;

console.log("OBJECT_V1_FINISHED");
