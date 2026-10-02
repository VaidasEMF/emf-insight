// =====================
// 🔥 APP MODE
// =====================

window.AppMode = {

    current: "home"
};

window.WorkspaceAccess = {
    mode: null
};

// =====================
// 🔥 HELPERS
// =====================

function isHomeMode() {

    return (
        window.AppMode.current
        ===
        "home"
    );
}

function isBusinessMode() {

    return (
        window.AppMode.current
        ===
        "business"
    );
}

function showWorkspaceAccessScreen(type) {

    const screen =
        document.getElementById("workspaceAccessScreen");

    const eyebrow =
        document.getElementById("workspaceAccessEyebrow");

    const title =
        document.getElementById("workspaceAccessTitle");

    const text =
        document.getElementById("workspaceAccessText");

    const features =
        document.getElementById("workspaceAccessFeatures");

    const primary =
        document.getElementById("workspaceAccessPrimary");

    const secondary =
        document.getElementById("workspaceAccessSecondary");

    if (
        !screen ||
        !eyebrow ||
        !title ||
        !text ||
        !features ||
        !primary ||
        !secondary
    ) {
        return;
    }

    /*
     * ==========================================
     * HOME USER → BUSINESS
     * ==========================================
     */

    if (type === "business_demo") {

        window.WorkspaceAccess.mode =
            "business_demo";

        eyebrow.textContent =
            "BUSINESS SURVEY";

        eyebrow.style.color =
            "#2563eb";

        title.textContent =
            "Explore Professional EMF Assessment";

        text.textContent =
            "See how EMF Insight is used by professionals to assess buildings, work with measurements, analyze exposure and create professional reports.";

        features.innerHTML = `
            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#eff6ff;
                color:#1e3a8a;
                font-size:12px;
                font-weight:650;
            ">
                🏢 Professional assessment workflow
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#eff6ff;
                color:#1e3a8a;
                font-size:12px;
                font-weight:650;
            ">
                📐 Floors, rooms & zones
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#eff6ff;
                color:#1e3a8a;
                font-size:12px;
                font-weight:650;
            ">
                📡 Professional measurements
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#eff6ff;
                color:#1e3a8a;
                font-size:12px;
                font-weight:650;
            ">
                📊 Heatmaps & professional reports
            </div>
        `;

        primary.textContent =
            "Become a Professional";

        primary.style.background =
            "#2563eb";

        primary.onclick =
            function () {

                window.location.href =
                    "dashboard.html#billing";
            };

        secondary.textContent =
            "Continue exploring";

        secondary.onclick =
            function () {

                hideWorkspaceAccessScreen();
            };

        screen.style.display =
            "flex";

        return;
    }

    /*
     * ==========================================
     * PROFESSIONAL → HOME
     * ==========================================
     */

    if (type === "home_demo") {

        window.WorkspaceAccess.mode =
            "home_demo";

        eyebrow.textContent =
            "HOME WELLNESS";

        eyebrow.style.color =
            "#15803d";

        title.textContent =
            "Explore Home Wellness";

        text.textContent =
            "See how EMF Insight helps people understand their home environment, identify EMF sources and build a Property Health Record.";

        features.innerHTML = `
            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#ecfdf5;
                color:#166534;
                font-size:12px;
                font-weight:650;
            ">
                🏠 Property Health Record
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#ecfdf5;
                color:#166534;
                font-size:12px;
                font-weight:650;
            ">
                🌿 Lifestyle Areas
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#ecfdf5;
                color:#166534;
                font-size:12px;
                font-weight:650;
            ">
                📡 EMF Sources
            </div>

            <div style="
                padding:12px 14px;
                border-radius:10px;
                background:#ecfdf5;
                color:#166534;
                font-size:12px;
                font-weight:650;
            ">
                💡 Property Insights
            </div>
        `;

        primary.textContent =
            "Create My Home Property";

        primary.style.background =
            "#16a34a";

        primary.onclick =
            function () {

                hideWorkspaceAccessScreen();

                localStorage.removeItem(
                    "workspaceAccessMode"
                );

                if (
                    typeof window.createProject ===
                    "function"
                ) {
                    window.createProject();
                }
            };

        secondary.textContent =
            "Continue exploring";

        secondary.onclick =
            function () {

                hideWorkspaceAccessScreen();
            };

        screen.style.display =
            "flex";

        return;
    }
}


function hideWorkspaceAccessScreen() {

    const screen =
        document.getElementById(
            "workspaceAccessScreen"
        );

    if (screen) {
        screen.style.display =
            "none";
    }

    window.WorkspaceAccess.mode =
        null;
}

// =====================================================
// 🔥 SET APP MODE
// =====================================================
//
// IMPORTANT:
//
// AppMode.current
//     = UI / workspace mode
//
// AppState.project
//     = currently opened real project
//
// Changing Home ↔ Business MUST NOT change
// AppState.project.
//
// Project lifecycle is handled separately by:
//
//     createProject()
//     loadProject()
//     openProject()
//
// =====================================================
// 🔥 SET APP MODE
// =====================================================

