// =====================
// 🔥 SOURCE IMPACT LAYER
// =====================

function drawSourceImpactLayer(
    floor
) {

    if (
        !showSourceImpact ||
        !selectedSource
    ) {

        return;
    }

    const radius =

        getSourceRadius(
            selectedSource
        );

    (floor.rooms || []).forEach(room => {

        (room.grid || []).forEach(p => {

            const d =

                distance(

                    selectedSource.x,
                    selectedSource.y,

                    p.x,
                    p.y
                );

            // outside radius
            if (d > radius) {
                return;
            }

            const impact =
                1 - (d / radius);

            // =====================
            // 🔥 COLOR
            // =====================

            let color =
                "rgba(255,255,0,0.10)";

            // medium
            if (impact > 0.35) {

                color =
                    "rgba(255,165,0,0.16)";
            }

            // strong
            if (impact > 0.7) {

                color =
                    "rgba(255,0,0,0.22)";
            }

            // =====================
            // 🔥 DRAW
            // =====================

            const screen =
                EMFViewport.worldPoint(p);

            ctx.beginPath();

            ctx.arc(
                screen.x,
                screen.y,
                14,
                0,
                Math.PI * 2
            );

            ctx.globalAlpha =
                window.sourceOpacity || 0.2;

            ctx.fillStyle =
                color;

            ctx.fill();

            ctx.globalAlpha = 1;

        });

    });

}

// =====================
// 🔥 EXPORTS
// =====================

window.drawSourceImpactLayer =
    drawSourceImpactLayer;