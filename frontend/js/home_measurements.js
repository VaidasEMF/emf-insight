/* =========================================================
   HOME WELLNESS — EMF MEASUREMENTS
   Isolated from Business Survey measurement workflow.
   ========================================================= */

(function () {
    "use strict";

    const HOME_MODE = "home";

    function getHomeFloor() {
        if (window.AppMode?.current !== HOME_MODE) return null;

        const project = window.AppState?.project;
        if (!project) return null;

        // Prefer the application's existing active-floor getter.
        if (typeof window.getCurrentFloor === "function") {
            const currentFloor = window.getCurrentFloor();

            if (currentFloor) {
                return currentFloor;
            }
        }

        const index = Number.isInteger(project.currentFloorIndex)
            ? project.currentFloorIndex
            : 0;

        return project.floors?.[index] || null;
    }


    function getHomeRooms() {
        return getHomeFloor()?.rooms || [];
    }

    function getRoomGridStats(room) {
        const points = Array.isArray(room?.grid) ? room.grid : [];
        const measured = points.filter(point => point?.measured === true).length;

        return {
            total: points.length,
            measured,
            remaining: Math.max(0, points.length - measured)
        };
    }


    function openRoom(room) {
        if (window.AppMode?.current !== HOME_MODE) return;

        if (!room || !Array.isArray(room.polygon) || room.polygon.length < 3) {
            alert("The selected room has no valid floor-plan boundary.");
            return;
        }

        const floor = getHomeFloor();
        if (!floor) return;

        if (!Array.isArray(room.grid)) {
            room.grid = [];
        }

        window.HomeMeasurements.activeRoom = room;

        console.log("[HOME MEASUREMENTS] Room selected", {
            room: room.name || room.code || room.id,
            floor: floor.name,
            polygon: room.polygon,
            existingGridPoints: room.grid.length
        });

        // Switch the Guided Measurement page to the selected room.
        const content = document.getElementById("homeMeasurementsPageContent");
        if (!content) {
            console.error("[HOME MEASUREMENTS] Page content container not found.");
            return;
        }

        content.innerHTML = `
        <div class="home-measurement-room-view">
            <button
                type="button"
                id="homeMeasurementBackToRooms"
                class="secondary-btn">
                ← Back to rooms
            </button>

            <h2>${escapeHtml(room.name || room.code || "Selected room")}</h2>

            <p>
                Review your selected room before starting the measurements.
            </p>

            <div
                id="homeMeasurementFloorPlan"
                style="
                    position: relative;
                    width: 100%;
                    min-height: 280px;
                    background: #ffffff;
                    border: 1px solid #d9e0e8;
                    border-radius: 12px;
                    overflow: hidden;
                ">
                <p style="padding: 20px; color: #64748b;">
                    Preparing floor plan…
                </p>
            </div>

            <div style="margin-top: 20px;">
                <h3>Measurement points</h3>
                <p>
                    The next step is to prepare the measurement points
                    for this room.
                </p>
                <p id="homeMeasurementRoomStatus" role="status"></p>
            </div>
        </div>
    `;

        content.querySelector("#homeMeasurementBackToRooms")
            ?.addEventListener("click", () => showPage("guided"));

        // Diagnostic only: verify the selected room and plan are available.
        const plan = content.querySelector("#homeMeasurementFloorPlan");

        if (floor.image) {
            console.log(
                "[HOME MEASUREMENTS] Floor image available for room view",
                {
                    floor: floor.name,
                    imageType: typeof floor.image,
                    room: room.name || room.code
                }
            );

            plan.innerHTML = `
            <p style="padding: 20px; color: #64748b;">
                Floor plan is available. Plan rendering will be connected
                in the next step.
            </p>
        `;
        } else {
            plan.innerHTML = `
            <p style="padding: 20px; color: #b45309;">
                No floor plan image is available for this floor.
            </p>
        `;
        }

        console.log("[HOME MEASUREMENTS] Room view opened", {
            room: room.name || room.code || room.id,
            floor: floor.name,
            canvasAvailable: !!window.canvas,
            roomPolygonPoints: room.polygon.length
        });
    }


    function openLifestyleArea(zone) {
        if (window.AppMode?.current !== HOME_MODE) return;

        if (!zone || !Number.isFinite(Number(zone.x)) ||
            !Number.isFinite(Number(zone.y))) {
            console.warn("[HOME MEASUREMENTS] Invalid Lifestyle Area.");
            return;
        }

        const floor = getHomeFloor();

        if (!floor?.image) {
            console.error("[HOME MEASUREMENTS] Floor plan image unavailable.");
            return;
        }


        // Always calculate measurement points from the current
        // Lifestyle Area geometry.
        const generatedPoints =
            generateLifestyleMeasurementPoints(zone, floor);

        if (!generatedPoints.length) {
            console.warn(
                "[HOME MEASUREMENTS] No measurement points generated."
            );
            return;
        }

        const existingPoints = Array.isArray(zone.measurementPoints)
            ? zone.measurementPoints
            : [];

        const existingPointsById = new Map(
            existingPoints.map(point => [point.id, point])
        );

        const measurementPoints = generatedPoints.map(generated => {
            const existing = existingPointsById.get(generated.id);

            // Keep readings only if the measurement position
            // has not changed.
            const samePosition =
                existing &&
                Math.abs(Number(existing.x) - generated.x) < 0.01 &&
                Math.abs(Number(existing.y) - generated.y) < 0.01;

            if (samePosition) {
                return {
                    ...generated,
                    ...existing,
                    x: generated.x,
                    y: generated.y,
                    zoneId: zone.id
                };
            }

            return {
                ...generated,
                status: "pending",
                measured: false,
                readings: {}
            };
        });

        zone.measurementPoints = measurementPoints;

        saveHomeProject();

        console.log("[HOME MEASUREMENTS] Measurement points synchronized", {
            zoneId: zone.id,
            pointCount: measurementPoints.length,
            previousPointCount: existingPoints.length
        });

        const widthM = Number(zone.measurementZoneDimensions?.width);
        const depthM = Number(zone.measurementZoneDimensions?.depth);
        const scale = Number(floor.currentScale);

        if (!widthM || !depthM || !scale) {
            console.warn("[HOME MEASUREMENTS] Invalid measurement area dimensions.");
            return;
        }

        const widthPx = widthM / scale;
        const depthPx = depthM / scale;

        const corners = [
            { x: zone.x - widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y + depthPx / 2 },
            { x: zone.x - widthPx / 2, y: zone.y + depthPx / 2 }
        ];

        const content =
            document.getElementById("homeMeasurementsPageContent");

        if (!content) return;

        const viewport = window.EMFViewport;

        if (!viewport || typeof viewport.worldPoint !== "function") {
            console.error("[HOME MEASUREMENTS] Viewport transform unavailable.");
            return;
        }

        const image = floor.image;
        const canvas = document.getElementById("canvas");

        const viewWidth = canvas?.width || viewport.drawWidth;
        const viewHeight = canvas?.height || viewport.drawHeight;

        const screenCorners = corners.map(point =>
            viewport.worldPoint(point)
        );

        const polygonPoints = screenCorners
            .map(point => `${point.x},${point.y}`)
            .join(" ");

        const zoneName =
            zone.lifestylePresetLabel ||
            zone.name ||
            "Lifestyle Area";

        window.HomeMeasurements.activeLifestyleArea = zone;

        content.innerHTML = `
        <section class="home-measurements-placeholder">

            <button
                type="button"
                id="homeMeasurementBackToAreas"
                class="secondary-btn">
                ← Back to Guided Measurement
            </button>

            <h2>${escapeHtml(zoneName)}</h2>

            <p>
                Review the measurement area and suggested
                measurement points.
            </p>

            <div style="width:100%; overflow:auto;">
                <svg
                    id="homeMeasurementLifestylePlan"
                    viewBox="0 0 ${viewWidth} ${viewHeight}"
                    role="img"
                    aria-label="Floor plan and Lifestyle Area measurement points"
                    style="
                        display:block;
                        width:100%;
                        max-height:65vh;
                        background:#f8fafc;
                        border:1px solid #d9e0e8;
                        border-radius:8px;
                    "
                >
                    <image
                        href="${image.src}"
                        x="${viewport.offsetX}"
                        y="${viewport.offsetY}"
                        width="${viewport.drawWidth}"
                        height="${viewport.drawHeight}"
                        preserveAspectRatio="none"
                    />

                    <polygon
                        points="${polygonPoints}"
                        fill="rgba(37,99,235,0.15)"
                        stroke="#2563eb"
                        stroke-width="3"
                        stroke-linejoin="round"
                    />

                   ${measurementPoints.map((point, index) => {
            const screenPoint = viewport.worldPoint(point);

            const pointColor =
                point.status === "measured"
                    ? "#06b6d4"
                    : point.status === "partial"
                        ? "#8b5cf6"
                        : "#94a3b8";

            const pointFill =
                point.status === "measured"
                    ? "#06b6d4"
                    : point.status === "partial"
                        ? "#8b5cf6"
                        : "#ffffff";

            const textColor =
                point.status === "pending"
                    ? "#64748b"
                    : "#ffffff";

            return `
        <g
            class="home-measurement-point"
            data-point-id="${point.id}"
        >
            <circle
                cx="${screenPoint.x}"
                cy="${screenPoint.y}"
                r="14"
                fill="${pointFill}"
                stroke="${pointColor}"
                stroke-width="3"
            />
            <text
                x="${screenPoint.x}"
                y="${screenPoint.y}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="13"
                font-weight="700"
                fill="${textColor}"
            >${index + 1}</text>
        </g>
    `;
        }).join("")}
                </svg>
            </div>

            <h3>Measurement points: ${measurementPoints.length}</h3>

            <p>
                Suggested measurement positions are displayed
                inside the Lifestyle Area.
            </p>

        </section>
    `;


    }


    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }


    function showPage(page) {
        const workspace = document.getElementById("homeMeasurementsWorkspace");
        if (!workspace) return;

        const pages = {
            overview: {
                title: "Measure Your Home",
                subtitle: "Your guided path from setup to real EMF readings."
            },
            method: {
                title: "Choose Measurement Mode",
                subtitle: "Select how you want to complete your home measurements."
            },
            profile: {
                title: "Measurement Profile",
                subtitle: "Choose which EMF types you want to measure in your home."
            },
            guided: {
                title: "Guided Measurement",
                subtitle: "Follow each instruction and enter readings from your meter."
            },
            results: {
                title: "Measurement Results",
                subtitle: "Review your saved readings and measurement progress."
            },
            report: {
                title: "Property Health Report",
                subtitle: "Unlock a detailed analysis and personalised recommendations."
            }
        };

        const selected = pages[page] || pages.overview;
        const activePage = pages[page] ? page : "overview";

        workspace.querySelectorAll("[data-home-measurements-page]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.homeMeasurementsPage === activePage
                );
            });

        const title = workspace.querySelector("#homeMeasurementsPageTitle");
        const subtitle = workspace.querySelector("#homeMeasurementsPageSubtitle");
        const content = ["method", "profile"].includes(activePage)
            ? document.getElementById("homeGuidedRightPanel")
            : workspace.querySelector("#homeMeasurementsPageContent");

        if (!title || !subtitle || !content) {
            console.error("[HOME MEASUREMENTS] Page elements missing.");
            return;
        }

        title.textContent = selected.title;
        subtitle.textContent = selected.subtitle;

        // ==================================================
        // MEASUREMENT METHOD
        // ==================================================


        if (activePage === "method") {
            const currentMethod =
                window.HomeMeasurements?.selectedMethod || "rent_meter";

            const currentMode =
                window.HomeMeasurements?.selectedMeasurementMode || "computer";

            // Save default selections
            window.HomeMeasurements.selectedMeasurementMode = currentMode;
            window.HomeMeasurements.selectedMethod = currentMethod;

            content.innerHTML = `
    <div class="home-measurements-placeholder home-setup-compact">

        <div class="home-setup-header">
            <h2>Measurement Setup</h2>
            <p>Set up how you will measure your home environment.</p>
        </div>

        <!-- 1. MEASUREMENT MODE -->

        <section class="home-setup-section">

            <h3>1. Measurement Mode</h3>

            <div class="home-measurement-method-options home-measurement-mode-options">

                <button
                    type="button"
                    data-measurement-mode="computer"
                    class="${currentMode === "computer" ? "active" : ""}"
                    aria-pressed="${currentMode === "computer"}"
                >
                    <span class="mode-icon">🖥️</span>
                    <span class="mode-card-content">
                        <strong>Computer</strong>
                        <small>Plan and enter measurements using your computer.</small>
                    </span>
                </button>
<button
    type="button"
    data-measurement-mode="mobile"
    class="${currentMode === "mobile" ? "active" : ""}"
    aria-pressed="${currentMode === "mobile"}"
>
    <span class="mode-icon">📱</span>
    <span class="mode-card-content">
        <strong>Mobile</strong>
        <small>Follow guided measurements using your phone.</small>
    </span>
</button>

            </div>
        </section>

        <!-- 2. MEASUREMENT METHOD -->

        <div id="homeMeasurementMeterOptions">

            <section class="home-setup-section">

                <h3>2. Measurement Method</h3>
                <p class="home-setup-hint">
                    Choose how you will get your EMF meter.
                </p>

                <div class="home-measurement-method-list">

                    <button
    type="button"
    data-measurement-method="own_meter"
    class="${currentMethod === "own_meter" ? "active" : ""}"
    aria-pressed="${currentMethod === "own_meter"}"
>
    <span class="method-icon">🏠</span>
    <span class="method-card-content">
        <strong>I have my own EMF meter</strong>
        <small>Use your compatible measuring device.</small>
    </span>
    <span class="method-arrow">›</span>
</button>

                    <button
                        type="button"
                        data-measurement-method="rent_meter"
                        class="${currentMethod === "rent_meter" ? "active" : ""}"
                        aria-pressed="${currentMethod === "rent_meter"}"
                    >
                        <span class="method-icon">📅</span>
                        <span class="method-card-content">
                            <strong>Rent an EMF meter</strong>
                            <small>Explore available rental options.</small>
                        </span>
                         <span class="method-arrow">›</span>
                    </button>

                    <button
    type="button"
    data-measurement-method="buy_meter"
class="home-measurement-buy-card ${currentMethod === "buy_meter" ? "active" : ""}"
aria-pressed="${currentMethod === "buy_meter"}"
>
                        <span class="method-icon">🛒</span>
                        <span class="method-card-content">
                            <strong>Buy an EMF meter</strong>
                            <small>Explore recommended measuring devices.</small>
                        </span>
                         <span class="method-arrow">›</span>
                    </button>

                </div>
            </section>

            <!-- 3. MEASUREMENT PROFILE -->

            <section class="home-setup-section">

                <div class="home-measurement-profile-summary">

                    <div class="home-profile-heading">
                        <h3>3. Measurement Profile</h3>
                        <span class="home-profile-recommended">Recommended</span>
                    </div>

                    <div class="home-profile-rf">
                        <span class="home-profile-icon">📶</span>

                        <div class="home-profile-info">
                            <strong>RF – Wireless Radiation</strong>
                            <small>
                                <span class="home-profile-check">✓</span>
                                Selected by default · Recommended
                            </small>
                        </div>
                    </div>

                    <div class="home-profile-additional">

                        <div class="home-profile-option">
                            <span class="home-profile-icon">⚡</span>
                            <strong>Electric Fields</strong>
                            <small>Optional</small>
                        </div>

                        <div class="home-profile-option">
                            <span class="home-profile-icon">🧲</span>
                            <strong>Magnetic Fields</strong>
                            <small>Optional</small>
                        </div>

                    </div>

                    <button
                        type="button"
                        id="homeMeasurementEditProfile"
                        class="home-profile-edit"
                    >
                        Change Profile
                    </button>

                </div>

            </section>

        </div>

        <p id="homeMeasurementMethodStatus" role="status">
            ${currentMode === "mobile"
                    ? "Mobile selected."
                    : currentMethod === "own_meter"
                        ? "Your own EMF meter selected."
                        : currentMethod === "rent_meter"
                            ? "Rental option selected."
                            : currentMethod === "buy_meter"
                                ? "Purchase option selected."
                                : "Choose your EMF meter option."}
        </p>

        <button
            type="button"
            id="homeMeasurementContinue"
            ${(currentMode === "computer" && currentMethod) ? "" : "hidden"}
            class="home-measurement-continue"
        >
            Continue to Guided Measurement →
        </button>

    </div>
`;


            content.querySelectorAll("[data-measurement-method]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        const method = button.dataset.measurementMethod;

                        window.HomeMeasurements.selectedMethod = method;

                        content.querySelectorAll("[data-measurement-method]")
                            .forEach(option => {
                                const active = option === button;
                                option.classList.toggle("active", active);
                                option.setAttribute("aria-pressed", String(active));
                            });

                        const methodMessages = {
                            own_meter: "Your own EMF meter selected.",
                            rent_meter: "Rental option selected.",
                            buy_meter: "Purchase option selected."
                        };

                        content.querySelector("#homeMeasurementMethodStatus").textContent =
                            methodMessages[method] || "Choose your EMF meter option.";
                        content.querySelector("#homeMeasurementContinue").hidden =
                            window.HomeMeasurements.selectedMeasurementMode !== "computer";
                    });
                });

            // MEASUREMENT MODE SELECTION
            content.querySelectorAll("[data-measurement-mode]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        const mode = button.dataset.measurementMode;

                        window.HomeMeasurements.selectedMeasurementMode = mode;

                        content.querySelectorAll("[data-measurement-mode]")
                            .forEach(option => {
                                const active = option === button;

                                option.classList.toggle("active", active);
                                option.setAttribute("aria-pressed", String(active));
                            });

                        const status =
                            content.querySelector("#homeMeasurementMethodStatus");

                        if (status) {
                            status.textContent =
                                mode === "mobile"
                                    ? "Mobile selected."
                                    : window.HomeMeasurements.selectedMethod
                                        ? "Computer selected. Measurement method is ready."
                                        : "Computer selected. Choose your EMF meter option.";
                        }

                        const continueButton =
                            content.querySelector("#homeMeasurementContinue");

                        if (continueButton) {
                            continueButton.hidden =
                                mode !== "computer" ||
                                !window.HomeMeasurements.selectedMethod;
                        }
                    });
                });

            // CHANGE MEASUREMENT PROFILE
            content.querySelector("#homeMeasurementEditProfile")
                ?.addEventListener("click", () => {
                    showPage("profile");
                });

            // CONTINUE TO GUIDED MEASUREMENT
            content.querySelector("#homeMeasurementContinue")
                ?.addEventListener("click", () => {
                    if (
                        window.HomeMeasurements?.selectedMeasurementMode !== "computer" ||
                        !window.HomeMeasurements?.selectedMethod
                    ) {
                        return;
                    }

                    const existingProfile =
                        window.AppState?.project?.homeMeasurementProfile;

                    if (
                        existingProfile &&
                        Array.isArray(existingProfile.measurementTypes) &&
                        existingProfile.measurementTypes.includes("rf")
                    ) {
                        showPage("guided");
                    } else {
                        showPage("profile");
                    }
                });

            return;
        }


        // ==================================================
        // HOME MEASUREMENT PROFILE — INITIAL SETUP
        // ==================================================

        if (activePage === "profile") {
            const project = window.AppState?.project;

            const savedTypes =
                project?.homeMeasurementProfile?.measurementTypes || ["rf"];

            content.innerHTML = `
                <div class="home-measurements-placeholder">
                    <h2>Measurement Profile</h2>

                    <p>
                        Choose which EMF types you want to measure.
                        RF is recommended for starting your home assessment.
                    </p>

                    <div style="
                        padding:16px;
                        border:1px solid #93c5fd;
                        border-radius:10px;
                        background:#eff6ff;
                    ">
                        <label style="display:flex;gap:12px;align-items:center;">
                            <input type="checkbox"
    id="homeProfileRF"
    ${savedTypes.includes("rf") ? "checked" : ""}>
                            <strong>RF – Wireless Radiation</strong>
                            <span style="color:#047857;">Recommended</span>
                        </label>
                        <p style="margin:8px 0 0 28px;color:#64748b;">
                            Wi-Fi routers, mobile phones, Bluetooth devices
                            and other wireless signals.
                        </p>
                    </div>

                    <div style="
                        margin-top:12px;
                        padding:16px;
                        border:1px solid #dbe3ef;
                        border-radius:10px;
                    ">
                        <label style="display:flex;gap:12px;align-items:center;">
                            <input type="checkbox"
                                id="homeProfileElectric"
                                ${savedTypes.includes("electric") ? "checked" : ""}>
                            <strong>Electric Fields</strong>
                            <span style="color:#64748b;">Optional</span>
                        </label>
                        <p style="margin:8px 0 0 28px;color:#64748b;">
                            Electrical wiring and powered appliances.
                        </p>
                    </div>

                    <div style="
                        margin-top:12px;
                        padding:16px;
                        border:1px solid #dbe3ef;
                        border-radius:10px;
                    ">
                        <label style="display:flex;gap:12px;align-items:center;">
                            <input type="checkbox"
                                id="homeProfileMagnetic"
                                ${savedTypes.includes("magnetic") ? "checked" : ""}>
                            <strong>Magnetic Fields</strong>
                            <span style="color:#64748b;">Optional</span>
                        </label>
                        <p style="margin:8px 0 0 28px;color:#64748b;">
                            Magnetic fields associated with electrical currents.
                        </p>
                    </div>

                    <button
                        type="button"
                        id="homeProfileContinue"
                        style="
                            margin-top:20px;
                            padding:12px 22px;
                            border:0;
                            border-radius:8px;
                            background:#2563eb;
                            color:white;
                            cursor:pointer;
                        "
                    >
                        Save Profile & Continue
                    </button>
                </div>
            `;

            content.querySelector("#homeProfileContinue")
                ?.addEventListener("click", async () => {
                    const selectedTypes = [];

                    if (content.querySelector("#homeProfileRF").checked) {
                        selectedTypes.push("rf");
                    }

                    if (content.querySelector("#homeProfileElectric").checked) {
                        selectedTypes.push("electric");
                    }

                    if (content.querySelector("#homeProfileMagnetic").checked) {
                        selectedTypes.push("magnetic");
                    }

                    const saved = await window.HomeMeasurements
                        .saveHomeMeasurementProfile(selectedTypes);

                    console.log("[PROFILE SAVE RESULT]", saved);
                    console.log("[PROFILE SAVE PAGE]", "returning to method");
                    if (!saved) {
                        alert("Unable to save Measurement Profile. Please try again.");
                        return;
                    }

                    showPage("method");

                    console.log("[PROFILE SAVE COMPLETE]");
                });

            return;
        }


        // ==================================================
        // GUIDED MEASUREMENT — LIFESTYLE AREA SELECTION
        // ==================================================

        if (activePage === "guided") {
            const method = window.HomeMeasurements?.selectedMethod;

            if (!method) {
                content.innerHTML = `
                    <div class="home-measurements-placeholder">
                        <h2>Choose Measurement Method First</h2>
                        <p>Select your measurement method before starting.</p>
                        <button type="button" id="homeMeasurementChooseMethod">
                            Choose Measurement Method
                        </button>
                    </div>
                `;

                content.querySelector("#homeMeasurementChooseMethod")
                    ?.addEventListener("click", () => showPage("method"));

                return;
            }

            const floor = window.HomeMeasurements?.getHomeFloor?.();
            const zones = Array.isArray(floor?.zones) ? floor.zones : [];

            content.innerHTML = `
                <div class="home-measurements-placeholder">
                    <h2>Guided Measurement</h2>

                    <p>
                        Select a Lifestyle Area to begin your guided
                        EMF measurements.
                    </p>
<div class="home-guided-method-summary">
    <div>
        <strong>Measurement mode:</strong>
        Computer
    </div>
    <div style="margin-top:6px;">
        <strong>Measurement method:</strong>
        ${method === "own_meter" ? "Own EMF meter" : "Meter rental"}
    </div>
</div>

                    <h3>Select a Lifestyle Area</h3>

                    <div id="homeGuidedLifestyleAreaList">
                        ${zones.length
                    ? zones.map((zone, index) => {
                        const name =
                            zone.lifestylePresetLabel ||
                            zone.name ||
                            zone.zoneType ||
                            `Lifestyle Area ${index + 1}`;

                        const pointCount =
                            window.HomeMeasurements
                                .generateLifestyleMeasurementPoints(
                                    zone,
                                    floor
                                ).length;

                        return `
                                    <button
                                        type="button"
                                        class="home-guided-room-option"
                                        data-lifestyle-index="${index}"
                                        style="
                                            display:flex;
                                            flex-direction:column;
                                            align-items:flex-start;
                                            gap:6px;
                                            width:100%;
                                            margin:10px 0;
                                            padding:16px;
                                            border:1px solid #d9e0e8;
                                            border-radius:10px;
                                            background:#ffffff;
                                            color:#1f2937;
                                            text-align:left;
                                            cursor:pointer;
                                        "
                                    >
                                        <strong>${escapeHtml(name)}</strong>
                                        <span>
                                            ${pointCount} suggested measurement points
                                        </span>
                                    </button>
                                `;
                    }).join("")
                    : `
                                <p>
                                    No Lifestyle Areas found on this floor.
                                    Return to Home Wellness and add Lifestyle Areas first.
                                </p>
                            `
                }
                    </div>

                    <p id="homeGuidedLifestyleStatus" role="status"></p>
                </div>
            `;

            content.querySelectorAll("[data-lifestyle-index]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        const index = Number(button.dataset.lifestyleIndex);
                        const zone = zones[index];

                        if (!zone) return;

                        window.HomeMeasurements.openLifestyleArea(zone);
                    });
                });

            console.log("[HOME MEASUREMENTS] Guided Lifestyle Areas loaded", {
                floor: floor?.name || "Unknown floor",
                lifestyleAreaCount: zones.length,
                method
            });

            return;
        }


        // ==================================================
        // OVERVIEW, RESULTS AND REPORT PLACEHOLDERS
        // ==================================================

        const pageContent = {
            overview: `
            <h2>Measure Your Home</h2>
            <p>Your guided path from setup to real EMF readings.</p>
            <p>Choose Measurement Method to begin.</p>
            <button type="button" id="homeOverviewChooseMethod">
                Choose Measurement Method
            </button>
        `,
            results: `
            <h2>Measurement Results</h2>
            <p>Your saved readings and measurement progress will appear here.</p>
        `,
            report: `
            <h2>Property Health Report</h2>
            <p>
                Unlock the full property analysis, risk evaluation,
                personalised recommendations and Premium PDF.
            </p>
            <p>Report generation and payment are not connected yet.</p>
        `
        };

        content.innerHTML = `
        <div class="home-measurements-placeholder">
            ${pageContent[activePage] || pageContent.overview}
        </div>
    `;

        content.querySelector("#homeOverviewChooseMethod")
            ?.addEventListener("click", () => showPage("method"));
    }


    function closeWorkspace() {
        const workspace = document.getElementById("homeMeasurementsWorkspace");

        if (workspace) {
            workspace.style.display = "none";
        }
    }


    function start() {
        if (window.AppMode?.current !== HOME_MODE) {
            console.warn(
                "[HOME MEASUREMENTS] Available only in Home Wellness mode."
            );
            return;
        }

        const floor = getHomeFloor();

        if (!floor) {
            alert("Open a Home Wellness project first.");
            return;
        }

        openWorkspace();
    }


    function openWorkspace() {
        if (window.AppMode?.current !== HOME_MODE) return;

        let workspace = document.getElementById("homeMeasurementsWorkspace");

        if (!workspace) {
            workspace = document.createElement("section");
            workspace.id = "homeMeasurementsWorkspace";
            workspace.className = "home-measurements-workspace";

            workspace.innerHTML = `
            <aside class="home-measurements-sidebar">
                <h2>Home Measurements</h2>

                <button type="button" data-home-measurements-page="overview">
                    Overview
                </button>

               <button type="button" data-home-measurements-page="method">
    Measurement Method
</button>

<button type="button" data-home-measurements-page="profile">
    Measurement Profile
</button>

<button type="button" data-home-measurements-page="guided">
    Guided Measurement
</button>

                <button type="button" data-home-measurements-page="results">
                    Results
                </button>

                <button type="button" data-home-measurements-page="report">
                    Property Health Report
                </button>

                <button type="button" id="homeMeasurementsExit">
                    Back to Home Wellness
                </button>
            </aside>

            <main class="home-measurements-main">
                <header>
                    <h1 id="homeMeasurementsPageTitle"></h1>
                    <p id="homeMeasurementsPageSubtitle"></p>
                </header>

                <div id="homeMeasurementsPageContent"></div>
            </main>
        `;

            document.body.appendChild(workspace);

            workspace.querySelectorAll("[data-home-measurements-page]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        showPage(button.dataset.homeMeasurementsPage);
                    });
                });

            workspace.querySelector("#homeMeasurementsExit")
                ?.addEventListener("click", closeWorkspace);
        }

        // Keep the legacy workspace as a hidden controller.
        workspace.style.display = "none";

        // Activate the main Canvas layout with the right panel.
        document.querySelector(".canvas-area")
            ?.classList.add("home-guided-layout");

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resizeCanvasSafe?.();
                requestRender?.();


            });
        });

        showPage("method");

        console.log("[HOME MEASUREMENTS] Setup opened in right panel");
    }


    async function saveHomeProject() {
        if (window.AppMode?.current !== HOME_MODE) {
            console.error("[HOME SAVE] Wrong mode");
            return false;
        }

        if (typeof window.saveProject !== "function") {
            console.error("[HOME SAVE] saveProject unavailable");
            return false;
        }

        console.time("[HOME SAVE DURATION]");

        console.log("[HOME SAVE] Started");

        const result = await window.saveProject();

        console.timeEnd("[HOME SAVE DURATION]");
        console.log("[HOME SAVE] Finished:", result);

        return result;
    }


    function getHomeMeasurementProfile() {
        const project = window.AppState?.project;
        if (!project) return null;

        if (!project.homeMeasurementProfile) {
            project.homeMeasurementProfile = {
                measurementTypes: ["rf"]
            };
        }

        return project.homeMeasurementProfile;
    }


    function saveHomeMeasurementProfile(measurementTypes) {
        if (window.AppMode?.current !== HOME_MODE) return false;

        const project = window.AppState?.project;
        if (!project) return false;

        const allowedTypes = ["rf", "electric", "magnetic"];

        const selectedTypes = [...new Set(
            (Array.isArray(measurementTypes) ? measurementTypes : [])
                .filter(type => allowedTypes.includes(type))
        )];

        if (!selectedTypes.length) return false;

        project.homeMeasurementProfile = {
            measurementTypes: selectedTypes
        };

        return saveHomeProject();
    }



    function generateRoomMeasurementPoints(room, count = 3) {
        if (!room || !Array.isArray(room.polygon) || room.polygon.length < 3) {
            return [];
        }

        // Point-in-polygon test: ray casting.
        function isInside(point, polygon) {
            let inside = false;

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const a = polygon[i];
                const b = polygon[j];

                const intersects =
                    ((a.y > point.y) !== (b.y > point.y)) &&
                    (point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 1e-9) + a.x);

                if (intersects) inside = !inside;
            }

            return inside;
        }

        const xs = room.polygon.map(p => p.x);
        const ys = room.polygon.map(p => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const candidates = [
            { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
            { x: minX + (maxX - minX) * 0.25, y: minY + (maxY - minY) * 0.25 },
            { x: minX + (maxX - minX) * 0.75, y: minY + (maxY - minY) * 0.25 },
            { x: minX + (maxX - minX) * 0.25, y: minY + (maxY - minY) * 0.75 },
            { x: minX + (maxX - minX) * 0.75, y: minY + (maxY - minY) * 0.75 }
        ];

        const valid = candidates.filter(point => isInside(point, room.polygon));

        return valid.slice(0, count).map((point, index) => ({
            id: `measurement_${room.id}_${index + 1}`,
            x: point.x,
            y: point.y,
            status: "pending",
            readings: {}
        }));
    }

    function generateLifestyleMeasurementPoints(zone, floor) {
        if (
            !zone ||
            !floor ||
            !Number.isFinite(Number(zone.x)) ||
            !Number.isFinite(Number(zone.y))
        ) {
            return [];
        }

        const scale = Number(floor.currentScale);
        const width = Number(zone.measurementZoneDimensions?.width);
        const depth = Number(zone.measurementZoneDimensions?.depth);

        if (
            !Number.isFinite(scale) || scale <= 0 ||
            !Number.isFinite(width) || width <= 0 ||
            !Number.isFinite(depth) || depth <= 0
        ) {
            return [];
        }

        const widthPx = width / scale;
        const depthPx = depth / scale;

        const positions = [
            { x: 0, y: 0 },
            { x: -0.25, y: -0.25 },
            { x: 0.25, y: -0.25 },
            { x: -0.25, y: 0.25 },
            { x: 0.25, y: 0.25 }
        ];

        const presetKey =
            zone.lifestylePreset ||
            zone.lifestylePresetKey;

        const pointCount =
            zone.zoneType === "child" &&
                presetKey === "combined"
                ? 5
                : 3;

        return positions.slice(0, pointCount).map((position, index) => ({
            id: `measurement_${zone.id}_${index + 1}`,
            zoneId: zone.id,
            x: Number(zone.x) + widthPx * position.x,
            y: Number(zone.y) + depthPx * position.y,
            status: "pending",
            readings: {}
        }));
    }

    function openRoom(room) {
        if (window.AppMode?.current !== HOME_MODE) return;

        if (!room || !Array.isArray(room.polygon) || room.polygon.length < 3) {
            console.warn("[HOME MEASUREMENTS] Invalid room boundary.");
            return;
        }

        const floor = getHomeFloor();

        if (!floor?.image) {
            console.error("[HOME MEASUREMENTS] Floor plan image unavailable.");
            return;
        }

        if (!Array.isArray(room.grid)) {
            room.grid = [];
        }

        window.HomeMeasurements.activeRoom = room;

        const measurementPoints = generateRoomMeasurementPoints(room, 3);

        const content = document.getElementById("homeMeasurementsPageContent");
        if (!content) {
            console.error("[HOME MEASUREMENTS] Content container unavailable.");
            return;
        }

        const image = floor.image;
        const imageWidth = image.naturalWidth || image.width;
        const imageHeight = image.naturalHeight || image.height;

        const viewport = window.EMFViewport;

        if (!viewport || typeof viewport.worldPoint !== "function") {
            console.error("[HOME MEASUREMENTS] Viewport transform unavailable.");
            return;
        }

        const polygonPoints = room.polygon.map(point => viewport.worldPoint(point));

        const canvas = document.getElementById("canvas");
        const viewWidth = canvas?.width || viewport.drawWidth;
        const viewHeight = canvas?.height || viewport.drawHeight;

        content.innerHTML = `
        <section class="home-measurements-placeholder">
            <h2>${escapeHtml(room.name || room.code || "Selected room")}</h2>
            <p>Selected room for guided EMF measurements.</p>

            <div style="width:100%; overflow:auto;">
                <svg
                    id="homeMeasurementRoomPlan"
                    viewBox="0 0 ${viewWidth} ${viewHeight}"
                    role="img"
                    aria-label="Floor plan and selected room"
                    style="display:block; width:100%; max-height:65vh; background:#f8fafc; border:1px solid #d9e0e8; border-radius:8px;"
                >
                    <image
                        href="${image.src}"
                        x="${viewport.offsetX}"
                        y="${viewport.offsetY}"
                        width="${viewport.drawWidth}"
                        height="${viewport.drawHeight}"
                        preserveAspectRatio="none"
                    />

                    <polygon
                        points="${polygonPoints.map(point => `${point.x},${point.y}`).join(" ")}"
                        fill="rgba(37,99,235,0.15)"
                        stroke="#2563eb"
                        stroke-width="3"
                        stroke-linejoin="round"
                    />

                    ${measurementPoints.map((point, index) => `
    <g class="home-measurement-point" data-point-id="${point.id}">
        <circle
            cx="${viewport.worldPoint(point).x}"
            cy="${viewport.worldPoint(point).y}"
            r="14"
            fill="#ffffff"
            stroke="#2563eb"
            stroke-width="3"
        />
        <text
            x="${viewport.worldPoint(point).x}"
            y="${viewport.worldPoint(point).y}"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="13"
            font-weight="700"
            fill="#1d4ed8"
        >${index + 1}</text>
    </g>
`).join("")}
                </svg>
            </div>

            <p>Room boundary displayed. Measurement-point setup is the next step.</p>

            <button type="button" id="homeMeasurementBackToRooms">
                Back to room list
            </button>
        </section>
    `;

        content.querySelector("#homeMeasurementBackToRooms")
            ?.addEventListener("click", () => showPage("guided"));

        console.log("[HOME MEASUREMENTS] Room plan displayed", {
            room: room.name || room.code || room.id,
            imageWidth,
            imageHeight,
            drawWidth: viewport.drawWidth,
            drawHeight: viewport.drawHeight,
            polygonPoints
        });
    }

    console.log("[HOME MEASUREMENTS] Reached export point");

    console.log("[HOME MEASUREMENTS] Export values", {
        start: typeof start,
        openWorkspace: typeof openWorkspace,
        showPage: typeof showPage,
        closeWorkspace: typeof closeWorkspace,
        openRoom: typeof openRoom,
        getHomeFloor: typeof getHomeFloor,
        getHomeRooms: typeof getHomeRooms,
        getRoomGridStats: typeof getRoomGridStats,
        saveHomeProject: typeof saveHomeProject
    });


    function openCanvasPoint(zoneId, pointId) {
        if (window.AppMode?.current !== HOME_MODE) return;

        const floor = getHomeFloor();

        const zone = floor?.zones?.find(
            item => item.id === zoneId
        );

        if (!zone) return;

        const point = zone.measurementPoints?.find(
            item => item.id === pointId
        );

        const pointIndex = zone.measurementPoints.findIndex(
            item => item.id === pointId
        );

        const pointNumber = pointIndex + 1;

        if (!point) {
            console.warn("[HOME MEASUREMENTS] Measurement point not found.", {
                zoneId,
                pointId
            });
            return;
        }

        const profileTypes =
            window.AppState?.project
                ?.homeMeasurementProfile?.measurementTypes;

        if (!Array.isArray(profileTypes) || !profileTypes.length) {
            openWorkspace();
            showPage("profile");
            return;
        }

        const allowedTypes = ["rf", "electric", "magnetic"];

        const selectedTypes = profileTypes.filter(
            type => allowedTypes.includes(type)
        );

        if (!selectedTypes.length) {
            openWorkspace();
            showPage("profile");
            return;
        }

        document.getElementById("homeMeasurementPointModal")?.remove();

        const fields = {
            rf: {
                label: "RF – Wireless Radiation",
                unit: "µW/m²",
                icon: "⌁"
            },
            electric: {
                label: "Electric Fields",
                unit: "V/m",
                icon: "⚡"
            },
            magnetic: {
                label: "Magnetic Fields",
                unit: "nT",
                icon: "🧲"
            }
        };

        const readings = point.readings || {};

        const modal = document.createElement("div");
        modal.id = "homeMeasurementPointModal";

        modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:12px;
        background:rgba(15,23,42,0.55);
    `;

        modal.innerHTML = `
        <div style="
            width:100%;
            max-width:440px;
            max-height:90vh;
            overflow-y:auto;
            padding:18px;
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:16px;
            box-shadow:0 12px 36px rgba(15,23,42,0.20);
            color:#172554;
            font-family:Arial,sans-serif;
            box-sizing:border-box;
        ">
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
            ">
                <h2 style="margin:0;font-size:19px;">
                    Measurement Point ${pointNumber}
                </h2>

                <button
                    type="button"
                    id="homeMeasurementPointClose"
                    style="
                        border:0;
                        background:none;
                        color:#64748b;
                        font-size:23px;
                        cursor:pointer;
                    "
                >×</button>
            </div>

            <p style="margin:8px 0 4px;font-size:14px;font-weight:700;">
                ${escapeHtml(
            zone.lifestylePresetLabel ||
            zone.name ||
            "Lifestyle Area"
        )}
            </p>

            <p style="margin:0 0 16px;color:#64748b;font-size:12px;">
                Enter the readings from your EMF meter.
            </p>

            <div style="display:flex;flex-direction:column;gap:10px;">
                ${selectedTypes.map(type => {
            const field = fields[type];

            return `
                        <label style="
                            display:flex;
                            align-items:center;
                            gap:10px;
                            padding:11px;
                            border:1px solid #dbe3ef;
                            border-radius:9px;
                            background:#f8fafc;
                        ">
                            <span style="width:25px;font-size:20px;text-align:center;">
                                ${field.icon}
                            </span>

                            <span style="
                                flex:1;
                                min-width:0;
                                font-size:13px;
                                font-weight:700;
                            ">
                                ${field.label}
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="any"
                                inputmode="decimal"
                                data-reading-type="${type}"
                                value="${escapeHtml(readings[type] ?? "")}"
                                style="
                                    width:105px;
                                    padding:9px 7px;
                                    border:1px solid #cbd5e1;
                                    border-radius:7px;
                                    font-size:14px;
                                    box-sizing:border-box;
                                "
                            >

                            <span style="width:48px;color:#64748b;font-size:11px;">
                                ${field.unit}
                            </span>
                        </label>
                    `;
        }).join("")}
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                gap:8px;
                margin-top:18px;
                padding-top:12px;
                border-top:1px solid #e2e8f0;
            ">
                <button
                    type="button"
                    id="homeMeasurementCancel"
                    style="
                        padding:8px 15px;
                        border:1px solid #cbd5e1;
                        border-radius:8px;
                        background:#ffffff;
                        color:#64748b;
                        cursor:pointer;
                    "
                >Cancel</button>

                <button
                    type="button"
                    id="homeMeasurementSave"
                    style="
                        padding:9px 19px;
                        border:0;
                        border-radius:8px;
                        background:#2563eb;
                        color:#ffffff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >Save Readings</button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        const closeModal = () => {
            document.removeEventListener("keydown", handleKeydown);
            modal.remove();
        };

        const saveReadings = () => {
            const newReadings = { ...readings };
            let enteredCount = 0;

            for (const type of selectedTypes) {
                const input = modal.querySelector(
                    `[data-reading-type="${type}"]`
                );

                const rawValue = input?.value.trim() ?? "";

                if (rawValue === "") {
                    newReadings[type] = null;
                    continue;
                }

                const value = Number(rawValue);

                if (!Number.isFinite(value) || value < 0) {
                    input?.focus();
                    alert("Please enter a valid non-negative reading.");
                    return;
                }

                newReadings[type] = value;
                enteredCount++;
            }

            point.readings = newReadings;

            point.measured = enteredCount === selectedTypes.length;

            point.status =
                enteredCount === 0
                    ? "pending"
                    : enteredCount === selectedTypes.length
                        ? "measured"
                        : "partial";

            // Lock Lifestyle Area after first successful measurement
            if (point.measured === true) {
                zone.measurementLocked = true;
            }

            saveHomeProject();

            window.renderFrame?.();

            console.log("[HOME MEASUREMENTS] Canvas readings saved", {
                zoneId,
                pointId,
                readings: point.readings,
                status: point.status
            });

            closeModal();
        };

        const handleKeydown = event => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
            }

            if (event.key === "Enter" && !event.repeat) {
                event.preventDefault();
                saveReadings();
            }
        };

        document.addEventListener("keydown", handleKeydown);

        modal.querySelector("#homeMeasurementPointClose")
            ?.addEventListener("click", closeModal);

        modal.querySelector("#homeMeasurementCancel")
            ?.addEventListener("click", closeModal);

        modal.querySelector("#homeMeasurementSave")
            ?.addEventListener("click", saveReadings);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        console.log("[HOME MEASUREMENTS] Canvas measurement modal opened", {
            zoneId,
            pointId,
            selectedTypes
        });
    }


    window.HomeMeasurements = window.HomeMeasurements || {};
    window.HomeMeasurements.pointOpeners = new Map();

    window.HomeMeasurements = {
        ...window.HomeMeasurements,
        start,
        openWorkspace,
        showPage,
        saveHomeMeasurementProfile,
        closeWorkspace,
        openRoom,
        openLifestyleArea,
        openCanvasPoint,
        generateRoomMeasurementPoints,
        generateLifestyleMeasurementPoints,
        getHomeFloor,
        getHomeRooms,
        getRoomGridStats,
        saveHomeProject
    };

    console.log("[HOME MEASUREMENTS] Export result:", typeof window.HomeMeasurements);
    console.log("[HOME MEASUREMENTS] Before module close");
})();
