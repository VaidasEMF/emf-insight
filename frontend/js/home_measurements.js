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


    function getOrderedGuidedPoints(zones) {
        console.log("[ORDER HELPER CALLED]", zones);

        return (zones || []).flatMap(currentZone => {
            const points = [
                ...(currentZone.measurementPoints || [])
            ];

            console.log("[BED POINTS BEFORE SORT]", {
                zoneId: currentZone.id,
                preset: currentZone.lifestylePreset,
                presetKey: currentZone.lifestylePresetKey,
                dimensions: currentZone.measurementZoneDimensions,
                points: points.map(point => ({
                    id: point.id,
                    x: point.x,
                    y: point.y
                }))
            });

            const presetKey =
                currentZone.lifestylePreset ||
                currentZone.lifestylePresetKey;

            console.log("[PRESET SORT CHECK]", {
                presetKey,
                zoneX: currentZone.x,
                willSort: presetKey === "double" || presetKey === "king"
            });

            if (presetKey === "double" || presetKey === "king") {
                points.sort((a, b) => {
                    const centerY = Math.max(...points.map(point => point.y));

                    const getRank = point => {
                        if (Math.abs(point.y - centerY) < 0.01) {
                            return 0; // Centre
                        }

                        return point.x < currentZone.x ? 1 : 2;
                    };

                    return getRank(a) - getRank(b);
                });
            }

            if (presetKey === "double" || presetKey === "king") {
                console.log("[BED POINTS AFTER SORT]", {
                    preset: presetKey,
                    orderedPoints: points.map(point => ({
                        id: point.id,
                        x: point.x,
                        y: point.y
                    }))
                });
            }

            return points.map(point => ({
                zone: currentZone,
                point
            }));
        });
    }

    function openGuidedLifestyleArea(zone, requestedPointId = null) {

        console.log("[OPEN GUIDED AREA CALLED]", zone?.name, zone?.lifestylePreset);

        if (window.AppMode?.current !== HOME_MODE) return;
        if (!zone) return;

        const floor = getHomeFloor();

        if (!floor?.image) {
            console.error("[GUIDED] Floor plan unavailable.");
            return;
        }

        // Use existing points only. Never regenerate them here.
        const orderedZonePoints = getOrderedGuidedPoints([zone]);

        const measurementPoints = orderedZonePoints.map(item => item.point);

        if (!measurementPoints.length) {
            console.warn("[GUIDED] No existing measurement points.", {
                zoneId: zone.id
            });
            return;
        }

        const content =
            document.getElementById("homeGuidedRightPanel");

        if (!content) return;

        const viewport = window.EMFViewport;

        if (!viewport || typeof viewport.worldPoint !== "function") {
            console.error("[GUIDED] Viewport unavailable.");
            return;
        }

        const widthM = Number(zone.measurementZoneDimensions?.width);
        const depthM = Number(zone.measurementZoneDimensions?.depth);
        const scale = Number(floor.currentScale);

        if (!widthM || !depthM || !scale) return;

        const widthPx = widthM / scale;
        const depthPx = depthM / scale;

        const corners = [
            { x: zone.x - widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y + depthPx / 2 },
            { x: zone.x - widthPx / 2, y: zone.y + depthPx / 2 }
        ];

        const screenCorners = corners.map(point =>
            viewport.worldPoint(point)
        );

        const polygonPoints = screenCorners
            .map(point => `${point.x},${point.y}`)
            .join(" ");

        const canvas = document.getElementById("canvas");
        const viewWidth = canvas?.width || viewport.drawWidth;
        const viewHeight = canvas?.height || viewport.drawHeight;

        const cropPadding = 35;

        const minX = Math.min(...screenCorners.map(p => p.x));
        const maxX = Math.max(...screenCorners.map(p => p.x));
        const minY = Math.min(...screenCorners.map(p => p.y));
        const maxY = Math.max(...screenCorners.map(p => p.y));

        const cropX = Math.max(0, minX - cropPadding);
        const cropY = Math.max(0, minY - cropPadding);

        const cropWidth = Math.min(
            viewWidth - cropX,
            maxX - minX + cropPadding * 2
        );

        const cropHeight = Math.min(
            viewHeight - cropY,
            maxY - minY + cropPadding * 2
        );


        const zoneName =
            zone.lifestylePresetLabel ||
            zone.name ||
            "Lifestyle Area";

        window.HomeMeasurements.activeLifestyleArea = zone;
        window.requestRender?.();

        const requestedIndex = requestedPointId
            ? measurementPoints.findIndex(
                point => point.id === requestedPointId
            )
            : -1;

        const firstPendingIndex = measurementPoints.findIndex(
            point => point.status !== "measured"
        );

        const activePointIndex = requestedIndex >= 0
            ? requestedIndex
            : firstPendingIndex >= 0
                ? firstPendingIndex
                : 0;

        const activePoint = measurementPoints[activePointIndex];

        const allGuidedPoints = getOrderedGuidedPoints(floor.zones);

        const globalActivePointIndex = allGuidedPoints.findIndex(
            item =>
                item.zone.id === zone.id &&
                item.point.id === activePoint.id
        );

        const isDoubleKing =
            ["double", "king"].includes(
                zone.lifestylePreset || zone.lifestylePresetKey
            );


        const globalPointNumber = globalActivePointIndex + 1;
        const globalTotalPoints = allGuidedPoints.length;

        // Double / King: identify point by its actual position.
        let pointInfo = null;

        if (isDoubleKing) {
            const centerY = Math.max(
                ...measurementPoints.map(point => Number(point.y))
            );

            if (Math.abs(Number(activePoint.y) - centerY) < 0.01) {
                pointInfo = {
                    label: "Centre",
                    description:
                        "Measure in the centre of the bed, below the pillow area."
                };
            } else if (Number(activePoint.x) < Number(zone.x)) {
                pointInfo = {
                    label: "Left side",
                    description:
                        "Measure on the left pillow, close to the left edge of the bed."
                };
            } else {
                pointInfo = {
                    label: "Right side",
                    description:
                        "Measure on the right pillow, close to the right edge of the bed."
                };
            }
        }

        const displayedPointNumber = isDoubleKing
            ? activePointIndex + 1
            : globalPointNumber;

        const displayedTotalPoints = isDoubleKing
            ? measurementPoints.length
            : globalTotalPoints;

        window.HomeMeasurements.guidedMeasurementState = {
            zoneId: zone.id,
            activePointId: activePoint.id,
            activePointIndex: activePointIndex >= 0 ? activePointIndex : 0
        };

        const profileTypes =
            window.AppState?.project
                ?.homeMeasurementProfile?.measurementTypes || [];

        const allowedTypes = ["rf", "electric", "magnetic"];

        const selectedTypes = allowedTypes.filter(
            type => profileTypes.includes(type)
        );

        const measurementFields = {
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

        content.innerHTML = `
        <section class="home-measurements-placeholder">

            <button type="button" id="homeGuidedBackToAreas">
                ← Back to Lifestyle Areas
            </button>

           <h2>${escapeHtml(zoneName)}</h2>

<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin:12px 0;
">
    <strong>
        Point ${displayedPointNumber} of ${displayedTotalPoints}
    </strong>

    <span style="
        padding:5px 10px;
        border-radius:20px;
        background:#eff6ff;
        color:#2563eb;
        font-size:12px;
        font-weight:700;
    ">
        ${activePoint.status === "measured" ? "Measured" : "In progress"}
    </span>
</div>

<p style="margin:8px 0 12px;color:#64748b;font-size:12px;">
    Take a measurement at the highlighted point.

</p>

<div style="
    display:grid;
    grid-template-columns:minmax(0, 1.35fr) minmax(0, 0.85fr);
    gap:8px;
    align-items:stretch;
    margin-top:10px;
">
    

            <div style="width:100%; overflow:auto;">
                <svg
                    viewBox="${cropX} ${cropY} ${cropWidth} ${cropHeight}"
                    style="width:100%; max-height:${isDoubleKing ? "32vh" : "55vh"}; background:#f8fafc;"
                >
                    <image
                        href="${floor.image.src}"
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
                    />

                    ${measurementPoints.map((point, index) => {
            const p = viewport.worldPoint(point);

            return `
                            <g
                                data-guided-point-id="${point.id}"
                                style="cursor:pointer"
                            >
                               <circle
    cx="${p.x}"
    cy="${p.y}"
    r="${point.id === activePoint.id ? 19 : 15}"
    fill="${point.measured ? '#06b6d4' : '#ffffff'}"
    stroke="${point.id === activePoint.id ? '#f59e0b' : '#2563eb'}"
    stroke-width="${point.id === activePoint.id ? 5 : 3}"
/>
                                <text
                                    x="${p.x}"
                                    y="${p.y}"
                                    text-anchor="middle"
                                    dominant-baseline="central"
                                    font-size="13"
                                    font-weight="700"
                                    fill="#1f2937"
                                >${allGuidedPoints.findIndex(
                item => item.zone.id === zone.id && item.point.id === point.id
            ) + 1}</text>
                            </g>
                        `;
        }).join("")}
                </svg>
            </div>

            
    ${isDoubleKing && pointInfo ? `
        <div style="
            display:flex;
            align-items:center;
            padding:10px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:10px;
            min-width:0;
        ">
            <div>
                <div style="
                    font-size:14px;
                    font-weight:700;
                    color:#1e293b;
                    margin-bottom:6px;
                ">
                    ${pointInfo.label}
                </div>

                <div style="
                    font-size:11px;
                    line-height:1.5;
                    color:#475569;
                ">
                    ${pointInfo.description}
                </div>
            </div>
        </div>
    ` : ""}

    </div>

            ${isDoubleKing ? `
    <div style="
        margin-top:12px;
        padding:10px 12px;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:10px;
        display:flex;
        flex-direction:column;
        gap:9px;
    ">
        <div style="display:flex;gap:9px;align-items:flex-start;">
            <span style="font-weight:700;color:#2563eb;">1.</span>
            <div>
                <div style="font-size:12px;font-weight:700;color:#1e293b;">Place the EMF meter</div>
                <div style="font-size:11px;color:#64748b;">Place the meter at the indicated spot.</div>
            </div>
        </div>

        <div style="display:flex;gap:9px;align-items:flex-start;">
            <span style="font-weight:700;color:#2563eb;">2.</span>
            <div>
                <div style="font-size:12px;font-weight:700;color:#1e293b;">Keep the meter still</div>
                <div style="font-size:11px;color:#64748b;">Wait 20–30 seconds for a stable reading.</div>
            </div>
        </div>

        <div style="display:flex;gap:9px;align-items:flex-start;">
            <span style="font-weight:700;color:#2563eb;">3.</span>
            <div>
                <div style="font-size:12px;font-weight:700;color:#1e293b;">Record the reading</div>
                <div style="font-size:11px;color:#64748b;">Enter the measured values below.</div>
            </div>
        </div>
    </div>
` : ""}

            <div style="
   display:flex;
flex-direction:column;
gap:3px;
margin-top:8px;
">
    ${selectedTypes.map(type => {
            const field = measurementFields[type];
            const value = activePoint.readings?.[type] ?? "";

            return `
            <label style="
                display:flex;
                align-items:center;
                gap:10px;
                padding:12px;
                border:1px solid #dbe3ef;
                border-radius:10px;
                background:#ffffff;
            ">
                <span style="font-size:19px;">
                    ${field.icon}
                </span>

                <span style="
                    flex:1;
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
                    data-guided-reading="${type}"
                    value="${escapeHtml(value)}"
                    placeholder="Enter value"
                    style="
                        width:105px;
                        padding:9px 7px;
                        border:1px solid #cbd5e1;
                        border-radius:7px;
                        font-size:14px;
                        box-sizing:border-box;
                    "
                >

                <span style="
                    width:48px;
                    color:#64748b;
                    font-size:11px;
                ">
                    ${field.unit}
                </span>
            </label>
        `;
        }).join("")}
</div>

<div style="
    margin-top:12px;
    font-size:12px;
    color:#64748b;
">
    Measurement Point ${activePointIndex + 1}
</div>

<div style="
    display:flex;
    gap:10px;
    margin-top:18px;
">
    <button
        type="button"
        id="homeGuidedSkipPoint"
        style="
            flex:1;
            padding:12px;
            border:1px solid #cbd5e1;
            border-radius:9px;
            background:#ffffff;
            color:#334155;
            font-weight:700;
            cursor:pointer;
        "
    >
        Skip for now
    </button>

    <button
        type="button"
        id="homeGuidedSaveNext"
        style="
            flex:1.5;
            padding:12px;
            border:0;
            border-radius:9px;
            background:#2563eb;
            color:#ffffff;
            font-weight:700;
            cursor:pointer;
        "
    >
        Save & Next Point →
    </button>
</div>
        </section>
    `;

        content.querySelector("#homeGuidedBackToAreas")
            ?.addEventListener("click", () => showPage("guided"));

        content.querySelector("#homeGuidedSkipPoint")
            ?.addEventListener("click", () => {
                const allPoints = getOrderedGuidedPoints(floor.zones);

                const currentIndex = allPoints.findIndex(
                    item =>
                        item.zone.id === zone.id &&
                        item.point.id === activePoint.id
                );

                const nextItem = allPoints[currentIndex + 1];

                console.log("[GUIDED NAVIGATION]", {
                    currentZone: zone.id,
                    currentPoint: activePoint.id,
                    currentIndex,
                    nextZone: nextItem?.zone.id,
                    nextPoint: nextItem?.point.id,
                    totalPoints: allPoints.length
                });
                if (!nextItem) {
                    showPage("guided");
                    return;
                }

                openGuidedLifestyleArea(
                    nextItem.zone,
                    nextItem.point.id
                );
            });

        content.querySelector("#homeGuidedSaveNext")
            ?.addEventListener("click", () => {
                const newReadings = { ...(activePoint.readings || {}) };
                let enteredCount = 0;

                for (const type of selectedTypes) {
                    const input = content.querySelector(
                        `[data-guided-reading="${type}"]`
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

                activePoint.readings = newReadings;
                activePoint.measured =
                    enteredCount === selectedTypes.length;

                activePoint.status =
                    enteredCount === 0
                        ? "pending"
                        : enteredCount === selectedTypes.length
                            ? "measured"
                            : "partial";

                if (activePoint.measured) {
                    zone.measurementLocked = true;
                }

                saveHomeProject();
                window.renderFrame?.();

                console.log("[GUIDED] Measurement saved", {
                    zoneId: zone.id,
                    pointId: activePoint.id,
                    readings: activePoint.readings,
                    status: activePoint.status
                });

                const allPoints = getOrderedGuidedPoints(floor.zones);

                const currentIndex = allPoints.findIndex(
                    item =>
                        item.zone.id === zone.id &&
                        item.point.id === activePoint.id
                );

                const nextItem = allPoints[currentIndex + 1];
                if (!nextItem) {
                    const allMeasurementsComplete =
                        allPoints.length > 0 &&
                        allPoints.every(
                            item => item.point.status === "measured"
                        );

                    const measurementState =
                        window.AppState?.project?.homeMeasurementState || {};

                    if (
                        allMeasurementsComplete &&
                        !measurementState.initialMeasurementCompleted
                    ) {
                        window.AppState.project.homeMeasurementState = {
                            ...measurementState,
                            initialMeasurementCompleted: true,
                            status: "completed"
                        };

                        saveHomeProject();
                        showPage("completed");
                    } else {
                        showPage("guided");
                    }

                    return;
                }

                openGuidedLifestyleArea(
                    nextItem.zone,
                    nextItem.point.id
                );
            });

        console.log("[GUIDED] Lifestyle Area opened", {
            zoneId: zone.id,
            pointCount: measurementPoints.length
        });
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
            completed: {
                title: "Measurement Completed",
                subtitle: "All Lifestyle Areas have been successfully measured."
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

        const project = window.AppState?.project;
        const measurementState = project?.homeMeasurementState;

        if (measurementState?.measurementMethod) {
            window.HomeMeasurements.selectedMethod =
                measurementState.measurementMethod;
        }

        if (measurementState?.measurementMode) {
            window.HomeMeasurements.selectedMeasurementMode =
                measurementState.measurementMode;
        }

        if (activePage === "guided") {
            const project = window.AppState?.project;

            if (project) {
                const currentState = project.homeMeasurementState || {};

                project.homeMeasurementState = {
                    ...currentState,
                    status: currentState.initialMeasurementCompleted
                        ? "review"
                        : "guided",
                    currentPointId: currentState.currentPointId ?? null
                };

                saveHomeProject();
            }
        }

        workspace.querySelectorAll("[data-home-measurements-page]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.homeMeasurementsPage === activePage
                );
            });

        const title = workspace.querySelector("#homeMeasurementsPageTitle");
        const subtitle = workspace.querySelector("#homeMeasurementsPageSubtitle");
        const content = [
            "method",
            "profile",
            "guided",
            "completed",
            "results",
            "report"
        ].includes(activePage)
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

            // CURRENT HOME MEASUREMENT PROFILE
            const selectedMeasurementTypes =
                window.AppState?.project?.homeMeasurementProfile?.measurementTypes || ["rf"];

            const isRecommendedProfile =
                selectedMeasurementTypes.length === 1 &&
                selectedMeasurementTypes[0] === "rf";
            const measurementProfileOptions = [
                {
                    id: "rf",
                    icon: "📶",
                    label: "RF – Wireless Radiation"
                },
                {
                    id: "electric",
                    icon: "⚡",
                    label: "Electric Fields"
                },
                {
                    id: "magnetic",
                    icon: "🧲",
                    label: "Magnetic Fields"
                }
            ];

            const selectedProfileHtml = measurementProfileOptions
                .filter(option => selectedMeasurementTypes.includes(option.id))
                .map(option => `
        <div class="home-profile-option">
            <span class="home-profile-icon">${option.icon}</span>
            <div class="home-profile-info">
                <strong>${option.label}</strong>
                <small>
                    <span class="home-profile-check">✓</span>
                    Selected
                </small>
            </div>
        </div>
    `)
                .join("");

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

            <!-- 3. DEVICE -->

<section class="home-setup-section">

    <h3>3. Device</h3>

    <div style="
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px;
        border:1px solid #dbe3ef;
        border-radius:9px;
        background:#ffffff;
    ">

        <div style="
            width:42px;
            height:48px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:7px;
            background:#eff6ff;
            font-size:25px;
        ">
            📟
        </div>

        <div style="flex:1;min-width:0;">
            <strong style="
                display:block;
                font-size:12px;
                color:#1e293b;
            ">
                TriField TF2
            </strong>

            <small style="
                color:#64748b;
                font-size:10px;
            ">
                RF · Electric · Magnetic
            </small>
        </div>

        <button
            type="button"
            id="homeMeasurementChangeDevice"
            style="
                padding:7px 9px;
                border:1px solid #bfd5ff;
                border-radius:7px;
                background:#f5f9ff;
                color:#2563eb;
                font-size:10px;
                font-weight:600;
                cursor:pointer;
            "
        >
            Change Device
        </button>

    </div>

</section>

            <!-- 4. MEASUREMENT PROFILE -->

            <section class="home-setup-section">

               <div class="home-measurement-profile-summary">

    <div class="home-profile-heading">
        <h3>4. Measurement Profile</h3>
        ${isRecommendedProfile
                    ? '<span class="home-profile-recommended">Recommended</span>'
                    : ""}
    </div>

    <div class="home-profile-additional">
        ${selectedProfileHtml}
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
    ${currentMethod ? "" : "hidden"}
    class="home-measurement-continue"
>
    ${currentMode === "mobile"
                    ? "Start Mobile Guided Measurement →"
                    : "Continue to Guided Measurement →"}
</button>

    </div>
`;


            content.querySelectorAll("[data-measurement-method]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        const method = button.dataset.measurementMethod;

                        window.HomeMeasurements.selectedMethod = method;

                        saveHomeProject().then(saved => {
                            console.log("[METHOD SAVE CHECK]", {
                                saved,
                                state: window.AppState?.project?.homeMeasurementState
                            });
                        });

                        const project = window.AppState?.project;

                        if (project) {
                            project.homeMeasurementState = {
                                ...(project.homeMeasurementState || {}),
                                measurementMethod: method
                            };

                            saveHomeProject();
                        }

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
                                !window.HomeMeasurements.selectedMethod;

                            continueButton.textContent =
                                mode === "mobile"
                                    ? "Start Mobile Guided Measurement →"
                                    : "Continue to Guided Measurement →";
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

                    console.log("[COMPUTER CONTINUE CHECK]", {
                        mode: window.HomeMeasurements?.selectedMeasurementMode,
                        method: window.HomeMeasurements?.selectedMethod,
                        profile: window.AppState?.project?.homeMeasurementProfile
                    });
                    if (!window.HomeMeasurements?.selectedMethod) {
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
    border:1px solid #dbe3ef;
    border-radius:10px;
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

            // REQUIRE AT LEAST ONE MEASUREMENT TYPE
            const profileCheckboxes = [
                content.querySelector("#homeProfileRF"),
                content.querySelector("#homeProfileElectric"),
                content.querySelector("#homeProfileMagnetic")
            ];

            profileCheckboxes.forEach(checkbox => {
                checkbox.addEventListener("change", () => {

                    const hasSelection = profileCheckboxes.some(
                        item => item.checked
                    );

                    if (!hasSelection) {
                        checkbox.checked = true;
                    }
                });
            });

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
<div class="home-guided-method-summary" style="
    margin:10px 0 14px;
    padding:10px 12px;
    background:#f5f9ff;
    border:1px solid #d8e6ff;
    border-radius:10px;
">

    <!-- Measurement Method -->
    <div style="
        display:flex;
        align-items:center;
        gap:10px;
        font-size:12px;
    ">
        <span style="
            width:28px;
            height:28px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:7px;
            background:#e5efff;
            color:#2563eb;
            font-size:17px;
        ">▣</span>

        <span style="color:#475569;font-weight:600;">
            Method
        </span>

        <strong style="
            margin-left:auto;
            color:#1e293b;
            font-weight:600;
        ">
            ${method === "own_meter"
                    ? "Own EMF meter"
                    : method === "rent_meter"
                        ? "Meter rental"
                        : method === "buy_meter"
                            ? "Looking to buy an EMF meter"
                            : "Not selected"}
        </strong>
    </div>

    <!-- Measurement Profile -->
    <div style="
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:8px;
        font-size:12px;
    ">
        <span style="
            width:28px;
            height:28px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:7px;
            background:#f0eaff;
            color:#7c3aed;
            font-size:19px;
            font-weight:700;
        ">∿</span>

        <span style="color:#475569;font-weight:600;">
            Profile
        </span>

        <strong style="
            margin-left:auto;
            padding:5px 10px;
            border-radius:20px;
            background:#e3efff;
            color:#2563eb;
            font-size:11px;
            font-weight:700;
        ">
            ${(() => {
                    const types =
                        window.AppState?.project
                            ?.homeMeasurementProfile?.measurementTypes || [];

                    const labels = {
                        rf: "RF",
                        electric: "Electric",
                        magnetic: "Magnetic"
                    };

                    return ["rf", "electric", "magnetic"]
                        .filter(type => types.includes(type))
                        .map(type => labels[type])
                        .join(" + ") || "Not selected";
                })()}
        </strong>
    </div>

    <div style="
        margin-top:9px;
        padding-top:8px;
        border-top:1px solid #dce8f8;
        display:flex;
        justify-content:flex-end;
    ">
        <button
            type="button"
            id="homeGuidedEditSettings"
            style="
                display:flex;
                align-items:center;
                gap:7px;
                padding:6px 11px;
                border:1px solid #bfd5ff;
                border-radius:7px;
                background:#eaf2ff;
                color:#2563eb;
                font-size:11px;
                font-weight:700;
                cursor:pointer;
            "
        >
            <span style="font-size:14px;">⚙</span>
            Edit Settings
        </button>
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

                        const zoneIcon = zone.lifestylePresetImage || "";

                        const pointCount = Array.isArray(zone.measurementPoints)
                            ? zone.measurementPoints.length
                            : 0;

                        const measuredCount = (zone.measurementPoints || [])
                            .filter(point => point.status === "measured")
                            .length;

                        const remainingCount = pointCount - measuredCount;

                        const progressPercent = pointCount > 0
                            ? Math.round((measuredCount / pointCount) * 100)
                            : 0;

                        const isCompleted = pointCount > 0 && measuredCount === pointCount;

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
                                      <div style="
    display:flex;
    align-items:center;
    gap:12px;
    width:100%;
">
    <img
        src="${escapeHtml(zoneIcon)}"
        alt=""
        style="
            width:48px;
            height:48px;
            object-fit:contain;
            flex-shrink:0;
        "
    />

    <strong>${escapeHtml(name)}</strong>

    <span style="
        margin-left:auto;
        color:#64748b;
        font-size:20px;
        font-weight:600;
    ">›</span>
</div>

<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    width:100%;
    font-size:13px;
    color:#64748b;
">
    <span>
        ${measuredCount} of ${pointCount} points measured
    </span>

    <strong style="
        color:${isCompleted ? '#16a34a' : '#64748b'};
    ">
        ${isCompleted ? 'Completed' : `${progressPercent}%`}
    </strong>
</div>

<div style="
    width:100%;
    height:6px;
    background:#e5e7eb;
    border-radius:999px;
    overflow:hidden;
">
    <div style="
        width:${progressPercent}%;
        height:100%;
        background:${isCompleted ? '#16a34a' : '#2563eb'};
        border-radius:999px;
        transition:width 0.25s ease;
    "></div>
</div>

<span style="font-size:12px;color:#94a3b8;">
    ${remainingCount} points remaining
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

${window.AppState?.project?.homeMeasurementState
                    ?.initialMeasurementCompleted ? `
    <button
        type="button"
        id="homeGuidedCompleteContinue"
        style="
            width:100%;
            margin-top:20px;
            padding:14px;
            border:0;
            border-radius:9px;
            background:#2563eb;
            color:white;
            font-weight:700;
            font-size:15px;
            cursor:pointer;
        "
    >
        Complete & Continue →
    </button>
` : ""}

<p id="homeGuidedLifestyleStatus" role="status"></p>
                </div>
            `;

            content.querySelector("#homeGuidedEditSettings")
                ?.addEventListener("click", () => {
                    showPage("method");
                });

            content.querySelector("#homeGuidedCompleteContinue")
                ?.addEventListener("click", () => {
                    showPage("results");
                });

            content.querySelectorAll("[data-lifestyle-index]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        const index = Number(button.dataset.lifestyleIndex);
                        const zone = zones[index];

                        if (!zone) return;

                        window.HomeMeasurements.openGuidedLifestyleArea(zone);
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

        // ==================================================
        // ALL LIFESTYLE AREAS COMPLETED
        // ==================================================

        if (activePage === "completed") {
            const floor = window.HomeMeasurements?.getHomeFloor?.();
            const zones = Array.isArray(floor?.zones) ? floor.zones : [];

            const allPoints = getOrderedGuidedPoints(zones);
            const measuredPoints = allPoints.filter(
                item => item.point.status === "measured"
            );

            const measurementTypes =
                window.AppState?.project?.homeMeasurementProfile
                    ?.measurementTypes || [];

            content.innerHTML = `
        <div class="home-measurements-placeholder"
             style="text-align:center;padding:30px 20px;">

            <div style="
                width:76px;
                height:76px;
                margin:0 auto 18px;
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:50%;
                background:#dcfce7;
                color:#16a34a;
                font-size:40px;
            ">✓</div>

            <h2 style="margin-bottom:8px;">
                All Lifestyle Areas Completed!
            </h2>

            <p style="color:#64748b;margin-bottom:24px;">
                You have successfully completed your guided
                measurements for this floor.
            </p>

            <div style="
                padding:18px;
                border:1px solid #dbe3ef;
                border-radius:12px;
                background:#f8fafc;
                text-align:left;
            ">
                <h3 style="margin:0 0 16px;">
                    Measurement Summary
                </h3>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:12px;
                ">
                    <span>Lifestyle Areas</span>
                    <strong>${zones.length}</strong>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:12px;
                ">
                    <span>Measurement Points</span>
                    <strong>${measuredPoints.length} / ${allPoints.length}</strong>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                ">
                    <span>Measured EMF Types</span>
                    <strong>${measurementTypes.length}</strong>
                </div>
            </div>

            <button
                type="button"
                id="homeCompletedViewResults"
                style="
                    width:100%;
                    margin-top:22px;
                    padding:14px;
                    border:0;
                    border-radius:9px;
                    background:#2563eb;
                    color:white;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                View Results →
            </button>

            <button
                type="button"
                id="homeCompletedBackToAreas"
                style="
                    width:100%;
                    margin-top:10px;
                    padding:12px;
                    border:1px solid #cbd5e1;
                    border-radius:9px;
                    background:white;
                    color:#334155;
                    font-weight:600;
                    cursor:pointer;
                "
            >
                Back to Lifestyle Areas
            </button>
        </div>
    `;

            content.querySelector("#homeCompletedViewResults")
                ?.addEventListener("click", () => showPage("results"));

            content.querySelector("#homeCompletedBackToAreas")
                ?.addEventListener("click", () => showPage("guided"));

            return;
        }

        const resultsFloor = window.HomeMeasurements?.getHomeFloor?.();
        const resultsZones = Array.isArray(resultsFloor?.zones)
            ? resultsFloor.zones
            : [];

        const resultsPoints = getOrderedGuidedPoints(resultsZones);

        const measuredResultsPoints = resultsPoints.filter(
            item => item.point.status === "measured"
        );

        const measurementTypeLabels = {
            rf: "RF",
            electric: "Electric",
            magnetic: "Magnetic"
        };


        // Show only EMF types that have actual saved readings.
        const resultsMeasurementTypes = ["rf", "electric", "magnetic"]
            .filter(type =>
                measuredResultsPoints.some(item => {
                    const value = item.point.readings?.[type];
                    return value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        Number.isFinite(Number(value));
                })
            );

        const zoneResults = resultsZones.map(zone => {
            const points = Array.isArray(zone.measurementPoints)
                ? zone.measurementPoints
                : [];

            const measuredPoints = points.filter(
                point => point.status === "measured"
            );

            const getAverage = type => {
                const values = measuredPoints
                    .map(point => point.readings?.[type])
                    .filter(value =>
                        value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        Number.isFinite(Number(value))
                    )
                    .map(Number);

                return values.length
                    ? values.reduce((sum, value) => sum + value, 0) / values.length
                    : null;
            };

            return {
                name: zone.lifestylePresetLabel ||
                    zone.name ||
                    "Lifestyle Area",
                pointCount: points.length,
                measuredCount: measuredPoints.length,
                averageRF: getAverage("rf"),
                averageElectric: getAverage("electric"),
                averageMagnetic: getAverage("magnetic")
            };
        });

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
    <div style="padding:8px 0;">

        <h2 style="margin:0 0 5px;">
            Measurement Results
        </h2>

        <p style="color:#64748b;font-size:13px;margin:0 0 18px;">
            Overview of EMF measurements in your Lifestyle Areas.
        </p>

        <!-- MEASUREMENT SUMMARY -->
        <div style="
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;
            margin-bottom:22px;
        ">
            <div style="
                padding:16px;
                border:1px solid #dbe3ef;
                border-radius:10px;
                background:#ffffff;
            ">
                <div style="font-size:12px;color:#64748b;">
                    Lifestyle Areas
                </div>
                <strong style="font-size:25px;">
                    ${resultsZones.length}
                </strong>
            </div>

            <div style="
                padding:16px;
                border:1px solid #dbe3ef;
                border-radius:10px;
                background:#ffffff;
            ">
                <div style="font-size:12px;color:#64748b;">
                    Measurement Points
                </div>
                <strong style="font-size:25px;">
                    ${measuredResultsPoints.length} / ${resultsPoints.length}
                </strong>
            </div>

            <div style="
                padding:16px;
                border:1px solid #dbe3ef;
                border-radius:10px;
                background:#ffffff;
                grid-column:1 / -1;
            ">
                <div style="font-size:12px;color:#64748b;">
                    Measured EMF Types
                </div>
                <strong style="font-size:15px;">
                    ${resultsMeasurementTypes.map(type =>
                type === "rf" ? "RF" :
                    type === "electric" ? "Electric" :
                        type === "magnetic" ? "Magnetic" : type
            ).join(" + ") || "Not selected"}
                </strong>
            </div>
        </div>

        <!-- LIFESTYLE AREA RESULTS -->
        <h3 style="margin:0 0 12px;">
            Lifestyle Area Results
        </h3>

        <div style="
            display:flex;
            flex-direction:column;
            gap:10px;
        ">
            ${zoneResults.map(zone => `
                <div style="
                    padding:14px;
                    border:1px solid #dbe3ef;
                    border-radius:10px;
                    background:#ffffff;
                ">
                    <strong style="font-size:14px;">
                        ${escapeHtml(zone.name)}
                    </strong>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:8px;
                        margin-top:9px;
                        font-size:12px;
                        color:#64748b;
                    ">
                        <span>
                            ${zone.measuredCount} of ${zone.pointCount} points measured
                        </span>

                        <div style="
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:4px;
    text-align:right;
    font-size:12px;
    color:#334155;
">
    ${zone.averageRF !== null ? `
        <strong>RF: ${zone.averageRF.toFixed(1)} µW/m²</strong>
    ` : ""}

    ${zone.averageElectric !== null ? `
        <strong>Electric: ${zone.averageElectric.toFixed(1)} V/m</strong>
    ` : ""}

    ${zone.averageMagnetic !== null ? `
        <strong>Magnetic: ${zone.averageMagnetic.toFixed(2)} µT</strong>
    ` : ""}

    ${zone.averageRF === null &&
                    zone.averageElectric === null &&
                    zone.averageMagnetic === null
                    ? "Measurement data unavailable"
                    : ""}
</div>
                    </div>
                </div>
            `).join("")}
        </div>

        <!-- ACTIONS -->
        <div style="
            display:flex;
            gap:10px;
            margin-top:22px;
        ">
            <button
                type="button"
                id="homeResultsBack"
                style="
                    flex:1;
                    padding:13px;
                    border:1px solid #cbd5e1;
                    border-radius:9px;
                    background:#ffffff;
                    font-weight:600;
                    cursor:pointer;
                "
            >
                Back
            </button>

            <button
                type="button"
                id="homeResultsCreateReport"
                style="
                    flex:2;
                    padding:13px;
                    border:0;
                    border-radius:9px;
                    background:#2563eb;
                    color:white;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                Create Property Health Report →
            </button>
        </div>

    </div>
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

        // RESULTS NAVIGATION
        content.querySelector("#homeResultsBack")
            ?.addEventListener("click", () => showPage("guided"));

        content.querySelector("#homeResultsCreateReport")
            ?.addEventListener("click", () => showPage("report"));
    }


    function closeWorkspace() {
        const workspace = document.getElementById("homeMeasurementsWorkspace");

        if (workspace) {
            workspace.style.display = "none";
        }
    }


    async function start() {
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

        const project = window.AppState?.project;

        if (project && !project.homeMeasurementState) {
            project.homeMeasurementState = {
                status: "setup",
                currentPointId: null
            };

            await saveHomeProject();
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

        const measurementState =
            window.AppState?.project?.homeMeasurementState?.status;

        if (measurementState === "completed") {
            showPage("completed");
        } else if (
            measurementState === "guided" ||
            measurementState === "review"
        ) {
            showPage("guided");
        } else {
            showPage("method");
        }

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


        const presetKey =
            zone.lifestylePreset ||
            zone.lifestylePresetKey;


        const furnitureWidth = Number(zone.furnitureDimensions?.width);
        const furnitureDepth = Number(zone.furnitureDimensions?.depth);

        const isDoubleOrKing =
            presetKey === "double" || presetKey === "king";

        const hasFurnitureDimensions =
            Number.isFinite(furnitureWidth) &&
            furnitureWidth > 0 &&
            Number.isFinite(furnitureDepth) &&
            furnitureDepth > 0;

        const positions =
            isDoubleOrKing && hasFurnitureDimensions
                ? [
                    {
                        x: -(furnitureWidth * 0.38) / width,
                        y: -(furnitureDepth * 0.28) / depth
                    },
                    {
                        x: (furnitureWidth * 0.38) / width,
                        y: -(furnitureDepth * 0.28) / depth
                    },
                    {
                        x: 0,
                        y: (furnitureDepth * 0.15) / depth
                    }
                ]
                : [
                    { x: 0, y: 0 },
                    { x: -0.25, y: -0.25 },
                    { x: 0.25, y: -0.25 },
                    { x: -0.25, y: 0.25 },
                    { x: 0.25, y: 0.25 }
                ];

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

    function restoreWorkspace() {

        console.log("[RESTORE CHECK]", {
            appMode: window.AppMode?.current,
            status: window.AppState?.project?.homeMeasurementState?.status,
            project: !!window.AppState?.project
        });
        if (window.AppMode?.current !== HOME_MODE) return;

        const status =
            window.AppState?.project?.homeMeasurementState?.status;

        if (!["setup", "guided", "review", "completed"].includes(status)) {
            return;
        }

        openWorkspace();

        console.log("[HOME MEASUREMENTS] Workspace restored", {
            status
        });
    }

    window.drawHomeGuidedActiveLifestyleArea = function () {
        if (window.AppMode?.current !== "home") return;

        const zone = window.HomeMeasurements?.activeLifestyleArea;
        if (!zone) return;

        const floor = getHomeFloor();
        const canvas = window.canvas;
        const viewport = window.EMFViewport;

        if (!floor || !canvas || !viewport?.worldPoint) return;

        const widthM = Number(zone.measurementZoneDimensions?.width);
        const depthM = Number(zone.measurementZoneDimensions?.depth);
        const scale = Number(floor.currentScale);

        if (!widthM || !depthM || !scale) return;

        const widthPx = widthM / scale;
        const depthPx = depthM / scale;

        const corners = [
            { x: zone.x - widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y - depthPx / 2 },
            { x: zone.x + widthPx / 2, y: zone.y + depthPx / 2 },
            { x: zone.x - widthPx / 2, y: zone.y + depthPx / 2 }
        ];

        const screenCorners = corners.map(point =>
            viewport.worldPoint(point)
        );

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(screenCorners[0].x, screenCorners[0].y);

        screenCorners.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
        });

        ctx.closePath();

        ctx.fillStyle = "rgba(37, 99, 235, 0.18)";
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 4;

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    window.HomeMeasurements = {
        ...window.HomeMeasurements,
        start,
        openWorkspace,
        restoreWorkspace,
        showPage,
        saveHomeMeasurementProfile,
        closeWorkspace,
        openRoom,
        openLifestyleArea,
        openGuidedLifestyleArea,
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