async function setAppMode(
    mode
) {

    console.log(
        "🔥 SET APP MODE START",
        {
            requestedMode: mode,
            currentMode: window.AppMode?.current,
            workspaceMode:
                localStorage.getItem("workspaceMode"),
            experience:
                resolveWorkspaceExperience(mode)
        }
    );

    const experience =
        resolveWorkspaceExperience(mode);

    AppState.workspaceExperience =
        experience;

    window.EMFWorkspaceExperience =
        experience;

    console.log(
        "[WORKSPACE EXPERIENCE]",
        {
            role:
                window.EMFProductContext?.account?.role,
            workspace: mode,
            experience
        }
    );
    console.log(
        "================================="
    );

    console.log(
        "🔥 SET APP MODE:",
        mode
    );


    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        mode !== "home" &&
        mode !== "business"
    ) {

        console.error(
            "❌ INVALID APP MODE:",
            mode
        );

        return;
    }


    // ==================================================
    // PREVIOUS STATE
    // ==================================================

    const previousMode =
        window.AppMode?.current ||
        null;

    const previousProject =
        AppState.project ||
        null;

    const previousProjectId =
        previousProject
            ?.project_id ??
        previousProject
            ?.id ??
        null;


    console.error(
        "🔥 MODE SWITCH START",
        {
            previousMode,
            targetMode: mode,
            previousProjectId,

            homeProjectId:
                localStorage.getItem(
                    "home_project_id"
                ),

            businessProjectId:
                localStorage.getItem(
                    "business_project_id"
                )
        }
    );


    // ========================
    // SAVE PREVIOUS BUSINESS PROJECT ID
    // ========================

    if (
        previousProjectId &&
        previousMode === "business" &&
        previousProject?.isDemo !== true &&
        previousProjectId !== "demo-business-assessment"
    ) {
        localStorage.setItem(
            "business_project_id",
            String(previousProjectId)
        );
    }


    // ==================================================
    // SET MODE
    // ==================================================

    window.AppMode.current =
        mode;

    localStorage.setItem(
        "workspaceMode",
        mode
    );

    // ==================================================
    // HOME — HIDE BUSINESS DEMO
    // ==================================================

    if (
        mode === "home" &&
        typeof window.hideBusinessDemoWorkspace === "function"
    ) {
        window.hideBusinessDemoWorkspace();
    }
    // ==================================================
    // BUSINESS DEMO — EARLY EXIT
    // ==================================================

    if (
        mode === "business" &&
        experience.mode === "demo" &&
        experience.demoType === "business"
    ) {
        console.log(
            "🏢 BUSINESS DEMO MODE — EARLY",
            {
                role:
                    window.EMFProductContext
                        ?.account
                        ?.role,
                experience
            }
        );

        AppState.project = null;
        window.project = null;



        await window.loadBusinessDemoExperience?.();

        return;
    }

    // ==================================================
    // TARGET BUSINESS PROJECT ID
    // ==================================================

    const targetProjectId =
        mode === "business"
            ? localStorage.getItem("business_project_id")
            : (
                localStorage.getItem("home_project_id") ||
                localStorage.getItem("homeProjectId")
            );


    console.error(
        "🔥 TARGET WORKSPACE",
        {
            mode,
            targetProjectId
        }
    );


    // ==================================================
    // ACTIVE PROJECT
    // ==================================================

    let activeProject =
        null;


    // ==================================================
    // HOME
    // ==================================================

    if (
        mode === "home"
    ) {

        // ==================================================
        // HOME
        // ==================================================

        if (
            mode === "home"
        ) {

            // ================================
            // PROFESSIONAL → HOME DEMO
            // ================================

            if (
                experience.mode === "demo" &&
                experience.demoType === "home"
            ) {
                console.log(
                    "🏠 HOME DEMO MODE",
                    {
                        role:
                            window.EMFProductContext
                                ?.account
                                ?.role,
                        experience
                    }
                );

                // IMPORTANT:
                // Demo must never create or load
                // a real Home project.
                AppState.project = null;
                window.project = null;

                currentProjectId = null;
                activeProject = null;

                await window.loadHomeDemoExperience?.();

                return;
            }

            // ------------------------------------------------
            // IMPORTANT
            // ------------------------------------------------
            //
            // DO NOT call initializeProjects() here.
            //
            // If AppState.homeProject does not exist,
            // Home simply has NO ACTIVE PROJECT.
            //
            // New Project is responsible for creating one.
            //
            // ------------------------------------------------

            let homeProject =
                AppState.homeProject ||
                null;


            // ------------------------------------------------
            // RESTORE PERSISTED HOME PROJECT
            // ------------------------------------------------

            if (
                !homeProject &&
                targetProjectId
            ) {

                console.error(
                    "🔥 LOADING HOME PROJECT",
                    {
                        projectId:
                            targetProjectId
                    }
                );

                currentProjectId =
                    String(
                        targetProjectId
                    );

                const loaded =
                    await window.loadProject(
                        targetProjectId
                    );

                if (
                    loaded
                ) {

                    homeProject =
                        AppState.homeProject ||
                        null;

                    activeProject =
                        homeProject;

                } else {

                    console.error(
                        "❌ HOME PROJECT LOAD FAILED",
                        {
                            targetProjectId
                        }
                    );
                }
            }


            if (
                homeProject
            ) {

                activeProject =
                    homeProject;


                // --------------------------------------------
                // HOME PROJECT SAFETY
                // --------------------------------------------

                if (
                    !Array.isArray(
                        homeProject.floors
                    )
                ) {

                    homeProject.floors =
                        [];
                }


                homeProject.propertyId =
                    AppState.property?.id ||
                    null;


                homeProject.assessmentId =
                    AppState.propertyAssessment
                        ?.id ||
                    homeProject.assessmentId ||
                    null;


                // --------------------------------------------
                // HOME FLOOR
                // --------------------------------------------

                if (
                    homeProject.floors.length > 0
                ) {

                    if (
                        homeProject.currentFloorIndex ===
                        undefined ||
                        homeProject.currentFloorIndex ===
                        null ||
                        homeProject.currentFloorIndex < 0 ||
                        homeProject.currentFloorIndex >=
                        homeProject.floors.length
                    ) {

                        homeProject.currentFloorIndex =
                            0;
                    }
                }


                // --------------------------------------------
                // HOME ACTIVE
                // --------------------------------------------

                AppState.project =
                    homeProject;

                window.project =
                    homeProject;

                currentProjectId =
                    null;


                console.error(
                    "🔥 HOME WORKSPACE ACTIVE",
                    {
                        assessmentId:
                            homeProject
                                ?.assessmentId,

                        floors:
                            homeProject
                                ?.floors
                                ?.length ||
                            0
                    }
                );
            }

            else {

                // --------------------------------------------
                // NO HOME PROJECT
                // --------------------------------------------

                activeProject =
                    null;

                AppState.project =
                    null;

                window.project =
                    null;

                currentProjectId =
                    null;


                console.error(
                    "🔥 HOME HAS NO ACTIVE PROJECT"
                );
            }
        }

        // ==================================================
        // WORKSPACE MENU ACTIVE STATE
        // ==================================================

        const businessItem =
            document.getElementById(
                "workspaceBusinessItem"
            );

        const homeItem =
            document.getElementById(
                "workspaceHomeItem"
            );

        const businessCheck =
            document.getElementById(
                "workspaceBusinessCheck"
            );

        const homeCheck =
            document.getElementById(
                "workspaceHomeCheck"
            );


        const isHome =
            window.AppMode?.current === "home";


        if (businessItem) {

            businessItem.classList.toggle(
                "workspace-menu-item-active",
                !isHome
            );
        }


        if (homeItem) {

            homeItem.classList.toggle(
                "workspace-menu-item-active",
                isHome
            );
        }


        if (businessCheck) {
            businessCheck.style.display =
                "none";
        }

        if (homeCheck) {
            homeCheck.style.display =
                "none";
        }

        if (isHome) {
            if (homeCheck) {
                homeCheck.style.display =
                    "inline-flex";
            }
        } else {
            if (businessCheck) {
                businessCheck.style.display =
                    "inline-flex";
            }
        }


        // ==================================================
        // BUSINESS
        // ==================================================
        // ==================================================
        // BUSINESS
        // ==================================================

        if (
            mode === "business"
        ) {

            // ==================================================
            // RESET HOME WORKSPACE CONTEXT
            // ==================================================

            window.EMFHomeDemo = false;

            // Business is now the active workspace
            window.AppMode.current = "business";

            window.WorkspaceAccess =
                window.WorkspaceAccess || {};

            window.WorkspaceAccess.mode =
                "business";


            // ==================================================
            // HOME USER → BUSINESS DEMO
            // ==================================================

            if (
                experience.mode === "demo" &&
                experience.demoType === "business"
            ) {

                console.log(
                    "🏢 HOME USER → BUSINESS DEMO",
                    {
                        role:
                            window.EMFProductContext
                                ?.account
                                ?.role,

                        experience
                    }
                );


                // Remove Home project from active state
                AppState.project = null;
                window.project = null;

                currentProjectId = null;
                activeProject = null;


                // IMPORTANT:
                // Business demo owns the workspace now.
                window.EMFBusinessDemo = true;

                window.WorkspaceAccess.mode =
                    "business_demo";


                await window.loadBusinessDemoExperience?.();

                return;
            }


            // ------------------------------------------------
            // EXISTING PERSISTED BUSINESS PROJECT
            // ------------------------------------------------

            if (
                targetProjectId
            ) {

                console.error(
                    "🔥 LOADING BUSINESS PROJECT",
                    {
                        projectId:
                            targetProjectId
                    }
                );


                currentProjectId =
                    String(
                        targetProjectId
                    );


                const loaded =
                    await window.loadProject(
                        targetProjectId
                    );


                if (
                    !loaded
                ) {

                    console.error(
                        "❌ BUSINESS PROJECT LOAD FAILED",
                        {
                            targetProjectId
                        }
                    );


                    AppState.project =
                        null;

                    window.project =
                        null;

                    currentProjectId =
                        null;

                    activeProject =
                        null;
                }

                else {

                    console.error(
                        "🔥 BUSINESS STATE AFTER LOAD",
                        {
                            businessProjectId:
                                AppState.businessProject?.id ??
                                AppState.businessProject?.project_id ??
                                null,

                            businessProjectType:
                                AppState.businessProject?.type ??
                                null,

                            stateProjectId:
                                AppState.project?.id ??
                                AppState.project?.project_id ??
                                null,

                            stateProjectType:
                                AppState.project?.type ??
                                null
                        }
                    );

                    activeProject =
                        AppState.businessProject ||
                        null;
                }
            }


            // ------------------------------------------------
            // BUSINESS PROJECT ALREADY CREATED IN MEMORY
            // ------------------------------------------------
            //
            // This is the New Project path.
            //
            // New Project creates AppState.businessProject
            // and then switches to Business.
            //
            // ------------------------------------------------

            else if (
                AppState.businessProject
            ) {

                activeProject =
                    AppState.businessProject;


                AppState.project =
                    activeProject;

                window.project =
                    activeProject;


                currentProjectId =
                    activeProject
                        ?.project_id ??
                    activeProject
                        ?.id ??
                    null;


                console.error(
                    "🔥 NEW BUSINESS PROJECT ACTIVE",
                    {
                        projectId:
                            currentProjectId,

                        floors:
                            activeProject
                                ?.floors
                                ?.length ||
                            0
                    }
                );
            }


            // ------------------------------------------------
            // NO BUSINESS PROJECT
            // ------------------------------------------------

            else {

                // --------------------------------------------
                // IMPORTANT:
                //
                // DO NOT create a Business project here.
                //
                // New Project creates it.
                // Open Project loads it.
                //
                // --------------------------------------------

                activeProject =
                    null;

                AppState.project =
                    null;

                window.project =
                    null;

                currentProjectId =
                    null;


                console.error(
                    "🔥 BUSINESS HAS NO ACTIVE PROJECT"
                );
            }
        }


        // ==================================================
        // RESET TRANSIENT UI
        // ==================================================

        if (
            AppState.ui
        ) {

            AppState.ui.mode =
                "idle";

            AppState.ui.selectedRoom =
                null;

            AppState.ui.selectedZone =
                null;

            AppState.ui.selectedSource =
                null;

            AppState.ui.roomDraft =
                null;

            AppState.ui.zoneDraft =
                null;
        }


        window.hoveredRoom =
            null;

        window.activeRoom =
            null;

        window.selectedSource =
            null;

        window.draggingSource =
            null;

        window.selectedGridPoint =
            null;

        window.roomDrawing =
            false;

        window.gridPreview =
            null;

        window.measurePreview =
            null;


        // ==================================================
        // RESET SCALE TOOL
        // ==================================================

        window.scaleTool =
            window.scaleTool ||
            {};

        window.scaleTool.active =
            false;

        window.scaleTool.points =
            [];

        window.scaleTool.calibrated =
            false;

        window.scaleTool.metersPerPixel =
            0;


        // ==================================================
        // NO ACTIVE PROJECT
        // ==================================================
        //
        // This is now a valid application state.
        //
        // The user sees:
        //
        //     New Project
        //     Open Project
        //
        // and NOT:
        //
        //     Main Floor
        //     Plan
        //     Upload Floor Plan
        //     Lifestyle Areas
        //
        // ==================================================

        if (
            !activeProject
        ) {

            window.planImage =
                null;

            if (
                typeof planImage !==
                "undefined"
            ) {

                planImage =
                    null;
            }


            // ----------------------------------------------
            // FLOOR TABS
            // ----------------------------------------------

            const homeFloorTabs =
                document.getElementById(
                    "homeFloorTabs"
                );

            const businessFloorTabs =
                document.getElementById(
                    "businessFloorTabs"
                );


            if (
                homeFloorTabs
            ) {

                homeFloorTabs.innerHTML =
                    "";

                homeFloorTabs.style.display =
                    "none";
            }


            if (
                businessFloorTabs
            ) {

                businessFloorTabs.innerHTML =
                    "";

                businessFloorTabs.style.display =
                    "none";
            }


            // ----------------------------------------------
            // CURRENT FLOOR CARD
            // ----------------------------------------------

            const homeCurrentFloorCard =
                document.getElementById(
                    "homeCurrentFloorCard"
                );


            if (
                homeCurrentFloorCard
            ) {

                homeCurrentFloorCard.innerHTML =
                    "";

                homeCurrentFloorCard.style.display =
                    "none";
            }


            // ----------------------------------------------
            // HOME EMPTY PLAN
            // ----------------------------------------------

            const homeEmptyPlanState =
                document.getElementById(
                    "homeEmptyPlanState"
                );


            if (
                homeEmptyPlanState
            ) {

                homeEmptyPlanState.style.display =
                    "none";
            }


            // ----------------------------------------------
            // HOME PLAN ACTIONS
            // ----------------------------------------------

            const homePlanActions =
                document.getElementById(
                    "homePlanActions"
                );


            if (
                homePlanActions
            ) {

                homePlanActions.style.display =
                    "none";
            }


            // ----------------------------------------------
            // BUSINESS PLAN ACTIONS
            // ----------------------------------------------

            const businessPlanActions =
                document.getElementById(
                    "businessPlanActions"
                );


            if (
                businessPlanActions
            ) {

                businessPlanActions.style.display =
                    "none";
            }


            // ----------------------------------------------
            // BUSINESS PROJECT TOGGLES
            // ----------------------------------------------

            const businessProjectToggles =
                document.getElementById(
                    "businessProjectToggles"
                );


            if (
                businessProjectToggles
            ) {

                businessProjectToggles.style.display =
                    "none";
            }


            // ----------------------------------------------
            // ROOM PROGRESS
            // ----------------------------------------------

            const roomProgressTop =
                document.getElementById(
                    "roomProgressTop"
                );


            if (
                roomProgressTop
            ) {

                roomProgressTop.innerHTML =
                    "";

                roomProgressTop.style.display =
                    "none";
            }


            // ----------------------------------------------
            // GENERAL UI
            // ----------------------------------------------

            updateWorkspaceUI?.();
            updateHomeWorkflow?.();
            updateHomeLocks?.();
            updateHomeEmptyPlanState?.();
            updateHomeProfessionalAssessment?.();
            updateProjectHeader?.();
            updateWorkflowUI?.();
            updateCurrentExposure?.();

            updateEMFProductContext?.();


            // ----------------------------------------------
            // RENDER
            // ----------------------------------------------

            requestRender?.();


            console.error(
                "🔥 NO ACTIVE PROJECT UI READY",
                {
                    mode
                }
            );


            console.log(
                "🔥 MODE SWITCH COMPLETE",
                {
                    mode,
                    projectId:
                        null,
                    projectType:
                        null,
                    floors:
                        0
                }
            );


            console.log(
                "================================="
            );

            return;
        }


        // ==================================================
        // ACTIVE PROJECT SAFETY
        // ==================================================

        const project =
            activeProject;


        AppState.project =
            project;

        window.project =
            project;


        // ==================================================
        // CURRENT FLOOR
        // ==================================================

        if (
            !Array.isArray(
                project?.floors
            )
        ) {

            project.floors =
                [];
        }


        if (
            project.floors.length > 0
        ) {

            if (
                project.currentFloorIndex ===
                undefined ||
                project.currentFloorIndex ===
                null ||
                project.currentFloorIndex < 0 ||
                project.currentFloorIndex >=
                project.floors.length
            ) {

                project.currentFloorIndex =
                    0;
            }
        }

        else {

            project.currentFloorIndex =
                0;
        }


        const activeFloor =
            getCurrentFloor?.();


        // ==================================================
        // RESET OLD PLAN IMAGE
        // ==================================================
        //
        // Important when switching between projects/modes.
        //
        // loadFloorImage() restores the image if one exists.
        //
        // ==================================================

        window.planImage =
            null;

        if (
            typeof planImage !==
            "undefined"
        ) {

            planImage =
                null;
        }


        // ==================================================
        // LOAD IMAGE
        // ==================================================

        if (
            activeFloor
        ) {

            console.error(
                "🔥 MODE SWITCH LOAD FLOOR IMAGE",
                {
                    mode,

                    floorId:
                        activeFloor.id,

                    floorName:
                        activeFloor.name,

                    hasImage:
                        !!activeFloor.image,

                    hasImageData:
                        !!activeFloor.imageData,

                    imageFileName:
                        activeFloor.imageFileName
                }
            );


            loadFloorImage(
                activeFloor
            );


            // ----------------------------------------------
            // RESTORE SCALE
            // ----------------------------------------------

            if (
                mode === "business"
            ) {

                window.scaleTool.calibrated =
                    !!activeFloor.scaleConfirmed;

                window.scaleTool.metersPerPixel =
                    activeFloor.currentScale ||
                    0;
            }
        }


        // ==================================================
        // FLOOR TABS
        // ==================================================

        const homeFloorTabs =
            document.getElementById(
                "homeFloorTabs"
            );

        const businessFloorTabs =
            document.getElementById(
                "businessFloorTabs"
            );


        if (
            homeFloorTabs
        ) {

            homeFloorTabs.style.display =
                mode === "home"
                    ? "flex"
                    : "none";
        }


        if (
            businessFloorTabs
        ) {

            businessFloorTabs.style.display =
                mode === "business"
                    ? "flex"
                    : "none";
        }


        // ==================================================
        // BUSINESS TOGGLES
        // ==================================================

        const businessProjectToggles =
            document.getElementById(
                "businessProjectToggles"
            );


        if (
            businessProjectToggles
        ) {

            businessProjectToggles.style.display =
                mode === "business"
                    ? "flex"
                    : "none";
        }


        // ==================================================
        // ROOM PANEL
        // ==================================================

        const roomProgressTop =
            document.getElementById(
                "roomProgressTop"
            );


        if (
            roomProgressTop
        ) {

            if (
                mode === "business"
            ) {

                roomProgressTop.style.display =
                    "flex";
            }

            else {

                roomProgressTop.innerHTML =
                    "";

                roomProgressTop.style.display =
                    "none";
            }
        }


        // ==================================================
        // FLOOR UI
        // ==================================================

        if (
            mode === "home"
        ) {

            renderHomeFloorTabs?.();

        }

        else {

            renderBusinessFloorTabs?.();
        }


        renderFloorTabs?.();



        if (homeCheck) {

            homeCheck.style.display =
                isHome
                    ? "inline-flex"
                    : "none";
        }

        // ==================================================
        // GENERAL UI
        // ==================================================

        updateWorkspaceUI?.();
        updateHomeWorkflow?.();
        updateHomeLocks?.();
        updateHomeEmptyPlanState?.();
        updateHomeProfessionalAssessment?.();
        updateProjectHeader?.();
        updateWorkflowUI?.();
        updateCurrentExposure?.();

        updateEMFProductContext?.();

        // ==================================================
        // RENDER
        // ==================================================

        requestRender?.();


        // ==================================================
        // FINAL DEBUG
        // ==================================================

        console.error(
            "🔥 PROJECT MODE SWITCH COMPLETE",
            {
                mode,

                projectId:
                    project
                        ?.project_id ??
                    project
                        ?.id ??
                    null,

                projectType:
                    project
                        ?.projectType ??
                    project
                        ?.type ??
                    null,

                floors:
                    project
                        ?.floors
                        ?.length ||
                    0,

                currentFloorIndex:
                    project
                        ?.currentFloorIndex,

                activeFloor:
                    getCurrentFloor?.()
                        ?.name,

                activeFloorImage:
                    !!getCurrentFloor?.()
                        ?.image,

                activeFloorImageData:
                    !!getCurrentFloor?.()
                        ?.imageData
            }
        );


        requestAnimationFrame(
            () => {

                const floor =
                    getCurrentFloor?.();


                console.error(
                    "🔥🔥 AFTER MODE SWITCH RENDER",
                    {
                        mode,

                        projectId:
                            AppState.project
                                ?.project_id ??
                            AppState.project
                                ?.id ??
                            null,

                        projectType:
                            AppState.project
                                ?.projectType ??
                            AppState.project
                                ?.type ??
                            null,

                        floorIndex:
                            AppState.project
                                ?.currentFloorIndex,

                        floorId:
                            floor?.id,

                        floorName:
                            floor?.name,

                        image:
                            !!floor?.image,

                        imageData:
                            !!floor?.imageData,

                        rooms:
                            floor?.rooms?.length ||
                            0,

                        zones:
                            floor?.zones?.length ||
                            0,

                        sources:
                            floor?.sources?.length ||
                            0,

                        canvasWidth:
                            window.canvas?.width,

                        canvasHeight:
                            window.canvas?.height,

                        planImageWidth:
                            window.planImage
                                ?.naturalWidth ??
                            window.planImage
                                ?.width ??
                            null,

                        planImageHeight:
                            window.planImage
                                ?.naturalHeight ??
                            window.planImage
                                ?.height ??
                            null
                    }
                );
            }
        );


        console.log(
            "🔥 MODE SWITCH COMPLETE",
            {
                mode,

                projectId:
                    project
                        ?.project_id ??
                    project
                        ?.id ??
                    null,

                projectType:
                    project
                        ?.projectType ??
                    project
                        ?.type ??
                    null,

                floors:
                    project
                        ?.floors
                        ?.length ||
                    0,

                currentFloorIndex:
                    project
                        ?.currentFloorIndex
            }
        );


        console.log(
            "================================="
        );
    }


}

