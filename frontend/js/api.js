console.error("🔥🔥🔥 API.JS TOP");

console.error(
    "🔥🔥🔥 API.JS EXECUTION START"
);

const API =
    "https://emf-insight.onrender.com";

// =====================
// 🔥 AUTH HEADERS
// =====================

function getAuthHeaders() {

    const token =
        localStorage.getItem(
            "token"
        );

    const headers = {

        "Content-Type":
            "application/json"
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}

// =====================================================
// 🔥 CREATE NEW PROJECT
// =====================================================

async function createProject(options = {}) {

    console.log(
        "================================="
    );

    console.log(
        "🔥 CREATE NEW PROJECT START"
    );

    // ==================================================
    // PROJECT TYPE
    // ==================================================

    const projectType =
        options.type ||
        window.AppMode?.current ||
        "business";


    if (!options.confirmed) {
        openCreateProjectNamePopup(projectType);
        return;
    }

    const projectName =
        String(options.name || "").trim();

    if (!projectName) {
        return;
    }



    // ==================================================
    // 🔥 CREATE FRONTEND PROJECT MODEL FIRST
    // ==================================================
    //
    // createProjectModel() already creates the
    // initial Main Floor.
    //
    // ==================================================

    const newProject =
        createProjectModel(
            projectType
        );

    // ==================================================
    // PROJECT NAME
    // ==================================================

    newProject.name =
        projectName;

    // ==================================================
    // SAFETY
    // ==================================================

    if (
        !Array.isArray(
            newProject.floors
        )
    ) {

        newProject.floors =
            [];
    }

    if (
        !Array.isArray(
            newProject.outdoorSources
        )
    ) {

        newProject.outdoorSources =
            [];
    }

    newProject.currentFloorIndex =
        0;

    // ==================================================
    // DEBUG BEFORE SERVER CREATE
    // ==================================================

    console.error(
        "🔥🔥🔥 PROJECT MODEL BEFORE SERVER CREATE",
        {
            projectType,

            projectName,

            floors:
                newProject
                    .floors
                    ?.length ||
                0,

            firstFloor:
                newProject
                    .floors?.[0]
                    ? {
                        id:
                            newProject
                                .floors[0]
                                .id,

                        name:
                            newProject
                                .floors[0]
                                .name,

                        assessmentContext:
                            newProject
                                .floors[0]
                                .assessmentContext
                    }
                    : null
        }
    );

    // ==================================================
    // CREATE ON SERVER
    // ==================================================

    let res;

    try {

        // ==================================================
        // AUTH DEBUG
        // ==================================================

        console.error(
            "🔥 CREATE AUTH DEBUG",
            {
                headers:
                    getAuthHeaders(),

                token:
                    localStorage.getItem(
                        "token"
                    ),

                userId:
                    localStorage.getItem(
                        "user_id"
                    )
            }
        );

        // ==================================================
        // SERVER CREATE
        // ==================================================

        res =
            await fetch(
                `${API}/projects`,
                {
                    method:
                        "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            name:
                                projectName,

                            type:
                                projectType,

                            data:
                                newProject
                        })
                }
            );

    }
    catch (
    err
    ) {

        console.error(
            "🔥 CREATE PROJECT NETWORK ERROR",
            err
        );

        throw err;
    }

    // ==================================================
    // HTTP ERROR
    // ==================================================

    if (
        !res.ok
    ) {

        let errorData =
            null;

        try {

            errorData =
                await res.json();

        }
        catch (_) {
            // ignore
        }

        console.error(
            "🔥 CREATE PROJECT FAILED",
            {
                status:
                    res.status,

                statusText:
                    res.statusText,

                error:
                    errorData
            }
        );

        throw new Error(
            `Create project failed: ${res.status}`
        );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    const data =
        await res.json();

    console.log(
        "🔥 CREATE PROJECT RESPONSE",
        data
    );

    // ==================================================
    // SERVER ID
    // ==================================================

    const projectId =
        data.project_id ??
        data.id ??
        data.data?.project_id ??
        data.data?.id;

    if (
        !projectId
    ) {

        console.error(
            "🔥 CREATE PROJECT INVALID RESPONSE",
            data
        );

        throw new Error(
            "Server did not return project ID"
        );
    }

    // ==================================================
    // SERVER ID
    // ==================================================

    newProject.project_id =
        projectId;

    newProject.id =
        projectId;

    // ==================================================
    // PROJECT TYPE
    // ==================================================

    newProject.type =
        projectType;

    newProject.projectType =
        projectType;

    // ==================================================
    // PROJECT NAME
    // ==================================================

    newProject.name =
        projectName;

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    newProject.currentFloorIndex =
        0;

    // ==================================================
    // ACTIVE PROJECT
    // ==================================================

    AppState.project =
        newProject;

    // ==================================================
    // COMPATIBILITY WORKSPACE
    // ==================================================

    if (
        projectType ===
        "home"
    ) {

        AppState.homeProject =
            newProject;

    }
    else {

        AppState.businessProject =
            newProject;
    }

    // ==================================================
    // APP MODE
    // ==================================================

    if (
        window.AppMode
    ) {

        window.AppMode.current =
            projectType;
    }

    // ==================================================
    // CURRENT PROJECT ID
    // ==================================================

    currentProjectId =
        projectId;

    // ==================================================
    // PROJECT ID STORAGE
    // ==================================================

    if (
        projectType ===
        "home"
    ) {

        localStorage.setItem(
            "home_project_id",
            String(
                projectId
            )
        );

    }
    else {

        localStorage.setItem(
            "business_project_id",
            String(
                projectId
            )
        );
    }

    // ==================================================
    // LEGACY PROJECT ID
    // ==================================================

    localStorage.setItem(
        "project_id",
        String(
            projectId
        )
    );

    localStorage.setItem(
        "workspaceMode",
        projectType
    );


    // ==================================================
    // CLEAR OLD RUNTIME IMAGE
    // ==================================================

    window.planImage =
        null;

    window.currentRoom =
        null;

    window.currentZone =
        null;

    window.selectedSource =
        null;

    window.selectedGridPoint =
        null;

    window.hoveredRoom =
        null;

    window.activeRoom =
        null;

    window.draggingSource =
        null;

    window.roomDrawing =
        false;

    window.gridPreview =
        null;

    window.measurePreview =
        null;


    // ==================================================
    // RESET UI STATE
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


    // ==================================================
    // RESET SCALE TOOL
    // ==================================================

    if (
        window.scaleTool
    ) {

        window.scaleTool.active =
            false;

        window.scaleTool.points =
            [];

        window.scaleTool.calibrated =
            false;

        window.scaleTool.metersPerPixel =
            0;
    }


    // ==================================================
    // RESET OBJECT TOOL
    // ==================================================

    if (
        window.objectTool
    ) {

        window.objectTool.currentType =
            null;
    }


    // ==================================================
    // 🔥 SHOW CORRECT PLAN ACTIONS
    // ==================================================
    //
    // HOME:
    //
    //     homePlanActions
    //         Upload Floor Plan
    //         Take a Photo
    //
    // BUSINESS:
    //
    //     businessPlanActions
    //         Upload Floor Plan
    //         Take a Photo
    //
    // NEVER show both.
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


    // ==================================================
    // HOME
    // ==================================================

    if (
        projectType ===
        "home"
    ) {

        if (
            homePlanActions
        ) {

            homePlanActions.style.display =
                "block";

            homePlanActions.style.position =
                "static";

            homePlanActions.style.top =
                "auto";

            homePlanActions.style.bottom =
                "auto";

            homePlanActions.style.left =
                "auto";

            homePlanActions.style.right =
                "auto";

            homePlanActions.style.height =
                "auto";

            homePlanActions.style.minHeight =
                "0";

            homePlanActions.style.maxHeight =
                "none";

            homePlanActions.style.marginTop =
                "0";

            homePlanActions.style.marginBottom =
                "10px";

            homePlanActions.style.boxSizing =
                "border-box";

            homePlanActions.style.overflow =
                "visible";
        }


        if (
            businessPlanActions
        ) {

            businessPlanActions.style.display =
                "none";
        }

    }


    // ==================================================
    // BUSINESS
    // ==================================================

    else {

        if (
            businessPlanActions
        ) {

            businessPlanActions.style.display =
                "block";

            businessPlanActions.style.position =
                "static";

            businessPlanActions.style.top =
                "auto";

            businessPlanActions.style.bottom =
                "auto";

            businessPlanActions.style.left =
                "auto";

            businessPlanActions.style.right =
                "auto";

            businessPlanActions.style.height =
                "auto";

            businessPlanActions.style.minHeight =
                "0";

            businessPlanActions.style.maxHeight =
                "none";

            businessPlanActions.style.marginTop =
                "0";

            businessPlanActions.style.marginBottom =
                "10px";

            businessPlanActions.style.boxSizing =
                "border-box";

            businessPlanActions.style.overflow =
                "visible";
        }


        if (
            homePlanActions
        ) {

            homePlanActions.style.display =
                "none";
        }
    }


    // ==================================================
    // SET SCALE REMAINS HIDDEN
    // UNTIL A FLOOR PLAN EXISTS
    // ==================================================

    const scaleBtn =
        projectType === "home"

            ? document.getElementById(
                "homeBtnScale"
            )

            : document.getElementById(
                "btnScale"
            );


    if (
        scaleBtn
    ) {

        scaleBtn.style.display =
            "none";
    }


    // ==================================================
    // UI
    // ==================================================

    updateWorkspaceUI?.();

    updateHomeProjectDisplayName?.();

    updateHomeWorkflow?.();

    updateHomeLocks?.();

    updateHomeEmptyPlanState?.();


    if (
        projectType ===
        "home"
    ) {

        renderHomeFloorTabs?.();

    }
    else {

        renderBusinessFloorTabs?.();
    }


    renderFloorTabs?.();

    updateProjectHeader?.();

    updateWorkflowUI?.();

    updateCurrentExposure?.();


    // ==================================================
    // RENDER
    // ==================================================

    resizeCanvasSafe?.();

    requestRender?.();


    // ==================================================
    // FINAL DEBUG
    // ==================================================

    console.error(
        "🔥 NEW PROJECT CREATED",
        {
            projectId,

            type:
                projectType,

            name:
                projectName,

            currentProjectId,

            floors:
                newProject
                    .floors
                    ?.length ||
                0,

            rooms:
                newProject
                    .floors
                    ?.reduce(
                        (
                            total,
                            floor
                        ) =>
                            total +
                            (
                                floor.rooms
                                    ?.length ||
                                0
                            ),
                        0
                    ) ||
                0,

            activeProject:
                AppState.project ===
                    newProject
                    ? "NEW PROJECT"
                    : "ERROR"
        }
    );


    console.log(
        "🔥 CREATE NEW PROJECT COMPLETE",
        {
            projectId,
            projectType
        }
    );

    console.log(
        "================================="
    );

    return projectId;
}

