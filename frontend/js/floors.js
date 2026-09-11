//Owner:
//Floor Manager

//Responsibility:
//Current Floor

//Should not:
//Render UI
//Manage Workflow


let floorToDelete = null;

let floorToRename = null;

function renderFloorTabs() {

    console.error(
        "RENDER FLOOR TABS",
        {
            mode: AppMode.current,

            floorCount:
                AppState.project.floors.length,

            currentIndex:
                AppState.project.currentFloorIndex
        }
    );


    console.error(
        "RENDER FLOORS FROM FLOORS.JS"
    );

    const wrap =
        document.getElementById(
            "floorTabs"
        );

    if (!wrap) return;

    wrap.innerHTML = "";

    // =====================
    // 🔥 APPSTATE FLOORS
    // =====================

    const floors =
        AppState.project.floors || [];

    floors.forEach((floor, index) => {

        if (!floor) return;

        const div =
            document.createElement("div");

        div.className =
            "floor-card";

        if (
            index ===
            AppState.project.currentFloorIndex
        ) {

            div.classList.add(
                "active"
            );
        }

        // =====================
        // 🔥 STATS
        // =====================

        const rooms =
            floor.rooms || [];

        console.log(
            "FLOOR TAB:",
            index,
            floor
        );

        console.log(
            "ROOMS:",
            floor.rooms
        );

        const roomCount =
            rooms.length;

        let gridCount = 0;

        rooms.forEach(room => {

            gridCount +=
                (room.grid || []).length;
        });

        const coverage =
            getFloorCoverage?.(
                floor
            ) || 0;

        // =====================
        // 🔥 HTML
        // =====================

        div.innerHTML = `

    <div class="floor-title">
        🏠 ${floor.name || "Floor"}
    </div>

    <div style="
        font-size:11px;
        color:#94a3b8;
        margin-bottom:4px;
    ">

        Rooms: ${roomCount}

        •

        Grid: ${gridCount}

        •

        ${coverage}%

    </div>

    <div style="
        font-size:11px;
        font-weight:600;
        margin-bottom:8px;
        color:${floor.scaleConfirmed
                ? '#16a34a'
                : '#dc2626'
            };
    ">

        ${floor.scaleConfirmed
                ? '📏 Scale Set'
                : '⚠ Scale Required'
            }

    </div>

    <div class="floor-actions">

        <button
            onclick="openFloor(${index})"
        >
            Open
        </button>

        <button
            onclick="renameFloor(${index})"
        >
            Edit
        </button>

        <button
            onclick="deleteFloor(${index})"
        >
            Delete
        </button>

    </div>

`;

        wrap.appendChild(div);
    });
}

window.renderFloorTabs =
    renderFloorTabs;

