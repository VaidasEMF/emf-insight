function handleImageUpload(evt) {

    // ==================================================
    // DEMO MODE — READ ONLY
    // ==================================================

    if (
        window.EMFWorkspaceExperience?.mode === "demo"
    ) {
        console.log(
            "🔒 DEMO MODE — FLOOR PLAN UPLOAD BLOCKED"
        );

        if (evt?.target) {
            evt.target.value = "";
        }

        return;
    }

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
    // CONTROLLED PLAN REPLACEMENT
    // ==================================================

    let preserveAssessment = true;

    if (hasAssessmentData) {

        const choice = window.prompt(
            "REPLACE FLOOR PLAN\n\n" +

            "1 — Create New Plan Version\n" +
            "    Preserve the existing assessment.\n\n" +

            "2 — Replace & Reset Assessment\n" +
            "    Do not preserve the existing assessment.\n\n" +

            "3 — Cancel\n\n" +

            "Enter 1, 2 or 3:"
        );

        if (choice === "1") {

            preserveAssessment = true;

        } else if (choice === "2") {

            preserveAssessment = false;

        } else {

            console.log(
                "[FLOOR PLAN] Replacement cancelled."
            );

            if (evt?.target) {
                evt.target.value = "";
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

            img.onload = async () => {

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
                // UPLOAD FLOOR PLAN TO SERVER
                // ==================================================

                const projectId =
                    window.getCurrentProjectId?.() ||
                    AppState.project?.project_id ||
                    AppState.project?.id ||
                    null;

                if (!projectId || !currentFloor?.id) {

                    console.error(
                        "[FLOOR PLAN UPLOAD] Missing project or floor ID."
                    );

                    alert("Cannot upload floor plan: project or floor ID is missing.");

                    return;
                }

                const planVersionId =
                    window.PhiIdFactory?.createPhiId?.("plan_version");

                if (!planVersionId) {

                    console.error(
                        "[FLOOR PLAN UPLOAD] Could not generate plan version ID."
                    );

                    return;
                }

                const formData = new FormData();

                formData.append("file", file);
                formData.append("plan_version_id", planVersionId);

                let uploadResponse;

                try {

                    uploadResponse = await fetch(
                        `${API}/project/${projectId}/floors/${currentFloor.id}/plan`,
                        {
                            method: "POST",
                            headers: getAuthHeadersForFormData(),
                            body: formData
                        }
                    );

                } catch (error) {

                    console.error(
                        "[FLOOR PLAN UPLOAD] Network error:",
                        error
                    );

                    alert("Floor plan upload failed. The existing plan was not changed.");

                    return;
                }

                if (!uploadResponse.ok) {

                    const errorData = await uploadResponse.json().catch(() => null);

                    console.error(
                        "[FLOOR PLAN UPLOAD] Server error:",
                        uploadResponse.status,
                        errorData
                    );

                    alert("Floor plan upload failed. The existing plan was not changed.");

                    return;
                }

                const uploadData = await uploadResponse.json();

                console.log(
                    "[FLOOR PLAN UPLOAD] Server upload successful:",
                    uploadData
                );

                // ==================================================
                // ACTIVATE NEW FLOOR PLAN VERSION
                // ==================================================

                const newPlanVersion =
                    window.activateNewFloorPlanVersion?.(
                        currentFloor,
                        {
                            planVersionId: planVersionId,
                            imagePath: uploadData.imagePath,
                            imageFileName: file.name,
                            imageFileSize: file.size,
                            imageWidth: img.width,
                            imageHeight: img.height
                        },
                        {
                            preserveAssessment
                        }
                    );

                if (!newPlanVersion) {

                    console.error(
                        "[FLOOR PLAN] Version activation failed."
                    );

                    return;
                }

                console.log(
                    "[FLOOR PLAN] New version activated",
                    {
                        versionId: newPlanVersion.id,
                        version: newPlanVersion.version,
                        preserveAssessment
                    }
                );

                // ==================================================
                // SAVE NEW PLAN VERSION TO PROJECT
                // ==================================================

                const projectSaved =
                    await window.saveProject?.();

                if (!projectSaved) {

                    console.error(
                        "[FLOOR PLAN] Project save failed after plan activation.",
                        {
                            versionId: newPlanVersion.id
                        }
                    );

                    alert(
                        "The plan was uploaded, but project data could not be saved. Please reload only after resolving this issue."
                    );

                    return;
                }

                console.log(
                    "[FLOOR PLAN] Project version saved successfully."
                );

                // ==================================================
                // RESET UI SELECTION AND TOOLS
                // ==================================================

                AppState.ui.selectedRoom = null;
                AppState.ui.selectedZone = null;

                window.selectedRoom = null;
                window.selectedZone = null;

                if (window.scaleTool) {
                    window.scaleTool.active = false;
                    window.scaleTool.calibrated = false;
                    window.scaleTool.points = [];
                }

                if (window.scalePoints) {
                    window.scalePoints.length = 0;
                }

                if (typeof roomCreated !== "undefined") {
                    roomCreated = false;
                }

                if (typeof gridCreated !== "undefined") {
                    gridCreated = false;
                }

                if (typeof scaleSet !== "undefined") {
                    scaleSet = false;
                }

                // ==================================================
                // ASSIGN IMAGE
                // ==================================================

                currentFloor.image = img;

                currentFloor.imageData = null;

                currentFloor.imageFileName = file.name;
                currentFloor.imageFileSize = file.size;

                console.log(
                    "[FLOOR PLAN] Image assigned to floor",
                    {
                        floorId: currentFloor.id,
                        floorName: currentFloor.name,
                        image: !!currentFloor.image,
                        imageData: !!currentFloor.imageData,
                        imageFileName: currentFloor.imageFileName,
                        imageFileSize: currentFloor.imageFileSize,
                        width: img.width,
                        height: img.height
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
                window.startScaleTool?.();
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

        document.addEventListener("click", (event) => {
            if (
                event.target.closest("#homeFloorPlanUpload") ||
                event.target.closest("#homeFloorPlanReplace")
            ) {
                event.preventDefault();
                fileInput.click();
            }
        });

        // FLOOR PLAN DROPDOWN — UPLOAD

        const homeFloorPlanUpload =
            document.getElementById("homeFloorPlanUpload");

        homeFloorPlanUpload?.addEventListener(
            "click",
            () => {
                homeBtnUploadPlan?.click();
            }
        );

        // FLOOR PLAN DROPDOWN — REPLACE

        const homeFloorPlanReplace =
            document.getElementById("homeFloorPlanReplace");

        homeFloorPlanReplace?.addEventListener(
            "click",
            () => {
                homeBtnUploadPlan?.click();
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