// =====================
// 🔥 ZONE PRIORITIES
// =====================

const ZONE_WEIGHTS = {

    sleep: 2.5,

    work: 1.8,

    relax: 1.2,

    child: 3,
};

// =====================
// 🔥 ROOM CHECK
// =====================

function getRoomOfPoint(
    x,
    y,
    floor
) {

    if (
        !floor?.rooms?.length
    ) {
        return null;
    }

    console.log(
        "🔥 FRONTEND SOURCE → ROOM DEBUG",
        {
            sourceX: x,
            sourceY: y,
            floorName: floor?.name,
            floorIndex: floor?.floorIndex,
            roomCount: floor.rooms.length,
        }
    );

    for (
        const room of floor.rooms
    ) {

        if (
            !room?.polygon
        ) {
            continue;
        }

        const xs =
            room.polygon.map(
                p => p.x
            );

        const ys =
            room.polygon.map(
                p => p.y
            );

        console.log(
            "🔥 ROOM CHECK",
            {
                room: room.name,
                minX: Math.min(...xs),
                maxX: Math.max(...xs),
                minY: Math.min(...ys),
                maxY: Math.max(...ys),
                sourceX: x,
                sourceY: y,
            }
        );

        const inside =
            pointInPolygon(
                {
                    x: x,
                    y: y,
                },
                room.polygon
            );

        console.log(
            "🔥 ROOM RESULT",
            room.name,
            inside
        );

        if (
            inside
        ) {
            return room;
        }
    }

    return null;
}

// =====================
// 🔥 ZONE EXPOSURE
// =====================

function calculateZoneExposure(
    zone,
    floor
) {

    if (
        !zone ||
        !floor
    ) {
        return 0;
    }

    let totalExposure = 0;

    const zoneMeta =

        OBJECT_CONFIGS[
        zone.type
        ];

    const zoneWeight =

        ZONE_WEIGHTS[
        zoneMeta?.zoneType
        ] || 1;

    const zoneRoom =

        getRoomOfPoint(
            zone.x,
            zone.y,
            floor
        );

    // =====================
    // 🔥 ALL SOURCES
    // =====================

    for (
        const source
        of floor.sources
    ) {

        const sourceMeta =

            OBJECT_CONFIGS[
            source.type
            ];

        if (
            !sourceMeta
        ) {
            continue;
        }

        // =====================
        // 🔥 DISTANCE
        // =====================

        const distance =

            Math.hypot(

                source.x - zone.x,

                source.y - zone.y
            );

        const distanceFactor =

            Math.max(
                0,

                1 - (
                    distance /
                    sourceMeta.radius
                )
            );

        if (
            distanceFactor <= 0
        ) {
            continue;
        }

        // =====================
        // 🔥 BASE RISK
        // =====================

        let exposure =

            (
                sourceMeta.risk * 4
            ) *
            distanceFactor;

        // =====================
        // 🔥 HOURS
        // =====================

        exposure *=

            Math.max(
                0.4,

                (
                    zone.hours || 1
                ) / 10
            );

        // =====================
        // 🔥 ZONE PRIORITY
        // =====================

        exposure *=
            zoneWeight;

        // =====================
        // 🔥 ROOM ATTENUATION
        // =====================

        const sourceRoom =

            getRoomOfPoint(
                source.x,
                source.y,
                floor
            );

        if (

            zoneRoom &&

            sourceRoom &&

            zoneRoom.id !==
            sourceRoom.id
        ) {

            exposure *= 0.65;
        }

        // =====================
        // 🔥 OUTDOOR ATTENUATION
        // =====================

        if (
            sourceMeta
                ?.placementType ===
            "outdoor"
        ) {

            exposure *= 0.7;
        }

        totalExposure +=
            exposure;
    }

    return Math.round(
        totalExposure * 10
    ) / 10;
}

// =====================
// 🔥 FLOOR EXPOSURE
// =====================

function calculateFloorExposure(
    floor
) {

    if (
        !floor?.zones?.length
    ) {
        return 0;
    }

    let total = 0;

    for (
        const zone
        of floor.zones
    ) {

        total +=

            calculateZoneExposure(
                zone,
                floor
            );
    }

    return Math.round(
        total /
        floor.zones.length
    );
}

window.calculateFloorExposure =
    calculateFloorExposure;


// =====================
// 🔥 FLOOR EXPOSURE
// =====================

function calculateFloorExposure(
    floor
) {

    if (
        !floor?.zones?.length
    ) {
        return 0;
    }

    let total = 0;

    for (
        const zone
        of floor.zones
    ) {

        total +=

            calculateZoneExposure(
                zone,
                floor
            );
    }

    return Math.round(
        total /
        floor.zones.length
    );
}

window.calculateFloorExposure =
    calculateFloorExposure;

// =====================
// 🔥 HOUSE EXPOSURE
// =====================

function calculateHouseExposure() {

    const floors =

        AppState.project
            .floors;

    if (!floors?.length) {
        return 0;
    }

    let total = 0;

    let count = 0;

    for (
        const floor
        of floors
    ) {

        const score =

            calculateFloorExposure(
                floor
            );

        if (score > 0) {

            total += score;

            count++;
        }
    }

    if (!count) {
        return 0;
    }

    return Math.round(
        total / count
    );
}

