

let pendingScaleDistance = null;

let pendingScalePoints = [];


// =====================
// 🔥 SCALE TOOL V2
// =====================

window.scaleTool = {

    active: false,

    points: [],

    calibrated: false,

    // ==================================================
    // 🔥 CANONICAL SCALE
    // ==================================================
    //
    // ALWAYS stored in meters per pixel.
    //
    // UI unit (m / ft) never changes this value.
    //
    // ==================================================

    metersPerPixel: null,

    // ==================================================
    // 🔥 SCALE UNIT
    // ==================================================
    //
    // null  → user has not selected a unit yet
    // "m"   → metres
    // "ft"  → feet
    //
    // ==================================================

    unit: null
};




function openScalePopup() {
    const input = document.getElementById("scaleDistanceInput");
    if (input) input.value = "";

    const units = getProjectUnits?.();
    const label = document.getElementById("scaleDistanceUnit");
    if (label) label.innerText = units === "ft" ? "ft" : "m";

    const modal = document.getElementById("scaleModal");
    if (!modal) {
        console.error("SCALE MODAL NOT FOUND");
        return;
    }

    const scaleCard = modal.querySelector(".room-modal-card");
    if (!scaleCard) {
        console.error("SCALE POPUP CARD NOT FOUND");
        return;
    }

    // Keep the modal outside other layout containers.
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    // Create the interaction backdrop once.
    let scaleBackdrop = document.getElementById("scaleInteractionBackdrop");

    if (!scaleBackdrop) {
        scaleBackdrop = document.createElement("div");
        scaleBackdrop.id = "scaleInteractionBackdrop";
        document.body.appendChild(scaleBackdrop);
    }

    Object.assign(scaleBackdrop.style, {
        position: "fixed",
        inset: "0",
        zIndex: "2147482998",
        background: "rgba(245, 248, 252, 0.02)",
        backdropFilter: "blur(0.5px)",
        WebkitBackdropFilter: "blur(0.5px)",
        pointerEvents: "auto",
        display: "block"
    });

    // Full-screen modal layer. The card itself receives interaction.
    Object.assign(modal.style, {
        display: "block",
        visibility: "visible",
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        padding: "0",
        margin: "0",
        background: "transparent",
        zIndex: "2147483000",
        pointerEvents: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none"
    });

    Object.assign(scaleCard.style, {
        position: "fixed",
        zIndex: "2147483001",
        pointerEvents: "auto",
        visibility: "visible",
        filter: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        margin: "0",
        transform: "none"
    });


    // DRAG SCALE POPUP CARD
    if (!scaleCard.dataset.dragBound) {
        scaleCard.dataset.dragBound = "true";

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        scaleCard.style.cursor = "grab";

        scaleCard.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;

            if (
                event.target.closest(
                    "input, button, select, textarea, label, a, .room-skip-btn"
                )
            ) {
                return;
            }

            const rect = scaleCard.getBoundingClientRect();

            dragging = true;
            startX = event.clientX;
            startY = event.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            scaleCard.style.cursor = "grabbing";

            event.preventDefault();
            event.stopPropagation();
        });

        document.addEventListener("pointermove", event => {
            if (!dragging) return;

            const margin = 8;
            const maxLeft = window.innerWidth - scaleCard.offsetWidth - margin;
            const maxTop = window.innerHeight - scaleCard.offsetHeight - margin;

            const left = Math.max(
                margin,
                Math.min(maxLeft, startLeft + event.clientX - startX)
            );

            const top = Math.max(
                margin,
                Math.min(maxTop, startTop + event.clientY - startY)
            );

            scaleCard.style.left = `${left}px`;
            scaleCard.style.top = `${top}px`;
            scaleCard.style.right = "auto";
            scaleCard.style.bottom = "auto";
        });

        const stopDragging = () => {
            if (!dragging) return;

            dragging = false;
            scaleCard.style.cursor = "grab";
        };

        document.addEventListener("pointerup", stopDragging);
        document.addEventListener("pointercancel", stopDragging);
    }


    // Stop canvas interactions originating inside the popup.
    if (!scaleCard.dataset.scaleEventsBound) {
        ["pointerdown", "mousedown", "click", "dblclick", "wheel"].forEach(type => {
            scaleCard.addEventListener(type, event => {
                event.stopPropagation();
            });
        });

        scaleCard.dataset.scaleEventsBound = "true";
    }

    const points = pendingScalePoints;
    const canvas = window.canvas;
    const rect = canvas?.getBoundingClientRect();

    if (rect && points?.length >= 2) {
        const p1 = points[0];
        const p2 = points[1];

        // Convert canvas coordinates to viewport coordinates.
        const scaleX = rect.width / (canvas.width || rect.width);
        const scaleY = rect.height / (canvas.height || rect.height);

        const x1 = rect.left + p1.x * scaleX;
        const y1 = rect.top + p1.y * scaleY;
        const x2 = rect.left + p2.x * scaleX;
        const y2 = rect.top + p2.y * scaleY;

        const margin = 16;
        const gap = 10;
        const cardWidth = scaleCard.offsetWidth || 360;
        const cardHeight = scaleCard.offsetHeight || 400;

        // Prefer the right side of the selected line.
        let left = Math.max(x1, x2) + gap;

        if (left + cardWidth > window.innerWidth - margin) {
            left = Math.min(x1, x2) - cardWidth - gap;
        }

        left = Math.max(
            margin,
            Math.min(left, window.innerWidth - cardWidth - margin)
        );

        const top = Math.max(
            270,
            Math.min(
                Math.min(y1, y2),
                window.innerHeight - cardHeight - margin
            )
        );

        scaleCard.style.left = `${left}px`;
        scaleCard.style.top = `${top}px`;
        scaleCard.style.right = "auto";
        scaleCard.style.bottom = "auto";
    }

    setTimeout(() => {
        input?.focus();
        input?.select();
    }, 50);
}


