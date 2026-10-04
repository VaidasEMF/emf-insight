/* =========================================================
   BUSINESS DEMO WORKSPACE
   Read-only Professional Assessment Demo
   ========================================================= */

(function () {

    let currentFloorIndex = 0;

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getDemoRoot() {

        let root =
            document.getElementById(
                "businessDemoWorkspace"
            );

        if (root) {
            return root;
        }

        const main =
            document.querySelector(
                ".main-content"
            );

        if (!main) {
            console.warn(
                "⚠️ Business Demo: .main-content not found"
            );
            return null;
        }

        root =
            document.createElement("div");

        root.id =
            "businessDemoWorkspace";

        root.style.display =
            "none";

        main.appendChild(root);

        return root;
    }


    function injectStyles() {

        if (
            document.getElementById(
                "businessDemoWorkspaceStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "businessDemoWorkspaceStyles";

        style.textContent = `

        #businessDemoWorkspace {
            width: 100%;
            box-sizing: border-box;
            padding: 24px 28px 60px;
            background: #f7f9fc;

            min-height: 100%;
            overflow: visible;
        }

        .bd-demo-shell {
            max-width: 1500px;
            margin: 0 auto;
        }

        .bd-demo-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
            padding: 20px 24px;
            margin-bottom: 20px;
            background: #eef5ff;
            border: 1px solid #cfe0ff;
            border-radius: 14px;
        }

        .bd-demo-banner-left {
            min-width: 0;
        }

        .bd-demo-kicker {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .bd-demo-title {
            font-size: 22px;
            font-weight: 750;
            color: #17202a;
            margin: 0;
        }

        .bd-demo-subtitle {
            margin-top: 5px;
            color: #667085;
            font-size: 13px;
        }

        .bd-demo-cta {
            border: 0;
            border-radius: 9px;
            padding: 11px 17px;
            background: #2563eb;
            color: white;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
        }

        .bd-demo-cta:hover {
            background: #1d4ed8;
        }

        .bd-demo-readonly {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 10px;
            padding: 5px 9px;
            border-radius: 999px;
            background: #f1f5f9;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
        }

        .bd-stat-grid {
            display: grid;
            grid-template-columns:
                repeat(5, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }

        .bd-stat-card {
            background: white;
            border: 1px solid #e3e8ef;
            border-radius: 12px;
            padding: 16px 18px;
        }

        .bd-stat-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .05em;
            color: #667085;
        }

        .bd-stat-value {
            margin-top: 7px;
            font-size: 25px;
            line-height: 1;
            font-weight: 750;
            color: #17202a;
        }

        .bd-layout {
            display: grid;
            grid-template-columns:
                minmax(0, 1fr)
                340px;
            gap: 20px;
            align-items: start;
        }

        .bd-card {
            background: white;
            border: 1px solid #e3e8ef;
            border-radius: 14px;
            overflow: hidden;
        }

        .bd-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 16px 18px;
            border-bottom: 1px solid #edf0f4;
        }

        .bd-card-title {
            font-size: 14px;
            font-weight: 750;
            color: #17202a;
        }

        .bd-card-subtitle {
            margin-top: 3px;
            font-size: 12px;
            color: #667085;
        }

        .bd-floor-tabs {
            display: flex;
            gap: 8px;
            padding: 14px 18px;
            border-bottom: 1px solid #edf0f4;
        }

        .bd-floor-tab {
            border: 1px solid #d8dee8;
            background: white;
            color: #475467;
            border-radius: 8px;
            padding: 8px 13px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .bd-floor-tab.active {
            background: #2563eb;
            border-color: #2563eb;
            color: white;
        }

        .bd-plan {
            margin: 18px;
            min-height: 440px;
            border-radius: 12px;
            border: 1px solid #dbe2ea;
            background:
                linear-gradient(
                    rgba(37,99,235,.025) 1px,
                    transparent 1px
                ),
                linear-gradient(
                    90deg,
                    rgba(37,99,235,.025) 1px,
                    transparent 1px
                ),
                #f8fafc;
            background-size: 24px 24px;
            padding: 20px;
            box-sizing: border-box;
        }

        .bd-plan-inner {
            height: 400px;
            display: grid;
            grid-template-columns:
                repeat(12, 1fr);
            grid-template-rows:
                repeat(8, 1fr);
            gap: 8px;
        }

        .bd-room {
            position: relative;
            border: 2px solid #94a3b8;
            border-radius: 6px;
            background:
                radial-gradient(
                    circle at 65% 35%,
                    rgba(239,68,68,.28),
                    rgba(250,204,21,.16) 35%,
                    rgba(34,197,94,.10) 70%,
                    rgba(255,255,255,.7)
                );
            overflow: hidden;
            cursor: default;
        }

        .bd-room:hover {
            border-color: #2563eb;
        }

        .bd-room-name {
            position: absolute;
            top: 9px;
            left: 10px;
            right: 10px;
            font-size: 12px;
            font-weight: 750;
            color: #17202a;
        }

        .bd-room-meta {
            position: absolute;
            left: 10px;
            bottom: 9px;
            font-size: 10px;
            color: #667085;
        }

        .bd-room-risk {
            position: absolute;
            right: 8px;
            top: 8px;
            padding: 3px 6px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .bd-risk-low {
            background: #dcfce7;
            color: #166534;
        }

        .bd-risk-medium {
            background: #fef3c7;
            color: #92400e;
        }

        .bd-risk-high {
            background: #fee2e2;
            color: #991b1b;
        }

        .bd-side-section {
            padding: 17px 18px;
            border-bottom: 1px solid #edf0f4;
        }

        .bd-side-section:last-child {
            border-bottom: 0;
        }

        .bd-side-heading {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .05em;
            color: #667085;
            margin-bottom: 12px;
        }

        .bd-room-row,
        .bd-source-row,
        .bd-rec-row {
            padding: 10px 0;
            border-bottom: 1px solid #f0f2f5;
        }

        .bd-room-row:last-child,
        .bd-source-row:last-child,
        .bd-rec-row:last-child {
            border-bottom: 0;
        }

        .bd-row-title {
            font-size: 12px;
            font-weight: 700;
            color: #344054;
        }

        .bd-row-meta {
            margin-top: 3px;
            font-size: 11px;
            color: #667085;
        }

        .bd-risk-text {
            float: right;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .bd-report {
            margin-top: 20px;
        }

        .bd-report-preview {
            padding: 20px;
            background: #f8fafc;
        }

        .bd-report-page {
            background: white;
            border: 1px solid #dce2e8;
            border-radius: 10px;
            padding: 24px;
        }

        .bd-report-header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
        }

        .bd-report-title {
            font-size: 18px;
            font-weight: 750;
        }

        .bd-report-badge {
            height: fit-content;
            padding: 5px 9px;
            border-radius: 999px;
            background: #eef5ff;
            color: #2563eb;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .bd-report-grid {
            display: grid;
            grid-template-columns:
                repeat(3, 1fr);
            gap: 10px;
            margin-top: 18px;
        }

        .bd-report-kpi {
            padding: 13px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .bd-report-kpi-label {
            font-size: 10px;
            color: #667085;
        }

        .bd-report-kpi-value {
            margin-top: 4px;
            font-size: 16px;
            font-weight: 750;
        }

        .bd-demo-note {
            margin-top: 20px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #e4e9ef;
            color: #667085;
            font-size: 12px;
            line-height: 1.55;
        }

        /* =========================================================
   BUSINESS DEMO SETTINGS MODALS
   ========================================================= */

.business-demo-settings-overlay {
    position: fixed;
    inset: 0;
    z-index: 5000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.35);
}

.business-demo-settings-box {
    width: min(520px, 94vw);
    box-sizing: border-box;

    background: #ffffff;
    border-radius: 16px;

    padding: 28px;

    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.18);
}

.business-demo-settings-title {
    font-size: 22px;
    line-height: 1.2;
    font-weight: 750;
    color: #17202a;
}

.business-demo-settings-description {
    margin-top: 7px;

    font-size: 14px;
    line-height: 1.5;

    color: #667085;
}

.business-demo-settings-options {
    display: grid;
    gap: 10px;

    margin-top: 22px;
}

.business-demo-settings-option {
    display: flex;
    align-items: center;
    gap: 12px;

    padding: 14px;

    border: 1px solid #d8dee8;
    border-radius: 10px;

    cursor: pointer;

    transition:
        border-color .15s ease,
        background .15s ease;
}

.business-demo-settings-option:hover {
    border-color: #2563eb;
    background: #f8fbff;
}

.business-demo-settings-option input {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
}

.business-demo-settings-option span {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.business-demo-settings-option strong {
    font-size: 16px;
    line-height: 1.2;
    color: #17202a;
}

.business-demo-settings-option small {
    font-size: 12px;
    color: #667085;
}

.business-demo-settings-note {
    margin-top: 12px;

    font-size: 12px;
    line-height: 1.45;

    color: #667085;
}

.business-demo-settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    margin-top: 24px;
}

.business-demo-settings-actions button {
    min-width: 88px;

    border-radius: 9px;

    padding: 10px 17px;

    font-family: inherit;
    font-size: 14px;
    font-weight: 700;

    cursor: pointer;
    }

    .business-demo-settings-actions
    button[data-demo-settings-cancel] {
        border: 1px solid #d8dee8;

        background: #ffffff;
        color: #17202a;
    }

    .business-demo-settings-actions
    button[data-demo-settings-cancel]:hover {
        background: #f8fafc;
    }

    .business-demo-settings-actions
    button[data-demo-settings-apply] {
        border: 0;

        background: #2563eb;
        color: #ffffff;
    }

    .business-demo-settings-actions
    button[data-demo-settings-apply]:hover {
        background: #1d4ed8;
    }

        @media (max-width: 1100px) {

            .bd-stat-grid {
                grid-template-columns:
                    repeat(3, 1fr);
            }

            .bd-layout {
                grid-template-columns: 1fr;
            }
        }

        /* =========================================================
        BUSINESS DEMO — FIXED APP HEADER
        ========================================================= */

        body.business-demo-active {
            overflow: hidden;
        }

        body.business-demo-active .main-content {
            overflow-y: auto;
            overflow-x: hidden;
        }

        body.business-demo-active #businessDemoWorkspace {
            min-height: max-content;
            overflow: visible;
        }

        /* =========================================================
        BUSINESS DEMO — FIXED PROJECT HEADER
        ========================================================= */

        body.business-demo-active #projectHeader {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: #ffffff;
        }

        /* Demo does not need the real Business workflow chrome */
        body.business-demo-active #businessFloorTabsBar,
        body.business-demo-active #businessWorkflowBar,
        body.business-demo-active #businessProjectToggles {
            display: none !important;
        }

        body.business-demo-active #businessPlanActions,
body.business-demo-active #businessAssessmentWorkspace,
body.business-demo-active #businessWorkflowSection {
    display: none !important;
}
        

       /* Professional Demo — inactive sidebar actions */

body.business-demo-active
#businessProjectActions .workflow-action-btn,
body.business-demo-active
#businessOutputActions .workflow-action-btn {
    opacity: 0.45;
    cursor: default !important;
    pointer-events: none !important;
    transform: none !important;
}

body.business-demo-active
#businessProjectActions .workflow-action-btn:hover,
body.business-demo-active
#businessOutputActions .workflow-action-btn:hover {
    transform: none !important;
}
    

        body.business-demo-active
        #professionalDemoNewProperty:hover,
        body.business-demo-active
        #professionalDemoOpenProject:hover,
        body.business-demo-active
        #professionalDemoSaveProject:hover,
        body.business-demo-active
        #professionalDemoInsights:hover,
        body.business-demo-active
        #professionalDemoReport:hover,
        body.business-demo-active
        #professionalDemoExport:hover {
            transform: none !important;
        }


        @media (max-width: 700px) {

            #businessDemoWorkspace {
                padding: 16px;
            }

            .bd-demo-banner {
                flex-direction: column;
                align-items: flex-start;
            }

            .bd-stat-grid {
                grid-template-columns:
                    repeat(2, 1fr);
            }

            .bd-plan-inner {
                height: 320px;
            }
        }

        /* ==========================================================
        BUSINESS DEMO — MAIN CONTENT SCROLL
        ========================================================== */

        body.business-demo-active .main-content {
            height: 100%;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            overscroll-behavior: contain;
        }

        body.business-demo-active .workspace {
            min-height: 0;
            overflow: hidden;
        }

        body.business-demo-active .app {
            min-height: 0;
            overflow: hidden;
        }


        .bd-rec-expand-btn {
    display: block;
    width: 100%;
    padding: 8px 0 4px;
    margin: 2px;
    border: 0;
    border-bottom: 1px solid #eef2f7;
    background: transparent;
    color: #2563EB;
    font: 11px Arial, sans-serif;
    text-align: left;
    cursor: pointer;
}

.bd-rec-floor {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-weight: 600;
}

.bd-rec-floor-main {
    background: #eff6ff;
    color: #2563eb;
}

.bd-rec-floor-secondary {
    background: #f3f4f6;
    color: #4b5563;
}

.bd-rec-room {
    color: #64748b;
    font-weight: 400;
}

.bd-heat-point {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.25);
    transform: translate(-50%, -50%);
    z-index: 2;
}

.bd-room-header {
    position: relative;
    z-index: 3;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 8px;
    padding: 8px 8px 0;
}

.bd-room-name {
    font-weight: 600;
}

.bd-room-risk {
    flex-shrink: 0;
}

.bd-room-meta {
    position: absolute;

    left: 8px;
    bottom: 8px;

    z-index: 3;
}

.bd-room-visuals {
    margin-top: 14px;
    border: 1px solid #e4e7ec;
    border-radius: 12px;
    background: #ffffff;
    overflow: hidden;
}

.bd-room-visuals-header {
    padding: 14px 16px;
    border-bottom: 1px solid #eef2f6;
}

.bd-room-visual-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding: 12px;
}

.bd-room-visual-card {
    min-width: 0;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
}

.bd-room-visual-image-wrap {
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #f2f4f7;
}

.bd-room-visual-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.bd-room-visual-info {
    padding: 9px 10px 10px;
}

.bd-room-visual-name {
    font-size: 12px;
    font-weight: 600;
    color: #101828;
}

.bd-room-visual-meta {
    margin-top: 3px;
    font-size: 10px;
    color: #667085;
}

.bd-room-visual-name-top {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    padding:9px 10px 7px;
    font-size:12px;
    font-weight:600;
    color:#101828;
    border-bottom:1px solid #eef2f6;
}

.bd-room-mini-heatmap {
    position:relative;
    height:220px;
    overflow:hidden;
    margin-bottom:6px;
    border-bottom:1px solid #e4e7ec;
    background:#f8fafc;
}

.bd-room-heatmap-image {
    width:100%;
    height:100%;
    display:block;
    object-fit:contain;
    background:#f8fafc;
}

.bd-room-mini-heat-point {
    position:absolute;
    width:8px;
    height:8px;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 1px 4px rgba(15,23,42,.25);
    transform:translate(-50%,-50%);
}

.bd-room-mini-heatmap-label {
    position:absolute;
    left:8px;
    bottom:7px;
    padding:3px 6px;
    border-radius:4px;
    background:rgba(255,255,255,.82);
    color:#667085;
    font-size:9px;
    font-weight:600;
}

.bd-room-visual-image-wrap {
    aspect-ratio:16 / 10;
    overflow:hidden;
    background:#f2f4f7;
}

.bd-room-visual-image {
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
}

.bd-room-visual-info {
    padding:8px 10px 9px;
}

.bd-room-visual-meta {
    padding: 8px 10px 9px;
    font-size: 12px;
    line-height: 14px;
    color: #667085;
    white-space: normal;
    overflow: visible;
}

.bd-room-heatmap-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    grid-auto-rows:220px;
    gap:8px;
    padding:10px;
}

.bd-room-heatmap-grid .bd-room {
    min-height:220px;
    border:1px solid #d0d5dd;
    border-radius:8px;
}

.bd-report-section {
    margin-top:14px;
    padding:10px 0 8px;
    border-top:1px solid #eef2f6;
}

.bd-report-section-title {
    font-size:12px;
    font-weight:700;
    color:#101828;
}

.bd-report-section-subtitle {
    margin-top:3px;
    font-size:10px;
    color:#667085;
}

.bd-report-preview-items {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:8px;
    margin-top:12px;
}

.bd-report-preview-item {
    display:flex;
    gap:8px;
    align-items:flex-start;
    padding:10px;
    border:1px solid #e4e7ec;
    border-radius:8px;
    background:#fafbfc;
}

.bd-report-preview-item-icon {
    flex:0 0 auto;
    width:18px;
    height:18px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#ecfdf3;
    color:#16a34a;
    font-size:10px;
    font-weight:700;
}

.bd-report-preview-item-title {
    font-size:10px;
    font-weight:700;
    color:#101828;
}

.bd-report-preview-item-text {
    margin-top:3px;
    font-size:9px;
    line-height:13px;
    color:#667085;
}

.bd-report-cta {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    margin-top:12px;
    padding:12px;
    border:1px solid #dbe4f0;
    border-radius:8px;
    background:#f8fafc;
}

.bd-report-cta-title {
    font-size:11px;
    font-weight:700;
    color:#101828;
}

.bd-report-cta-text {
    margin-top:3px;
    font-size:9px;
    color:#667085;
}

.bd-report-cta-btn {
    flex-shrink:0;
    padding:7px 11px;
    border:0;
    border-radius:6px;
    background:#2563eb;
    color:#fff;
    font-size:10px;
    font-weight:600;
    cursor:pointer;
}

.bd-report-cta-btn:hover {
    background:#1d4ed8;
}

        `;

        document.head.appendChild(style);
    }

    function renderFloorPlan(
        floor
    ) {

        console.log(
            "🔥 DEMO FLOOR PLAN UNITS TEST",
            {
                units: getProjectUnits?.(),
                testArea: formatBusinessDemoArea?.(28)
            }
        );

        const rooms =
            floor?.rooms || [];

        if (!rooms.length) {
            return `
            <div class="bd-plan">
                <div style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    height:100%;
                    color:#667085;
                ">
                    No floor data available
                </div>
            </div>
        `;
        }

        /*
         * Display-only unit conversion.
         * Demo data remains stored in metric (m²).
         */

        function formatRoomArea(areaM2) {

            const value =
                Number(areaM2);

            if (!Number.isFinite(value)) {
                return "—";
            }

            const units =
                window.EMFBusinessDemoState?.units ||
                "metric";

            if (units === "imperial") {

                const ft2 =
                    value * 10.7639;

                return `${ft2.toFixed(1)} ft²`;
            }

            return `${value.toFixed(1)} m²`;
        }


        /*
         * Deliberately deterministic room layout.
         * This is Demo data, not a real measured floor plan.
         */

        const positions = [
            { col: "1 / 5", row: "1 / 5" },
            { col: "5 / 9", row: "1 / 5" },
            { col: "9 / 13", row: "1 / 5" },
            { col: "1 / 7", row: "5 / 9" },
            { col: "7 / 13", row: "5 / 9" }
        ];

        const roomHtml =
            rooms.map(
                (room, index) => {

                    const pos =
                        positions[index] ||
                        {
                            col: "1 / 7",
                            row: "1 / 5"
                        };

                    const risk =
                        String(
                            room.risk || "low"
                        ).toLowerCase();

                    const heatmap =
                        risk === "high"
                            ? `
                        radial-gradient(
                            circle at 72% 35%,
                            rgba(239, 68, 68, 0.58) 0%,
                            rgba(239, 68, 68, 0.30) 18%,
                            rgba(250, 204, 21, 0.18) 38%,
                            transparent 68%
                        )
                      `
                            : risk === "medium"
                                ? `
                            radial-gradient(
                                circle at 38% 58%,
                                rgba(250, 204, 21, 0.55) 0%,
                                rgba(250, 204, 21, 0.28) 22%,
                                rgba(34, 197, 94, 0.12) 48%,
                                transparent 72%
                            )
                          `
                                : `
                            radial-gradient(
                                circle at 50% 50%,
                                rgba(34, 197, 94, 0.30) 0%,
                                rgba(34, 197, 94, 0.16) 28%,
                                transparent 68%
                            )
                          `;

                    const points =
                        risk === "high"
                            ? [
                                {
                                    left: "22%",
                                    top: "62%",
                                    color: "#ef4444"
                                },
                                {
                                    left: "46%",
                                    top: "38%",
                                    color: "#facc15"
                                },
                                {
                                    left: "72%",
                                    top: "30%",
                                    color: "#ef4444"
                                },
                                {
                                    left: "78%",
                                    top: "65%",
                                    color: "#facc15"
                                }
                            ]
                            : risk === "medium"
                                ? [
                                    {
                                        left: "25%",
                                        top: "40%",
                                        color: "#facc15"
                                    },
                                    {
                                        left: "42%",
                                        top: "68%",
                                        color: "#facc15"
                                    },
                                    {
                                        left: "68%",
                                        top: "32%",
                                        color: "#f59e0b"
                                    },
                                    {
                                        left: "76%",
                                        top: "66%",
                                        color: "#facc15"
                                    }
                                ]
                                : [
                                    {
                                        left: "25%",
                                        top: "35%",
                                        color: "#22c55e"
                                    },
                                    {
                                        left: "45%",
                                        top: "68%",
                                        color: "#22c55e"
                                    },
                                    {
                                        left: "68%",
                                        top: "32%",
                                        color: "#22c55e"
                                    },
                                    {
                                        left: "78%",
                                        top: "65%",
                                        color: "#22c55e"
                                    }
                                ];

                    const pointHtml =
                        points.map(
                            point => `
            <span
                class="bd-heat-point"
                style="
                    left:${point.left};
                    top:${point.top};
                    background:${point.color};
                "
            ></span>
        `
                        ).join("");

                    return `
    <div
        class="
            bd-room
            bd-risk-${esc(risk)}
        "
        style="
            style="
    position:relative;
    overflow:hidden;
    background:
        ${heatmap},
        #f8fafc;
"
        "
    >

        <div
            class="bd-room-heatmap"
            aria-hidden="true"
        ></div>

        ${pointHtml}

        <div class="bd-room-header">

            <div class="bd-room-name">
                ${esc(
                        room.name ||
                        room.code ||
                        "Room"
                    )}
            </div>

            <div
                class="
                    bd-room-risk
                    bd-risk-${esc(risk)}
                "
            >
                ${esc(risk)}
            </div>

        </div>

        <div class="bd-room-meta">
            ${formatRoomArea(room.area)}
            ·
            ${esc(room.coverage || 0)}% coverage
        </div>

    </div>
`;
                }
            ).join("");

        return `
        <div class="bd-room-heatmap-grid">
            ${roomHtml}
        </div>
    `;
    }

    function renderRoomVisuals(floor) {
        const rooms = floor?.rooms || [];

        function formatRoomArea(areaM2) {
            const value = Number(areaM2);

            if (!Number.isFinite(value)) {
                return "—";
            }

            const units =
                window.EMFBusinessDemoState?.units ||
                "metric";

            if (units === "imperial") {
                return `${(value * 10.7639).toFixed(1)} ft²`;
            }

            return `${value.toFixed(1)} m²`;
        }

        if (!rooms.length) {
            return "";
        }

        const renderRoomHeatmap = (room) => {
            if (!room?.heatmap) {
                return "";
            }

            return `
        <div
            class="bd-room-mini-heatmap"
            aria-label="${esc(room.name || "Room")} EMF heatmap"
        >
            <img
                class="bd-room-heatmap-image"
                src="${esc(room.heatmap)}"
                alt="${esc(room.name || "Room")} EMF heatmap"
                loading="lazy"
            />
        </div>
    `;
        };

        return `
        <div class="bd-room-visuals">
            <div class="bd-room-visuals-header">
                <div>
                    <div class="bd-card-title">Room Assessment</div>
                    <div class="bd-card-subtitle">
                        EMF heatmap and visual room context
                    </div>
                </div>
            </div>

         

            <div class="bd-room-visual-grid">
                ${rooms
                .filter(room => room?.image)
                .map(room => `
                        <div class="bd-room-visual-card">

                            <div class="bd-room-visual-name-top">
                                ${esc(room.name || room.code || "Room")}
                                <span class="bd-room-risk bd-risk-${esc(
                    String(room.risk || "low").toLowerCase()
                )}">
                                    ${esc(
                    String(room.risk || "low").toUpperCase()
                )}
                                </span>
                            </div>

                            ${renderRoomHeatmap(room)}

                            <div class="bd-room-visual-image-wrap">
                                <img
                                    class="bd-room-visual-image"
                                    src="${esc(room.image)}"
                                    alt="${esc(room.name || "Room")}"
                                    loading="lazy"
                                />
                            </div>

                            <div class="bd-room-visual-meta">
    ${formatRoomArea(room.area)}
    ·
    ${esc(floor.name || "Floor")}
    ·
    ${esc(
                    String(room.risk || "low").toLowerCase()
                )} risk
    ·
    ${esc(String(room.coverage || 0))}% coverage
</div>

                        </div>
                    `)
                .join("")}
            </div>
        </div>
    `;
    }

    function renderFloorTabs(
        project
    ) {

        const floors =
            project?.floors || [];

        return floors.map(
            (floor, index) => `
                <button
                    type="button"
                    class="
                        bd-floor-tab
                        ${index === currentFloorIndex
                    ? "active"
                    : ""
                }
                    "
                    data-floor-index="${index}"
                >
                    ${esc(
                    floor.name ||
                    `Floor ${index + 1}`
                )}
                </button>
            `
        ).join("");
    }

    function renderRooms(
        floor
    ) {

        function formatRoomArea(areaM2) {

            const value =
                Number(areaM2);

            if (!Number.isFinite(value)) {
                return "—";
            }

            const units =
                window.EMFBusinessDemoState?.units ||
                "metric";

            if (units === "imperial") {

                const ft2 =
                    value * 10.7639;

                return `${ft2.toFixed(1)} ft²`;
            }

            return `${value.toFixed(1)} m²`;
        }


        return (
            floor?.rooms || []
        ).map(
            room => {

                const risk =
                    String(
                        room.risk || "low"
                    ).toLowerCase();

                return `
                <div class="bd-room-row">

                    <div class="bd-row-title">
                        ${esc(
                    room.name ||
                    room.code
                )}

                        <span
                            class="
                                bd-risk-text
                                ${risk === "high"
                        ? "bd-risk-high"
                        : risk === "medium"
                            ? "bd-risk-medium"
                            : "bd-risk-low"
                    }
                            "
                        >
                            ${esc(risk)}
                        </span>
                    </div>

                    <div class="bd-row-meta">

                        ${esc(
                        room.type ||
                        "Assessment room"
                    )}

                        ·

                        ${formatRoomArea(
                        room.area
                    )}

                        ·

                        ${esc(
                        room.coverage || 0
                    )}% coverage

                        ·

                        ${esc(
                        room.measurements?.length ||
                        0
                    )} measurements

                    </div>

                </div>
            `;
            }
        ).join("");
    }


    function renderSources(
        project,
        floor
    ) {

        const floorName =
            String(
                floor?.name ||
                floor?.floor_name ||
                ""
            ).toLowerCase();

        const isFloor2 =
            floorName.includes("floor 2") ||
            floorName.includes("floor2") ||
            floorName.includes("second");

        const indoorSources =
            isFloor2
                ? [
                    {
                        icon: "🎧",
                        name: "Bluetooth Device",
                        location: "Working Zone"
                    }
                ]
                : [
                    {
                        icon: "📡",
                        name: "Wi-Fi Router",
                        location: "Office"
                    },
                    {
                        icon: "🎧",
                        name: "Bluetooth Device",
                        location: "Meeting Room"
                    },
                    {
                        icon: "📶",
                        name: "Smart Meter",
                        location: "Office"
                    },
                    {
                        icon: "💻",
                        name: "Laptop Workstation",
                        location: "Open Workspace"
                    }
                ];

        const outdoorSources =
            isFloor2
                ? [
                    {
                        icon: "☀️",
                        name: "Solar",
                        distanceM: 10,
                        location: "Working Zone · Rooftop"
                    },
                    {
                        icon: "📡",
                        name: "Mobile Tower",
                        distanceM: 170,
                        location: "Working Zone"
                    }
                ]
                : [
                    {
                        icon: "📡",
                        name: "Mobile Tower",
                        distanceM: 180,
                        location: "Meeting Room"
                    },
                    {
                        icon: "⚡",
                        name: "Power Lines",
                        distanceM: 65,
                        location: "Meeting Room"
                    },
                    {
                        icon: "⚡",
                        name: "Substation",
                        distanceM: 420,
                        location: "Meeting Room"
                    }
                ];


        // ==================================================
        // UNITS
        // ==================================================

        const units =
            window.EMFBusinessDemoState?.units ||
            "metric";


        function formatDistance(
            distanceM
        ) {

            const value =
                Number(distanceM);

            if (!Number.isFinite(value)) {
                return "—";
            }

            if (
                units ===
                "imperial"
            ) {

                const feet =
                    value * 3.28084;

                return `~${Math.round(feet)} ft`;
            }

            return `~${Math.round(value)} m`;
        }


        // ==================================================
        // SOURCE ROW
        // ==================================================

        function renderSource(
            source,
            isOutdoor
        ) {

            const secondary =
                isOutdoor
                    ? `${formatDistance(source.distanceM)} from ${source.location}`
                    : source.location;

            return `
            <div
                class="bd-source-row"
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    padding:9px 0;
                    border-bottom:1px solid #eef2f7;
                "
            >

                <div
                    style="
                        width:30px;
                        height:30px;
                        flex:0 0 30px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:8px;
                        background:#f8fafc;
                        font-size:16px;
                    "
                >
                    ${source.icon}
                </div>

                <div
                    style="
                        min-width:0;
                        flex:1;
                    "
                >

                    <div
                        class="bd-row-title"
                        style="
                            font-weight:700;
                        "
                    >
                        ${esc(source.name)}
                    </div>

                    <div
                        class="bd-row-meta"
                        style="
                            margin-top:2px;
                        "
                    >
                        ${esc(secondary)}
                    </div>

                </div>

            </div>
        `;
        }


        // ==================================================
        // GROUP
        // ==================================================
        function renderGroup(
            title,
            count,
            sources,
            isOutdoor
        ) {

            const visible =
                sources.slice(0, 2);

            const remaining =
                sources.slice(2);

            const groupKey =
                isOutdoor
                    ? "outdoor"
                    : "indoor";

            return `
        <div
            class="bd-source-group"
            data-source-group="${groupKey}"
        >

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    margin:14px 0 4px;
                "
            >
                <div
                    class="bd-source-group-title"
                    style="
                        font-size:11px;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.06em;
                        color:#475569;
                    "
                >
                    ${esc(title)}
                    · ${count}
                </div>
            </div>

            ${visible
                    .map(
                        source =>
                            renderSource(
                                source,
                                isOutdoor
                            )
                    )
                    .join("")
                }

            <div
                class="bd-source-extra"
                style="display:none;"
            >
                ${remaining
                    .map(
                        source =>
                            renderSource(
                                source,
                                isOutdoor
                            )
                    )
                    .join("")
                }
            </div>

            ${remaining.length > 0
                    ? `
                        <button
                            type="button"
                            class="bd-source-expand-btn"
                            data-source-group="${groupKey}"
                            aria-expanded="false"
                            style="
                                display:block;
                                width:100%;
                                padding:8px 0 4px;
                                border:0;
                                background:none;
                                text-align:left;
                                font-size:11px;
                                font-weight:700;
                                color:#2563eb;
                                cursor:pointer;
                            "
                        >
                            + ${remaining.length} more →
                        </button>
                    `
                    : ""
                }

        </div>
    `;
        }

        const html = `
    ${renderGroup(
            "Indoor Sources",
            indoorSources.length,
            indoorSources,
            false
        )}

    ${renderGroup(
            "Outdoor Sources",
            outdoorSources.length,
            outdoorSources,
            true
        )}
`;

        return html;


    }
    function renderRecommendations(
        project
    ) {

        const recommendations =
            project?.recommendations?.length
                ? project.recommendations
                : (
                    window.AppState
                        ?.businessDemoAnalysis
                        ?.recommendations || []
                );

        const floors =
            project?.floors || [];

        const roomMap = {};

        floors.forEach(
            floor => {

                (floor.rooms || []).forEach(
                    room => {

                        roomMap[room.id] = {
                            floor: floor.name,
                            room: room.name
                        };

                    }
                );

            }
        );

        const visible =
            recommendations.slice(0, 3);

        const extraCount =
            Math.max(
                recommendations.length - 3,
                0
            );

        const renderRecommendation =
            (
                recommendation,
                index
            ) => {

                const location =
                    roomMap[
                    recommendation.room_id
                    ];

                return `
                <div class="bd-rec-row">

                    <div class="bd-row-title">
                        ${index + 1}.
                        ${esc(
                    recommendation.title ||
                    recommendation.text ||
                    recommendation
                )}
                    </div>

                    ${location
                        ? `
                               <div class="bd-row-meta">
    <span class="bd-rec-floor ${location.floor === "Main Floor"
                            ? "bd-rec-floor-main"
                            : "bd-rec-floor-secondary"
                        }">
        ${esc(location.floor)}
    </span>

    <span class="bd-rec-room">
        · ${esc(location.room)}
    </span>
</div>
                              `
                        : ""
                    }

                </div>
            `;
            };

        const html =
            visible
                .map(
                    renderRecommendation
                )
                .join("");

        return `
        <div class="bd-recommendations-list">

            ${html}

            ${extraCount > 0
                ? `
            <div
                class="bd-rec-extra"
                style="display:none;"
            >
                ${recommendations
                    .slice(3)
                    .map(
                        (
                            recommendation,
                            index
                        ) =>
                            renderRecommendation(
                                recommendation,
                                index + 3
                            )
                    )
                    .join("")
                }
            </div>

            <button
                type="button"
                class="bd-source-expand-btn bd-rec-expand-btn"
                aria-expanded="false"
            >
                + ${extraCount} more →
            </button>
          `
                : ""
            }

        </div>
    `;
    }
    // =========================================================
    // BUSINESS DEMO — UNITS & FLOOR SCALE
    // Demo-only state. Never modifies the real project.
    // =========================================================

    window.EMFBusinessDemoState =
        window.EMFBusinessDemoState || {
            units: "metric",
            floorScale: "1:100"
        };


    function closeBusinessDemoSettings() {

        const modal =
            document.getElementById(
                "businessDemoSettingsModal"
            );

        if (modal) {
            modal.remove();
        }

        document.removeEventListener(
            "keydown",
            handleBusinessDemoSettingsKeydown
        );
    }

    window.openBusinessDemoReportPreview = function () {

        const project =
            window.AppState?.businessDemoProject;

        const analysis =
            window.AppState?.businessDemoAnalysis;

        if (!analysis) {

            console.error(
                "Business Demo analysis is not available."
            );

            return;
        }

        // Use Demo project as the active project
        // for the existing Business Results Preview.
        window.AppState.project =
            project;

        renderBusinessResultsPreview(
            analysis,
            {},
            true
        );
    };


    function closeBusinessDemoReportPreview() {

        const modal =
            document.getElementById(
                "businessDemoReportPreviewModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    function handleBusinessDemoSettingsKeydown(event) {

        const modal =
            document.getElementById(
                "businessDemoSettingsModal"
            );

        if (!modal) {
            return;
        }

        // ESC → close
        if (event.key === "Escape") {

            event.preventDefault();

            closeBusinessDemoSettings();

            return;
        }

        // ENTER → apply
        if (event.key === "Enter") {

            event.preventDefault();

            const applyButton =
                modal.querySelector(
                    "[data-demo-settings-apply]"
                );

            if (applyButton) {
                applyButton.click();
            }
        }
    }


    function activateBusinessDemoSettingsKeyboard() {

        document.removeEventListener(
            "keydown",
            handleBusinessDemoSettingsKeydown
        );

        document.addEventListener(
            "keydown",
            handleBusinessDemoSettingsKeydown
        );
    }


    function openBusinessDemoUnits() {

        closeBusinessDemoSettings();

        const current =
            window.EMFBusinessDemoState?.units ||
            "metric";

        const modal =
            document.createElement("div");

        modal.id =
            "businessDemoSettingsModal";

        modal.innerHTML = `
        <div class="business-demo-settings-overlay">

            <div
                class="business-demo-settings-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="businessDemoUnitsTitle"
            >

                <div
                    class="business-demo-settings-title"
                    id="businessDemoUnitsTitle"
                >
                    Measurement Units
                </div>

                <div class="business-demo-settings-description">
                    Choose how measurements are displayed
                    in this demo.
                </div>

                <div class="business-demo-settings-options">

                    <label
                        class="business-demo-settings-option"
                    >

                        <input
                            type="radio"
                            name="businessDemoUnits"
                            value="metric"
                            ${current === "metric"
                ? "checked"
                : ""
            }
                        >

                        <span>
                            <strong>Metric</strong>
                            <small>metres (m)</small>
                        </span>

                    </label>

                    <label
                        class="business-demo-settings-option"
                    >

                        <input
                            type="radio"
                            name="businessDemoUnits"
                            value="imperial"
                            ${current === "imperial"
                ? "checked"
                : ""
            }
                        >

                        <span>
                            <strong>Imperial</strong>
                            <small>feet (ft)</small>
                        </span>

                    </label>

                </div>

                <div
                    class="business-demo-settings-actions"
                >

                    <button
                        type="button"
                        data-demo-settings-cancel
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        data-demo-settings-apply
                    >
                        Apply
                    </button>

                </div>

            </div>

        </div>
    `;

        document.body.appendChild(modal);


        // =====================================================
        // BACKDROP → CLOSE
        // =====================================================

        const overlay =
            modal.querySelector(
                ".business-demo-settings-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === overlay
                    ) {
                        closeBusinessDemoSettings();
                    }

                }
            );
        }


        // =====================================================
        // CANCEL
        // =====================================================

        const cancelButton =
            modal.querySelector(
                "[data-demo-settings-cancel]"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function () {

                    closeBusinessDemoSettings();

                }
            );
        }


        // =====================================================
        // APPLY
        // =====================================================

        const applyButton =
            modal.querySelector(
                "[data-demo-settings-apply]"
            );

        if (applyButton) {

            applyButton.addEventListener(
                "click",
                function () {

                    const selected =
                        modal.querySelector(
                            "input[name='businessDemoUnits']:checked"
                        );

                    window.EMFBusinessDemoState.units =
                        selected?.value ||
                        "metric";

                    console.log(
                        "🔥 BUSINESS DEMO UNITS APPLIED",
                        window.EMFBusinessDemoState.units
                    );

                    closeBusinessDemoSettings();

                    updateBusinessDemoHeaderControls();

                    if (
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


        // =====================================================
        // KEYBOARD
        // =====================================================

        activateBusinessDemoSettingsKeyboard();


        // Focus selected radio
        const selectedInput =
            modal.querySelector(
                "input[name='businessDemoUnits']:checked"
            );

        selectedInput?.focus();
    }

    // =========================================================
    // BUSINESS DEMO — DISPLAY UNITS
    // Base Demo dimensions are stored in metric.
    // Conversion is display-only.
    // =========================================================

    function formatBusinessDemoArea(areaM2) {

        console.log(
            "🔥🔥 FORMAT BUSINESS DEMO AREA CALLED",
            {
                areaM2,
                units: window.EMFBusinessDemoState?.units
            }
        );

        const value =
            Number(areaM2);

        if (!Number.isFinite(value)) {
            return "—";
        }

        const units =
            window.EMFBusinessDemoState?.units ||
            "metric";

        console.log(
            "🔥🔥 UNIT CHECK",
            JSON.stringify(units),
            typeof units
        );

        if (String(units).trim().toLowerCase() === "imperial") {

            const ft2 =
                value * 10.7639;

            console.log(
                "🔥🔥 AREA CONVERSION",
                {
                    input: value,
                    units,
                    output: `${ft2.toFixed(1)} ft²`
                }
            );

            return `${ft2.toFixed(1)} ft²`;
        }



        return `${value.toFixed(1)} m²`;
    }


    function formatBusinessDemoLength(lengthM) {

        const value =
            Number(lengthM);

        if (!Number.isFinite(value)) {
            return "—";
        }

        const units =
            getProjectUnits?.() ||
            "m";

        if (units === "ft") {

            const ft =
                value * 3.28084;

            return `${ft.toFixed(1)} ft`;
        }

        return `${value.toFixed(1)} m`;
    }


    function openBusinessDemoScale() {

        closeBusinessDemoSettings();

        const current =
            window.EMFBusinessDemoState?.floorScale ||
            "1:100";

        const scales = [
            "1:50",
            "1:100",
            "1:200"
        ];

        const modal =
            document.createElement("div");

        modal.id =
            "businessDemoSettingsModal";

        modal.innerHTML = `
        <div class="business-demo-settings-overlay">

            <div
                class="business-demo-settings-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="businessDemoScaleTitle"
            >

                <div
                    class="business-demo-settings-title"
                    id="businessDemoScaleTitle"
                >
                    Floor Scale
                </div>

                <div class="business-demo-settings-description">
                    Select a demonstration floor scale.
                </div>

                <div class="business-demo-settings-options">

                    ${scales.map(
            scale => `
                            <label
                                class="business-demo-settings-option"
                            >

                                <input
                                    type="radio"
                                    name="businessDemoScale"
                                    value="${scale}"
                                    ${current === scale
                    ? "checked"
                    : ""
                }
                                >

                                <span>
                                    <strong>
                                        ${scale}
                                    </strong>
                                </span>

                            </label>
                        `
        ).join("")}

                </div>

                <div class="business-demo-settings-note">
                    Demo setting only.
                    No real floor calibration is performed.
                </div>

                <div class="business-demo-settings-actions">

                    <button
                        type="button"
                        data-demo-settings-cancel
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        data-demo-settings-apply
                    >
                        Apply
                    </button>

                </div>

            </div>

        </div>
    `;

        document.body.appendChild(modal);


        // -----------------------------------------------------
        // BACKDROP
        // -----------------------------------------------------

        const overlay =
            modal.querySelector(
                ".business-demo-settings-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === overlay
                    ) {
                        closeBusinessDemoSettings();
                    }

                }
            );
        }


        // -----------------------------------------------------
        // CANCEL
        // -----------------------------------------------------

        const cancelButton =
            modal.querySelector(
                "[data-demo-settings-cancel]"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function () {

                    closeBusinessDemoSettings();

                }
            );
        }


        // -----------------------------------------------------
        // APPLY
        // -----------------------------------------------------

        const applyButton =
            modal.querySelector(
                "[data-demo-settings-apply]"
            );

        if (applyButton) {

            applyButton.addEventListener(
                "click",
                function () {

                    const selected =
                        modal.querySelector(
                            "input[name='businessDemoScale']:checked"
                        );

                    window.EMFBusinessDemoState.floorScale =
                        selected?.value ||
                        "1:100";

                    closeBusinessDemoSettings();

                    updateBusinessDemoHeaderControls();

                }
            );
        }


        // -----------------------------------------------------
        // KEYBOARD
        // -----------------------------------------------------

        activateBusinessDemoSettingsKeyboard();


        // Focus selected radio
        const selectedInput =
            modal.querySelector(
                "input[name='businessDemoScale']:checked"
            );

        selectedInput?.focus();
    }


    function updateBusinessDemoHeaderControls() {

        const controls =
            document.querySelector(
                ".project-measurement-controls"
            );

        if (!controls) {
            return;
        }

        const unitStrong =
            controls
                .querySelectorAll(
                    ".project-header-control strong"
                )[0];

        const scaleStrong =
            controls
                .querySelectorAll(
                    ".project-header-control strong"
                )[1];

        if (unitStrong) {

            unitStrong.textContent =
                window.EMFBusinessDemoState.units ===
                    "imperial"
                    ? "Feet"
                    : "Metric";
        }

        if (scaleStrong) {

            scaleStrong.textContent =
                window.EMFBusinessDemoState.floorScale;
        }
    }


    function bindBusinessDemoHeaderControls() {

        const controls =
            document.querySelector(
                ".project-measurement-controls"
            );

        if (!controls) {
            return;
        }

        const unitsButton =
            controls.querySelector(
                ".project-units-edit-btn"
            );

        const scaleButton =
            controls.querySelector(
                ".project-scale-edit-btn"
            );

        if (unitsButton) {

            unitsButton.onclick =
                function () {
                    openBusinessDemoUnits();
                };
        }

        if (scaleButton) {

            scaleButton.onclick =
                function () {
                    openBusinessDemoScale();
                };
        }

        updateBusinessDemoHeaderControls();
    }


    function render(
        project,
        analysis
    ) {

        const root =
            getDemoRoot();

        if (!root) {
            return;
        }

        injectStyles();

        document.body.classList.add(
            "business-demo-active"
        );

        // =========================================================
        // HIDE REAL BUSINESS WORKSPACE DURING DEMO
        // =========================================================

        const demoHideIds = [
            "projectStartScreen",
            "businessWorkflowSection",
            "businessWorkflowBar",
            "businessFloorTabs",
            "businessPlanActions",
            "businessProjectToggles",
            "roomProgressTop",
            "homeWorkflowBar",
            "homeCurrentFloorCard",
            "homeEmptyPlanState"
        ];

        demoHideIds.forEach(id => {

            const el =
                document.getElementById(id);

            if (el) {
                el.dataset.demoPreviousDisplay =
                    el.style.display;

                el.style.display =
                    "none";
            }
        });


        // =========================================================
        // HIDE REAL CANVAS
        // =========================================================

        const realCanvas =
            document.querySelector(
                ".canvas-area"
            );

        if (realCanvas) {

            realCanvas.dataset.demoPreviousDisplay =
                realCanvas.style.display;

            realCanvas.style.display =
                "none";
        }


        // =========================================================
        // HIDE REAL BUSINESS SIDEBAR ACTIONS
        // =========================================================

        document
            .querySelectorAll(
                ".business-only"
            )
            .forEach(el => {

                if (
                    el.id ===
                    "businessDemoWorkspace"
                ) {
                    return;
                }

                el.dataset.demoPreviousDisplay =
                    el.style.display;

                el.style.display =
                    "none";
            });

        const floors =
            project?.floors || [];

        if (!floors.length) {
            root.innerHTML = `
                <div class="bd-demo-shell">
                    <div class="bd-demo-note">
                        Business Demo data is not available.
                    </div>
                </div>
            `;
            root.style.display = "block";
            return;
        }

        if (
            currentFloorIndex >=
            floors.length
        ) {
            currentFloorIndex = 0;
        }

        const floor =
            floors[currentFloorIndex];

        const stats = {
            floors: floors.length,

            rooms:
                project?.rooms?.length ||
                floors.reduce(
                    (sum, f) =>
                        sum +
                        (f.rooms?.length || 0),
                    0
                ),

            measurements: 24,

            sources: 10,

            coverage:
                analysis?.coverage_percent ??
                79
        };

        root.innerHTML = `

            <div class="bd-demo-shell">

                <!-- DEMO HEADER -->

                <div class="bd-demo-banner">

                    <div class="bd-demo-banner-left">

                        <div class="bd-demo-kicker">
                            PROFESSIONAL ASSESSMENT DEMO
                        </div>

                        <h2 class="bd-demo-title">
                            ${esc(
            project.name ||
            "Example Professional Assessment"
        )}
                        </h2>

                        <div class="bd-demo-subtitle">
                            Explore an example EMF assessment
                            for a professional workspace.
                        </div>

                        <div class="bd-demo-readonly">
                            🔒 Read-only demo
                        </div>

                    </div>

                    <button
    type="button"
    class="bd-demo-cta"
    onclick="window.location.href='dashboard.html#businessPricingGrid';"
>
    Become a Professional →
</button>

                </div>


                <!-- STATS -->

                <div class="bd-stat-grid">

                    <div class="bd-stat-card">
                        <div class="bd-stat-label">
                            Floors
                        </div>
                        <div class="bd-stat-value">
                            ${stats.floors}
                        </div>
                    </div>

                    <div class="bd-stat-card">
                        <div class="bd-stat-label">
                            Rooms
                        </div>
                        <div class="bd-stat-value">
                            ${stats.rooms}
                        </div>
                    </div>

                    <div class="bd-stat-card">
                        <div class="bd-stat-label">
                            Measurements
                        </div>
                        <div class="bd-stat-value">
                            ${stats.measurements}
                        </div>
                    </div>

                    <div class="bd-stat-card">
                        <div class="bd-stat-label">
                            EMF Sources
                        </div>
                        <div class="bd-stat-value">
                            ${stats.sources}
                        </div>
                    </div>

                    <div class="bd-stat-card">
                        <div class="bd-stat-label">
                            Coverage
                        </div>
                        <div class="bd-stat-value">
                            ${stats.coverage}%
                        </div>
                    </div>

                </div>


                <!-- MAIN AREA -->

                <div class="bd-layout">

                    <!-- LEFT -->

                    <div>

                        <div class="bd-card">

                            <div class="bd-card-header">

                                <div>
                                    <div class="bd-card-title">
                                        Assessment Floor Plan
                                    </div>

                                    <div class="bd-card-subtitle">
                                        ${esc(
            floor.name ||
            "Current Floor"
        )}
                                    </div>
                                </div>

                                <div
                                    style="
                                        font-size:11px;
                                        color:#667085;
                                    "
                                >
                                    Demo measurements
                                </div>

                            </div>


                            <div class="bd-floor-tabs">
                                ${renderFloorTabs(project)}
                            </div>
                           
                            ${renderRoomVisuals(floor)}

                        </div>


                        <!-- REPORT PREVIEW -->

<div class="bd-card bd-report">

    <div class="bd-card-header">

        <div>
            <div class="bd-card-title">
                Professional Report Preview
            </div>

            <div class="bd-card-subtitle">
                Your assessment is ready for professional reporting
            </div>
        </div>

    </div>

    <div class="bd-report-preview">

        <div class="bd-report-page">

            <!-- REPORT HEADER -->

            <div class="bd-report-header">

                <div>
                    <div class="bd-report-title">
                        EMF Professional Assessment
                    </div>

                    <div
                        style="
                            margin-top:4px;
                            font-size:11px;
                            color:#667085;
                        "
                    >
                        ${esc(
            project.name ||
            "Example Assessment"
        )}
                    </div>
                </div>

                <div class="bd-report-badge">
                    Demo
                </div>

            </div>


            <!-- REPORT CONTENT -->

            <div class="bd-report-section">

                <div class="bd-report-section-title">
                    Assessment Summary
                </div>

                <div class="bd-report-section-subtitle">
                    Key information included in the professional assessment report
                </div>

            </div>


            <!-- REPORT KPI GRID -->

            <div class="bd-report-grid">

                <div class="bd-report-kpi">

                    <div class="bd-report-kpi-label">
                        Coverage
                    </div>

                    <div class="bd-report-kpi-value">
                        ${stats.coverage}%
                    </div>

                </div>


                <div class="bd-report-kpi">

                    <div class="bd-report-kpi-label">
                        Rooms Assessed
                    </div>

                    <div class="bd-report-kpi-value">
                        ${stats.rooms}
                    </div>

                </div>


                <div class="bd-report-kpi">

                    <div class="bd-report-kpi-label">
                        EMF Sources
                    </div>

                    <div class="bd-report-kpi-value">
                        ${stats.sources}
                    </div>

                </div>

            </div>


            <!-- REPORT CONTENT PREVIEW -->

            <div class="bd-report-preview-items">

                <div class="bd-report-preview-item">
                    <div class="bd-report-preview-item-icon">
                        ✓
                    </div>

                    <div>
                        <div class="bd-report-preview-item-title">
                            Property Overview
                        </div>

                        <div class="bd-report-preview-item-text">
                            Property, floor and room assessment summary
                        </div>
                    </div>
                </div>


                <div class="bd-report-preview-item">
                    <div class="bd-report-preview-item-icon">
                        ✓
                    </div>

                    <div>
                        <div class="bd-report-preview-item-title">
                            Floor Plans & Heatmaps
                        </div>

                        <div class="bd-report-preview-item-text">
                            Room layouts, measurements and EMF exposure visualisation
                        </div>
                    </div>
                </div>


                <div class="bd-report-preview-item">
                    <div class="bd-report-preview-item-icon">
                        ✓
                    </div>

                    <div>
                        <div class="bd-report-preview-item-title">
                            Sources & Recommendations
                        </div>

                        <div class="bd-report-preview-item-text">
                            Identified sources and professional recommendations
                        </div>
                    </div>
                </div>

            </div>


            <!-- CTA -->

            <div class="bd-report-cta">

                <div>
                    <div class="bd-report-cta-title">
                        Professional report ready
                    </div>

                    <div class="bd-report-cta-text">
                        Preview the complete assessment report
                    </div>
                </div>

               <button
    type="button"
    class="bd-report-cta-btn"
    onclick="openBusinessDemoReportPreview()"
>
    Preview Professional Report →
</button>

            </div>

        </div>

    </div>

</div>


                        <div class="bd-demo-note">
                            This is example assessment data.
                            It can be explored but cannot be edited,
                            measured, uploaded, or submitted as a real
                            professional assessment.
                        </div>

                    </div>


                    <!-- RIGHT SIDEBAR -->

                    <div>

                        <div class="bd-card">

                            <div class="bd-side-section">

                                <div class="bd-side-heading">
                                    Rooms
                                </div>

                                ${renderRooms(floor)}

                            </div>


                            <div class="bd-side-section">

                                <div class="bd-side-heading">
                                    EMF Sources
                                </div>

                                ${renderSources(
            project,
            floor
        )}

                            </div>


                            <div class="bd-side-section">

                                <div class="bd-side-heading">
                                    Recommendations
                                </div>

                                ${renderRecommendations(project)}

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;

        root.style.display = "block";

        bindBusinessDemoHeaderControls();

        // =========================================================
        // DEMO PAGE SCROLL
        // =========================================================

        root.style.maxHeight = "none";
        root.style.overflow = "visible";

        const mainContent =
            document.querySelector(
                ".main-content"
            );

        if (mainContent) {
            mainContent.style.overflowY = "auto";
            mainContent.style.overflowX = "hidden";
            mainContent.style.height = "auto";
            mainContent.style.maxHeight = "none";
        }

        /*
         * Floor navigation
         */

        root
            .querySelectorAll(
                ".bd-floor-tab"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            currentFloorIndex =
                                Number(
                                    this.dataset.floorIndex
                                );

                            render(
                                project,
                                analysis
                            );
                        }
                    );

                }
            );
    }


    window.renderBusinessDemoWorkspace =
        function (
            project,
            analysis
        ) {

            console.log(
                "🏢 RENDER BUSINESS DEMO WORKSPACE",
                {
                    project,
                    analysis
                }
            );

            render(
                project ||
                window.AppState?.businessDemoProject ||
                {},
                analysis ||
                window.AppState?.businessDemoAnalysis ||
                {}
            );

            // ==================================================
            // SOURCE GROUP EXPAND / COLLAPSE
            // ==================================================

            document
                .querySelectorAll(
                    ".bd-source-expand-btn"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            function () {

                                const group =
                                    this.dataset.sourceGroup;

                                console.log(
                                    "🔥 SOURCE GROUP EXPAND",
                                    group
                                );

                                const groupContainer =
                                    this.closest(
                                        ".bd-source-group"
                                    );

                                if (!groupContainer) {
                                    return;
                                }

                                const extra =
                                    groupContainer.querySelector(
                                        ".bd-source-extra"
                                    );

                                if (!extra) {
                                    return;
                                }

                                const expanded =
                                    this.getAttribute(
                                        "aria-expanded"
                                    ) === "true";

                                extra.style.display =
                                    expanded
                                        ? "none"
                                        : "block";

                                this.setAttribute(
                                    "aria-expanded",
                                    expanded
                                        ? "false"
                                        : "true"
                                );

                                this.textContent =
                                    expanded
                                        ? `+ ${extra.querySelectorAll(".bd-source-row").length} more →`
                                        : "− Show less";

                            }
                        );

                    }
                );

            // ==================================================
            // RECOMMENDATION GROUP EXPAND / COLLAPSE
            // ==================================================

            document
                .querySelectorAll(
                    ".bd-rec-expand-btn"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            function () {

                                console.log(
                                    "🔥 RECOMMENDATIONS EXPAND"
                                );

                                const container =
                                    this.closest(
                                        ".bd-recommendations-list"
                                    );

                                if (!container) {
                                    return;
                                }

                                const extra =
                                    container.querySelector(
                                        ".bd-rec-extra"
                                    );

                                if (!extra) {
                                    return;
                                }

                                const expanded =
                                    this.getAttribute(
                                        "aria-expanded"
                                    ) === "true";

                                extra.style.display =
                                    expanded
                                        ? "none"
                                        : "block";

                                this.setAttribute(
                                    "aria-expanded",
                                    expanded
                                        ? "false"
                                        : "true"
                                );

                                this.textContent =
                                    expanded
                                        ? `+ ${extra.querySelectorAll(".bd-rec-row").length} more →`
                                        : "− Show less";

                            }
                        );

                    }
                );
        };


    window.hideBusinessDemoWorkspace =
        function () {
            document.body.classList.remove(
                "business-demo-active"
            );

            const root =
                document.getElementById(
                    "businessDemoWorkspace"
                );

            if (root) {
                root.style.display =
                    "none";
            }

            // RESTORE MAIN CANVAS AREA AFTER BUSINESS DEMO
            const canvasArea =
                document.querySelector(".canvas-area");

            if (canvasArea) {
                canvasArea.style.display = "";
            }
        };

})();