// =====================
// 🔥 SAVE PROJECT
// =====================

async function saveProject() {

    // =====================
    // 🔥 ACTIVE PROJECT ID
    // =====================

    const activeProjectId =
        AppState.project
            ?.project_id ??
        AppState.project
            ?.id ??
        currentProjectId ??
        null;

    console.log(
        "🔥 SAVE PROJECT",
        {
            activeProjectId,

            globalProjectId:
                currentProjectId ??
                null
        }
    );

    // ==================================================
    // 🔒 SAVE MUST NEVER CREATE A PROJECT
    // ==================================================

    if (
        !activeProjectId
    ) {

        console.warn(
            "⚠️ SAVE SKIPPED — NO ACTIVE PROJECT"
        );

        return false;
    }

    // ==================================================
    // 🔥 SYNC CURRENT PROJECT ID
    // ==================================================

    currentProjectId =
        activeProjectId;

    try {
        console.error("SAVE FLOOR OBJECT");

        console.error(
            AppState.project.floors[0]
        );

        console.log("===== 🔥APPSTATE BEFORE SAVE =====");

        const floor = AppState.project.floors[0];

        console.log("Floor keys:", Object.keys(floor));

        console.log("Canvas:", floor.canvasWidth, floor.canvasHeight);

        floor.zones.forEach(z => {
            console.log(
                "ZONE:", z.id,
                "keys:", Object.keys(z),
                "grid:", z.grid?.length,
                "gridDetail:", z.gridDetail?.length,
                "measurements:", z.measurements?.length
            );
        });

        // =====================================================
        // 🔥 PHI PROJECT DATA
        // =====================================================
        //
        // Save the complete active project.
        //
        // IMPORTANT:
        // AppState.project already contains the canonical
        // PHI identity:
        //
        //     propertyId
        //     assessmentId
        //     assessmentContext
        //     floors
        //     etc.
        //
        // We must persist the complete project object instead
        // of rebuilding a reduced legacy object containing only
        // floors / image / project_id.
        //
        // =====================================================

        const projectData = {

            ...AppState.project,

            // =================================================
            // PROPERTY CONTEXT
            // =================================================

            propertyId:
                AppState.project.propertyId ||
                AppState.property?.id ||
                null,

            propertyHealthRecordId:
                AppState.project.propertyHealthRecordId ||
                AppState.property?.propertyHealthRecordId ||
                null,

            // =================================================
            // ASSESSMENT CONTEXT
            // =================================================

            assessmentId:
                AppState.project.assessmentId ||
                null,

            assessmentContext:
                AppState.project.assessmentContext ||
                null,

            // =================================================
            // FLOORS
            // =================================================

            floors:
                Array.isArray(
                    AppState.project.floors
                )
                    ? AppState.project.floors
                    : [],

            // =================================================
            // PROJECT ID
            // =================================================

            project_id:
                currentProjectId || null
        };






        const room =
            AppState.project.floors[0]
                ?.rooms?.[0];

        if (room) {

            console.error(
                "ROOM BEFORE JSON",
                JSON.stringify(room.polygon)
            );

        }

        console.error(
            "CANVAS",
            AppState.project.floors[0].canvasWidth,
            AppState.project.floors[0].canvasHeight
        );


        console.error(
            "🔥🔥🔥 SAVE PROJECT DATA",
            {
                propertyId:
                    projectData.propertyId,

                propertyHealthRecordId:
                    projectData.propertyHealthRecordId,

                assessmentId:
                    projectData.assessmentId,

                assessmentContext:
                    projectData.assessmentContext,

                floors:
                    projectData.floors?.length,

                rooms:
                    projectData.floors?.[0]?.rooms?.length,

                zones:
                    projectData.floors?.[0]?.zones?.length,

                zoneIds:
                    projectData.floors?.[0]?.zones?.map(
                        z => z?.id
                    ),

                sources:
                    projectData.floors?.[0]?.sources?.length
            }
        );

        console.error(
            "🔥🔥🔥 IMAGE DATA AT SAVE",
            projectData.floors.map(
                floor => ({
                    floorId:
                        floor?.id,

                    floorName:
                        floor?.name,

                    imageDataExists:
                        !!floor?.imageData,

                    imageDataLength:
                        floor?.imageData?.length || 0,

                    imageFileName:
                        floor?.imageFileName,

                    imageWidth:
                        floor?.image?.width ?? null,

                    imageHeight:
                        floor?.image?.height ?? null
                })
            )
        );

        for (
            const floor of projectData.floors
        ) {

            if (!floor?.imageData) {
                continue;
            }

            const testImg =
                new Image();

            testImg.onload = () => {

                console.error(
                    "🔥🔥🔥 IMAGE DATA SIZE AT SAVE",
                    {
                        floor:
                            floor.name,

                        floorId:
                            floor.id,

                        width:
                            testImg.naturalWidth,

                        height:
                            testImg.naturalHeight,

                        imageDataLength:
                            floor.imageData.length
                    }
                );
            };

            testImg.src =
                floor.imageData;
        }

        const res = await fetch(

            `${API}/project/save`,

            {
                method: "POST",

                headers:
                    getAuthHeaders(),

                body: JSON.stringify({

                    project_id:
                        currentProjectId,

                    data:
                        projectData
                })
            }
        );

        const data =
            await res.json();

        if (data.project_id) {

            currentProjectId =
                data.project_id;

            localStorage.setItem(
                "project_id",
                currentProjectId
            );

            console.log(
                "PROJECT SAVED"
            );

            return true;
        }

        else {

            console.error(
                "❌ PROJECT SAVE FAILED",
                data
            );

            return false;
        }



    }

    catch (err) {

        console.error(
            "❌ SAVE PROJECT ERROR",
            err
        );

        return false;
    }
}