function addFloor() {

    console.error(
        "================================="
    );

    console.error(
        "🔥🔥🔥 ADD FLOOR START"
    );

    // ==================================================
    // FLOOR NAME
    // ==================================================

    const floorName =
        document
            .getElementById(
                "floorNameInput"
            )
            ?.value
            ?.trim();

    if (!floorName) {

        alert(
            "Please enter floor name."
        );

        return;
    }

    // ==================================================
    // ENSURE PROJECT
    // ==================================================

    if (
        !AppState.project
    ) {

        console.error(
            "🔥 ADD FLOOR FAILED — NO PROJECT"
        );

        return;
    }

    // ==================================================
    // ENSURE FLOORS ARRAY
    // ==================================================

    if (
        !Array.isArray(
            AppState.project.floors
        )
    ) {

        AppState.project.floors =
            [];
    }

    // ==================================================
    // PREVIOUS FLOOR
    // ==================================================

    const previousFloor =
        AppState.project.floors[
        AppState.project.floors.length - 1
        ];

    // ==================================================
    // CREATE NEW FLOOR
    // ==================================================

    const floor =
        createDefaultFloor(
            floorName
        );

    if (!floor) {

        console.error(
            "🔥 ADD FLOOR FAILED — CREATE DEFAULT FLOOR RETURNED NOTHING"
        );

        return;
    }

    console.error(
        "🔥🔥🔥 NEW FLOOR CREATED",
        {
            name:
                floor.name,

            id:
                floor.id,

            elevation_m:
                floor.elevation_m,

            ceilingHeight:
                floor.ceilingHeight
        }
    );

    // ==================================================
    // PHI FLOOR ELEVATION
    // ==================================================

    if (
        previousFloor &&
        typeof previousFloor.elevation_m ===
        "number"
    ) {

        const previousCeilingHeight =
            Number(
                previousFloor.ceilingHeight
            );

        if (
            Number.isFinite(
                previousCeilingHeight
            ) &&
            previousCeilingHeight > 0
        ) {

            floor.elevation_m =
                previousFloor.elevation_m +
                previousCeilingHeight;

        }
        else {

            floor.elevation_m =
                previousFloor.elevation_m;
        }

    }
    else {

        floor.elevation_m =
            0;
    }

    // ==================================================
    // ADD TO PROJECT
    // ==================================================

    AppState.project.floors.push(
        floor
    );


    renderHomeFloorTabs?.();
    renderHomeCurrentFloorCard?.();
    updateHomeEmptyPlanState?.();

    const newFloorIndex =
        AppState.project.floors.length - 1;

    console.error(
        "🔥🔥🔥 FLOORS AFTER PUSH",
        AppState.project.floors.map(
            (
                item,
                index
            ) => ({
                index,

                id:
                    item.id,

                name:
                    item.name,

                rooms:
                    item.rooms?.length ||
                    0,

                zones:
                    item.zones?.length ||
                    0,

                scaleConfirmed:
                    !!item.scaleConfirmed,

                image:
                    !!item.image,

                imageData:
                    !!item.imageData
            })
        )
    );

    // ==================================================
    // 🔥 SET ACTIVE FLOOR
    // ==================================================

    AppState.project.currentFloorIndex =
        newFloorIndex;

    console.error(
        "🔥🔥🔥 NEW ACTIVE FLOOR",
        {
            index:
                newFloorIndex,

            floorId:
                floor.id,

            floorName:
                floor.name
        }
    );

    // ==================================================
    // 🔥 RESET TEMP DRAWING STATE
    // ==================================================

    AppState.ui.roomDraft =
        null;

    window.currentRoom =
        null;

    AppState.ui.zoneDraft =
        null;

    window.currentZone =
        null;

    selectedRoom =
        null;

    AppState.ui.selectedZone =
        null;

    window.hoveredGridPoint =
        null;

    hoverLabel =
        null;

    window.scalePoints =
        [];

    // ==================================================
    // RESET SCALE TOOL
    // ==================================================

    if (
        window.scaleTool
    ) {

        window.scaleTool.active =
            false;

        window.scaleTool.calibrated =
            !!floor.scaleConfirmed;

        window.scaleTool.points =
            [];

        window.scaleTool.metersPerPixel =
            floor.currentScale ||
            0;
    }

    // ==================================================
    // RESET PLAN IMAGE
    // ==================================================

    window.planImage =
        null;

    planImage =
        null;

    // ==================================================
    // 🔥 OPEN NEW FLOOR
    // ==================================================
    //
    // IMPORTANT:
    //
    // Do NOT only change currentFloorIndex.
    //
    // openFloor() is the canonical function
    // responsible for switching all floor state.
    //
    // A newly created floor starts outside
    // measurement mode.
    //
    // Therefore:
    // - Measurement Info is hidden
    // - Measurement toolbar is inactive
    // - No measurement data is changed
    //
    // ==================================================

    openFloor(
        newFloorIndex
    );


    // ==================================================
    // 🔥 RESET MEASUREMENT UI FOR NEW FLOOR
    // ==================================================

    const measureInfo =
        document.getElementById(
            "measureInfo"
        );


    if (
        measureInfo
    ) {

        measureInfo.style.display =
            "none";
    }


    // ==================================================
    // 🔥 RESET MEASUREMENT TYPE BUTTONS
    // ==================================================
    //
    // The buttons may remain visible,
    // but none is active on a newly created floor.
    //
    // They become active when the measurement
    // workflow is started.
    //

    const measurementTypeButtons = [

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


    measurementTypeButtons.forEach(
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


    // ==================================================
    // 🔥 RESET MEASUREMENT TYPE STATE
    // ==================================================
    //
    // New floor must not visually inherit
    // the previous floor's modality.
    //
    // This does NOT modify any stored
    // measurement data.
    //

    measureType =
        "all";

    activeMeasureType =
        "all";


    // ==================================================
    // 🔥 REFRESH MEASUREMENT INFO
    // ==================================================
    //
    // It will remain hidden because the
    // current mode is not "measure".
    //

    updateMeasurementInfo?.();
    // ==================================================
    // FLOOR UI
    // ==================================================

    renderFloorTabs?.();

    if (
        window.AppMode?.current ===
        "home"
    ) {

        renderHomeFloorTabs?.();

    }
    else {

        renderBusinessFloorTabs?.();
    }

    // ==================================================
    // WORKFLOW
    // ==================================================

    window.updateWorkflowUI?.();

    window.updateHomeWorkflow?.();

    window.updateHomeLocks?.();

    updateProjectHeader?.();

    // ==================================================
    // STATUS
    // ==================================================

    updateStatus?.(
        "🖼 Upload plan for: " +
        floorName
    );

    // ==================================================
    // CLOSE POPUP
    // ==================================================

    closeNewFloorPopup();

    // ==================================================
    // FINAL DEBUG
    // ==================================================

    console.error(
        "🔥🔥🔥 ADD FLOOR COMPLETE",
        {
            projectId:
                AppState.project.project_id ??
                AppState.project.id ??
                null,

            floorCount:
                AppState.project.floors.length,

            currentFloorIndex:
                AppState.project.currentFloorIndex,

            currentFloor:
                AppState.project.floors[
                AppState.project.currentFloorIndex
                ]
        }
    );
}



function openFloor(index) {

    console.error(
        "========== OPEN FLOOR =========="
    );


    const floors =
        AppState.project.floors || [];


    const floor =
        floors[index];


    if (!floor) {

        console.error(
            "OPEN FLOOR FAILED - FLOOR NOT FOUND:",
            index
        );

        return;
    }


    // ==================================================
    // 🔥 CLOSE ALL SOURCE POPUPS
    //
    // A Source popup belongs to the Source on the
    // currently active Floor.
    //
    // When changing Floor, no popup from the previous
    // Floor may remain visible.
    // ==================================================

    closeIndoorDistancePopup?.();

    closeSourcePopup?.();

    closeOutdoorSourcePopup?.();

    closeBusinessSourcePopup?.();


    // ==================================================
    // 🔥 CLEAR ACTIVE SOURCE REFERENCES
    //
    // Prevent old-floor Source state from surviving
    // the Floor switch.
    // ==================================================

    window.activePopupSource =
        null;

    window.lastPlacedSource =
        null;

    window.selectedIndoorSource =
        null;

    selectedSource =
        null;


    // ==================================================
    // 🔥 CLEAR SOURCE SELECTION
    // ==================================================

    if (
        window.objectTool
    ) {

        window.objectTool.selectedObjectId =
            null;

        window.objectTool.draggingObject =
            false;

        window.objectTool.currentType =
            null;
    }


    // ==================================================
    // ACTIVE FLOOR
    // ==================================================

    AppState.project.currentFloorIndex =
        index;


    // ==================================================
    // 🔥 RESET ACTIVE FLOOR PLAN IMAGE
    // ==================================================
    //
    // When switching floors, never keep the previous
    // floor's rendered image in the global canvas state.
    // loadFloorImage() will restore it if the new floor
    // actually has a plan.
    //

    window.planImage = null;
    planImage = null;


    console.error(
        "OPEN FLOOR:",
        {
            index,
            name:
                floor.name,
            image:
                !!floor.image,
            imageData:
                !!floor.imageData,
            imageFileName:
                floor.imageFileName,
            rooms:
                floor.rooms?.length ||
                0,
            zones:
                floor.zones?.length ||
                0
        }
    );


    // ==================================================
    // RESET TEMP UI STATE
    // ==================================================

    AppState.ui.roomDraft =
        null;

    window.currentRoom =
        null;


    AppState.ui.zoneDraft =
        null;

    window.currentZone =
        null;


    selectedRoom =
        null;


    AppState.ui.selectedZone =
        null;


    window.hoveredGridPoint =
        null;


    hoverLabel =
        null;


    window.scalePoints =
        [];


    // ==================================================
    // SCALE
    // ==================================================

    if (
        window.scaleTool
    ) {

        window.scaleTool.calibrated =
            !!floor.scaleConfirmed;


        window.scaleTool.metersPerPixel =
            floor.currentScale ||
            0;
    }


    // ==================================================
    // UI
    // ==================================================

    window.updateHomeLocks?.();

    window.updateHomeWorkflow?.();


    // ==================================================
    // FLOOR UI BY MODE
    // ==================================================

    if (
        window.AppMode?.current ===
        "home"
    ) {

        renderHomeFloorTabs?.();

    }
    else {

        renderBusinessFloorTabs?.();

    }


    // ==================================================
    // COMMON FLOOR UI
    // ==================================================

    renderFloorTabs?.();


    window.updateWorkflowUI?.();

    updateProjectHeader?.();

    updateCurrentExposure?.();


    // ==================================================
    // 🔥 REFRESH MEASUREMENT INFO
    //
    // The new Floor is now active, so Measurement Info
    // must be recalculated from the new Floor.
    // ==================================================

    updateMeasurementInfo?.();


    // ==================================================
    // LOAD SELECTED FLOOR IMAGE
    // ==================================================

    loadFloorImage(
        floor
    );


    // ==================================================
    // CANVAS / VIEWPORT
    // ==================================================

    requestAnimationFrame(
        () => {

            resizeCanvasSafe?.();

            requestRender?.();

            // ==========================================
            // 🔥 KEEP BUSINESS SOURCE POPUP CLOSED
            //
            // Safety check after render/image loading.
            // A previous popup must never reappear on
            // the newly selected Floor.
            // ==========================================

            closeIndoorDistancePopup?.();

            closeSourcePopup?.();

            closeOutdoorSourcePopup?.();

            closeBusinessSourcePopup?.();

        }
    );


    // ==================================================
    // FINAL DEBUG
    // ==================================================

    console.error(
        "ACTIVE FLOOR AFTER OPEN:",
        {
            index:
                AppState.project.currentFloorIndex,

            name:
                floor.name,

            image:
                !!floor.image,

            imageData:
                !!floor.imageData,

            rooms:
                floor.rooms?.length ||
                0,

            zones:
                floor.zones?.length ||
                0,

            activePopupSource:
                window.activePopupSource,

            lastPlacedSource:
                window.lastPlacedSource
        }
    );
}

function loadFloorImage(floor) {

    if (!floor) {

        window.planImage =
            null;

        planImage =
            null;

        resizeCanvasSafe?.();

        requestRender?.();

        return;
    }


    console.error(
        "🔥 LOAD FLOOR IMAGE",
        {
            floor:
                floor.name,

            floorId:
                floor.id,

            hasImage:
                !!floor.image,

            imageType:
                typeof floor.image,

            imageConstructor:
                floor.image?.constructor?.name,

            imageWidth:
                floor.image?.width,

            imageHeight:
                floor.image?.height,

            naturalWidth:
                floor.image?.naturalWidth,

            naturalHeight:
                floor.image?.naturalHeight,

            hasImageData:
                !!floor.imageData,

            imageDataType:
                typeof floor.imageData,

            imageDataLength:
                floor.imageData?.length || 0,

            imageFileName:
                floor.imageFileName
        }
    );


    // ==================================================
    // 🔥 CHECK WHETHER IMAGE IS A REAL HTML IMAGE
    // ==================================================

    const imageIsLoaded =
        floor.image instanceof HTMLImageElement &&
        floor.image.complete &&
        floor.image.naturalWidth > 0;


    // ==================================================
    // 🔥 REAL IMAGE ALREADY LOADED
    // ==================================================

    if (
        imageIsLoaded
    ) {

        console.error(
            "🔥 IMAGE ALREADY VALID AND LOADED",
            {
                floor:
                    floor.name,

                width:
                    floor.image.naturalWidth,

                height:
                    floor.image.naturalHeight
            }
        );


        window.planImage =
            floor.image;

        planImage =
            floor.image;


        resizeCanvasSafe?.();

        requestRender?.();


        window.updateHomeEmptyPlanState?.();

        window.updateBusinessEmptyPlanState?.();


        return;
    }


    // ==================================================
    // 🔥 INVALID IMAGE OBJECT
    // ==================================================

    if (
        floor.image &&
        !imageIsLoaded
    ) {

        console.warn(
            "⚠️ INVALID FLOOR IMAGE OBJECT — RELOADING",
            {
                floor:
                    floor.name,

                image:
                    floor.image,

                imageType:
                    typeof floor.image,

                width:
                    floor.image?.width,

                height:
                    floor.image?.height
            }
        );


        floor.image =
            null;
    }


    // ==================================================
    // 🔥 NO IMAGE DATA
    // ==================================================

    if (
        !floor.imageData
    ) {

        console.warn(
            "❌ NO IMAGE DATA FOR FLOOR",
            {
                floor:
                    floor.name,

                floorId:
                    floor.id,

                imageFileName:
                    floor.imageFileName
            }
        );


        // ==================================================
        // 🔥 IMPORTANT
        // CLEAR ANY PREVIOUS FLOOR IMAGE
        // ==================================================

        floor.image =
            null;

        window.planImage =
            null;

        planImage =
            null;


        resizeCanvasSafe?.();

        requestRender?.();


        window.updateHomeEmptyPlanState?.();

        window.updateBusinessEmptyPlanState?.();


        return;
    }


    // ==================================================
    // 🔥 LOAD REAL IMAGE FROM IMAGE DATA
    // ==================================================

    console.error(
        "🔥 REBUILDING FLOOR IMAGE FROM imageData",
        {
            floor:
                floor.name,

            imageDataLength:
                floor.imageData.length
        }
    );


    const img =
        new Image();


    // ==================================================
    // LOAD SUCCESS
    // ==================================================

    img.onload = () => {

        console.error(
            "🔥🔥🔥 IMAGE ONLOAD CALLED",
            {
                floor:
                    floor.name,

                floorId:
                    floor.id,

                width:
                    img.naturalWidth,

                height:
                    img.naturalHeight
            }
        );


        console.trace(
            "🔥🔥🔥 IMAGE ONLOAD CALL STACK"
        );


        // ==================================================
        // STORE REAL HTML IMAGE
        // ==================================================

        floor.image =
            img;


        console.error(
            "🔥🔥 IMAGE DATA → FINAL IMAGE",
            {
                floor:
                    floor.name,

                floorId:
                    floor.id,

                imageDataLength:
                    floor.imageData?.length || 0,

                width:
                    img.width,

                height:
                    img.height,

                naturalWidth:
                    img.naturalWidth,

                naturalHeight:
                    img.naturalHeight
            }
        );


        window.planImage =
            img;

        planImage =
            img;


        // ==================================================
        // RECALCULATE VIEWPORT
        // ==================================================

        resizeCanvasSafe?.();


        // ==================================================
        // RENDER
        // ==================================================

        requestRender?.();


        // ==================================================
        // EMPTY PLAN STATES
        // ==================================================

        window.updateHomeEmptyPlanState?.();

        window.updateBusinessEmptyPlanState?.();


        console.error(
            "🔥🔥🔥 FLOOR IMAGE RENDER REQUESTED",
            {
                floor:
                    floor.name,

                canvasWidth:
                    window.canvas?.width,

                canvasHeight:
                    window.canvas?.height
            }
        );
    };


    // ==================================================
    // LOAD ERROR
    // ==================================================

    img.onerror = (
        error
    ) => {

        console.error(
            "❌❌❌ FLOOR IMAGE LOAD ERROR",
            {
                floor:
                    floor.name,

                floorId:
                    floor.id,

                imageFileName:
                    floor.imageFileName,

                imageDataLength:
                    floor.imageData?.length || 0,

                src:
                    img.src?.substring(
                        0,
                        120
                    ),

                error
            }
        );


        floor.image =
            null;

        window.planImage =
            null;

        planImage =
            null;


        resizeCanvasSafe?.();

        requestRender?.();


        window.updateHomeEmptyPlanState?.();

        window.updateBusinessEmptyPlanState?.();
    };


    // ==================================================
    // 🔥 SET SOURCE LAST
    // ==================================================

    console.error(
        "🔥🔥 IMAGE DATA BEFORE REBUILD",
        {
            floor:
                floor.name,

            floorId:
                floor.id,

            imageDataLength:
                floor.imageData?.length || 0,

            imageDataPrefix:
                floor.imageData?.substring(
                    0,
                    80
                )
        }
    );


    console.error(
        "🔥🔥🔥 IMAGE SRC ASSIGNED",
        {
            floor:
                floor.name,

            floorId:
                floor.id,

            imageDataLength:
                floor.imageData?.length || 0
        }
    );


    console.trace(
        "🔥🔥🔥 WHO ASSIGNED IMAGE SRC"
    );


    img.src =
        floor.imageData;
}

function deleteFloor(index) {

    const floor =
        AppState.project.floors[index];

    const floorName =
        floor?.name ||
        `Floor ${index + 1}`;


    // ==========================================
    // DELETE FLOOR CONFIRMATION MODAL
    // ==========================================

    document
        .getElementById(
            "deleteFloorConfirmModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteFloorConfirmModal";


    modal.style.cssText = `
        position: fixed;
        inset: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;
        box-sizing: border-box;

        background: rgba(15,23,42,0.28);
        backdrop-filter: blur(6px);

        z-index: 999999;
    `;


    modal.innerHTML = `

        <div
            role="dialog"
            aria-modal="true"
            style="
                width: 525px;
                max-width: calc(100vw - 32px);

                box-sizing: border-box;

                background: #ffffff;

                border: 1px solid #e2e8f0;

                border-radius: 16px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.20);

                overflow: hidden;
            "
        >

            <!-- HEADER -->

            <div
                style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 20px 22px 16px;

                    border-bottom:
                        1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        font-size: 20px;
                        font-weight: 700;

                        color: #172033;
                    "
                >

                    <span
                        style="
                            font-size: 19px;
                        "
                    >
                        🗑️
                    </span>

                    Delete Floor

                </div>


                <button
                    type="button"
                    id="deleteFloorCloseButton"
                    aria-label="Close"
                    style="
                        width: 30px;
                        height: 30px;

                        padding: 0;

                        border: 0;

                        background: transparent;

                        color: #64748b;

                        font-size: 25px;
                        line-height: 1;

                        cursor: pointer;
                    "
                >
                    ×
                </button>

            </div>


            <!-- CONTENT -->

            <div
                style="
                    padding: 20px 22px 22px;
                "
            >

                <div
                    style="
                        margin-bottom: 12px;

                        font-size: 17px;
                        line-height: 1.45;

                        color: #243047;
                    "
                >

                    Delete
                    <strong>
                        "${floorName}"
                    </strong>
                    ?

                </div>


                <div
                    style="
                        max-width: 450px;

                        font-size: 15px;
                        line-height: 1.55;

                        color: #64748b;
                    "
                >

                    All rooms, zones, measurements and
                    sources on this floor will be removed
                    from the current project state.

                </div>

            </div>


            <!-- ACTIONS -->

            <div
                style="
                    display: flex;
                    justify-content: flex-end;
                    gap: 14px;

                    padding:
                        0 22px 22px;
                "
            >

                <button
                    type="button"
                    id="deleteFloorCancelButton"
                    style="
                        min-width: 112px;
                        height: 48px;

                        padding: 0 18px;

                        border:
                            1px solid #cbd5e1;

                        border-radius: 10px;

                        background: #ffffff;

                        color: #64748b;

                        font-size: 14px;
                        font-weight: 600;

                        cursor: pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteFloorConfirmButton"
                    style="
                        min-width: 138px;
                        height: 48px;

                        padding: 0 18px;

                        border:
                            1px solid #dc2626;

                        border-radius: 10px;

                        background: #dc2626;

                        color: #ffffff;

                        font-size: 14px;
                        font-weight: 700;

                        cursor: pointer;
                    "
                >
                    Delete Floor
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const closeButton =
        modal.querySelector(
            "#deleteFloorCloseButton"
        );


    const cancelButton =
        modal.querySelector(
            "#deleteFloorCancelButton"
        );


    const confirmButton =
        modal.querySelector(
            "#deleteFloorConfirmButton"
        );


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal =
        () => {

            modal.remove();

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

        };


    // ==========================================
    // ESC
    // ==========================================

    const escapeHandler =
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        };


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    // ==========================================
    // CANCEL
    // ==========================================

    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    // ==========================================
    // CLICK OUTSIDE
    // ==========================================

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    // ==========================================
    // CONFIRM DELETE
    // ==========================================

    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();


            AppState.project.floors.splice(
                index,
                1
            );


            // =====================
            // 🔥 NO FLOORS LEFT
            // =====================

            if (
                AppState.project.floors.length === 0
            ) {

                AppState.project.currentFloorIndex =
                    0;

                planImage = null;

                requestRender?.();

                renderFloorTabs?.();

                if (
                    AppMode.current ===
                    "home"
                ) {

                    renderHomeFloorTabs?.();

                }
                else {

                    renderBusinessFloorTabs?.();

                }


                refreshBusinessFloorSelect?.();

                return;
            }


            // 🔥 FIX ACTIVE FLOOR INDEX

            if (
                AppState.project.currentFloorIndex >=
                AppState.project.floors.length
            ) {

                AppState.project.currentFloorIndex =

                    AppState.project.floors.length - 1;
            }


            refreshBusinessFloorSelect?.();


            // =====================
            // 🔥 FIX INVALID INDEX
            // =====================

            if (
                AppState.project.currentFloorIndex >=
                AppState.project.floors.length
            ) {

                AppState.project.currentFloorIndex =
                    Math.max(
                        0,
                        AppState.project.floors.length - 1
                    );
            }


            const floor =
                AppState.project.floors[
                AppState.project.currentFloorIndex
                ];


            // =====================
            // 🔥 RESTORE IMAGE
            // =====================

            if (floor?.image) {

                const img =
                    new Image();


                img.onload = () => {

                    planImage = img;

                    resizeCanvasSafe?.();

                    requestRender?.();

                };


                img.src =
                    floor.image;

            }
            else {

                planImage = null;

                requestRender?.();

            }


            renderFloorTabs?.();

            renderHomeFloorTabs?.();


            updateStatus?.(
                "🗑 Floor deleted"
            );

        }
    );

}

function renameFloor(index) {

    const floor =
        AppState.project.floors[index];

    if (!floor) {
        return;
    }

    const name =
        prompt(
            "Rename floor:",
            floor.name
        );

    if (!name) {
        return;
    }

    floor.name =
        name;

    renderFloorTabs?.();

    if (
        AppMode.current ===
        "home"
    ) {

        renderHomeFloorTabs?.();

    }
    else {

        renderBusinessFloorTabs?.();

    }


    requestRender?.();
}

function renderHomeCurrentFloorCard() {

    const wrap =
        document.getElementById(
            "homeCurrentFloorCard"
        );

    if (!wrap) {

        console.warn(
            "🏠 HOME CURRENT FLOOR CARD — WRAP NOT FOUND"
        );

        return;
    }


    // ==================================================
    // HOME ONLY
    // ==================================================

    const mode =
        window.AppMode?.current ||
        "home";


    if (
        mode !== "home"
    ) {

        wrap.innerHTML = "";

        wrap.style.display =
            "none";

        return;
    }



    const project =
        AppState?.project;

    if (!project) {

        wrap.innerHTML = "";

        return;
    }


    const floorIndex =
        Number.isInteger(
            project.currentFloorIndex
        )
            ? project.currentFloorIndex
            : 0;


    const floor =
        project.floors?.[
        floorIndex
        ];


    if (!floor) {

        wrap.innerHTML = "";

        return;
    }


    // ==================================================
    // FLOOR NAME
    // ==================================================

    const floorName =
        floor.name ||
        `Floor ${floorIndex + 1}`;


    // ==================================================
    // LIFESTYLE AREAS
    // ==================================================

    const lifestyleAreas =
        Array.isArray(
            floor.zones
        )
            ? floor.zones
            : [];


    const lifestyleCount =
        lifestyleAreas.length;


    // ==================================================
    // LIFESTYLE FOCUS
    // ==================================================

    const lifestyleLabels = {

        sleep:
            "Sleep",

        work:
            "Work",

        relax:
            "Relax",

        child:
            "Child"

    };


    const lifestyleFocus =
        [
            ...new Set(

                lifestyleAreas
                    .map(
                        zone => {

                            const type =
                                String(
                                    zone?.zoneType ||
                                    zone?.type ||
                                    ""
                                )
                                    .toLowerCase()
                                    .trim();


                            return (
                                lifestyleLabels[type] ||
                                zone?.name ||
                                null
                            );

                        }
                    )
                    .filter(
                        Boolean
                    )

            )
        ];


    const lifestyleFocusLabel =
        lifestyleFocus.length
            ? lifestyleFocus.join(
                " · "
            )
            : "Not set";


    // ==================================================
    // INDOOR SOURCES
    // ==================================================

    const indoorSourceCount =
        Array.isArray(
            floor.sources
        )
            ? floor.sources.filter(
                source =>
                    source &&
                    source.placementType !==
                    "outdoor"
            ).length

            : (
                Array.isArray(
                    floor.indoorSources
                )
                    ? floor.indoorSources.length
                    : 0
            );


    // ==================================================
    // ASSESSMENT SETUP
    // ==================================================

    const hasPlan =
        !!floor.image;


    const assessmentStatus =
        hasPlan &&
            lifestyleCount > 0
            ? "Setup ready"
            : "Setup required";


    // ==================================================
    // RENDER
    // ==================================================

    wrap.innerHTML = `

        <div class="home-floor-card">

            <div class="home-floor-card-header">

                <div class="home-floor-card-title">
                    ${floorName}
                </div>

                <div class="home-floor-card-context">
                    Current Floor
                </div>

            </div>


            <div class="home-floor-card-stats">


                <!-- LIFESTYLE AREAS -->

                <div class="home-floor-stat">

                    <div class="home-floor-stat-icon lifestyle">
                        🎯
                    </div>

                    <div class="home-floor-stat-content">

                        <div class="home-floor-stat-label">
                            Lifestyle Areas
                        </div>

                        <div class="home-floor-stat-value">
                            ${lifestyleCount}
                        </div>

                    </div>

                </div>


                <!-- INDOOR SOURCES -->

                <div class="home-floor-stat">

                    <div class="home-floor-stat-icon sources">
                        📡
                    </div>

                    <div class="home-floor-stat-content">

                        <div class="home-floor-stat-label">
                            Indoor Sources
                        </div>

                        <div class="home-floor-stat-value">
                            ${indoorSourceCount}
                        </div>

                    </div>

                </div>


                <!-- LIFESTYLE FOCUS -->

                <div class="home-floor-stat">

                    <div class="home-floor-stat-icon focus">
                        🛏
                    </div>

                    <div class="home-floor-stat-content">

                        <div class="home-floor-stat-label">
                            Lifestyle Focus
                        </div>

                        <div class="home-floor-stat-value">
                            ${lifestyleFocusLabel}
                        </div>

                    </div>

                </div>


                <!-- ASSESSMENT SETUP -->

                <div class="home-floor-stat">

                    <div class="home-floor-stat-icon setup">
                        ✓
                    </div>

                    <div class="home-floor-stat-content">

                        <div class="home-floor-stat-label">
                            Assessment Setup
                        </div>

                        <div class="home-floor-stat-value">
                            ${assessmentStatus}
                        </div>

                    </div>

                </div>


            </div>

        </div>

    `;


    wrap.style.display =
        "block";


    console.log(
        "🏠 HOME CURRENT FLOOR CARD RENDERED",
        {
            floorIndex,
            floorId:
                floor.id,
            floorName,
            lifestyleFocus:
                lifestyleFocusLabel,
            lifestyleCount,
            indoorSourceCount,
            assessmentStatus
        }
    );

    updateHomeEmptyPlanState?.();
}


window.renderHomeCurrentFloorCard =
    renderHomeCurrentFloorCard;



function updateHomeEmptyPlanState() {

    const emptyState =
        document.getElementById(
            "homeEmptyPlanState"
        );

    const homeUpload =
        document.getElementById(
            "homeBtnUploadPlan"
        );

    const homePhoto =
        document.getElementById(
            "homeBtnTakePhoto"
        );

    const homeScale =
        document.getElementById(
            "homeBtnScale"
        );


    // ==================================================
    // HOME ONLY
    // ==================================================

    if (
        window.AppMode?.current !==
        "home"
    ) {

        if (emptyState) {

            emptyState.style.display =
                "none";

        }

        return;
    }


    // ==================================================
    // CURRENT PROJECT
    // ==================================================

    const project =
        AppState?.project;


    const floorIndex =
        Number.isInteger(
            project?.currentFloorIndex
        )
            ? project.currentFloorIndex
            : 0;


    const floor =
        project?.floors?.[
        floorIndex
        ];


    if (!floor) {

        if (emptyState) {

            emptyState.style.display =
                "none";

        }

        if (homeUpload) {

            homeUpload.style.display =
                "none";

        }

        if (homePhoto) {

            homePhoto.style.display =
                "none";

        }

        if (homeScale) {

            homeScale.style.display =
                "none";

        }

        return;
    }


    // ==================================================
    // PLAN STATE
    // ==================================================

    const hasPlan =
        !!floor.image;


    // ==================================================
    // EMPTY CANVAS STATE
    // ==================================================

    if (emptyState) {

        emptyState.style.display =
            hasPlan
                ? "none"
                : "flex";

    }


    // ==================================================
    // HOME PLAN ACTIONS
    // ==================================================
    //
    // NO PLAN:
    //     Upload + Take Photo
    //
    // PLAN EXISTS:
    //     Set Scale
    //
    // ==================================================

    if (!hasPlan) {

        if (homeUpload) {

            homeUpload.style.display =
                "flex";

        }

        if (homePhoto) {

            homePhoto.style.display =
                "flex";

        }

        if (homeScale) {

            homeScale.style.display =
                "none";

        }

    }

    else {

        if (homeUpload) {

            homeUpload.style.display =
                "none";

        }

        if (homePhoto) {

            homePhoto.style.display =
                "none";

        }

        if (homeScale) {

            homeScale.style.display =
                "flex";

        }

    }

    const title =
        document.getElementById(
            "homeEmptyPlanTitle"
        );

    if (title) {

        const projectName =
            AppState?.project?.name ||
            AppState?.homeProject?.name ||
            "";

        title.textContent =
            projectName.trim()
                ? `Add your floor plan for ${projectName.trim()}`
                : "Add your floor plan";
    }

}

window.updateHomeEmptyPlanState =
    updateHomeEmptyPlanState;


function updateBusinessEmptyPlanState() {

    const emptyState =
        document.getElementById(
            "businessEmptyPlanState"
        );

    if (!emptyState) {
        return;
    }


    const mode =
        window.AppMode?.current ||
        "home";


    const project =
        AppState?.project ||
        null;


    const floor =
        typeof getCurrentFloor === "function"
            ? getCurrentFloor()
            : null;


    const shouldShow =
        mode === "business" &&
        !!project &&
        !!floor &&
        !floor.image;


    emptyState.style.display =
        shouldShow
            ? "block"
            : "none";


    if (!shouldShow) {
        return;
    }


    const title =
        document.getElementById(
            "businessEmptyPlanTitle"
        );


    if (title) {

        const projectName =
            project.name ||
            "";


        const cleanName =
            String(
                projectName
            ).trim();


        title.textContent =
            cleanName
                ? `Add your floor plan for ${cleanName}`
                : "Add your floor plan";
    }
}


window.updateBusinessEmptyPlanState =
    updateBusinessEmptyPlanState;

function renderHomeFloorTabs() {

    renderHomeCurrentFloorCard?.();

    const wrap =
        document.getElementById(
            "homeFloorTabs"
        );

    if (!wrap) {

        console.warn(
            "🏠 HOME FLOOR PANEL — WRAP NOT FOUND"
        );

        return;
    }


    // ==================================================
    // CLEAR
    // ==================================================

    wrap.innerHTML = "";


    // ==================================================
    // CURRENT PROJECT
    // ==================================================

    const project =
        AppState?.project;

    if (!project) {

        wrap.style.display =
            "none";

        return;
    }


    // ==================================================
    // FLOORS
    // ==================================================

    const floors =
        Array.isArray(
            project.floors
        )
            ? project.floors
            : [];


    const currentFloorIndex =
        Number.isInteger(
            project.currentFloorIndex
        )
            ? project.currentFloorIndex
            : 0;


    // ==================================================
    // PANEL TITLE
    // ==================================================

    const title =
        document.createElement(
            "div"
        );

    title.className =
        "home-floors-panel-title";

    title.textContent =
        "FLOORS";

    wrap.appendChild(
        title
    );


    // ==================================================
    // FLOOR CARDS
    //
    // Current Floor is intentionally not shown here.
    // It is represented by the Main Floor / Current Floor
    // context above the workflow.
    //
    // ==================================================

    floors.forEach(
        (
            floor,
            index
        ) => {


            if (!floor) {
                return;
            }


            // ==================================================
            // FLOOR NAME
            // ==================================================

            const floorName =
                floor.name ||
                `Floor ${index + 1}`;


            // ==================================================
            // LIFESTYLE AREAS
            // ==================================================

            const lifestyleAreas =
                Array.isArray(
                    floor.zones
                )
                    ? floor.zones
                    : [];


            const lifestyleCount =
                lifestyleAreas.length;


            // ==================================================
            // LIFESTYLE FOCUS
            //
            // Home does not use Rooms.
            //
            // We summarize the actual Lifestyle Area types
            // present on this Floor.
            //
            // ==================================================

            const lifestyleLabels = {

                sleep:
                    "Sleep",

                work:
                    "Work",

                relax:
                    "Relax",

                child:
                    "Child"

            };


            const lifestyleFocus =
                [
                    ...new Set(

                        lifestyleAreas

                            .map(
                                zone => {

                                    const type =
                                        String(
                                            zone?.zoneType ||
                                            zone?.type ||
                                            ""
                                        )
                                            .toLowerCase()
                                            .trim();


                                    return (
                                        lifestyleLabels[type] ||
                                        zone?.name ||
                                        null
                                    );

                                }
                            )

                            .filter(
                                Boolean
                            )

                    )
                ];


            const lifestyleFocusLabel =
                lifestyleFocus.length
                    ? lifestyleFocus.join(
                        " · "
                    )
                    : "Not set";


            // ==================================================
            // INDOOR SOURCES
            //
            // Outdoor Sources are Property-wide and are
            // intentionally excluded from the Floor card.
            // ==================================================

            const indoorSourceCount =
                Array.isArray(
                    floor.sources
                )
                    ? floor.sources.filter(
                        source =>
                            source &&
                            source.placementType !==
                            "outdoor"
                    ).length
                    : (
                        Array.isArray(
                            floor.indoorSources
                        )
                            ? floor.indoorSources.length
                            : 0
                    );


            // ==================================================
            // LAST UPDATED
            //
            // Use an existing timestamp only.
            // Do not invent one.
            // ==================================================

            const rawUpdatedAt =
                floor.updatedAt ??
                floor.updated_at ??
                floor.lastUpdatedAt ??
                floor.modifiedAt ??
                null;


            let updatedLabel =
                "Last updated: —";


            if (
                rawUpdatedAt
            ) {

                const updatedDate =
                    new Date(
                        rawUpdatedAt
                    );


                if (
                    !Number.isNaN(
                        updatedDate.getTime()
                    )
                ) {

                    const now =
                        new Date();


                    const sameDay =
                        updatedDate
                            .toDateString() ===
                        now
                            .toDateString();


                    if (
                        sameDay
                    ) {

                        updatedLabel =
                            "Last updated: Today, " +
                            updatedDate.toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit"
                                }
                            );

                    }
                    else {

                        updatedLabel =
                            "Last updated: " +
                            updatedDate.toLocaleDateString(
                                [],
                                {
                                    month:
                                        "short",

                                    day:
                                        "numeric",

                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit"
                                }
                            );
                    }
                }
            }


            // ==================================================
            // ICON
            // ==================================================

            const icon =
                index === 0
                    ? "🏠"
                    : "🏢";


            // ==================================================
            // FLOOR BUTTON
            // ==================================================

            const btn =
                document.createElement(
                    "button"
                );

            btn.type =
                "button";

            btn.className =
                "home-floor-tab";


            // ==================================================
            // CARD
            // ==================================================

            btn.innerHTML = `

                <div class="home-floor-list-card">

                    <div class="home-floor-list-main">

                        <div class="home-floor-list-icon">
                            ${icon}
                        </div>


                        <div class="home-floor-list-content">

                            <div class="home-floor-list-header">

                                <div class="home-floor-list-name">
                                    ${floorName}
                                </div>

                            </div>


                            <div class="home-floor-list-info">

                                <div>

                                    <span
                                        class="home-floor-info-icon"
                                    >
                                        🛏
                                    </span>

                                    Lifestyle Focus:
                                    ${lifestyleFocusLabel}

                                </div>


                                <div>

                                    <span
                                        class="home-floor-info-icon"
                                    >
                                        ◉
                                    </span>

                                    Lifestyle Areas:
                                    ${lifestyleCount}

                                </div>


                                <div>

                                    <span
                                        class="home-floor-info-icon"
                                    >
                                        📡
                                    </span>

                                    Indoor Sources:
                                    ${indoorSourceCount}

                                </div>


                                <div>

                                    <span
                                        class="home-floor-info-icon"
                                    >
                                        ▣
                                    </span>

                                    ${updatedLabel}

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="home-floor-list-chevron">
                        ›
                    </div>

                </div>

            `;


            // ==================================================
            // OPEN FLOOR
            // ==================================================

            btn.onclick =
                (e) => {

                    e.preventDefault();

                    e.stopPropagation();


                    openFloor?.(
                        index
                    );


                    requestAnimationFrame(
                        () => {

                            renderHomeFloorTabs?.();

                            updateHomeLocks?.();

                            updateHomeSidebarStatus?.();

                            updateHomeWorkflow?.();

                            updateWorkflowUI?.();

                            requestRender?.();

                        }
                    );

                };


            wrap.appendChild(
                btn
            );


            // ==================================================
            // DEBUG
            // ==================================================

            console.log(
                "🏠 HOME FLOOR LIST CARD",
                {
                    index,

                    floorId:
                        floor.id,

                    floorName,

                    lifestyleFocus:
                        lifestyleFocusLabel,

                    lifestyleCount,

                    indoorSourceCount,

                    updatedAt:
                        rawUpdatedAt
                }
            );

        }
    );


    // ==================================================
    // ADD FLOOR
    // ==================================================

    const addBtn =
        document.createElement(
            "button"
        );

    addBtn.type =
        "button";

    addBtn.className =
        "home-floor-tab home-floor-add-card";


    addBtn.innerHTML = `

        <div class="home-floor-list-card home-floor-add">

            <div class="home-floor-add-icon">
                +
            </div>


            <div class="home-floor-add-content">

                <div class="home-floor-list-name">
                    Add Floor
                </div>

                <div class="home-floor-add-subtitle">
                    Create a new floor
                </div>

            </div>

        </div>

    `;


    addBtn.onclick =
        (e) => {

            e.preventDefault();

            e.stopPropagation();

            openNewFloorPopup?.();

        };


    wrap.appendChild(
        addBtn
    );


    // ==================================================
    // VISIBILITY
    // ==================================================

    wrap.style.display =
        "block";


    console.log(
        "🏠 HOME FLOOR PANEL RENDERED",
        {
            totalFloors:
                floors.length,

            currentFloorIndex,

            visibleFloorCards:
                Math.max(
                    0,
                    floors.length - 1
                ),

            addFloor:
                true
        }
    );
}

window.renderHomeFloorTabs =
    renderHomeFloorTabs;

window.renderBusinessFloorTabs =
    renderBusinessFloorTabs;

function renderBusinessFloorTabs() {

    const homeTabs =
        document.getElementById(
            "homeFloorTabs"
        );

    const businessTabs =
        document.getElementById(
            "businessFloorTabs"
        );


    // ==================================================
    // BUSINESS MODE VISIBILITY
    // ==================================================

    if (homeTabs) {

        homeTabs.style.display =
            "none";
    }

    if (!businessTabs) {

        console.error(
            "🔥 BUSINESS FLOOR TABS NOT FOUND"
        );

        return;
    }

    businessTabs.style.display =
        "flex";

    businessTabs.innerHTML =
        "";


    // ==================================================
    // ACTIVE PROJECT
    // ==================================================

    const project =
        AppState?.project;

    if (!project) {

        console.error(
            "🔥 NO ACTIVE PROJECT FOR BUSINESS FLOOR TABS"
        );

        return;
    }


    const floors =
        Array.isArray(
            project.floors
        )
            ? project.floors
            : [];


    const currentFloorIndex =
        Number.isInteger(
            project.currentFloorIndex
        )
            ? project.currentFloorIndex
            : 0;


    console.error(
        "🔥 BUSINESS FLOOR RENDER",
        {
            projectId:
                project.project_id ??
                project.id ??
                null,

            projectType:
                project.type,

            floorCount:
                floors.length,

            currentFloorIndex,

            floors:
                floors.map(
                    (
                        floor,
                        index
                    ) => ({

                        index,

                        id:
                            floor?.id,

                        name:
                            floor?.name,

                        rooms:
                            floor?.rooms?.length ||
                            0,

                        zones:
                            floor?.zones?.length ||
                            0,

                        scaleConfirmed:
                            !!floor?.scaleConfirmed

                    })
                )
        }
    );


    // ==================================================
    // FLOORS
    // ==================================================

    floors.forEach(
        (
            floor,
            index
        ) => {


            // ==================================================
            // OUTER FLOOR ITEM
            // ==================================================

            const cardButton =
                document.createElement(
                    "div"
                );


            /*
             * BUSINESS FLOOR ITEM
             *
             * IMPORTANT:
             * Do NOT use home-floor-tab.
             */

            cardButton.className =
                "business-floor-tab";


            cardButton.style.cursor =
                "pointer";


            // ==================================================
            // ACTIVE FLOOR
            // ==================================================

            if (
                index ===
                currentFloorIndex
            ) {

                cardButton.classList.add(
                    "active"
                );
            }


            // ==================================================
            // ROOM COUNT
            // ==================================================

            const rooms =
                Array.isArray(
                    floor?.rooms
                )
                    ? floor.rooms
                    : [];


            const roomCount =
                rooms.length;


            // ==================================================
            // GRID PROGRESS
            // ==================================================

            const totalPoints =
                rooms.reduce(
                    (
                        sum,
                        room
                    ) => {

                        return (
                            sum +
                            (
                                room?.grid
                                    ?.length ||
                                0
                            )
                        );

                    },
                    0
                );


            const measuredPoints =
                rooms.reduce(
                    (
                        sum,
                        room
                    ) => {

                        return (
                            sum +
                            (
                                room?.grid ||
                                []
                            ).filter(
                                point =>
                                    point?.rf ||
                                    point?.electric ||
                                    point?.magnetic
                            ).length
                        );

                    },
                    0
                );


            const progress =
                totalPoints > 0
                    ? Math.round(
                        (
                            measuredPoints /
                            totalPoints
                        ) * 100
                    )
                    : 0;


            // ==================================================
            // DEBUG
            // ==================================================

            console.error(
                "🔥 BUSINESS FLOOR CARD",
                {
                    index,

                    floorId:
                        floor?.id,

                    floorName:
                        floor?.name,

                    roomCount,

                    rooms:
                        rooms.map(
                            room => ({

                                id:
                                    room?.id,

                                code:
                                    room?.code,

                                name:
                                    room?.name

                            })
                        ),

                    totalPoints,

                    measuredPoints,

                    progress,

                    scaleConfirmed:
                        !!floor?.scaleConfirmed
                }
            );


            // ==================================================
            // COMPACT FLOOR HTML
            // ==================================================

            cardButton.innerHTML = `

                <div class="business-floor-selector-inner">


                    <!-- ============================== -->
                    <!-- FLOOR MAIN CONTENT -->
                    <!-- ============================== -->

                    <div class="business-floor-main">


                        <span class="business-floor-icon">
                            🏢
                        </span>


                        <span class="business-floor-name">
                            ${floor?.name || "Floor"}
                        </span>


                        <span class="business-floor-meta">
                            ${roomCount}
                            room${roomCount !== 1 ? "s" : ""}
                            ·
                            ${progress}%
                        </span>


                    </div>


                    <!-- ============================== -->
                    <!-- FLOOR ACTIONS -->
                    <!-- ============================== -->

                    <div class="business-floor-actions">


                        <button
                            type="button"
                            class="floor-action-btn floor-rename-btn"
                            title="Rename floor"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="floor-action-btn floor-delete-btn"
                            title="Delete floor"
                        >
                            🗑
                        </button>


                    </div>


                </div>

            `;


            // ==================================================
            // OPEN FLOOR
            // ==================================================

            cardButton.addEventListener(
                "click",
                () => {

                    console.error(
                        "🔥 FLOOR CARD CLICK",
                        {
                            index,

                            floorId:
                                floor?.id,

                            floorName:
                                floor?.name
                        }
                    );


                    openFloor?.(
                        index
                    );


                    renderBusinessFloorTabs?.();

                }
            );


            // ==================================================
            // RENAME
            // ==================================================

            const renameButton =
                cardButton.querySelector(
                    ".floor-rename-btn"
                );


            if (renameButton) {

                renameButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const oldName =
                            floor?.name ||
                            `Floor ${index + 1}`;


                        showRenameFloorModal(
                            floor,
                            oldName,
                            trimmedName => {

                                // ==========================================
                                // UPDATE CANONICAL FLOOR STATE
                                // ==========================================

                                floor.name =
                                    trimmedName;

                                console.error(
                                    "🔥 FLOOR RENAMED",
                                    {
                                        index,

                                        floorId:
                                            floor.id,

                                        oldName,

                                        newName:
                                            trimmedName
                                    }
                                );

                                // ==========================================
                                // REFRESH UI
                                // ==========================================

                                renderBusinessFloorTabs?.();

                                renderFloorTabs?.();

                                updateProjectHeader?.();

                                window.updateWorkflowUI?.();

                            }
                        );


                        // ==========================================
                        // UPDATE CANONICAL FLOOR STATE
                        // ==========================================

                        floor.name =
                            trimmedName;


                        console.error(
                            "🔥 FLOOR RENAMED",
                            {
                                index,

                                floorId:
                                    floor.id,

                                oldName,

                                newName:
                                    trimmedName
                            }
                        );


                        // ==========================================
                        // REFRESH UI
                        // ==========================================

                        renderBusinessFloorTabs?.();

                        renderFloorTabs?.();

                        updateProjectHeader?.();

                        window.updateWorkflowUI?.();

                    }
                );

            }


            // ==================================================
            // DELETE
            // ==================================================

            const deleteButton =
                cardButton.querySelector(
                    ".floor-delete-btn"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        // ==========================================
                        // SAFETY
                        // ==========================================

                        if (
                            floors.length <= 1
                        ) {

                            showFloorRequiredAlert();

                            return;
                        }


                        const floorName =
                            floor?.name ||
                            `Floor ${index + 1}`;


                        showDeleteFloorConfirm(
                            floorName,
                            () => {

                                // ==========================================
                                // DELETE FLOOR
                                // ==========================================

                                console.error(
                                    "🔥 DELETE FLOOR",
                                    {
                                        index,

                                        floorId:
                                            floor?.id,

                                        floorName,

                                        currentFloorIndex:
                                            project.currentFloorIndex
                                    }
                                );

                                floors.splice(
                                    index,
                                    1
                                );

                                // ==========================================
                                // CALCULATE NEW ACTIVE INDEX
                                // ==========================================

                                let newIndex =
                                    project.currentFloorIndex;

                                if (
                                    index <
                                    newIndex
                                ) {

                                    newIndex -= 1;

                                }
                                else if (
                                    index ===
                                    newIndex
                                ) {

                                    newIndex =
                                        Math.min(
                                            newIndex,
                                            floors.length - 1
                                        );
                                }

                                newIndex =
                                    Math.max(
                                        0,
                                        newIndex
                                    );

                                project.currentFloorIndex =
                                    newIndex;

                                console.error(
                                    "🔥 FLOOR DELETED",
                                    {
                                        deletedIndex:
                                            index,

                                        newIndex,

                                        remainingFloors:
                                            floors.map(
                                                (
                                                    item,
                                                    i
                                                ) => ({

                                                    index:
                                                        i,

                                                    id:
                                                        item?.id,

                                                    name:
                                                        item?.name,

                                                    rooms:
                                                        item?.rooms?.length ||
                                                        0,

                                                    scaleConfirmed:
                                                        !!item?.scaleConfirmed

                                                })
                                            )
                                    }
                                );

                                // ==========================================
                                // OPEN NEW ACTIVE FLOOR
                                // ==========================================

                                openFloor?.(
                                    newIndex
                                );

                                // ==========================================
                                // REFRESH UI
                                // ==========================================

                                renderBusinessFloorTabs?.();

                                renderFloorTabs?.();

                                window.updateWorkflowUI?.();

                                window.updateHomeWorkflow?.();

                                window.updateHomeLocks?.();

                                updateProjectHeader?.();

                                updateCurrentExposure?.();

                            }
                        );


                        // ==========================================
                        // DELETE FLOOR
                        // ==========================================

                        console.error(
                            "🔥 DELETE FLOOR",
                            {
                                index,

                                floorId:
                                    floor?.id,

                                floorName,

                                currentFloorIndex:
                                    project.currentFloorIndex
                            }
                        );


                        floors.splice(
                            index,
                            1
                        );


                        // ==========================================
                        // CALCULATE NEW ACTIVE INDEX
                        // ==========================================

                        let newIndex =
                            project.currentFloorIndex;


                        if (
                            index <
                            newIndex
                        ) {

                            newIndex -= 1;

                        }
                        else if (
                            index ===
                            newIndex
                        ) {

                            newIndex =
                                Math.min(
                                    newIndex,
                                    floors.length - 1
                                );
                        }


                        newIndex =
                            Math.max(
                                0,
                                newIndex
                            );


                        project.currentFloorIndex =
                            newIndex;


                        console.error(
                            "🔥 FLOOR DELETED",
                            {
                                deletedIndex:
                                    index,

                                newIndex,

                                remainingFloors:
                                    floors.map(
                                        (
                                            item,
                                            i
                                        ) => ({

                                            index:
                                                i,

                                            id:
                                                item?.id,

                                            name:
                                                item?.name,

                                            rooms:
                                                item?.rooms?.length ||
                                                0,

                                            scaleConfirmed:
                                                !!item?.scaleConfirmed

                                        })
                                    )
                            }
                        );


                        // ==========================================
                        // OPEN NEW ACTIVE FLOOR
                        // ==========================================

                        openFloor?.(
                            newIndex
                        );


                        // ==========================================
                        // REFRESH UI
                        // ==========================================

                        renderBusinessFloorTabs?.();

                        renderFloorTabs?.();

                        window.updateWorkflowUI?.();

                        window.updateHomeWorkflow?.();

                        window.updateHomeLocks?.();

                        updateProjectHeader?.();

                        updateCurrentExposure?.();

                    }
                );

            }


            // ==================================================
            // APPEND FLOOR
            // ==================================================

            businessTabs.appendChild(
                cardButton
            );

        }
    );


    // ==================================================
    // ADD FLOOR
    // ==================================================

    const addBtn =
        document.createElement(
            "div"
        );


    /*
     * BUSINESS ADD FLOOR
     *
     * Small horizontal action.
     * NOT a large floor card.
     */

    addBtn.className =
        "business-floor-tab add-floor-tab";


    addBtn.style.cursor =
        "pointer";


    addBtn.innerHTML = `

        <div class="business-floor-add-inner">

            <span class="business-floor-add-icon">
                ＋
            </span>

            <span class="business-floor-add-label">
                Add Floor
            </span>

        </div>

    `;


    addBtn.addEventListener(
        "click",
        () => {

            console.error(
                "🔥 ADD FLOOR CARD CLICK"
            );


            openNewFloorPopup?.();

        }
    );


    businessTabs.appendChild(
        addBtn
    );


    // ==================================================
    // COMPLETE
    // ==================================================

    console.log(
        "🔥 BUSINESS FLOOR TABS COMPLETE",
        {
            projectId:
                project.project_id ??
                project.id ??
                null,

            cards:
                businessTabs
                    .children
                    .length,

            visible:
                getComputedStyle(
                    businessTabs
                ).display,

            currentFloorIndex:
                project.currentFloorIndex
        }
    );
}

function showRenameFloorModal(
    floor,
    oldName,
    onConfirm
) {

    document
        .getElementById(
            "renameFloorModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "renameFloorModal";


    modal.style.cssText = `
        position:fixed;
        inset:0;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:24px;
        box-sizing:border-box;

        background:rgba(15,23,42,.28);
        backdrop-filter:blur(6px);

        z-index:999999;
    `;


    modal.innerHTML = `

        <div
            role="dialog"
            aria-modal="true"
            style="
                width:420px;
                max-width:calc(100vw - 32px);

                box-sizing:border-box;

                background:#ffffff;

                border:
                    1px solid #e2e8f0;

                border-radius:14px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.20);

                overflow:hidden;
            "
        >

            <!-- HEADER -->

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;

                    padding:16px 18px 12px;

                    border-bottom:
                        1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:9px;

                        font-size:17px;
                        font-weight:700;

                        color:#0f172a;
                    "
                >

                    <span>
                        ✏️
                    </span>

                    Rename Floor

                </div>


                <button
                    type="button"
                    id="renameFloorCloseButton"
                    aria-label="Close"
                    style="
                        width:30px;
                        height:30px;

                        padding:0;

                        border:0;

                        background:transparent;

                        color:#64748b;

                        font-size:22px;
                        line-height:1;

                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <!-- CONTENT -->

            <div
                style="
                    padding:16px 18px 18px;
                "
            >

                <label
                    for="renameFloorInput"
                    style="
                        display:block;

                        margin-bottom:6px;

                        font-size:12px;
                        font-weight:600;

                        color:#334155;
                    "
                >
                    Floor Name
                </label>


                <input
                    id="renameFloorInput"
                    type="text"
                    value="${String(oldName)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}"
                    style="
                        width:100%;
                        height:44px;

                        box-sizing:border-box;

                        padding:10px 12px;

                        border:
                            1px solid #cbd5e1;

                        border-radius:8px;

                        background:#ffffff;

                        color:#1e293b;

                        font-size:14px;

                        outline:none;
                    "
                />

            </div>


            <!-- ACTIONS -->

            <div
                style="
                    display:flex;
                    justify-content:flex-end;

                    gap:8px;

                    padding:
                        0 18px 16px;
                "
            >

                <button
                    type="button"
                    id="renameFloorCancelButton"
                    style="
                        min-width:90px;
                        height:38px;

                        padding:7px 14px;

                        border:
                            1px solid #cbd5e1;

                        border-radius:8px;

                        background:#ffffff;

                        color:#64748b;

                        font-size:12px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="renameFloorSaveButton"
                    style="
                        min-width:105px;
                        height:38px;

                        padding:7px 14px;

                        border:
                            1px solid #2563eb;

                        border-radius:8px;

                        background:#2563eb;

                        color:#ffffff;

                        font-size:12px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Save Changes
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const input =
        modal.querySelector(
            "#renameFloorInput"
        );


    const closeButton =
        modal.querySelector(
            "#renameFloorCloseButton"
        );


    const cancelButton =
        modal.querySelector(
            "#renameFloorCancelButton"
        );


    const saveButton =
        modal.querySelector(
            "#renameFloorSaveButton"
        );


    // ==========================================
    // CLOSE
    // ==========================================

    const closeModal =
        () => {

            modal.remove();

        };


    // ==========================================
    // SAVE
    // ==========================================

    const save =
        () => {

            const trimmedName =
                input?.value
                    ?.trim() ||
                "";


            if (!trimmedName) {

                input?.focus();

                return;
            }


            closeModal();

            onConfirm?.(
                trimmedName
            );

        };


    // ==========================================
    // EVENTS
    // ==========================================

    saveButton?.addEventListener(
        "click",
        save
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    input?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                save();

            }

            else if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeModal();

            }

        }
    );


    // ==========================================
    // OVERLAY
    // ==========================================

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    // ==========================================
    // FOCUS

    setTimeout(
        () => {

            input?.focus();

            input?.select();

        },
        50
    );

}


