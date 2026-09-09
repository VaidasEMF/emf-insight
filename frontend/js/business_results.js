// ==========================================================
// BUSINESS RESULTS — FREE PREVIEW V1
// ==========================================================

const BUSINESS_RESULTS_API =
    "https://emf-insight.onrender.com";


// ==========================================================
// OPEN RESULTS
// ==========================================================

async function openBusinessResults() {

    const projectId =
        AppState.project?.id;

    if (!projectId) {
        alert("No Business project is currently open.");
        return;
    }

    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (!token) {
        alert("Please sign in again.");
        return;
    }

    console.log(
        "BUSINESS RESULTS — PROJECT:",
        projectId
    );

    try {

        const response =
            await fetch(
                `${BUSINESS_RESULTS_API}/business-analysis/${projectId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const analysis =
            await response.json();

        console.log(
            "BUSINESS RESULTS — ANALYSIS:",
            analysis
        );

        renderBusinessResultsPreview(
            analysis
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

console.log("VIEW RESULTS CLICKED");


// ==========================================================
// PREVIEW UI
// ==========================================================

function renderBusinessResultsPreview(
    analysis
) {

    const coverage =
        analysis.coverage || {};

    const rooms =
        Array.isArray(
            analysis.room_summary
        )
            ? analysis.room_summary
            : [];

    const zones =
        Array.isArray(
            analysis.zone_summary
        )
            ? analysis.zone_summary
            : [];

    const measured =
        coverage.measured_points ?? 0;

    const total =
        coverage.total_points ?? 0;

    const percentage =
        coverage.coverage ?? 0;

    const reportValid =
        analysis.report_status?.valid === true;

    const roomRisks =
        rooms
            .filter(
                room =>
                    room.risk &&
                    room.risk !== "low"
            )
            .slice(0, 3);

    const recommendations =
        roomRisks.length
            ? roomRisks.map(
                room =>
                    `Review measurements in ${room.room}.`
            )
            : [
                "Continue monitoring measured areas.",
            ];

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "businessResultsPreview";

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #f8fafc;
        overflow-y: auto;
        padding: 32px;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
    `;

    overlay.innerHTML = `

        <div style="
            max-width:1100px;
            margin:0 auto;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:28px;
            ">

                <div>

                    <div style="
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:5px;
                    ">
                        EMF Insight
                    </div>

                    <h1 style="
                        margin:0;
                        font-size:28px;
                        color:#111827;
                    ">
                        Business Results
                    </h1>

                    <div style="
                        margin-top:5px;
                        color:#64748b;
                    ">
                        Free Preview
                    </div>

                </div>

                <button
                    onclick="closeBusinessResultsPreview()"
                    style="
                        border:1px solid #d1d5db;
                        background:white;
                        border-radius:8px;
                        padding:10px 16px;
                        cursor:pointer;
                    "
                >
                    ← Back to Survey
                </button>

            </div>


            <!-- ASSESSMENT -->

            <section style="
                background:white;
                border:1px solid #e5e7eb;
                border-radius:12px;
                padding:22px;
                margin-bottom:18px;
            ">

                <h2 style="
                    margin:0 0 18px;
                    font-size:18px;
                ">
                    Assessment Overview
                </h2>

                <div style="
                    display:flex;
                    gap:40px;
                    flex-wrap:wrap;
                ">

                    <div>
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Measurement Coverage
                        </div>

                        <strong style="
                            font-size:25px;
                        ">
                            ${percentage}%
                        </strong>
                    </div>

                    <div>
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Measured Points
                        </div>

                        <strong style="
                            font-size:25px;
                        ">
                            ${measured} / ${total}
                        </strong>
                    </div>

                    <div>
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Assessment
                        </div>

                        <strong style="
                            font-size:16px;
                        ">
                            ${reportValid
                                ? "Ready"
                                : "Not Ready"}
                        </strong>
                    </div>

                </div>

            </section>


            <!-- RISKS -->

            <section style="
                background:white;
                border:1px solid #e5e7eb;
                border-radius:12px;
                padding:22px;
                margin-bottom:18px;
            ">

                <h2 style="
                    margin:0 0 15px;
                    font-size:18px;
                ">
                    Risk Preview
                </h2>

                ${
                    roomRisks.length
                    ? roomRisks.map(
                        room => `
                            <div style="
                                padding:12px 0;
                                border-bottom:1px solid #f1f5f9;
                            ">
                                <strong>
                                    ${room.room}
                                </strong>

                                <span style="
                                    margin-left:12px;
                                    color:#b45309;
                                    text-transform:capitalize;
                                ">
                                    ${room.risk}
                                </span>
                            </div>
                        `
                    ).join("")
                    : `
                        <div style="
                            color:#64748b;
                        ">
                            No elevated room risk identified in this preview.
                        </div>
                    `
                }

            </section>


            <!-- REVIEW -->

            <section style="
                background:white;
                border:1px solid #e5e7eb;
                border-radius:12px;
                padding:22px;
                margin-bottom:18px;
            ">

                <h2 style="
                    margin:0 0 15px;
                    font-size:18px;
                ">
                    Review
                </h2>

                <p style="
                    margin:0;
                    color:#475569;
                    line-height:1.6;
                ">
                    ${
                        total
                            ? `The assessment currently contains ${measured} measured points out of ${total}.`
                            : "No measurement coverage is currently available."
                    }
                </p>

            </section>


            <!-- RECOMMENDATIONS -->

            <section style="
                background:white;
                border:1px solid #e5e7eb;
                border-radius:12px;
                padding:22px;
                margin-bottom:18px;
            ">

                <h2 style="
                    margin:0 0 15px;
                    font-size:18px;
                ">
                    Recommendations
                </h2>

                <ul style="
                    margin:0;
                    padding-left:20px;
                    color:#475569;
                    line-height:1.7;
                ">

                    ${recommendations.map(
                        item =>
                            `<li>${item}</li>`
                    ).join("")}

                </ul>

            </section>


            <!-- PAID REPORT -->

            <section style="
                background:#f1f5f9;
                border-radius:12px;
                padding:22px;
                margin-top:24px;
            ">

                <strong>
                    Expert Analysis
                </strong>

                <p style="
                    margin:8px 0 0;
                    color:#475569;
                ">
                    Detailed risk analysis, findings,
                    recommendations and professional
                    reporting are available with the
                    paid Expert Report.
                </p>

            </section>

        </div>
    `;

    document.body.appendChild(
        overlay
    );
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