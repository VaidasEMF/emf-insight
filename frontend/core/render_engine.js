
// =====================
// 🔥 RENDER ENGINE
// =====================

window.renderQueued =
    false;

// =====================
// 🔥 REQUEST RENDER
// =====================

function requestRender() {

    console.trace("REQUEST RENDER", {
        canvasW: window.canvas?.width,
        canvasH: window.canvas?.height
    });

    console.log(
        "REQUEST RENDER CALLED"
    );

    console.trace("REQUEST RENDER");


    if (window.renderQueued) {

        window.renderAgain = true;

        return;
    }

    window.renderQueued = true;

    requestAnimationFrame(() => {



        window.renderQueued = false;





        window.renderFrame?.();


        if (window.renderAgain) {

            window.renderAgain = false;

            requestRender();

        }

    });
}


console.error("REQUEST FROM CORE");

window.requestRender =
    requestRender;

// =====================
// 🔥 SAFE STUBS
// =====================

if (
    typeof window.drawRoomsLayer ===
    "undefined"
) {

    window.drawRoomsLayer =
        function () { };
}

if (
    typeof window.drawZonesLayer ===
    "undefined"
) {

    window.drawZonesLayer =
        function () { };
}

if (
    typeof window.drawSourcesLayer ===
    "undefined"
) {

    window.drawSourcesLayer =
        function () { };
}

if (
    typeof window.drawMeasurementsLayer ===
    "undefined"
) {

    window.drawMeasurementsLayer =
        function () { };
}

if (
    typeof window.drawScaleLayer ===
    "undefined"
) {

    window.drawScaleLayer =
        function () { };
}

if (
    typeof window.drawHeatmapLayer ===
    "undefined"
) {

    window.drawHeatmapLayer =
        function () { };
}