function showDeleteFloorConfirm(
    floorName,
    onConfirm
) {

    document
        .getElementById(
            "deleteFloorConfirmModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteFloorConfirmModal";


    modal.style.cssText = `
        position:fixed;
        inset:0;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:24px;
        box-sizing:border-box;

        background:rgba(15,23,42,.28);
        backdrop-filter:blur(6px);

        z-index:999999;
    `;


    modal.innerHTML = `

        <div
            role="dialog"
            aria-modal="true"
            style="
                width:420px;
                max-width:calc(100vw - 32px);

                box-sizing:border-box;

                background:#ffffff;

                border:
                    1px solid #e2e8f0;

                border-radius:14px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.20);

                overflow:hidden;
            "
        >

            <!-- HEADER -->

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;

                    padding:16px 18px 12px;

                    border-bottom:
                        1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:9px;

                        font-size:17px;
                        font-weight:700;

                        color:#0f172a;
                    "
                >

                    <span>
                        🗑️
                    </span>

                    Delete Floor

                </div>


                <button
                    type="button"
                    id="deleteFloorCloseButton"
                    aria-label="Close"
                    style="
                        width:30px;
                        height:30px;

                        padding:0;

                        border:0;

                        background:transparent;

                        color:#64748b;

                        font-size:22px;
                        line-height:1;

                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <!-- CONTENT -->

            <div
                style="
                    padding:16px 18px 18px;
                "
            >

                <div
                    style="
                        font-size:14px;
                        line-height:1.45;

                        color:#1e293b;

                        margin-bottom:8px;
                    "
                >

                    Delete
                    <b>
                        "${floorName}"
                    </b>
                    ?

                </div>


                <div
                    style="
                        font-size:12px;
                        line-height:1.55;

                        color:#64748b;
                    "
                >

                    All rooms, zones, measurements and
                    sources on this floor will be removed
                    from the current project state.

                </div>

            </div>


            <!-- ACTIONS -->

            <div
                style="
                    display:flex;
                    justify-content:flex-end;

                    gap:8px;

                    padding:
                        0 18px 16px;
                "
            >

                <button
                    type="button"
                    id="deleteFloorCancelButton"
                    style="
                        min-width:90px;
                        height:38px;

                        padding:7px 14px;

                        border:
                            1px solid #cbd5e1;

                        border-radius:8px;

                        background:#ffffff;

                        color:#64748b;

                        font-size:12px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteFloorConfirmButton"
                    style="
                        min-width:110px;
                        height:38px;

                        padding:7px 14px;

                        border:
                            1px solid #dc2626;

                        border-radius:8px;

                        background:#dc2626;

                        color:#ffffff;

                        font-size:12px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Delete Floor
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==========================================
    // ELEMENTS
    // ==========================================

    const closeButton =
        modal.querySelector(
            "#deleteFloorCloseButton"
        );


    const cancelButton =
        modal.querySelector(
            "#deleteFloorCancelButton"
        );


    const confirmButton =
        modal.querySelector(
            "#deleteFloorConfirmButton"
        );


    // ==========================================
    // CLOSE
    // ==========================================

    const closeModal =
        () => {

            modal.remove();

        };


    // ==========================================
    // CONFIRM
    // ==========================================

    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();

            onConfirm?.();

        }
    );


    // ==========================================
    // CANCEL
    // ==========================================

    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    // ==========================================
    // OVERLAY
    // ==========================================

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    // ==========================================
    // ESC
    // ==========================================

    const escapeHandler =
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );

            }

        };


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    // ==========================================
    // FOCUS
    // ==========================================

    setTimeout(
        () => {

            cancelButton?.focus();

        },
        50
    );

}

function syncState() {

    requestRender?.();

    updateUIState?.();

    window.updateProgressUI?.();
}


function updateFloorUI() {
    const select = document.getElementById("floorSelect");
    if (!select) return;

    if (
        AppState.project.floors.length === 0
    ) {
        const status = document.getElementById("statusText");
        if (status) status.innerText = "No floor loaded";
        return;
    }

    // 🔥 fix index
    if (
        AppState.project.currentFloorIndex < 0 ||
        AppState.project.currentFloorIndex >= AppState.project.floors.length
    ) {

        AppState.project.currentFloorIndex = 0;
    }

    const floor =
        AppState.project.floors[
        AppState.project.currentFloorIndex
        ];

    // 🔥 status
    const status = document.getElementById("statusText");
    if (status) status.innerText = "Floor: " + (floor.name || "Unnamed");

    // 🔥 dropdown
    select.innerHTML = "";

    floors.forEach((f, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = f.name || ("Floor " + (i + 1));
        select.appendChild(opt);
    });

    select.va.lue =
        AppState.project.currentFloorIndex =
        parseInt(index);

    renderFloorList();
    renderFloorTabs();
}


function switchFloor(index) {

    console.error(
        "========== SWITCH FLOOR =========="
    );

    const floorIndex =
        Number(index);

    const floors =
        AppState.project.floors || [];

    const floor =
        floors[floorIndex];

    if (!floor) {

        console.error(
            "SWITCH FLOOR FAILED:",
            floorIndex
        );

        return;
    }

    // ==================================================
    // SET ACTIVE FLOOR
    // ==================================================

    AppState.project.currentFloorIndex =
        floorIndex;

    console.error(
        "SWITCH TO FLOOR:",
        {
            index: floorIndex,
            name: floor.name,
            image: !!floor.image,
            imageData: !!floor.imageData,
            rooms: floor.rooms?.length || 0,
            zones: floor.zones?.length || 0
        }
    );

    // ==================================================
    // RESET TEMP STATE
    // ==================================================

    AppState.ui.roomDraft = null;
    window.currentRoom = null;

    AppState.ui.zoneDraft = null;
    window.currentZone = null;

    selectedRoom = null;
    AppState.ui.selectedZone = null;

    window.hoveredGridPoint = null;
    hoverLabel = null;

    window.scalePoints = [];

    // ==================================================
    // SCALE
    // ==================================================

    if (window.scaleTool) {

        window.scaleTool.calibrated =
            !!floor.scaleConfirmed;

        window.scaleTool.metersPerPixel =
            floor.currentScale || 0;
    }

    // ==================================================
    // UI
    // ==================================================

    renderFloorTabs?.();
    renderHomeFloorTabs?.();
    renderBusinessFloorTabs?.();

    updateProjectHeader?.();
    updateRoomStatusUI?.();
    updateProgressUI?.();
    updateFlow?.();

    // ==================================================
    // LOAD CORRECT FLOOR IMAGE
    // ==================================================

    loadFloorImage(floor);

    // ==================================================
    // RESIZE + RENDER
    // ==================================================

    requestAnimationFrame(() => {

        resizeCanvasSafe?.();

        requestRender?.();

    });
}


function showFloorRequiredAlert() {

    document
        .getElementById(
            "floorRequiredAlertModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "floorRequiredAlertModal";


    modal.style.cssText = `
        position: fixed;
        inset: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;
        box-sizing: border-box;

        background: rgba(15,23,42,0.28);
        backdrop-filter: blur(6px);

        z-index: 999999;

        pointer-events: auto;
    `;


    modal.innerHTML = `

        <div
            role="dialog"
            aria-modal="true"
            style="
                width: 480px;
                max-width: calc(100vw - 32px);

                box-sizing: border-box;

                background: #ffffff;

                border: 1px solid #dbe3ec;

                border-radius: 14px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.18);

                overflow: hidden;
            "
        >

            <div
                style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 16px 18px 12px;

                    border-bottom:
                        1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display: flex;
                        align-items: center;
                        gap: 9px;

                        font-size: 17px;
                        font-weight: 700;

                        color: #0f172a;
                    "
                >

                    <span>
                        ⚠️
                    </span>

                    Floor Required

                </div>


                <button
                    type="button"
                    id="floorRequiredCloseButton"
                    aria-label="Close"
                    style="
                        width: 30px;
                        height: 30px;

                        padding: 0;

                        border: 0;

                        background: transparent;

                        color: #64748b;

                        font-size: 22px;
                        line-height: 1;

                        cursor: pointer;
                    "
                >
                    ×
                </button>

            </div>


            <div
                style="
                    padding: 16px 18px 18px;
                "
            >

                <div
                    style="
                        font-size: 14px;
                        line-height: 1.5;

                        color: #1e293b;
                    "
                >

                    The project must contain
                    at least one floor.

                </div>

            </div>


            <div
                style="
                    display: flex;
                    justify-content: flex-end;

                    padding:
                        0 18px 16px;
                "
            >

                <button
                    type="button"
                    id="floorRequiredOkButton"
                    style="
                        min-width: 90px;
                        height: 38px;

                        padding: 7px 14px;

                        border:
                            1px solid #2563eb;

                        border-radius: 8px;

                        background: #2563eb;

                        color: #ffffff;

                        font-size: 12px;
                        font-weight: 600;

                        cursor: pointer;
                    "
                >
                    OK
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            "#floorRequiredCloseButton"
        );


    const okButton =
        modal.querySelector(
            "#floorRequiredOkButton"
        );


    const closeModal =
        () => {

            modal.remove();

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

        };


    const escapeHandler =
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        };


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    okButton?.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    setTimeout(
        () => {

            okButton?.focus();

        },
        50
    );

}