// ============================================================
// BUSINESS DEMO EXPERIENCE
// Home user → Business workspace
// Frontend-only. NEVER creates or loads a real project.
// ============================================================
async function loadBusinessDemoExperience() {

    console.log("🏢 Loading Business Demo Experience");


    // ========================================================
    // DEMO PROJECT
    // ========================================================

    const demoProject = {

        id:
            "demo-business-assessment",

        project_id:
            "demo-business-assessment",

        name:
            "Demo Assessment · Example Office",

        type:
            "business",

        isDemo:
            true,

        demo:
            true,


        // ----------------------------------------------------
        // FLOORS
        // ----------------------------------------------------

        floors: [

            {
                id:
                    "demo-floor-1",

                name:
                    "Main Floor",

                rooms: [
                    {
                        id:
                            "demo-room-1",

                        code:
                            "R01",

                        name:
                            "Office",

                        type:
                            "office",

                        image:
                            "/frontend/assets/demo/rooms/office.png",

                        heatmap:
                            "/frontend/assets/demo/heatmap/office_heatmap.png",

                        area:
                            28,

                        coverage:
                            82,

                        risk:
                            "medium",

                        sources:
                            3,

                        recommendations:
                            2,

                        zones: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-2",

                        code:
                            "R02",

                        name:
                            "Meeting Room",

                        type:
                            "meeting",

                        image:
                            "/frontend/assets/demo/rooms/meeting-room.png",

                        heatmap:
                            "/frontend/assets/demo/heatmap/meeting-room-heatmap.png",

                        area:
                            34,

                        coverage:
                            91,

                        risk:
                            "low",

                        sources:
                            2,

                        recommendations:
                            1,

                        zones: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-3",

                        code:
                            "R03",

                        name:
                            "Open Workspace",

                        type:
                            "workspace",

                        image:
                            "/frontend/assets/demo/rooms/open-workspace.png",

                        heatmap:
                            "/frontend/assets/demo/heatmap/open-workspace-heatmap.png",

                        area:
                            86,

                        coverage:
                            76,

                        risk:
                            "high",

                        sources:
                            4,

                        recommendations:
                            3,

                        zones: [],
                        measurements: [],
                        gridPoints: []
                    }
                ],

                zones: [],
                sources: [],
                measurements: [],
                gridPoints: []
            },


            {
                id:
                    "demo-floor-2",

                name:
                    "Floor 2",

                rooms: [

                    {
                        id:
                            "demo-room-4",

                        code:
                            "R04",

                        name:
                            "Private Office",

                        type:
                            "office",

                        image:
                            "/frontend/assets/demo/rooms/private-office.png",

                        heatmap:
                            "/frontend/assets/demo/heatmap/private-office-heatmap.png",

                        area:
                            22,

                        coverage:
                            88,

                        risk:
                            "low",

                        sources:
                            2,

                        recommendations:
                            1,

                        zones: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-5",

                        code:
                            "R05",

                        name:
                            "Break Room",

                        type:
                            "rest",

                        image:
                            "/frontend/assets/demo/rooms/break-room.png",

                        heatmap:
                            "/frontend/assets/demo/heatmap/break-room-heatmap.png",

                        area:
                            19,

                        coverage:
                            73,

                        risk:
                            "medium",

                        sources:
                            3,

                        recommendations:
                            2,

                        zones: [],
                        measurements: [],
                        gridPoints: []
                    }
                ],

                zones: [],
                sources: [],
                measurements: [],
                gridPoints: []
            }
        ],


        // ----------------------------------------------------
        // PROPERTY-LEVEL BUSINESS DATA
        // ----------------------------------------------------

        zones: [],

        sources: [],

        measurements: [],

        gridPoints: [],

        recommendations: []
    };


    // ========================================================
    // DEMO ANALYSIS
    // ========================================================

    const demoAnalysis = {


        // ----------------------------------------------------
        // COVERAGE
        // ----------------------------------------------------

        coverage: {

            measured_points:
                124,

            total_points:
                156,

            coverage:
                79
        },


        // ----------------------------------------------------
        // ROOM SUMMARY
        // ----------------------------------------------------

        room_summary: [

            {
                room_id:
                    "demo-room-1",

                room_name:
                    "Office",

                risk:
                    "medium",

                coverage:
                    82
            },


            {
                room_id:
                    "demo-room-2",

                room_name:
                    "Meeting Room",

                risk:
                    "low",

                coverage:
                    91
            },


            {
                room_id:
                    "demo-room-3",

                room_name:
                    "Open Workspace",

                risk:
                    "high",

                coverage:
                    76
            },


            {
                room_id:
                    "demo-room-4",

                room_name:
                    "Private Office",

                risk:
                    "low",

                coverage:
                    88
            },


            {
                room_id:
                    "demo-room-5",

                room_name:
                    "Break Room",

                risk:
                    "medium",

                coverage:
                    73
            }
        ],


        // ----------------------------------------------------
        // FLOOR ANALYSIS
        // ----------------------------------------------------

        floors: [

            {
                id:
                    "demo-floor-1",

                name:
                    "Main Floor",

                floorName:
                    "Main Floor",

                rooms: [

                    {
                        id:
                            "demo-room-1",

                        code:
                            "R01",

                        name:
                            "Office",

                        type:
                            "office",

                        area:
                            28,

                        risk:
                            "medium",

                        coverage:
                            82,

                        zones: [],
                        sources: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-2",

                        code:
                            "R02",

                        name:
                            "Meeting Room",

                        type:
                            "meeting",

                        area:
                            34,

                        risk:
                            "low",

                        coverage:
                            91,

                        zones: [],
                        sources: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-3",

                        code:
                            "R03",

                        name:
                            "Open Workspace",

                        type:
                            "workspace",

                        area:
                            86,

                        risk:
                            "high",

                        coverage:
                            76,

                        zones: [],
                        sources: [],
                        measurements: [],
                        gridPoints: []
                    }
                ],

                zones: [],
                sources: [],
                measurements: [],
                gridPoints: []
            },


            {
                id:
                    "demo-floor-2",

                name:
                    "Floor 2",

                floorName:
                    "Floor 2",

                rooms: [

                    {
                        id:
                            "demo-room-4",

                        code:
                            "R04",

                        name:
                            "Private Office",

                        type:
                            "office",

                        area:
                            22,

                        risk:
                            "low",

                        coverage:
                            88,

                        zones: [],
                        sources: [],
                        measurements: [],
                        gridPoints: []
                    },


                    {
                        id:
                            "demo-room-5",

                        code:
                            "R05",

                        name:
                            "Break Room",

                        type:
                            "rest",

                        area:
                            19,

                        risk:
                            "medium",

                        coverage:
                            73,

                        zones: [],
                        sources: [],
                        measurements: [],
                        gridPoints: []
                    }
                ],

                zones: [],
                sources: [],
                measurements: [],
                gridPoints: []
            }
        ],


        // ----------------------------------------------------
        // BUSINESS SOURCES
        // ----------------------------------------------------

        sources: [

            {
                id:
                    "demo-source-router",

                name:
                    "Wi-Fi Router",

                type:
                    "RF",

                room:
                    "Office",

                room_id:
                    "demo-room-1"
            },


            {
                id:
                    "demo-source-access-point",

                name:
                    "Wireless Access Point",

                type:
                    "RF",

                room:
                    "Open Workspace",

                room_id:
                    "demo-room-3"
            },


            {
                id:
                    "demo-source-server",

                name:
                    "Network Equipment",

                type:
                    "RF",

                room:
                    "Office",

                room_id:
                    "demo-room-1"
            },


            {
                id:
                    "demo-source-monitor",

                name:
                    "Large Display",

                type:
                    "RF",

                room:
                    "Meeting Room",

                room_id:
                    "demo-room-2"
            },


            {
                id:
                    "demo-source-laptop",

                name:
                    "Laptop Workstation",

                type:
                    "RF",

                room:
                    "Open Workspace",

                room_id:
                    "demo-room-3"
            },


            {
                id:
                    "demo-source-printer",

                name:
                    "Office Printer",

                type:
                    "RF",

                room:
                    "Private Office",

                room_id:
                    "demo-room-4"
            },


            {
                id:
                    "demo-source-router-2",

                name:
                    "Wireless Router",

                type:
                    "RF",

                room:
                    "Break Room",

                room_id:
                    "demo-room-5"
            }
        ],


        // ----------------------------------------------------
        // BUSINESS RECOMMENDATIONS
        // ----------------------------------------------------

        recommendations: [

            {
                id:
                    "demo-rec-office",

                category:
                    "RF",

                priority:
                    "high",

                title:
                    "Review wireless equipment placement in the Office",

                room_id:
                    "demo-room-1"
            },


            {
                id:
                    "demo-rec-workspace",

                category:
                    "RF",

                priority:
                    "high",

                title:
                    "Review wireless source density in the Open Workspace",

                room_id:
                    "demo-room-3"
            },


            {
                id:
                    "demo-rec-meeting",

                category:
                    "RF",

                priority:
                    "medium",

                title:
                    "Review display and wireless equipment placement",

                room_id:
                    "demo-room-2"
            },


            {
                id:
                    "demo-rec-private",

                category:
                    "RF",

                priority:
                    "low",

                title:
                    "Review wireless device placement in the Private Office",

                room_id:
                    "demo-room-4"
            },


            {
                id:
                    "demo-rec-break",

                category:
                    "RF",

                priority:
                    "medium",

                title:
                    "Review wireless source placement in the Break Room",

                room_id:
                    "demo-room-5"
            }
        ],


        // ----------------------------------------------------
        // INSIGHTS
        // ----------------------------------------------------

        insights: [

            {
                id:
                    "demo-insight-1",

                type:
                    "risk",

                title:
                    "Open Workspace",

                description:
                    "The Open Workspace is the highest-priority area in this example professional assessment."
            },


            {
                id:
                    "demo-insight-2",

                type:
                    "coverage",

                title:
                    "Measurement Coverage",

                description:
                    "The example assessment contains 124 measured points out of 156 planned points."
            },


            {
                id:
                    "demo-insight-3",

                type:
                    "sources",

                title:
                    "EMF Sources",

                description:
                    "Seven example EMF sources are included to demonstrate professional source analysis."
            }
        ],


        // ----------------------------------------------------
        // REPORT STATUS
        // ----------------------------------------------------

        report_status: {

            valid:
                true,

            generated:
                true,

            status:
                "demo"
        }
    };


    // ========================================================
    // FRONTEND-ONLY STATE
    // ========================================================

    AppState.businessDemoProject =
        demoProject;

    AppState.businessDemoAnalysis =
        demoAnalysis;


    // IMPORTANT:
    //
    // This is NOT a real project.
    //
    // NEVER:
    // - create a database project
    // - save business_project_id
    // - call createProject()
    // - call loadProject()
    //
    // ========================================================

    AppState.project =
        demoProject;

    window.project =
        demoProject;


    // ========================================================
    // DEMO UI STATE
    // ========================================================

    window.EMFHomeDemo =
        false;

    window.EMFBusinessDemo =
        true;


    window.EMFWorkspaceExperience = {

        mode:
            "demo",

        demoType:
            "business"
    };


    window.WorkspaceAccess =
        window.WorkspaceAccess || {};

    window.WorkspaceAccess.mode =
        "business_demo";


    // ========================================================
    // WORKSPACE UI
    // ========================================================

    if (
        typeof updateWorkspaceUI ===
        "function"
    ) {

        updateWorkspaceUI();
    }


    if (
        typeof updateProjectHeader ===
        "function"
    ) {

        updateProjectHeader();
    }


    // ========================================================
    // BUSINESS DEMO UI
    // ========================================================

    if (
        typeof window.renderBusinessDemoWorkspace ===
        "function"
    ) {

        window.renderBusinessDemoWorkspace(
            demoProject,
            demoAnalysis
        );

    } else {

        console.warn(
            "⚠️ renderBusinessDemoWorkspace() not available yet"
        );
    }


    // ========================================================
    // READY
    // ========================================================

    console.log(
        "🏢 BUSINESS DEMO READY",
        {

            project:
                demoProject.name,

            floors:
                demoProject.floors.length,

            rooms:
                demoAnalysis.room_summary.length,

            measurements:
                demoAnalysis.coverage.measured_points,

            sources:
                demoAnalysis.sources.length,

            recommendations:
                demoAnalysis.recommendations.length
        }
    );
}


