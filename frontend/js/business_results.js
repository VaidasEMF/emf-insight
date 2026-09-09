// ==========================================================
// BUSINESS RESULTS — FREE PREVIEW V2
// ==========================================================

const BUSINESS_RESULTS_API =
    "https://emf-insight.onrender.com";


// ==========================================================
// HELPERS
// ==========================================================

function brEscape(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function brGetCurrentFloor() {

    return (
        AppState?.project?.floors?.[
            AppState.project.currentFloorIndex || 0
        ] ||
        AppState?.project?.floors?.[0] ||
        null
    );
}


function brGetUserInfo() {

    const user =
        AppState?.user ||
        AppState?.currentUser ||
        {};

    return {
        name:
            user.name ||
            [
                user.first_name,
                user.last_name
            ]
                .filter(Boolean)
                .join(" "),

        email:
            user.email ||
            ""
    };
}


function brFormatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function brRiskClass(risk) {

    const value =
        String(risk || "")
            .toLowerCase();

    if (value === "high") {
        return "high";
    }

    if (
        value === "moderate" ||
        value === "medium"
    ) {
        return "moderate";
    }

    if (value === "low") {
        return "low";
    }

    return "unknown";
}


function brRiskLabel(risk) {

    const value =
        String(risk || "")
            .toLowerCase();

    if (value === "high") {
        return "High";
    }

    if (
        value === "moderate" ||
        value === "medium"
    ) {
        return "Moderate";
    }

    if (value === "low") {
        return "Low";
    }

    return "Not Measured";
}

function brGetRoomCoverage(
    roomSummary,
    localFloor
) {

    const roomName =
        roomSummary?.room;

    const localRoom =
        localFloor?.rooms?.find(
            room =>
                String(
                    room?.name || ""
                ) === String(
                    roomName || ""
                )
        );


    // Prefer the normalized backend
    // room points when available.
    const summaryPoints =
        Array.isArray(
            roomSummary?.points
        )
            ? roomSummary.points
            : [];


    if (summaryPoints.length) {

        const total =
            summaryPoints.length;

        const measured =
            summaryPoints.filter(
                point =>
                    point?.measurement_complete === true ||
                    point?.measurementStatus?.state === "confirmed"
            ).length;


        return {
            measured,
            total,
            coverage:
                total > 0
                    ? Math.round(
                        measured /
                        total *
                        100
                    )
                    : 0
        };
    }


    // Fallback to the local room grid.
    if (
        Array.isArray(
            localRoom?.grid
        )
    ) {

        const points =
            localRoom.grid;

        const total =
            points.length;

        const measured =
            points.filter(
                point => {

                    const status =
                        window.getMeasurementPointStatus?.(
                            point
                        );

                    return (
                        status?.state ===
                        "confirmed"
                    );
                }
            ).length;


        return {
            measured,
            total,
            coverage:
                total > 0
                    ? Math.round(
                        measured /
                        total *
                        100
                    )
                    : 0
        };
    }


    return {
        measured: 0,
        total:
            Number(
                roomSummary?.point_count ||
                0
            ),
        coverage: 0
    };
}


function brGetSurveyDate(
    project
) {

    let latestSavedAt =
        null;


    const floors =
        Array.isArray(
            project?.floors
        )
            ? project.floors
            : [];


    floors.forEach(
        floor => {

            const rooms =
                Array.isArray(
                    floor?.rooms
                )
                    ? floor.rooms
                    : [];


            rooms.forEach(
                room => {

                    const points =
                        Array.isArray(
                            room?.grid
                        )
                            ? room.grid
                            : [];


                    points.forEach(
                        point => {

                            const measurements =
                                point?.measurements;


                            if (
                                !measurements ||
                                typeof measurements !==
                                    "object"
                            ) {
                                return;
                            }


                            Object.values(
                                measurements
                            ).forEach(
                                measurement => {

                                    const savedAt =
                                        Number(
                                            measurement?.savedAt ||
                                            0
                                        );


                                    if (
                                        Number.isFinite(
                                            savedAt
                                        ) &&
                                        savedAt > 0 &&
                                        (
                                            latestSavedAt ===
                                                null ||
                                            savedAt >
                                                latestSavedAt
                                        )
                                    ) {

                                        latestSavedAt =
                                            savedAt;
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );


    if (latestSavedAt) {

        return latestSavedAt;
    }


    return (
        project?.updatedAt ||
        project?.updated_at ||
        project?.createdAt ||
        project?.created_at ||
        null
    );
}


function brCountRisks(rooms) {

    const result = {
        high: 0,
        moderate: 0,
        low: 0,
        unknown: 0
    };

    rooms.forEach(room => {

        const risk =
            brRiskClass(
                room?.risk
            );

        result[risk]++;
    });

    return result;
}


function brGetRecommendations(
    analysis,
    rooms
) {

    const existing =
        Array.isArray(
            analysis?.recommendations
        )
            ? analysis.recommendations
            : [];

    const usable =
        existing
            .filter(Boolean)
            .map(item =>
                typeof item === "string"
                    ? item
                    : item.text ||
                      item.recommendation ||
                      item.title ||
                      ""
            )
            .filter(Boolean);

    if (usable.length) {

        return usable.slice(
            0,
            3
        );
    }


    const recommendations = [];


    const highRooms =
        rooms.filter(
            room =>
                brRiskClass(
                    room?.risk
                ) === "high"
        );


    const moderateRooms =
        rooms.filter(
            room =>
                brRiskClass(
                    room?.risk
                ) === "moderate"
        );


    if (highRooms.length) {

        recommendations.push(
            `Review higher-risk areas identified in ${highRooms[0].room}.`
        );
    }


    if (moderateRooms.length) {

        recommendations.push(
            `Complete or review measurements in ${moderateRooms[0].room}.`
        );
    }


    if (
        recommendations.length < 2
    ) {

        recommendations.push(
            "Complete remaining measurements to improve assessment coverage."
        );
    }


    return recommendations.slice(
        0,
        3
    );
}


// ==========================================================
// HEATMAP PREVIEW
// ==========================================================

function brRenderHeatmapPreview(
    container,
    analysis,
    floorIndex
) {

    if (!container) {
        return;
    }


    const floors =
        Array.isArray(
            analysis?.floors
        )
            ? analysis.floors
            : [];


    const sourceFloor =
        floors[floorIndex] ||
        floors[0] ||
        null;


    const localFloor =
        AppState?.project?.floors?.[
            floorIndex
        ] ||
        AppState?.project?.floors?.[0] ||
        null;


    const imageData =
        sourceFloor?.imageData ||
        sourceFloor?.image ||
        localFloor?.imageData ||
        localFloor?.image ||
        null;


    const points =
        Array.isArray(
            sourceFloor?.points
        )
            ? sourceFloor.points
            : Array.isArray(
                localFloor?.rooms
            )
                ? localFloor.rooms
                    .flatMap(
                        room =>
                            Array.isArray(
                                room?.grid
                            )
                                ? room.grid
                                : []
                    )
                : [];


    if (!imageData) {

        container.innerHTML = `
            <div class="br-heatmap-empty">
                <div class="br-heatmap-empty-icon">
                    ▧
                </div>
                <strong>
                    Floor plan preview unavailable
                </strong>
                <span>
                    The detailed heatmap is included in the Expert Report.
                </span>
            </div>
        `;

        return;
    }


    const img =
        new Image();


    img.onload = () => {

        const canvas =
            document.createElement(
                "canvas"
            );


        const maxWidth = 900;
        const maxHeight = 620;


        let width =
            img.naturalWidth ||
            img.width;

        let height =
            img.naturalHeight ||
            img.height;


        const ratio =
            Math.min(
                maxWidth / width,
                maxHeight / height,
                1
            );


        width =
            Math.max(
                1,
                Math.round(
                    width * ratio
                )
            );

        height =
            Math.max(
                1,
                Math.round(
                    height * ratio
                )
            );


        canvas.width =
            width;

        canvas.height =
            height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.drawImage(
            img,
            0,
            0,
            width,
            height
        );


        // --------------------------------------------------
        // Approximate heat influence from measured points.
        // This is deliberately blurred in the free preview.
        // --------------------------------------------------

        const measuredPoints =
            points.filter(
                point =>
                    point &&
                    Number.isFinite(
                        Number(point.x)
                    ) &&
                    Number.isFinite(
                        Number(point.y)
                    )
            );


        measuredPoints.forEach(
            point => {

                const px =
                    Number(point.x) *
                    ratio;

                const py =
                    Number(point.y) *
                    ratio;


                const rawValue =
                    point.measurements
                        ?.session_1
                        ?.rf ??
                    point.measurements
                        ?.default
                        ?.rf ??
                    point.rf ??
                    null;


                if (
                    rawValue === null ||
                    rawValue === undefined ||
                    rawValue === ""
                ) {
                    return;
                }


                const value =
                    Number(rawValue);


                if (
                    !Number.isFinite(
                        value
                    )
                ) {
                    return;
                }


                const radius =
                    Math.max(
                        35,
                        Math.min(
                            130,
                            45 + value / 8
                        )
                    );


                const gradient =
                    ctx.createRadialGradient(
                        px,
                        py,
                        0,
                        px,
                        py,
                        radius
                    );


                gradient.addColorStop(
                    0,
                    "rgba(239,68,68,0.82)"
                );

                gradient.addColorStop(
                    0.35,
                    "rgba(249,115,22,0.55)"
                );

                gradient.addColorStop(
                    0.7,
                    "rgba(250,204,21,0.30)"
                );

                gradient.addColorStop(
                    1,
                    "rgba(34,197,94,0)"
                );


                ctx.fillStyle =
                    gradient;


                ctx.fillRect(
                    px - radius,
                    py - radius,
                    radius * 2,
                    radius * 2
                );
            }
        );


        container.innerHTML = "";


        const shell =
            document.createElement(
                "div"
            );

        shell.className =
            "br-heatmap-shell";


        const image =
            document.createElement(
                "canvas"
            );

        image.className =
            "br-heatmap-canvas";

        image.width =
            canvas.width;

        image.height =
            canvas.height;


        image
            .getContext("2d")
            .drawImage(
                canvas,
                0,
                0
            );


        shell.appendChild(
            image
        );


        const blurLayer =
            document.createElement(
                "div"
            );

        blurLayer.className =
            "br-heatmap-blur";


        const lock =
            document.createElement(
                "div"
            );

        lock.className =
            "br-heatmap-lock";

        lock.innerHTML = `
            <div class="br-lock-icon">
                🔒
            </div>

            <strong>
                Detailed heatmap available
                in Expert Report
            </strong>

            <span>
                Full interactive heatmaps,
                exact measurements and
                professional analysis.
            </span>
        `;


        shell.appendChild(
            blurLayer
        );

        shell.appendChild(
            lock
        );


        container.appendChild(
            shell
        );
    };


    img.onerror = () => {

        container.innerHTML = `
            <div class="br-heatmap-empty">
                <div class="br-heatmap-empty-icon">
                    ▧
                </div>
                <strong>
                    Floor plan preview unavailable
                </strong>
                <span>
                    The detailed heatmap is included in the Expert Report.
                </span>
            </div>
        `;
    };


    img.src =
        imageData;
}


// ==========================================================
// OPEN RESULTS
// ==========================================================

async function openBusinessResults() {

    const projectId =
        AppState.project?.id;


    if (!projectId) {

        alert(
            "No Business project is currently open."
        );

        return;
    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please sign in again."
        );

        return;
    }


    try {

        const [
            analysisResponse,
            userResponse
        ] =
            await Promise.all([

                fetch(
                    `${BUSINESS_RESULTS_API}/business-analysis/${projectId}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                ),

                fetch(
                    `${BUSINESS_RESULTS_API}/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                )
            ]);


        if (
            !analysisResponse.ok
        ) {

            throw new Error(
                `Analysis HTTP ${analysisResponse.status}`
            );
        }


        const analysis =
            await analysisResponse.json();


        let user = {};

        if (
            userResponse.ok
        ) {
            user =
                await userResponse.json();
        }


        renderBusinessResultsPreview(
            analysis,
            user
        );


    } catch (error) {

        console.error(
            "BUSINESS RESULTS ERROR:",
            error
        );


        alert(
            "Unable to load Business Results."
        );
    }
}


// ==========================================================
// PREVIEW UI
// ==========================================================

function renderBusinessResultsPreview(
    analysis,
    user
) {

    document
        .getElementById(
            "businessResultsPreview"
        )
        ?.remove();


    const coverage =
        analysis?.coverage ||
        {};


    const rooms =
        Array.isArray(
            analysis?.room_summary
        )
            ? analysis.room_summary
            : [];


    const floors =
        Array.isArray(
            analysis?.floors
        )
            ? analysis.floors
            : [];


    const sources =
        Array.isArray(
            analysis?.sources
        )
            ? analysis.sources
            : [];


    const measured =
        Number(
            coverage.measured_points ??
            0
        );


    const total =
        Number(
            coverage.total_points ??
            0
        );


    const percentage =
        Number(
            coverage.coverage ??
            0
        );


    const assessmentReady =
        analysis?.report_status?.valid === true;


    const riskCounts =
        brCountRisks(
            rooms
        );


    const recommendations =
        brGetRecommendations(
            analysis,
            rooms
        );


    const project =
        AppState?.project ||
        {};


    const userInfo =
        brGetUserInfo();


    const userName =
        user?.first_name ||
        userInfo.name ||
        "";


    const userEmail =
        user?.email ||
        userInfo.email ||
        "";


    const projectName =
        project.name ||
        project.project_name ||
        "Business Assessment";


    const surveyDate =
    brGetSurveyDate(
        project
    );


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "businessResultsPreview";


    overlay.innerHTML = `

        <style>

            #businessResultsPreview {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: #f8fafc;
                overflow-y: auto;
                box-sizing: border-box;
                padding: 26px 32px 42px;
                font-family:
                    Inter,
                    Arial,
                    sans-serif;
                color: #0f172a;
            }


            #businessResultsPreview *,
            #businessResultsPreview *::before,
            #businessResultsPreview *::after {
                box-sizing: border-box;
            }


            .br-page {
                max-width: 1400px;
                margin: 0 auto;
            }


            .br-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                margin-bottom: 18px;
            }


            .br-brand {
                display: flex;
                align-items: center;
                gap: 14px;
                min-width: 260px;
            }


            .br-logo {
                width: 150px;
                height: 62px;
                border: 1px dashed #cbd5e1;
                border-radius: 10px;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #94a3b8;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .4px;
            }


            .br-brand-text {
                min-width: 0;
            }


            .br-brand-name {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 3px;
            }


            .br-title {
                margin: 0;
                font-size: 29px;
                line-height: 1.1;
                letter-spacing: -.5px;
            }


            .br-subtitle {
                margin-top: 5px;
                color: #64748b;
                font-size: 14px;
            }


            .br-actions {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            }


            .br-mode {
                border: 1px solid #cbd5e1;
                background: white;
                border-radius: 10px;
                padding: 9px 13px;
                font-weight: 600;
            }


            .br-back {
                border: 1px solid #cbd5e1;
                background: white;
                border-radius: 9px;
                padding: 9px 14px;
                cursor: pointer;
            }


            .br-meta {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                display: grid;
                grid-template-columns:
                    1.3fr 1fr 1fr;
                overflow: hidden;
                margin-bottom: 20px;
            }


            .br-meta-item {
                padding: 16px 20px;
                border-right: 1px solid #eef2f7;
                min-width: 0;
            }


            .br-meta-item:last-child {
                border-right: 0;
            }


            .br-meta-label {
                font-size: 11px;
                color: #64748b;
                margin-bottom: 5px;
            }


            .br-meta-value {
                font-weight: 700;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }


            .br-meta-small {
                font-size: 12px;
                color: #64748b;
                margin-top: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }


            .br-layout {
                display: grid;
                grid-template-columns:
                    minmax(0, 1.45fr)
                    minmax(390px, .9fr);
                gap: 18px;
                align-items: start;
            }


            .br-left,
            .br-right {
                min-width: 0;
            }


            .br-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 13px;
                padding: 20px;
                margin-bottom: 18px;
            }


            .br-card-title {
                margin: 0 0 16px;
                font-size: 17px;
            }


            .br-stats {
                display: grid;
                grid-template-columns:
                    repeat(5, minmax(0, 1fr));
                gap: 12px;
            }


            .br-stat {
                min-width: 0;
            }


            .br-stat-label {
                color: #64748b;
                font-size: 11px;
                margin-bottom: 5px;
            }


            .br-stat-value {
                font-size: 23px;
                font-weight: 750;
                white-space: nowrap;
            }


            .br-ready {
                color: #16a34a;
            }


            .br-risk-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 18px;
            }


            .br-risk-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                border-bottom: 1px solid #f1f5f9;
            }


            .br-risk-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex: 0 0 auto;
            }


            .br-risk-dot.high {
                background: #ef4444;
            }


            .br-risk-dot.moderate {
                background: #f59e0b;
            }


            .br-risk-dot.low {
                background: #22c55e;
            }


            .br-risk-dot.unknown {
                background: #94a3b8;
            }


            .br-risk-count {
                margin-left: auto;
                font-weight: 700;
            }


            .br-findings {
                background: #f8fafc;
                border-radius: 10px;
                padding: 15px;
            }


            .br-findings-title {
                font-weight: 700;
                margin-bottom: 8px;
            }


            .br-findings ul {
                margin: 0;
                padding-left: 18px;
                color: #475569;
                line-height: 1.55;
                font-size: 13px;
            }


            .br-room {
                display: grid;
                grid-template-columns:
                    minmax(100px, 1.1fr)
                    95px
                    120px
                    minmax(100px, 1fr);
                gap: 12px;
                align-items: center;
                padding: 11px 0;
                border-bottom: 1px solid #f1f5f9;
                font-size: 13px;
            }


            .br-room-head {
                color: #64748b;
                font-size: 11px;
                font-weight: 600;
            }


            .br-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: fit-content;
                padding: 4px 9px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
            }


            .br-badge.high {
                color: #b91c1c;
                background: #fee2e2;
            }


            .br-badge.moderate {
                color: #b45309;
                background: #fef3c7;
            }


            .br-badge.low {
                color: #15803d;
                background: #dcfce7;
            }


            .br-badge.unknown {
                color: #64748b;
                background: #f1f5f9;
            }


            .br-progress {
                height: 8px;
                background: #e2e8f0;
                border-radius: 999px;
                overflow: hidden;
            }


            .br-progress > span {
                display: block;
                height: 100%;
                background: #60a5fa;
                border-radius: inherit;
            }


            .br-heatmap-card {
                padding: 16px;
            }


            .br-heatmap-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
            }


            .br-floor-select {
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                background: white;
                padding: 7px 10px;
                font-weight: 600;
            }


            .br-heatmap-shell {
                position: relative;
                width: 100%;
                min-height: 320px;
                background: #f1f5f9;
                border-radius: 11px;
                overflow: hidden;
            }


            .br-heatmap-canvas {
                display: block;
                width: 100%;
                height: auto;
            }


            .br-heatmap-blur {
                position: absolute;
                inset: 0;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                background: rgba(
                    255,
                    255,
                    255,
                    .08
                );
            }


            .br-heatmap-lock {
                position: absolute;
                left: 50%;
                top: 50%;
                transform:
                    translate(-50%, -50%);
                width: min(
                    88%,
                    340px
                );
                padding: 17px;
                border-radius: 13px;
                background: rgba(
                    255,
                    255,
                    255,
                    .88
                );
                box-shadow:
                    0 8px 30px
                    rgba(
                        15,
                        23,
                        42,
                        .12
                    );
                text-align: center;
            }


            .br-lock-icon {
                font-size: 22px;
                margin-bottom: 5px;
            }


            .br-heatmap-lock strong {
                display: block;
                font-size: 14px;
                line-height: 1.35;
            }


            .br-heatmap-lock span {
                display: block;
                margin-top: 7px;
                color: #64748b;
                font-size: 11px;
                line-height: 1.45;
            }


            .br-heatmap-empty {
                min-height: 320px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 7px;
                color: #64748b;
                text-align: center;
                padding: 25px;
            }


            .br-heatmap-empty-icon {
                font-size: 30px;
            }


            .br-unlock {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 13px;
                padding: 20px;
            }


            .br-unlock-title {
                font-size: 17px;
                font-weight: 750;
                margin-bottom: 8px;
            }


            .br-unlock ul {
                margin: 12px 0 17px;
                padding-left: 20px;
                color: #475569;
                font-size: 13px;
                line-height: 1.65;
            }


            .br-report-btn {
                width: 100%;
                border: 0;
                border-radius: 9px;
                padding: 12px 14px;
                background: #1677d2;
                color: white;
                font-weight: 700;
                cursor: pointer;
            }


            .br-recommendations {
                margin: 0;
                padding-left: 19px;
                color: #475569;
                line-height: 1.65;
                font-size: 13px;
            }


            .br-note {
                border: 1px solid #bfdbfe;
                background: #f8fbff;
                border-radius: 11px;
                padding: 14px 16px;
                color: #475569;
                font-size: 12px;
                line-height: 1.5;
                margin-top: 2px;
            }


            .br-footer {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                color: #64748b;
                font-size: 11px;
                padding: 7px 4px 0;
            }


            @media (
                max-width: 1050px
            ) {

                .br-layout {
                    grid-template-columns:
                        1fr;
                }

                .br-stats {
                    grid-template-columns:
                        repeat(3, 1fr);
                }

            }


            @media (
                max-width: 720px
            ) {

                #businessResultsPreview {
                    padding: 18px;
                }

                .br-top {
                    flex-direction: column;
                }

                .br-actions {
                    align-items: flex-start;
                }

                .br-meta {
                    grid-template-columns:
                        1fr;
                }

                .br-meta-item {
                    border-right: 0;
                    border-bottom: 1px solid #eef2f7;
                }

                .br-meta-item:last-child {
                    border-bottom: 0;
                }

                .br-stats {
                    grid-template-columns:
                        repeat(2, 1fr);
                }

                .br-risk-grid {
                    grid-template-columns:
                        1fr;
                }

                .br-room {
                    grid-template-columns:
                        1fr 85px;
                }

                .br-room-extra {
                    display: none;
                }

            }

        </style>


        <div class="br-page">

            <!-- ========================================= -->
            <!-- HEADER -->
            <!-- ========================================= -->

            <header class="br-top">

                <div class="br-brand">

                    <div class="br-logo">
                        YOUR LOGO
                    </div>

                    <div class="br-brand-text">

                        <div class="br-brand-name">
                            EMF Insight
                        </div>

                        <h1 class="br-title">
                            Business Results
                        </h1>

                        <div class="br-subtitle">
                            Free Preview
                        </div>

                    </div>

                </div>


                <div class="br-actions">

                    <button
                        class="br-back"
                        type="button"
                        onclick="
                            closeBusinessResultsPreview()
                        "
                    >
                        ← Back to Survey
                    </button>

                </div>

            </header>


            <!-- ========================================= -->
            <!-- PROJECT META -->
            <!-- ========================================= -->

            <section class="br-meta">

                <div class="br-meta-item">

                    <div class="br-meta-label">
                        Object
                    </div>

                    <div class="br-meta-value">
                        ${brEscape(
                            projectName
                        )}
                    </div>

                    <div class="br-meta-small">
                        Project ID:
                        ${brEscape(
                            project.id ||
                            "—"
                        )}
                    </div>

                </div>


                <div class="br-meta-item">

                    <div class="br-meta-label">
                        Survey Date
                    </div>

                    <div class="br-meta-value">
                        ${brFormatDate(
                            surveyDate
                        )}
                    </div>

                </div>


                <div class="br-meta-item">

                    <div class="br-meta-label">
                        Prepared by
                    </div>

                    <div class="br-meta-value">
                        ${
                            brEscape(
                                userName ||
                                "—"
                            )
                        }
                    </div>

                    <div class="br-meta-small">
                        ${
                            brEscape(
                                userEmail ||
                                "—"
                            )
                        }
                    </div>

                </div>

            </section>


            <!-- ========================================= -->
            <!-- MAIN -->
            <!-- ========================================= -->

            <main class="br-layout">

                <div class="br-left">

                    <!-- ASSESSMENT -->

                    <section class="br-card">

                        <h2 class="br-card-title">
                            Assessment Overview
                        </h2>

                        <div class="br-stats">

                            <div class="br-stat">

                                <div class="br-stat-label">
                                    Measurement Coverage
                                </div>

                                <div class="br-stat-value">
                                    ${percentage}%
                                </div>

                            </div>


                            <div class="br-stat">

                                <div class="br-stat-label">
                                    Measured Points
                                </div>

                                <div class="br-stat-value">
                                    ${measured}
                                    /
                                    ${total}
                                </div>

                            </div>


                            <div class="br-stat">

                                <div class="br-stat-label">
                                    Rooms
                                </div>

                                <div class="br-stat-value">
                                    ${rooms.length}
                                </div>

                            </div>


                            <div class="br-stat">

                                <div class="br-stat-label">
                                    Sources
                                </div>

                                <div class="br-stat-value">
                                    ${sources.length}
                                </div>

                            </div>


                            <div class="br-stat">

                                <div class="br-stat-label">
                                    Assessment
                                </div>

                                <div class="
                                    br-stat-value
                                    ${
                                        assessmentReady
                                            ? "br-ready"
                                            : ""
                                    }
                                ">
                                    ${
                                        assessmentReady
                                            ? "Ready"
                                            : "In Progress"
                                    }
                                </div>

                            </div>

                        </div>

                    </section>


                    <!-- RISK SUMMARY -->

                    <section class="br-card">

                        <h2 class="br-card-title">
                            Risk Summary
                            <span style="
                                color:#64748b;
                                font-weight:500;
                            ">
                                (Preview)
                            </span>
                        </h2>


                        <div class="br-risk-grid">

                            <div>

                                <div class="br-risk-row">

                                    <span class="
                                        br-risk-dot high
                                    "></span>

                                    <span>
                                        High Risk Areas
                                    </span>

                                    <span class="
                                        br-risk-count
                                    ">
                                        ${riskCounts.high}
                                    </span>

                                </div>


                                <div class="br-risk-row">

                                    <span class="
                                        br-risk-dot moderate
                                    "></span>

                                    <span>
                                        Moderate Risk Areas
                                    </span>

                                    <span class="
                                        br-risk-count
                                    ">
                                        ${riskCounts.moderate}
                                    </span>

                                </div>


                                <div class="br-risk-row">

                                    <span class="
                                        br-risk-dot low
                                    "></span>

                                    <span>
                                        Low Risk Areas
                                    </span>

                                    <span class="
                                        br-risk-count
                                    ">
                                        ${riskCounts.low}
                                    </span>

                                </div>


                                <div class="br-risk-row">

                                    <span class="
                                        br-risk-dot unknown
                                    "></span>

                                    <span>
                                        Not Measured
                                    </span>

                                    <span class="
                                        br-risk-count
                                    ">
                                        ${riskCounts.unknown}
                                    </span>

                                </div>

                            </div>


                            <div class="br-findings">

                                <div class="br-findings-title">
                                    Key Findings
                                    <span style="
                                        color:#64748b;
                                        font-weight:500;
                                    ">
                                        (Preview)
                                    </span>
                                </div>


                                <ul>

                                    ${
                                        rooms.length
                                            ? `
                                                <li>
                                                    ${
                                                        riskCounts.high
                                                            ? "Higher-risk areas are present in the assessment."
                                                            : "No high-risk room identified in this preview."
                                                    }
                                                </li>

                                                <li>
                                                    ${
                                                        percentage < 100
                                                            ? "Some measurement coverage is still incomplete."
                                                            : "Measurement coverage is complete."
                                                    }
                                                </li>

                                                <li>
                                                    Detailed risk drivers and interpretation are available in the Expert Report.
                                                </li>
                                            `
                                            : `
                                                <li>
                                                    No room-level findings are currently available.
                                                </li>
                                            `
                                    }

                                </ul>

                            </div>

                        </div>

                    </section>


                    <!-- ROOMS -->

                    <section class="br-card">

                        <h2 class="br-card-title">
                            Room Risk Overview
                            <span style="
                                color:#64748b;
                                font-weight:500;
                            ">
                                (Preview)
                            </span>
                        </h2>


                        <div class="
                            br-room
                            br-room-head
                        ">
                            <div>
                                Room
                            </div>

                            <div>
                                Risk
                            </div>

                            <div class="br-room-extra">
                                Measured
                            </div>

                            <div class="br-room-extra">
                                Coverage
                            </div>
                        </div>


                        ${
                            rooms.length
                                ? rooms.map(
    room => {

        const roomFloor =
            floors.find(
                floor =>
                    String(
                        floor?.name ||
                        floor?.floorName ||
                        ""
                    ) === String(
                        room?.floor ||
                        ""
                    )
            ) ||
            floors[0] ||
            null;


        const roomCoverageData =
            brGetRoomCoverage(
                room,
                AppState?.project?.floors?.[
                    floors.indexOf(
                        roomFloor
                    )
                ] ||
                AppState?.project?.floors?.[0]
            );


        const roomTotal =
            roomCoverageData.total;

        const roomMeasured =
            roomCoverageData.measured;

        const roomCoverage =
            roomCoverageData.coverage;

                                        const risk =
                                            brRiskClass(
                                                room.risk
                                            );

                                        return `
                                            <div class="br-room">

                                                <div>
                                                    <strong>
                                                        ${brEscape(
                                                            room.room ||
                                                            "Room"
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span class="
                                                        br-badge
                                                        ${risk}
                                                    ">
                                                        ${brRiskLabel(
                                                            room.risk
                                                        )}
                                                    </span>
                                                </div>

                                                <div class="br-room-extra">
                                                    ${roomMeasured}
                                                    /
                                                    ${roomTotal}
                                                </div>

                                                <div class="br-room-extra">

                                                    <div class="br-progress">
                                                        <span style="
                                                            width:
                                                            ${Math.min(
                                                                100,
                                                                roomCoverage
                                                            )}%;
                                                        "></span>
                                                    </div>

                                                    <div style="
                                                        margin-top:4px;
                                                        color:#64748b;
                                                        font-size:11px;
                                                    ">
                                                        ${roomCoverage}%
                                                    </div>

                                                </div>

                                            </div>
                                        `;
                                    }
                                ).join("")
                                : `
                                    <div style="
                                        color:#64748b;
                                    ">
                                        No room data available.
                                    </div>
                                `
                        }

                    </section>


                    <!-- RECOMMENDATIONS -->

                    <section class="br-card">

                        <h2 class="br-card-title">
                            Recommendations
                            <span style="
                                color:#64748b;
                                font-weight:500;
                            ">
                                (Preview)
                            </span>
                        </h2>


                        <ul class="br-recommendations">

                            ${
                                recommendations.map(
                                    recommendation =>
                                        `<li>
                                            ${brEscape(
                                                recommendation
                                            )}
                                        </li>`
                                ).join("")
                            }

                        </ul>

                    </section>

                </div>


                <!-- ======================================= -->
                <!-- RIGHT -->
                <!-- ======================================= -->

                <div class="br-right">

                    <!-- HEATMAP -->

                    <section class="
                        br-card
                        br-heatmap-card
                    ">

                        <div class="
                            br-heatmap-header
                        ">

                            <div>

                                <h2 style="
                                    margin:0;
                                    font-size:17px;
                                ">
                                    Floor Heatmap
                                    <span style="
                                        color:#64748b;
                                        font-weight:500;
                                    ">
                                        (Preview)
                                    </span>
                                </h2>

                                <div style="
                                    margin-top:4px;
                                    color:#64748b;
                                    font-size:11px;
                                ">
                                    Blurred overview of relative measured levels.
                                </div>

                            </div>


                            ${
                                floors.length > 1
                                    ? `
                                        <select
                                            id="brFloorSelect"
                                            class="
                                                br-floor-select
                                            "
                                        >
                                            ${
                                                floors.map(
                                                    (
                                                        floor,
                                                        index
                                                    ) =>
                                                        `<option value="${index}">
                                                            ${
                                                                brEscape(
                                                                    floor?.name ||
                                                                    floor?.floorName ||
                                                                    `Floor ${index + 1}`
                                                                )
                                                            }
                                                        </option>`
                                                ).join("")
                                            }
                                        </select>
                                    `
                                    : `
                                        <div class="
                                            br-floor-select
                                        ">
                                            ${
                                                brEscape(
                                                    floors[0]?.name ||
                                                    floors[0]?.floorName ||
                                                    "Floor 1"
                                                )
                                            }
                                        </div>
                                    `
                            }

                        </div>


                        <div
                            id="brHeatmapPreview"
                        ></div>

                    </section>


                    <!-- UNLOCK -->

                    <section class="
                        br-card
                        br-unlock
                    ">

                        <div class="
                            br-unlock-title
                        ">
                            🔒 Unlock Full Results
                        </div>


                        <div style="
                            color:#475569;
                            font-size:13px;
                        ">
                            Get the complete professional assessment with:
                        </div>


                        <ul>

                            <li>
                                Interactive heatmaps for all floors
                            </li>

                            <li>
                                Exact measurement values
                            </li>

                            <li>
                                Detailed room and zone analysis
                            </li>

                            <li>
                                Personalized recommendations
                            </li>

                            <li>
                                Professional PDF report
                            </li>

                            <li>
                                Source impact assessment
                            </li>

                        </ul>


                        <button
                            type="button"
                            class="br-report-btn"
                            onclick="generateBusinessPdf()"
                        >
                            📄 Generate Expert Report →
                        </button>


                        <div style="
                            margin-top:8px;
                            text-align:center;
                            color:#64748b;
                            font-size:11px;
                        ">
                            Uses 1 credit · Full professional analysis
                        </div>

                    </section>

                </div>

            </main>


            <!-- NOTE -->

            <div class="br-note">

                <strong>
                    This is a preview of your Business Assessment.
                </strong>

                The full Expert Report includes detailed heatmaps,
                comprehensive analysis and personalized recommendations.

            </div>


            <!-- FOOTER -->

            <footer class="br-footer">

                <div>
                    EMF Insight
                </div>

                <div>
                    Business Assessment · Preview
                </div>

            </footer>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    // ------------------------------------------------------
    // Heatmap
    // ------------------------------------------------------

    brRenderHeatmapPreview(
        document.getElementById(
            "brHeatmapPreview"
        ),
        analysis,
        0
    );


    // ------------------------------------------------------
    // Floor selector
    // ------------------------------------------------------

    const floorSelect =
        document.getElementById(
            "brFloorSelect"
        );


    if (floorSelect) {

        floorSelect.addEventListener(
            "change",
            event => {

                brRenderHeatmapPreview(
                    document.getElementById(
                        "brHeatmapPreview"
                    ),
                    analysis,
                    Number(
                        event.target.value
                    )
                );
            }
        );
    }
}


// ==========================================================
// CLOSE
// ==========================================================

function closeBusinessResultsPreview() {

    document
        .getElementById(
            "businessResultsPreview"
        )
        ?.remove();
}


// ==========================================================
// PUBLIC
// ==========================================================

window.openResultsDashboard =
    openBusinessResults;

window.openBusinessResults =
    openBusinessResults;

window.closeBusinessResultsPreview =
    closeBusinessResultsPreview;