function resizeCanvasSafe() {

    console.error(
        "🔥 RESIZE CANVAS SAFE"
    );

    console.trace(
        "🔥🔥🔥 WHO CALLED resizeCanvasSafe()"
    );

    // ==================================================
    // CANVAS
    // ==================================================

    const canvas =
        window.canvas ||
        document.getElementById(
            "canvas"
        );

    const ctx =
        window.ctx ||
        canvas?.getContext(
            "2d"
        );

    if (
        !canvas ||
        !ctx
    ) {

        console.warn(
            "❌ CANVAS OR CONTEXT NOT AVAILABLE"
        );

        return false;
    }

    // ==================================================
    // 🔥 REAL CANVAS CONTAINER
    // ==================================================
    //
    // IMPORTANT:
    //
    // DO NOT use .main-content here.
    //
    // Room navigator now lives beside the
    // canvas column.
    //
    // Therefore the canvas viewport must be
    // measured from the actual canvas area.
    //
    // ==================================================

    const canvasWrap =
        document.getElementById(
            "canvasWrap"
        );

    const canvasArea =
        document.querySelector(
            ".canvas-area"
        );

    const container =
        canvasWrap ||
        canvasArea;

    if (
        !container
    ) {

        console.warn(
            "❌ CANVAS CONTAINER NOT FOUND"
        );

        return false;
    }

    // ==================================================
    // REAL CONTAINER RECT
    // ==================================================

    const rect =
        container.getBoundingClientRect();

    const w =
        Math.floor(
            rect.width
        );

    const h =
        Math.floor(
            rect.height
        );

    console.error(
        "🔥 CANVAS CONTAINER SIZE",
        {
            width:
                w,

            height:
                h,

            canvasWrap:
                !!canvasWrap,

            canvasArea:
                !!canvasArea
        }
    );

    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        w < 100 ||
        h < 100
    ) {

        console.warn(
            "⚠️ INVALID CANVAS SIZE",
            {
                width:
                    w,

                height:
                    h
            }
        );

        return false;
    }

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.() ||
        null;

    const image =
        floor?.image ||
        window.planImage ||
        null;

    // ==================================================
    // DEBUG
    // ==================================================

    console.error(
        "🔥 RESIZE INPUT",
        {
            floor:
                floor?.name ||
                null,

            floorId:
                floor?.id ||
                null,

            image:
                image
                    ? `${image.width}x${image.height}`
                    : null,

            containerWidth:
                w,

            containerHeight:
                h
        }
    );

    // ==================================================
    // 🔥 UPDATE VIEWPORT FIRST
    // ==================================================
    //
    // EMFViewport must receive the REAL canvas
    // dimensions.
    //
    // This is the critical fix.
    //
    // ==================================================

    if (
        window.EMFViewport &&
        typeof
        window.EMFViewport.update ===
        "function"
    ) {

        EMFViewport.update(
            w,
            h,
            floor
        );

    }
    else {

        console.error(
            "❌ EMFViewport.update NOT AVAILABLE"
        );

        return false;
    }

    // ==================================================
    // 🔥 APPLY REAL CANVAS SIZE
    // ==================================================

    canvas.width =
        w;

    canvas.height =
        h;

    canvas.style.width =
        w + "px";

    canvas.style.height =
        h + "px";

    // ==================================================
    // 🔥 RESET TRANSFORM
    // ==================================================

    ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
    );

    // ==================================================
    // 🔥 DEBUG — FINAL STATE
    // ==================================================

    console.error(
        "🔥🔥🔥 VIEWPORT AFTER RESIZE",
        {

            canvasWidth:
                canvas.width,

            canvasHeight:
                canvas.height,

            viewportWidth:
                EMFViewport.viewportWidth,

            viewportHeight:
                EMFViewport.viewportHeight,

            drawWidth:
                EMFViewport.drawWidth,

            drawHeight:
                EMFViewport.drawHeight,

            scale:
                EMFViewport.scale,

            baseScale:
                EMFViewport.baseScale,

            zoom:
                EMFViewport.zoom,

            offsetX:
                EMFViewport.offsetX,

            offsetY:
                EMFViewport.offsetY
        }
    );

    return true;
}

