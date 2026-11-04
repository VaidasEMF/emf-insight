let statusTimeout = null;

// =====================
// 🔥 STATUS
// =====================

function updateStatus(text) {

    const el =
        document.getElementById(
            "statusText"
        );

    if (!el) return;

    el.innerText = text;

    clearTimeout(
        statusTimeout
    );

    statusTimeout =
        setTimeout(() => {

            el.innerText =
                "Ready";

        }, 2000);
}

// =====================
// 🔥 ROOM STATUS
// =====================

function updateRoomStatusUI() {

    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;

    const el = document.getElementById("roomStatus");
    if (!el) return;

    el.innerHTML = "";

    rooms.forEach((room, i) => {

        const readiness =
            window.getRoomAnalysisReadiness?.(room);

        let status =
            "";

        let color =
            "#6b7280";

        if (
            !room.grid ||
            room.grid.length === 0
        ) {
            status =
                "○ No Grid";

            color =
                "#6b7280";
        }
        else if (
            readiness?.ready === true
        ) {
            status =
                "✓ Complete";

            color =
                "#16a34a";
        }
        else {
            status =
                "⚠ Not Ready";

            color =
                "#f59e0b";
        }

        const active =

            AppState.ui.selectedRoom?.id ===
            room.id;

        el.innerHTML += `

    <div
        style="
            color:${color};
            font-weight:${active
                ? "700"
                : "400"
            };
            border-left:${active
                ? "4px solid #2563eb"
                : "4px solid transparent"
            };
            padding-left:8px;
        ">

        ${room.code}: ${status}

    </div>

`;
    });
}

function setGuide(text) {
    const el = document.getElementById("guideText");
    if (el) el.innerText = text;
}


function updateInfoPanel() {


    const m = hoveredPoint.measurements[sessionId];

    el.innerHTML = `
  <b>Measurement</b><br><br>

  RF: <b>${m.rf}</b> µW/m²<br>
  Electric: <b>${m.electric}</b> V/m<br>
  Magnetic: <b>${m.magnetic}</b> nT
`;
}



function updateUIState() {

    const floor =
        getCurrentFloor();

    if (!floor) return;

    const rooms =
        floor.rooms || [];

    const btnRoom =
        document.getElementById(
            "btnRoom"
        );

    const btnMeasure =
        document.getElementById(
            "btnMeasure"
        );

    // =====================
    // 🔥 ROOM
    // =====================
    if (btnRoom) {

        btnRoom.disabled = false;
    }

    // =====================
    // 🔥 MEASURE
    // =====================
    const hasGrid =
        rooms.some(
            r => r.grid && r.grid.length
        );

    if (btnMeasure) {

        btnMeasure.disabled =
            !hasGrid;
    }

}

function updateGridButtons() {

    [
        "grid05",
        "grid10",
        "grid20"
    ].forEach(id => {

        document
            .getElementById(id)
            ?.classList.remove(
                "active"
            );
    });

    if (
        window.selectedGridSize === 0.5
    ) {

        document
            .getElementById("grid05")
            ?.classList.add("active");
    }

    if (
        window.selectedGridSize === 1
    ) {

        document
            .getElementById("grid10")
            ?.classList.add("active");
    }

    if (
        window.selectedGridSize === 2
    ) {

        document
            .getElementById("grid20")
            ?.classList.add("active");
    }
}

window.selectedGridSize = 1;

setTimeout(() => {

    updateGridButtons?.();

}, 100);

