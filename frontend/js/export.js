// =====================
// 🔥 EXPORT PNG
// =====================

function exportCanvasImage() {

    if (!canvas) {
        return;
    }

    // =====================
    // 🔥 FILE NAME
    // =====================

    const date =

        new Date()

            .toISOString()

            .slice(0, 19)

            .replaceAll(
                ":",
                "-"
            );

    const fileName =

        "emf-report-" +

        date +

        ".png";

    // =====================
    // 🔥 EXPORT
    // =====================

    const link =
        document.createElement(
            "a"
        );

    link.download =
        fileName;

    link.href =
        canvas.toDataURL(
            "image/png"
        );

    link.click();

    updateStatus?.(
        "🖼 PNG exported"
    );
}

// =====================
// 🔥 BUSINESS PDF
// =====================

function generateBusinessPdf() {

    alert(
        "Business PDF Report coming soon"
    );
}

// =====================
// 🔥 BUSINESS CSV
// =====================

function exportBusinessCsv() {

    alert(
        "Business CSV Export coming soon"
    );
}

// =====================
// 🔥 RESULTS DASHBOARD
// =====================

function openResultsDashboard() {

    console.log(
        AppState.project
    );
}



// =====================
// 🔥 EXPORTS
// =====================

window.exportCanvasImage =
    exportCanvasImage;

window.generateBusinessPdf =
    generateBusinessPdf;

window.exportBusinessCsv =
    exportBusinessCsv;

window.openResultsDashboard =
    openResultsDashboard;