function refreshFloorSelect() {

    const select =
        document.getElementById(
            "floorSelect"
        );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    AppState.project.floors
        .forEach(

            (
                floor,
                index
            ) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    index;

                option.textContent =
                    floor.name;

                select.appendChild(
                    option
                );
            }
        );

    select.value =

        AppState.project
            .currentFloorIndex;
}

// 🔥 expose globally

window.refreshFloorSelect =
    refreshFloorSelect;

refreshFloorSelect();

// =====================
// 🔥 FLOOR CHANGE
// =====================

const floorSelect =
    document.getElementById(
        "floorSelect"
    );

if (floorSelect) {

    floorSelect.onchange =
        () => {

            AppState.project
                .currentFloorIndex =

                Number(
                    floorSelect.value
                );

            console.log(

                "CURRENT FLOOR",

                AppState.project
                    .currentFloorIndex
            );

            requestRender?.();

            updateGuideText?.();

            updateWellnessCard?.();

            // 🔥 LEGEND VISIBILITY

            const currentFloor =

                AppState.project
                    ?.floors?.[
                AppState.project
                    ?.currentFloorIndex || 0
                ];

            const legendHud =
                document.getElementById(
                    "legendHud"
                );


        };
}

function initFloorUI() {


    // =====================
    // 🔥 ADD FLOOR
    // =====================

    const addFloorBtn =
        document.getElementById(
            "addFloorBtn"
        );

    if (addFloorBtn) {

        addFloorBtn.onclick =
            () => {

                const floorNumber =
                    AppState.project
                        .floors.length + 1;

                const floor =
                    createDefaultFloor(
                        "Floor " +
                        floorNumber,

                        AppState.project
                            .assessmentContext
                    );

                AppState.project
                    .floors
                    .push(
                        floor
                    );

                AppState.project
                    .currentFloorIndex =

                    AppState.project
                        .floors.length - 1;

                refreshFloorSelect();

                requestRender?.();

                console.log(
                    "FLOOR ADDED"
                );
            };
    }
}




