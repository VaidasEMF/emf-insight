function handleImageUpload(evt) {

    console.log(
        "================================="
    );

    console.log(
        "🔥 IMAGE UPLOAD START"
    );

    // ==================================================
    // FILE
    // ==================================================

    const file =
        evt.target.files?.[0];

    if (!file) {

        console.warn(
            "🔥 IMAGE UPLOAD — NO FILE"
        );

        return;
    }

    console.log(
        "🔥 IMAGE FILE",
        {
            name:
                file.name,

            size:
                file.size,

            type:
                file.type
        }
    );

    // ==================================================
    // PROJECT DEBUG
    // ==================================================

    console.log(
        "🔥 IMAGE UPLOAD PROJECT STATE",
        {
            hasAppState:
                !!window.AppState,

            hasProject:
                !!AppState?.project,

            projectId:
                AppState?.project?.project_id ??
                AppState?.project?.id ??
                null,

            floorCount:
                AppState?.project?.floors?.length ||
                0,

            currentFloorIndex:
                AppState?.project?.currentFloorIndex
        }
    );

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    let currentFloor = null;

    // ------------------------------------------
    // 1. CANONICAL GET CURRENT FLOOR
    // ------------------------------------------

    if (
        typeof getCurrentFloor ===
        "function"
    ) {

        currentFloor =
            getCurrentFloor();

        console.log(
            "🔥 CURRENT FLOOR FROM getCurrentFloor()",
            currentFloor
        );
    }

    // ------------------------------------------
    // 2. ACTIVE FLOOR INDEX
    // ------------------------------------------

    if (!currentFloor) {

        const floorIndex =
            Number.isInteger(
                AppState?.project
                    ?.currentFloorIndex
            )
                ? AppState.project
                    .currentFloorIndex
                : 0;

        currentFloor =
            AppState?.project
                ?.floors?.[
            floorIndex
            ];

        console.log(
            "🔥 CURRENT FLOOR FROM INDEX",
            {
                floorIndex,
                currentFloor
            }
        );
    }

    // ------------------------------------------
    // 3. SINGLE FLOOR FALLBACK
    // ------------------------------------------

    if (
        !currentFloor &&
        AppState?.project
            ?.floors?.length === 1
    ) {

        currentFloor =
            AppState.project.floors[0];

        AppState.project
            .currentFloorIndex = 0;

        console.log(
            "🔥 CURRENT FLOOR SINGLE FLOOR FALLBACK"
        );
    }

    // ==================================================
    // VALIDATE FLOOR
    // ==================================================

    if (!currentFloor) {

        console.error(
            "🔥🔥🔥 IMAGE UPLOAD — NO CURRENT FLOOR",
            {
                project:
                    AppState?.project,

                floors:
                    AppState?.project?.floors,

                currentFloorIndex:
                    AppState?.project
                        ?.currentFloorIndex
            }
        );

        return;
    }

    console.log(
        "🔥 IMAGE UPLOAD CURRENT FLOOR",
        {
            id:
                currentFloor.id,

            name:
                currentFloor.name,

            imageData:
                !!currentFloor.imageData,

            imageFileName:
                currentFloor.imageFileName
        }
    );

    // ==================================================
    // 🔥 ENSURE CURRENT FLOOR IS IN CANONICAL PROJECT
    // ==================================================

    const projectFloors =
        AppState?.project?.floors;

    if (
        Array.isArray(projectFloors)
    ) {

        const existingIndex =
            projectFloors.findIndex(
                floor =>
                    floor === currentFloor ||
                    (
                        floor?.id &&
                        currentFloor?.id &&
                        floor.id === currentFloor.id
                    )
            );

        // --------------------------------------------------
        // FLOOR IS NOT IN PROJECT
        // --------------------------------------------------

        if (
            existingIndex === -1
        ) {

            projectFloors.push(
                currentFloor
            );

            AppState.project.currentFloorIndex =
                projectFloors.length - 1;

            console.error(
                "🔥🔥🔥 CURRENT FLOOR ADDED TO PROJECT",
                {
                    floorId:
                        currentFloor.id,

                    floorName:
                        currentFloor.name,

                    floorCount:
                        projectFloors.length,

                    currentFloorIndex:
                        AppState.project
                            .currentFloorIndex
                }
            );
        }

        // --------------------------------------------------
        // FLOOR ALREADY EXISTS
        // --------------------------------------------------

        else {

            AppState.project.currentFloorIndex =
                existingIndex;

            console.log(
                "🔥 CURRENT FLOOR ALREADY IN PROJECT",
                {
                    floorId:
                        currentFloor.id,

                    floorName:
                        currentFloor.name,

                    floorIndex:
                        existingIndex,

                    floorCount:
                        projectFloors.length
                }
            );
        }
    }

    // ==================================================
    // DUPLICATE FLOOR IMAGE
    // ==================================================

    const duplicateFloor =
        AppState.project.floors.find(
            floor =>

                floor !== currentFloor &&

                floor.imageFileName ===
                file.name &&

                floor.imageFileSize ===
                file.size
        );

    if (duplicateFloor) {

        alert(
            "This plan already exists on: " +
            duplicateFloor.name
        );

        if (evt.target) {

            evt.target.value =
                "";
        }

        return;
    }

    // ==================================================
    // EXISTING ASSESSMENT DATA
    // ==================================================

    const roomsCount =
        currentFloor.rooms?.length ||
        0;

    const zonesCount =
        currentFloor.zones?.length ||
        0;

    const sourcesCount =
        currentFloor.sources?.length ||
        0;

    const indoorSourcesCount =
        currentFloor.indoorSources?.length ||
        0;

    const outdoorSourcesCount =
        currentFloor.outdoorSources?.length ||
        0;

    const hasAssessmentData =

        roomsCount > 0 ||
        zonesCount > 0 ||
        sourcesCount > 0 ||
        indoorSourcesCount > 0 ||
        outdoorSourcesCount > 0;

    // ==================================================
    // CONFIRM REPLACEMENT
    // ==================================================

    if (hasAssessmentData) {

        const confirmed =
            window.confirm(
                "Replace Floor Plan?\n\n" +

                "This floor already contains " +

                roomsCount +
                " room(s), " +

                zonesCount +
                " zone(s), and " +

                (
                    sourcesCount +
                    indoorSourcesCount +
                    outdoorSourcesCount
                ) +
                " source(s).\n\n" +

                "Replacing the floor plan will remove " +
                "the existing rooms, zones, sources " +
                "and their measurement grids.\n\n" +

                "The scale will also need to be set again.\n\n" +

                "Press OK to replace and reset this floor, " +
                "or Cancel to keep the current plan."
            );

        if (!confirmed) {

            console.log(
                "🔥 IMAGE REPLACEMENT CANCELLED"
            );

            if (evt.target) {

                evt.target.value =
                    "";
            }

            return;
        }
    }

    // ==================================================
    // FILE READER
    // ==================================================

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            console.log(
                "🔥 FILE READER DONE"
            );

            const imageData =
                e.target.result;

            console.log(
                "🔥 IMAGE DATA CREATED",
                {
                    type:
                        typeof imageData,

                    length:
                        imageData?.length ||
                        0,

                    startsWith:
                        typeof imageData ===
                            "string"
                            ? imageData.substring(
                                0,
                                40
                            )
                            : null
                }
            );

            const img =
                new Image();

            img.onload = () => {

                console.log(
                    "🔥 IMAGE OBJECT LOADED",
                    {
                        width:
                            img.width,

                        height:
                            img.height
                    }
                );

                // ==================================================
                // RESET EXISTING ASSESSMENT DATA
                // ==================================================

                if (hasAssessmentData) {

                    console.log(
                        "🔥 RESETTING FLOOR ASSESSMENT DATA"
                    );

                    currentFloor.rooms =
                        [];

                    currentFloor.zones =
                        [];

                    currentFloor.sources =
                        [];

                    currentFloor.indoorSources =
                        [];

                    currentFloor.outdoorSources =
                        [];

                    currentFloor.scaleConfirmed =
                        false;

                    currentFloor.currentScale =
                        null;

                    currentFloor.canvasWidth =
                        null;

                    currentFloor.canvasHeight =
                        null;

                    AppState.ui.selectedRoom =
                        null;

                    AppState.ui.selectedZone =
                        null;

                    window.selectedRoom =
                        null;

                    window.selectedZone =
                        null;

                    if (
                        window.scaleTool
                    ) {

                        window.scaleTool.active =
                            false;

                        window.scaleTool.calibrated =
                            false;

                        window.scaleTool.points =
                            [];
                    }

                    if (
                        window.scalePoints
                    ) {

                        window.scalePoints.length =
                            0;
                    }

                    if (
                        typeof roomCreated !==
                        "undefined"
                    ) {

                        roomCreated =
                            false;
                    }

                    if (
                        typeof gridCreated !==
                        "undefined"
                    ) {

                        gridCreated =
                            false;
                    }

                    if (
                        typeof scaleSet !==
                        "undefined"
                    ) {

                        scaleSet =
                            false;
                    }
                }

                // ==================================================
                // 🔥 ASSIGN IMAGE
                // ==================================================

                currentFloor.image =
                    img;

                currentFloor.imageData =
                    imageData;

                currentFloor.imageFileName =
                    file.name;

                currentFloor.imageFileSize =
                    file.size;

                console.log(
                    "🔥🔥🔥 IMAGE ASSIGNED TO FLOOR",
                    {
                        floorId:
                            currentFloor.id,

                        floorName:
                            currentFloor.name,

                        image:
                            !!currentFloor.image,

                        imageData:
                            !!currentFloor.imageData,

                        imageDataLength:
                            currentFloor.imageData
                                ?.length || 0,

                        imageFileName:
                            currentFloor.imageFileName,

                        imageFileSize:
                            currentFloor.imageFileSize,

                        width:
                            img.width,

                        height:
                            img.height
                    }
                );

                // ==================================================
                // GLOBAL PLAN IMAGE
                // ==================================================

                window.planImage =
                    img;

                // ==================================================
                // RESET VIEWPORT
                // ==================================================

                if (
                    window.EMFViewport
                ) {

                    EMFViewport.zoom =
                        1;

                    EMFViewport.panX =
                        0;

                    EMFViewport.panY =
                        0;

                    EMFViewport.offsetX =
                        0;

                    EMFViewport.offsetY =
                        0;
                }

                // ==================================================
                // OPEN FLOOR
                // ==================================================

                if (
                    typeof openFloor ===
                    "function"
                ) {

                    openFloor(
                        AppState.project
                            .currentFloorIndex ??
                        0
                    );
                }

                // ==================================================
                // RESIZE
                // ==================================================

                if (
                    typeof resizeCanvasSafe ===
                    "function"
                ) {

                    resizeCanvasSafe();
                }

                // ==================================================
                // RENDER
                // ==================================================

                requestRender?.();

                // ==================================================
                // SCALE BUTTON
                // ==================================================

                const btn =
                    document.getElementById(
                        "btnScale"
                    );

                if (btn) {

                    btn.style.outline =
                        "2px solid #da5b66";

                    btn.style.outlineOffset =
                        "2px";

                    btn.classList.add(
                        "active"
                    );
                }

                // ==================================================
                // WORKFLOW
                // ==================================================

                window.updateWorkflowUI?.();

                window.updateHomeLocks?.();

                window.updateHomeWorkflow?.();

                updateHomeWorkflow?.();

                updateGuideText?.();

                updateWellnessCard?.();

                updateCurrentExposure?.();

                updateHomeSidebarStatus?.();

                updateRoomProgressPanel?.();

                // ==================================================
                // FINAL DEBUG
                // ==================================================

                console.log(
                    "🔥🔥🔥 NEW FLOOR PLAN READY",
                    {
                        projectId:
                            AppState.project
                                ?.project_id ??
                            AppState.project
                                ?.id,

                        floorId:
                            currentFloor.id,

                        floorName:
                            currentFloor.name,

                        image:
                            !!currentFloor.image,

                        imageData:
                            !!currentFloor.imageData,

                        imageDataLength:
                            currentFloor.imageData
                                ?.length || 0,

                        imageFileName:
                            currentFloor.imageFileName,

                        imageFileSize:
                            currentFloor.imageFileSize,

                        imageSize:
                            `${img.width}x${img.height}`,

                        rooms:
                            currentFloor.rooms
                                ?.length || 0,

                        zones:
                            currentFloor.zones
                                ?.length || 0,

                        sources:
                            currentFloor.sources
                                ?.length || 0,

                        scaleConfirmed:
                            currentFloor.scaleConfirmed,

                        currentScale:
                            currentFloor.currentScale
                    }
                );
            };

            img.onerror = () => {

                console.error(
                    "🔥🔥🔥 IMAGE LOAD FAILED",
                    {
                        file:
                            file.name,

                        size:
                            file.size
                    }
                );
            };

            // ==================================================
            // START IMAGE LOAD
            // ==================================================

            img.src =
                imageData;
        };

    reader.onerror = () => {

        console.error(
            "🔥🔥🔥 FILE READER ERROR"
        );
    };

    reader.readAsDataURL(
        file
    );
}