async function loadProjectList() {

    console.log("=================================");
    console.log("🔥 LOAD PROJECT LIST START");

    try {

        const currentMode =
            window.AppMode?.current ||
            "business";

        console.log(
            "🔥 PROJECT LIST MODE",
            { currentMode }
        );


        const projectListStart =
            performance.now();

        console.log(
            "⏱️ PROJECT LIST REQUEST START"
        );

        const res =
            await fetch(
                `${API}/projects/me`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: getAuthHeaders()
                }
            );

        console.log(
            "⏱️ PROJECT LIST FETCH DONE",
            Math.round(
                performance.now() -
                projectListStart
            ) + " ms"
        );


        if (!res.ok) {

            console.error(
                "🔥 PROJECT LIST FAILED",
                {
                    status: res.status,
                    statusText: res.statusText
                }
            );

            return [];
        }


        const response =
            await res.json();


        console.log(
            "⏱️ PROJECT LIST JSON DONE",
            Math.round(
                performance.now() -
                projectListStart
            ) + " ms"
        );


        const allProjects =
            Array.isArray(response)
                ? response
                : response.projects ||
                response.data ||
                [];


        console.log(
            "🔥 ALL PROJECTS FOUND",
            {
                count: allProjects.length,
                projects: allProjects
            }
        );


        function getProjectType(project) {

            const data =
                project?.data &&
                    typeof project.data === "object"
                    ? project.data
                    : {};


            const nestedProject =
                data?.project &&
                    typeof data.project === "object"
                    ? data.project
                    : {};


            const nestedAssessment =
                data?.assessment &&
                    typeof data.assessment === "object"
                    ? data.assessment
                    : {};


            const type =
                project?.type ||
                project?.project_type ||
                project?.projectType ||
                data?.type ||
                data?.project_type ||
                data?.projectType ||
                nestedProject?.type ||
                nestedProject?.project_type ||
                nestedProject?.projectType ||
                nestedAssessment?.type ||
                nestedAssessment?.project_type ||
                nestedAssessment?.projectType ||
                "";


            return String(type)
                .toLowerCase()
                .trim();
        }


        allProjects.forEach(project => {



        });


        /*
         * FILTER BY CURRENT WORKSPACE
         */

        const projects =
            allProjects.filter(project => {

                const projectType =
                    getProjectType(project);

                return (
                    projectType ===
                    currentMode
                );
            });


        console.log(
            "🔥 PROJECTS AFTER TYPE FILTER",
            {
                mode: currentMode,
                count: projects.length,
                projects
            }
        );


        const container =
            document.getElementById(
                "projects"
            );


        if (!container) {

            console.error(
                "🔥 PROJECT LIST CONTAINER NOT FOUND"
            );

            return projects;
        }


        /*
         * EMPTY STATE
         */

        if (projects.length === 0) {

            const emptyTitle =
                currentMode === "home"
                    ? "No Home projects yet"
                    : "No Business projects yet";


            const emptySubtitle =
                currentMode === "home"
                    ? "Create your first Home Wellness project."
                    : "Create your first Business Survey project.";


            const newProjectSubtitle =
                currentMode === "home"
                    ? "Start a new Home Wellness project"
                    : "Start a new Business Survey project";


            container.innerHTML = `
        <div class="project-empty-state">

            <div class="project-empty-icon">
                📂
            </div>


            <div class="project-empty-title">
                ${emptyTitle}
            </div>


            <div class="project-empty-subtitle">
                ${emptySubtitle}
            </div>


            <button
                type="button"
                class="project-empty-new-btn"
                onclick="
                    event.preventDefault();
                    event.stopPropagation();

                    closeProjectMenu?.();

                    createProject?.();
                "
            >

                <span class="project-empty-new-icon">
                    ＋
                </span>


                <span class="project-empty-new-content">

                    <span class="project-empty-new-title">
                        New Project
                    </span>

                    <span class="project-empty-new-subtitle">
                        ${newProjectSubtitle}
                    </span>

                </span>

            </button>

        </div>
    `;


            return projects;
        }


        /*
         * SORT
         */

        const sortSelect =
            document.getElementById(
                "projectSortSelect"
            );


        const sortMode =
            sortSelect?.value ||
            "newest";


        function getProjectName(project) {

            const data =
                project?.data &&
                    typeof project.data === "object"
                    ? project.data
                    : {};


            return (
                project?.name ||
                data?.name ||
                (
                    currentMode === "home"
                        ? "Home Wellness Project"
                        : "Business Survey Project"
                )
            );
        }


        function getProjectTimestamp(project) {

            const data =
                project?.data &&
                    typeof project.data === "object"
                    ? project.data
                    : {};


            const value =
                project?.created_at ||
                project?.createdAt ||
                data?.created_at ||
                data?.createdAt ||
                null;


            if (!value) {
                return 0;
            }


            const timestamp =
                new Date(value).getTime();


            return Number.isNaN(timestamp)
                ? 0
                : timestamp;
        }


        function getProjectId(project) {

            return (
                project?.id ??
                project?.project_id ??
                0
            );
        }


        const sortedProjects =
            [...projects].sort(
                (a, b) => {

                    if (
                        sortMode ===
                        "name_asc"
                    ) {

                        return getProjectName(a)
                            .localeCompare(
                                getProjectName(b),
                                undefined,
                                {
                                    sensitivity:
                                        "base"
                                }
                            );
                    }


                    if (
                        sortMode ===
                        "name_desc"
                    ) {

                        return getProjectName(b)
                            .localeCompare(
                                getProjectName(a),
                                undefined,
                                {
                                    sensitivity:
                                        "base"
                                }
                            );
                    }


                    /*
                     * If backend provides created_at,
                     * use it.
                     *
                     * Otherwise fall back to
                     * project ID.
                     */

                    const dateA =
                        getProjectTimestamp(a);

                    const dateB =
                        getProjectTimestamp(b);


                    if (
                        dateA !== 0 ||
                        dateB !== 0
                    ) {

                        if (
                            sortMode ===
                            "oldest"
                        ) {

                            return (
                                dateA -
                                dateB
                            );
                        }

                        return (
                            dateB -
                            dateA
                        );
                    }


                    const idA =
                        Number(
                            getProjectId(a)
                        ) || 0;

                    const idB =
                        Number(
                            getProjectId(b)
                        ) || 0;


                    if (
                        sortMode ===
                        "oldest"
                    ) {

                        return idA - idB;
                    }


                    return idB - idA;
                }
            );


        /*
         * RENDER
         */

        container.innerHTML =
            sortedProjects
                .map(project => {

                    const projectId =
                        getProjectId(project);


                    if (
                        projectId ===
                        null ||
                        projectId ===
                        undefined
                    ) {

                        return "";
                    }


                    const projectName =
                        getProjectName(
                            project
                        );

                    const cleanProjectName =
                        String(projectName)
                            .replace(
                                /^[\s🏠🏢🏭🏬🏢📱📡🏠🏢]+\s*/,
                                ""
                            )
                            .trim();


                    const projectType =
                        getProjectType(
                            project
                        );


                    const isHome =
                        projectType ===
                        "home";


                    const typeLabel =
                        isHome
                            ? "Home Wellness"
                            : "Business Survey";





                    const createdAt =
                        project?.created_at ||
                        project?.createdAt ||
                        project?.data?.created_at ||
                        project?.data?.createdAt ||
                        "";


                    let dateHtml = "";


                    if (createdAt) {

                        let formattedDate =
                            createdAt;


                        const date =
                            new Date(
                                createdAt
                            );


                        if (
                            !Number.isNaN(
                                date.getTime()
                            )
                        ) {

                            formattedDate =
                                date.toLocaleDateString(
                                    undefined,
                                    {
                                        year:
                                            "numeric",

                                        month:
                                            "short",

                                        day:
                                            "numeric"
                                    }
                                );
                        }


                        dateHtml = `
                            <span>
                                ${formattedDate}
                            </span>
                        `;
                    }


                    return `
                        <div
                            class="open-project-item"
                            data-project-id="${projectId}"
                        >

                            <div class="open-project-info">

                               <div class="open-project-name">

    <span class="project-name-text">
        ${cleanProjectName}
    </span>

</div>

                                <div class="open-project-meta">

                                    <span>
                                        ${typeLabel}
                                    </span>

                                    <span>
                                        Project #${projectId}
                                    </span>

                                    ${dateHtml}

                                </div>

                            </div>


                            <div class="open-project-actions">

                                <button
    type="button"
    class="project-open-btn"
    onclick="
        event.preventDefault();
        event.stopPropagation();

        openExistingProject(
            ${projectId}
        );
    "
>
    Open
</button>

<button
    type="button"
    class="project-rename-btn"
    onclick="
        event.preventDefault();
        event.stopPropagation();

        renameProjectFromList(
            ${projectId}
        );
    "
>
    Rename
</button>

<button
    type="button"
    class="project-delete-btn"
    onclick="
        event.preventDefault();
        event.stopPropagation();

        deleteProjectFromList(
            ${projectId}
        );
    "
>
    Delete
</button>

                            </div>

                        </div>
                    `;
                })
                .join("");


        /*
         * SORT CHANGE
         */

        if (sortSelect) {

            if (
                !sortSelect.dataset.bound
            ) {

                sortSelect.dataset.bound =
                    "1";


                sortSelect.addEventListener(
                    "change",
                    () => {

                        loadProjectList();

                    }
                );
            }
        }


        console.log(
            "🔥 PROJECT LIST RENDERED",
            {
                mode: currentMode,
                sortMode,
                count:
                    sortedProjects.length
            }
        );


        return sortedProjects;

    }
    catch (err) {

        console.error(
            "🔥 LOAD PROJECT LIST ERROR",
            err
        );

        return [];
    }
}

