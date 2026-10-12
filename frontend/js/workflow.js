//Owner:
//Workflow Manager

//Responsibility:
//Workflow State

//Should not:
//Render
//Manage Floors
//Manage Sources

const COVERAGE_WEIGHT = 0.6;
const DENSITY_WEIGHT = 0.4;

const QUALITY_EXCELLENT = 0.75;
const QUALITY_GOOD = 0.40;


function updateHomeWorkflow() {

    if (
        window.AppMode?.current !==
        "home"
    ) {
        return;
    }


    // =====================
    // CURRENT PROJECT
    // =====================

    const project =
        AppState.project;

    if (!project) {
        return;
    }


    // =====================
    // CURRENT FLOOR
    // =====================

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
        return;
    }


    // =====================
    // PLAN
    // =====================

    const hasPlan =
        !!floor.image;


    // =====================
    // SCALE
    //
    // Only explicit confirmation
    // means scale is complete.
    // =====================

    const hasScale =
        floor.scaleConfirmed === true;


    // =====================
    // LIFESTYLE AREAS
    // =====================

    const lifestyleAreas =
        Array.isArray(
            floor.zones
        )
            ? floor.zones
            : [];

    const hasLifestyle =
        lifestyleAreas.length > 0;


    // =====================
    // INDOOR SOURCES
    //
    // floor.sources is the current
    // Floor-level source collection.
    //
    // Outdoor Sources are Property-level
    // and are intentionally excluded here.
    // =====================

    const indoorSources =
        Array.isArray(
            floor.sources
        )
            ? floor.sources.filter(
                source =>
                    source &&
                    source.placementType !==
                    "outdoor"
            )
            : [];

    const hasIndoorSources =
        indoorSources.length > 0;


    // =====================
    // OUTDOOR SOURCES
    //
    // Property-wide collection.
    // =====================

    const outdoorSources =
        Array.isArray(
            project.outdoorSources
        )
            ? project.outdoorSources
            : [];

    const hasOutdoorSources =
        outdoorSources.length > 0;


    // =====================
    // EMF SOURCES
    //
    // Workflow source step is complete
    // when the user has added at least
    // one Indoor OR Outdoor Source.
    // =====================

    const hasSources =
        hasIndoorSources ||
        hasOutdoorSources;


    // =====================
    // STEP MAP
    // =====================

    const steps = {

        upload:
            hasPlan,

        scale:
            hasScale,

        lifestyle:
            hasLifestyle,

        sources:
            hasSources,

        insights:
            hasSources
    };


    // =====================
    // ACTIVE STEP
    // =====================

    let activeStep =
        "upload";

    if (hasPlan) {

        activeStep =
            "scale";
    }

    if (hasScale) {

        activeStep =
            "lifestyle";
    }

    if (hasLifestyle) {

        activeStep =
            "sources";
    }

    if (hasSources) {

        activeStep =
            "insights";
    }


    // =====================
    // WORKFLOW ITEMS
    // =====================

    const stepOrder = [
        "upload",
        "scale",
        "lifestyle",
        "sources",
        "insights"
    ];

    const activeIndex =
        stepOrder.indexOf(
            activeStep
        );


    document
        .querySelectorAll(
            "#homeWorkflowBar .workflow-item"
        )
        .forEach(el => {

            const step =
                el.getAttribute(
                    "data-step"
                );

            if (!step) {
                return;
            }


            // =====================
            // RESET
            // =====================

            el.querySelector(
                ".workflow-current"
            )?.remove();

            el.classList.remove(
                "active",
                "done",
                "next",
                "locked"
            );


            const currentIndex =
                stepOrder.indexOf(
                    step
                );


            // =====================
            // DONE
            // =====================

            if (steps[step]) {

                el.classList.add(
                    "done"
                );
            }


            // =====================
            // ACTIVE
            // =====================

            if (
                step === activeStep
            ) {

                el.classList.add(
                    "active"
                );
            }


            // =====================
            // NEXT
            // =====================

            if (
                currentIndex ===
                activeIndex + 1
            ) {

                el.classList.add(
                    "next"
                );
            }
        });

    // =====================
    // INSIGHTS READY CARD
    // =====================

    const assessmentReady =
        hasPlan &&
        hasScale &&
        hasLifestyle &&
        hasIndoorSources;

    updateHomeOutputState(
        assessmentReady
    );

    const insightsReadyCard =
        document.getElementById(
            "insightsReadyCard"
        );

    if (insightsReadyCard) {
        insightsReadyCard.style.display =
            assessmentReady
                ? "block"
                : "none";
    }


    // =====================
    // DEBUG
    // =====================

    console.log(
        "HOME WORKFLOW STATE",
        {
            floorIndex,

            hasPlan,

            hasScale,

            scaleConfirmed:
                floor.scaleConfirmed,

            currentScale:
                floor.currentScale,

            lifestyleCount:
                lifestyleAreas.length,

            indoorSourceCount:
                indoorSources.length,

            outdoorSourceCount:
                outdoorSources.length,

            hasLifestyle,

            hasIndoorSources,

            hasOutdoorSources,

            hasSources,

            activeStep
        }
    );
}



function unlockPremiumReport() {

    document.body.classList.add(
        "premium-unlocked"
    );

    window.homeWorkflow
        .premiumUnlocked =
        true;

    updateHomeWorkflow?.();

    updateStatus?.(
        "✅ Premium unlocked"
    );
}

function completeSourceWorkflow() {

    window.homeWorkflow
        .sourcesFinished =
        true;

    updateHomeWorkflow?.();
    renderHomeFloorTabs?.();

    updateStatus?.(
        "✅ Preview ready"
    );

    document
        .body
        .classList
        .add(
            "preview-mode"
        );
}

function areAllZonesMeasured() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return false;
    }

    const zones =
        Array.isArray(
            floor.zones
        )
            ? floor.zones
            : [];

    // No Zones = Zone workflow
    // is not complete.
    if (
        zones.length === 0
    ) {
        return false;
    }

    // A Zone is considered ready when
    // it satisfies the common coverage model:
    //
    // 1. Point coverage according to grid size
    // 2. Sector / spatial coverage >= 60%
    //
    // getZoneAnalysisReadiness() is the
    // canonical Zone readiness logic.
    return zones.every(
        zone => {

            const readiness =
                getZoneAnalysisReadiness?.(
                    zone
                );

            return (
                readiness?.ready === true
            );
        }
    );
}


function getNextWorkflowStep() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {

        return {

            title:
                "Create Floor",

            room: null,

            description:
                "Create your first floor."
        };
    }

    if (!floor.image) {

        return {

            title:
                "Upload Floor Plan",

            room: null,

            description:
                "Upload a floor plan image."
        };
    }

    if (!floor.scaleConfirmed) {

        return {

            title:
                "Set Scale",

            room: null,

            description:
                "Calibrate the floor plan scale."
        };
    }

    // =====================
    // 🔥 NO ROOMS
    // =====================

    if (
        !floor.rooms ||
        floor.rooms.length === 0
    ) {

        return {

            title:
                "Draw Rooms",

            room: null,

            description:
                "Outline rooms on the floor plan."
        };
    }

    // =====================
    // 🔥 GRID
    // =====================

    const roomWithoutGrid =

        (floor.rooms || []).find(
            room =>
                !room.grid ||
                room.grid.length === 0
        );

    if (roomWithoutGrid) {

        return {

            title:
                "Generate Room Grid",

            room:
                roomWithoutGrid.code,

            description:

                "Create measurement points inside this room."
        };
    }

    // =====================
    // 🔥 MEASURE
    // =====================

    const roomToMeasure =

        (floor.rooms || []).find(
            room =>
                !getRoomMeasurementStats(
                    room
                ).canComplete
        );

    if (roomToMeasure) {

        const stats =

            getRoomMeasurementStats(
                roomToMeasure
            );

        const remaining =

            Math.max(
                0,
                stats.required -
                stats.measured
            );

        return {

            title:
                "Continue Measuring",

            room:
                roomToMeasure.code,

            description:

                `Need ${remaining} more measurements to complete this room.`
        };
    }

    // =====================
    // 🔥 SOURCES
    // =====================

    if (
        !floor.sources ||
        floor.sources.length === 0
    ) {

        return {

            title:
                "Add Sources",

            room: null,

            description:

                "Optional. Add EMF sources to improve analysis and reporting."
        };
    }

    // =====================
    // 🔥 REVIEW
    // =====================

    return {

        title:
            "Review Results",

        room: null,

        description:

            "All rooms meet measurement requirements and are ready for analysis."
    };
}