// =====================
// 🔥 EXPORT
// =====================

window.handleImageUpload =
    handleImageUpload;


// =====================
// 🔥 CONNECT INPUT
// =====================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnScale =

            document.getElementById(
                "btnScale"
            );

        btnScale?.addEventListener(

            "click",

            () => {

                AppState.ui.mode =
                    "scale";

                if (
                    window.scaleTool
                ) {

                    window.scaleTool.active =
                        true;

                    window.scaleTool.calibrated =
                        false;

                    window.scaleTool.points =
                        [];
                }

                console.log(
                    "SET SCALE MODE",
                    window.scaleTool
                );

                requestRender?.();
            }
        );

        // =====================
        // 🔥 FILE INPUT
        // =====================

        const fileInput =
            document.getElementById(
                "fileInput"
            );

        if (!fileInput) {

            console.error(
                "fileInput NOT FOUND"
            );

            return;
        }

        fileInput.addEventListener(
            "change",
            handleImageUpload
        );

        console.log(
            "fileInput CONNECTED"
        );

        // =====================
        // 🔥 UPLOAD BUTTON
        // =====================

        const btnUploadPlan =

            document.getElementById(
                "btnUploadPlan"
            );

        btnUploadPlan?.addEventListener(

            "click",

            () => {

                fileInput.click();
            }
        );

        // =====================
        // 🔥 HOME — UPLOAD FLOOR PLAN
        // =====================

        const homeBtnUploadPlan =
            document.getElementById(
                "homeBtnUploadPlan"
            );

        homeBtnUploadPlan?.addEventListener(

            "click",

            () => {

                fileInput.click();

            }
        );

        // =====================
        // 🔥 CAMERA INPUT
        // =====================

        const cameraInput =

            document.getElementById(
                "cameraInput"
            );

        cameraInput?.addEventListener(

            "change",

            handleImageUpload
        );

        // =====================
        // 🔥 TAKE PHOTO BUTTON
        // =====================

        const btnTakePhoto =

            document.getElementById(
                "btnTakePhoto"
            );

        btnTakePhoto?.addEventListener(

            "click",

            () => {

                cameraInput?.click();
            }
        );

        // =====================
        // 🔥 HOME — TAKE PHOTO
        // =====================

        const homeBtnTakePhoto =
            document.getElementById(
                "homeBtnTakePhoto"
            );

        homeBtnTakePhoto?.addEventListener(

            "click",

            () => {

                cameraInput?.click();

            }
        );

        // =====================
        // 🔥 HOME — SET SCALE
        // =====================

        const homeBtnScale =
            document.getElementById(
                "homeBtnScale"
            );

        homeBtnScale?.addEventListener(

            "click",

            () => {

                document
                    .getElementById(
                        "btnScale"
                    )
                    ?.click();

            }
        );

        // =====================
        // MEASUREMENT TYPE BUTTONS
        // =====================

        const measurementTypeButtons = {

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

        Object.entries(
            measurementTypeButtons
        ).forEach(
            ([type, button]) => {

                if (!button) {
                    console.warn(
                        "Measurement button not found:",
                        type
                    );

                    return;
                }

                button.addEventListener(
                    "click",
                    () => {

                        console.log(
                            "MEASUREMENT TYPE CLICK:",
                            type
                        );

                        window.setMeasureType?.(
                            type
                        );

                        requestRender?.();
                    }
                );
            }
        );

        console.log(
            "MEASUREMENT TYPE BUTTONS CONNECTED",
            measurementTypeButtons
        );
    }
);