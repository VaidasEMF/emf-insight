// ==================================================
// 🔥 MAP LAYER IDS
// ==================================================

const layerControlIds = [

    "toggleRooms",

    "toggleZones",

    "toggleRoomGrid",

    "toggleZoneGrid",

    "toggleSources",

    "toggleHeatmap"
];


// ==================================================
// 🔥 LAYER → VISIBILITY STATE
// ==================================================

function getLayerControlState() {

    const state = {};

    layerControlIds.forEach(id => {

        const el =
            document.getElementById(
                id
            );

        if (!el) {
            return;
        }

        state[id] =
            el.classList.contains(
                "active"
            );
    });

    return state;
}


// ==================================================
// 🔥 APPLY LAYER STATE
// ==================================================

function applyLayerControlState(
    state
) {

    if (!state) {
        return;
    }

    layerControlIds.forEach(id => {

        const el =
            document.getElementById(
                id
            );

        if (!el) {
            return;
        }

        if (
            typeof state[id] !==
            "boolean"
        ) {
            return;
        }

        el.classList.toggle(
            "active",
            state[id]
        );

        el.setAttribute(
            "aria-pressed",
            state[id]
                ? "true"
                : "false"
        );
    });
}

function restoreLayerSettings() {

    // ==================================================
    // LOAD SAVED SETTINGS
    // ==================================================

    let saved = null;

    try {

        saved =
            localStorage.getItem(
                "layer_settings"
            );

    }
    catch (error) {

        console.warn(
            "⚠️ Unable to read layer settings:",
            error
        );

        return;
    }

    // No saved settings → keep defaults
    if (!saved) {

        console.log(
            "ℹ️ No saved layer settings"
        );

        return;
    }

    let savedState = null;

    try {

        savedState =
            JSON.parse(
                saved
            );

    }
    catch (error) {

        console.warn(
            "⚠️ Invalid saved layer settings:",
            error
        );

        return;
    }

    if (
        !savedState ||
        typeof savedState !== "object"
    ) {

        return;
    }

    // ==================================================
    // MAP ID → INTERNAL STATE
    // ==================================================

    const stateMap = {

        toggleRooms:
            "rooms",

        toggleZones:
            "zones",

        toggleRoomGrid:
            "roomGrid",

        toggleZoneGrid:
            "zoneGrid",

        toggleSources:
            "sources",

        toggleHeatmap:
            "heatmap"
    };

    // ==================================================
    // ENSURE INTERNAL STATE
    // ==================================================

    window.layerVisibility ??= {

        rooms:
            true,

        zones:
            true,

        roomGrid:
            true,

        zoneGrid:
            true,

        sources:
            true,

        heatmap:
            false
    };

    // ==================================================
    // RESTORE STATE + UI
    // ==================================================

    Object.entries(
        stateMap
    ).forEach(
        ([id, stateKey]) => {

            const value =
                savedState[id];

            // Ignore missing / invalid values
            if (
                typeof value !==
                "boolean"
            ) {

                return;
            }

            // ------------------------------------------
            // Internal render state
            // ------------------------------------------

            window.layerVisibility[
                stateKey
            ] =
                value;

            // ------------------------------------------
            // MAP button
            // ------------------------------------------

            const el =
                document.getElementById(
                    id
                );

            if (!el) {

                return;
            }

            el.classList.toggle(
                "active",
                value
            );

            el.setAttribute(
                "aria-pressed",
                value
                    ? "true"
                    : "false"
            );
        }
    );

    console.log(
        "✅ LAYER SETTINGS RESTORED",
        {
            saved:
                savedState,

            visibility:
                window.layerVisibility
        }
    );

    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();
}

// ==================================================
// 🔥 SAVE SETTINGS
// ==================================================

function saveLayerSettings() {

    const state =
        getLayerControlState();

    localStorage.setItem(

        "layer_settings",

        JSON.stringify(
            state
        )
    );
}





// ==================================================
// 🔥 SET SINGLE LAYER
// ==================================================

