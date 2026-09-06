console.log(
    "DRAW SOURCE LINKS"
);

function findNearestZone(
    source
) {

    return Boundaries.findZoneAt({

        x: source.x,

        y: source.y

    });
}

console.log(
    "REGISTERING findNearestZone"
);

window.findNearestZone =
    findNearestZone;

function calculateRealDistance(
    source,
    zone
) {

    const dx =
        source.x - zone.x;

    const dy =
        source.y - zone.y;

    const centerDistance =

        Math.hypot(
            dx,
            dy
        );

    // =====================
    // 🔥 OBJECT RADII
    // =====================

    const sourceMeta =

        OBJECT_CONFIGS[
        source.type
        ];

    const zoneMeta =

        OBJECT_CONFIGS[
        zone.type
        ];

    const sourceRadius =

        (sourceMeta?.width || 40) / 2;

    const zoneRadius =

        (zoneMeta?.width || 40) / 2;

    // =====================
    // 🔥 EDGE DISTANCE
    // =====================

    const pixelDistance =

        Math.max(

            0,

            centerDistance -

            sourceRadius -

            zoneRadius
        );

    const floor =
        getCurrentFloor?.();

    const scale =
        floor?.currentScale || 1;

    return pixelDistance * scale;
}

function getDistanceCategory(
    meters
) {

    // =====================
    // 🔥 INVALID
    // =====================

    if (
        meters == null ||
        isNaN(meters)
    ) {

        return "MODERATE";
    }

    // =====================
    // 🔥 VERY CLOSE
    // =====================

    if (meters < 1) {

        return "EXTREME";
    }

    // =====================
    // 🔥 CLOSE
    // =====================

    if (meters < 3) {

        return "VERY CLOSE";
    }

    // =====================
    // 🔥 NEAR
    // =====================

    if (meters < 10) {

        return "CLOSE";
    }

    // =====================
    // 🔥 MID
    // =====================

    if (meters < 30) {

        return "MODERATE";
    }

    // =====================
    // 🔥 FAR
    // =====================

    if (meters < 100) {

        return "LOW";
    }

    // =====================
    // 🔥 DISTANT
    // =====================

    if (meters < 300) {

        return "MINIMAL";
    }

    // =====================
    // 🔥 REMOTE
    // =====================

    return "DISTANT";
}