function updateProjectHeader() {


    const mode =
        window.AppMode?.current ||
        "home";

    const project =
        AppState?.project ||
        null;



    // ==================================================
    // PROJECT HEADER NAME
    // ==================================================

    window.updateHomeProjectDisplayName?.();

    const projectDisplayName =
        document.getElementById("homeProjectDisplayName");

    if (projectDisplayName) {
        const name =
            project?.name ||
            AppState?.homeProject?.name ||
            "";

        projectDisplayName.title = name;
    }

    // ==================================================
    // NO ACTIVE PROJECT
    // ==================================================
    //
    // IMPORTANT:
    //
    // localStorage project IDs are NOT active projects.
    //
    // Only AppState.project represents the currently
    // active project.
    //
    // Therefore when AppState.project is null:
    //
    //     Project ID      → hidden
    //     Status badge    → hidden
    //     Units           → hidden
    //     Floor Scale     → hidden
    //
    // ==================================================

    const hasActiveProject =
        !!project;


    // ==================================================
    // FLOOR COUNT
    // ==================================================

    const floors =
        Array.isArray(
            project?.floors
        )
            ? project.floors
            : [];


    const floorCount =
        document.getElementById(
            "projectFloorCount"
        );


    if (
        floorCount
    ) {

        floorCount.innerText =
            floors.length;
    }


    // ==================================================
    // PROJECT ID
    // ==================================================
    //
    // IMPORTANT:
    //
    // DO NOT use localStorage fallback here.
    //
    // ==================================================

    const projectId =
        project?.project_id ??
        project?.projectId ??
        project?.id ??
        null;

    // ==================================================
    // PROJECT HEADER ID
    // ==================================================

    const projectHeaderId =
        document.getElementById("projectHeaderId");

    if (projectHeaderId) {
        const hasProjectId =
            hasActiveProject &&
            projectId !== null &&
            projectId !== undefined &&
            projectId !== "";

        projectHeaderId.textContent =
            hasProjectId ? `Project #${projectId}` : "";

        projectHeaderId.style.display =
            hasProjectId ? "inline-flex" : "none";
    }

    // ==================================================
    // STATUS BADGE
    // ==================================================

    const statusEl =
        document.querySelector(
            ".status-badge"
        );

    const experience =
        window.AppState?.experience ||
        window.experience ||
        {};

    const isHomeDemo =
        mode === "home" &&
        experience.mode === "demo" &&
        experience.demoType === "home";


    // ==================================================
    // NO ACTIVE PROJECT
    // ==================================================

    if (
        !hasActiveProject
    ) {

        // ----------------------------------------------
        // HIDE STATUS BADGE
        // ----------------------------------------------

        if (
            statusEl
        ) {

            statusEl.style.display =
                "none";
        }


        // ----------------------------------------------
        // HIDE HEADER CONTROLS
        // ----------------------------------------------

        const existingControls =
            document.querySelector(
                ".project-measurement-controls"
            );


        if (
            existingControls
        ) {

            existingControls.style.display =
                "none";
        }


        console.log(
            "🔥 PROJECT HEADER — NO ACTIVE PROJECT",
            {
                project: null,

                projectId: null,

                status:
                    "hidden"
            }
        );


        return;
    }


    // ==================================================
    // ACTIVE PROJECT
    // ==================================================

    const floor =
        getCurrentFloor?.();


    // ==================================================
    // SHOW STATUS BADGE
    // ==================================================

    if (
        statusEl
    ) {

        statusEl.style.display =
            "";
    }


    // ==================================================
    // STATUS
    // ==================================================

    let status;


    // ==================================================
    // SCALE EDITING
    // ==================================================

    if (
        window.scaleTool?.active ||
        AppState?.ui?.mode === "scale"
    ) {

        status =
            "Set Scale";
    }


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    else {

        const currentFloor =
            floor ||
            null;


        // ----------------------------------------------
        // CHECK FLOOR IMAGE
        // ----------------------------------------------

        const hasFloorImage =
            !!(
                currentFloor?.image ||
                currentFloor?.imageData ||
                currentFloor?.imageUrl ||
                currentFloor?.imageURL ||
                currentFloor?.planImage ||
                currentFloor?.floorPlanImage ||
                currentFloor?.file ||
                currentFloor?.src
            );


        // ----------------------------------------------
        // STATUS
        // ----------------------------------------------

        if (
            !hasFloorImage
        ) {

            status =
                "Upload Plan";
        }

        else if (
            !currentFloor?.scaleConfirmed
        ) {

            status =
                "Set Scale";
        }

        else {

            status =
                "Ready";
        }
    }


    // ==================================================
    // DISPLAY STATUS
    // ==================================================

    if (statusEl) {

        const isDemo =
            mode === "business" &&
            (
                project?.isDemo === true ||
                project?.demo === true ||
                AppState?.project?.isDemo === true ||
                AppState?.project?.demo === true
            );

        if (
            status === "Set Scale" ||
            isHomeDemo ||
            isDemo
        ) {
            statusEl.innerText = "";
            statusEl.style.display = "none";
        } else {
            statusEl.style.display = "";
            statusEl.innerText = status;
        }
    }



    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "🔥 HEADER STATUS",
        {
            projectId,

            status,

            floor,

            project
        }
    );


    // ==================================================
    // MEASUREMENT CONTROLS
    // ==================================================

    let controls =
        document.querySelector(
            ".project-measurement-controls"
        );


    if (
        !controls
    ) {

        const header =
            document.querySelector(
                "#projectHeader .project-meta"
            );


        if (
            header
        ) {

            controls =
                document.createElement(
                    "span"
                );

            controls.className =
                "project-measurement-controls";

            header.appendChild(
                controls
            );
        }
    }


    if (
        !controls
    ) {

        return;
    }


    // ==================================================
    // SHOW CONTROLS
    // ==================================================

    controls.style.display =
        "";


    // ==================================================
    // UNITS
    // ==================================================

    const units =
        getProjectUnits?.();


    const unitsLabel =
        units === "ft"
            ? "Feet"
            : "Metric";


    // ==================================================
    // SCALE STATUS
    // ==================================================

    let scaleLabel;


    if (
        window.scaleTool?.active ||
        AppState?.ui?.mode === "scale"
    ) {

        scaleLabel =
            "Editing...";
    }

    else if (
        floor?.scaleConfirmed
    ) {

        scaleLabel =
            "Calibrated";
    }

    else {

        scaleLabel =
            "Not set";
    }


    // ==================================================
    // HEADER CONTROLS
    // ==================================================



    const isHomeWorkspace =
        window.AppMode?.current === "home";

    const hasFloorPlan = !!(
        floor?.image ||
        floor?.imagePath ||
        floor?.imageFileName
    );

    controls.innerHTML = `

        <span class="project-header-divider"></span>

        <span class="project-header-control">

            <span class="project-header-label">
                Units:
            </span>

            <strong>
                ${unitsLabel}
            </strong>

            <button
                type="button"
                class="project-header-edit-btn project-units-edit-btn"
                title="Change measurement units"
                aria-label="Change measurement units"
            >
                ✎
            </button>

        </span>


        <span class="project-header-divider"></span>

        <span class="project-header-control">

            <span class="project-header-label">
                Floor Scale:
            </span>

            <strong>
                ${scaleLabel}
            </strong>

            <button
                type="button"
                class="project-header-edit-btn project-scale-edit-btn"
                title="Change floor scale"
                aria-label="Change floor scale"
            >
                ✎
            </button>

               </span>

               <div class="floor-plan-menu-wrap home-only">

    <button
        id="homeFloorPlanMenuToggle"
        type="button"
        class="floor-plan-menu-toggle"
        title="Floor Plan"
        aria-label="Floor Plan"
        aria-expanded="false">
        Floor Plan ▾
    </button>
<div
    id="homeFloorPlanDropdown"
    class="floor-plan-dropdown"
    style="display:none;">

    <!-- UPLOAD -->
    <button
    id="homeFloorPlanUpload"
    type="button"
    style="${hasFloorPlan ? 'display:none;' : ''}">
            <path d="M12 15V3"/>
            <path d="m7 8 5-5 5 5"/>
            <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>
            <path d="M8 17h8"/>
        </svg>
        <span>Upload Plan</span>
    </button>

    <!-- REPLACE -->
    <button
    id="homeFloorPlanReplace"
    type="button"
    style="${hasFloorPlan ? '' : 'display:none;'}">
            <path d="M20 7v5h-5"/>
            <path d="M4 17v-5h5"/>
            <path d="M5.5 9a7 7 0 0 1 11.7-2L20 12"/>
            <path d="M4 12l2.8 5a7 7 0 0 0 11.7-2"/>
            <path d="M12 9v6"/>
            <path d="m9.5 12 2.5 3 2.5-3"/>
        </svg>
        <span>Replace Plan</span>
    </button>

    <div class="project-menu-divider"></div>
<!-- PLAN HISTORY & INFO -->
<button id="homeFloorPlanHistoryInfo" type="button">
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l3.5 2"/>
        <path d="M12 7h.01"/>
    </svg>
    <span>Plan History & Info</span>
</button>

</div>

</div>

    `;


    // ==================================================
    // UNITS BUTTON
    // ==================================================

    const unitsButton =
        controls.querySelector(
            ".project-units-edit-btn"
        );


    if (
        unitsButton
    ) {

        unitsButton.onclick =
            () => {

                showUnitsSelector?.();
            };
    }


    // ==================================================
    // SCALE BUTTON
    // ==================================================

    const scaleButton =
        controls.querySelector(
            ".project-scale-edit-btn"
        );


    if (
        scaleButton
    ) {

        scaleButton.onclick =
            () => {

                startScaleTool?.();
            };
    }

    // ==================================================
    // PROPERTY HEALTH RECORD
    // ==================================================

    const propertyHealthRecordHeader =
        controls.querySelector(
            "#propertyHealthRecordHeader"
        );

    if (propertyHealthRecordHeader) {
        propertyHealthRecordHeader.onclick = () => {
            console.log("[PHR] HEADER CLICK");

            window.openPropertyHealthRecord?.();

            requestAnimationFrame(() => {
                document.querySelectorAll("[data-home-nav]").forEach(button => {
                    button.classList.toggle(
                        "active",
                        button.dataset.homeNav === "property-record"
                    );
                });
            });
        };
    }
    // ==================================================
    // PLAN HISTORY & INFO
    // ==================================================

    const planHistoryInfoButton =
        controls.querySelector(
            "#homeFloorPlanHistoryInfo"
        );

    if (planHistoryInfoButton) {
        planHistoryInfoButton.onclick = () => {
            console.log(
                "[HOME PLAN HISTORY & INFO] OPEN PHR"
            );

            const homeSidebar =
                document.getElementById("panel");

            const wellnessSidebar =
                document.getElementById("myWellnessSidebar");

            if (homeSidebar) {
                homeSidebar.classList.add(
                    "my-wellness-sidebar-hidden"
                );
            }

            if (wellnessSidebar) {
                wellnessSidebar.classList.add("is-visible");
            }

            window.openPropertyHealthDashboard?.();

            requestAnimationFrame(() => {

                document.querySelectorAll("[data-home-nav]").forEach(button => {
                    button.classList.toggle(
                        "active",
                        button.dataset.homeNav === "property-record"
                    );
                });

                document.getElementById(
                    "phrFloorPlansHistorySection"
                )?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });
        };
    }
}


