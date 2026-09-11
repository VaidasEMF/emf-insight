// =====================
// 🔥 APP MODE
// =====================

window.AppMode = {

    current: "home"
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


    // ==================================================
    // SAVE PREVIOUS BUSINESS PROJECT ID
    // ==================================================
    //
    // BUSINESS uses a persisted server project ID.
    //
    // HOME does NOT automatically persist
    // AppState.project.id as home_project_id.
    //
    // ==================================================

    if (
        previousProjectId &&
        previousMode === "business"
    ) {

        localStorage.setItem(
            "business_project_id",
            String(
                previousProjectId
            )
        );

        console.error(
            "🔥 BUSINESS PROJECT ID PERSISTED",
            {
                businessProjectId:
                    String(
                        previousProjectId
                    )
            }
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
    // TARGET BUSINESS PROJECT ID
    // ==================================================

    const targetProjectId =
        mode === "business"
            ? localStorage.getItem(
                "business_project_id"
            )
            : null;


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

        const homeProject =
            AppState.homeProject ||
            null;


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
            isHome
                ? "none"
                : "inline-flex";
    }


    if (homeCheck) {

        homeCheck.style.display =
            isHome
                ? "inline-flex"
                : "none";
    }


    // ==================================================
    // BUSINESS
    // ==================================================

    if (
        mode === "business"
    ) {

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

        updateProjectHeader?.();

        updateWorkflowUI?.();

        updateHomeWorkflow?.();

        updateHomeLocks?.();

        updateHomeEmptyPlanState?.();

        updateCurrentExposure?.();


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


    // ==================================================
    // GENERAL UI
    // ==================================================

    updateWorkspaceUI?.();

    updateHomeWorkflow?.();

    updateHomeLocks?.();

    updateHomeEmptyPlanState?.();

    updateProjectHeader?.();

    updateWorkflowUI?.();

    updateCurrentExposure?.();


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



function updateWorkspaceUI() {

    const mode =
        window.AppMode?.current ||
        "home";


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
                        hasActiveProject
                            ? "🏢 Business Project"
                            : "🏢 Business Survey"
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
        .querySelectorAll(
            ".home-only"
        )
        .forEach(
            el => {

                el.style.display =
                    mode === "home"
                        ? ""
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
        mode === "business" &&
        hasActiveProject
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

    const rooms =
        window.roomTool?.rooms || [];

    if (rooms.length === 0) {

        card.style.display =
            "none";

        return;
    }

    card.style.display =
        "block";

    const totalRisk =

        calculateHouseExposure();

    // =====================
    // 🔥 SCORE
    // =====================

    let score =

        Math.max(
            5,
            100 - totalRisk * 4
        );

    score =
        Math.round(score);

    const hudRisk =
        document.getElementById(
            "hudRisk"
        );

    if (hudRisk) {

        let riskLabel = "SAFE";

        if (totalRisk > 8) {

            label =
                "MODERATE";
        }

        if (totalRisk > 16) {

            label =
                "HIGH";
        }

        if (totalRisk > 26) {

            label =
                "VERY HIGH";
        }

        hudRisk.innerText =

            "Risk: " +
            label +
            " (" +
            totalRisk +
            ")";

        if (
            hudRisk.innerText
                .trim()
                .length === 0
        ) {

            hudRisk.style.display =
                "none";
        }
        else {

            hudRisk.style.display =
                "block";
        }
    }

    document.getElementById(
        "wellnessScore"
    ).innerHTML =

        score + "/100";

    // =====================
    // 🔥 SUMMARY
    // =====================

    let summary =

        "Your home currently shows low wellness concern.";

    if (score < 80) {

        summary =

            "Some rooms may benefit from wellness optimization.";
    }

    if (score < 60) {

        summary =

            "Elevated wellness hotspots detected in key areas.";
    }

    document.getElementById(
        "wellnessSummary"
    ).innerHTML =

        summary;
}

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