function drawSourceLinks() {

    console.log(
        "DRAW LINKS START"
    );

    console.log(
        "ALL SOURCES:",
        getCurrentFloor()?.sources
    );

    console.log(
        "DISTANCE TYPES:",
        window.DISTANCE_SOURCE_TYPES
    );

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const ctx =
        window.ctx;

    floor.sources.forEach(source => {

        const hoveredId =

            AppState.ui
                ?.hoveredSourceId;

        const hovered =

            hoveredId ===
            source.id;

        console.log(
            "CHECKING:",
            source.type
        );

        console.log(
            "IS INDOOR:",
            source.type,
            window.INDOOR_SOURCE_TYPES?.includes(
                source.type
            )
        );

        console.log(
            "IS OUTDOOR:",
            source.type,
            window.DISTANCE_SOURCE_TYPES?.includes(
                source.type
            )
        );

        console.log(
            "LINKED IDS:",
            source.type,
            source.linkedZoneIds
        );

        const isOutdoor =

            window.DISTANCE_SOURCE_TYPES
                ?.includes(
                    source.type
                );

        const isIndoor =

            window.INDOOR_SOURCE_TYPES
                ?.includes(
                    source.type
                );

        if (

            !isOutdoor &&
            !isIndoor

        ) {
            return;
        }

        const linkedIds =

            source.linkedZoneIds || [];

        if (
            !linkedIds.length
        ) {
            return;
        }

        const isFocused =

            !hoveredId ||

            hoveredId === source.id;


        const isSelected =

            window.objectTool
                ?.selectedObjectId ===
            source.id;

        console.log(
            "SOURCE:",
            source
        );

        const sourceP =
            EMFViewport.worldPoint(
                source
            );

        linkedIds.forEach(

            zoneId => {

                const zone =

                    floor.zones.find(

                        z =>
                            z.id === zoneId
                    );

                if (!zone) {
                    return;
                }

                console.log(
                    "FOUND ZONE:",
                    zone
                );

                const zoneP =
                    EMFViewport.worldPoint(
                        zone
                    );

                // =====================
                // 🔥 SELECTED GLOW
                // =====================

                if (isSelected) {

                    ctx.save();

                    ctx.beginPath();

                    ctx.arc(

                        zoneP.x,
                        zoneP.y,

                        24,

                        0,

                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        "rgba(239,68,68,0.18)";

                    ctx.fill();

                    ctx.restore();
                }

                // =====================
                // 🔥 DASH STYLE
                // =====================

                if (isIndoor) {

                    ctx.setLineDash([4, 4]);

                    ctx.strokeStyle =

                        isFocused
                            ? "rgba(37,99,235,0.95)"
                            : "rgba(147,197,253,0.35)";
                }
                else {

                    ctx.setLineDash([8, 6]);

                    ctx.strokeStyle =

                        isFocused
                            ? "rgba(220,38,38,0.95)"
                            : "rgba(252,165,165,0.25)";
                }

                ctx.lineWidth =

                    isFocused
                        ? 3
                        : 1;

                console.log(
                    "DRAWING LINE:",
                    source.type,
                    source.x,
                    source.y,
                    zoneP.x,
                    zoneP.y,
                );

                ctx.beginPath();

                ctx.moveTo(
                    sourceP.x,
                    sourceP.y
                );

                ctx.lineTo(
                    zoneP.x,
                    zoneP.y
                );

                ctx.stroke();

                // =====================
                // 🔥 ROOM CENTER POINT
                // =====================

                ctx.beginPath();

                if (isFocused) {

                    ctx.shadowBlur = 22;

                    ctx.shadowColor =
                        "#ef4444";
                }

                ctx.fillStyle =

                    isIndoor
                        ? "#2563eb"
                        : "#ef4444";

                ctx.shadowColor =

                    isIndoor
                        ? "rgba(37,99,235,0.45)"
                        : "rgba(239,68,68,0.45)";

                ctx.shadowBlur =
                    12;

                ctx.arc(

                    zoneP.x,
                    zoneP.y,

                    4,

                    0,

                    Math.PI * 2
                );

                ctx.fill();

                // =====================
                // 🔥 DISTANCE
                // =====================

                const meters =

                    calculateRealDistance(
                        source,
                        zone
                    );

                const category =

                    getDistanceCategory(
                        meters
                    );

                // =====================
                // 🔥 LABEL POSITION
                // =====================

                const dx =
                    zoneP.x - sourceP.x;

                const dy =
                    zoneP.y - sourceP.y;

                const dist =
                    Math.hypot(dx, dy);

                let mx =
                    (sourceP.x + zoneP.x) / 2;

                let my =
                    (sourceP.y + zoneP.y) / 2;

                if (dist < 140) {

                    mx += 120;

                    my -= 30;
                }
                else {

                    my -= 40;
                }

                // =====================
                // 🔥 BADGE
                // =====================

                const badgeText =
                    category;

                ctx.font =
                    "bold 13px Inter";

                const textWidth =

                    ctx.measureText(
                        badgeText
                    ).width;

                const boxWidth =
                    textWidth + 28;

                const boxHeight =
                    30;

                ctx.fillStyle =
                    "rgba(255,255,255,0.92)";

                ctx.strokeStyle =
                    "rgba(239,68,68,0.35)";

                ctx.lineWidth =
                    1.5;

                ctx.beginPath();

                ctx.roundRect(

                    mx - boxWidth / 2,

                    my - boxHeight / 2,

                    boxWidth,

                    boxHeight,

                    14
                );

                ctx.fill();

                ctx.stroke();

                ctx.fillStyle =

                    isIndoor
                        ? "#1d4ed8"
                        : "#b91c1c";

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";

                ctx.fillText(

                    badgeText,

                    mx,

                    my + 1
                );



                ctx.setLineDash([]);
            }
        );

        //ctx.restore();

        ctx.setLineDash([]);


    });

    console.log(
        "DRAW LINKS END"
    );
}

window.drawSourceLinks =
    drawSourceLinks;    