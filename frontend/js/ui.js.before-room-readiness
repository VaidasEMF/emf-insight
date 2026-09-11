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

        const stats =
            window.getRoomMeasurementStats?.(room);

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

            !stats.canComplete

        ) {

            const remaining =

                stats.required -
                stats.measured;

            status =

                `⚠ Need ${remaining}`;

            color =
                "#f59e0b";
        }

        else {

            status =
                "✓ Complete";

            color =
                "#16a34a";
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

    const project =
        AppState?.project ||
        null;


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
    // STATUS BADGE
    // ==================================================

    const statusEl =
        document.querySelector(
            ".status-badge"
        );


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

    if (
        statusEl
    ) {

        statusEl.innerText =
            projectId !== null &&
                projectId !== undefined &&
                projectId !== ""
                ? `${status} • Project #${projectId}`
                : status;
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
                ".status-badge"
            )?.parentElement;


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
}

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