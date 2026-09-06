// =====================
// 🔥 LIVE HUD
// =====================

function updateLiveHUD() {

    // =====================
    // 🔥 SESSION
    // =====================

    const s =
        sessions.find(
            x => x.id === sessionId
        );

    const sessionEl =
        document.getElementById(
            "hudSession"
        );

    if (sessionEl) {

        sessionEl.innerHTML =

            "Session: " +

            (s?.name || "-");
    }

    // =====================
    // 🔥 COVERAGE
    // =====================

    const stats =
        calculateMeasurementStats?.();

    const coverageEl =
        document.getElementById(
            "hudCoverage"
        );

    if (

        coverageEl &&
        stats

    ) {

        coverageEl.innerHTML =

            "Coverage: " +

            stats.percent +

            "%";
    }

    // =====================
    // 🔥 WORST ROOM
    // =====================

    const worst =
        getWorstRoom?.();

    const roomEl =
        document.getElementById(
            "hudWorstRoom"
        );

    if (roomEl) {

        roomEl.innerHTML =

            "Worst Room: " +

            (
                worst?.activeRoom?.name ||
                "-"
            );
    }

    // =====================
    // 🔥 RISK
    // =====================

    const riskEl =
        document.getElementById(
            "hudRisk"
        );

    if (

        riskEl &&
        worst

    ) {

        riskEl.innerHTML =

            "Risk: " +

            worst.risk;
    }
}

// =====================
// 🔥 EXPORTS
// =====================

window.updateLiveHUD =
    updateLiveHUD;