function updateWorkspaceMenuState() {

    const businessItem =
        document.getElementById("workspaceBusinessItem");

    const homeItem =
        document.getElementById("workspaceHomeItem");

    const businessCheck =
        document.getElementById("workspaceBusinessCheck");

    const homeCheck =
        document.getElementById("workspaceHomeCheck");

    const isBusiness =
        window.AppMode?.current === "business";

    // --------------------------------------------
    // ACTIVE ITEM
    // --------------------------------------------

    if (businessItem) {
        businessItem.classList.toggle(
            "workspace-menu-item-active",
            isBusiness
        );
    }

    if (homeItem) {
        homeItem.classList.toggle(
            "workspace-menu-item-active",
            !isBusiness
        );
    }

    // --------------------------------------------
    // CHECKMARKS
    // EXACTLY ONE MUST BE VISIBLE
    // --------------------------------------------

    if (businessCheck) {
        businessCheck.style.display =
            isBusiness
                ? "inline-flex"
                : "none";
    }

    if (homeCheck) {
        homeCheck.style.display =
            isBusiness
                ? "none"
                : "inline-flex";
    }
}

// ==================================================
// HOME DEMO EXPERIENCE
// ==================================================
async function loadHomeDemoExperience() {

    console.log(
        "🏠 LOADING HOME DEMO EXPERIENCE"
    );


    // ==================================================
    // FRONTEND-ONLY DEMO PROPERTY
    // ==================================================

    const demoProject = {

        id:
            "demo-home-property",

        project_id:
            "demo-home-property",

        name:
            "Example Apartment",

        project_name:
            "Example Apartment",

        type:
            "home",

        workspace:
            "home",

        isDemo:
            true,

        demo:
            true,

        demoType:
            "home",

        propertyId:
            null,

        assessmentId:
            null,

        propertyHealthRecordId:
            "demo-phr",

        currentFloorIndex:
            0,


        // ==================================================
        // FLOORS
        // ==================================================

        floors: [

            {

                id:
                    "demo-home-floor-1",

                name:
                    "Main Floor",

                floorName:
                    "Main Floor",


                // ------------------------------------------
                // ROOMS
                // ------------------------------------------

                rooms: [

                    {

                        id:
                            "demo-bedroom",

                        code:
                            "R01",

                        name:
                            "Bedroom",

                        type:
                            "sleep",

                        area:
                            18,

                        coverage:
                            92,

                        risk:
                            "low",


                        zones:
                            [],


                        sources: [

                            {
                                id:
                                    "demo-bedroom-router",

                                type:
                                    "Wi-Fi Router",

                                level:
                                    "low"
                            }

                        ],


                        measurements: {

                            rf:
                                18,

                            electric:
                                0.7,

                            magnetic:
                                0.9
                        },


                        gridPoints:
                            []

                    },


                    {

                        id:
                            "demo-office",

                        code:
                            "R02",

                        name:
                            "Home Office",

                        type:
                            "work",

                        area:
                            14,

                        coverage:
                            88,

                        risk:
                            "moderate",


                        zones:
                            [],


                        sources: [

                            {
                                id:
                                    "demo-office-wifi",

                                type:
                                    "Wi-Fi",

                                level:
                                    "moderate"
                            },

                            {
                                id:
                                    "demo-office-laptop",

                                type:
                                    "Laptop",

                                level:
                                    "low"
                            }

                        ],


                        measurements: {

                            rf:
                                74,

                            electric:
                                1.2,

                            magnetic:
                                1.1
                        },


                        gridPoints:
                            []

                    },


                    {

                        id:
                            "demo-living",

                        code:
                            "R03",

                        name:
                            "Living Room",

                        type:
                            "rest",

                        area:
                            24,

                        coverage:
                            94,

                        risk:
                            "low",


                        zones:
                            [],


                        sources: [

                            {
                                id:
                                    "demo-living-tv",

                                type:
                                    "Smart TV",

                                level:
                                    "low"
                            }

                        ],


                        measurements: {

                            rf:
                                32,

                            electric:
                                0.9,

                            magnetic:
                                0.8
                        },


                        gridPoints:
                            []

                    }

                ],


                // ------------------------------------------
                // FLOOR-LEVEL ARRAYS
                // ------------------------------------------

                zones:
                    [],

                sources:
                    [],

                measurements:
                    [],

                gridPoints:
                    []

            }

        ],


        // ==================================================
        // LIFESTYLE AREAS
        // ==================================================

        lifestyleAreas: [

            {

                id:
                    "sleep",

                name:
                    "Sleep",

                room:
                    "Bedroom",

                priority:
                    "high",

                exposure:
                    "low"
            },


            {

                id:
                    "work",

                name:
                    "Work",

                room:
                    "Home Office",

                priority:
                    "medium",

                exposure:
                    "moderate"
            },


            {

                id:
                    "rest",

                name:
                    "Rest",

                room:
                    "Living Room",

                priority:
                    "medium",

                exposure:
                    "low"
            }

        ],


        // ==================================================
        // PROPERTY-LEVEL SOURCES
        // ==================================================

        sources: [

            {

                id:
                    "demo-source-router",

                name:
                    "Wi-Fi Router",

                category:
                    "RF",

                location:
                    "Home Office",

                level:
                    "moderate"
            },


            {

                id:
                    "demo-source-tv",

                name:
                    "Smart TV",

                category:
                    "RF",

                location:
                    "Living Room",

                level:
                    "low"
            },


            {

                id:
                    "demo-source-laptop",

                name:
                    "Laptop",

                category:
                    "RF",

                location:
                    "Home Office",

                level:
                    "low"
            }

        ],


        // ==================================================
        // RECOMMENDATIONS
        // ==================================================

        recommendations: [

            {

                id:
                    "demo-rec-sleep",

                priority:
                    "high",

                category:
                    "sleep",

                title:
                    "Reduce wireless exposure near the sleeping area",

                text:
                    "Keep wireless sources away from the bed where practical."
            },


            {

                id:
                    "demo-rec-work",

                priority:
                    "medium",

                category:
                    "work",

                title:
                    "Review wireless devices in the work area",

                text:
                    "Consider distance and placement of wireless devices around the workspace."
            },


            {

                id:
                    "demo-rec-rest",

                priority:
                    "medium",

                category:
                    "rest",

                title:
                    "Maintain distance from active wireless sources",

                text:
                    "Use practical distance and placement strategies in frequently used areas."
            }

        ],


        // ==================================================
        // INSIGHTS
        // ==================================================

        insights: {

            overall:
                "Low to moderate exposure profile",

            coverage:
                91,

            measuredAreas:
                3,

            lifestyleAreas:
                3,

            sources:
                3,

            recommendations:
                3
        }

    };


    // ==================================================
    // STORE DEMO STATE
    // ==================================================

    AppState.homeDemoProject =
        demoProject;

    AppState.homeDemoAnalysis = {

        property:
            demoProject,

        lifestyleAreas:
            demoProject.lifestyleAreas,

        sources:
            demoProject.sources,

        recommendations:
            demoProject.recommendations,

        insights:
            demoProject.insights

    };


    // ==================================================
    // IMPORTANT:
    // FRONTEND-ONLY DEMO
    // ==================================================

    AppState.project =
        demoProject;

    window.project =
        demoProject;

    window.EMFHomeDemo =
        true;


    window.WorkspaceAccess =
        window.WorkspaceAccess ||
        {};

    window.WorkspaceAccess.mode =
        "home_demo";


    // ==================================================
    // UI
    // ==================================================

    window.updateWorkspaceUI?.();

    window.updateProjectHeader?.();

    window.updateHomeWorkflow?.();

    window.updateHomeLocks?.();

    window.updateHomeEmptyPlanState?.();

    window.updateHomeProfessionalAssessment?.();

    window.updateWorkflowUI?.();

    window.updateCurrentExposure?.();

    window.updateEMFProductContext?.();

    window.renderFloorTabs?.();

    window.renderHomeFloorTabs?.();

    window.requestRender?.();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "🏠 HOME DEMO READY",
        {

            projectId:
                demoProject.project_id,

            rooms:
                demoProject
                    .floors?.[0]
                    ?.rooms
                    ?.length || 0,

            zones:
                demoProject
                    .floors?.[0]
                    ?.zones
                    ?.length || 0,

            sources:
                demoProject
                    .floors?.[0]
                    ?.sources
                    ?.length || 0,

            measurements:
                demoProject
                    .floors?.[0]
                    ?.measurements
                    ?.length || 0,

            gridPoints:
                demoProject
                    .floors?.[0]
                    ?.gridPoints
                    ?.length || 0,

            lifestyleAreas:
                demoProject
                    .lifestyleAreas
                    ?.length || 0,

            propertySources:
                demoProject
                    .sources
                    ?.length || 0,

            recommendations:
                demoProject
                    .recommendations
                    ?.length || 0
        }
    );
}