function openRenameFloorPopup(index) {

    floorToRename = index;

    const floor =
        AppState.project.floors[index];

    document.getElementById(
        "renameFloorInput"
    ).value =
        floor.name || "";

    document.getElementById(
        "renameFloorModal"
    ).style.display =
        "flex";
}

function closeRenameFloorPopup() {

    floorToRename = null;

    document.getElementById(
        "renameFloorModal"
    ).style.display =
        "none";
}

function confirmRenameFloor() {

    if (
        floorToRename === null
    ) {
        return;
    }

    const name =

        document
            .getElementById(
                "renameFloorInput"
            )
            ?.value
            ?.trim();

    if (!name) {

        alert(
            "Please enter floor name."
        );

        return;
    }

    AppState.project.floors[
        floorToRename
    ].name = name;

    closeRenameFloorPopup();

    renderHomeFloorTabs?.();

    renderFloorTabs?.();

    updateProjectHeader?.();
}

function openNewFloorPopup() {

    const popup =
        document.getElementById(
            "floorPopup"
        );

    popup.style.display =
        "flex";

    const input =
        document.getElementById(
            "floorNameInput"
        );

    const nextFloorNumber =

        (AppState.project.floors || [])
            .length + 1;

    input.value =
        `Floor ${nextFloorNumber}`;

    popup.style.display =
        "flex";

    setTimeout(
        () => input.focus(),
        50
    );
}