async function openExistingProject(
    projectId
) {

    console.log(
        "================================="
    );

    console.log(
        "🔥 OPEN EXISTING PROJECT START",
        {
            projectId
        }
    );


    if (
        !projectId
    ) {

        console.error(
            "❌ INVALID PROJECT ID"
        );

        return false;
    }


    try {

        // ==================================================
        // FETCH PROJECT
        // ==================================================

        const res =
            await fetch(
                `${API}/project/${projectId}`,
                {
                    method:
                        "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            !res.ok
        ) {

            console.error(
                "❌ PROJECT FETCH FAILED",
                {
                    projectId,
                    status:
                        res.status,
                    statusText:
                        res.statusText
                }
            );

            alert(
                "Unable to open this project."
            );

            return false;
        }


        const response =
            await res.json();


        console.log(
            "🔥 OPEN PROJECT RAW RESPONSE",
            response
        );


        const project =
            response.data ||
            response.project ||
            response;


        if (
            !project
        ) {

            console.error(
                "❌ PROJECT DATA NOT FOUND",
                {
                    projectId
                }
            );

            return false;
        }


        // ==================================================
        // PROJECT TYPE
        // ==================================================

        const projectType =
            project.type ||
            project.project_type ||
            project.projectType ||
            "";


        console.log(
            "🔥 OPEN PROJECT TYPE",
            {
                projectId,
                projectType
            }
        );


        // ==================================================
        // BUSINESS
        // ==================================================

        if (
            projectType ===
            "business"
        ) {

            console.log(
                "🔥 OPENING BUSINESS PROJECT",
                {
                    projectId
                }
            );


            const loaded =
                await window.loadProject(
                    projectId
                );


            if (
                !loaded
            ) {

                console.error(
                    "❌ BUSINESS PROJECT LOAD FAILED",
                    {
                        projectId
                    }
                );

                // IMPORTANT:
                // Do NOT close popup here.

                alert(
                    "Unable to open this Business project."
                );

                return false;
            }


            // ------------------------------------------------
            // BUSINESS SUCCESS
            // ------------------------------------------------

            updateWorkspaceUI?.();

            updateProjectHeader?.();

            updateWorkflowUI?.();

            updateCurrentExposure?.();

            requestRender?.();


            const popup =
                document.getElementById(
                    "openProjectPopup"
                );


            if (
                popup
            ) {

                popup.style.display =
                    "none";
            }


            console.log(
                "🔥 BUSINESS PROJECT OPEN COMPLETE",
                {
                    projectId
                }
            );


            console.log(
                "================================="
            );


            return true;
        }


        // ==================================================
        // HOME
        // ==================================================

        if (
            projectType ===
            "home"
        ) {

            console.log(
                "🔥 OPENING HOME PROJECT",
                {
                    projectId
                }
            );


            const loadedProjectId =
                project.project_id ??
                project.id ??
                projectId;


            project.project_id =
                loadedProjectId;


            project.id =
                loadedProjectId;


            // ------------------------------------------------
            // HOME NORMALIZATION
            // ------------------------------------------------

            if (
                !Array.isArray(
                    project.floors
                )
            ) {

                project.floors =
                    [];
            }


            if (
                !Array.isArray(
                    project.outdoorSources
                )
            ) {

                project.outdoorSources =
                    [];
            }


            // ------------------------------------------------
            // HOME ACTIVE PROJECT
            // ------------------------------------------------

            AppState.homeProject =
                project;


            AppState.project =
                project;


            window.project =
                project;


            currentProjectId =
                null;


            // ------------------------------------------------
            // HOME PROJECT ID
            // ------------------------------------------------

            localStorage.setItem(
                "home_project_id",
                String(
                    loadedProjectId
                )
            );


            // ------------------------------------------------
            // HOME MODE
            // ------------------------------------------------

            window.AppMode.current =
                "home";


            localStorage.setItem(
                "workspaceMode",
                "home"
            );


            // ------------------------------------------------
            // CURRENT FLOOR
            // ------------------------------------------------

            if (
                project.floors.length >
                0
            ) {

                const savedIndex =
                    project.currentFloorIndex;


                if (
                    savedIndex ===
                    undefined ||
                    savedIndex ===
                    null ||
                    savedIndex < 0 ||
                    savedIndex >=
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


            // ------------------------------------------------
            // RESET IMAGE RUNTIME
            // ------------------------------------------------

            window.planImage =
                null;


            if (
                typeof planImage !==
                "undefined"
            ) {

                planImage =
                    null;
            }


            // ------------------------------------------------
            // LOAD CURRENT FLOOR
            // ------------------------------------------------

            const floor =
                getCurrentFloor?.();


            if (
                floor
            ) {

                console.log(
                    "🔥 HOME FLOOR RESTORE",
                    {
                        floorId:
                            floor.id,

                        floorName:
                            floor.name,

                        hasImage:
                            !!floor.image,

                        hasImageData:
                            !!floor.imageData
                    }
                );


                loadFloorImage(
                    floor
                );
            }


            // ------------------------------------------------
            // HOME UI
            // ------------------------------------------------

            updateWorkspaceUI?.();

            updateProjectHeader?.();

            updateWorkflowUI?.();

            updateHomeWorkflow?.();

            updateHomeLocks?.();

            updateHomeEmptyPlanState?.();

            renderHomeFloorTabs?.();

            renderFloorTabs?.();

            updateCurrentExposure?.();


            // ------------------------------------------------
            // RENDER
            // ------------------------------------------------

            requestRender?.();


            // ------------------------------------------------
            // CLOSE ONLY AFTER SUCCESS
            // ------------------------------------------------

            const popup =
                document.getElementById(
                    "openProjectPopup"
                );


            if (
                popup
            ) {

                popup.style.display =
                    "none";
            }


            console.log(
                "🔥 HOME PROJECT OPEN COMPLETE",
                {
                    projectId:
                        loadedProjectId,

                    floors:
                        project.floors.length
                }
            );


            console.log(
                "================================="
            );


            return true;
        }


        // ==================================================
        // UNKNOWN PROJECT TYPE
        // ==================================================

        console.error(
            "❌ UNKNOWN PROJECT TYPE",
            {
                projectId,
                projectType,
                project
            }
        );


        alert(
            "This project does not contain a valid project type."
        );


        return false;

    }
    catch (
    err
    ) {

        console.error(
            "🔥 OPEN EXISTING PROJECT ERROR",
            err
        );


        // IMPORTANT:
        // Keep popup open if loading failed.

        alert(
            "Unable to open this project."
        );


        return false;
    }
}


// =====================================================
// RENAME PROJECT
// =====================================================

let pendingRenameProjectId = null;


function renameProjectFromList(projectId) {

    console.log(
        "✏️ RENAME PROJECT:",
        projectId
    );


    // ==================================================
    // FIND PROJECT ITEM
    // ==================================================

    const projectItem =
        document.querySelector(
            `.open-project-item[data-project-id="${projectId}"]`
        );


    // ==================================================
    // GET CURRENT NAME
    // ==================================================

    let currentName = "";


    if (projectItem) {

        const nameElement =
            projectItem.querySelector(
                ".project-name-text"
            );

        if (nameElement) {

            currentName =
                nameElement.textContent.trim();
        }
    }


    // ==================================================
    // FALLBACK TO ACTIVE PROJECT
    // ==================================================

    if (!currentName) {

        const activeProject =
            AppState?.project;

        if (
            activeProject &&
            String(activeProject.id) ===
            String(projectId)
        ) {

            currentName =
                String(
                    activeProject.name || ""
                ).trim();
        }
    }


    if (!currentName) {

        currentName =
            "Project";
    }


    // ==================================================
    // CLOSE OPEN PROJECT POPUP
    // ==================================================

    closeProjectMenu?.();


    // ==================================================
    // RENAME POPUP ELEMENTS
    // ==================================================

    const popup =
        document.getElementById(
            "renameProjectPopup"
        );

    const input =
        document.getElementById(
            "renameProjectNameInput"
        );

    const saveButton =
        document.getElementById(
            "renameProjectSaveButton"
        );


    if (
        !popup ||
        !input ||
        !saveButton
    ) {

        console.error(
            "❌ RENAME POPUP ELEMENTS NOT FOUND"
        );

        return;
    }


    // ==================================================
    // STORE PROJECT ID
    // ==================================================

    popup.dataset.projectId =
        String(projectId);


    // ==================================================
    // SET CURRENT NAME
    // ==================================================

    input.value =
        currentName;


    // ==================================================
    // SHOW POPUP
    // ==================================================

    popup.style.display =
        "flex";

    popup.setAttribute(
        "aria-hidden",
        "false"
    );


    // ==================================================
    // SAVE FUNCTION
    // ==================================================

    saveButton.onclick =
        async function () {

            const newName =
                String(
                    input.value || ""
                ).trim();


            if (!newName) {

                input.focus();

                return;
            }


            if (newName.length > 120) {

                input.focus();

                return;
            }


            try {

                saveButton.disabled =
                    true;


                const response =
                    await fetch(
                        `${API}/project/${projectId}`,
                        {
                            method: "PATCH",

                            headers: {
                                ...getAuthHeaders(),
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: newName
                            })
                        }
                    );


                if (!response.ok) {

                    let message =
                        "Failed to rename project";

                    try {

                        const errorData =
                            await response.json();

                        message =
                            errorData?.detail ||
                            message;

                    }
                    catch (_) { }


                    throw new Error(
                        message
                    );
                }


                // ==================================================
                // UPDATE PROJECT LIST
                // ==================================================

                if (projectItem) {

                    const nameElement =
                        projectItem.querySelector(
                            ".project-name-text"
                        );

                    if (nameElement) {

                        nameElement.textContent =
                            newName;
                    }
                }


                // ==================================================
                // UPDATE ACTIVE PROJECT
                // ==================================================

                if (
                    AppState?.project &&
                    String(
                        AppState.project.id
                    ) ===
                    String(projectId)
                ) {

                    AppState.project.name =
                        newName;
                }


                if (
                    AppState?.homeProject &&
                    String(
                        AppState.homeProject.id
                    ) ===
                    String(projectId)
                ) {

                    AppState.homeProject.name =
                        newName;
                }


                if (
                    AppState?.businessProject &&
                    String(
                        AppState.businessProject.id
                    ) ===
                    String(projectId)
                ) {

                    AppState.businessProject.name =
                        newName;
                }


                // ==================================================
                // REFRESH UI
                // ==================================================

                window.updateWorkspaceUI?.();

                window.updateHomeProjectDisplayName?.();

                window.updateHomeEmptyPlanState?.();

                window.updateProjectHeader?.();


                // ==================================================
                // CLOSE POPUP
                // ==================================================

                closeRenameProjectPopup?.();


                console.log(
                    "✏️ PROJECT RENAMED:",
                    {
                        projectId,
                        newName
                    }
                );

            }
            catch (error) {

                console.error(
                    "❌ RENAME PROJECT FAILED:",
                    error
                );

                alert(
                    error?.message ||
                    "Failed to rename project"
                );
            }
            finally {

                saveButton.disabled =
                    false;
            }
        };


    // ==================================================
    // KEYBOARD HANDLING
    // IMPORTANT:
    // STOP GLOBAL KEYBOARD HANDLER
    // ==================================================

    input.onkeydown =
        function (event) {

            event.stopPropagation();


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                saveButton.click();

                return;
            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeRenameProjectPopup?.();

                return;
            }

            // Space is intentionally NOT prevented.
            // Normal typing, including spaces, works.
        };


    // ==================================================
    // FOCUS INPUT
    // ==================================================

    setTimeout(
        () => {

            input.focus();

            input.select();

        },
        0
    );


    console.log(
        "✏️ RENAME POPUP OPENED:",
        {
            projectId,
            currentName
        }
    );
}

// ==================================================
// HOME PROJECT HEADER RENAME
// ==================================================

function initHomeProjectRenameButton() {

    const button =
        document.getElementById(
            "homeProjectRenameButton"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const projectId =
                AppState?.project?.project_id ??
                AppState?.project?.projectId ??
                AppState?.project?.id ??
                null;


            if (!projectId) {

                console.error(
                    "❌ ACTIVE HOME PROJECT ID NOT FOUND"
                );

                return;
            }


            renameProjectFromList(
                projectId
            );
        }
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initHomeProjectRenameButton
    );

}
else {

    initHomeProjectRenameButton();

}