window.loadHomeDemoExperience =
    loadHomeDemoExperience;

function resolveWorkspaceExperience(mode) {
    const role =
        window.EMFProductContext?.account?.role ||
        "user";

    const isAdmin =
        window.EMFProductContext?.account?.isAdmin === true;

    if (isAdmin) {
        return {
            mode: "real"
        };
    }

    if (mode === "business") {
        const businessProjectId =
            localStorage.getItem("business_project_id") ||
            window.AppState?.businessProject?.project_id ||
            window.AppState?.businessProject?.id ||
            null;

        if (role === "professional" && businessProjectId) {
            return {
                mode: "real",
                projectId: String(businessProjectId)
            };
        }

        return {
            mode: "demo",
            demoType: "business"
        };
    }

    // HOME

    const homeProject =
        window.AppState?.homeProject ||
        null;
    const homeProjectId =
        (
            homeProject?.project_id ??
            homeProject?.id ??
            localStorage.getItem("home_project_id")
        ) ||
        localStorage.getItem("homeProjectId");

    if (homeProjectId) {
        return {
            mode: "real",
            projectId: String(homeProjectId)
        };
    }

    if (role === "professional") {
        return {
            mode: "demo",
            demoType: "home"
        };
    }

    return {
        mode: "activation",
        activationType: "home"
    };
}

function updateWorkspaceUI() {

    const mode =
        window.AppMode?.current ||
        "home";

    // ==================================================
    // CONTEXTUAL RETURN ACTION
    // ==================================================

    const returnAction =
        document.getElementById("contextualReturnAction");

    const returnLabel =
        document.getElementById("contextualReturnLabel");

    const experience =
        window.EMFWorkspaceExperience || {};

    const role =
        window.EMFProductContext?.account?.role || "user";

    const isHome =
        mode === "home";

    const isBusiness =
        mode === "business";

    const isBusinessDemo =
        isBusiness &&
        experience.mode === "demo" &&
        experience.demoType === "business";

    const isHomeDemo =
        isHome &&
        experience.mode === "demo" &&
        experience.demoType === "home";

    // Home user exploring Business Demo
    if (isBusinessDemo && role !== "professional") {

        if (returnAction) {
            returnAction.style.display = "block";
        }

        if (returnLabel) {
            returnLabel.textContent = "My Property";
        }

    }

    // Professional exploring Home
    else if (isHomeDemo && role === "professional") {

        if (returnAction) {
            returnAction.style.display = "block";
        }

        if (returnLabel) {
            returnLabel.textContent = "Business Workspace";
        }

    }

    // Primary workspace / real workspace
    else {

        if (returnAction) {
            returnAction.style.display = "none";
        }

    }
    // ==================================================
    // ACTIVE PROJECT
    // ==================================================

    const activeProject =
        mode === "home"
            ? (
                AppState?.homeProject ||
                AppState?.project ||
                null
            )
            : (
                AppState?.project ||
                null
            );

    const isDemo =
        window.EMFWorkspaceExperience?.mode === "demo" &&
        (
            AppState?.project?.isDemo === true ||
            AppState?.project?.demo === true
        );

    const hasActiveProject =
        !!activeProject;


    const homeProjectDisplayName =
        document.getElementById(
            "homeProjectDisplayName"
        );

    if (homeProjectDisplayName) {

        const projectName =
            AppState?.project?.name ||
            AppState?.homeProject?.name ||
            "";

        homeProjectDisplayName.textContent =
            projectName.trim();

        homeProjectDisplayName.style.display =
            projectName.trim()
                ? "inline-flex"
                : "none";
    }


    const projectStartIcon =
        document.getElementById("projectStartIcon");

    if (projectStartIcon) {

        projectStartIcon.src =
            mode === "home"
                ? "assets/icons/home-project-start.png"
                : "assets/icons/business-project-start.png";

        projectStartIcon.alt =
            mode === "home"
                ? "Home"
                : "Business";
    }

    // ==================================================
    // NO ACTIVE PROJECT — HIDE PROJECT WORKFLOW
    // ==================================================

    if (
        !hasActiveProject
    ) {

        // ----------------------------------------------
        // HOME WORKFLOW SECTIONS
        // ----------------------------------------------

        document
            .querySelectorAll(
                ".home-only.sectionBlock"
            )
            .forEach(
                el => {

                    el.style.display =
                        "none";
                }
            );


        // ----------------------------------------------
        // PLAN ACTIONS
        // ----------------------------------------------

        const homePlanActions =
            document.getElementById(
                "homePlanActions"
            );

        const businessPlanActions =
            document.getElementById(
                "businessPlanActions"
            );


        if (
            homePlanActions
        ) {

            homePlanActions.style.display =
                "none";
        }


        if (
            businessPlanActions
        ) {

            businessPlanActions.style.display =
                "none";
        }


        // ----------------------------------------------
        // CURRENT FLOOR CARD
        // ----------------------------------------------

        const homeCurrentFloorCard =
            document.getElementById(
                "homeCurrentFloorCard"
            );


        if (
            homeCurrentFloorCard
        ) {

            homeCurrentFloorCard.style.display =
                "none";
        }


        // ----------------------------------------------
        // EMPTY PLAN
        // ----------------------------------------------

        const homeEmptyPlanState =
            document.getElementById(
                "homeEmptyPlanState"
            );


        if (
            homeEmptyPlanState
        ) {

            homeEmptyPlanState.style.display =
                "none";
        }


        // ----------------------------------------------
        // WORKFLOW BARS
        // ----------------------------------------------

        if (
            homeWorkflowBar
        ) {

            homeWorkflowBar.style.display =
                "none";
        }


        if (
            businessWorkflowBar
        ) {

            businessWorkflowBar.style.display =
                "none";
        }


        // ----------------------------------------------
        // BUSINESS WORKFLOW
        // ----------------------------------------------

        const businessWorkflowSection =
            document.getElementById(
                "businessWorkflowSection"
            );


        if (
            businessWorkflowSection
        ) {

            businessWorkflowSection.style.display =
                "none";
        }


        // ----------------------------------------------
        // FLOOR TABS
        // ----------------------------------------------

        const homeFloorTabs =
            document.getElementById(
                "homeFloorTabs"
            );

        const businessFloorTabs =
            document.getElementById(
                "businessFloorTabs"
            );


        if (
            homeFloorTabs
        ) {

            homeFloorTabs.innerHTML =
                "";

            homeFloorTabs.style.display =
                "none";
        }


        if (
            businessFloorTabs
        ) {

            businessFloorTabs.innerHTML =
                "";

            businessFloorTabs.style.display =
                "none";
        }
    }

    // ==================================================
    // PROJECT START SCREEN
    // ==================================================

    const projectStartScreen =
        document.getElementById(
            "projectStartScreen"
        );


    if (
        projectStartScreen
    ) {

        projectStartScreen.style.display =
            hasActiveProject
                ? "none"
                : "flex";
    }

    console.error(
        "🔥 WORKSPACE UI STATE",
        {
            mode,
            hasActiveProject,

            projectId:
                activeProject
                    ?.project_id ??
                activeProject
                    ?.id ??
                null,

            projectType:
                activeProject
                    ?.projectType ??
                activeProject
                    ?.type ??
                null
        }
    );


    // ==================================================
    // HEADER TITLE
    // ==================================================

    const projectTitle =
        document.querySelector(
            ".project-title"
        );


    if (
        projectTitle
    ) {

        const workspaceName =
            projectTitle.querySelector(
                ".project-workspace-name"
            );

        const projectDisplayName =
            projectTitle.querySelector(
                "#homeProjectDisplayName"
            );


        // ==================================================
        // WORKSPACE TITLE
        // ==================================================
        if (
            workspaceName
        ) {

            workspaceName.textContent =
                mode === "home"

                    ? (
                        hasActiveProject
                            ? "🏠 My Home Project"
                            : "🏠 Home Wellness"
                    )

                    : (
                        isDemo
                            ? "🏢 Professional Assessment"
                            : (
                                hasActiveProject
                                    ? "🏢 Business Project"
                                    : "🏢 Business Survey"
                            )
                    );
        }


        // ==================================================
        // PROJECT NAME
        // ==================================================

        if (
            projectDisplayName
        ) {

            const activeProjectName =
                mode === "home"

                    ? (
                        AppState?.project?.name ||
                        AppState?.homeProject?.name ||
                        ""
                    )

                    : (
                        AppState?.project?.name ||
                        AppState?.businessProject?.name ||
                        ""
                    );


            const cleanName =
                String(
                    activeProjectName
                ).trim();


            projectDisplayName.textContent =
                cleanName;


            projectDisplayName.style.display =
                cleanName
                    ? "inline-flex"
                    : "none";
        }
    }

    // ==================================================
    // DROPDOWN LABEL
    // ==================================================

    const workspaceLabel =
        document.getElementById(
            "workspaceLabel"
        );


    console.error(
        "WORKSPACE LABEL UPDATE",
        mode
    );


    if (
        workspaceLabel
    ) {

        workspaceLabel.innerText =
            mode === "home"
                ? "🏠 Home Wellness"
                : "🏢 Business Survey";


        console.error(
            "LABEL AFTER SET",
            workspaceLabel.innerText,
            AppMode.current
        );
    }


    // ==================================================
    // HOME / BUSINESS GENERIC BLOCKS
    // ==================================================

    document
        .querySelectorAll(".home-only")
        .forEach(
            el => {

                if (
                    el.id === "propertyHealthDashboardView"
                ) {
                    el.style.display = "none";
                    return;
                }

                el.style.display =
                    mode === "home"
                        ? "block"
                        : "none";
            }
        );


    document
        .querySelectorAll(
            ".business-only"
        )
        .forEach(
            el => {

                el.style.display =
                    mode === "business"
                        ? ""
                        : "none";
            }
        );


    // ==================================================
    // 🔥 PLAN ACTIONS
    // ==================================================
    //
    // IMPORTANT:
    //
    // These are controlled separately from the generic
    // home-only / business-only blocks.
    //
    // HOME:
    //
    //     active project
    //         → homePlanActions visible
    //
    //     no project
    //         → hidden
    //
    // BUSINESS:
    //
    //     active project
    //         → businessPlanActions visible
    //
    //     no project
    //         → hidden
    //
    // NEVER SHOW BOTH.
    //
    // ==================================================

    const homePlanActions =
        document.getElementById(
            "homePlanActions"
        );


    const businessPlanActions =
        document.getElementById(
            "businessPlanActions"
        );


    if (
        homePlanActions
    ) {

        homePlanActions.style.display =
            (
                mode === "home" &&
                hasActiveProject
            )
                ? "block"
                : "none";
    }


    if (
        businessPlanActions
    ) {

        businessPlanActions.style.display =
            (
                mode === "business" &&
                hasActiveProject
            )
                ? "block"
                : "none";
    }


    console.error(
        "🔥 PLAN ACTION VISIBILITY",
        {
            mode,
            hasActiveProject,

            homePlanActions:
                homePlanActions
                    ? getComputedStyle(
                        homePlanActions
                    ).display
                    : "NOT FOUND",

            businessPlanActions:
                businessPlanActions
                    ? getComputedStyle(
                        businessPlanActions
                    ).display
                    : "NOT FOUND"
        }
    );


    // ==================================================
    // BUSINESS WORKFLOW SECTION
    // ==================================================

    const businessWorkflowSection =
        document.getElementById(
            "businessWorkflowSection"
        );


    if (
        businessWorkflowSection
    ) {

        businessWorkflowSection.style.display =
            (
                mode === "business" &&
                hasActiveProject
            )
                ? "block"
                : "none";
    }


    // ==================================================
    // HOME WORKFLOW BAR
    // ==================================================

    if (
        homeWorkflowBar
    ) {

        homeWorkflowBar.style.display =
            (
                mode === "home" &&
                hasActiveProject
            )
                ? "flex"
                : "none";
    }


    // ==================================================
    // BUSINESS WORKFLOW BAR
    // ==================================================

    if (
        businessWorkflowBar
    ) {

        businessWorkflowBar.style.display =
            (
                mode === "business" &&
                hasActiveProject
            )
                ? "flex"
                : "none";
    }


    // ==================================================
    // HOME CURRENT FLOOR CARD
    // ==================================================

    const homeCurrentFloorCard =
        document.getElementById(
            "homeCurrentFloorCard"
        );


    if (
        homeCurrentFloorCard
    ) {

        homeCurrentFloorCard.style.display =
            (
                mode === "home" &&
                hasActiveProject
            )
                ? ""
                : "none";
    }


    // ==================================================
    // HOME EMPTY PLAN STATE
    // ==================================================
    //
    // The empty plan card only makes sense when a Home
    // project actually exists.
    //
    // updateHomeEmptyPlanState() handles whether the
    // current Home floor has an image.
    //
    // ==================================================

    if (
        mode === "home" &&
        hasActiveProject
    ) {

        updateHomeEmptyPlanState?.();

    }

    else {

        const homeEmptyPlanState =
            document.getElementById(
                "homeEmptyPlanState"
            );


        if (
            homeEmptyPlanState
        ) {

            homeEmptyPlanState.style.display =
                "none";
        }
    }

    // ==================================================
    // BUSINESS EMPTY PLAN STATE
    // ==================================================
    if (
        mode === "business"
    ) {

        updateBusinessEmptyPlanState?.();

    }

    else {

        const businessEmptyPlanState =
            document.getElementById(
                "businessEmptyPlanState"
            );


        if (
            businessEmptyPlanState
        ) {

            businessEmptyPlanState.style.display =
                "none";
        }
    }


    // ==================================================
    // HOME SESSIONS HIDE
    // ==================================================

    const sessionCount =
        document.getElementById(
            "projectSessionCount"
        );


    if (
        sessionCount
    ) {

        const stats =
            sessionCount.parentElement;


        if (
            stats
        ) {

            stats.style.display =
                mode === "home"
                    ? "none"
                    : "";
        }
    }


    // ==================================================
    // FLOOR TABS
    // ==================================================

    const homeFloorTabs =
        document.getElementById(
            "homeFloorTabs"
        );


    const businessFloorTabs =
        document.getElementById(
            "businessFloorTabs"
        );


    if (
        homeFloorTabs
    ) {

        homeFloorTabs.style.display =
            (
                mode === "home" &&
                hasActiveProject
            )
                ? "flex"
                : "none";
    }


    if (
        businessFloorTabs
    ) {

        businessFloorTabs.style.display =
            (
                mode === "business" &&
                hasActiveProject
            )
                ? "flex"
                : "none";
    }


    // ==================================================
    // NO ACTIVE PROJECT
    // ==================================================
    //
    // New Project / Open Project screen.
    //
    // No Plan
    // No Floor
    // No Workflow
    //
    // ==================================================

    if (
        !hasActiveProject
    ) {

        // ----------------------------------------------
        // PLAN ACTIONS
        // ----------------------------------------------

        if (
            homePlanActions
        ) {

            homePlanActions.style.display =
                "none";
        }


        if (
            businessPlanActions
        ) {

            businessPlanActions.style.display =
                "none";
        }


        // ----------------------------------------------
        // CURRENT FLOOR
        // ----------------------------------------------

        if (
            homeCurrentFloorCard
        ) {

            homeCurrentFloorCard.innerHTML =
                "";

            homeCurrentFloorCard.style.display =
                "none";
        }


        // ----------------------------------------------
        // WORKFLOW
        // ----------------------------------------------

        if (
            homeWorkflowBar
        ) {

            homeWorkflowBar.style.display =
                "none";
        }


        if (
            businessWorkflowBar
        ) {

            businessWorkflowBar.style.display =
                "none";
        }


        // ----------------------------------------------
        // BUSINESS WORKFLOW
        // ----------------------------------------------

        if (
            businessWorkflowSection
        ) {

            businessWorkflowSection.style.display =
                "none";
        }


        // ----------------------------------------------
        // EMPTY PLAN
        // ----------------------------------------------

        const homeEmptyPlanState =
            document.getElementById(
                "homeEmptyPlanState"
            );


        if (
            homeEmptyPlanState
        ) {

            homeEmptyPlanState.style.display =
                "none";
        }


        // ----------------------------------------------
        // FLOOR TABS
        // ----------------------------------------------

        if (
            homeFloorTabs
        ) {

            homeFloorTabs.innerHTML =
                "";

            homeFloorTabs.style.display =
                "none";
        }


        if (
            businessFloorTabs
        ) {

            businessFloorTabs.innerHTML =
                "";

            businessFloorTabs.style.display =
                "none";
        }
    }


    // ==================================================
    // DEBUG
    // ==================================================

    console.error(
        "🔥🔥 FINAL WORKSPACE UI",
        {
            mode,

            hasActiveProject,

            homePlanVisible:
                homePlanActions
                    ? getComputedStyle(
                        homePlanActions
                    ).display
                    : null,

            businessPlanVisible:
                businessPlanActions
                    ? getComputedStyle(
                        businessPlanActions
                    ).display
                    : null,

            homeWorkflowVisible:
                homeWorkflowBar
                    ? getComputedStyle(
                        homeWorkflowBar
                    ).display
                    : null,

            businessWorkflowVisible:
                businessWorkflowBar
                    ? getComputedStyle(
                        businessWorkflowBar
                    ).display
                    : null
        }
    );


    // ==================================================
    // RESIZE / RENDER
    // ==================================================

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    console.error(
                        "🔥🔥🔥 FINAL MODE LAYOUT BEFORE RESIZE",
                        {
                            mode,

                            canvasArea:
                                document
                                    .querySelector(
                                        ".canvas-area"
                                    )
                                    ?.getBoundingClientRect(),

                            canvasWrap:
                                document
                                    .getElementById(
                                        "canvasWrap"
                                    )
                                    ?.getBoundingClientRect(),

                            mainContent:
                                document
                                    .querySelector(
                                        ".main-content"
                                    )
                                    ?.getBoundingClientRect()
                        }
                    );


                    resizeCanvasSafe?.();

                    requestRender?.();

                }
            );
        }
    );


    requestRender?.();
}