function createFloor(name, image) {

    console.log(
        "CREATE FLOOR IMAGE:",
        image
    );

    console.error(
        "CREATE FLOOR CLICK"
    );

    return {

        name: name,

        // =====================
        // 🔥 IMPORTANT
        // =====================

        image: image,

        rooms: [],

        sources: [],

        zones: []
    };
}



function closeDeleteFloorPopup() {

    floorToDelete = null;

    document.getElementById(
        "deleteFloorModal"
    ).style.display =
        "none";
}

function closeNewFloorPopup() {

    document
        .getElementById(
            "floorPopup"
        )
        .style.display =
        "none";
}

function openDeleteFloorPopup(index) {

    floorToDelete = index;

    const floor =
        AppState.project.floors[index];

    const rooms =
        floor.rooms?.length || 0;

    const zones =
        floor.zones?.length || 0;

    document.getElementById(
        "deleteFloorInfo"
    ).innerHTML = `

        <p>
            <b>Floor:</b>
            ${floor.name}
        </p>

        <p>
            The following data will be permanently deleted:
        </p>

        <ul>
            <li>${rooms} room(s)</li>
            <li>${zones} zone(s)</li>
            <li>Room grids</li>
            <li>Zone grids</li>
            <li>Measurement data</li>
            <li>Floor plan image</li>
        </ul>

        <p>
            <b>This action cannot be undone.</b>
        </p>

    `;

    document.getElementById(
        "deleteFloorModal"
    ).style.display =
        "flex";
}



