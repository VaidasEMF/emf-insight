// =====================
// 🔥 DRAG STATE
// =====================

window.dragState = {

    isDragging: false,

    draggedObject: null
};

// =====================
// 🔥 START DRAG
// =====================

function startDrag(
    object
) {

    console.error(
        "START DRAG",
        object
    );

    const popup =
        document.getElementById(
            "sourceDistancePopup"
        );

    if (popup) {

        popup.style.display =
            "none";
    }

    const hours =
        document.getElementById(
            "hoursPopup"
        );

    if (hours) {

        hours.style.display =
            "none";
    }

    if (!object) {
        return;
    }

    dragState.isDragging =
        true;

    dragState.draggedObject =
        object;

    console.log(
        "START DRAG:",
        object.type
    );
}

// =====================
// 🔥 UPDATE DRAG
// =====================

// =====================
// 🔥 UPDATE DRAG
// =====================

function updateDrag(
    x,
    y
) {

    if (
        !dragState.isDragging ||
        !dragState.draggedObject
    ) {
        return;
    }

    const obj =
        dragState.draggedObject;


    // ==================================================
    // 🔥 OUTDOOR DRAG VALIDATION
    // ==================================================

    const isOutdoor =
        window.OUTDOOR_SOURCE_TYPES?.includes(
            obj.type
        );


    if (
        isOutdoor
    ) {

        // ------------------------------------------------
        // x / y are WORLD coordinates.
        //
        // Convert candidate point to SCREEN coordinates
        // before comparing against viewport bounds.
        // ------------------------------------------------

        const candidateScreen =
            typeof EMFViewport?.worldToScreen ===
                "function"

                ? EMFViewport.worldToScreen(
                    x,
                    y
                )

                : null;


        const planBounds =
            typeof EMFViewport?.planBounds ===
                "function"

                ? EMFViewport.planBounds()

                : null;


        const outdoorBounds =
            typeof EMFViewport?.outdoorBounds ===
                "function"

                ? EMFViewport.outdoorBounds(
                    0.20
                )

                : null;


        // ------------------------------------------------
        // SAFETY
        // ------------------------------------------------

        if (
            !candidateScreen ||
            !planBounds ||
            !outdoorBounds
        ) {

            return;
        }


        // ------------------------------------------------
        // CANDIDATE INSIDE OUTDOOR WORKSPACE
        // ------------------------------------------------

        const insideOutdoorBounds =

            candidateScreen.x >=
            outdoorBounds.left &&

            candidateScreen.x <=
            outdoorBounds.right &&

            candidateScreen.y >=
            outdoorBounds.top &&

            candidateScreen.y <=
            outdoorBounds.bottom;


        // ------------------------------------------------
        // CANDIDATE INSIDE FLOOR PLAN
        // ------------------------------------------------

        const insidePlan =

            candidateScreen.x >=
            planBounds.left &&

            candidateScreen.x <=
            planBounds.right &&

            candidateScreen.y >=
            planBounds.top &&

            candidateScreen.y <=
            planBounds.bottom;


        // ------------------------------------------------
        // OUTDOOR SOURCE MAY ONLY EXIST IN THE
        // SURROUNDING 20% AREA
        // ------------------------------------------------

        if (
            !insideOutdoorBounds ||
            insidePlan
        ) {

            // Keep the object at its last valid position.
            return;
        }
    }


    // ==================================================
    // 🔥 MOVE OBJECT
    // ==================================================

    obj.x +=
        (x - obj.x) * 0.35;

    obj.y +=
        (y - obj.y) * 0.35;


    // ==================================================
    // 🔥 AUTO RELINK
    // ==================================================

    if (

        window.DISTANCE_SOURCE_TYPES
            ?.includes(
                obj.type
            )

    ) {

        const nearestZone =

            findNearestZone?.(
                obj
            );

        if (nearestZone) {

            obj.linkedZoneId =
                nearestZone.id;
        }
    }


    requestRender?.();
}

// =====================
// 🔥 STOP DRAG
// =====================

function stopDrag() {

    console.error(
        "STOP DRAG CALLED"
    );

    console.trace();

    dragState.isDragging =
        false;

    dragState.draggedObject =
        null;

    console.log(
        "DRAG STOP"
    );

    //updateInsights?.();
}

// =====================
// 🔥 EXPORTS
// =====================

window.startDrag =
    startDrag;

window.updateDrag =
    updateDrag;

window.stopDrag =
    stopDrag;