// ==================================================
// CONTEXTUAL RETURN — PRIMARY WORKSPACE
// ==================================================
async function returnToPrimaryWorkspace() {

    const mode =
        window.AppMode?.current || "home";

    const role =
        window.EMFProductContext?.account?.role ||
        "user";

    console.log(
        "↩ RETURN TO PRIMARY WORKSPACE",
        {
            mode,
            role
        }
    );

    // Home Demo → Business
    if (
        mode === "home" &&
        role === "professional"
    ) {
        localStorage.setItem(
            "workspaceMode",
            "business"
        );

        await setAppMode("business");

        closeWorkspaceMenu?.();

        return;
    }

    // Business Demo → Home
    if (
        mode === "business" &&
        role !== "professional"
    ) {
        localStorage.setItem(
            "workspaceMode",
            "home"
        );

        await setAppMode("home");

        closeWorkspaceMenu?.();

        return;
    }

    console.log(
        "↩ RETURN TO PRIMARY WORKSPACE — NO ACTION",
        {
            mode,
            role
        }
    );
}

window.returnToPrimaryWorkspace =
    returnToPrimaryWorkspace;

function clearBusinessVisuals() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    // 🔥 hide business overlays

    console.error(
        "clearBusinessVisuals CALLED"
    );

    // floor.rooms = [];

    requestRender?.();
}

// =====================
// 🔥 UPDATE UI
// =====================

function updateModeUI() {

    console.log(
        "OLD updateModeUI DISABLED"
    );

    return;
}

// =====================
// 🔥 UPDATE GUIDE
// =====================

function updateAppGuideText() {

    const el =
        document.getElementById(
            "guideText"
        );

    if (!el) {
        return;
    }


    // =====================
    // 🔥 HOME MODE
    // =====================

    if (isHomeMode()) {

        // =====================
        // 🔥 WORKSPACE
        // =====================

        const mode =
            window.AppMode?.current || "home";

        const workspace =
            window.workspaceState?.[mode];

        // =====================
        // 🔥 PLAN
        // =====================

        if (!workspace?.planImage) {

            el.innerHTML =
                "📐 Upload your floor plan";

            return;
        }

        // =====================
        // 🔥 ROOMS
        // =====================

        const roomCount =

            window.roomTool?.rooms
                ?.length || 0;

        if (roomCount === 0) {

            el.innerHTML =

                "🟦 Draw your rooms";

            return;
        }

        // =====================
        // 🔥 OBJECTS
        // =====================

        const objectCount =

            window.objectTool?.objects
                ?.length || 0;

        if (objectCount === 0) {

            el.innerHTML =

                "🛏 Add wellness objects";

            return;
        }

        // =====================
        // 🔥 DONE
        // =====================

        el.innerHTML =

            "✨ View your wellness insights";
    }

    // =====================
    // 🔥 BUSINESS MODE
    // =====================

    else {

        el.innerHTML =

            "Advanced assessment tools enabled";
    }
}

// =====================
// 🔥 UPDATE WELLNESS
// =====================
function updateWellnessCard() {

    const card =
        document.getElementById(
            "wellnessCard"
        );

    if (!card) {
        return;
    }

    // =====================================================
    // PROPERTY
    // =====================================================

    const propertyValue =
        card.querySelector(
            ".property-record-item:nth-child(1) .property-record-value"
        );

    const propertyName =
        window.AppState?.homeProject?.name ||
        window.AppState?.project?.name ||
        window.homeProjectDisplayName ||
        "My Property";

    if (propertyValue) {
        propertyValue.textContent =
            propertyName;
    }


    // =====================================================
    // ENVIRONMENT
    // =====================================================

    const environmentValue =
        card.querySelector(
            ".property-record-item:nth-child(2) .property-record-value"
        );

    const indoorSources =
        window.AppState?.homeProject?.indoorSources ||
        window.AppState?.project?.indoorSources ||
        window.indoorSources ||
        [];

    const outdoorSources =
        window.AppState?.homeProject?.outdoorSources ||
        window.AppState?.project?.outdoorSources ||
        window.outdoorSources ||
        [];

    const indoorCount =
        Array.isArray(indoorSources)
            ? indoorSources.length
            : 0;

    const outdoorCount =
        Array.isArray(outdoorSources)
            ? outdoorSources.length
            : 0;

    const sourceCount =
        indoorCount +
        outdoorCount;




    // =====================================================
    // LIFESTYLE
    // =====================================================

    const lifestyleValue =
        card.querySelector(
            ".property-record-item:nth-child(3) .property-record-value"
        );

    const lifestyleAreas =
        window.AppState?.homeProject?.lifestyleAreas ||
        window.AppState?.project?.lifestyleAreas ||
        window.lifestyleAreas ||
        [];

    const lifestyleCount =
        Array.isArray(lifestyleAreas)
            ? lifestyleAreas.length
            : 0;

    if (lifestyleValue) {

        if (lifestyleCount === 0) {

            lifestyleValue.textContent =
                "Living areas not yet added";

        } else if (lifestyleCount === 1) {

            lifestyleValue.textContent =
                "1 living area added";

        } else {

            lifestyleValue.textContent =
                lifestyleCount +
                " living areas added";
        }
    }


    // =====================================================
    // ASSESSMENT
    // =====================================================

    const assessmentValue =
        card.querySelector(
            ".property-record-item:nth-child(4) .property-record-value"
        );

    if (assessmentValue) {

        assessmentValue.textContent =
            "Initial Home Assessment";
    }


    // =====================================================
    // STATUS
    // =====================================================

    const statusValue =
        card.querySelector(
            ".property-record-status-value"
        );

    if (statusValue) {

        let status =
            "Initial record created";

        if (
            sourceCount > 0 ||
            lifestyleCount > 0
        ) {

            status =
                "Property profile in progress";
        }

        statusValue.textContent =
            status;
    }


    // =====================================================
    // CARD VISIBILITY
    // =====================================================

    card.style.display =
        "block";
}