function updateNextStepCard() {

    const el = document.getElementById("workflowNextStep");
    if (!el) return;


    // --------------------------------------------------
    // TO DO CARD — COLLAPSE STATE
    // --------------------------------------------------
    const collapsedKey = "emf_workflow_next_step_collapsed";

    if (el.dataset.collapseInitialized !== "true") {
        el.dataset.collapseInitialized = "true";
        el.dataset.collapsed =
            localStorage.getItem(collapsedKey) === "true"
                ? "true"
                : "false";
    }


    // Keep the panel inside the canvas workspace.
    const canvasArea = document.querySelector(".canvas-area");

    if (canvasArea && el.parentElement !== canvasArea) {
        canvasArea.appendChild(el);
    }

    el.classList.add("workflow-next-floating");

    const floor = getCurrentFloor?.();

    // The initial floor-plan upload is already available elsewhere.
    // Do not duplicate it in the Do Next card.
    if (!floor || !floor.image) {
        el.innerHTML = "";
        el.style.display = "none";
        return;
    }

    const step = getNextWorkflowStep?.();

    if (!step) {
        el.innerHTML = "";
        el.style.display = "none";
        return;
    }

    // --------------------------------------------------
    // GUIDE PREFERENCE
    // --------------------------------------------------

    let userId = localStorage.getItem("user_id") || "local";

    try {
        const token = localStorage.getItem("token");

        if (token) {
            const payload = JSON.parse(
                atob(
                    token.split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            userId = String(
                payload.user_id ||
                payload.userId ||
                payload.sub ||
                userId
            );
        }
    } catch (error) {
        console.warn(
            "Could not resolve workflow guide user ID.",
            error
        );
    }

    const guideKey = `emf_business_workflow_guide_seen_${userId}`;
    const guideSeen = localStorage.getItem(guideKey) === "true";

    // --------------------------------------------------
    // ACTUAL FLOOR STATE
    // --------------------------------------------------

    const hasScale = floor.scaleConfirmed === true;

    const rooms = Array.isArray(floor.rooms)
        ? floor.rooms
        : [];

    const zones = Array.isArray(floor.zones)
        ? floor.zones
        : [];

    const sources = Array.isArray(floor.sources)
        ? floor.sources
        : [];

    const hasRooms = rooms.length > 0;

    const roomWithoutGrid = rooms.find(room =>
        !Array.isArray(room.grid) ||
        room.grid.length === 0
    );

    const hasAllRoomGrids =
        hasRooms && !roomWithoutGrid;

    const roomToMeasure = rooms.find(room =>
        !getRoomMeasurementStats(room).canComplete
    );

    const hasZones = zones.length > 0;

    // Zone grids are generated automatically in the current workflow.
    const zonesWithGrid = zones.filter(zone =>
        Array.isArray(zone.grid) &&
        zone.grid.length > 0
    );

    const zoneToMeasure = zonesWithGrid.find(zone => {
        if (typeof getZoneMeasurementStats === "function") {
            return !getZoneMeasurementStats(zone).canComplete;
        }

        return zone.grid.some(point => !point.completed);
    });

    const hasSources = sources.length > 0;

    // --------------------------------------------------
    // ACTION DEFINITIONS
    // --------------------------------------------------

    const actions = [
        {
            id: "btnScale",
            title: "Set Scale",
            description: "Calibrate the floor plan scale."
        },
        {
            id: "btnDrawRooms",
            title: "Draw Room",
            description: "Outline rooms on the floor plan."
        },
        {
            id: "btnGenerateGrid",
            title: "Generate Room Grid",
            description: roomWithoutGrid?.code
                ? `Create measurement points for ${roomWithoutGrid.code}.`
                : "Create room measurement points."
        },
        {
            id: "btnStartMeasure",
            title: "Room Measuring",
            description: roomToMeasure
                ? (() => {
                    const stats = getRoomMeasurementStats(roomToMeasure);
                    const remaining = Math.max(
                        0,
                        stats.required - stats.measured
                    );

                    return `Room ${roomToMeasure.code}: ${remaining} measurements remaining.`;
                })()
                : "Room measurements are complete."
        },
        {
            id: "btnAddZone",
            title: "Add / Manage Zones",
            description: "Add or manage lifestyle zones."
        },
        {
            id: "btnStartZoneMeasure",
            title: "Zone Measuring",
            description: "Measure lifestyle zone points."
        },
        {
            id: "btnAddSources",
            title: "Add Sources",
            description: "Record EMF sources to improve analysis and reporting."
        }
    ];

    // --------------------------------------------------
    // CHECK THE REAL SIDEBAR ACTION STATE
    // --------------------------------------------------

    function isActionAvailable(action) {
        const button = document.getElementById(action.id);

        if (!button || !button.isConnected) return false;
        if (button.disabled) return false;

        // Respect the workflow lock class used by the sidebar.
        if (button.classList.contains("workflow-locked")) return false;

        const style = getComputedStyle(button);

        if (
            style.display === "none" ||
            style.visibility === "hidden"
        ) {
            return false;
        }

        return true;
    }

    // --------------------------------------------------
    // CONTEXTUAL RECOMMENDATIONS
    // --------------------------------------------------

    let relevantIds = [];
    let recommendedId = null;

    if (!hasScale) {
        relevantIds = ["btnScale"];
        recommendedId = "btnScale";
    } else if (!hasRooms) {
        relevantIds = ["btnDrawRooms"];
        recommendedId = "btnDrawRooms";
    } else if (roomWithoutGrid) {
        relevantIds = ["btnGenerateGrid"];
        recommendedId = "btnGenerateGrid";
    } else {
        // Room measurement is relevant until all room requirements
        // are complete.
        if (roomToMeasure) {
            relevantIds.push("btnStartMeasure");
        }

        // Zones can be added once room grids are ready.
        if (hasAllRoomGrids) {
            relevantIds.push("btnAddZone");
        }


        // Zone measuring is relevant only after room measurements
        // are complete and a generated zone grid still needs work.
        if (!roomToMeasure && hasZones && zoneToMeasure) {
            relevantIds.push("btnStartZoneMeasure");
        }


        // Sources are the next core task after room measurements.
        if (!roomToMeasure && !hasSources) {
            relevantIds.push("btnAddSources");
        }

        if (step.title === "Continue Measuring") {
            recommendedId = "btnStartMeasure";
        } else if (step.title === "Add Sources") {
            recommendedId = "btnAddSources";
        } else if (step.title === "Review Results") {
            recommendedId = null;
        }
    }


    // All currently available actions — preserve primary recommendation
    const availableActions = actions.filter(action =>
        isActionAvailable(action)
    );

    const mainAction =
        availableActions.find(action => action.id === recommendedId) ||
        availableActions[0] ||
        null;

    // Only these actions may appear as secondary To Do choices
    const todoActionIds = [
        "btnDrawRooms",
        "btnAddZone",
        "btnStartMeasure",
        "btnStartZoneMeasure",
        "btnAddSources"
    ];

    const otherActions = availableActions.filter(
        action =>
            action.id !== mainAction?.id &&
            todoActionIds.includes(action.id)
    );

    // --------------------------------------------------
    // SAFE HTML HELPERS
    // --------------------------------------------------

    const escapeHtml = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const actionButton = (action, isRecommended) => `
        <button
            type="button"
            class="workflow-next-choice${isRecommended ? " is-recommended" : ""}"
            data-workflow-action="${escapeHtml(action.id)}"
        >
            <span class="workflow-next-choice-title">
                ${escapeHtml(action.title)} →
            </span>
            <span class="workflow-next-choice-desc">
                ${escapeHtml(action.description)}
            </span>
        </button>
    `;

    // --------------------------------------------------
    // CARD CONTENT
    // --------------------------------------------------

    const showSummary = !mainAction;


    el.innerHTML = `
<div class="workflow-next-heading">
    <span>What would you like to do next?</span>
    <div class="workflow-next-controls">
        <button
            type="button"
            class="workflow-next-collapse"
            aria-label="Collapse recommended next step"
            title="Collapse"
        >−</button>
        <button
            type="button"
            class="workflow-next-close"
            aria-label="Close recommended next step"
            title="Close"
        >×</button>
    </div>
</div>

        ${mainAction ? `
            <div class="workflow-next-recommended-label">
                RECOMMENDED NEXT STEP
            </div>

            <div class="workflow-next-actions">
                <div class="workflow-next-primary">
                    ${actionButton(mainAction, true)}
                </div>

                ${otherActions.length ? `
                    <div class="workflow-next-other">
                        <div class="workflow-next-other-label">
                            OTHER AVAILABLE ACTIONS
                        </div>
                        <div class="workflow-next-other-list">
                            ${otherActions.slice(0, 4).map(action => `
                                <button
                                    type="button"
                                    class="workflow-next-other-action"
                                    data-workflow-action="${escapeHtml(action.id)}"
                                >
                                    <span>${escapeHtml(action.title)}</span>
                                    <span class="workflow-next-other-arrow">›</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        ` : `
            <div class="workflow-next-summary">
                <strong>
                    ${escapeHtml(
        step.title === "Review Results"
            ? "Review Results"
            : step.title || "Continue your assessment"
    )}
                </strong>
                <span>
                    ${escapeHtml(step.description || "")}
                </span>
            </div>
        `}

        <button type="button" class="workflow-next-guide-link">
            View step-by-step guide
        </button>

        <div class="workflow-next-guide" hidden>
            <strong>Business assessment — step by step</strong>
            <ol>
                <li>Upload the floor plan.</li>
                <li>Set and confirm the floor plan scale.</li>
                <li>Draw rooms and generate each room's measurement grid.</li>
                <li>Review the available lifestyle zones.</li>
                <li>Choose measurement modalities in Measurement Profile.</li>
                <li>Measure room and relevant zone grid points.</li>
                <li>Add EMF sources and review the results.</li>
            </ol>
            <button type="button" class="workflow-next-guide-close">
                Close guide
            </button>
        </div>
    `;


    // --------------------------------------------------
    // TO DO CARD — COLLAPSE / CLOSE / REOPEN
    // --------------------------------------------------
    const collapsed = el.dataset.collapsed === "true";


    console.log("[ToDo collapse]", {
        collapsed,
        dataset: el.dataset.collapsed,
        compactBarExists: !!el.querySelector(".workflow-next-compact")
    });



    let compactBar = el.querySelector(".workflow-next-compact");

    if (!compactBar) {
        compactBar = document.createElement("button");
        compactBar.type = "button";
        compactBar.className = "workflow-next-compact";


        compactBar.innerHTML = `
    <span class="workflow-next-compact-label">
        RECOMMENDED NEXT STEP
    </span>
    <span class="workflow-next-compact-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" width="16" height="16">
            <path d="M5 7.5l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    </span>
`;

        compactBar.title = "Click to expand recommended next step";

        compactBar.setAttribute("aria-label", "Reopen recommended next step");
        compactBar.title = "Reopen recommended next step";


        compactBar.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: fit-content;
    min-width: 0;
    max-width: 340px;
    min-height: 44px;
    padding: 0 8px 0 14px;
    border: 1px solid #456b9b;
    border-radius: 11px;
    background: #355783;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(25, 48, 78, 0.2);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    cursor: pointer;
`;


        el.prepend(compactBar);
    }

    compactBar.onclick = () => {
        el.dataset.collapsed = "false";
        localStorage.setItem(collapsedKey, "false");
        updateNextStepCard();
    };





    compactBar.hidden = !collapsed;

    // The compact bar is only for the collapsed state.
    // Never show it above the expanded card.
    compactBar.style.display = collapsed ? "flex" : "none";


    // --------------------------------------------------
    // PAN — DRAG THE TO DO CARD AROUND THE CANVAS
    // --------------------------------------------------
    if (!el.dataset.panInitialized) {
        el.dataset.panInitialized = "true";

        const positionKey = "emf_workflow_next_step_position";
        const canvas = el.closest(".canvas-area") || el.parentElement;

        // Restore saved position, if one exists.
        try {
            const saved = JSON.parse(localStorage.getItem(positionKey) || "null");

            if (
                saved &&
                Number.isFinite(saved.left) &&
                Number.isFinite(saved.top)
            ) {
                el.style.left = `${saved.left}px`;
                el.style.top = `${saved.top}px`;
                el.style.right = "auto";
                el.style.bottom = "auto";
            }
        } catch (_) { }

        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        // Use the compact bar when collapsed, header when expanded.
        const getDragHandle = () =>
            el.dataset.collapsed === "true"
                ? el.querySelector(".workflow-next-compact")
                : el.querySelector(".workflow-next-heading");

        el.addEventListener("pointerdown", event => {
            const handle = getDragHandle();

            if (!handle || !handle.contains(event.target)) return;

            // In collapsed state, allow dragging the compact button itself.
            // In expanded state, only the non-button header area is draggable.
            if (
                el.dataset.collapsed !== "true" &&
                event.target.closest("button")
            ) {
                return;
            }


            if (event.button !== 0) return;

            const rect = el.getBoundingClientRect();
            const parentRect = el.offsetParent?.getBoundingClientRect();

            if (!parentRect) return;

            dragging = true;
            moved = false;
            startX = event.clientX;
            startY = event.clientY;
            startLeft = el.offsetLeft;
            startTop = el.offsetTop;

            el.dataset.panStartLeft = String(startLeft);
            el.dataset.panStartTop = String(startTop);


            el.style.cursor = "grabbing";
            el.style.zIndex = "40";

            if (el.dataset.collapsed === "true") {
                compactBar.setPointerCapture?.(event.pointerId);
            }

            event.preventDefault();

        });

        document.addEventListener("pointermove", event => {
            if (!dragging) return;

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;

            if (!moved) return;

            const parent = el.offsetParent;
            if (!parent) return;

            const maxLeft = Math.max(0, parent.clientWidth - el.offsetWidth);
            const maxTop = Math.max(0, parent.clientHeight - el.offsetHeight);

            el.style.left = `${Math.min(maxLeft, Math.max(0, startLeft + dx))}px`;
            el.style.top = `${Math.min(maxTop, Math.max(0, startTop + dy))}px`;
            el.style.right = "auto";
            el.style.bottom = "auto";
        });

        document.addEventListener("pointerup", () => {
            if (!dragging) return;

            dragging = false;
            el.style.cursor = "";
            el.style.zIndex = "";

            if (moved) {
                try {
                    localStorage.setItem(
                        positionKey,
                        JSON.stringify({
                            left: el.offsetLeft,
                            top: el.offsetTop
                        })
                    );
                } catch (_) { }
            }
        });
    }



    // Force the compact state to show only the reopen bar.
    const regularContent = el.querySelectorAll(
        ".workflow-next-heading, " +
        ".workflow-next-recommended-label, " +
        ".workflow-next-actions, " +
        ".workflow-next-summary, " +
        ".workflow-next-guide-link, " +
        ".workflow-next-guide"
    );

    regularContent.forEach(node => {
        if (collapsed) {
            node.style.setProperty("display", "none", "important");
        } else {
            node.style.removeProperty("display");
            node.hidden = false;
        }
    });

    el.style.setProperty(
        "padding",
        collapsed ? "10px 14px" : "",
        "important"
    );
    el.style.setProperty(
        "min-height",
        collapsed ? "0" : "",
        "important"
    );




    // Collapse button
    el.querySelector(".workflow-next-collapse")
        ?.addEventListener("click", () => {
            el.dataset.collapsed = "true";
            localStorage.setItem(collapsedKey, "true");
            updateNextStepCard();
        });

    // Close button — also leave the compact reopen bar
    el.querySelector(".workflow-next-close")
        ?.addEventListener("click", () => {
            el.dataset.collapsed = "true";
            localStorage.setItem(collapsedKey, "true");
            updateNextStepCard();
        });

    const guidePanel = el.querySelector(".workflow-next-guide");
    if (guidePanel) guidePanel.hidden = true;
    // --------------------------------------------------
    // ACTION CLICKS
    // Use the existing sidebar action.
    // --------------------------------------------------

    el.querySelectorAll("[data-workflow-action]").forEach(button => {
        button.addEventListener("click", () => {
            const actionId = button.dataset.workflowAction;
            const menuButton = document.getElementById(actionId);

            if (!menuButton || !isActionAvailable({ id: actionId })) {
                console.warn(
                    "Workflow action is not currently available:",
                    actionId
                );
                return;
            }


            // Set Scale must launch the real scale tool.
            // Other workflow actions continue using their sidebar buttons.
            if (actionId === "btnScale") {
                if (typeof window.startScaleTool === "function") {
                    window.startScaleTool();
                } else {
                    console.error("Set Scale: startScaleTool() is unavailable.");
                }
            } else {
                if (actionId === "btnStartMeasure") {
                    const floor = getCurrentFloor?.();
                    const rooms = floor?.rooms || [];
                    const currentRoom = AppState?.ui?.selectedRoom;

                    const activeRoom =
                        rooms.find(room => room.id === currentRoom?.id) ||
                        rooms.find(room =>
                            !getRoomMeasurementStats(room).canComplete
                        ) ||
                        rooms[rooms.length - 1] ||
                        null;

                    if (activeRoom) {
                        AppState.ui.selectedRoom = activeRoom;
                    }
                }

                menuButton.click();
            }


            // Scroll the sidebar so the corresponding action is visible.
            requestAnimationFrame(() => {
                const target = document.getElementById(actionId);

                if (!target || !target.isConnected) return;

                let parent = target.parentElement;
                let scroller = null;

                while (parent) {
                    const style = getComputedStyle(parent);

                    if (
                        parent.scrollHeight > parent.clientHeight &&
                        ["auto", "scroll"].includes(style.overflowY)
                    ) {
                        scroller = parent;
                        break;
                    }

                    parent = parent.parentElement;
                }

                if (!scroller) return;

                const targetRect = target.getBoundingClientRect();
                const scrollRect = scroller.getBoundingClientRect();

                if (targetRect.bottom > scrollRect.bottom) {
                    scroller.scrollTop +=
                        targetRect.bottom - scrollRect.bottom + 24;
                } else if (targetRect.top < scrollRect.top) {
                    scroller.scrollTop -=
                        scrollRect.top - targetRect.top + 24;
                }
            });
        });
    });

    // --------------------------------------------------
    // GUIDE CONTROLS
    // --------------------------------------------------

    el.querySelector(".workflow-next-guide-link")
        ?.addEventListener("click", () => {
            const guide = el.querySelector(".workflow-next-guide");

            if (guide) {
                guide.hidden = false;
                localStorage.setItem(guideKey, "true");
            }
        });

    el.querySelector(".workflow-next-guide-close")
        ?.addEventListener("click", () => {
            const guide = el.querySelector(".workflow-next-guide");

            if (guide) {
                guide.hidden = true;
            }
        });

    el.style.display = "block";
}

function getRoomWorkflowStatus(
    room
) {

    const hasRoom =
        true;

    const hasGrid =

        room.grid &&
        room.grid.length > 0;

    const stats =

        getRoomMeasurementStats(
            room
        );

    const hasMeasurements =

        stats.canComplete;

    return {

        room:
            hasRoom,

        grid:
            hasGrid,

        measure:
            hasMeasurements
    };
}


function getRoomNextStep(
    room
) {

    if (!room)
        return "Draw Room";

    const s =
        getRoomWorkflowStatus(
            room
        );

    if (!s.grid)
        return "Generate Grid";

    if (!s.measure)
        return "Measure Points";

    return "Add Sources";
}

// =====================
// 🔥 UPDATE PROGRESS UI
// =====================
function updateProgressUI() {

    const currentType =
        (
            activeMeasureType ||
            "all"
        ).toUpperCase();


    const el =
        document.getElementById(
            "progressContent"
        );

    console.log("PROGRESS UI CALLED", {
        elementFound: !!el,
        mode: AppState?.ui?.mode,
        selectedRoomId: AppState?.ui?.selectedRoom?.id
    });


    if (!el) {
        return;
    }


    const floor =
        getCurrentFloor?.();


    if (!floor) {

        el.innerHTML =
            "No floor";

        return;
    }


    let html =
        "";


    // ==================================================
    // TITLE
    // ==================================================

    html += `
        <div
            style="
                margin-bottom:10px;
                color:#93c5fd;
                font-weight:bold;
                font-size:13px;
            "
        >
            Measurement Progress
        </div>
    `;


    // ==================================================
    // FLOOR TITLE
    // ==================================================

    html += `
        <div
            style="
                margin-bottom:10px;
                color:#cbd5e1;
                font-size:12px;
            "
        >
            ${floor.name || "Floor"}
            • ${currentType}
        </div>
    `;


    // ==================================================
    // ROOMS
    // ==================================================

    const rooms =
        Array.isArray(
            floor.rooms
        )
            ? floor.rooms
            : [];


    rooms.forEach(room => {

        const points =
            Array.isArray(
                room.grid
            )
                ? room.grid
                : [];


        const total =
            points.length;


        // Skip rooms without grid
        if (!total) {
            return;
        }


        // ==================================================
        // COUNTERS
        // ==================================================

        let confirmed =
            0;

        let partial =
            0;

        let notMeasured =
            0;


        // ==================================================
        // POINT STATUS
        // ==================================================

        points.forEach(point => {

            /*
             * ALL
             *
             * Uses the canonical Measurement Profile
             * status.
             */

            if (
                currentType ===
                "ALL"
            ) {

                const status =
                    getMeasurementPointStatus?.(
                        point
                    );


                if (
                    status?.state ===
                    "confirmed"
                ) {

                    confirmed++;

                }

                else if (
                    status?.state ===
                    "partial"
                ) {

                    partial++;

                }

                else {

                    notMeasured++;
                }


                return;
            }


            // ==================================================
            // SPECIFIC MEASUREMENT TYPE
            // ==================================================

            const measurement =
                point.measurements?.[
                sessionId
                ] || {};


            let measured =
                false;


            if (
                currentType ===
                "RF"
            ) {

                measured =
                    measurement.rf !==
                    undefined &&
                    measurement.rf !==
                    null &&
                    measurement.rf !==
                    "";
            }


            else if (
                currentType ===
                "ELECTRIC"
            ) {

                measured =
                    measurement.electric !==
                    undefined &&
                    measurement.electric !==
                    null &&
                    measurement.electric !==
                    "";
            }


            else if (
                currentType ===
                "MAGNETIC"
            ) {

                measured =
                    measurement.magnetic !==
                    undefined &&
                    measurement.magnetic !==
                    null &&
                    measurement.magnetic !==
                    "";
            }


            if (measured) {

                confirmed++;

            }

            else {

                notMeasured++;
            }

        });


        // ==================================================
        // ROOM STATUS
        //
        // IMPORTANT:
        //
        // Complete = EVERY required point complete.
        //
        // We no longer use:
        // coverage >= 60%
        // ==================================================

        let roomState =
            "notMeasured";


        if (
            confirmed ===
            total
        ) {

            roomState =
                "complete";

        }

        else if (
            confirmed > 0 ||
            partial > 0
        ) {

            roomState =
                "partial";
        }


        // ==================================================
        // STATUS VISUAL
        // ==================================================

        let color =
            "#9ca3af";


        let statusText =
            "Not measured";


        if (
            roomState ===
            "partial"
        ) {

            color =
                "#2563eb";

            statusText =
                "Continue";

        }


        else if (
            roomState ===
            "complete"
        ) {

            color =
                "#16a34a";

            statusText =
                "✓ Complete";
        }


        // ==================================================
        // ROOM CARD
        // ==================================================


        const isActiveMeasuringRoom =
            (
                AppState?.ui?.mode === "measure" ||
                AppState?.ui?.mode === "roomMeasure"
            ) &&
            AppState?.ui?.selectedRoom?.id === room.id;

        console.log("ACTIVE ROOM CARD CHECK", {
            mode: AppState?.ui?.mode,
            selectedRoomId: AppState?.ui?.selectedRoom?.id,
            cardRoomId: room.id,
            isActiveMeasuringRoom
        });

        console.log("WORKFLOW.JS ROOM CARD CODE LOADED");

        html += `
    <div
        style="
            margin-bottom:8px;
            padding:8px;
            border-radius:8px;
            background:${isActiveMeasuringRoom ? "#1e3a5f" : "#1f2937"};
            border-left:4px solid ${color};
            ${isActiveMeasuringRoom ? "outline:2px solid #3b82f6; outline-offset:1px;" : ""}
        "
    >


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:8px;
                        color:white;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    <span>
                        ${room.name || "Room"}
                    </span>

                    <span
                        style="
                            color:${color};
                            font-size:12px;
                        "
                    >
                        ${statusText}
                    </span>

                </div>


                <div
                    style="
                        margin-top:5px;
                        font-size:12px;
                        color:#9ca3af;
                    "
                >

                    ${confirmed}/${total}
                    ${currentType}

                </div>


                ${partial > 0
                ?
                `
                    <div
                        style="
                            margin-top:3px;
                            font-size:11px;
                            color:#60a5fa;
                        "
                    >
                        ${partial}
                        partial
                    </div>
                    `
                :
                ""
            }


                ${notMeasured > 0
                ?
                `
                    <div
                        style="
                            margin-top:3px;
                            font-size:11px;
                            color:#94a3b8;
                        "
                    >
                        ${notMeasured}
                        not measured
                    </div>
                    `
                :
                ""
            }

            </div>
        `;
    });


    // ==================================================
    // RENDER
    // ==================================================

    el.innerHTML =
        html;
}


function updateRoomGuidance() {

    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;

    let guidanceText = "";

    if (!rooms || rooms.length === 0) return;

    rooms.forEach((room, i) => {

        const area = getRoomArea(room);

        const hasSleep =
            roomHasZone(
                room,
                "sleep"
            );

        const hasWork =
            roomHasZone(
                room,
                "work"
            );

        const hasChild =
            roomHasZone(
                room,
                "child"
            );

        let gridRec = "1m";
        let minPts = 10;

        if (area < 10) {
            gridRec = "0.5m";
            minPts = 6;
        }
        else if (area < 30) {
            gridRec = "1m";
            minPts = 10;
        }
        else {
            gridRec = "2m";
            minPts = 15;
        }

        let extra = "";

        if (hasSleep) {

            extra +=
                "\n• Sleep zone → HIGH precision (0.5m)";
        }

        if (hasChild) {

            extra +=
                "\n• Child zone → HIGH precision (0.5m)";
        }

        if (hasWork) {
            extra += "\n• Work zone → MEDIUM precision (1m)";
        }

        guidanceText +=
            `Room ${i + 1}:
        Grid: ${gridRec}
        Min points: ${minPts}${extra}

      `;
    });

    const el = document.getElementById("guideText");

    if (el) {
        el.innerText = guidanceText;
    }
}


function updateFlow() {
    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;

    // nuimam highlight nuo visų
    document.querySelectorAll(".next-step").forEach(el => {
        el.classList.remove("next-step");
    });

    // =====================
    // STEP 1 — SCALE
    // =====================
    if (!scaleSet) {


        setGuide("👉 Set scale first");
        return;
    }

    // =====================
    // STEP 2 — ROOM
    // =====================
    if (!rooms.length) {
        document.getElementById("btnRoom")?.classList.add("next-step");

        setGuide("👉 Draw your room");
        return;
    }

    // =====================
    // STEP 3 — GRID
    // =====================
    if (!rooms.some(r => r.grid && r.grid.length)) {
        document.querySelector("button[onclick='generateGrid()']")
            ?.classList.add("next-step");

        setGuide("👉 Generate grid");
        return;
    }

    // =====================
    // STEP 4 — MEASURE
    // =====================
    document.getElementById("btnMeasure")?.classList.add("next-step");

    setGuide("👉 Start measuring");
}

function getWorkflowSteps() {

    const mode =

        AppState.ui.mode ||
        "home";

    return (

        workflowConfig[mode] ||
        workflowConfig.home
    );
}

function setWorkflowStep(
    step
) {

    AppState.ui.currentStep =
        step;

    console.log(
        "WORKFLOW STEP:",
        step
    );

    updateWorkflowUI?.();
}


// =====================
function highlightNextStep() {


    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;

    document.querySelectorAll(".next-step").forEach(el => {
        el.classList.remove("next-step");
    });

    if (!scale || scale === 1) {

        return;
    }

    if (!rooms || rooms.length === 0) {
        document.getElementById("btnRoom")?.classList.add("next-step");
        return;
    }

    if (!rooms.some(r => r.grid && r.grid.length > 0)) {
        document.querySelector("button[onclick='generateGrid()']")?.classList.add("next-step");
        return;
    }

    document.getElementById("btnMeasure")?.classList.add("next-step");
}


function updateBusinessGuideText() {
    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;


    const el = document.getElementById("guideText");
    if (!el) return;

    if (!scaleSet) {
        el.innerText = "➡️ Set scale first";
        return;
    }

    if (!rooms.length) {
        el.innerText = "➡️ Draw your room";
        return;
    }

    if (!rooms[0].grid || rooms[0].grid.length === 0) {
        el.innerText = "➡️ Generate grid";
        return;
    }

    el.innerText = "➡️ Start measuring";
}

function updateMeasurementWorkflowUIVisibility() {

    // ==================================================
    // ELEMENTS
    // ==================================================

    const info =
        document.getElementById(
            "measureInfo"
        );


    const buttons = [

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


    // ==================================================
    // CURRENT WORKFLOW MODE
    // ==================================================

    const mode =
        AppState?.ui?.mode || "";


    const isMeasuring =
        mode === "measure" ||
        mode === "roomMeasure" ||
        mode === "zoneMeasure";


    console.log(
        "MEASUREMENT WORKFLOW UI",
        {
            mode,
            isMeasuring
        }
    );


    // ==================================================
    // MEASUREMENT INFO VISIBILITY
    //
    // The panel belongs to the active
    // measurement workflow.
    // ==================================================

    if (info) {

        info.style.display =
            isMeasuring
                ? "flex"
                : "none";
    }


    // ==================================================
    // MEASUREMENT TYPE BUTTONS
    //
    // ALL / RF / E / M are map-view controls.
    //
    // They remain available in idle mode.
    // ==================================================

    buttons.forEach(
        button => {

            if (!button) {
                return;
            }


            button.disabled =
                false;


            button.classList.remove(
                "disabled"
            );
        }
    );


    // ==================================================
    // REFRESH MEASUREMENT CONTENT
    // ==================================================

    if (
        isMeasuring
    ) {

        updateMeasurementInfo?.();
    }
}

function showMeasurementProfilePopup() {

    console.log(
        "🔥 SHOW MEASUREMENT PROFILE POPUP"
    );


    let popup =
        document.getElementById(
            "measurementProfilePopup"
        );


    // ==================================================
    // CREATE POPUP IF NEEDED
    // ==================================================

    if (!popup) {

        popup =
            document.createElement(
                "div"
            );

        popup.id =
            "measurementProfilePopup";

        document.body.appendChild(
            popup
        );
    }


    // ==================================================
    // CURRENT PROFILE
    // ==================================================

    const currentProfile =
        AppState.project
            ?.measurementProfile ||
        {
            rf: true,
            electric: false,
            magnetic: false
        };


    // ==================================================
    // POPUP HTML
    // ==================================================

    popup.innerHTML = `

        <div
            style="
                width:400px;
                max-width:calc(100vw - 32px);
                box-sizing:border-box;

                background:#ffffff;

                border:1px solid #e2e8f0;
                border-radius:14px;

                box-shadow:
                    0 18px 45px rgba(15,23,42,.18);

                padding:16px;
            "
        >

            <!-- HEADER -->

            <div
                style="
                    font-size:16px;
                    font-weight:650;
                    color:#0f172a;
                    margin-bottom:5px;
                "
            >
                Measurement Profile
            </div>


            <div
                style="
                    font-size:11px;
                    line-height:1.4;
                    color:#64748b;
                    margin-bottom:13px;
                "
            >
                Select which measurement types will be
                collected during this assessment.
            </div>


            <!-- OPTIONS -->

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:6px;
                "
            >

                <!-- RF -->

                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:9px;

                        padding:9px 10px;

                        border:1px solid #dbe3ec;
                        border-radius:8px;

                        cursor:pointer;
                        background:#f8fafc;
                    "
                >

                    <input
                        id="measurementProfileRF"
                        type="checkbox"
                        ${currentProfile.rf ? "checked" : ""}
                        style="
                            width:16px;
                            height:16px;
                            accent-color:#2563eb;
                            flex:0 0 16px;
                        "
                    >

                    <div>

                        <div
                            style="
                                font-size:12px;
                                font-weight:600;
                                color:#1e293b;
                            "
                        >
                            RF
                        </div>

                        <div
                            style="
                                font-size:9px;
                                color:#64748b;
                                margin-top:1px;
                            "
                        >
                            Radio frequency / wireless sources
                        </div>

                    </div>

                </label>


                <!-- ELECTRIC -->

                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:9px;

                        padding:9px 10px;

                        border:1px solid #dbe3ec;
                        border-radius:8px;

                        cursor:pointer;
                        background:#f8fafc;
                    "
                >

                    <input
                        id="measurementProfileElectric"
                        type="checkbox"
                        ${currentProfile.electric ? "checked" : ""}
                        style="
                            width:16px;
                            height:16px;
                            accent-color:#2563eb;
                            flex:0 0 16px;
                        "
                    >

                    <div>

                        <div
                            style="
                                font-size:12px;
                                font-weight:600;
                                color:#1e293b;
                            "
                        >
                            Electric
                        </div>

                        <div
                            style="
                                font-size:9px;
                                color:#64748b;
                                margin-top:1px;
                            "
                        >
                            Low-frequency electric field
                        </div>

                    </div>

                </label>


                <!-- MAGNETIC -->

                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:9px;

                        padding:9px 10px;

                        border:1px solid #dbe3ec;
                        border-radius:8px;

                        cursor:pointer;
                        background:#f8fafc;
                    "
                >

                    <input
                        id="measurementProfileMagnetic"
                        type="checkbox"
                        ${currentProfile.magnetic ? "checked" : ""}
                        style="
                            width:16px;
                            height:16px;
                            accent-color:#2563eb;
                            flex:0 0 16px;
                        "
                    >

                    <div>

                        <div
                            style="
                                font-size:12px;
                                font-weight:600;
                                color:#1e293b;
                            "
                        >
                            Magnetic
                        </div>

                        <div
                            style="
                                font-size:9px;
                                color:#64748b;
                                margin-top:1px;
                            "
                        >
                            Low-frequency magnetic field
                        </div>

                    </div>

                </label>

            </div>


            <!-- INFO -->

            <div
                style="
                    margin-top:11px;

                    padding:8px 9px;

                    border:1px solid #e2e8f0;
                    border-radius:7px;

                    background:#f8fafc;

                    font-size:9px;
                    line-height:1.4;
                    color:#64748b;
                "
            >
                Only selected measurement types will be
                considered part of the measurement profile.
                Unselected types are treated as
                <b>not collected</b>, not as zero or low risk.
            </div>


            <!-- ACTIONS -->

            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:7px;

                    margin-top:14px;
                "
            >

                <button
                    type="button"
                    onclick="
                        closeMeasurementProfilePopup();
                    "
                    style="
                        height:30px;

                        padding:5px 12px;

                        border:1px solid #cbd5e1;
                        border-radius:6px;

                        background:#ffffff;
                        color:#64748b;

                        font-size:11px;
                        font-weight:500;

                        cursor:pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    onclick="
                        confirmMeasurementProfile();
                    "
                    style="
                        height:30px;

                        padding:5px 14px;

                        border:1px solid #2563eb;
                        border-radius:6px;

                        background:#2563eb;
                        color:#ffffff;

                        font-size:11px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Continue
                </button>

            </div>

        </div>
    `;


    // ==================================================
    // FULL-SCREEN MODAL OVERLAY
    // ==================================================

    popup.style.position =
        "fixed";

    popup.style.inset =
        "0";

    popup.style.width =
        "100vw";

    popup.style.height =
        "100vh";

    popup.style.boxSizing =
        "border-box";

    popup.style.display =
        "flex";

    popup.style.alignItems =
        "center";

    popup.style.justifyContent =
        "center";

    popup.style.padding =
        "16px";

    popup.style.background =
        "rgba(15, 23, 42, 0.45)";

    popup.style.zIndex =
        "10000";

    popup.style.transform =
        "none";


    // ==================================================
    // KEYBOARD SUPPORT
    // ==================================================

    popup.tabIndex =
        -1;

    popup.onkeydown =
        function (event) {

            // ENTER = CONTINUE
            if (
                event.key === "Enter" &&
                event.target?.tagName !== "TEXTAREA"
            ) {

                event.preventDefault();

                confirmMeasurementProfile();

                return;
            }


            // ESC = CANCEL
            if (
                event.key === "Escape"
            ) {

                event.preventDefault();

                closeMeasurementProfilePopup();
            }
        };

    popup.focus();
}

function confirmMeasurementProfile() {

    console.log(
        "🔥 CONFIRM MEASUREMENT PROFILE"
    );


    // ==================================================
    // READ PROFILE
    // ==================================================

    const rf =
        document.getElementById(
            "measurementProfileRF"
        )?.checked === true;


    const electric =
        document.getElementById(
            "measurementProfileElectric"
        )?.checked === true;


    const magnetic =
        document.getElementById(
            "measurementProfileMagnetic"
        )?.checked === true;


    // ==================================================
    // AT LEAST ONE REQUIRED
    // ==================================================

    if (
        !rf &&
        !electric &&
        !magnetic
    ) {

        alert(
            "Select at least one measurement type."
        );

        return;
    }


    // ==================================================
    // SAVE PROFILE
    // ==================================================

    const profile = {

        rf,

        electric,

        magnetic

    };


    AppState.project.measurementProfile =
        profile;


    updateMeasurementProfileUI?.();


    console.log(
        "🔥🔥🔥 MEASUREMENT PROFILE SAVED",
        profile
    );


    // ==================================================
    // REMEMBER WHETHER THIS PROFILE WAS REQUIRED
    // TO START ROOM MEASURING
    // ==================================================

    const returnToMeasurement =
        window.measurementProfileReturnToMeasurement === true;


    // Clear immediately so a normal manual
    // Profile edit does not accidentally
    // restart measurement later.

    window.measurementProfileReturnToMeasurement =
        false;


    // ==================================================
    // CLOSE POPUP
    // ==================================================

    closeMeasurementProfilePopup();


    // ==================================================
    // SAVE PROJECT
    // ==================================================

    saveProject?.();


    // ==================================================
    // CONTINUE ROOM MEASUREMENT
    //
    // IMPORTANT:
    //
    // Do NOT manually set only:
    //
    //     AppState.ui.mode = "measure"
    //
    // because the complete measurement
    // initialization lives in
    // startBusinessMeasurementFlow().
    // ==================================================

    if (
        returnToMeasurement
    ) {

        console.log(
            "🔥 CONTINUE ROOM MEASUREMENT AFTER PROFILE"
        );


        startBusinessMeasurementFlow?.();

        return;
    }


    // ==================================================
    // NORMAL PROFILE EDIT
    //
    // If the user opened Measurement Profile
    // directly from the secondary settings row,
    // do NOT unexpectedly enter measurement mode.
    // ==================================================

    requestRender?.();

    window.updateWorkflowUI?.();


    updateStatus?.(
        "📶 Measurement profile selected"
    );
}

function closeMeasurementProfilePopup() {

    const popup =
        document.getElementById(
            "measurementProfilePopup"
        );

    if (!popup) {
        return;
    }

    popup.style.display =
        "none";
}


function updateWorkflowUI() {


    // ==================================================
    // 🔥 HOME FLOOR TABS VISIBILITY
    // ==================================================

    const homeFloorTabs =
        document.getElementById(
            "homeFloorTabs"
        );

    if (homeFloorTabs) {

        homeFloorTabs.style.display =
            AppMode.current === "business"
                ? "none"
                : "";
    }

    // ==================================================
    // 🔥 HOME MODE
    // ==================================================

    if (
        AppMode.current ===
        "home"
    ) {

        // ==================================================
        // 🔥 HOME CURRENT FLOOR
        // ==================================================

        const homeFloor =
            AppState.project
                ?.floors?.[
            AppState.project
                ?.currentFloorIndex || 0
            ];

        // ==================================================
        // 🔥 HOME SCALE BUTTON
        // ==================================================

        const homeScaleBtn =
            document.getElementById(
                "btnScale"
            );

        if (
            homeScaleBtn
        ) {

            // ------------------------------------------------
            // Reset possible Business state
            // ------------------------------------------------

            homeScaleBtn.style.display =
                "none";

            homeScaleBtn.disabled =
                false;

            homeScaleBtn.classList.remove(
                "active"
            );

            // ------------------------------------------------
            // Home has plan but scale is not confirmed
            // ------------------------------------------------

            const homeHasPlan =
                !!homeFloor?.image;

            const homeHasScale =
                homeFloor?.scaleConfirmed === true;

            if (
                homeHasPlan &&
                !homeHasScale
            ) {

                homeScaleBtn.style.display =
                    "flex";

                homeScaleBtn.classList.add(
                    "next-step"
                );

            }
            else {

                homeScaleBtn.classList.remove(
                    "next-step"
                );
            }

            console.error(
                "🔥 HOME SCALE STATE",
                {
                    floor:
                        homeFloor?.name,

                    hasPlan:
                        homeHasPlan,

                    hasScale:
                        homeHasScale,

                    scaleConfirmed:
                        homeFloor?.scaleConfirmed,

                    currentScale:
                        homeFloor?.currentScale,

                    scaleButtonVisible:
                        homeScaleBtn.style.display
                }
            );
        }

        // ==================================================
        // 🔥 HOME WORKFLOW
        // ==================================================

        window.updateHomeWorkflow?.();

        window.updateHomeLocks?.();

        window.updateHomeSidebarStatus?.();

        return;
    }

    // ==================================================
    // 🔥 BUSINESS MODE ONLY
    // ==================================================

    if (
        AppMode.current !==
        "business"
    ) {
        return;
    }

    const businessWorkflowBar =
        document.getElementById(
            "businessWorkflowBar"
        );

    businessWorkflowBar?.classList.remove(
        "hidden-workflow"
    );

    // ==================================================
    // 🔥 CURRENT FLOOR
    // ==================================================

    const project =
        AppState.businessProject ||
        AppState.project;

    const floor =
        project?.floors?.[
        project?.currentFloorIndex || 0
        ];

    if (!floor) {
        return;
    }

    // ==================================================
    // 🔥 BUSINESS ACTION BUTTONS
    // ==================================================

    const scaleBtn =
        document.getElementById(
            "btnScale"
        );

    const drawBtn =
        document.getElementById(
            "btnDrawRooms"
        );

    const gridBtn =
        document.getElementById(
            "btnGenerateGrid"
        );

    const zoneBtn =
        document.getElementById(
            "btnAddZone"
        );

    const measureBtn =
        document.getElementById(
            "btnStartMeasure"
        );

    const zoneMeasureBtn =
        document.getElementById(
            "btnStartZoneMeasure"
        );

    const zoneGridBtn =
        document.getElementById(
            "btnGenerateZoneGrid"
        );

    const sourceBtn =
        document.getElementById(
            "btnAddSources"
        );

    // ==================================================
    // 🔥 STATES
    // ==================================================

    const hasPlan =
        !!floor.image;

    console.log(
        "🔥 REFRESH FLOOR STATE",
        {
            hasPlan,
            image: floor.image,
            floor
        }
    );

    // ==================================================
    // 🔥 BUSINESS ASSESSMENT WORKSPACE
    // ==================================================
    //
    // Assessment actions are always visible.
    // Before a floor plan exists they are locked.
    // This keeps the workflow visible without allowing
    // the user to start measurement actions too early.
    //

    const assessmentWorkspace =
        document.getElementById(
            "businessAssessmentWorkspace"
        );

    if (assessmentWorkspace) {

        assessmentWorkspace.style.display =
            "block";
    }

    // IMPORTANT:
    // currentScale alone is NOT a completed scale.
    //
    // Scale is complete only when explicitly confirmed.

    const hasScale =
        floor.scaleConfirmed === true;

    const hasRooms =
        Array.isArray(floor.rooms) &&
        floor.rooms.length > 0;

    const hasZones =
        Array.isArray(floor.zones) &&
        floor.zones.length > 0;

    const zonesMeasured =
        areAllZonesMeasured();

    const zoneCount =
        floor.zones?.length || 0;

    const hasZoneMeasurements =
        (floor.zones || []).some(
            z =>
                z.grid?.some(
                    p => p.completed
                )
        );

    let assessmentConfidence =
        60;

    if (zoneCount > 0) {
        assessmentConfidence = 80;
    }

    if (hasZoneMeasurements) {
        assessmentConfidence = 95;
    }

    // ==================================================
    // 🔥 ROOM GRID EXISTS
    // ==================================================

    const hasGrid =
        floor.rooms?.length > 0 &&
        floor.rooms.every(
            room =>
                Array.isArray(room.grid) &&
                room.grid.length > 0
        );

    // ==================================================
    // 🔥 ZONE GRID EXISTS
    //
    // Zone Grid is now generated automatically.
    //
    // There is no longer a workflow step for
    // "Generate Zone Grid".
    //
    // This flag only tells us whether at least
    // one real Zone Grid exists.
    // ==================================================

    const hasZoneGrid =
        (floor.zones || []).some(
            zone =>
                Array.isArray(zone.grid) &&
                zone.grid.length > 0
        );

    const activeRoom =
        AppState.ui.selectedRoom ||
        floor.rooms?.[0];

    const hasMeasurements =
        areAllRoomsMeasured();

    const hasSources =
        Array.isArray(floor.sources) &&
        floor.sources.length > 0;

    // ==================================================
    // 🔥 STEP MAP
    // ==================================================

    const steps = {

        plan:
            hasPlan,

        scale:
            hasScale,

        rooms:
            hasRooms &&
            hasGrid,

        zones:
            hasZones
                ? hasZoneGrid
                : true,

        measure:
            areAllRoomsMeasured(),

        sources:
            hasSources
    };

    // ==================================================
    // 🔥 ACTIVE STEP
    // ==================================================
    let activeStep = "plan";

    if (!hasPlan) {
        activeStep = "plan";
    }
    else if (!hasScale) {
        activeStep = "scale";
    }
    else if (!hasRooms) {
        activeStep = "rooms";
    }
    else if (!hasGrid) {
        activeStep = "grid";
    }
    else if (!areAllRoomsMeasured()) {
        activeStep = "measure";
    }
    else if (!hasSources) {
        activeStep = "sources";
    }
    else {
        activeStep = "review";
    }

    console.log(
        "🔥 WORKFLOW AFTER STATE CALC",
        {
            hasPlan,
            hasScale,
            hasRooms,
            hasGrid,
            activeStep,
            floorImage: !!floor.image,
            scaleConfirmed: floor.scaleConfirmed
        }
    );

    // ==================================================
    // 🔥 RESET ACTION VISIBILITY
    // ==================================================
    //
    // Plan actions may be hidden until their prerequisite.
    // Assessment Workspace actions stay visible at all times.
    // Their availability is controlled separately by
    // workflow-locked / disabled state.
    //
    // Measurement Profile is always visible.
    // ==================================================


    // --------------------------------------------------
    // PLAN ACTIONS
    // --------------------------------------------------

    if (scaleBtn) {

        scaleBtn.style.display =
            "none";
    }


    // --------------------------------------------------
    // ASSESSMENT WORKSPACE ACTIONS
    // --------------------------------------------------
    //
    // These must NEVER be hidden.
    // They are either available or locked.
    //

    [
        drawBtn,
        gridBtn,
        zoneBtn,
        zoneMeasureBtn,
        measureBtn,
        sourceBtn
    ].forEach(btn => {

        if (btn) {

            btn.style.display =
                "flex";
        }
    });


    // --------------------------------------------------
    // LEGACY ZONE GRID
    // --------------------------------------------------

    if (zoneGridBtn) {

        zoneGridBtn.style.display =
            "none";
    }


    // ==================================================
    // 🔥 ASSESSMENT WORKSPACE — LOCK STATE
    // ==================================================
    //
    // Locked = visible + muted + disabled.
    // No padlock icon.
    // No monetization styling.
    //

    const sourceDebug =
        document.getElementById("btnAddSources");

    if (sourceDebug) {
        sourceDebug.style.pointerEvents = "auto";
    }

    const assessmentActions = [
        drawBtn,
        gridBtn,
        zoneBtn,
        measureBtn,
        zoneMeasureBtn
    ];


    assessmentActions.forEach(btn => {

        if (!btn) {
            return;
        }

        btn.classList.remove(
            "workflow-locked"
        );

        btn.disabled = false;

        btn.style.pointerEvents =
            "auto";
    });


    // --------------------------------------------------
    // BEFORE FLOOR PLAN
    // --------------------------------------------------

    if (!hasPlan) {

        [
            drawBtn,
            gridBtn,
            zoneBtn,
            measureBtn,
            zoneMeasureBtn,

        ].forEach(btn => {

            if (!btn) {
                return;
            }

            btn.classList.add(
                "workflow-locked"
            );

            btn.disabled = true;

            btn.style.pointerEvents =
                "none";
        });
    }


    // --------------------------------------------------
    // FLOOR PLAN EXISTS, SCALE NOT CONFIRMED
    // --------------------------------------------------

    else if (!hasScale) {

        [
            drawBtn,
            gridBtn,
            zoneBtn,
            measureBtn,
            zoneMeasureBtn,

        ].forEach(btn => {

            if (!btn) {
                return;
            }

            btn.classList.add(
                "workflow-locked"
            );

            btn.disabled = true;

            btn.style.pointerEvents =
                "none";
        });
    }

    // --------------------------------------------------
    // SCALE
    // --------------------------------------------------

    if (scaleBtn) {
        const needsScale = hasPlan && !hasScale;

        scaleBtn.style.display = needsScale ? "flex" : "none";
        scaleBtn.classList.toggle("scale-needed-pulse", needsScale);
    }


    // --------------------------------------------------
    // POST-SCALE ACTIONS
    // --------------------------------------------------

    if (hasScale) {

        if (drawBtn) {

            drawBtn.style.display =
                "flex";
        }

        if (gridBtn) {

            const roomsNeedGrid =
                floor.rooms.some(
                    room =>
                        !room.grid?.length
                );

            if (roomsNeedGrid) {

                gridBtn.style.display =
                    "flex";
            }
        }

        if (measureBtn) {

            measureBtn.style.display =
                (
                    hasRooms &&
                    hasGrid
                )
                    ? "flex"
                    : "none";
        }

        if (zoneBtn) {

            zoneBtn.style.display =
                (
                    hasRooms &&
                    hasGrid
                )
                    ? "flex"
                    : "none";
        }

        if (zoneGridBtn) {

            zoneGridBtn.style.display =
                "none";
        }

        const hasMeasurableZones =
            hasZones &&
            hasZoneGrid;

        if (zoneMeasureBtn) {

            zoneMeasureBtn.style.display =
                (
                    hasGrid &&
                    hasMeasurableZones
                )
                    ? "flex"
                    : "none";
        }


        // SOURCES
        if (sourceBtn) {
            const roomsNeedGrid = (floor.rooms || []).some(
                room => !room.grid?.length
            );

            sourceBtn.style.display =
                hasScale && hasRooms && !roomsNeedGrid
                    ? "flex"
                    : "none";
        }

    }

    // ==================================================
    // RESET OLD / LEGACY HIGHLIGHT STATES
    // ==================================================

    document
        .querySelectorAll(
            "#businessProjectActions .workflow-action-btn, " +
            "#businessPlanActions .workflow-action-btn, " +
            "#businessAssessmentWorkspace .workflow-action-btn"
        )
        .forEach(btn => {

            btn.classList.remove(
                "workflow-required",
                "next-step",
                "active-step",
                "workflow-next-action"
            );

        });




    // ==================================================
    // 🔥 BUSINESS SIDEBAR — LOCKED STATES
    //
    // Locked actions remain visible so the user can see
    // the workflow, but cannot start a step before its
    // prerequisite is complete.
    //
    // IMPORTANT:
    // This is a workflow state only.
    // It is NOT the monetization lock.
    // ==================================================

    const businessActionStates = {

        // ------------------------------------------------
        // DRAW ROOMS
        // Requires confirmed floor scale.
        // ------------------------------------------------

        btnDrawRooms:
            hasScale,

        // ------------------------------------------------
        // ROOM GRID
        // Requires at least one room.
        // ------------------------------------------------

        btnGenerateGrid:
            hasRooms,

        // ------------------------------------------------
        // ADD / MANAGE ZONES
        // Requires room grid.
        // ------------------------------------------------

        btnAddZone:
            hasRooms &&
            hasGrid,

        // ------------------------------------------------
        // ROOM MEASURING
        // Requires room grid.
        // ------------------------------------------------

        btnStartMeasure:
            hasRooms &&
            hasGrid,

        // ------------------------------------------------
        // ZONE MEASURING
        // Requires zones + zone grid.
        // ------------------------------------------------

        btnStartZoneMeasure:
            hasZones &&
            hasZoneGrid,

        // ------------------------------------------------
        // SOURCES
        // Sources become available after room
        // measurements are complete.
        // ------------------------------------------------

        btnAddSources:
            hasScale
    };


    // ==================================================
    // APPLY LOCKED / AVAILABLE STATE
    // ==================================================


    // ==================================================
    // SIDEBAR — STABLE BLUE OUTLINE, NO PULSE
    // ==================================================

    const sidebarOutlineIds = [
        "btnDrawRooms",
        "btnAddZone",
        "btnStartMeasure",
        "btnStartZoneMeasure",
        "btnAddSources"
    ];

    sidebarOutlineIds.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        btn.classList.remove("workflow-available-outline");
    });


    Object.entries(
        businessActionStates
    )
        .forEach(
            ([id, available]) => {

                console.error(
                    "🔥 SOURCES LOCK DEBUG",
                    {
                        hasScale,
                        hasMeasurements,
                        sourceState:
                            businessActionStates.btnAddSources,

                        sourceElement:
                            document.getElementById(
                                "btnAddSources"
                            ),

                        sourceClasses:
                            document.getElementById(
                                "btnAddSources"
                            )?.className,

                        sourceDisplay:
                            document.getElementById(
                                "btnAddSources"
                            )?.style.display
                    }
                );

                const btn =
                    document.getElementById(id);

                if (!btn) {
                    return;
                }

                // ------------------------------------------------
                // RESET
                // ------------------------------------------------

                btn.classList.remove(
                    "workflow-locked"
                );

                btn.disabled =
                    false;


                // ------------------------------------------------
                // LOCK
                // ------------------------------------------------

                if (!available) {
                    btn.classList.add("workflow-locked");
                    btn.disabled = true;
                } else if (sidebarOutlineIds.includes(id)) {
                    btn.classList.add("workflow-available-outline");

                    console.log("BLUE OUTLINE DEBUG", {
                        id,
                        available,
                        classes: btn.className
                    });
                }

            }
        );

    console.error(
        "🔥 SOURCES AFTER LOCK PROCESS",
        {
            hasScale,

            sourceState:
                businessActionStates.btnAddSources,

            sourceClasses:
                document.getElementById(
                    "btnAddSources"
                )?.className,

            sourceDisplay:
                document.getElementById(
                    "btnAddSources"
                )?.style.display,

            sourceOpacity:
                document.getElementById(
                    "btnAddSources"
                )?.style.opacity
        }
    );

    // ==================================================
    // 🔥 ROOM GRID DENSITY
    // ==================================================

    const roomGridBlock =
        document.getElementById(
            "roomGridDensityBlock"
        );

    if (roomGridBlock) {

        const selectedRoom =
            AppState.ui.selectedRoom ||
            floor.rooms?.[0];

        const roomHasZones =
            (floor.zones || []).some(
                zone =>
                    zone.roomId ===
                    selectedRoom?.id
            );

        const roomsNeedGrid =
            floor.rooms.some(
                room =>
                    !room.grid?.length
            );

        roomGridBlock.style.display =

            (
                hasScale &&
                roomsNeedGrid &&
                !roomHasZones
            )
                ? "block"
                : "none";
    }

    // ==================================================
    // 🔥 BUSINESS — NEXT ACTION HIGHLIGHT
    // ==================================================
    //
    // Visibility is resolved first.
    // Highlight is applied afterwards.
    //



    const nextActionButtonId = {

        plan:
            "btnUploadPlan",

        scale:
            "btnScale",

        rooms:
            "btnDrawRooms",

        grid:
            "btnGenerateGrid",

        zones:
            "btnAddZone",

        measure:
            "btnStartMeasure",

        sources:
            "btnAddSources"
    };



    document
        .querySelectorAll(
            ".workflow-next-action"
        )
        .forEach(btn => {

            btn.classList.remove(
                "workflow-next-action"
            );

        });


    const nextActionId =
        nextActionButtonId[
        activeStep
        ];


    const nextActionButton =
        nextActionId
            ? document.getElementById(
                nextActionId
            )
            : null;


    if (
        nextActionButton &&
        !nextActionButton.disabled &&
        nextActionButton.style.display !== "none"
    ) {
        nextActionButton.classList.add(
            "workflow-next-action"
        );

        console.log(
            "🔥 NEXT ACTION",
            {
                activeStep,
                nextActionId,
                buttonClasses: nextActionButton.className
            }
        );
    }


    // ==================================================
    // ACTIVE SIDEBAR ACTION — CURRENT MODE
    // ==================================================

    const currentMode = AppState?.ui?.mode;

    const activeButtonByMode = {
        measure: "btnStartMeasure",
        zoneMeasure: "btnStartZoneMeasure",
        sources: "btnAddSources",
        grid: "btnGenerateGrid"
    };

    document.querySelectorAll(
        "#businessAssessmentWorkspace .workflow-action-btn.active-step"
    ).forEach(btn => {
        btn.classList.remove("active-step");
    });

    const activeButtonId = activeButtonByMode[currentMode];
    const activeButton = activeButtonId
        ? document.getElementById(activeButtonId)
        : null;

    if (activeButton && !activeButton.disabled) {
        activeButton.classList.add("active-step");
    }


    // ==================================================
    // 🔥 BUSINESS WORKFLOW ITEMS
    // ==================================================

    /*
     * REVIEW
     * --------------------------------------------------
     * Review is a monetized / gated step.
     *
     * It remains visible in the workflow at all times,
     * but stays locked until the product unlock condition
     * is introduced.
     *
     * Future:
     *     reviewUnlocked === true
     *
     * can be connected to subscription / purchase state.
     */

    const reviewUnlocked = false;


    document
        .querySelectorAll(
            "#businessWorkflowBar .workflow-item"
        )
        .forEach(el => {

            const step =
                el.getAttribute(
                    "data-step"
                );

            if (!step) {
                return;
            }


            // ==================================================
            // RESET WORKFLOW STATE
            // ==================================================

            el.querySelector(
                ".workflow-current"
            )?.remove();

            el.classList.remove(
                "active",
                "done",
                "locked",
                "recommended",
                "next"
            );


            // ==================================================
            // REVIEW — MONETIZATION GATE
            // ==================================================

            if (
                step === "review" &&
                !reviewUnlocked
            ) {

                el.classList.add(
                    "locked"
                );

                return;
            }


            // ==================================================
            // DONE
            // ==================================================

            if (
                steps[step]
            ) {

                el.classList.add(
                    "done"
                );
            }


            // ==================================================
            // RECOMMENDED SOURCES
            // ==================================================

            if (
                step === "sources"
            ) {

                el.classList.add(
                    "recommended"
                );
            }


            // ==================================================
            // ACTIVE
            // ==================================================

            if (
                step === activeStep
            ) {

                el.classList.add(
                    "active"
                );

                el.insertAdjacentHTML(
                    "beforeend",
                    `
                <div class="workflow-current">
                    CURRENT
                </div>
                `
                );

                return;
            }


            // ==================================================
            // NEXT
            // ==================================================

            const stepOrder = [
                "plan",
                "scale",
                "rooms",
                "zones",
                "measure",
                "review"
            ];


            const activeIndex =
                stepOrder.indexOf(
                    activeStep
                );


            const currentIndex =
                stepOrder.indexOf(
                    step
                );


            if (
                currentIndex ===
                activeIndex + 1
            ) {

                el.classList.add(
                    "next"
                );
            }

        });

    // ==================================================
    // 🔥 SECONDARY UI
    // ==================================================

    console.log(
        "🔥 APP MODE BEFORE SECONDARY UI",
        AppMode.current
    );


    if (
        AppMode.current ===
        "business"
    ) {

        console.log(
            "🔥 CALLING NEXT STEP CARD",
            {
                appMode:
                    AppMode.current
            }
        );

        console.log(
            "🔥 NEXT STEP FUNCTION",
            typeof updateNextStepCard,
            updateNextStepCard
        );

        updateNextStepCard?.();

        console.log("NEXT STEP CARD — BEFORE UPDATE", {
            appMode: AppMode.current,
            floorExists: !!getCurrentFloor?.(),
            floorImage: !!getCurrentFloor?.()?.image,
            step: getNextWorkflowStep?.()
        });

        updateNextStepCard?.();

        console.log("NEXT STEP CARD — AFTER UPDATE", {
            display: document.getElementById("workflowNextStep")
                ? getComputedStyle(document.getElementById("workflowNextStep")).display
                : "element missing",
            htmlLength: document.getElementById("workflowNextStep")
                ?.innerHTML?.length ?? 0
        });

        updateRoomProgressPanel?.();

    }
    else {

        const roomProgressTop =
            document.getElementById(
                "roomProgressTop"
            );

        if (roomProgressTop) {

            roomProgressTop.innerHTML =
                "";

            roomProgressTop.style.display =
                "none";
        }
    }

    // ==================================================
    // 🔥 DEBUG
    // ==================================================

    console.log(
        "BUSINESS WORKFLOW STATE",
        {
            hasPlan,
            hasScale,
            scaleConfirmed:
                floor.scaleConfirmed,
            currentScale:
                floor.currentScale,
            hasRooms,
            hasGrid,
            hasZones,
            hasZoneGrid,
            zonesMeasured,
            hasMeasurements,
            hasSources,
            activeStep
        }
    );



    const assessmentReady =
        hasMeasurements &&
        hasSources;

    updateBusinessOutputState(
        assessmentReady
    );


    updateMeasurementProfileUI?.();


    console.error(
        "WORKFLOW JS REACHED END"
    );

    window.updateWorkflowUI =
        updateWorkflowUI;
}

// =====================
// 🔥 WORKFLOW NAVIGATION
// =====================

function setupWorkflowNavigation() {

    const map = {

        workflowPlan:
            "plan",

        workflowRooms:
            "rooms",

        workflowGrid:
            "grid",

        workflowMeasure:
            "measure",

        workflowSources:
            "sources",

        workflowReview:
            "review"
    };

    Object.entries(map)
        .forEach(([id, mode]) => {

            const el =
                document.getElementById(
                    id
                );

            if (!el) {
                return;
            }

            el.onclick = () => {

                console.log(
                    "WORKFLOW CLICK:",
                    mode
                );


                // =====================
                // 🔥 PLAN
                // =====================

                if (
                    !window.roomTool?.active
                ) {

                    AppState.ui.mode =
                        "idle";
                }

                // =====================
                // 🔥 ROOMS
                // =====================

                if (
                    mode === "rooms"
                ) {

                    window.startRoomMode?.();
                }

                // =====================
                // 🔥 GRID
                // =====================

                if (
                    mode === "grid"
                ) {

                    AppState.ui.mode =
                        "grid";
                }

                // =====================
                // 🔥 MEASURE
                // =====================


                if (mode === "measure") {

                    const floor = getCurrentFloor?.();
                    const rooms = floor?.rooms || [];

                    const selectedRoom = AppState.ui.selectedRoom;

                    // Keep the selected room if it belongs to the current floor.
                    const activeRoom =
                        rooms.find(room => room.id === selectedRoom?.id) ||
                        rooms.find(room => !getRoomMeasurementStats(room).canComplete) ||
                        rooms[rooms.length - 1] ||
                        null;

                    AppState.ui.selectedRoom = activeRoom;

                    // Start the existing measurement workflow.
                    window.startMeasurementMode?.("room");
                }


                // =====================
                // 🔥 SOURCES
                // =====================

                if (
                    mode === "sources"
                ) {

                    AppState.ui.mode =
                        "sources";
                }

                // =====================
                // 🔥 REVIEW
                // =====================

                if (
                    mode === "review"
                ) {

                    AppState.ui.mode =
                        "review";
                }

                requestRender?.();

                updateWorkflowUI?.();
            };
        });

    console.error(
        "WORKFLOW JS LOADED"
    );

    window.setupWorkflowNavigation =
        setupWorkflowNavigation;
}


function getRoomMeasurementStats(
    room
) {

    // ==================================================
    // EMPTY
    // ==================================================

    const EMPTY_MEASUREMENT_STATS = {

        total:
            0,

        measured:
            0,

        completed:
            0,

        partial:
            0,

        notMeasured:
            0,

        required:
            0,

        coverage:
            0,

        coveragePercent:
            0,

        completion:
            0,

        completionPercent:
            0,

        requiredCoverage:
            1,

        areaCoverage: {

            measured:
                0,

            total:
                0
        },

        heatmapQuality:
            null,

        canComplete:
            false,

        zoneCount:
            0,

        zoneTotal:
            0,

        zoneConfirmed:
            0,

        zonePartial:
            0,

        zoneNotMeasured:
            0
    };


    if (!room) {

        return EMPTY_MEASUREMENT_STATS;
    }


    // ==================================================
    // FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    // ==================================================
    // ROOM GRID
    // ==================================================

    const roomPoints =
        Array.isArray(
            room.grid
        )
            ? room.grid
            : [];


    // ==================================================
    // ROOM ZONES
    //
    // Zone owns its physical area.
    // ==================================================

    const roomZones =
        (
            floor?.zones ||
            []
        ).filter(
            zone =>
                zone &&
                zone.roomId ===
                room.id
        );


    // ==================================================
    // ZONE OWNERSHIP HELPER
    //
    // IMPORTANT:
    //
    // Do NOT rely only on point.zoneId.
    //
    // A Room grid point may physically be inside
    // a Zone even if zoneId was not stored on the
    // point when the grid was generated.
    // ==================================================

    function pointBelongsToZone(
        point
    ) {

        if (!point) {

            return false;
        }


        // ----------------------------------------------
        // Fast path
        // ----------------------------------------------

        if (
            point.zoneId
        ) {

            return true;
        }


        // ----------------------------------------------
        // Geometry ownership
        // ----------------------------------------------

        return roomZones.some(
            zone => {

                if (
                    !Array.isArray(
                        zone.polygon
                    ) ||
                    zone.polygon.length < 3
                ) {

                    return false;
                }


                return pointInPolygon(
                    {
                        x:
                            point.x,

                        y:
                            point.y
                    },

                    zone.polygon
                );
            }
        );
    }


    // ==================================================
    // AUTHORITATIVE ROOM POINTS
    //
    // Only Room points outside Zones.
    // ==================================================

    const uncoveredRoomPoints =
        roomPoints.filter(
            point =>
                !pointBelongsToZone(
                    point
                )
        );


    // ==================================================
    // COUNTERS
    // ==================================================

    let confirmed =
        0;

    let partial =
        0;

    let notMeasured =
        0;


    // ==================================================
    // ROOM POINT STATUS
    // ==================================================

    uncoveredRoomPoints.forEach(
        point => {

            const status =
                getMeasurementPointStatus?.(
                    point
                );


            if (
                status?.state ===
                "confirmed"
            ) {

                confirmed++;
            }

            else if (
                status?.state ===
                "partial"
            ) {

                partial++;
            }

            else {

                notMeasured++;
            }
        }
    );


    // ==================================================
    // ZONE COUNTERS
    // ==================================================

    let zoneTotal =
        0;

    let zoneConfirmed =
        0;

    let zonePartial =
        0;

    let zoneNotMeasured =
        0;


    // ==================================================
    // ZONE STATUS
    // ==================================================

    roomZones.forEach(
        zone => {

            const zonePoints =
                Array.isArray(
                    zone.grid
                )
                    ? zone.grid
                    : [];


            zoneTotal +=
                zonePoints.length;


            zonePoints.forEach(
                point => {

                    const status =
                        getMeasurementPointStatus?.(
                            point
                        );


                    if (
                        status?.state ===
                        "confirmed"
                    ) {

                        zoneConfirmed++;
                    }

                    else if (
                        status?.state ===
                        "partial"
                    ) {

                        zonePartial++;
                    }

                    else {

                        zoneNotMeasured++;
                    }
                }
            );
        }
    );


    // ==================================================
    // TOTAL AUTHORITATIVE POINTS
    //
    // Room points outside Zones
    // +
    // Zone points
    // ==================================================

    const total =
        uncoveredRoomPoints.length +
        zoneTotal;


    // ==================================================
    // TOTAL MEASURED
    // ==================================================

    const measured =
        confirmed +
        partial +
        zoneConfirmed +
        zonePartial;


    // ==================================================
    // TOTAL CONFIRMED
    // ==================================================

    const totalConfirmed =
        confirmed +
        zoneConfirmed;


    // ==================================================
    // TOTAL PARTIAL
    // ==================================================

    const totalPartial =
        partial +
        zonePartial;


    // ==================================================
    // TOTAL NOT MEASURED
    // ==================================================

    const totalNotMeasured =
        notMeasured +
        zoneNotMeasured;


    // ==================================================
    // PHYSICAL COVERAGE
    //
    // Measured = confirmed + partial.
    //
    // This is NOT completion.
    // ==================================================

    const coverage =
        total > 0

            ? measured / total

            : 0;


    const coveragePercent =
        Math.round(
            coverage * 100
        );


    // ==================================================
    // COMPLETION
    //
    // ONLY CONFIRMED POINTS COUNT.
    // ==================================================

    const completion =
        total > 0

            ? totalConfirmed / total

            : 0;


    const completionPercent =
        Math.round(
            completion * 100
        );


    // ==================================================
    // ROOM COMPLETE
    //
    // ALL AUTHORITATIVE POINTS MUST BE CONFIRMED.
    //
    // Zone has ownership of its area.
    //
    // Therefore a Room cannot become complete
    // while ANY Zone point is still:
    //
    // - not measured
    // - partial
    //
    // ==================================================

    const canComplete =
        total > 0 &&
        totalConfirmed === total;


    // ==================================================
    // REQUIRED
    //
    // Completion requirement is 100%.
    // ==================================================

    const required =
        total;


    // ==================================================
    // AREA COVERAGE
    // ==================================================

    const areaCoverage =
        getRoomAreaCoverage(
            room
        );


    // ==================================================
    // HEATMAP QUALITY
    //
    // Separate from completion.
    // ==================================================

    const heatmapQuality =
        getRoomHeatmapQuality(
            room
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        total,

        measured,

        completed:
            totalConfirmed,

        partial:
            totalPartial,

        notMeasured:
            totalNotMeasured,

        coverage,

        coveragePercent,

        completion,

        completionPercent,

        requiredCoverage:
            1,

        canComplete,

        heatmapQuality,

        required,

        areaCoverage,

        zoneCount:
            roomZones.length,

        zoneTotal,

        zoneConfirmed,

        zonePartial,

        zoneNotMeasured
    };
}

function showHomeAssessmentReadyMessage() {
    const existing =
        document.getElementById(
            "homeAssessmentReadyMessage"
        );

    if (existing) {
        return;
    }

    const message =
        document.createElement("div");

    message.id =
        "homeAssessmentReadyMessage";

    message.textContent =
        "✅ Assessment ready — your results are now available.";

    message.style.position =
        "fixed";

    message.style.bottom =
        "24px";

    message.style.left =
        "50%";

    message.style.transform =
        "translateX(-50%)";

    message.style.zIndex =
        "99999";

    message.style.padding =
        "12px 18px";

    message.style.borderRadius =
        "10px";

    message.style.background =
        "#ffffff";

    message.style.boxShadow =
        "0 4px 18px rgba(0,0,0,0.15)";

    message.style.fontSize =
        "14px";

    message.style.fontWeight =
        "600";

    document.body.appendChild(
        message
    );

    setTimeout(() => {
        message.remove();
    }, 3000);
}

function updateHomeOutputState(
    assessmentReady
) {
    const wasReady =
        window.homeAssessmentReady === true;

    window.homeAssessmentReady =
        assessmentReady;

    const resultsBtn =
        document.querySelector(
            '[onclick="openResultsDashboard()"]'
        );

    if (!resultsBtn) {
        return;
    }

    // ==================================================
    // HOME VIEW RESULTS
    //
    // FREE HOME ASSESSMENT RESULT.
    // This is NOT gated by Premium Report entitlement.
    // ==================================================

    resultsBtn.classList.remove(
        "output-locked"
    );

    resultsBtn.disabled = false;

    resultsBtn.style.pointerEvents =
        "auto";

    const lock =
        resultsBtn.querySelector(
            ".output-lock"
        );

    if (lock) {
        lock.style.display = "none";
    }

    const subtitle =
        resultsBtn.querySelector(
            ".workflow-action-subtitle"
        );

    if (subtitle) {
        subtitle.textContent =
            "View your Home Assessment results";
    }

    // Keep the readiness message.
    if (
        assessmentReady &&
        !wasReady
    ) {
        showHomeAssessmentReadyMessage?.();
    }
}

function updateBusinessOutputState(assessmentReady) {

    const resultsBtn =
        document.querySelector(
            '[onclick="openResultsDashboard()"]'
        );

    const reportBtn =
        document.querySelector(
            '[onclick="generateBusinessPdf()"]'
        );

    const exportBtn =
        document.querySelector(
            '[onclick="exportBusinessCsv()"]'
        );


    // ==================================================
    // VIEW RESULTS
    // ==================================================

    if (resultsBtn) {

        resultsBtn.classList.remove(
            "output-locked"
        );

        resultsBtn.disabled = false;

        resultsBtn.style.pointerEvents =
            "auto";

        const lock =
            resultsBtn.querySelector(
                ".output-lock"
            );

        if (lock) {
            lock.style.display = "none";
        }
    }


    // ==================================================
    // EXPERT REPORT
    // ==================================================

    if (reportBtn) {

        reportBtn.classList.remove(
            "output-locked"
        );

        reportBtn.disabled = false;

        reportBtn.style.pointerEvents =
            "auto";

        const lock =
            reportBtn.querySelector(
                ".output-lock"
            );

        if (lock) {
            lock.style.display = "none";
        }
    }


    // ==================================================
    // EXPORT DATA
    // ==================================================

    if (exportBtn) {

        exportBtn.classList.add(
            "output-locked"
        );

        exportBtn.disabled = true;

        exportBtn.style.pointerEvents =
            "none";

        const lock =
            exportBtn.querySelector(
                ".output-lock"
            );

        if (lock) {
            lock.style.display = "";
        }
    }
}

function areAllRoomsMeasured() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return false;
    }

    const rooms =
        Array.isArray(floor.rooms)
            ? floor.rooms
            : [];

    if (!rooms.length) {
        return false;
    }

    return rooms.every(
        room => {

            const readiness =
                getRoomAnalysisReadiness?.(
                    room
                );

            return (
                readiness &&
                readiness.ready === true
            );
        }
    );
}

function getZoneAnalysisReadiness(
    zone
) {

    // ==================================================
    // EMPTY
    // ==================================================

    if (!zone) {

        return {

            ready: false,

            score: 0,

            pointCoverage: 0,

            areaCoverage: 0,

            requiredCoverage: 0,

            confirmedPoints: 0,

            totalPoints: 0,

            coveredSectors: 0,

            totalSectors: 0
        };
    }


    // ==================================================
    // ZONE GRID
    // ==================================================

    const points =
        Array.isArray(
            zone.grid
        )
            ? zone.grid
            : [];


    const totalPoints =
        points.length;


    if (!totalPoints) {

        return {

            ready: false,

            score: 0,

            pointCoverage: 0,

            areaCoverage: 0,

            requiredCoverage: 0,

            confirmedPoints: 0,

            totalPoints: 0,

            coveredSectors: 0,

            totalSectors: 0
        };
    }


    // ==================================================
    // CONFIRMED POINTS
    // ==================================================

    const confirmedPoints =
        points.filter(
            point => {

                const status =
                    getMeasurementPointStatus?.(
                        point
                    );


                return (
                    status?.state ===
                    "confirmed"
                );
            }
        ).length;


    // ==================================================
    // POINT COVERAGE
    // ==================================================

    const pointCoverage =
        confirmedPoints /
        totalPoints;


    // ==================================================
    // SPATIAL COVERAGE
    // ==================================================

    const areaCoverage =
        getZoneAreaCoverage(
            zone
        );


    const spatialCoverage =
        areaCoverage.total > 0

            ? areaCoverage.measured /
            areaCoverage.total

            : 0;


    // ==================================================
    // REQUIRED COVERAGE
    // ==================================================

    const requiredCoverage =
        getRequiredCoverage(
            zone.gridSize
        );


    // ==================================================
    // ANALYSIS SCORE
    // ==================================================
    //
    // Point density:
    //     60%
    //
    // Spatial distribution:
    //     40%
    //

    const POINT_WEIGHT =
        0.60;


    const AREA_WEIGHT =
        0.40;


    const score =
        pointCoverage *
        POINT_WEIGHT +

        spatialCoverage *
        AREA_WEIGHT;


    // ==================================================
    // ANALYSIS READY
    // ==================================================
    //
    // Both conditions must be satisfied:
    //
    // 1. enough confirmed points
    // 2. sufficient spatial coverage
    //

    const ready =
        pointCoverage >=
        requiredCoverage &&

        spatialCoverage >=
        0.60;


    // ==================================================
    // RETURN
    // ==================================================

    return {

        ready,

        score,

        pointCoverage,

        areaCoverage:
            spatialCoverage,

        requiredCoverage,

        confirmedPoints,

        totalPoints,

        coveredSectors:
            areaCoverage.measured,

        totalSectors:
            areaCoverage.total
    };
}

function getRoomAnalysisReadiness(
    room
) {

    // ==================================================
    // EMPTY RESULT
    // ==================================================

    const EMPTY_RESULT = {

        ready:
            false,

        score:
            0,

        pointCoverage:
            0,

        areaCoverage:
            0,

        requiredCoverage:
            0,

        confirmedPoints:
            0,

        totalPoints:
            0,

        coveredSectors:
            0,

        totalSectors:
            0,

        zoneCount:
            0,

        zonesReady:
            false,

        zoneResults:
            [],

        uncoveredRoomPoints:
            0,

        uncoveredConfirmedPoints:
            0,

        uncoveredPointCoverage:
            0,

        uncoveredAreaCoverage:
            0
    };


    if (!room) {

        return EMPTY_RESULT;
    }


    // ==================================================
    // ROOM GRID
    // ==================================================

    const roomPoints =
        Array.isArray(
            room.grid
        )
            ? room.grid
            : [];


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    // ==================================================
    // ROOM ZONES
    // ==================================================

    const roomZones =
        (
            floor?.zones ||
            []
        ).filter(
            zone =>
                zone &&
                zone.roomId ===
                room.id
        );


    // ==================================================
    // ZONE ANALYSIS
    //
    // Zone owns its own territory.
    //
    // We do NOT evaluate Zone points again
    // through the Room grid.
    // ==================================================

    const zoneResults =
        roomZones.map(
            zone => {

                const readiness =
                    getZoneAnalysisReadiness?.(
                        zone
                    );


                return {

                    zone,

                    ...(
                        readiness || {
                            ready:
                                false,

                            score:
                                0,

                            pointCoverage:
                                0,

                            areaCoverage:
                                0,

                            requiredCoverage:
                                0,

                            confirmedPoints:
                                0,

                            totalPoints:
                                0,

                            coveredSectors:
                                0,

                            totalSectors:
                                0
                        }
                    )
                };
            }
        );


    const zoneCount =
        zoneResults.length;


    const zonesReady =
        zoneCount === 0
            ? true
            : zoneResults.every(
                result =>
                    result.ready ===
                    true
            );


    // ==================================================
    // UNCOVERED ROOM GRID
    //
    // IMPORTANT:
    //
    // Points belonging to a Zone are excluded.
    //
    // Zone has priority over Room grid.
    // ==================================================

    const roomPointBelongsToZone = point => {
        if (!point) {
            return false;
        }

        if (point.zoneId) {
            return true;
        }

        return roomZones.some(zone => {
            if (
                !Array.isArray(zone.polygon) ||
                zone.polygon.length < 3
            ) {
                return false;
            }

            return pointInPolygon(
                {
                    x: point.x,
                    y: point.y
                },
                zone.polygon
            );
        });
    };


    const uncoveredRoomPoints =
        roomPoints.filter(
            point =>
                !roomPointBelongsToZone(
                    point
                )
        );


    const totalUncoveredRoomPoints =
        uncoveredRoomPoints.length;


    // ==================================================
    // CONFIRMED ROOM POINTS
    // ==================================================

    const confirmedUncoveredRoomPoints =
        uncoveredRoomPoints.filter(
            point => {

                const status =
                    getMeasurementPointStatus?.(
                        point
                    );


                return (
                    status?.state ===
                    "confirmed"
                );
            }
        ).length;


    // ==================================================
    // ROOM POINT COVERAGE
    // ==================================================

    const uncoveredPointCoverage =
        totalUncoveredRoomPoints > 0

            ? confirmedUncoveredRoomPoints /
            totalUncoveredRoomPoints

            : 1;


    // ==================================================
    // ROOM SPATIAL COVERAGE
    //
    // IMPORTANT:
    //
    // Only sectors belonging to the uncovered
    // Room area are considered.
    //
    // Zone sectors are not counted again.
    // ==================================================

    const availableSectors =
        new Set();


    const confirmedSectors =
        new Set();


    uncoveredRoomPoints.forEach(
        point => {

            if (
                point.sector
            ) {

                availableSectors.add(
                    point.sector
                );
            }


            const status =
                getMeasurementPointStatus?.(
                    point
                );


            if (
                status?.state ===
                "confirmed" &&
                point.sector
            ) {

                confirmedSectors.add(
                    point.sector
                );
            }
        }
    );


    const totalUncoveredSectors =
        availableSectors.size;


    const confirmedUncoveredSectors =
        confirmedSectors.size;


    const uncoveredAreaCoverage =
        totalUncoveredSectors > 0

            ? confirmedUncoveredSectors /
            totalUncoveredSectors

            : 1;


    // ==================================================
    // ROOM GRID REQUIRED COVERAGE
    //
    // This remains ANALYSIS readiness,
    // NOT Room completion.
    // ==================================================

    const requiredCoverage =
        totalUncoveredRoomPoints > 0

            ? getRequiredCoverage(
                room.gridSize
            )

            : 0;


    // ==================================================
    // ROOM GRID ANALYSIS SCORE
    //
    // Point density: 60%
    // Spatial distribution: 40%
    // ==================================================

    const POINT_WEIGHT =
        0.60;


    const AREA_WEIGHT =
        0.40;


    const roomGridScore =
        totalUncoveredRoomPoints > 0

            ? (
                uncoveredPointCoverage *
                POINT_WEIGHT
            ) +
            (
                uncoveredAreaCoverage *
                AREA_WEIGHT
            )

            : 1;


    // ==================================================
    // ROOM GRID READY
    // ==================================================

    const roomGridReady =
        totalUncoveredRoomPoints === 0

            ? true

            : (
                uncoveredPointCoverage >=
                requiredCoverage &&

                uncoveredAreaCoverage >=
                0.60
            );


    // ==================================================
    // COMBINED ROOM ANALYSIS
    //
    // ALL zones must be analysis-ready
    // AND the uncovered Room area must
    // have sufficient data.
    // ==================================================

    const ready =
        zonesReady &&
        roomGridReady;


    // ==================================================
    // COMBINED SCORE
    //
    // Zone and uncovered Room area are
    // treated as separate authoritative
    // components.
    // ==================================================

    const components = [];


    if (
        totalUncoveredRoomPoints > 0
    ) {

        components.push(
            roomGridScore
        );
    }


    zoneResults.forEach(
        result => {

            components.push(
                Number(
                    result.score || 0
                )
            );
        }
    );


    const score =
        components.length > 0

            ? components.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            components.length

            : 0;


    // ==================================================
    // TOTAL CONFIRMED / TOTAL POINTS
    //
    // These are informational values.
    //
    // Zone points are included because they are
    // authoritative measurement points.
    // ==================================================

    const zoneConfirmedPoints =
        zoneResults.reduce(
            (
                total,
                result
            ) =>
                total +
                Number(
                    result.confirmedPoints ||
                    0
                ),
            0
        );


    const zoneTotalPoints =
        zoneResults.reduce(
            (
                total,
                result
            ) =>
                total +
                Number(
                    result.totalPoints ||
                    0
                ),
            0
        );


    const confirmedPoints =
        confirmedUncoveredRoomPoints +
        zoneConfirmedPoints;


    const totalPoints =
        totalUncoveredRoomPoints +
        zoneTotalPoints;


    const pointCoverage =
        totalPoints > 0

            ? confirmedPoints /
            totalPoints

            : 0;


    // ==================================================
    // TOTAL SPATIAL COVERAGE
    //
    // Informational combined value.
    // ==================================================

    const roomSectorCount =
        totalUncoveredSectors;


    const roomConfirmedSectorCount =
        confirmedUncoveredSectors;


    const zoneSectorCount =
        zoneResults.reduce(
            (
                total,
                result
            ) =>
                total +
                Number(
                    result.totalSectors ||
                    0
                ),
            0
        );


    const zoneConfirmedSectorCount =
        zoneResults.reduce(
            (
                total,
                result
            ) =>
                total +
                Number(
                    result.coveredSectors ||
                    0
                ),
            0
        );


    const totalSectors =
        roomSectorCount +
        zoneSectorCount;


    const coveredSectors =
        roomConfirmedSectorCount +
        zoneConfirmedSectorCount;


    const areaCoverage =
        totalSectors > 0

            ? coveredSectors /
            totalSectors

            : 0;


    // ==================================================
    // RETURN
    // ==================================================

    return {

        ready,

        score,

        pointCoverage,

        areaCoverage,

        requiredCoverage,

        confirmedPoints,

        totalPoints,

        coveredSectors,

        totalSectors,

        zoneCount,

        zonesReady,

        zoneResults,

        uncoveredRoomPoints:
            totalUncoveredRoomPoints,

        uncoveredConfirmedPoints:
            confirmedUncoveredRoomPoints,

        uncoveredPointCoverage,

        uncoveredAreaCoverage,

        roomGridReady,

        roomGridScore
    };
}

function deleteMeasurementFromPopup() {

    const point =
        window.selectedGridPoint;


    if (!point) {

        console.warn(
            "⚠️ DELETE MEASUREMENT: no selected point"
        );

        return;
    }


    // ==================================================
    // CUSTOM CONFIRMATION
    // ==================================================

    showDeleteMeasurementConfirm(
        point,
        () => {

            performDeleteMeasurement(
                point
            );

        }
    );
}

function showDeleteMeasurementConfirm(
    point,
    onConfirm
) {

    // ==================================================
    // REMOVE OLD MODAL
    // ==================================================

    document
        .getElementById(
            "deleteMeasurementConfirmModal"
        )
        ?.remove();


    // ==================================================
    // POINT LABEL
    // ==================================================

    const pointLabel =
        point?.code ||
        point?.id ||
        "measurement point";


    // ==================================================
    // MODAL
    // ==================================================

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteMeasurementConfirmModal";


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
            aria-labelledby="deleteMeasurementTitle"
        >

            <!-- HEADER -->

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
                    id="deleteMeasurementClose"
                    aria-label="Close"
                >
                    ✕
                </button>

            </div>


            <!-- CONTENT -->

            <div
                class="delete-measurement-content"
            >

                <div
                    id="deleteMeasurementTitle"
                    class="delete-measurement-title"
                >
                    Delete measurement?
                </div>


                <div
                    class="delete-measurement-point"
                >
                    ${pointLabel}
                </div>


                <div
                    class="delete-measurement-text"
                >
                    This will remove the measurement
                    data from this point.
                </div>


                <div
                    class="delete-measurement-note"
                >

                    <span>
                        ℹ
                    </span>

                    <span>
                        The measurement point itself
                        will remain on the grid.
                    </span>

                </div>

            </div>


            <!-- ACTIONS -->

            <div
                class="delete-measurement-actions"
            >

                <button
                    type="button"
                    id="deleteMeasurementCancel"
                    class="delete-measurement-cancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteMeasurementConfirm"
                    class="delete-measurement-confirm"
                >
                    🗑 Delete measurement
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    // ==================================================
    // ELEMENTS
    // ==================================================

    const closeButton =
        document.getElementById(
            "deleteMeasurementClose"
        );


    const cancelButton =
        document.getElementById(
            "deleteMeasurementCancel"
        );


    const confirmButton =
        document.getElementById(
            "deleteMeasurementConfirm"
        );


    const backdrop =
        modal.querySelector(
            ".delete-measurement-backdrop"
        );


    // ==================================================
    // CLOSE
    // ==================================================

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


    // ==================================================
    // CONFIRM
    // ==================================================

    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();

            onConfirm?.();

        }
    );


    // ==================================================
    // CANCEL
    // ==================================================

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


    // ==================================================
    // ESC
    // ==================================================

    function handleEscape(
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

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


    // ==================================================
    // SHOW
    // ==================================================

    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-visible"
            );

        }
    );


    // ==================================================
    // FOCUS
    // ==================================================

    setTimeout(
        () => {

            cancelButton?.focus();

        },
        80
    );
}

function performDeleteMeasurement(
    point
) {

    console.error(
        "🗑 DELETE MEASUREMENT START",
        point
    );


    // ==================================================
    // REMOVE DIRECT MEASUREMENT VALUES
    // ==================================================

    delete point.rf;

    delete point.electric;

    delete point.magnetic;


    // ==================================================
    // REMOVE FLAGS
    // ==================================================

    point.measuredRF =
        false;

    point.measuredE =
        false;

    point.measuredM =
        false;

    point.measured =
        false;

    point.partial =
        false;

    point.completed =
        false;


    // ==================================================
    // REMOVE SESSION MEASUREMENT
    // ==================================================

    if (
        point.measurements
    ) {

        const activeSessionId =
            sessionId ||
            "default";


        delete point.measurements[
            activeSessionId
        ];


        if (
            Object.keys(
                point.measurements
            ).length === 0
        ) {

            delete point.measurements;
        }
    }


    // ==================================================
    // REMOVE CONFIRMATION
    // ==================================================

    delete point.measurementStatus;


    // ==================================================
    // REMOVE RISK
    // ==================================================

    delete point.risk;


    // ==================================================
    // SAVE
    // ==================================================

    saveProject?.();


    // ==================================================
    // UPDATE UI
    // ==================================================

    window.updateWorkflowUI?.();

    updateProgressUI?.();

    updateRoomStatusUI?.();

    updateUIState?.();

    updateGuideText?.();


    // ==================================================
    // CLOSE MEASUREMENT POPUP
    // ==================================================

    closeMeasurementPopup?.();


    window.selectedGridPoint =
        null;


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();


    console.error(
        "🗑 DELETE MEASUREMENT COMPLETE",
        point
    );
}

function updateMeasurementProfileUI() {

    const button =
        document.getElementById(
            "btnEditMeasurementProfile"
        );

    const summary =
        document.getElementById(
            "measurementProfileSummary"
        );


    if (!button) {
        return;
    }


    // ==================================================
    // BUSINESS ONLY
    // ==================================================

    const projectType =
        AppState.project
            ?.projectType;

    const isBusiness =
        projectType === "business" ||
        projectType === "Business" ||
        AppState.project
            ?.assessmentContext
            ?.type === "business";


    if (!isBusiness) {

        button.style.display =
            "none";

        return;
    }


    // ==================================================
    // MEASUREMENT PROFILE
    // ==================================================

    const profile =
        AppState.project
            ?.measurementProfile;


    // ==================================================
    // PROFILE BUTTON IS ALWAYS AVAILABLE
    //
    // No profile yet = configuration needed.
    // Existing profile = edit configuration.
    //
    // It is NOT a workflow step.
    // It must never be hidden because the profile
    // has not been created yet.
    // ==================================================

    button.style.display =
        "flex";


    // ==================================================
    // SUMMARY
    // ==================================================

    if (!summary) {
        return;
    }


    if (!profile) {

        summary.innerText =
            "Configure RF / Electric / Magnetic";

        return;
    }


    const selected = [];


    if (
        profile.rf === true
    ) {

        selected.push(
            "RF"
        );
    }


    if (
        profile.electric === true
    ) {

        selected.push(
            "Electric"
        );
    }


    if (
        profile.magnetic === true
    ) {

        selected.push(
            "Magnetic"
        );
    }



    summary.innerText =
        selected.length
            ? selected.join(" • ")
            : "Configure RF / Electric / Magnetic";

    // ==================================================
    // TOP TOOLBAR — CHOSEN MEASUREMENT MODALITIES
    // Independent from VIEW FILTER
    // ==================================================

    const topLabel = document.getElementById(
        "measurementModalitiesLabel"
    );

    if (topLabel) {
        const modalities = [];

        if (profile?.rf === true) {
            modalities.push("RF");
        }

        if (profile?.electric === true) {
            modalities.push("E");
        }

        if (profile?.magnetic === true) {
            modalities.push("M");
        }

        topLabel.textContent =
            modalities.length === 3
                ? "MEASURING: ALL"
                : modalities.length
                    ? `MEASURING: ${modalities.join(" + ")}`
                    : "MEASURING: NOT SET";
    }

}

function getRequiredCoverage(
    gridSize
) {

    if (gridSize <= 0.5)
        return 0.7;

    if (gridSize <= 1)
        return 0.5;

    return 0.4;
}

function getRoomHeatmapQuality(room) {

    const areaCoverage =
        getRoomAreaCoverage(room);

    const rfCoverage =
        getMeasurementCoverage(room, "rf");

    // Future use
    const electricCoverage =
        getMeasurementCoverage(room, "electric");

    const magneticCoverage =
        getMeasurementCoverage(room, "magnetic");

    const coverageScore =
        areaCoverage.total > 0
            ? areaCoverage.measured /
            areaCoverage.total
            : 0;

    const densityScore =
        rfCoverage.coverage;

    const qualityScore =
        coverageScore * COVERAGE_WEIGHT +
        densityScore * DENSITY_WEIGHT;

    let quality = "LOW";


    if (qualityScore >= QUALITY_EXCELLENT) {

        quality = "EXCELLENT";

    } else if (qualityScore >= QUALITY_GOOD) {

        quality = "GOOD";
    }

    return {

        quality,

        qualityScore,

        coverageScore,

        densityScore,

        rfCoverage,
        electricCoverage,
        magneticCoverage
    };
}

function getMeasurementCoverage(room, measurementType) {

    const totalPoints =
        room.grid?.length || 0;

    const measuredPoints =

        room.grid?.filter(point => {

            const value =
                point.measurements?.[measurementType] ??
                point[measurementType];

            return (
                value !== undefined &&
                value !== null &&
                value !== ""
            );

        }).length || 0;

    return {

        totalPoints,

        measuredPoints,

        coverage:
            totalPoints > 0
                ? measuredPoints / totalPoints
                : 0
    };
}



function updateHomeSidebarStatus() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const hasPlan =
        !!floor.image;

    // IMPORTANT:
    // Only explicit scale confirmation means
    // that the floor scale is complete.

    const hasScale =
        floor.scaleConfirmed === true;

    const zoneCount =
        floor.zones?.length || 0;

    const sourceCount =
        floor.sources?.length || 0;

    // ==================================================
    // LAYOUT
    // ==================================================

    const layoutStatus =
        document.getElementById(
            "layoutStatus"
        );

    if (layoutStatus) {

        if (!hasPlan) {

            layoutStatus.innerText =
                "👉 Upload floor plan";

            layoutStatus.className =
                "workflow-status";

        }
        else if (!hasScale) {

            layoutStatus.innerText =
                "👉 Set scale";

            layoutStatus.className =
                "workflow-status active";

        }
        else {

            layoutStatus.innerText =
                "✓ Layout ready";

            layoutStatus.className =
                "workflow-status done";
        }
    }

    // ==================================================
    // LIFESTYLE
    // ==================================================

    const lifestyleStatus =
        document.getElementById(
            "lifestyleStatus"
        );

    if (lifestyleStatus) {

        lifestyleStatus.innerText =

            zoneCount > 0

                ? `✓ ${zoneCount} areas added`

                : "No lifestyle areas added";
    }

    // ==================================================
    // SOURCES
    // ==================================================

    const sourceStatus =
        document.getElementById(
            "sourceStatus"
        );

    if (sourceStatus) {

        sourceStatus.innerText =

            sourceCount > 0

                ? `✓ ${sourceCount} sources added`

                : "No sources added";
    }

    console.log(
        "HOME SIDEBAR STATE",
        {
            hasPlan,
            hasScale,
            scaleConfirmed:
                floor.scaleConfirmed,
            currentScale:
                floor.currentScale
        }
    );
}


function updateHomeLocks() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const hasScale =
        !!floor?.scaleConfirmed;

    const hasSources =
        Array.isArray(floor?.sources) &&
        floor.sources.length > 0;

    console.error("HOME LOCKS", {
        floor: floor.name,
        scaleConfirmed: floor.scaleConfirmed,
        currentScale: floor.currentScale,
        hasScale
    });

    // ==================================================
    // ELEMENTS
    // ==================================================

    const lifestyleBlock =
        document.getElementById(
            "homeLifestyleSection"
        );

    const sourcesBlock =
        document.getElementById(
            "homeSourcesSection"
        );

    const outdoorSources =
        document.getElementById(
            "outdoorSourcesBlock"
        );

    const insightsBlock =
        document.getElementById(
            "insightsBlock"
        );

    // ==================================================
    // LIFESTYLE
    // ==================================================

    const hasLifestyle =
        !!(
            floor?.zones &&
            floor.zones.length
        );

    console.error("LIFESTYLE CHECK", {
        zones:
            floor.zones?.length || 0,

        hasLifestyle
    });

    // ==================================================
    // ALL HOME SOURCES
    //
    // Indoor + Outdoor are both sources.
    //
    // IMPORTANT:
    // Outdoor Sources must NOT depend on the
    // existence of an Indoor Source.
    // ==================================================

    const hasIndoorSources =
        Array.isArray(
            floor?.sources
        ) &&
        floor.sources.some(
            source =>
                source &&
                source.placementType !==
                "outdoor"
        );



    console.error("SOURCE CHECK", {

        sources:
            floor.sources?.length || 0,

        hasSources
    });

    // ==================================================
    // 🔥 LIFESTYLE
    //
    // Scale → Lifestyle Areas
    // ==================================================

    if (hasScale) {

        lifestyleBlock?.classList.remove(
            "workflow-locked"
        );

        lifestyleBlock?.classList.add(
            "workflow-unlocked"
        );

    }
    else {

        lifestyleBlock?.classList.add(
            "workflow-locked"
        );

        lifestyleBlock?.classList.remove(
            "workflow-unlocked"
        );
    }

    // ==================================================
    // 🔥 EMF SOURCES
    //
    // Lifestyle → EMF Sources
    //
    // Both Indoor and Outdoor become available
    // at the same workflow stage.
    // ==================================================

    if (hasLifestyle) {

        // -------------------------------
        // Indoor Sources
        // -------------------------------

        sourcesBlock?.classList.remove(
            "workflow-locked"
        );

        sourcesBlock?.classList.add(
            "workflow-unlocked"
        );

        // -------------------------------
        // Outdoor Sources
        // -------------------------------

        outdoorSources?.classList.remove(
            "workflow-locked"
        );

        outdoorSources?.classList.add(
            "workflow-unlocked"
        );

    }
    else {

        // -------------------------------
        // Indoor Sources
        // -------------------------------

        sourcesBlock?.classList.add(
            "workflow-locked"
        );

        sourcesBlock?.classList.remove(
            "workflow-unlocked"
        );

        // -------------------------------
        // Outdoor Sources
        // -------------------------------

        outdoorSources?.classList.add(
            "workflow-locked"
        );

        outdoorSources?.classList.remove(
            "workflow-unlocked"
        );
    }

    // ==================================================
    // 🔥 INSIGHTS
    //
    // At least one source must exist.
    //
    // This includes:
    //     - Indoor Source
    //     - Outdoor Source
    //
    // ==================================================

    if (hasSources) {

        insightsBlock?.classList.remove(
            "workflow-locked"
        );

        insightsBlock?.classList.add(
            "workflow-unlocked"
        );

    }
    else {

        insightsBlock?.classList.add(
            "workflow-locked"
        );

        insightsBlock?.classList.remove(
            "workflow-unlocked"
        );
    }

}

// =====================================================
// 🔥 START BUSINESS ROOM MEASUREMENT FLOW
// =====================================================

function startBusinessMeasurementFlow() {

    console.log(
        "🔥 START BUSINESS MEASUREMENT FLOW"
    );


    // ==================================================
    // CURRENT PROJECT
    // ==================================================

    const project =
        AppState?.project;


    if (
        !project
    ) {

        console.warn(
            "⚠️ NO ACTIVE PROJECT"
        );

        return;
    }


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (
        !floor
    ) {

        console.warn(
            "⚠️ NO ACTIVE FLOOR"
        );

        return;
    }


    // ==================================================
    // MEASUREMENT PROFILE
    // ==================================================

    const profile =
        project.measurementProfile;


    console.log(
        "🔥 MEASUREMENT PROFILE:",
        profile
    );


    // ==================================================
    // NO PROFILE YET
    //
    // User must first select RF / Electric / Magnetic.
    // ==================================================

    if (
        !profile ||
        (
            profile.rf !== true &&
            profile.electric !== true &&
            profile.magnetic !== true
        )
    ) {

        console.log(
            "⚠️ NO MEASUREMENT PROFILE — OPEN PROFILE"
        );


        // ==================================================
        // REMEMBER WHY PROFILE WAS OPENED
        // ==================================================

        window.measurementProfileReturnToMeasurement =
            true;


        showMeasurementProfilePopup?.();

        return;
    }


    // ==================================================
    // 🔥 START ROOM MEASUREMENT
    // ==================================================

    AppState.ui.mode =
        "measure";

    // Select the active room for Room Measuring.
    const rooms = Array.isArray(floor.rooms)
        ? floor.rooms
        : [];

    const currentRoom = AppState.ui.selectedRoom;

    const activeRoom =
        rooms.find(room => room.id === currentRoom?.id) ||
        rooms.find(room => !getRoomMeasurementStats(room).canComplete) ||
        rooms[0] ||
        null;

    AppState.ui.selectedRoom = activeRoom;

    console.log("ACTIVE ROOM SELECTED", {
        mode: AppState.ui.mode,
        roomId: activeRoom?.id,
        roomName: activeRoom?.name
    });

    // ==================================================
    // 🔥 ROOM GRID IS THE MEASUREMENT GRID
    //
    // Starting Room Measuring must not activate
    // Zone Grid.
    //
    // This changes only UI layer visibility.
    // It does NOT modify measurement data.
    // ==================================================

    if (
        !window.layerVisibility
    ) {

        window.layerVisibility =
            {};
    }


    window.layerVisibility.roomGrid =
        true;


    window.layerVisibility.zoneGrid =
        false;


    // ==================================================
    // 🔥 MEASUREMENT TARGET
    // ==================================================

    AppState.ui.measurementTarget =
        "room";


    // ==================================================
    // 🔥 MEASUREMENT INTERACTION
    //
    // We have entered the measurement workflow
    // and are now waiting for the user to select
    // a measurement point.
    // ==================================================

    AppState.ui.measurementInteraction =
        "awaitingPoint";


    // ==================================================
    // RESET SELECTED POINT
    //
    // Starting a fresh measurement session must
    // not inherit a previously selected point.
    // ==================================================

    window.selectedGridPoint =
        null;


    window.justClosedMeasurementPopup =
        false;


    // ==================================================
    // 🔥 MEASUREMENT INFO
    //
    //
    //
    // updateMeasurementInfo() only updates content.
    // ==================================================

    updateMeasurementWorkflowUIVisibility();


    // ==================================================
    // 🔥 WORKFLOW UI
    // ==================================================

    window.updateWorkflowUI?.();

    window.updateFlow?.();

    updateGuideText?.();

    updateUIState?.();

    updateProgressUI?.();

    updateRoomStatusUI?.();

    window.updateRoomProgressPanel?.();


    // ==================================================
    // 🔥 CURSOR
    // ==================================================

    const canvasEl =
        document.getElementById(
            "canvas"
        );


    if (
        canvasEl
    ) {

        canvasEl.style.cursor =
            "crosshair";
    }


    // ==================================================
    // 🔥 RENDER
    // ==================================================

    requestRender?.();


    console.log(
        "✅ ROOM MEASUREMENT MODE ACTIVE",
        {
            mode:
                AppState.ui.mode,

            target:
                AppState.ui.measurementTarget,

            interaction:
                AppState.ui.measurementInteraction,

            roomGrid:
                window.layerVisibility.roomGrid,

            zoneGrid:
                window.layerVisibility.zoneGrid
        }
    );
}


// =====================================================
// GLOBAL ACCESS
// =====================================================

window.startBusinessMeasurementFlow =
    startBusinessMeasurementFlow;

window.updateHomeLocks =
    updateHomeLocks;

window.setupWorkflowNavigation =
    setupWorkflowNavigation;

console.log("Before updateWorkflowUI:", window.updateWorkflowUI);

window.updateWorkflowUI =
    updateWorkflowUI;

console.log("workflow.js loaded");
console.log("window.updateWorkflowUI =", window.updateWorkflowUI);

window.updateAnalyticsUI =
    window.updateAnalyticsUI ||
    function () { };

window.updateRoomAnalyticsUI =
    window.updateRoomAnalyticsUI ||
    function () { };

window.updateWorstRoomUI =
    window.updateWorstRoomUI ||
    function () { };

window.updateLiveHUD =
    window.updateLiveHUD ||
    function () { };

window.updateBusinessGuideText =
    updateBusinessGuideText;

window.getNextWorkflowStep =
    getNextWorkflowStep;

window.updateNextStepCard =
    updateNextStepCard;

window.getRoomWorkflowStatus =
    getRoomWorkflowStatus;

window.getRoomNextStep =
    getRoomNextStep;

window.updateProgressUI =
    updateProgressUI;

window.updateRoomGuidance =
    updateRoomGuidance;

window.updateFlow =
    updateFlow;

window.getWorkflowSteps =
    getWorkflowSteps;

window.setWorkflowStep =
    setWorkflowStep;

window.highlightNextStep =
    highlightNextStep;

window.updateHomeSidebarStatus =
    updateHomeSidebarStatus;

window.getRoomMeasurementStats =
    getRoomMeasurementStats;