// =====================================================
// UPDATE HOME PROJECT DISPLAY NAME
// =====================================================

function updateHomeProjectDisplayName() {

    const displayName =
        document.getElementById(
            "homeProjectDisplayName"
        );

    if (!displayName) {
        return;
    }


    const projectName =
        AppState?.project?.name ||
        AppState?.homeProject?.name ||
        "";


    const cleanName =
        String(projectName)
            .trim();


    displayName.textContent =
        cleanName;


    displayName.style.display =
        cleanName
            ? "inline-flex"
            : "none";
}

// =====================================================
// CLOSE RENAME PROJECT POPUP
// =====================================================

function closeRenameProjectPopup() {

    const popup =
        document.getElementById(
            "renameProjectPopup"
        );


    if (!popup) {
        return;
    }


    popup.style.display =
        "none";

    popup.setAttribute(
        "aria-hidden",
        "true"
    );


    pendingRenameProjectId =
        null;


    const input =
        document.getElementById(
            "renameProjectNameInput"
        );


    const saveButton =
        document.getElementById(
            "renameProjectSaveButton"
        );


    if (input) {

        input.disabled =
            false;
    }


    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save";
    }
}


function openCreateProjectNamePopup(projectType) {

    const popup =
        document.getElementById(
            "createProjectNamePopup"
        );

    const title =
        document.getElementById(
            "createProjectNameTitle"
        );

    const input =
        document.getElementById(
            "newProjectNameInput"
        );

    const button =
        document.getElementById(
            "createProjectNameConfirmButton"
        );

    if (!popup || !input || !button) {
        console.error(
            "❌ CREATE PROJECT NAME POPUP ELEMENTS NOT FOUND"
        );
        return;
    }

    const isHome =
        projectType === "home";

    title.textContent =
        isHome
            ? "Create New Home Project"
            : "Create New Business Project";

    input.value = "";

    popup.style.display = "flex";
    popup.setAttribute(
        "aria-hidden",
        "false"
    );

    button.onclick =
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            const name =
                input.value.trim();

            if (!name) {

                input.focus();

                return;
            }

            closeCreateProjectNamePopup();

            createProject({
                type: projectType,
                name,
                confirmed: true
            });
        };

    input.onkeydown =
        function (event) {

            /*
             * Prevent global keyboard handlers
             * from interfering with project name input.
             */

            event.stopPropagation();


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                button.click();

                return;
            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeCreateProjectNamePopup();

                return;
            }


            /*
             * All other keys, including SPACE,
             * use normal input behavior.
             */
        };

    setTimeout(() => {
        input.focus();
    }, 50);
}