// ============================================================
// PROPERTY HEALTH RECORD
// ============================================================

function openPropertyHealthRecord() {

    const modal =
        document.getElementById(
            "propertyHealthRecordModal"
        );

    if (!modal) {
        console.warn(
            "[PHR] propertyHealthRecordModal not found"
        );
        return;
    }

    const property =
        window.AppState?.property ||
        window.AppState?.homeProject ||
        window.AppState?.project ||
        {};

    const rawPropertyName =
        property.name ||
        window.homeProjectDisplayName ||
        "My Property";

    const propertyName =
        typeof rawPropertyName === "string"
            ? rawPropertyName
            : rawPropertyName?.textContent?.trim() ||
            "My Property";

    const propertyTitle =
        document.getElementById(
            "propertyHealthRecordModalTitle"
        );

    if (propertyTitle) {
        propertyTitle.textContent =
            propertyName;
    }

    // --------------------------------------------------------
    // PROPERTY DETAILS
    // --------------------------------------------------------

    const propertyTypeElement =
        document.getElementById(
            "propertyHealthRecordPropertyType"
        );

    if (propertyTypeElement) {

        const propertyTypeLabels = {
            apartment: "Apartment",
            house: "House",
            office: "Office",
            other: "Other"
        };

        const propertyType =
            propertyTypeLabels[
            String(
                property.propertyType || ""
            ).toLowerCase()
            ] ||
            property.propertyType ||
            "Property";

        propertyTypeElement.textContent =
            propertyType;
    }


    const addressElement =
        document.getElementById(
            "propertyHealthRecordAddress"
        );

    if (addressElement) {

        const addressParts = [
            property.address,
            property.unit
        ].filter(Boolean);

        addressElement.textContent =
            addressParts.length
                ? addressParts.join(", ")
                : "Address not yet added";
    }


    const cityElement =
        document.getElementById(
            "propertyHealthRecordCity"
        );

    if (cityElement) {

        const locationParts = [
            property.city,
            property.postalCode,
            property.state || property.region
        ].filter(Boolean);

        cityElement.textContent =
            locationParts.length
                ? locationParts.join(", ")
                : "Location not yet added";
    }


    const countryElement =
        document.getElementById(
            "propertyHealthRecordCountry"
        );

    if (countryElement) {

        countryElement.textContent =
            property.country ||
            "Country not yet added";
    }


    const propertyIdElement =
        document.getElementById(
            "propertyHealthRecordId"
        );

    if (propertyIdElement) {

        propertyIdElement.textContent =
            property.id ||
            "—";
    }


    const assessmentStatusElement =
        document.getElementById(
            "propertyHealthRecordAssessmentStatus"
        );

    if (assessmentStatusElement) {

        assessmentStatusElement.textContent =
            "In progress";
    }

    // --------------------------------------------------------
    // ENVIRONMENT
    // --------------------------------------------------------
    const homeProject =
        window.AppState?.homeProject ||
        window.AppState?.project ||
        {};

    const floors =
        Array.isArray(homeProject?.floors)
            ? homeProject.floors
            : [];

    // Indoor Sources are stored in floor.sources
    const indoorCount =
        floors.reduce(
            (total, floor) =>
                total +
                (
                    Array.isArray(floor?.sources)
                        ? floor.sources.length
                        : 0
                ),
            0
        );

    // Outdoor Sources are stored at Property / Project level
    const outdoorSources =
        Array.isArray(homeProject?.outdoorSources)
            ? homeProject.outdoorSources
            : [];

    const outdoorCount =
        outdoorSources.length;

    const sourceCount =
        indoorCount +
        outdoorCount;

    const floorCount =
        floors.length;

    const environmentElement =
        document.getElementById(
            "propertyHealthRecordEnvironment"
        );

    if (environmentElement) {

        const indoorElement =
            document.getElementById(
                "propertyHealthRecordIndoorSources"
            );

        const outdoorElement =
            document.getElementById(
                "propertyHealthRecordOutdoorSources"
            );

        const totalElement =
            document.getElementById(
                "propertyHealthRecordTotalSources"
            );

        const floorsElement =
            document.getElementById(
                "propertyHealthRecordFloors"
            );

        if (indoorElement) {
            indoorElement.textContent =
                indoorCount;
        }

        if (outdoorElement) {
            outdoorElement.textContent =
                outdoorCount;
        }

        if (totalElement) {
            totalElement.textContent =
                sourceCount;
        }

        if (floorsElement) {
            floorsElement.textContent =
                floorCount;
        }
    }

    // --------------------------------------------------------
    // LIFESTYLE
    // --------------------------------------------------------

    const lifestyleAreas =
        Array.isArray(homeProject?.floors)
            ? homeProject.floors.flatMap(
                floor =>
                    Array.isArray(floor?.zones)
                        ? floor.zones
                        : []
            )
            : [];

    const lifestyleCount =
        Array.isArray(lifestyleAreas)
            ? lifestyleAreas.length
            : 0;

    const lifestyleElement =
        document.getElementById(
            "propertyHealthRecordLifestyle"
        );

    if (lifestyleElement) {

        if (lifestyleCount === 0) {
            lifestyleElement.textContent =
                "Living areas not yet added";
        } else if (lifestyleCount === 1) {
            lifestyleElement.textContent =
                "1 living area added";
        } else {
            lifestyleElement.textContent =
                `${lifestyleCount} living areas added`;
        }
    }

    // --------------------------------------------------------
    // ASSESSMENT
    // --------------------------------------------------------

    const assessmentElement =
        document.getElementById(
            "propertyHealthRecordAssessment"
        );

    if (assessmentElement) {
        assessmentElement.textContent =
            "Initial Home Assessment";
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    const statusElement =
        document.getElementById(
            "propertyHealthRecordModalStatus"
        );

    if (statusElement) {

        if (
            sourceCount > 0 ||
            lifestyleCount > 0
        ) {
            statusElement.textContent =
                "Property profile in progress";
        } else {
            statusElement.textContent =
                "Initial record created";
        }
    }

    // --------------------------------------------------------
    // RECORD HISTORY
    // --------------------------------------------------------

    const historyElement =
        document.getElementById(
            "propertyHealthRecordHistoryItems"
        );

    if (historyElement) {

        const assessment =
            window.AppState?.propertyAssessment ||
            {};

        const historyItems = [];

        // ----------------------------------------------------
        // PROPERTY RECORD CREATED
        // ----------------------------------------------------

        const propertyCreatedAt =
            window.AppState?.property?.createdAt ||
            window.AppState?.homeProject?.createdAt ||
            window.AppState?.project?.createdAt ||
            assessment?.createdAt ||
            null;

        let propertyCreatedDateText = "Date not available";

        if (propertyCreatedAt) {

            const createdDate =
                new Date(propertyCreatedAt);

            if (!Number.isNaN(createdDate.getTime())) {

                propertyCreatedDateText =
                    createdDate.toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );
            }
        }


        historyItems.push(`
            <div class="property-health-record-history-item">

                <div class="property-health-record-history-dot"></div>

                <div>

                    <div class="property-health-record-history-title">
                        Initial record created
                    </div>

                    <div class="property-health-record-history-date">
                        ${propertyCreatedDateText}
                    </div>

                    <div class="property-health-record-history-subtitle">
                        Your Property Health Record has started.
                    </div>

                </div>

            </div>
        `);

        // ----------------------------------------------------
        // CURRENT HOME ASSESSMENT
        // ----------------------------------------------------

        if (assessment.id) {

            historyItems.push(`
                <div class="property-health-record-history-item">

                    <div class="property-health-record-history-dot"></div>

                    <div>
                        <div class="property-health-record-history-title">
                            Initial Home Assessment
                        </div>

                        <div class="property-health-record-history-subtitle">
                            Current Home Assessment · In progress
                        </div>
                    </div>

                </div>
            `);
        }

        // ----------------------------------------------------
        // FULL EMF INSIGHT REPORT
        // ----------------------------------------------------

        const fullReportUnlocked =
            window.AppState?.entitlements?.homeFullReport === true;

        if (fullReportUnlocked) {

            historyItems.push(`
                <div class="property-health-record-history-item">

                    <div class="property-health-record-history-dot"></div>

                    <div>
                        <div class="property-health-record-history-title">
                            Full EMF Insight Report
                        </div>

                        <div class="property-health-record-history-subtitle">
                            Detailed Home Assessment added to your Property Health Record.
                        </div>
                    </div>

                </div>
            `);
        }

        // ----------------------------------------------------
        // PROFESSIONAL ASSESSMENT
        // -------------------------------

        const professionalAssessments =
            window.AppState?.professionalAssessments ||
            [];

        const professionalAssessment =
            professionalAssessments.find(
                assessment =>
                    assessment &&
                    assessment.id &&
                    (
                        assessment.propertyId ===
                        property.id
                    )
            ) ||
            professionalAssessments.find(
                assessment =>
                    assessment &&
                    assessment.id
            ) ||
            null;

        if (
            professionalAssessment?.id
        ) {

            historyItems.push(`
                <div class="property-health-record-history-item">

                    <div class="property-health-record-history-dot"></div>

                    <div>
                        <div class="property-health-record-history-title">
                            Professional Assessment
                        </div>

                        <div class="property-health-record-history-subtitle">
                            Professional assessment associated with this Property Health Record.
                        </div>
                    </div>

                </div>
            `);
        }

        historyElement.innerHTML =
            historyItems.join("");
    }

    // --------------------------------------------------------
    // OPEN
    // --------------------------------------------------------

    modal.classList.add("active");

    document.body.classList.add(
        "property-health-record-open"
    );
}


function closePropertyHealthRecord() {

    const modal =
        document.getElementById(
            "propertyHealthRecordModal"
        );

    if (!modal) {
        return;
    }

    modal.style.display = "none";
    modal.classList.remove("active");

    document.body.classList.remove(
        "property-health-record-open"
    );
}

// ============================================================
// PROPERTY HEALTH DASHBOARD
// ============================================================