// ==================================================
// 🔥 SET MAP LAYER VISIBILITY
// ==================================================
//
// Single source of truth for Business map layers.
//
// UI button state and canvas render state are updated
// together.
//
// toggleRooms     → rooms
// toggleZones     → zones
// toggleRoomGrid  → roomGrid
// toggleZoneGrid  → zoneGrid
// toggleSources   → sources
// toggleHeatmap   → heatmap
// ==================================================

function setLayerVisibility(
    id,
    visible
) {

    const el =
        document.getElementById(
            id
        );


    // ==================================================
    // UI
    // ==================================================

    if (el) {

        el.classList.toggle(
            "active",
            visible
        );

        el.setAttribute(
            "aria-pressed",
            visible
                ? "true"
                : "false"
        );
    }


    // ==================================================
    // SINGLE RENDER STATE
    // ==================================================

    window.layerVisibility ??= {

        rooms:
            true,

        zones:
            true,

        roomGrid:
            true,

        zoneGrid:
            true,

        sources:
            true,

        heatmap:
            true
    };


    // ==================================================
    // MAP BUTTON → RENDER STATE
    // ==================================================

    const stateMap = {

        toggleRooms:
            "rooms",

        toggleZones:
            "zones",

        toggleRoomGrid:
            "roomGrid",

        toggleZoneGrid:
            "zoneGrid",

        toggleSources:
            "sources",

        toggleHeatmap:
            "heatmap"
    };


    const stateKey =
        stateMap[id];


    if (
        stateKey
    ) {

        window.layerVisibility[
            stateKey
        ] =
            visible;
    }


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "🔥 LAYER VISIBILITY",
        {
            id,
            visible,
            stateKey,
            state:
                window.layerVisibility
        }
    );


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();
}


// ==================================================
// 🔥 GET SINGLE LAYER
// ==================================================

function isLayerVisible(
    id
) {

    const el =
        document.getElementById(
            id
        );

    if (!el) {
        return false;
    }

    return el.classList.contains(
        "active"
    );
}


// ==================================================
// 🔥 BIND EVENTS
// ==================================================

// ==================================================
// 🔥 INIT MAP LAYER EVENTS
// ==================================================

function initLayerEvents() {

    // ==================================================
    // MAP LAYER → INTERNAL STATE
    // ==================================================

    const stateMap = {

        toggleRooms:
            "rooms",

        toggleZones:
            "zones",

        toggleRoomGrid:
            "roomGrid",

        toggleZoneGrid:
            "zoneGrid",

        toggleSources:
            "sources",

        toggleHeatmap:
            "heatmap"
    };


    // ==================================================
    // ENSURE SINGLE RENDER STATE
    // ==================================================

    window.layerVisibility ??= {

        rooms:
            true,

        zones:
            true,

        roomGrid:
            true,

        zoneGrid:
            true,

        sources:
            true,

        heatmap:
            false
    };


    // ==================================================
    // BIND EVENTS
    // ==================================================

    layerControlIds.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (!el) {

                console.warn(
                    "⚠️ Layer control not found:",
                    id
                );

                return;
            }


            // ------------------------------------------------
            // Prevent duplicate listeners
            // ------------------------------------------------

            if (
                el.dataset.layerBound ===
                "true"
            ) {

                return;
            }


            el.dataset.layerBound =
                "true";


            const stateKey =
                stateMap[id];


            if (!stateKey) {

                return;
            }


            // ==================================================
            // INITIAL UI SYNC
            // ==================================================

            const initialVisible =
                window.layerVisibility[
                stateKey
                ] !== false;


            el.classList.toggle(
                "active",
                initialVisible
            );


            el.setAttribute(
                "aria-pressed",
                initialVisible
                    ? "true"
                    : "false"
            );


            // ==================================================
            // CLICK
            // ==================================================

            el.addEventListener(
                "click",
                () => {

                    const current =
                        window.layerVisibility[
                        stateKey
                        ] !== false;


                    const next =
                        !current;


                    // ------------------------------------------
                    // SINGLE SOURCE OF TRUTH
                    // ------------------------------------------

                    setLayerVisibility(
                        id,
                        next
                    );


                    // ------------------------------------------
                    // 🔥 PERSIST INDIVIDUAL TOGGLE
                    // ------------------------------------------

                    saveLayerSettings();


                    console.log(
                        "🎛 LAYER TOGGLE",
                        {
                            id,
                            stateKey,
                            previous:
                                current,
                            next,
                            visibility:
                                window.layerVisibility
                        }
                    );
                }
            );
        }
    );


    // ==================================================
    // INITIAL RENDER
    // ==================================================

    requestRender?.();
}