function closeCreateProjectNamePopup() {

    const popup =
        document.getElementById(
            "createProjectNamePopup"
        );

    if (!popup) {
        return;
    }

    popup.style.display = "none";

    popup.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ==================================================
// DELETE PROJECT CONFIRMATION
// ==================================================

let pendingDeleteProjectId = null;


function openDeleteProjectConfirm(
    projectId
) {

    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        !projectId
    ) {

        console.error(
            "❌ INVALID DELETE PROJECT ID",
            {
                projectId
            }
        );

        return;
    }


    // ==================================================
    // ELEMENTS
    // ==================================================

    const popup =
        document.getElementById(
            "deleteProjectConfirmPopup"
        );


    const title =
        document.getElementById(
            "deleteProjectConfirmTitle"
        );


    const confirmButton =
        document.getElementById(
            "deleteProjectConfirmButton"
        );


    const cancelButton =
        popup?.querySelector(
            ".delete-project-cancel-btn"
        );


    const closeButton =
        popup?.querySelector(
            ".delete-project-confirm-close"
        );


    const backdrop =
        popup?.querySelector(
            ".delete-project-confirm-backdrop"
        );


    if (
        !popup ||
        !title ||
        !confirmButton ||
        !cancelButton ||
        !closeButton
    ) {

        console.error(
            "❌ DELETE CONFIRM POPUP ELEMENTS NOT FOUND"
        );

        return;
    }


    // ==================================================
    // STORE PROJECT ID
    // ==================================================

    pendingDeleteProjectId =
        projectId;


    // ==================================================
    // RESET BUTTON STATE
    // ==================================================

    confirmButton.disabled =
        false;

    confirmButton.textContent =
        "Delete Project";


    // ==================================================
    // TITLE
    // ==================================================

    title.textContent =
        `Delete Project #${projectId}?`;


    // ==================================================
    // REMOVE OLD KEYBOARD HANDLER
    // ==================================================

    if (
        popup._deleteProjectKeyHandler
    ) {

        document.removeEventListener(
            "keydown",
            popup._deleteProjectKeyHandler
        );

        popup._deleteProjectKeyHandler =
            null;
    }


    // ==================================================
    // DELETE BUTTON
    // ==================================================

    confirmButton.onclick =
        async function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();


            const id =
                pendingDeleteProjectId;


            if (
                !id ||
                confirmButton.disabled
            ) {

                return;
            }


            // ----------------------------------------------
            // SHOW LOADING ONLY AFTER CLICK
            // ----------------------------------------------

            confirmButton.disabled =
                true;

            confirmButton.textContent =
                "Deleting...";


            // ----------------------------------------------
            // PERFORM DELETE
            // ----------------------------------------------

            const success =
                await performProjectDelete(
                    id
                );


            // ----------------------------------------------
            // SUCCESS
            // ----------------------------------------------

            if (
                success
            ) {

                closeDeleteProjectConfirm();

                return;
            }


            // ----------------------------------------------
            // FAILED
            // ----------------------------------------------

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Delete Project";
        };


    // ==================================================
    // CANCEL
    // ==================================================

    cancelButton.onclick =
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();


            if (
                confirmButton.disabled
            ) {

                return;
            }


            closeDeleteProjectConfirm();
        };


    // ==================================================
    // CLOSE X
    // ==================================================

    closeButton.onclick =
        function (
            event
        ) {

            event.preventDefault();

            event.stopPropagation();


            if (
                confirmButton.disabled
            ) {

                return;
            }


            closeDeleteProjectConfirm();
        };


    // ==================================================
    // BACKDROP
    // ==================================================

    if (
        backdrop
    ) {

        backdrop.onclick =
            function (
                event
            ) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    confirmButton.disabled
                ) {

                    return;
                }


                closeDeleteProjectConfirm();
            };
    }


    // ==================================================
    // KEYBOARD
    // ==================================================

    const keyHandler =
        function (
            event
        ) {

            if (
                popup.style.display ===
                "none"
            ) {

                return;
            }


            // ----------------------------------------------
            // ESC
            // ----------------------------------------------

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    confirmButton.disabled
                ) {

                    return;
                }


                closeDeleteProjectConfirm();

                return;
            }


            // ----------------------------------------------
            // ENTER
            // ----------------------------------------------

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    !confirmButton.disabled
                ) {

                    confirmButton.click();
                }
            }
        };


    popup._deleteProjectKeyHandler =
        keyHandler;


    document.addEventListener(
        "keydown",
        keyHandler
    );


    // ==================================================
    // SHOW
    // ==================================================

    popup.style.display =
        "flex";


    popup.setAttribute(
        "aria-hidden",
        "false"
    );


    // ==================================================
    // FOCUS
    // ==================================================

    setTimeout(
        () => {

            if (
                popup.style.display !==
                "none"
            ) {

                confirmButton.focus();
            }

        },
        50
    );


    console.log(
        "🗑 DELETE CONFIRMATION OPEN",
        {
            projectId
        }
    );
}


// ==================================================
// DELETE LOCK
// ==================================================

let projectDeleteInProgress = false;


// ==================================================
// ACTUAL PROJECT DELETE
// ==================================================

async function performProjectDelete(
    projectId
) {

    // ==================================================
    // PREVENT DOUBLE DELETE
    // ==================================================

    if (
        projectDeleteInProgress
    ) {

        console.warn(
            "⚠️ DELETE ALREADY IN PROGRESS",
            {
                projectId
            }
        );

        return false;
    }


    projectDeleteInProgress =
        true;


    console.log(
        "================================="
    );

    console.log(
        "🗑 DELETE PROJECT START",
        {
            projectId
        }
    );


    try {

        // ==================================================
        // DELETE REQUEST
        // ==================================================

        const deleteUrl =
            `${API}/project/${projectId}`;


        console.log(
            "🔥 DELETE PROJECT REQUEST",
            {
                projectId,
                deleteUrl
            }
        );


        const token =
            localStorage.getItem(
                "token"
            );


        const res =
            await fetch(
                deleteUrl,
                {
                    method:
                        "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        const responseText =
            await res.text();


        console.log(
            "🔥 DELETE PROJECT RESPONSE",
            {
                projectId,

                status:
                    res.status,

                statusText:
                    res.statusText,

                ok:
                    res.ok,

                response:
                    responseText
            }
        );


        // ==================================================
        // FAILED
        // ==================================================

        if (
            !res.ok
        ) {

            console.error(
                "❌ DELETE PROJECT FAILED",
                {
                    projectId,

                    status:
                        res.status,

                    statusText:
                        res.statusText,

                    response:
                        responseText
                }
            );


            return false;
        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "✅ PROJECT DELETED",
            {
                projectId
            }
        );


        // ==================================================
        // REMOVE FROM CURRENT LIST IMMEDIATELY
        // ==================================================

        const projectItem =
            document.querySelector(
                `.open-project-item[data-project-id="${projectId}"]`
            );


        if (
            projectItem
        ) {

            projectItem.remove();


            console.log(
                "🔥 PROJECT REMOVED FROM UI LIST",
                {
                    projectId
                }
            );
        }


        // ==================================================
        // CHECK ACTIVE PROJECT
        // ==================================================

        const activeProjectId =
            AppState.project
                ?.project_id ??
            AppState.project
                ?.projectId ??
            AppState.project
                ?.id ??
            null;


        if (
            String(
                activeProjectId
            ) ===
            String(
                projectId
            )
        ) {

            console.log(
                "🔥 DELETED ACTIVE PROJECT"
            );


            AppState.project =
                null;


            AppState.homeProject =
                null;


            AppState.businessProject =
                null;


            window.project =
                null;


            window.planImage =
                null;


            if (
                typeof planImage !==
                "undefined"
            ) {

                planImage =
                    null;
            }


            currentProjectId =
                null;


            localStorage.removeItem(
                "project_id"
            );


            localStorage.removeItem(
                "home_project_id"
            );


            localStorage.removeItem(
                "business_project_id"
            );


            updateWorkspaceUI?.();

            updateProjectHeader?.();

            updateWorkflowUI?.();

            updateHomeWorkflow?.();

            updateHomeLocks?.();

            updateHomeEmptyPlanState?.();

            requestRender?.();
        }




        console.log(
            "🗑 DELETE PROJECT COMPLETE",
            {
                projectId
            }
        );


        console.log(
            "================================="
        );


        return true;

    }
    catch (
    err
    ) {

        console.error(
            "🔥 DELETE PROJECT ERROR",
            {
                projectId,
                error:
                    err
            }
        );


        return false;

    }
    finally {

        projectDeleteInProgress =
            false;
    }
}


// ==================================================
// ACTIVE PROJECT HEADER DELETE
// ==================================================

function initProjectHeaderDeleteButton() {

    const deleteButton =
        document.getElementById(
            "projectHeaderDeleteButton"
        );


    if (!deleteButton) {
        return;
    }


    deleteButton.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();


            const projectId =
                AppState?.project?.project_id ??
                AppState?.project?.projectId ??
                AppState?.project?.id ??
                null;


            if (!projectId) {

                console.error(
                    "❌ ACTIVE PROJECT ID NOT FOUND"
                );

                return;
            }


            // ==================================================
            // USE THE EXISTING DELETE FLOW
            // ==================================================

            if (
                typeof openDeleteProjectConfirm ===
                "function"
            ) {

                openDeleteProjectConfirm(
                    projectId
                );

                return;
            }


            if (
                typeof showDeleteProjectConfirm ===
                "function"
            ) {

                showDeleteProjectConfirm(
                    projectId
                );

                return;
            }


            console.error(
                "❌ EXISTING DELETE CONFIRM FUNCTION NOT FOUND"
            );
        }
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initProjectHeaderDeleteButton
    );

}
else {

    initProjectHeaderDeleteButton();

}