function showScaleMessage(title, message, buttonText = "OK") {
    let modal = document.getElementById("scaleMessageModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "scaleMessageModal";

        modal.innerHTML = `
            <div class="scale-message-backdrop"></div>
            <div class="scale-message-card" role="alertdialog"
                 aria-modal="true" aria-labelledby="scaleMessageTitle">
                <h3 id="scaleMessageTitle"></h3>
                <p id="scaleMessageText"></p>
                <button type="button" id="scaleMessageButton"></button>
            </div>
        `;

        document.body.appendChild(modal);

        const style = document.createElement("style");
        style.id = "scaleMessageModalStyles";
        style.textContent = `
            #scaleMessageModal {
                position: fixed;
                inset: 0;
                z-index: 2147483640;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: inherit;
            }

            #scaleMessageModal .scale-message-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(15, 23, 42, 0.38);
                backdrop-filter: blur(3px);
            }

            #scaleMessageModal .scale-message-card {
                position: relative;
                width: min(440px, calc(100vw - 32px));
                padding: 26px;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                background: #ffffff;
                box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
                color: #0f172a;
            }

            #scaleMessageModal h3 {
                margin: 0 0 12px;
                font-size: 19px;
                font-weight: 650;
                line-height: 1.35;
            }

            #scaleMessageModal p {
                margin: 0 0 24px;
                color: #475569;
                font-size: 14px;
                line-height: 1.65;
                white-space: pre-line;
            }

            #scaleMessageModal #scaleMessageButton {
                display: block;
                min-width: 88px;
                margin-left: auto;
                padding: 10px 22px;
                border: 0;
                border-radius: 9px;
                background: #4353d8;
                color: #ffffff;
                font: inherit;
                font-weight: 600;
                cursor: pointer;
            }

            #scaleMessageModal #scaleMessageButton:hover {
                background: #3545c4;
            }
        `;
        document.head.appendChild(style);

        modal.querySelector("#scaleMessageButton").addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.querySelector(".scale-message-backdrop").addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    modal.querySelector("#scaleMessageTitle").textContent = title;
    modal.querySelector("#scaleMessageText").textContent = message;
    modal.querySelector("#scaleMessageButton").textContent = buttonText;
    modal.style.display = "flex";

    modal.querySelector("#scaleMessageButton").focus();
}


if (!window.scalePopupKeyboardBound) {
    window.scalePopupKeyboardBound = true;

    document.addEventListener("keydown", function (event) {
        const modal = document.getElementById("scaleModal");

        if (!modal || getComputedStyle(modal).display === "none") {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closeScalePopup();
            return;
        }

        if (event.key === "Enter") {
            const input = document.getElementById("scaleDistanceInput");

            if (!input || !input.value.trim()) return;

            const distance = Number(input.value);

            if (!Number.isFinite(distance) || distance <= 0) {
                event.preventDefault();
                input.focus();
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            confirmScalePopup();
        }
    }, true);
}



function closeScalePopup() {

    const modal =
        document.getElementById(
            "scaleModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }


    const backdrop = document.getElementById("scaleInteractionBackdrop");
    if (backdrop) backdrop.style.display = "none";

    document.getElementById("scaleInteractionBackdrop")?.style.setProperty("display", "none");
    document.getElementById("scaleModal")?.style.setProperty("display", "none");

    // ==================================================
    // SCALE GUIDANCE
    // ==================================================

    hideScaleGuidance?.();


    // ==================================================
    // CANCEL SCALE MODE
    // ==================================================

    const tool =
        window.scaleTool;


    if (
        tool?.active
    ) {

        tool.active =
            false;

        tool.points =
            [];
    }


    pendingScalePoints =
        [];


    // ==================================================
    // MODE
    // ==================================================

    if (
        AppState?.ui
    ) {

        AppState.ui.mode =
            "idle";
    }


    // ==================================================
    // CURSOR
    // ==================================================

    if (
        window.canvas
    ) {

        window.canvas.style.cursor =
            "default";
    }


    // ==================================================
    // HEADER
    // ==================================================

    updateProjectHeader?.();


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();
}

function confirmScalePopup() {

    // ==================================================
    // READ INPUT
    // ==================================================

    const input =
        document.getElementById(
            "scaleDistanceInput"
        );

    const value =
        parseFloat(
            input?.value
        );


    // ==================================================
    // RESOLVE PROJECT UNITS
    // ==================================================

    let rawUnits =
        window.scaleTool?.unit ||
        getProjectUnits?.() ||
        window.AppState?.project?.units ||
        window.AppState?.units;


    /*
     * Normalize all supported representations
     * to canonical internal values:
     *
     *     "m"
     *     "ft"
     */

    let units = null;

    if (
        typeof rawUnits === "string"
    ) {

        const normalized =
            rawUnits
                .trim()
                .toLowerCase();


        if (
            normalized === "m" ||
            normalized === "meter" ||
            normalized === "meters" ||
            normalized === "metre" ||
            normalized === "metres" ||
            normalized === "metric"
        ) {

            units = "m";

        }


        else if (
            normalized === "ft" ||
            normalized === "foot" ||
            normalized === "feet" ||
            normalized === "imperial"
        ) {

            units = "ft";

        }

    }


    console.log(
        "🔥🔥🔥 CONFIRM SCALE UNITS",
        {
            rawUnits,
            units,

            projectUnits:
                window.AppState?.project?.units,

            appStateUnits:
                window.AppState?.units,

            scaleToolUnit:
                window.scaleTool?.unit
        }
    );


    // ==================================================
    // VALIDATE DISTANCE — BASIC
    // ==================================================

    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        alert(
            "Please enter a valid distance."
        );

        return;
    }


    // ==================================================
    // VALIDATE UNITS
    // ==================================================

    if (
        units !== "m" &&
        units !== "ft"
    ) {

        console.error(
            "❌ INVALID PROJECT UNITS",
            {
                rawUnits,
                units
            }
        );

        alert(
            "Please select measurement units first."
        );

        return;
    }


    // ==================================================
    // SCALE POINTS
    // ==================================================

    if (
        !Array.isArray(
            pendingScalePoints
        ) ||
        pendingScalePoints.length < 2
    ) {

        alert(
            "Scale points missing."
        );

        return;
    }


    const tool =
        window.scaleTool;


    if (!tool) {

        console.error(
            "❌ SCALE TOOL NOT AVAILABLE"
        );

        return;
    }


    // ==================================================
    // PIXEL DISTANCE
    // ==================================================

    const dx =
        pendingScalePoints[1].x -
        pendingScalePoints[0].x;

    const dy =
        pendingScalePoints[1].y -
        pendingScalePoints[0].y;


    const pixels =
        Math.hypot(
            dx,
            dy
        );


    console.log(
        "🔥 SCALE PIXEL DISTANCE",
        {
            pixels
        }
    );


    if (
        !Number.isFinite(pixels) ||
        pixels <= 0
    ) {

        alert(
            "Invalid scale distance."
        );

        return;
    }


    // ==================================================
    // CONVERT TO CANONICAL METERS
    // ==================================================

    let realMeters;

    if (
        units === "m"
    ) {

        realMeters =
            value;

    }

    else {

        realMeters =
            value *
            0.3048;

    }


    // ==================================================
    // HARD INPUT SAFETY LIMITS
    //
    // A floor-plan reference measurement this small
    // or this large is almost certainly accidental.
    //
    // IMPORTANT:
    // These limits apply to the reference distance,
    // NOT to the calculated floor dimensions.
    // ==================================================

    const MIN_REFERENCE_METERS =
        0.10;

    const MAX_REFERENCE_METERS =
        100;


    if (
        realMeters <
        MIN_REFERENCE_METERS
    ) {


        showScaleMessage(
            "Reference distance is too small",
            "Please enter a realistic real-world distance between the selected points."
        );


        console.warn(
            "❌ SCALE REJECTED — REFERENCE TOO SMALL",
            {
                value,
                units,
                realMeters,
                minimum:
                    MIN_REFERENCE_METERS
            }
        );

        return;
    }


    if (
        realMeters >
        MAX_REFERENCE_METERS
    ) {

        showScaleMessage(
            "Reference distance is too large",
            "Please verify the selected points and distance."
        );

        console.warn(
            "❌ SCALE REJECTED — REFERENCE TOO LARGE",
            {
                value,
                units,
                realMeters,
                maximum:
                    MAX_REFERENCE_METERS
            }
        );

        return;
    }


    // ==================================================
    // PROPOSED METERS PER PIXEL
    //
    // IMPORTANT:
    // Nothing has been saved yet.
    // ==================================================

    const proposedMetersPerPixel =
        realMeters /
        pixels;


    if (
        !Number.isFinite(
            proposedMetersPerPixel
        ) ||
        proposedMetersPerPixel <= 0
    ) {

        alert(
            "Unable to calculate a valid scale."
        );

        return;
    }


    console.log(
        "🔥 PROPOSED SCALE",
        {
            realMeters,
            pixels,
            metersPerPixel:
                proposedMetersPerPixel
        }
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (!floor) {

        alert(
            "No active floor found."
        );

        return;
    }


    // ==================================================
    // VALIDATE PROPOSED FLOOR SCALE
    //
    // IMPORTANT:
    // validateFloorScale() normally reads
    // floor.currentScale.
    //
    // Temporarily provide the proposed value,
    // validate it, then immediately restore the
    // previous state if rejected.
    // ==================================================

    const previousScale =
        floor.currentScale;

    const previousScaleConfirmed =
        floor.scaleConfirmed;

    const previousReferencePixels =
        floor.scaleReferencePixels;

    const previousReferenceMeters =
        floor.scaleReferenceMeters;


    floor.currentScale =
        proposedMetersPerPixel;


    floor.scaleConfirmed =
        false;


    floor.scaleReferencePixels =
        pixels;

    floor.scaleReferenceMeters =
        realMeters;


    const scaleWarning =
        validateFloorScale?.(
            floor
        );


    // ==================================================
    // HARD REJECT
    // ==================================================

    if (
        scaleWarning
    ) {

        console.warn(
            "❌ SCALE REJECTED",
            {
                warning:
                    scaleWarning,
                proposedMetersPerPixel,
                realMeters,
                pixels
            }
        );


        // ------------------------------------------------
        // RESTORE PREVIOUS FLOOR STATE
        // ------------------------------------------------

        if (
            previousScale === undefined
        ) {

            delete floor.currentScale;

        }

        else {

            floor.currentScale =
                previousScale;
        }


        if (
            previousScaleConfirmed === undefined
        ) {

            delete floor.scaleConfirmed;

        }

        else {

            floor.scaleConfirmed =
                previousScaleConfirmed;
        }


        if (
            previousReferencePixels === undefined
        ) {

            delete floor.scaleReferencePixels;

        }

        else {

            floor.scaleReferencePixels =
                previousReferencePixels;
        }


        if (
            previousReferenceMeters === undefined
        ) {

            delete floor.scaleReferenceMeters;

        }

        else {

            floor.scaleReferenceMeters =
                previousReferenceMeters;
        }


        alert(
            scaleWarning.message ||
            "The selected scale is not realistic for this floor plan."
        );


        return;
    }


    // ==================================================
    // SAVE VALIDATED SCALE
    // ==================================================

    tool.metersPerPixel =
        proposedMetersPerPixel;

    tool.calibrated =
        true;

    tool.unit =
        units;


    // ==================================================
    // CALIBRATION REFERENCE
    // ==================================================

    tool.referencePixels =
        pixels;

    tool.referenceMeters =
        realMeters;


    // ==================================================
    // CONFIRM FLOOR SCALE
    // ==================================================

    floor.currentScale =
        proposedMetersPerPixel;

    floor.scaleConfirmed =
        true;

    floor.scaleReferencePixels =
        pixels;

    floor.scaleReferenceMeters =
        realMeters;


    console.log(
        "✅ SCALE CONFIRMED",
        {
            floor:
                floor.name,

            currentScale:
                floor.currentScale,

            scaleConfirmed:
                floor.scaleConfirmed,

            referencePixels:
                pixels,

            referenceMeters:
                realMeters
        }
    );


    // ==================================================
    // UPDATE FLOOR UI
    // ==================================================

    renderHomeFloorTabs?.();

    renderFloorTabs?.();

    updateProjectHeader?.();


    // ==================================================
    // WORKFLOW
    // ==================================================

    window.updateWorkflowUI?.();

    window.updateHomeWorkflow?.();

    window.updateHomeLocks?.();


    // ==================================================
    // EXIT SCALE MODE
    // ==================================================

    tool.active =
        false;

    tool.points =
        [];


    AppState.ui.mode =
        "idle";


    if (
        window.objectTool
    ) {

        window.objectTool.currentType =
            null;

    }


    // ==================================================
    // CURSOR
    // ==================================================

    if (
        window.canvas
    ) {

        window.canvas.style.cursor =
            "default";

    }


    // ==================================================
    // SCALE BUTTON
    // ==================================================

    const btn =
        document.getElementById(
            "btnScale"
        );


    if (
        btn
    ) {

        const title =
            btn.querySelector(
                ".workflow-action-title"
            );

        const subtitle =
            btn.querySelector(
                ".workflow-action-subtitle"
            );


        if (
            title
        ) {

            title.innerText =
                "Set Scale";

        }


        if (
            subtitle
        ) {

            subtitle.innerText =
                "Calibrate the floor plan scale";

        }


        btn.style.outline =
            "none";

    }


    // ==================================================
    // STATUS
    // ==================================================

    const status =
        document.getElementById(
            "statusText"
        );


    if (
        status
    ) {

        status.innerText =
            units === "ft"
                ? "✓ Scale calibrated — feet"
                : "✓ Scale calibrated — metres";

    }


    // ==================================================
    // CLEANUP
    // ==================================================

    hideScaleGuidance?.();

    closeScalePopup();


    pendingScalePoints =
        [];


    window.scaleTool.points =
        [];


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();

}

// =====================
// 🔥 GET CANVAS POINT
// =====================

function getCanvasPoint(evt) {

    if (!window.canvas) {

        return {
            x: 0,
            y: 0
        };
    }

    return window.EMFViewport.canvasToWorld(
        evt,
        window.canvas
    );
}


function handleScaleObjectClick(evt) {

    const rect =
        canvas.getBoundingClientRect();

    const x =
        evt.clientX -
        rect.left;

    const y =
        evt.clientY -
        rect.top;


    window.scalePoints.push({ x, y });

    console.log(
        "POINT:",
        x,
        y
    );

    updateStatus(
        "📏 Object points: " +
        window.scalePoints.length +
        "/2"
    );

    requestRender();

    // reikia 2 taškų
    if (window.scalePoints.length < 2) {
        return;
    }

    // =====================
    // 🔥 PIXEL DISTANCE
    // =====================
    const px = Math.hypot(
        window.scalePoints[0].x - window.scalePoints[1].x,
        window.scalePoints[0].y - window.scalePoints[1].y
    );

    // =====================
    // 🔥 REAL SIZE
    // =====================
    const real = prompt(
        "Enter object size in meters:"
    );

    if (!real) {

        window.scalePoints = [];

        requestRender();

        return;
    }

    const realMeters =
        parseFloat(real);

    if (!realMeters || realMeters <= 0) {

        alert("Invalid number");

        window.scalePoints = [];

        requestRender();

        return;
    }

    // =====================
    // 🔥 SAVE REAL DISTANCE
    // =====================
    scaleMeters = realMeters;

    // =====================
    // 🔥 PX PER METER
    // =====================
    scale = px / realMeters;

    scaleSet = true;

    AppState.scaleSet = true;

    isScaling = false;

    AppState.ui.mode = null;


    // =====================
    // 🔥 UI INFO
    // =====================
    document.getElementById(
        "scaleInfo"
    ).innerText =
        "Scale calibrated (" +
        realMeters +
        " m)";

    // =====================
    // 🔥 UNLOCK ROOM
    // =====================
    document.getElementById(
        "btnRoom"
    ).disabled = false;

    // =====================
    // 🔥 STATUS
    // =====================
    updateStatus(
        "✅ Object scale set"
    );

    // =====================
    // 🔥 UI UPDATE
    // =====================
    updateUIState?.();

    window.updateFlow?.();

    updateProgressUI?.();

    highlightNextStep?.();

    // =====================
    // 🔥 RESET
    // =====================
    window.scalePoints = [];

    requestRender();
}


// =====================
// 🔥 HANDLE SCALE CLICK
// =====================

function handleScaleToolClick(evt) {

    const tool =
        window.scaleTool;

    if (
        !tool?.active
    ) {

        return;
    }


    // ==================================================
    // CANVAS POINT
    // ==================================================

    const p =
        evt.point ||
        getCanvasPoint(evt);


    if (!p) {

        console.error(
            "❌ SCALE CLICK — INVALID POINT"
        );

        return;
    }


    // ==================================================
    // FIRST POINT
    // ==================================================

    if (
        tool.points.length === 0
    ) {

        tool.points.push({

            x: p.x,
            y: p.y

        });


        console.log(
            "🔥 SCALE FIRST POINT",
            p
        );


        // --------------------------------------------------
        // STATUS ONLY
        // --------------------------------------------------

        const status =
            document.getElementById(
                "statusText"
            );


        if (status) {

            status.innerText =
                "Scale: first point selected ✓ — click the second point";

        }


        // --------------------------------------------------
        // IMPORTANT
        // --------------------------------------------------
        //
        // Do NOT modify btnScale.innerText.
        //
        // The sidebar button must keep its normal
        // "Set Scale" presentation.
        //
        // --------------------------------------------------


        showScaleGuidance?.(
            "second"
        );


        requestRender?.();

        return;
    }


    // ==================================================
    // SECOND POINT
    // ==================================================

    if (
        tool.points.length === 1
    ) {

        tool.points.push({

            x: p.x,
            y: p.y

        });


        const a =
            tool.points[0];

        const b =
            tool.points[1];


        const dx =
            b.x -
            a.x;


        const dy =
            b.y -
            a.y;


        const pixels =
            Math.hypot(
                dx,
                dy
            );


        console.log(
            "🔥🔥 SCALE SECOND POINT",
            {
                first: a,
                second: b,
                pixels
            }
        );


        if (
            !pixels ||
            !isFinite(pixels)
        ) {

            console.error(
                "❌ INVALID SCALE DISTANCE"
            );

            tool.points = [];

            showScaleGuidance?.(
                "first"
            );

            return;
        }


        // ==================================================
        // SAVE POINTS
        // ==================================================

        pendingScalePoints = [

            { ...a },

            { ...b }

        ];


        // ==================================================
        // STATUS
        // ==================================================

        const status =
            document.getElementById(
                "statusText"
            );


        if (status) {

            status.innerText =
                "Scale: two points selected ✓ — enter the real distance";

        }


        // ==================================================
        // IMPORTANT
        // ==================================================
        //
        // No sidebar button text changes.
        //
        // The popup is the next step.
        //
        // ==================================================

        hideScaleGuidance?.();


        requestRender?.();


        // ==================================================
        // MODAL INSTRUCTIONS
        // ==================================================

        const instructions =
            document.getElementById(
                "scaleModalInstructions"
            );


        if (instructions) {

            instructions.style.display =
                "none";

        }


        const confirmed =
            document.getElementById(
                "scaleTwoPointsConfirmed"
            );


        if (confirmed) {

            confirmed.style.display =
                "flex";

        }


        const distanceHelp =
            document.getElementById(
                "scaleDistanceHelp"
            );


        if (distanceHelp) {

            distanceHelp.style.display =
                "block";

        }


        // ==================================================
        // OPEN POPUP
        // ==================================================

        setTimeout(
            () => {

                openScalePopup();

            },
            100
        );

        return;
    }
}


// ==================================================
// PROJECT UNITS
// ==================================================
//
// Canonical project unit.
//
// "m"  = metric
// "ft" = imperial
//
// Project is the source of truth.
// AppState.units is only runtime cache.
//
// ==================================================
function getProjectUnits() {

    const projectUnits =
        window.AppState?.project?.units;

    const scaleToolUnit =
        window.scaleTool?.unit;

    const appStateUnits =
        window.AppState?.units;


    // ==================================================
    // NORMALIZE UNITS
    // ==================================================

    function normalizeUnits(value) {

        if (
            typeof value !== "string"
        ) {

            return null;

        }


        const normalized =
            value
                .trim()
                .toLowerCase();


        // METRIC

        if (
            normalized === "m" ||
            normalized === "meter" ||
            normalized === "meters" ||
            normalized === "metre" ||
            normalized === "metres" ||
            normalized === "metric"
        ) {

            return "m";

        }


        // IMPERIAL

        if (
            normalized === "ft" ||
            normalized === "foot" ||
            normalized === "feet" ||
            normalized === "imperial"
        ) {

            return "ft";

        }


        return null;
    }


    // ==================================================
    // PROJECT UNITS
    // ==================================================

    const projectResult =
        normalizeUnits(
            projectUnits
        );


    if (
        projectResult
    ) {

        return projectResult;

    }


    // ==================================================
    // SCALE TOOL UNITS
    // ==================================================

    const scaleToolResult =
        normalizeUnits(
            scaleToolUnit
        );


    if (
        scaleToolResult
    ) {

        return scaleToolResult;

    }


    // ==================================================
    // APP STATE UNITS
    // ==================================================

    const appStateResult =
        normalizeUnits(
            appStateUnits
        );


    if (
        appStateResult
    ) {

        return appStateResult;

    }


    // ==================================================
    // INVALID / NOT SELECTED
    // ==================================================

    return null;
}

// ==================================================
// PROJECT DISTANCE FORMATTER
// ==================================================
//
// Canonical distance:
//     meters
//
// Display:
//     m  = Metric
//     ft = Imperial
//
// IMPORTANT:
// This function NEVER changes the stored distance.
// It only converts the value for UI display.
//
// ==================================================
function formatProjectDistance(
    distanceMeters,
    decimals = 1
) {

    const value =
        Number(distanceMeters);


    // ==================================================
    // INVALID DISTANCE
    // ==================================================

    if (
        !Number.isFinite(value)
    ) {

        return "Distance unavailable";
    }


    // ==================================================
    // DISPLAY PRECISION
    // ==================================================

    const precision =
        Number.isInteger(
            Number(decimals)
        )
            ? Math.max(
                0,
                Number(decimals)
            )
            : 1;


    // ==================================================
    // CURRENT PROJECT UNITS
    // ==================================================

    const units =
        typeof getProjectUnits === "function"
            ? getProjectUnits()
            : "m";


    // ==================================================
    // IMPERIAL
    // ==================================================

    if (
        units === "ft"
    ) {

        const feet =
            value *
            3.280839895;


        return (
            `${feet.toFixed(precision)} ft`
        );
    }


    // ==================================================
    // METRIC
    // ==================================================

    return (
        `${value.toFixed(precision)} m`
    );
}


// ==================================================
// GLOBAL ACCESS
// ==================================================

window.formatProjectDistance =
    formatProjectDistance;


window.formatProjectDistance =
    formatProjectDistance;


function openProjectUnitsSelector() {

    // ==================================================
    // REMOVE EXISTING
    // ==================================================

    const existing =
        document.getElementById(
            "projectUnitsChangeModal"
        );

    if (existing) {

        existing.remove();
    }


    // ==================================================
    // CURRENT UNITS
    // ==================================================

    const currentUnits =
        getProjectUnits?.();


    // ==================================================
    // MODAL
    // ==================================================

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "projectUnitsChangeModal";


    modal.innerHTML = `

        <div
            style="
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:flex;
                align-items:center;
                justify-content:center;
                z-index:99999;
            "
        >

            <div
                style="
                    width:380px;
                    max-width:calc(100vw - 32px);
                    background:#ffffff;
                    border-radius:16px;
                    padding:24px;
                    box-shadow:0 20px 60px rgba(0,0,0,0.25);
                "
            >

                <div
                    style="
                        font-size:21px;
                        font-weight:700;
                        margin-bottom:8px;
                    "
                >
                    Measurement Units
                </div>


                <div
                    style="
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:20px;
                    "
                >
                    Choose the units used for this project.
                </div>


                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        padding:14px;
                        border:1px solid #dbe3ef;
                        border-radius:10px;
                        margin-bottom:10px;
                        cursor:pointer;
                    "
                >

                    <input
                        type="radio"
                        name="changeProjectUnits"
                        value="ft"
                        ${currentUnits === "ft" ? "checked" : ""}
                    >

                    <span>

                        <strong>
                            Feet
                        </strong>

                        <br>

                        <small
                            style="color:#64748b"
                        >
                            Feet / inches
                        </small>

                    </span>

                </label>


                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        padding:14px;
                        border:1px solid #dbe3ef;
                        border-radius:10px;
                        margin-bottom:20px;
                        cursor:pointer;
                    "
                >

                    <input
                        type="radio"
                        name="changeProjectUnits"
                        value="m"
                        ${currentUnits !== "ft" ? "checked" : ""}
                    >

                    <span>

                        <strong>
                            Metric
                        </strong>

                        <br>

                        <small
                            style="color:#64748b"
                        >
                            Meters / centimeters
                        </small>

                    </span>

                </label>


                <div
                    style="
                        display:flex;
                        gap:10px;
                    "
                >

                    <button
                        id="saveChangedProjectUnits"
                        type="button"
                        style="
                            flex:1;
                            border:0;
                            border-radius:10px;
                            padding:12px;
                            background:#2563eb;
                            color:#ffffff;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Save
                    </button>


                    <button
                        id="cancelChangedProjectUnits"
                        type="button"
                        style="
                            flex:1;
                            border:1px solid #cbd5e1;
                            border-radius:10px;
                            padding:12px;
                            background:#ffffff;
                            color:#334155;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    // ==================================================
    // CANCEL
    // ==================================================

    document
        .getElementById(
            "cancelChangedProjectUnits"
        )
        ?.addEventListener(
            "click",
            () => {

                modal.remove();
            }
        );


    // ==================================================
    // SAVE
    // ==================================================

    document
        .getElementById(
            "saveChangedProjectUnits"
        )
        ?.addEventListener(
            "click",
            async () => {

                const selected =
                    document.querySelector(
                        'input[name="changeProjectUnits"]:checked'
                    );


                if (!selected) {

                    return;
                }


                const units =
                    selected.value;


                // ==================================================
                // SAVE LOCAL PROJECT STATE
                // ==================================================

                const saved =
                    setProjectUnits(
                        units
                    );


                if (!saved) {

                    console.error(
                        "❌ FAILED TO SET PROJECT UNITS"
                    );

                    return;
                }

                // ==================================================
                // BUSINESS DEMO UNITS
                // ==================================================

                const isBusinessDemo =
                    window.AppMode?.current === "business" &&
                    window.EMFWorkspaceExperience?.mode === "demo" &&
                    window.EMFWorkspaceExperience?.demoType === "business";

                if (isBusinessDemo) {

                    window.EMFBusinessDemoState =
                        window.EMFBusinessDemoState ||
                        {};

                    window.EMFBusinessDemoState.units =
                        newUnits;

                    console.log(
                        "🔥 DEMO UNITS AFTER SET",
                        {
                            newUnits,
                            demoUnits:
                                window.EMFBusinessDemoState?.units,
                            getterUnits:
                                getProjectUnits?.(),
                            projectUnits:
                                window.AppState?.project?.units,
                            demoProjectUnits:
                                window.AppState?.businessDemoProject?.units
                        }
                    );

                    if (
                        window.AppState?.businessDemoProject
                    ) {

                        window.AppState.businessDemoProject.units =
                            newUnits;
                    }

                    if (
                        window.AppState?.project
                    ) {

                        window.AppState.project.units =
                            newUnits;
                    }

                    console.log(
                        "🏢 BUSINESS DEMO UNITS SET",
                        {
                            units:
                                newUnits,

                            demoState:
                                window.EMFBusinessDemoState.units,

                            projectUnits:
                                window.AppState?.project?.units
                        }
                    );
                }

                // ==================================================
                // PERSIST PROJECT
                // ==================================================

                if (
                    typeof saveProject ===
                    "function"
                ) {

                    try {

                        await saveProject();

                        console.log(
                            "🔥 PROJECT UNITS CHANGED",
                            {
                                projectId:
                                    AppState.project?.project_id,

                                units
                            }
                        );

                    }
                    catch (error) {

                        console.error(
                            "❌ FAILED TO SAVE PROJECT UNITS",
                            error
                        );

                        return;
                    }
                }


                // ==================================================
                // CLOSE
                // ==================================================

                modal.remove();


                // ==================================================
                // UPDATE HEADER
                // ==================================================

                updateProjectHeader?.();


                // ==================================================
                // UPDATE SCALE BAR
                // ==================================================

                const currentFloor =
                    getCurrentFloor?.();


                if (
                    currentFloor?.currentScale
                ) {

                    drawScaleBar?.(
                        currentFloor
                    );
                }


                // ==================================================
                // RENDER
                // ==================================================

                requestRender?.();

                if (
                    isBusinessDemo &&
                    typeof window.renderBusinessDemoWorkspace ===
                    "function"
                ) {

                    window.renderBusinessDemoWorkspace(
                        window.AppState?.businessDemoProject,
                        window.AppState?.businessDemoAnalysis
                    );
                }
            }
        );
}

// ==================================================
// SET PROJECT UNITS
// ==================================================

function setProjectUnits(units) {

    if (
        units !== "m" &&
        units !== "ft"
    ) {

        return false;
    }

    window.AppState =
        window.AppState ||
        {};

    window.AppState.units =
        units;


    // ==================================================
    // SAVE TO CURRENT PROJECT
    // ==================================================

    if (
        window.AppState.project
    ) {

        window.AppState.project.units =
            units;
    }


    // ==================================================
    // SCALE TOOL CACHE
    // ==================================================

    if (
        window.scaleTool
    ) {

        window.scaleTool.unit =
            units;
    }


    // ==================================================
    // REFRESH UI AFTER UNIT CHANGE
    // ==================================================
    window.renderHomeFloorTabs?.();
    window.updateHomeSidebarStatus?.();
    window.updateHomeWorkflow?.();
    window.updateWorkflowUI?.();
    window.updateOutdoorDistanceCategoryLabels?.();
    window.requestRender?.();


    return true;
}


// ==================================================
// SHOW UNITS SELECTOR
// ==================================================
function showUnitsSelector() {

    console.log("🔥🔥🔥 SHOW UNITS SELECTOR EXECUTED");

    // ==================================================
    // REMOVE EXISTING MODAL
    // ==================================================

    const existing =
        document.getElementById(
            "unitsSelectorModal"
        );

    if (
        existing
    ) {

        existing.remove();
    }


    // ==================================================
    // CURRENT UNITS
    // ==================================================

    const currentUnits =
        getProjectUnits?.();


    // ==================================================
    // MODAL
    // ==================================================

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "unitsSelectorModal";


    modal.innerHTML = `

        <div class="units-selector-backdrop">

            <div class="units-selector-card">

                <div class="units-selector-title">
                    Measurement Units
                </div>


                <div class="units-selector-text">
                    Choose the units used
                    for this project.
                </div>


                <label class="units-option">

                    <input
                        type="radio"
                        name="projectUnits"
                        value="ft"
                        ${currentUnits === "ft"
            ? "checked"
            : ""
        }
                    >

                    <span>

                        <strong>
                            Feet
                        </strong>

                        <small>
                            Feet / inches
                        </small>

                    </span>

                </label>


                <label class="units-option">

                    <input
                        type="radio"
                        name="projectUnits"
                        value="m"
                        ${currentUnits !== "ft"
            ? "checked"
            : ""
        }
                    >

                    <span>

                        <strong>
                            Metric
                        </strong>

                        <small>
                            Meters / centimeters
                        </small>

                    </span>

                </label>


                <button
                    id="confirmProjectUnits"
                    class="units-confirm-btn"
                    type="button"
                >
                    Continue
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    // ==================================================
    // CONFIRM
    // ==================================================

    const confirmButton =
        document.getElementById(
            "confirmProjectUnits"
        );


    if (
        !confirmButton
    ) {

        return;
    }


    confirmButton.onclick =
        async () => {

            // ==================================================
            // SELECTED UNIT
            // ==================================================

            const selected =
                document.querySelector(
                    'input[name="projectUnits"]:checked'
                );


            if (
                !selected
            ) {

                return;
            }


            const newUnits =
                selected.value;


            // ==================================================
            // CURRENT UNITS
            // ==================================================

            const oldUnits =
                getProjectUnits?.();


            console.log(
                "🔥 CHANGING PROJECT UNITS",
                {
                    oldUnits,
                    newUnits
                }
            );


            console.log("🔥🔥 UNITS SELECTOR HANDLER REACHED");

            // ==================================================
            // NO CHANGE
            // ==================================================

            if (
                oldUnits ===
                newUnits
            ) {

                modal.remove();

                return;
            }


            // ==================================================
            // SAVE UNITS
            // ==================================================

            const saved =
                setProjectUnits(
                    newUnits
                );


            if (
                !saved
            ) {

                console.error(
                    "❌ FAILED TO SET PROJECT UNITS"
                );

                return;
            }


            // ==================================================
            // PERSIST PROJECT
            // ==================================================

            if (
                typeof saveProject ===
                "function"
            ) {

                try {

                    await saveProject();

                    console.log(
                        "🔥 PROJECT UNITS SAVED",
                        {
                            units:
                                newUnits,

                            projectId:
                                AppState.project
                                    ?.project_id
                        }
                    );

                }
                catch (
                error
                ) {

                    console.error(
                        "❌ FAILED TO SAVE PROJECT UNITS",
                        error
                    );

                    return;
                }
            }


            // ==================================================
            // CLOSE MODAL
            // ==================================================

            modal.remove();


            // ==================================================
            // IMPORTANT
            // ==================================================
            //
            // Changing units does NOT recalibrate scale.
            //
            // currentScale remains:
            //
            //     meters per pixel
            //
            // Only displayed units change.
            //
            // ==================================================


            // ==================================================
            // UPDATE PROJECT HEADER
            // ==================================================

            updateProjectHeader?.();


            // ==================================================
            // UPDATE ROOM CARDS
            // ==================================================
            //
            // Room Area is calculated from canonical m²
            // and displayed according to project units.
            //
            // ==================================================

            updateRoomProgressPanel?.();


            // ==================================================
            // UPDATE OTHER UNIT-DEPENDENT UI
            // ==================================================

            updateWorkflowUI?.();

            updateHomeWorkflow?.();

            updateHomeLocks?.();

            updateCurrentExposure?.();


            // ==================================================
            // REDRAW CANVAS
            // ==================================================

            requestRender?.();


            console.log(
                "🔥🔥🔥 UNITS CHANGED WITHOUT RECALIBRATION",
                {
                    oldUnits,

                    newUnits,

                    floorScale:
                        getCurrentFloor?.()
                            ?.currentScale,

                    roomAreaRefresh:
                        true
                }
            );
        };
}

// =====================
// 🔥 DRAW SCALE TOOL
// =====================

function drawScaleTool() {

    console.log(
        "DRAW SCALE TOOL RUNNING"
    );

    console.log(
        "DRAW SCALE TOOL",
        window.scaleTool
    );

    const tool =
        window.scaleTool;

    console.log(
        "DRAW SCALE TOOL",
        tool
    );

    if (
        !tool.active
    ) {
        return;
    }

    ctx.save();

    ctx.fillStyle =
        "red";

    ctx.strokeStyle =
        "red";

    ctx.lineWidth = 1.5;

    if (tool.points[0]) {

        const p1 =
            EMFViewport.worldPoint(
                tool.points[0]
            );

        ctx.beginPath();

        ctx.arc(
            p1.x,
            p1.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    if (

        tool.points.length >= 2 &&

        tool.points[0] &&
        tool.points[1]

    ) {

        ctx.beginPath();

        const p1 =
            EMFViewport.worldPoint(
                tool.points[0]
            );

        const p2 =
            EMFViewport.worldPoint(
                tool.points[1]
            );

        ctx.moveTo(
            p1.x,
            p1.y
        );

        ctx.lineTo(
            p2.x,
            p2.y
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            p2.x,
            p2.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // =====================
    // 🔥 SCALE RULER
    // =====================

    if (
        tool.calibrated &&
        tool.metersPerPixel
    ) {

        const pixelsPerMeter =
            1 / tool.metersPerPixel;

        const startX = 30;

        const startY =
            canvas.height - 35;

        const endX =
            startX + pixelsPerMeter;

        ctx.save();

        ctx.strokeStyle =
            "#ef4444";

        ctx.fillStyle =
            "#ef4444";

        ctx.lineWidth = 2;

        // =====================
        // 🔥 MAIN LINE
        // =====================

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.lineTo(
            endX,
            startY
        );

        ctx.stroke();

        // =====================
        // 🔥 LEFT CAP
        // =====================

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY - 8
        );

        ctx.lineTo(
            startX,
            startY + 8
        );

        ctx.stroke();

        // =====================
        // 🔥 RIGHT CAP
        // =====================

        ctx.beginPath();

        ctx.moveTo(
            endX,
            startY - 8
        );

        ctx.lineTo(
            endX,
            startY + 8
        );

        ctx.stroke();

        // =====================
        // 🔥 TEXT
        // =====================

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "1 m",
            (startX + endX) / 2,
            startY - 12
        );

        ctx.restore();
    }

    ctx.restore();
}

function openEditScalePopup(index) {

    const floor =
        AppState.project.floors[index];

    if (!floor) {
        return;
    }

    // 🔥 OPEN FLOOR FIRST

    openFloor?.(index);

    // 🔥 SCALE NOT SET YET

    if (!floor.scaleConfirmed) {

        startScaleTool?.();

        return;
    }

    // 🔥 SCALE ALREADY EXISTS

    window.scaleFloorIndex =
        index;

    openRecalibrateScalePopup?.();
}

function openRecalibrateScalePopup() {

    document.getElementById(
        "recalibrateScaleModal"
    ).style.display = "flex";
}

function closeRecalibrateScalePopup() {

    document.getElementById(
        "recalibrateScaleModal"
    ).style.display =
        "none";
}

function confirmRecalibrateScale() {

    closeRecalibrateScalePopup?.();

    const index =
        window.scaleFloorIndex;

    if (
        index === undefined ||
        index === null
    ) {
        return;
    }

    openFloor?.(index);

    startScaleTool?.();

    window.scaleFloorIndex =
        null;
}


function showScaleGuidance(
    step
) {

    let guidance =
        document.getElementById(
            "scaleGuidance"
        );


    // ==================================================
    // CREATE
    // ==================================================

    if (!guidance) {

        guidance =
            document.createElement(
                "div"
            );

        guidance.id =
            "scaleGuidance";

        document.body.appendChild(
            guidance
        );
    }


    // ==================================================
    // CONTENT
    // ==================================================

    if (
        step ===
        "first"
    ) {

        guidance.innerHTML = `

            <div class="scale-guidance-step">
                STEP 1
            </div>

            <div class="scale-guidance-title">
                Click the first point
            </div>

            <div class="scale-guidance-text">
                Choose one end of a known distance
                on the floor plan.
            </div>

        `;
    }


    else if (
        step ===
        "second"
    ) {

        guidance.innerHTML = `

            <div class="scale-guidance-step">
                STEP 2
            </div>

            <div class="scale-guidance-title">
                Click the second point
            </div>

            <div class="scale-guidance-text">
                Choose the other end of the same
                known distance.
            </div>

        `;
    }


    else if (
        step ===
        "distance"
    ) {

        guidance.innerHTML = `

            <div class="scale-guidance-step">
                STEP 3
            </div>

            <div class="scale-guidance-title">
                Enter the real distance
            </div>

            <div class="scale-guidance-text">
                Enter the actual distance between
                the two selected points.
            </div>

        `;
    }


    // ==================================================
    // SHOW
    // ==================================================

    guidance.style.display =
        "block";
}

function hideScaleGuidance() {

    const guidance =
        document.getElementById(
            "scaleGuidance"
        );

    if (guidance) {

        guidance.style.display =
            "none";
    }
}

function startScaleTool() {

    console.log(
        "🔥 START SCALE TOOL"
    );


    const tool =
        window.scaleTool;


    if (!tool) {

        console.error(
            "❌ SCALE TOOL NOT FOUND"
        );

        return;
    }


    // ==================================================
    // PROJECT UNITS
    // ==================================================

    const units =
        getProjectUnits?.();


    // ==================================================
    // UNITS REQUIRED
    // ==================================================

    if (!units) {

        console.log(
            "🔥 SCALE — UNITS NOT SELECTED"
        );

        showUnitsSelector();

        return;
    }


    // ==================================================
    // SCALE MODE
    // ==================================================

    AppState.ui.mode =
        "scale";


    tool.active =
        true;


    tool.points =
        [];


    pendingScalePoints =
        [];


    // ==================================================
    // HIDE OLD SCALE BAR
    // ==================================================

    requestRender?.();


    // ==================================================
    // CURSOR
    // ==================================================

    if (window.canvas) {

        window.canvas.style.cursor =
            "crosshair";
    }


    // ==================================================
    // STATUS
    // ==================================================

    const status =
        document.getElementById(
            "statusText"
        );

    if (status) {

        status.innerText =
            "Scale: click the first point on the floor plan";
    }


    // ==================================================
    // BUTTON
    // ==================================================

    const btn =
        document.getElementById(
            "btnScale"
        );

    if (btn) {

        btn.innerText =
            "Set Scale";

        btn.style.outline =
            "";

        btn.style.outlineOffset =
            "";

        btn.style.background =
            "";

        btn.style.color =
            "";

        btn.classList.add(
            "workflow-next-action"
        );
    }


    // ==================================================
    // HEADER
    // ==================================================

    updateProjectHeader?.();


    // ==================================================
    // SCALE GUIDANCE
    // ==================================================

    showScaleGuidance?.(
        "first"
    );


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();


    console.log(
        "🔥🔥🔥 SCALE MODE ACTIVE",
        {
            units,
            active:
                tool.active,
            points:
                tool.points.length
        }
    );
}

function startObjectScale() {

    const floor = getCurrentFloor();
    if (!floor) return;

    const rooms = floor.rooms;

    const type = prompt("Enter object type (door=0.9m, bed=2m):");

    let size = 1;

    if (type === "door") size = 0.9;
    if (type === "bed") size = 2;

    setActiveMode("scale_object");
    window.scalePoints = [];
    scaleObjectSize = size;

    alert("Click 2 points across the object");
}

function openScaleModal() {

    document
        .getElementById("btnScale")
        ?.classList.add("active");

    document
        .getElementById("scaleModal")
        ?.classList.remove("hidden");
}

function closeScaleModal() {

    document
        .getElementById("btnScale")
        ?.classList.remove("active");

    document
        .getElementById("scaleModal")
        ?.classList.add("hidden");
}

function startScale() {

    AppState.ui.mode =
        "scale";

    console.log(
        "MODE CHANGED TO SCALE"
    );

    if (window.canvas) {

        canvas.style.cursor =
            "crosshair";
    }

    const selected =
        document.querySelector(
            'input[name="scaleMode"]:checked'
        );

    if (!selected) {

        alert("Select scale mode");

        return;
    }

    const modeSelected = selected.value;

    console.log(
        "SET SCALE MODE:",
        modeSelected
    );

    // =====================
    // 🔥 TEMP DISABLE
    // =====================

    if (modeSelected === "points") {

        window.scalePoints = [];

        isScaling = true;

        setActiveMode("scale");

        closeScaleModal();

        updateStatus("📏 Click 2 points");

        return;
    }

    if (modeSelected === "object") {

        // 🔥 clear existing array safely


        if (!window.scalePoints) {

            window.scalePoints = [];
        }

        window.scalePoints.length = 0;


        isScaling = true;

        setActiveMode("scale_object");

        closeScaleModal();

        updateStatus(
            "📏 Click 2 points across object"
        );

        requestRender();

        return;
    }


    closeScaleModal();
}


function validateFloorScale(
    floor
) {

    if (
        !floor?.image ||
        !floor?.currentScale
    ) {
        return null;
    }

    const widthMeters =

        floor.image.width *
        floor.currentScale;

    const heightMeters =

        floor.image.height *
        floor.currentScale;

    const largestDimension =

        Math.max(
            widthMeters,
            heightMeters
        );

    if (
        largestDimension < 3
    ) {

        return {
            type: "small",
            message:
                "⚠️ This floor appears unusually small. Please verify the reference measurement."
        };
    }

    if (
        largestDimension > 60
    ) {

        return {
            type: "large",
            message:
                "⚠️ This floor appears unusually large. Please verify the reference measurement."
        };
    }

    return null;
}

console.error(
    "🔥🔥🔥 SCALE V2 FILE START"
);


// =====================
// 🔥 SCALE TOOL
// =====================

window.startScaleTool =
    startScaleTool;

window.handleScaleToolClick =
    handleScaleToolClick;

window.drawScaleTool =
    drawScaleTool;

window.openProjectUnitsSelector =
    openProjectUnitsSelector;


// =====================
// 🔥 SCALE UI
// =====================

window.openScaleModal =
    openScaleModal;

window.closeScaleModal =
    closeScaleModal;

window.startScale =
    startScale;

window.validateFloorScale =
    validateFloorScale;


// =====================
// 🔥 LEGACY COMPATIBILITY
// =====================

window.startScaleMode =
    startScaleTool;

window.handleScaleClick =
    handleScaleToolClick;

if (
    typeof handleScaleObjectClick ===
    "function"
) {

    window.handleScaleObjectClick =
        handleScaleObjectClick;

}

console.error(
    "🔥🔥🔥 SCALE V2 BEFORE EXPORTS"
);

window.scaleToolV2 =
    window.scaleTool;