function confirmDeleteFloor() {

    if (
        floorToDelete === null
    ) {
        return;
    }

    AppState.project.floors.splice(
        floorToDelete,
        1
    );

    AppState.project.currentFloorIndex =
        Math.max(
            0,
            AppState.project.currentFloorIndex - 1
        );

    closeDeleteFloorPopup();

    renderHomeFloorTabs?.();

    renderFloorTabs?.();

    updateProjectHeader?.();

    openFloor?.(
        AppState.project.currentFloorIndex
    );
}

window.renderBusinessFloorTabs =
    renderBusinessFloorTabs;

// =====================
// 🔥 EXPORTS
// =====================

window.renameFloor =
    renameFloor;


// =====================
// 🔥 EXPORTS
// =====================

window.deleteFloor =
    deleteFloor;


// =====================
// 🔥 EXPORTS
// =====================

window.openFloor =
    openFloor;

// =====================
// 🔥 EXPORTS
// =====================

window.addFloor =
    addFloor;

// =====================
// 🔥 EXPORTS
// =====================

window.renderFloorTabs =
    renderFloorTabs;

// =====================
// FLOOR POPUP EVENTS
// =====================

document
    .getElementById(
        "btnCreateFloor"
    )
    ?.addEventListener(
        "click",
        createFloor
    );

document
    .getElementById(
        "btnCancelFloor"
    )
    ?.addEventListener(
        "click",
        closeNewFloorPopup
    );

window.openNewFloorPopup =
    openNewFloorPopup;

window.createFloor =
    createFloor;

window.closeNewFloorPopup =
    closeNewFloorPopup;

window.openDeleteFloorPopup =
    openDeleteFloorPopup;

window.closeDeleteFloorPopup =
    closeDeleteFloorPopup;

window.confirmDeleteFloor =
    confirmDeleteFloor;

window.openRenameFloorPopup =
    openRenameFloorPopup;

window.closeRenameFloorPopup =
    closeRenameFloorPopup;

window.confirmRenameFloor =
    confirmRenameFloor;


// =====================
// 🔥 EXPORT
// =====================

window.syncState =
    syncState;

window.updateFloorUI =
    updateFloorUI;

window.switchFloor =
    switchFloor;

window.resizeCanvasSafe =
    resizeCanvasSafe;

window.initFloorUI =
    initFloorUI;

window.refreshFloorSelect =
    refreshFloorSelect;