window.calculateHouseExposure =
    calculateHouseExposure;


// =====================
// 🔥 FLOOR EXPOSURE
// =====================

function calculateFloorExposure(
    floor
) {

    if (
        !floor?.zones?.length
    ) {
        return 0;
    }

    let total = 0;

    for (
        const zone
        of floor.zones
    ) {

        total +=

            calculateZoneExposure(
                zone,
                floor
            );
    }

    return Math.round(
        total /
        floor.zones.length
    );
}

window.calculateFloorExposure =
    calculateFloorExposure;

// =====================
// 🔥 HOUSE EXPOSURE
// =====================

function calculateHouseExposure() {

    const floors =

        AppState.project
            .floors;

    if (!floors?.length) {
        return 0;
    }

    let total = 0;

    let count = 0;

    for (
        const floor
        of floors
    ) {

        const score =

            calculateFloorExposure(
                floor
            );

        if (score > 0) {

            total += score;

            count++;
        }
    }

    if (!count) {
        return 0;
    }

    return Math.round(
        total / count
    );
}

window.calculateHouseExposure =
    calculateHouseExposure;

function updateLiveAnalysisPanel() {

    const currentFloor =

        AppState.project
            .floors[
        AppState.project
            .currentFloorIndex
        ];

    const selectedId =

        window.objectTool
            ?.selectedObjectId;

    const panel =
        document.getElementById(
            "liveAnalysisPanel"
        );

    if (
        !panel
    ) {
        return;
    }

    if (
        !selectedId
    ) {

        panel.style.display =
            "none";

        return;
    }

    const zone =

        currentFloor.zones.find(
            z => z.id === selectedId
        );

    if (!zone) {

        panel.style.display =
            "none";

        return;
    }

    panel.style.display =
        "block";

    const exposure =

        calculateZoneExposure(
            zone,
            currentFloor
        );

    let label =
        "LOW";

    let color =
        "#22c55e";

    let percent =
        20;

    let hint =

        "Current placement appears relatively safe.";

    if (exposure > 3) {

        label =
            "MODERATE";

        color =
            "#f59e0b";

        percent =
            55;

        hint =

            "Nearby wireless sources may impact this area.";
    }

    if (exposure > 7) {

        label =
            "HIGH";

        color =
            "#ef4444";

        percent =
            82;

        hint =

            "Moving nearby devices farther away could significantly reduce exposure.";
    }

    if (exposure > 12) {

        label =
            "VERY HIGH";

        color =
            "#b91c1c";

        percent =
            100;

        hint =

            "Long-duration exposure may be elevated in this location.";
    }

    document.getElementById(
        "analysisState"
    ).innerText =
        label;

    document.getElementById(
        "analysisState"
    ).style.color =
        color;

    document.getElementById(
        "analysisHint"
    ).innerText =
        hint;

    document.getElementById(
        "analysisBarFill"
    ).style.width =
        percent + "%";

    const objectsWrap =
        document.getElementById(
            "analysisObjects"
        );

    objectsWrap.innerHTML =
        "";

    currentFloor.sources.forEach(source => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "analysisObject";

        row.innerHTML =

            "<span>" +

            OBJECT_CONFIGS[
                source.type
            ].label +

            "</span>" +

            "<span>Approx.</span>";

        objectsWrap.appendChild(
            row
        );
    });
}

function getIndoorDistance(
    source,
    zone
) {

    console.log(
        "SOURCE:",
        source
    );

    console.log(
        "ZONE:",
        zone
    );

    if (
        !source ||
        !zone
    ) {
        return 999;
    }

    const floor =

        getCurrentFloor?.();

    const ceilingHeight =

        floor?.ceilingHeight ||
        2.7;

    const dx =
        source.x - zone.x;

    const dy =
        source.y - zone.y;

    const horizontalPixels =

        Math.sqrt(
            dx * dx +
            dy * dy
        );

    const horizontalMeters =

        horizontalPixels *

        (
            floor?.currentScale ||
            1
        );

    console.log(
        "INDOOR METERS:",
        horizontalMeters
    );

    const sourceFloorIndex =

        source.floorIndex ??

        AppState.project.currentFloorIndex;

    const zoneFloorIndex =

        zone.floorIndex ??

        AppState.project.currentFloorIndex;

    const floorDifference =

        Math.abs(

            sourceFloorIndex -

            zoneFloorIndex
        );

    const verticalMeters =

        floorDifference *

        ceilingHeight;

    const distance3D =

        Math.sqrt(

            horizontalMeters *
            horizontalMeters +

            verticalMeters *
            verticalMeters
        );

    console.log(
        "INDOOR 3D:",
        distance3D
    );

    return distance3D;

    console.log(
        "INDOOR PIXELS:",
        horizontalPixels
    );
}

window.getIndoorDistance =
    getIndoorDistance;


// =====================
// 🔥 GLOBAL EXPORTS
// =====================

window.calculateZoneExposure =
    calculateZoneExposure;