function closeDeleteProjectConfirm() {

    const popup =
        document.getElementById(
            "deleteProjectConfirmPopup"
        );


    if (
        popup
    ) {

        popup.style.display =
            "none";


        popup.setAttribute(
            "aria-hidden",
            "true"
        );


        // ==================================================
        // REMOVE KEYBOARD HANDLER
        // ==================================================

        if (
            popup._deleteProjectKeyHandler
        ) {

            document.removeEventListener(
                "keydown",
                popup._deleteProjectKeyHandler
            );

            popup._deleteProjectKeyHandler =
                null;
        }
    }


    // ==================================================
    // RESET
    // ==================================================

    pendingDeleteProjectId =
        null;


    // ==================================================
    // RESET BUTTON
    // ==================================================

    const confirmButton =
        document.getElementById(
            "deleteProjectConfirmButton"
        );


    if (
        confirmButton
    ) {

        confirmButton.disabled =
            false;

        confirmButton.textContent =
            "Delete Project";
    }
}

async function openExistingProject(
    projectId
) {

    console.log(
        "🔥 OPEN EXISTING PROJECT",
        {
            projectId
        }
    );


    if (
        !projectId
    ) {

        console.error(
            "❌ INVALID PROJECT ID"
        );

        return;
    }


    try {

        // ==================================================
        // CLOSE POPUP
        // ==================================================

        const popup =
            document.getElementById(
                "openProjectPopup"
            );


        if (
            popup
        ) {

            popup.style.display =
                "none";
        }


        // ==================================================
        // LOAD PROJECT
        // ==================================================

        await loadProject(
            projectId
        );


        // ==================================================
        // REFRESH UI
        // ==================================================

        updateWorkspaceUI?.();

        updateProjectHeader?.();

        updateWorkflowUI?.();

        updateHomeWorkflow?.();

        updateHomeLocks?.();

        updateHomeEmptyPlanState?.();

        requestRender?.();


    }

    catch (
    err
    ) {

        console.error(
            "🔥 OPEN EXISTING PROJECT FAILED",
            err
        );

        alert(
            "Unable to open this project."
        );
    }
}


async function deleteProjectFromList(
    projectId
) {

    console.log(
        "🗑 DELETE BUTTON CLICKED",
        {
            projectId
        }
    );


    // ==================================================
    // CLOSE OPEN PROJECT POPUP
    // ==================================================

    closeProjectMenu?.();


    // ==================================================
    // OPEN DELETE CONFIRMATION
    // ==================================================

    openDeleteProjectConfirm(
        projectId
    );
}

// =====================================================
// 🔥 OPEN PROJECT
// =====================================================
//
// Opens an existing server project.
//
// IMPORTANT:
//
// openProject() does NOT rebuild the project.
// It only selects the project ID and delegates
// the actual loading to loadProject().
//
// =====================================================

async function openProject(
    projectId
) {

    console.log(
        "================================="
    );

    console.log(
        "🔥 OPEN PROJECT START",
        {
            projectId
        }
    );

    // ==================================================
    // 🔒 VALIDATE PROJECT ID
    // ==================================================

    if (
        projectId === null ||
        projectId === undefined ||
        projectId === ""
    ) {

        console.error(
            "🔥 OPEN PROJECT — INVALID PROJECT ID",
            projectId
        );

        return false;
    }

    // ==================================================
    // 🔥 NORMALIZE ID
    // ==================================================

    currentProjectId =
        String(
            projectId
        );

    // ==================================================
    // 🔥 PERSIST ACTIVE PROJECT
    // ==================================================

    localStorage.setItem(
        "project_id",
        currentProjectId
    );

    // ==================================================
    // 🔥 CLOSE PROJECT POPUP
    // ==================================================

    closeProjectMenu?.();

    // ==================================================
    // 🔥 LOAD PROJECT
    // ==================================================

    try {

        await loadProject();

    }

    catch (err) {

        console.error(
            "🔥 OPEN PROJECT LOAD FAILED",
            err
        );

        return false;
    }

    // ==================================================
    // 🔥 COMPLETE
    // ==================================================

    console.log(
        "🔥 OPEN PROJECT COMPLETE",
        {
            projectId:
                currentProjectId,

            activeProjectId:
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

            floors:
                AppState.project
                    ?.floors
                    ?.length ||
                0
        }
    );

    console.log(
        "================================="
    );

    return true;
}


// =====================================================
// 🔥 OPEN PROJECT MENU
// =====================================================

async function openProjectMenu() {

    console.log(
        "================================="
    );

    console.log(
        "🔥 OPEN PROJECT MENU"
    );


    const popup =
        document.getElementById(
            "openProjectPopup"
        );


    // ==================================================
    // POPUP CHECK
    // ==================================================

    if (
        !popup
    ) {

        console.error(
            "🔥 OPEN PROJECT POPUP NOT FOUND"
        );

        return;
    }


    // ==================================================
    // HIDE WORKFLOW BEHIND MODAL
    // ==================================================

    document.body.classList.add(
        "project-popup-open"
    );


    // ==================================================
    // CURRENT WORKSPACE
    // ==================================================

    const mode =
        window.AppMode?.current ||
        "business";


    console.log(
        "🔥 OPEN PROJECT WORKSPACE",
        {
            mode
        }
    );


    // ==================================================
    // SHOW POPUP
    // ==================================================

    popup.style.display =
        "flex";

    popup.setAttribute(
        "aria-hidden",
        "false"
    );


    // ==================================================
    // LOAD PROJECTS
    // ==================================================

    await loadProjectList();


    // ==================================================
    // READY
    // ==================================================

    console.log(
        "🔥 OPEN PROJECT MENU READY",
        {
            mode
        }
    );

    console.log(
        "================================="
    );
}

// =====================================================
// 🔥 CLOSE PROJECT MENU
// =====================================================

function closeProjectMenu() {

    const popup =
        document.getElementById(
            "openProjectPopup"
        );

    if (
        popup
    ) {

        popup.style.display =
            "none";
    }
}

window.closeProjectMenu =
    closeProjectMenu;

// =====================================================
// 🔥 LOAD PROJECT
// =====================================================

// =====================================================
// 🔥 LOAD PROFESSIONAL / BUSINESS PROJECT
// =====================================================

