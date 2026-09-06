// =====================================================
// 🔥 CREATE DEFAULT FLOOR
// =====================================================
//
// PHI FLOOR FACTORY
//
// A Floor belongs to an Assessment context.
//
// HOME:
//     Property Assessment
//     → Home Floor
//
// PROFESSIONAL:
//     Professional Assessment
//     → Professional Floor
//
// The spatial structures are intentionally separate.
//
// =====================================================

function createDefaultFloor(
    name = "Main Floor",
    context = null
) {

    // ==================================================
    // 🔥 RESOLVE FLOOR CONTEXT
    // ==================================================

    let floorContext =
        context;

    // --------------------------------------------------
    // Explicit HOME
    // --------------------------------------------------

    if (
        floorContext === "home"
    ) {

        floorContext =
            "home";
    }

    // --------------------------------------------------
    // Explicit BUSINESS / PROFESSIONAL
    // --------------------------------------------------

    else if (
        floorContext === "business" ||
        floorContext === "professional"
    ) {

        floorContext =
            "professional";
    }

    // --------------------------------------------------
    // Existing App Mode
    //
    // Compatibility fallback for existing calls:
    //
    // createDefaultFloor()
    // --------------------------------------------------

    else if (
        window.AppMode?.current ===
        "home"
    ) {

        floorContext =
            "home";
    }

    else {

        floorContext =
            "professional";
    }


    // ==================================================
    // 🔥 CREATE FLOOR ID
    // ==================================================

    let floorId =
        null;

    if (
        floorContext ===
        "home"
    ) {

        floorId =
            window.PhiIdFactory
                ?.createHomeFloorId?.();

    }

    else {

        floorId =
            window.PhiIdFactory
                ?.createProfessionalFloorId?.();
    }


    // ==================================================
    // 🔥 SAFETY FALLBACK
    // ==================================================
    //
    // This protects the existing engine if the ID factory
    // is temporarily unavailable.
    //
    // The fallback is intentionally kept compatible with
    // the previous floor ID structure.
    //
    // ==================================================

    if (
        !floorId
    ) {

        floorId =
            "floor_" +
            Date.now();
    }


    // ==================================================
    // 🔥 FLOOR OBJECT
    // ==================================================

    return {

        id:
            floorId,

        // ------------------------------------------------
        // PHI CONTEXT
        // ------------------------------------------------

        assessmentContext:
            floorContext,

        name,

        // =================================================
        // PROFESSIONAL SPATIAL STRUCTURE
        // =================================================

        rooms: [],

        zones: [],

        // =================================================
        // HOME / PROFESSIONAL SOURCES
        // =================================================
        //
        // Home:
        //     Indoor Sources
        //
        // Professional:
        //     Professional Sources
        //
        // Kept on Floor because the existing engine
        // already expects these collections here.
        //
        // =================================================

        indoorSources: [],

        outdoorSources: [],

        // =================================================
        // LEGACY SOURCE COMPATIBILITY
        // =================================================
        //
        // Existing engine code still expects:
        //
        //     floor.sources
        //
        // Keep during migration.
        //
        // =================================================

        sources: [],

        // =================================================
        // FLOOR PLAN
        // =================================================

        image: null,

        imageData: null,

        imageFileName: null,

        imageFileSize: null,

        // =================================================
        // SCALE
        // =================================================

        scaleConfirmed: false,

        currentScale: 0,

        // =================================================
        // PHI 3D FLOOR ELEVATION
        // =================================================
        //
        // Vertical position of this floor relative to the
        // building reference level.
        //
        // This is NOT ceiling height.
        //
        // =================================================

        elevation_m: 0,

        // =================================================
        // FLOOR HEIGHT
        // =================================================

        ceilingHeight: 2.7,

        // =================================================
        // CANVAS
        // =================================================

        canvasWidth: 0,

        canvasHeight: 0
    };
}


// =====================================================
// 🔥 EXPORT
// =====================================================

window.createDefaultFloor =
    createDefaultFloor;