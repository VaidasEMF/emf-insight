console.log("object_v1.js STARTED");

window.objectTool = {

    active: false,

    currentType: null,

    objects: [],

    editingHoursId: null,

    // =====================
    // 🔥 INTERACTION
    // =====================

    selectedObjectId: null,

    selectedToolbarAction: null,

    draggingObject: false
};

/// =====================
// 🔥 OBJECT IMAGES
// =====================

const OBJECT_IMAGES = {};

// =====================
// 🔥 OBJECT CONFIGS
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
    // 🔥 LEGACY SOURCE ALIAS
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
// 🔥 PRELOAD IMAGES
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
// 🔥 START OBJECT PLACEMENT
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
            "❌ UNKNOWN OBJECT PLACEMENT TYPE",
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
        "🔥 CURRENT OBJECT PLACEMENT",
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
        "🔥 OUTDOOR CONTEXT INPUT",
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

        console.warn(
            "⚠️ OUTDOOR CONTEXT: NO LIFESTYLE AREAS",
            {
                floorId:
                    targetFloor?.id ||
                    null
            }
        );

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
            "⚠️ OUTDOOR CONTEXT: INVALID SOURCE POSITION",
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


        console.log(
            "🔥 CHECK LIFESTYLE AREA",
            {
                id:
                    zone.id,

                type:
                    zone.type,

                zoneType:
                    zone.zoneType,

                x:
                    zoneX,

                y:
                    zoneY
            }
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

            console.warn(
                "⚠️ SKIP LIFESTYLE AREA — INVALID X/Y",
                {
                    id:
                        zone.id,

                    type:
                        zone.type,

                    x:
                        zone.x,

                    y:
                        zone.y
                }
            );

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


        console.log(
            "🔥 LIFESTYLE CONTEXT DISTANCE",
            {
                zoneId:
                    zone.id,

                zoneType:
                    zone.type,

                distance
            }
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
        "🔥 OUTDOOR NEAREST LIFESTYLE AREA",
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
// 🔥 REFRESH OUTDOOR → LIFESTYLE CONTEXT
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
// 🔥 REFRESH OUTDOOR → LIFESTYLE RELATIONSHIPS
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
                "🔥 OUTDOOR → LIFESTYLE RELATIONSHIPS",
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
            "⚠️ PLACE OBJECT: NO CURRENT FLOOR"
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
        "🔥 PLACE OBJECT",
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
                "⚠️ LIFESTYLE AREA MUST BE INSIDE FLOOR PLAN"
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
        // 🔥 REFRESH HOME WORKFLOW LOCKS
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
                "⚠️ OUTDOOR SOURCE MUST BE OUTSIDE FLOOR PLAN"
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
            "🔥 PROPERTY OUTDOOR SOURCE ADDED",
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
        // 🔥 NEW OUTDOOR SOURCE
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


        console.log(
            "🔥 INDOOR SOURCE ADDED",
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
        "↕",
        guideLeft + 45,
        guideTop + 29
    );

    ctx.fillText(
        "↔",
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
// 🔥 DRAW OBJECTS
// =====================

// ==================================================
// 🔥 DRAW OBJECTS
// ==================================================

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
        "🔥 DRAW OBJECTS",
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
    // 🔥 OUTDOOR → LIFESTYLE VISUAL LINKS
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
                    "❌ OBJECT CONFIG NOT FOUND",
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
            // sleep → bed.png
            // work  → work.png
            // relax → sofa.png
            // child → child.png
            //
            // ==================================================

            const img =
                OBJECT_IMAGES?.[
                configType
                ];


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
            // 🔥 OBJECT LABEL
            // ==================================================
            //
            // Indoor source artwork already provides its own
            // visual identification, so do not duplicate the
            // source name above the icon.
            //
            // Lifestyle Areas and Outdoor Sources keep the
            // canvas label.
            // ==================================================

            const isOutdoorSource =
                window.OUTDOOR_SOURCE_TYPES?.includes(
                    obj.type
                ) ||
                obj.placementType ===
                "outdoor";


            const isIndoorCanvasLabelSource =
                window.INDOOR_SOURCE_TYPES?.includes(
                    obj.type
                ) ||
                obj.placementType ===
                "indoor";


            const shouldDrawCanvasLabel =
                !isIndoorCanvasLabelSource ||
                isOutdoorSource;


            if (
                shouldDrawCanvasLabel &&
                meta.label
            ) {

                ctx.fillStyle =
                    "#1e293b";

                ctx.textAlign =
                    "center";

                ctx.font =
                    "600 10px Inter";


                ctx.fillText(

                    meta.label,

                    p.x,

                    p.y -
                    meta.height / 2 -
                    8
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
        "✅ DRAW OBJECTS COMPLETE",
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
// 🔥 ROOM SCORE
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
// 🔥 ROOM RECOMMENDATIONS
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
        // 🔥 WIFI
        // =====================

        if (
            obj.type === "wifi"
        ) {

            recommendations.push(

                "Consider moving WiFi further from sleeping areas"
            );
        }

        // =====================
        // 🔥 PANEL
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
        // 🔥 SMART METER
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
        // 🔥 TOWER
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
        // 🔥 EV
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
// 🔥 SELECT OBJECT
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
// 🔥 UPDATE HOURS
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
// HOME — INDOOR SOURCE → LIFESTYLE AREA DISTANCE
// ==================================================
//
// Same floor:
//     calibrated floor-plan distance
//
// d = sqrt(dx² + dy²) × metersPerPixel
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
            "⚠️ INDOOR DISTANCE — SCALE UNAVAILABLE",
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
    // CROSS FLOOR — NO DEFENSIBLE Z
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
// HOME — DELETE LIFESTYLE AREA CONFIRMATION
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
                    🗑
                </div>


                <button
                    type="button"
                    class="delete-measurement-close"
                    id="deleteLifestyleAreaClose"
                    aria-label="Close"
                >
                    ✕
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
                        ℹ
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
                    🗑 Delete Lifestyle Area
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
                    🗑
                </div>


                <button
                    type="button"
                    class="delete-measurement-close"
                    id="deleteIndoorSourceClose"
                    aria-label="Close"
                >
                    ✕
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
                        ℹ
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
                    🗑 Delete Indoor Source
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
// HOME — LIFESTYLE AREA POPUP
// ==================================================

function showLifestyleAreaPopup(
    zone,
    options = {}
) {

    if (!zone) {

        console.warn(
            "⚠️ LIFESTYLE POPUP — NO ZONE"
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
            "❌ LIFESTYLE POPUP INIT FAILED",
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
            "⚠️ LIFESTYLE POPUP — NO CURRENT FLOOR"
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
    // 🔥 LIFESTYLE AREA POPUP — DRAG
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
    // REAL ASSET ICON
    // ==================================================

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


    // ==================================================
    // SUMMARY
    // ==================================================

    if (
        summary
    ) {

        summary.innerHTML = `

            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                "
            >

                ${zoneImage
                ? `
                            <img
                                src="${zoneImage}"
                                alt=""
                                style="
                                    width:30px;
                                    height:30px;
                                    object-fit:contain;
                                    flex:0 0 30px;
                                "
                            >
                        `
                : ""
            }

                <span
                    style="
                        font-size:14px;
                        font-weight:700;
                        color:#0f172a;
                    "
                >
                    ${zoneLabel}
                </span>

            </div>

        `;
    }


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
    // TIME SPENT — MOUSE WHEEL
    //
    // Wheel up   = +0.5 h
    // Wheel down = -0.5 h
    //
    // Range = 0–24 h/day
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
    // TIME SPENT — ARROW KEYS
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
        //          ↓
        //     calibrated floor scale
        //          ↓
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
        // Calculate the real source → Lifestyle Area
        // distance for EVERY Indoor Source on the
        // current floor.
        //
        // This avoids:
        //     linkedZoneIds → arbitrary relationship
        //
        // and avoids:
        //     canvas pixels → displayed metres
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
        // Sort nearest → farthest.
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
            "🔥 HOME LIFESTYLE → INDOOR CONTEXT",
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
                    "📡";

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
                `${state} · ${secondary}`;


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

    const rect =
        canvas.getBoundingClientRect();


    const p =
        EMFViewport.worldPoint(
            zone
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


    left =
        Math.max(
            16,
            left
        );


    top =
        Math.max(
            16,
            top
        );


    popup.style.left =
        `${left}px`;


    popup.style.top =
        `${top}px`;


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
                    "✅ LIFESTYLE AREA SAVED",
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
                            "🗑️ LIFESTYLE AREA DELETED",
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
                // ESC → CLOSE WITHOUT SAVING
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
                // ENTER → SAVE
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


    console.log(
        "🔥 LIFESTYLE AREA POPUP OPEN",
        {
            id:
                zone.id,

            type:
                zone.type,

            zoneType:
                zone.zoneType,

            hours:
                currentHours,

            indoorSources:
                floor.sources?.length ||
                0,

            outdoorSources:
                AppState.project
                    ?.outdoorSources
                    ?.length ||
                0
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
            "⚠️ HOME INDOOR POPUP — NO SOURCE"
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
            "❌ HOME INDOOR POPUP INIT FAILED",
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
            "⚠️ HOME INDOOR POPUP — NO FLOOR"
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

        summary.innerHTML = `
            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                "
            >

                ${sourceImage
                ? `
                            <img
                                src="${sourceImage}"
                                alt=""
                                style="
                                    width:30px;
                                    height:30px;
                                    object-fit:contain;
                                    flex:0 0 30px;
                                "
                            >
                        `
                : `
                            <div
                                style="
                                    width:30px;
                                    height:30px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-size:20px;
                                "
                            >
                                📡
                            </div>
                        `
            }

                <span
                    style="
                        font-size:14px;
                        font-weight:700;
                        color:#0f172a;
                    "
                >
                    ${sourceLabel}
                </span>

            </div>
        `;
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
                            "•";
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
                    "✅ HOME INDOOR SOURCE SAVED",
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
    // DELETE — CONFIRMATION
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
                            "🗑️ HOME INDOOR SOURCE DELETED",
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
        "🔥 HOME INDOOR SOURCE POPUP OPEN",
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
                ? "3–10 ft"
                : "1–3 m",

        "3_10m":
            units === "ft"
                ? "10–30 ft"
                : "3–10 m",

        "10_30m":
            units === "ft"
                ? "30–100 ft"
                : "10–30 m",

        "30_100m":
            units === "ft"
                ? "100–300 ft"
                : "30–100 m",

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

window.updateOutdoorDistanceCategoryLabels =
    updateOutdoorDistanceCategoryLabels;


window.showLifestyleAreaPopup =
    showLifestyleAreaPopup;

window.showHoursPopup =
    showHoursPopup;

window.updateZoneHours =
    updateZoneHours;

// =====================
// 🔥 EXPORTS
// =====================

window.startObjectPlacement =
    startObjectPlacement;

window.placeObject =
    placeObject;

window.drawObjects =
    drawObjects;



// =====================
// 🔥 PRELOAD OBJECT IMAGES
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