async function loadProject(
    projectId = null
) {

    // ==================================================
    // RESOLVE ONLY BUSINESS PROJECT ID
    // ==================================================

    const resolvedProjectId =
        projectId ??
        currentProjectId ??
        localStorage.getItem(
            "business_project_id"
        );

    if (
        !resolvedProjectId
    ) {

        console.warn(
            "⚠️ NO BUSINESS PROJECT ID TO LOAD"
        );

        return false;
    }

    // ==================================================
    // SET CURRENT PROJECT ID
    // ==================================================

    currentProjectId =
        String(
            resolvedProjectId
        );

    console.log(
        "================================="
    );

    console.log(
        "🔥 LOAD BUSINESS PROJECT START",
        {
            projectId:
                currentProjectId
        }
    );

    try {

        // ==================================================
        // FETCH
        // ==================================================

        // ==================================================
        // FETCH BUSINESS PROJECT
        // ==================================================

        const projectUrl =
            `${API}/project/${currentProjectId}`;

        console.error(
            "🔥 BUSINESS PROJECT REQUEST",
            {
                API,
                projectUrl,
                projectId:
                    currentProjectId
            }
        );


        const res =
            await fetch(
                `${API}/project/${currentProjectId}`,
                {
                    method:
                        "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            !res.ok
        ) {

            console.warn(
                "❌ BUSINESS PROJECT LOAD FAILED",
                {
                    status:
                        res.status,

                    projectId:
                        currentProjectId
                }
            );

            return false;
        }


        // ==================================================
        // RESPONSE
        // ==================================================

        const data =
            await res.json();

        // ==================================================
        // 🔥 RAW BUSINESS PROJECT RESPONSE DEBUG
        // ==================================================

        console.error(
            "🔥🔥🔥 RAW BUSINESS PROJECT RESPONSE",
            {
                hasData:
                    !!data.data,

                hasProject:
                    !!data.project,

                dataFloors:
                    Array.isArray(
                        data.data?.floors
                    )
                        ? data.data.floors.length
                        : null,

                projectFloors:
                    Array.isArray(
                        data.project?.floors
                    )
                        ? data.project.floors.length
                        : null,

                dataProjectId:
                    data.data?.project_id ??
                    data.data?.id ??
                    null,

                projectProjectId:
                    data.project?.project_id ??
                    data.project?.id ??
                    null,

                dataKeys:
                    data.data
                        ? Object.keys(
                            data.data
                        )
                        : [],

                projectKeys:
                    data.project
                        ? Object.keys(
                            data.project
                        )
                        : []
            }
        );

        console.error(
            "🔥🔥🔥 RAW FLOORS",
            data.data?.floors ??
            data.project?.floors ??
            null
        );

        const project =
            data.data ||
            data.project;

        if (
            !project
        ) {

            console.warn(
                "❌ NO BUSINESS PROJECT DATA"
            );

            return false;
        }

        // ==================================================
        // NORMALIZE
        // ==================================================

        if (
            !Array.isArray(
                project.floors
            )
        ) {

            project.floors =
                [];
        }




        if (
            !Array.isArray(
                project.outdoorSources
            )
        ) {

            project.outdoorSources =
                [];
        }

        // ==================================================
        // ID
        // ==================================================

        const loadedProjectId =
            project.project_id ??
            project.id ??
            currentProjectId;

        project.project_id =
            loadedProjectId;

        project.id =
            loadedProjectId;

        currentProjectId =
            String(
                loadedProjectId
            );

        // ==================================================
        // TYPE
        // ==================================================

        const projectType =
            project.type ||
            project.project_type ||
            project.projectType ||
            "business";

        project.type =
            projectType;

        project.projectType =
            projectType;


        // ==================================================
        // 🔥 BUSINESS LEGACY FLOOR MIGRATION
        // ==================================================

        let floorMigrated =
            false;

        if (
            projectType ===
            "business"
        ) {

            if (
                project.floors.length ===
                0
            ) {

                const migratedFloor =
                    createDefaultFloor(
                        "Main Floor",
                        "professional"
                    );

                project.floors.push(
                    migratedFloor
                );

                project.currentFloorIndex =
                    0;

                floorMigrated =
                    true;

                console.error(
                    "🔥🔥🔥 BUSINESS FLOOR MIGRATION",
                    {
                        projectId:
                            currentProjectId,

                        floorId:
                            migratedFloor.id,

                        floorName:
                            migratedFloor.name,

                        floorCount:
                            project.floors.length
                    }
                );
            }
        }

        // ==================================================
        // SAFETY
        // ==================================================

        if (
            projectType !==
            "business"
        ) {

            console.error(
                "❌ LOAD PROJECT RETURNED NON-BUSINESS PROJECT",
                {
                    projectId:
                        loadedProjectId,

                    projectType
                }
            );

            return false;
        }

        // ==================================================
        // DEBUG
        // ==================================================

        console.error(
            "🔥 LOADED BUSINESS PROJECT",
            {
                projectId:
                    loadedProjectId,

                projectType,

                floors:
                    project.floors.length,

                rooms:
                    project.floors.reduce(
                        (
                            total,
                            floor
                        ) =>
                            total +
                            (
                                floor.rooms
                                    ?.length ||
                                0
                            ),
                        0
                    )
            }
        );

        // ==================================================
        // CANONICAL ACTIVE PROJECT
        // ==================================================

        AppState.project =
            project;

        // ==================================================
        // BUSINESS COMPATIBILITY WORKSPACE
        // ==================================================

        AppState.businessProject =
            project;



        // ==================================================
        // 🔥 PERSIST BUSINESS FLOOR MIGRATION
        // ==================================================

        if (
            floorMigrated
        ) {

            console.error(
                "🔥🔥🔥 SAVING MIGRATED BUSINESS FLOOR",
                {
                    projectId:
                        currentProjectId,

                    floors:
                        project.floors.length,

                    floorId:
                        project.floors[0]?.id,

                    floorName:
                        project.floors[0]?.name
                }
            );

            try {

                await saveProject();

                console.error(
                    "🔥🔥🔥 BUSINESS FLOOR MIGRATION SAVED",
                    {
                        projectId:
                            currentProjectId,

                        floors:
                            project.floors.length
                    }
                );

            }
            catch (
            migrationError
            ) {

                console.error(
                    "❌ BUSINESS FLOOR MIGRATION SAVE FAILED",
                    migrationError
                );
            }
        }
        // ==================================================
        // DO NOT TOUCH HOME
        // ==================================================
        //
        // NEVER:
        //
        // AppState.homeProject = project
        //
        // ==================================================

        // ==================================================
        // BUSINESS ID
        // ==================================================

        localStorage.setItem(
            "business_project_id",
            String(
                loadedProjectId
            )
        );

        // ==================================================
        // MODE
        // ==================================================

        window.AppMode.current =
            "business";

        localStorage.setItem(
            "workspaceMode",
            "business"
        );

        // ==================================================
        // GLOBAL
        // ==================================================

        window.project =
            project;

        // ==================================================
        // FLOOR STATE
        // ==================================================

        if (
            project.floors.length > 0
        ) {

            const savedIndex =
                project.currentFloorIndex;

            if (
                savedIndex ===
                undefined ||
                savedIndex ===
                null ||
                savedIndex < 0 ||
                savedIndex >=
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

        // ==================================================
        // FLOOR DEBUG
        // ==================================================

        console.error(
            "🔥 LOADED BUSINESS FLOORS",
            project.floors.map(
                (
                    floor,
                    index
                ) => ({

                    index,

                    id:
                        floor.id,

                    name:
                        floor.name,

                    image:
                        !!floor.image,

                    imageData:
                        !!floor.imageData,

                    imageFileName:
                        floor.imageFileName,

                    rooms:
                        floor.rooms
                            ?.length ||
                        0,

                    zones:
                        floor.zones
                            ?.length ||
                        0,

                    sources:
                        floor.sources
                            ?.length ||
                        0,

                    scaleConfirmed:
                        floor.scaleConfirmed,

                    currentScale:
                        floor.currentScale
                })
            )
        );

        // ==================================================
        // RESET TRANSIENT STATE
        // ==================================================

        window.scalePoints =
            [];

        AppState.ui.roomDraft =
            null;

        AppState.ui.zoneDraft =
            null;

        window.currentRoom =
            null;

        window.currentZone =
            null;

        selectedRoom =
            null;

        AppState.ui.selectedZone =
            null;

        selectedSource =
            null;

        AppState.ui.selectedSource =
            null;

        // ==================================================
        // LOAD CURRENT BUSINESS FLOOR IMAGE
        // ==================================================

        const floor =
            getCurrentFloor?.();

        if (
            floor
        ) {

            console.error(
                "🔥 BUSINESS FLOOR IMAGE RESTORE",
                {
                    floorId:
                        floor.id,

                    floorName:
                        floor.name,

                    hasImage:
                        !!floor.image,

                    hasImageData:
                        !!floor.imageData,

                    imageFileName:
                        floor.imageFileName
                }
            );

            loadFloorImage(
                floor
            );
        }
        else {

            window.planImage =
                null;

            console.warn(
                "⚠️ BUSINESS PROJECT HAS NO ACTIVE FLOOR"
            );
        }

        // ==================================================
        // UI
        // ==================================================

        renderBusinessFloorTabs?.();

        renderFloorTabs?.();

        updateProjectHeader?.();

        updateWorkflowUI?.();

        updateHomeWorkflow?.();

        updateHomeLocks?.();

        updateCurrentExposure?.();

        // ==================================================
        // RENDER
        // ==================================================

        requestRender?.();

        // ==================================================
        // FINAL DEBUG
        // ==================================================

        console.error(
            "🔥 PROJECT LOAD COMPLETE",
            {
                projectId:
                    currentProjectId,

                mode:
                    window.AppMode.current,

                projectType,

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
                        ?.imageData,

                rooms:
                    project
                        ?.floors
                        ?.reduce(
                            (
                                total,
                                floor
                            ) =>
                                total +
                                (
                                    floor.rooms
                                        ?.length ||
                                    0
                                ),
                            0
                        ) ||
                    0
            }
        );

        console.log(
            "🔥 LOAD BUSINESS PROJECT COMPLETE"
        );

        console.log(
            "================================="
        );

        return true;

    }
    catch (
    err
    ) {

        console.error(
            "🔥 BUSINESS PROJECT LOAD ERROR",
            err
        );

        return false;
    }
}

// =====================================================
// 🔥 GLOBAL PROJECT API
// =====================================================

window.createProject =
    createProject;

window.saveProject =
    saveProject;

window.loadProject =
    loadProject;

window.loadProjectList =
    loadProjectList;

window.openProject =
    openProject;

window.openProjectMenu =
    openProjectMenu;

window.closeProjectMenu =
    closeProjectMenu;


console.error(
    "🔥🔥🔥 API.JS EXECUTION END"
);

window.loadProject =
    loadProject;

console.error(
    "🔥 LOAD PROJECT EXPORTED",
    typeof window.loadProject
);