function populatePropertyHealthDashboard() {

    const property =
        window.AppState?.property ||
        {};

    const homeProject =
        window.AppState?.homeProject ||
        window.AppState?.project ||
        {};

    const assessment =
        window.AppState?.propertyAssessment ||
        {};

    // --------------------------------------------------------
    // PROPERTY
    // --------------------------------------------------------

    const propertyTypeElement =
        document.getElementById(
            "dashboardPropertyType"
        );

    if (propertyTypeElement) {
        propertyTypeElement.textContent =
            property.propertyType ||
            "Property";
    }

    const locationElement =
        document.getElementById(
            "dashboardPropertyLocation"
        );

    if (locationElement) {

        const locationParts = [
            property.city,
            property.country
        ].filter(Boolean);

        locationElement.textContent =
            locationParts.length
                ? locationParts.join(", ")
                : "Location not yet added";
    }

    const floors =
        Array.isArray(homeProject?.floors)
            ? homeProject.floors
            : [];

    const floorsElement =
        document.getElementById(
            "dashboardPropertyFloors"
        );

    if (floorsElement) {
        floorsElement.textContent =
            floors.length;
    }

    const propertyIdElement =
        document.getElementById(
            "dashboardPropertyId"
        );

    if (propertyIdElement) {
        propertyIdElement.textContent =
            property.id ||
            "—";
    }


    // --------------------------------------------------------
    // ENVIRONMENT
    // --------------------------------------------------------

    const indoorCount =
        floors.reduce(
            (total, floor) =>
                total +
                (
                    Array.isArray(floor?.sources)
                        ? floor.sources.length
                        : 0
                ),
            0
        );

    const outdoorSources =
        Array.isArray(homeProject?.outdoorSources)
            ? homeProject.outdoorSources
            : [];

    const outdoorCount =
        outdoorSources.length;

    const totalSourceCount =
        indoorCount +
        outdoorCount;



    const indoorElement =
        document.getElementById(
            "dashboardIndoorSources"
        );

    if (indoorElement) {
        indoorElement.textContent =
            indoorCount;
    }

    const outdoorElement =
        document.getElementById(
            "dashboardOutdoorSources"
        );

    if (outdoorElement) {
        outdoorElement.textContent =
            outdoorCount;
    }

    const totalElement =
        document.getElementById(
            "dashboardTotalSources"
        );

    if (totalElement) {
        totalElement.textContent =
            totalSourceCount;
    }


    // --------------------------------------------------------
    // LIFESTYLE
    // --------------------------------------------------------

    const lifestyleAreas =
        floors.flatMap(
            floor =>
                Array.isArray(floor?.zones)
                    ? floor.zones
                    : []
        );

    const lifestyleCount =
        lifestyleAreas.length;

    const lifestyleElements = [
        document.getElementById(
            "propertyHealthDashboardLifestyle"
        ),
        document.getElementById(
            "dashboardLifestyle"
        )
    ].filter(Boolean);

    lifestyleElements.forEach(
        lifestyleElement => {

            if (lifestyleCount === 0) {

                lifestyleElement.textContent =
                    "Living areas not yet added";

            } else if (lifestyleCount === 1) {

                lifestyleElement.textContent =
                    "1 living area added";

            } else {

                lifestyleElement.textContent =
                    `${lifestyleCount} living areas added`;
            }
        }
    );


    // --------------------------------------------------------
    // CURRENT ASSESSMENT
    // --------------------------------------------------------

    const assessmentElement =
        document.getElementById(
            "propertyHealthDashboardAssessment"
        );

    if (assessmentElement) {

        assessmentElement.textContent =
            "Initial Home Assessment";
    }

    const assessmentStatusElement =
        document.getElementById(
            "propertyHealthDashboardAssessmentStatus"
        );

    if (assessmentStatusElement) {

        assessmentStatusElement.textContent =
            "In progress";
    }


    // --------------------------------------------------------
    // RECORD HISTORY — CREATED DATE
    // --------------------------------------------------------

    const propertyCreatedAt =
        property.createdAt ||
        null;

    let propertyCreatedDateText =
        "Date not available";

    if (propertyCreatedAt) {

        const createdDate =
            new Date(
                propertyCreatedAt
            );

        if (
            !Number.isNaN(
                createdDate.getTime()
            )
        ) {

            propertyCreatedDateText =
                createdDate.toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
        }
    }

    const createdDateElements = [
        document.getElementById(
            "propertyHealthDashboardCreatedDate"
        ),
        document.getElementById(
            "dashboardPropertyCreatedDate"
        )
    ].filter(Boolean);

    createdDateElements.forEach(
        createdDateElement => {

            createdDateElement.textContent =
                propertyCreatedDateText;
        }
    );
}

function openPropertyHealthDashboard() {

    const view =
        document.getElementById(
            "propertyHealthDashboardView"
        );

    if (!view) {
        console.warn(
            "Property Health Dashboard view not found."
        );
        return;
    }

    /*
     * ----------------------------------------------------
     * CLOSE PROPERTY HEALTH RECORD POPUP
     * ----------------------------------------------------
     */

    if (
        typeof closePropertyHealthRecord ===
        "function"
    ) {
        closePropertyHealthRecord();
    }


    /*
     * ----------------------------------------------------
     * POPULATE DASHBOARD
     * ----------------------------------------------------
     */

    if (
        typeof populatePropertyHealthDashboard ===
        "function"
    ) {
        populatePropertyHealthDashboard();
    }


    /*
     * ----------------------------------------------------
     * ELEMENTS WE TEMPORARILY HIDE
     * ----------------------------------------------------
     */

    const elementsToHide = [
        document.getElementById(
            "homeWorkflowBar"
        ),

        document.getElementById(
            "homeCurrentFloorCard"
        ),

        document.getElementById(
            "homeEmptyPlanState"
        ),

        document.querySelector(
            ".canvas-area"
        )
    ];


    /*
     * ----------------------------------------------------
     * SAVE CURRENT DISPLAY STATE
     * ----------------------------------------------------
     */

    elementsToHide.forEach(
        element => {

            if (!element) {
                return;
            }

            element.dataset.dashboardPreviousDisplay =
                element.style.display;

        }
    );


    /*
     * ----------------------------------------------------
     * HIDE NORMAL HOME CONTENT
     * ----------------------------------------------------
     */

    elementsToHide.forEach(
        element => {

            if (!element) {
                return;
            }

            element.style.display =
                "none";

        }
    );


    /*
     * ----------------------------------------------------
     * SHOW PROPERTY HEALTH DASHBOARD
     * ----------------------------------------------------
     */

    view.style.display =
        "block";


    /*
     * ----------------------------------------------------
     * UPDATE DASHBOARD TITLE
     * ----------------------------------------------------
     */

    const property =
        window.AppState?.property ||
        {};

    const title =
        document.getElementById(
            "propertyHealthDashboardViewTitle"
        );

    if (title) {
        title.textContent =
            property.name ||
            "My Property";
    }


    const subtitle =
        document.getElementById(
            "propertyHealthDashboardViewSubtitle"
        );

    if (subtitle) {
        subtitle.textContent =
            "Your property's current environmental profile";
    }


    /*
     * ----------------------------------------------------
     * SCROLL TO DASHBOARD
     * ----------------------------------------------------
     */

    view.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closePropertyHealthDashboard() {

    const view =
        document.getElementById(
            "propertyHealthDashboardView"
        );

    if (view) {
        view.style.display =
            "none";
    }


    /*
     * ----------------------------------------------------
     * RESTORE EXACT PREVIOUS HOME STATE
     * ----------------------------------------------------
     */

    const elementsToRestore = [
        document.getElementById(
            "homeWorkflowBar"
        ),

        document.getElementById(
            "homeCurrentFloorCard"
        ),

        document.getElementById(
            "homeEmptyPlanState"
        ),

        document.querySelector(
            ".canvas-area"
        )
    ];

    elementsToRestore.forEach(
        element => {

            if (!element) {
                return;
            }

            /*
            * HOME EMPTY PLAN STATE
            *
            * Never restore this blindly.
            * If the current Home project already has
            * a floor plan / rendered canvas, the empty
            * floor-plan prompt must remain hidden.
            */

            if (
                element.id ===
                "homeEmptyPlanState"
            ) {

                element.style.display =
                    "none";

                delete element.dataset
                    .dashboardPreviousDisplay;

                return;
            }


            /*
            * Restore all other Home elements
            * to their previous state.
            */

            if (
                element.dataset
                    .dashboardPreviousDisplay
                !== undefined
            ) {

                element.style.display =
                    element.dataset
                        .dashboardPreviousDisplay;

                delete element.dataset
                    .dashboardPreviousDisplay;

            }

        }
    );
}


// ============================================================
// EXPORTS
// ============================================================

window.openPropertyHealthDashboard =
    openPropertyHealthDashboard;

window.closePropertyHealthDashboard =
    closePropertyHealthDashboard;


window.openPropertyHealthRecord =
    openPropertyHealthRecord;

window.closePropertyHealthRecord =
    closePropertyHealthRecord;

// =====================
// 🔥 PREMIUM MODAL
// =====================

function showPremiumModal() {

    alert(

        "Premium report system coming next.\n\n" +

        "Includes:\n" +

        "• Full heatmaps\n" +
        "• Sleep optimization\n" +
        "• Room wellness analysis\n" +
        "• Personalized recommendations\n" +
        "• PDF export"
    );
}

// =====================
// 🔥 ADVANCED SOURCES
// =====================

function toggleAdvancedSources() {

    const el =
        document.getElementById(
            "advancedSources"
        );

    if (!el) {
        return;
    }

    const isHidden =

        getComputedStyle(el)
            .display ===
        "none";

    el.style.display =

        isHidden
            ? "block"
            : "none";

    // 🔥 FORCE SIDEBAR RECALC

    requestAnimationFrame(() => {

        const panel =
            document.getElementById(
                "panel"
            );

        if (panel) {

            panel.scrollTop += 1;
        }
    });
}

// =====================
// 🔥 WORKSPACE MENU
// =====================

function toggleWorkspaceMenu() {

    const menu =
        document.getElementById(
            "workspaceMenu"
        );

    const button =
        document.getElementById(
            "workspaceSwitcherBtn"
        );

    const chevron =
        button?.querySelector(
            ".workspace-switcher-chevron"
        );

    if (!menu) {
        return;
    }

    const isOpen =
        menu.style.display === "block";

    closeUserMenu();

    menu.style.display =
        isOpen
            ? "none"
            : "block";

    if (button) {
        button.classList.toggle(
            "menu-open",
            !isOpen
        );
        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    }

    if (chevron) {
        chevron.textContent =
            !isOpen ? "▲" : "▼";
    }
}

function closeWorkspaceMenu() {

    const menu =
        document.getElementById(
            "workspaceMenu"
        );

    const button =
        document.getElementById(
            "workspaceSwitcherBtn"
        );

    const chevron =
        button?.querySelector(
            ".workspace-switcher-chevron"
        );

    if (menu) {
        menu.style.display = "none";
    }

    if (button) {
        button.classList.remove(
            "menu-open"
        );
        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (chevron) {
        chevron.textContent = "▼";
    }
}

window.toggleWorkspaceMenu =
    toggleWorkspaceMenu;

window.closeWorkspaceMenu =
    closeWorkspaceMenu;


// =====================
// 👤 USER ACCOUNT MENU
// =====================

function toggleUserMenu() {

    const menu =
        document.getElementById(
            "userAccountMenu"
        );

    const button =
        document.getElementById(
            "userAccountBtn"
        );

    const chevron =
        button?.querySelector(
            ".user-account-chevron"
        );

    if (!menu) {
        return;
    }

    const isOpen =
        menu.style.display === "block";

    closeWorkspaceMenu();

    menu.style.display =
        isOpen
            ? "none"
            : "block";

    if (button) {
        button.classList.toggle(
            "menu-open",
            !isOpen
        );
        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    }

    if (chevron) {
        chevron.textContent =
            !isOpen ? "▲" : "▼";
    }
}

function closeUserMenu() {

    const menu =
        document.getElementById(
            "userAccountMenu"
        );

    const button =
        document.getElementById(
            "userAccountBtn"
        );

    const chevron =
        button?.querySelector(
            ".user-account-chevron"
        );

    if (menu) {
        menu.style.display = "none";
    }

    if (button) {
        button.classList.remove(
            "menu-open"
        );
        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (chevron) {
        chevron.textContent = "▼";
    }
}

window.toggleUserMenu =
    toggleUserMenu;

window.closeUserMenu =
    closeUserMenu;

// =====================
// 🖱️ CLOSE MENUS ON OUTSIDE CLICK
// =====================

document.addEventListener(
    "click",
    (event) => {

        const clickedWorkspace =
            event.target.closest(
                ".workspace-selector"
            );

        const clickedUser =
            event.target.closest(
                ".user-selector"
            );

        if (
            clickedWorkspace ||
            clickedUser
        ) {
            return;
        }

        closeWorkspaceMenu();
        closeUserMenu();
    }
);

// =====================
// 🔥 EXPORT
// =====================

window.toggleAdvancedSources =
    toggleAdvancedSources;

window.setAppMode =
    setAppMode;

window.isHomeMode =
    isHomeMode;

window.isBusinessMode =
    isBusinessMode;

window.updateModeUI =
    updateModeUI;

window.updateAppGuideText =
    updateAppGuideText;

// =====================
// 🔥 GUIDE DISPATCHER
// =====================

window.updateGuideText = function () {

    if (AppMode.current === "business") {

        window.updateBusinessGuideText?.();

    } else {

        window.updateAppGuideText?.();

    }

};

window.updateWellnessCard =
    updateWellnessCard;

window.showPremiumModal =
    showPremiumModal;

window.toggleAdvancedSources =
    toggleAdvancedSources;

window.loadBusinessDemoExperience =
    loadBusinessDemoExperience;

