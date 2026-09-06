

// =====================
// 🔥 HEATMAP
// =====================

function drawHeatmapSmooth() {

    ctx.save();

    const floor =
        getCurrentFloor();

    if (!floor) {
        return;
    }

    const rooms =
        floor.rooms || [];

    // =====================
    // 🔥 NO DATA
    // =====================

    const hasMeasurements =

        rooms.some(room =>

            (room.grid || []).some(point =>

                point.measurements?.[
                sessionId
                ]
            )
        );

    if (!hasMeasurements) {
        return;
    }

    const step = 12;

    // =====================
    // 🔥 HEATMAP OPACITY
    // =====================

    ctx.globalAlpha =

        window.heatmapOpacity ||
        0.65;

    // =====================
    // 🔥 GRID LOOP
    // =====================

    for (

        let y = 0;

        y < canvas.height;

        y += step

    ) {

        for (

            let x = 0;

            x < canvas.width;

            x += step

        ) {

            let total = 0;

            // =====================
            // 🔥 POINT INFLUENCE
            // =====================

            rooms.forEach(room => {

                (room.grid || [])
                    .forEach(point => {

                        const val =

                            point.measurements
                            ?.[sessionId]
                            ?.[measureType];

                        if (
                            val === undefined
                        ) {
                            return;
                        }

                        const d =

                            Math.hypot(

                                x - point.x,

                                y - point.y
                            );

                        total +=

                            val *

                            Math.exp(
                                -d / 120
                            );
                    });
            });

            // =====================
            // 🔥 SKIP EMPTY
            // =====================

            if (
                total <= 0
            ) {
                continue;
            }

            // =====================
            // 🔥 DRAW CELL
            // =====================

            ctx.fillStyle =
                getHeatColor(
                    total
                );

            ctx.fillRect(

                x,
                y,

                step,
                step
            );
        }
    }


    ctx.restore();
}

// =====================
// 🔥 EXPORTS
// =====================

window.drawHeatmapSmooth =
    drawHeatmapSmooth;