// ==================================================
// 🔥 LABELS
// ==================================================

function getLayerLabel(
    id
) {

    const labels = {

        toggleRooms:
            "Rooms",

        toggleZones:
            "Zones",

        toggleRoomGrid:
            "Room Grid",

        toggleZoneGrid:
            "Zone Grid",

        toggleSources:
            "Sources",

        toggleHeatmap:
            "Heatmap"
    };

    return (
        labels[id] ||
        id
    );
}


// ==================================================
// 🔥 PRESETS
// ==================================================

function applyLayerPreset(
    type
) {

    // ----------------------------------------------
    // ANALYSIS
    // ----------------------------------------------

    if (
        type === "analysis"
    ) {

        setLayerVisibility(
            "toggleRooms",
            true
        );

        setLayerVisibility(
            "toggleZones",
            true
        );

        setLayerVisibility(
            "toggleRoomGrid",
            true
        );

        setLayerVisibility(
            "toggleZoneGrid",
            true
        );

        setLayerVisibility(
            "toggleHeatmap",
            false
        );

        setLayerVisibility(
            "toggleSources",
            true
        );
    }


    // ----------------------------------------------
    // HEATMAP
    // ----------------------------------------------

    else if (
        type === "heatmap"
    ) {

        setLayerVisibility(
            "toggleRooms",
            false
        );

        setLayerVisibility(
            "toggleZones",
            false
        );

        setLayerVisibility(
            "toggleRoomGrid",
            false
        );

        setLayerVisibility(
            "toggleZoneGrid",
            false
        );

        setLayerVisibility(
            "toggleHeatmap",
            true
        );

        setLayerVisibility(
            "toggleSources",
            false
        );
    }


    // ----------------------------------------------
    // SOURCES
    // ----------------------------------------------

    else if (
        type === "sources"
    ) {

        setLayerVisibility(
            "toggleRooms",
            true
        );

        setLayerVisibility(
            "toggleZones",
            false
        );

        setLayerVisibility(
            "toggleRoomGrid",
            false
        );

        setLayerVisibility(
            "toggleZoneGrid",
            false
        );

        setLayerVisibility(
            "toggleHeatmap",
            false
        );

        setLayerVisibility(
            "toggleSources",
            true
        );
    }


    // ----------------------------------------------
    // CLEAN
    // ----------------------------------------------

    else if (
        type === "clean"
    ) {

        setLayerVisibility(
            "toggleRooms",
            true
        );

        setLayerVisibility(
            "toggleZones",
            false
        );

        setLayerVisibility(
            "toggleRoomGrid",
            false
        );

        setLayerVisibility(
            "toggleZoneGrid",
            false
        );

        setLayerVisibility(
            "toggleHeatmap",
            false
        );

        setLayerVisibility(
            "toggleSources",
            false
        );
    }


    saveLayerSettings?.();

    requestRender?.();

    updateStatus?.(
        "🎛 Layer preset: " +
        type
    );
}


// ==================================================
// 🔥 EXPORTS
// ==================================================

window.getLayerControlState =
    getLayerControlState;

window.applyLayerControlState =
    applyLayerControlState;

window.saveLayerSettings =
    saveLayerSettings;


window.setLayerVisibility =
    setLayerVisibility;

window.isLayerVisible =
    isLayerVisible;

window.initLayerEvents =
    initLayerEvents;

window.restoreLayerSettings =
    restoreLayerSettings;

window.applyLayerPreset =
    applyLayerPreset;