// ==================================================
// RENDER HOME PLAN HISTORY & INFO
// ==================================================

window.renderHomeFloorPlanHistoryInfo = function (floorOverride = null) {

    const floor =
        floorOverride ||
        window.HomeMeasurements?.getHomeFloor?.();

    console.log("[ARCHIVED PLAN IDS]", {
        floorId: floor?.id,
        floorName: floor?.name,
        projectId:
            window.AppState?.homeProject?.id ||
            window.AppState?.project?.id
    });

    if (!floor) {
        console.warn(
            "[HOME PLAN HISTORY] Active floor not found."
        );
        return;
    }

    const versions = Array.isArray(floor.planVersions)
        ? [...floor.planVersions]
        : [];

    const activeVersion =
        versions.find(version =>
            version.id === floor.activePlanVersionId
        ) ||
        versions.find(version =>
            version.status === "active"
        );

    const preview =
        document.getElementById(
            "homeCurrentPlanPreview"
        );

    const details =
        document.getElementById(
            "homeCurrentPlanDetails"
        );

    const history =
        document.getElementById(
            "homePlanVersionList"
        );

    if (!preview || !details || !history) {
        console.warn(
            "[HOME PLAN HISTORY] Modal elements missing."
        );
        return;
    }

    const escapeHtml = value =>
        String(value ?? "").replace(
            /[&<>"']/g,
            char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char]
        );

    const formatDate = value => {

        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString();
    };

    const formatSize = value => {

        if (value == null) return "—";

        return (
            (Number(value) / 1024).toFixed(1) +
            " KB"
        );
    };

    const getScale = version => {

        const isActive =
            version.id === activeVersion?.id;

        const scale = isActive
            ? {
                scaleConfirmed: floor.scaleConfirmed,
                currentScale: floor.currentScale,
                scaleReferencePixels: floor.scaleReferencePixels,
                scaleReferenceMeters: floor.scaleReferenceMeters
            }
            : (
                version.assessment?.scale ||
                version.scale
            );

        if (!scale?.scaleConfirmed) {
            return "Not calibrated";
        }

        return "Calibrated";
    };

    // ==========================================
    // CURRENT PLAN INFO
    // ==========================================

    if (activeVersion) {

        const plan = activeVersion.plan || {};

        const floorImage = floor.image;

        const previewImage = document.createElement("img");

        previewImage.alt = "Current floor plan";

        if (
            floorImage instanceof HTMLImageElement &&
            floorImage.complete &&
            floorImage.naturalWidth > 0
        ) {
            previewImage.src =
                floorImage.currentSrc || floorImage.src;

        } else if (
            typeof floor.imageData === "string" &&
            floor.imageData.startsWith("data:image/")
        ) {
            previewImage.src = floor.imageData;

        } else {
            preview.innerHTML = `
        <span>No plan preview available</span>
    `;
            return;
        }

        preview.replaceChildren(previewImage);

        details.innerHTML = `

            <div class="home-plan-detail-row">
                <span>Floor</span>
                <strong>${escapeHtml(floor.name || "—")}</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>Plan Version</span>
                <strong>v${escapeHtml(activeVersion.version)} (Active)</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>File Name</span>
                <strong>${escapeHtml(plan.imageFileName || "—")}</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>Uploaded</span>
                <strong>${escapeHtml(formatDate(activeVersion.createdAt))}</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>File Size</span>
                <strong>${escapeHtml(formatSize(plan.imageFileSize))}</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>Dimensions</span>
                <strong>${escapeHtml(
            plan.imageWidth && plan.imageHeight
                ? `${plan.imageWidth} × ${plan.imageHeight} px`
                : "—"
        )}</strong>
            </div>

            <div class="home-plan-detail-row">
                <span>Scale</span>
                <strong>${escapeHtml(getScale(activeVersion))}</strong>
            </div>

        `;

    } else {

        preview.innerHTML = `
            <span>No plan preview available</span>
        `;

        details.textContent =
            "No active plan version found.";
    }

    // ==========================================
    // PLAN HISTORY
    // ==========================================

    versions.sort(
        (a, b) => Number(b.version) - Number(a.version)
    );

    if (!versions.length) {

        history.textContent =
            "No previous plan versions.";

        return;
    }

    history.innerHTML = versions.map(version => {

        const plan = version.plan || {};

        const isActive =
            version.id === activeVersion?.id;

        const status = isActive
            ? "Active"
            : "Archived";

        return `

            <div class="home-plan-version-row">

                <div class="home-plan-version-heading">

                    <strong>
                        v${escapeHtml(version.version)}
                    </strong>

                    <span class="${isActive
                ? "home-plan-status-active"
                : "home-plan-status-archived"}">

                        ${status}

                    </span>

                </div>

                <div class="home-plan-version-file">
                    ${escapeHtml(plan.imageFileName || "—")}
                </div>

                ${!isActive ? `
    <button
        type="button"
        class="home-plan-version-view"
        data-version-id="${escapeHtml(version.id)}">
        View Plan →
    </button>
` : ""}

                <div class="home-plan-version-meta">
                    Uploaded:
                    ${escapeHtml(formatDate(version.createdAt))}
                </div>

                ${!isActive ? `
                    <div class="home-plan-version-meta">
                        Archived:
                        ${escapeHtml(formatDate(version.archivedAt))}
                    </div>
                ` : ""}

                <div class="home-plan-version-meta">
                    Size: ${escapeHtml(formatSize(plan.imageFileSize))}
                    ·
                    ${escapeHtml(
                    plan.imageWidth && plan.imageHeight
                        ? `${plan.imageWidth} × ${plan.imageHeight} px`
                        : "—"
                )}
                </div>

                <div class="home-plan-version-meta">
                    Scale: ${escapeHtml(getScale(version))}
                </div>

            </div>

        `;

    }).join("");

    history.querySelectorAll(
        ".home-plan-version-view"
    ).forEach(button => {

        button.addEventListener("click", async () => {

            const versionId = button.dataset.versionId;

            const projectId =
                window.AppState?.homeProject?.id ||
                window.AppState?.project?.id;

            const floorId = floor.id;

            if (!projectId || !floorId || !versionId) {
                console.error("[ARCHIVED PLAN] Missing IDs", {
                    projectId,
                    floorId,
                    versionId
                });
                return;
            }

            try {

                button.disabled = true;
                button.textContent = "Loading...";

                const headers = getAuthHeaders();
                delete headers["Content-Type"];

                const response = await fetch(
                    `${API}/project/${projectId}/floors/${encodeURIComponent(floorId)}/plan-versions/${encodeURIComponent(versionId)}/plan`,
                    {
                        method: "GET",
                        headers
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Historical plan download failed: HTTP ${response.status}`
                    );
                }

                const blob = await response.blob();

                if (!blob || blob.size === 0) {
                    throw new Error("Empty historical plan image");
                }

                const objectUrl = URL.createObjectURL(blob);
                const image = new Image();

                image.onload = () => {

                    const preview = document.getElementById(
                        "homeCurrentPlanPreview"
                    );

                    const controls = document.getElementById(
                        "homeArchivedPlanPreviewControls"
                    );

                    const label = document.getElementById(
                        "homeArchivedPlanPreviewLabel"
                    );

                    preview.replaceChildren(image);

                    // Find selected archived version
                    const selectedVersion = versions.find(
                        item => item.id === versionId
                    );

                    if (!selectedVersion) {
                        throw new Error("Archived version data not found");
                    }

                    const archivedPlan = selectedVersion.plan || {};

                    // Update section title
                    const infoTitle = document.getElementById(
                        "homeCurrentPlanInfoTitle"
                    );

                    if (infoTitle) {
                        infoTitle.textContent =
                            `Archived Plan Info · v${selectedVersion.version}`;
                    }

                    // Update version label
                    label.textContent =
                        `Viewing archived version v${selectedVersion.version}`;

                    // Update details with archived version data
                    details.innerHTML = `

    <div class="home-plan-detail-row">
        <span>Floor</span>
        <strong>${escapeHtml(floor.name || "—")}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Plan Version</span>
        <strong>v${escapeHtml(selectedVersion.version)} (Archived)</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>File Name</span>
        <strong>${escapeHtml(archivedPlan.imageFileName || "—")}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Uploaded</span>
        <strong>${escapeHtml(formatDate(selectedVersion.createdAt))}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Archived</span>
        <strong>${escapeHtml(formatDate(selectedVersion.archivedAt))}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>File Size</span>
        <strong>${escapeHtml(formatSize(archivedPlan.imageFileSize))}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Dimensions</span>
        <strong>${escapeHtml(
                        archivedPlan.imageWidth && archivedPlan.imageHeight
                            ? `${archivedPlan.imageWidth} × ${archivedPlan.imageHeight} px`
                            : "—"
                    )}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Scale</span>
        <strong>${escapeHtml(getScale(selectedVersion))}</strong>
    </div>

`;

                    controls.style.display = "block";

                    window._homeArchivedPlanPreviewUrl = objectUrl;

                    button.disabled = false;
                    button.textContent = "View Plan →";

                    console.log("[ARCHIVED PLAN LOADED]", {
                        floor: floor.name,
                        versionId,
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    });
                };

                image.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    throw new Error("Historical plan image decode failed");
                };

                image.src = objectUrl;

            } catch (error) {

                console.error("[ARCHIVED PLAN ERROR]", error);

                button.disabled = false;
                button.textContent = "View Plan →";
            }
        });
    });

    const returnButton = document.getElementById(
        "homeReturnToCurrentPlan"
    );

    if (returnButton) {

        returnButton.onclick = () => {

            const preview = document.getElementById(
                "homeCurrentPlanPreview"
            );

            const controls = document.getElementById(
                "homeArchivedPlanPreviewControls"
            );

            // Release archived image URL
            if (window._homeArchivedPlanPreviewUrl) {
                URL.revokeObjectURL(
                    window._homeArchivedPlanPreviewUrl
                );

                window._homeArchivedPlanPreviewUrl = null;
            }

            // Restore active plan
            if (
                floor.image instanceof HTMLImageElement &&
                floor.image.complete &&
                floor.image.naturalWidth > 0
            ) {

                const image = new Image();

                image.src =
                    floor.image.currentSrc || floor.image.src;

                image.alt = "Current floor plan";

                preview.replaceChildren(image);

            } else if (
                typeof floor.imageData === "string" &&
                floor.imageData.startsWith("data:image/")
            ) {

                const image = new Image();

                image.src = floor.imageData;
                image.alt = "Current floor plan";

                preview.replaceChildren(image);

            } else {

                preview.innerHTML =
                    "<span>No plan preview available</span>";
            }

            controls.style.display = "none";

            // Restore section title
            const infoTitle = document.getElementById(
                "homeCurrentPlanInfoTitle"
            );

            if (infoTitle) {
                infoTitle.textContent = "Current Plan Info";
            }

            // Restore active plan details
            const activePlan = activeVersion?.plan || {};

            details.innerHTML = `

    <div class="home-plan-detail-row">
        <span>Floor</span>
        <strong>${escapeHtml(floor.name || "—")}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Plan Version</span>
        <strong>v${escapeHtml(activeVersion.version)} (Active)</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>File Name</span>
        <strong>${escapeHtml(activePlan.imageFileName || "—")}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Uploaded</span>
        <strong>${escapeHtml(formatDate(activeVersion.createdAt))}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>File Size</span>
        <strong>${escapeHtml(formatSize(activePlan.imageFileSize))}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Dimensions</span>
        <strong>${escapeHtml(
                activePlan.imageWidth && activePlan.imageHeight
                    ? `${activePlan.imageWidth} × ${activePlan.imageHeight} px`
                    : "—"
            )}</strong>
    </div>

    <div class="home-plan-detail-row">
        <span>Scale</span>
        <strong>${escapeHtml(getScale(activeVersion))}</strong>
    </div>

`;

            console.log(
                "[RETURNED TO ACTIVE PLAN]",
                floor.name
            );
        };
    }

    console.log(
        "[HOME PLAN HISTORY RENDERED]",
        {
            floor: floor.name,
            activeVersion: activeVersion?.version,
            totalVersions: versions.length
        }
    );
};


function updateProjectWorkspaceTitle() {
    const title = document.getElementById("projectWorkspaceTitle");
    if (!title) return;

    const mode = window.AppMode?.current || "home";

    const isProfessionalDashboard =
        mode === "business" &&
        window.EMFProductContext?.account?.role === "professional" &&
        !window.AppState?.project &&
        document.getElementById("professionalDashboard")?.style.display === "block";

    const businessFloorHeaderControl =
        document.getElementById("businessFloorHeaderControl");

    if (businessFloorHeaderControl) {
        businessFloorHeaderControl.style.display =
            isProfessionalDashboard ? "none" : "";
    }

    if (isProfessionalDashboard) {
        title.textContent = "Professional Dashboard";
    } else if (mode === "home") {
        title.textContent = "🏠 Wellness Project";
    } else {
        title.textContent = "🏢 Business Project";
    }
}

// ==================================================
// HOME PLAN HISTORY & INFO MODAL
// ==================================================

window.openHomeFloorPlanHistoryInfo = function (floorOverride = null) {

    if (
        !floorOverride &&
        window.AppMode?.current !== "home"
    ) {
        return;
    }

    const modal = document.getElementById(
        "homeFloorPlanHistoryInfoModal"
    );

    if (!modal) {
        console.warn(
            "[HOME PLAN HISTORY & INFO] Modal not found"
        );
        return;
    }

    window.renderHomeFloorPlanHistoryInfo?.(floorOverride);

    modal.classList.add("active");
};


window.closeHomeFloorPlanHistoryInfo = function () {

    const modal = document.getElementById(
        "homeFloorPlanHistoryInfoModal"
    );

    modal?.classList.remove("active");
};
window.updateProjectWorkspaceTitle = updateProjectWorkspaceTitle;

function scrollToUnlockReport() {

    document
        .getElementById(
            "unlockReportBtn"
        )
        ?.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    document
        .getElementById(
            "unlockReportBtn"
        )
        ?.classList.add(
            "insight-pulse"
        );

    setTimeout(() => {

        document
            .getElementById(
                "unlockReportBtn"
            )
            ?.classList.remove(
                "insight-pulse"
            );

    }, 2000);
}


function openRankingPopup() {

    const popup =

        document.getElementById(
            "rankingPopup"
        );

    const content =

        document.getElementById(
            "rankingPopupContent"
        );

    const sources =

        window.topSources || [];

    content.innerHTML =

        sources.map(

            item =>

                `
            <div class="ranking-item">

                <div style="
                    font-weight:600;
                    margin-bottom:6px;
                ">
                    🏆 ${item.title}
                </div>

                <div style="
                    color:#f59e0b;
                    font-weight:600;
                    margin-bottom:6px;
                ">
                    ${item.level || "HIGH"} EXPOSURE
                </div>

                <div style="
                    font-size:13px;
                    opacity:0.8;
                ">
                    Exposure Score:
                    ${item.score}
                </div>

            </div>

            <hr style="
                margin:10px 0;
                border:none;
                border-top:1px solid #eee;
            ">
            `
        )

            .join("");

    popup.style.display =
        "block";
}

function closeRankingPopup() {

    document.getElementById(
        "rankingPopup"
    ).style.display = "none";
}

function openReportPopup() {

    document.getElementById(
        "reportPopup"
    ).style.display = "block";
}

function closeReportPopup() {

    document.getElementById(
        "reportPopup"
    ).style.display = "none";
}

function openRecommendationsPopup() {

    document.getElementById(
        "recommendationsPopup"
    ).style.display = "block";
}

function closeRecommendationsPopup() {

    document.getElementById(
        "recommendationsPopup"
    ).style.display = "none";
}

// =====================
// 🔥 EXPORTS
// =====================

window.updateStatus =
    updateStatus;

window.updateRoomStatusUI =
    updateRoomStatusUI;

// =====================
// 🔥 GUIDE
// =====================

window.setGuide =
    setGuide;


// =====================
// 🔥 UI STATE
// =====================

window.updateInfoPanel =
    updateInfoPanel;

window.updateUIState =
    updateUIState;

window.updateGridButtons =
    updateGridButtons;

window.updateProjectHeader =
    updateProjectHeader;


// =====================
// 🔥 NAVIGATION
// =====================

window.scrollToUnlockReport =
    scrollToUnlockReport;


// =====================
// 🔥 POPUPS
// =====================

window.openRankingPopup =
    openRankingPopup;

window.closeRankingPopup =
    closeRankingPopup;

window.openReportPopup =
    openReportPopup;

window.closeReportPopup =
    closeReportPopup;

window.openRecommendationsPopup =
    openRecommendationsPopup;

window.closeRecommendationsPopup =
    closeRecommendationsPopup;    