// =====================
// 🔥 ANALYTICS
// =====================

function calculateMeasurementStats() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {

        return {

            total: 0,

            measured: 0,

            percent: 0
        };
    }

    let total = 0;

    let measured = 0;

    (floor.rooms || [])
        .forEach(room => {

            (room.grid || [])
                .forEach(point => {

                    total++;

                    const m =

                        point.measurements?.[
                        sessionId
                        ];

                    if (!m) {
                        return;
                    }

                    const hasRF =
                        (m.rf || 0) > 0;

                    const hasElectric =
                        (m.electric || 0) > 0;

                    const hasMagnetic =
                        (m.magnetic || 0) > 0;

                    if (

                        hasRF ||
                        hasElectric ||
                        hasMagnetic

                    ) {

                        measured++;
                    }
                });
        });

    const percent =

        total > 0

            ? Math.round(
                (measured / total) * 100
            )

            : 0;

    return {

        total,

        measured,

        percent
    };
}

// =====================
// 🔥 UPDATE ANALYTICS UI
// =====================

function updateAnalyticsUI() {

    const stats =
        calculateMeasurementStats();

    const el =
        document.getElementById(
            "analyticsBox"
        );

    if (!el) {
        return;
    }

    el.innerHTML = `

        <b>Coverage</b><br>

        ${stats.measured}
        /
        ${stats.total}

        measured

        <br><br>

        <div
            style="
                width:100%;
                height:12px;
                background:#222;
                border-radius:8px;
                overflow:hidden;
            "
        >

            <div
                style="
                    width:${stats.percent}%;
                    height:100%;
                    background:lime;
                "
            ></div>

        </div>

        <br>

        ${stats.percent}%
    `;
}

// =====================
// 🔥 EXPORTS
// =====================

// =====================
// 🔥 ROOM ANALYTICS
// =====================

function calculateRoomAnalytics() {

    const floor =
        getCurrentFloor?.();


    if (!floor) {

        return [];
    }


    const rooms =
        Array.isArray(
            floor.rooms
        )
            ? floor.rooms
            : [];


    return rooms.map(
        room => {


            // ==================================================
            // ROOM MEASUREMENT STATS
            //
            // This is the authoritative Room/Zone structure.
            // Zone-owned points are already handled there.
            // ==================================================

            const stats =
                getRoomMeasurementStats(
                    room
                );


            // ==================================================
            // AUTHORITATIVE POINTS
            // ==================================================

            const roomPoints =
                Array.isArray(
                    room.grid
                )
                    ? room.grid
                    : [];


            const roomZones =
                (
                    floor.zones ||
                    []
                ).filter(
                    zone =>
                        zone &&
                        zone.roomId ===
                        room.id
                );


            // ==================================================
            // ACCUMULATORS
            //
            // These are ANALYTICS values only.
            //
            // No Risk decision is made here.
            // ==================================================

            let rfSum =
                0;

            let electricSum =
                0;

            let magneticSum =
                0;


            let rfCount =
                0;

            let electricCount =
                0;

            let magneticCount =
                0;


            // ==================================================
            // ZONE OWNERSHIP
            // ==================================================

            function pointBelongsToZone(
                point
            ) {

                if (!point) {

                    return false;
                }


                if (
                    point.zoneId
                ) {

                    return true;
                }


                return roomZones.some(
                    zone => {

                        if (
                            !Array.isArray(
                                zone.polygon
                            ) ||
                            zone.polygon.length < 3
                        ) {

                            return false;
                        }


                        return pointInPolygon(
                            {
                                x:
                                    point.x,

                                y:
                                    point.y
                            },

                            zone.polygon
                        );
                    }
                );
            }


            // ==================================================
            // ROOM POINTS
            //
            // Only uncovered Room points.
            // ==================================================

            const uncoveredRoomPoints =
                roomPoints.filter(
                    point =>
                        !pointBelongsToZone(
                            point
                        )
                );


            // ==================================================
            // COLLECT ROOM MEASUREMENTS
            // ==================================================

            uncoveredRoomPoints.forEach(
                point => {

                    const status =
                        getMeasurementPointStatus?.(
                            point
                        );


                    if (
                        !status ||
                        status.state ===
                        "notMeasured"
                    ) {

                        return;
                    }


                    const measurement =
                        point.measurements?.[
                        sessionId ||
                        "default"
                        ] || {};


                    if (
                        measurement.rf !==
                        null &&
                        measurement.rf !==
                        undefined &&
                        measurement.rf !== ""
                    ) {

                        rfSum +=
                            Number(
                                measurement.rf
                            ) || 0;

                        rfCount++;
                    }


                    if (
                        measurement.electric !==
                        null &&
                        measurement.electric !==
                        undefined &&
                        measurement.electric !== ""
                    ) {

                        electricSum +=
                            Number(
                                measurement.electric
                            ) || 0;

                        electricCount++;
                    }


                    if (
                        measurement.magnetic !==
                        null &&
                        measurement.magnetic !==
                        undefined &&
                        measurement.magnetic !== ""
                    ) {

                        magneticSum +=
                            Number(
                                measurement.magnetic
                            ) || 0;

                        magneticCount++;
                    }
                }
            );


            // ==================================================
            // COLLECT ZONE MEASUREMENTS
            //
            // Zone has priority and owns its area.
            // ==================================================

            roomZones.forEach(
                zone => {

                    const zonePoints =
                        Array.isArray(
                            zone.grid
                        )
                            ? zone.grid
                            : [];


                    zonePoints.forEach(
                        point => {

                            const status =
                                getMeasurementPointStatus?.(
                                    point
                                );


                            if (
                                !status ||
                                status.state ===
                                "notMeasured"
                            ) {

                                return;
                            }


                            const measurement =
                                point.measurements?.[
                                sessionId ||
                                "default"
                                ] || {};


                            if (
                                measurement.rf !==
                                null &&
                                measurement.rf !==
                                undefined &&
                                measurement.rf !== ""
                            ) {

                                rfSum +=
                                    Number(
                                        measurement.rf
                                    ) || 0;

                                rfCount++;
                            }


                            if (
                                measurement.electric !==
                                null &&
                                measurement.electric !==
                                undefined &&
                                measurement.electric !== ""
                            ) {

                                electricSum +=
                                    Number(
                                        measurement.electric
                                    ) || 0;

                                electricCount++;
                            }


                            if (
                                measurement.magnetic !==
                                null &&
                                measurement.magnetic !==
                                undefined &&
                                measurement.magnetic !== ""
                            ) {

                                magneticSum +=
                                    Number(
                                        measurement.magnetic
                                    ) || 0;

                                magneticCount++;
                            }
                        }
                    );
                }
            );


            // ==================================================
            // AVERAGES
            //
            // Each modality has its own denominator.
            //
            // This is important for partial Profiles.
            // ==================================================

            const avgRF =
                rfCount > 0
                    ? Math.round(
                        rfSum /
                        rfCount
                    )
                    : 0;


            const avgElectric =
                electricCount > 0
                    ? Math.round(
                        electricSum /
                        electricCount
                    )
                    : 0;


            const avgMagnetic =
                magneticCount > 0
                    ? Math.round(
                        magneticSum /
                        magneticCount
                    )
                    : 0;


            // ==================================================
            // RETURN
            //
            // IMPORTANT:
            //
            // risk is intentionally NOT calculated here.
            //
            // Risk Engine will later receive this analytics
            // object together with:
            //
            // - Room type
            // - Zone type
            // - Measurement Profile
            // - RF/E/M values
            // - Sources
            // - Indoor/Outdoor
            // - Exposure duration
            // - Business/Home
            //
            // ==================================================

            return {

                room,

                measured:
                    stats?.measured ||
                    0,

                completed:
                    stats?.completed ||
                    0,

                partial:
                    stats?.partial ||
                    0,

                notMeasured:
                    stats?.notMeasured ||
                    0,

                total:
                    stats?.total ||
                    0,

                coverage:
                    stats?.coverage ||
                    0,

                coveragePercent:
                    stats?.coveragePercent ||
                    0,

                completion:
                    stats?.completion ||
                    0,

                completionPercent:
                    stats?.completionPercent ||
                    0,

                canComplete:
                    stats?.canComplete ===
                    true,

                zoneCount:
                    stats?.zoneCount ||
                    0,

                zoneTotal:
                    stats?.zoneTotal ||
                    0,

                zoneConfirmed:
                    stats?.zoneConfirmed ||
                    0,

                zonePartial:
                    stats?.zonePartial ||
                    0,

                zoneNotMeasured:
                    stats?.zoneNotMeasured ||
                    0,

                avgRF,

                avgElectric,

                avgMagnetic,

                rfCount,

                electricCount,

                magneticCount,

                // Risk is deliberately deferred.
                risk:
                    null
            };
        }
    );
}

// TODO:
// room analytics panel UI
function updateRoomAnalyticsUI() {


}

window.updateRoomAnalyticsUI =
    updateRoomAnalyticsUI;

// TODO:
// implement worst room detection
function getWorstRoom() {

    return null;
}

window.getWorstRoom =
    getWorstRoom;

function getRoomRisk() {

    return "SAFE";
}

window.getRoomRisk =
    getRoomRisk;


window.calculateMeasurementStats =
    calculateMeasurementStats;

window.updateAnalyticsUI =
    updateAnalyticsUI;

window.calculateRoomAnalytics =
    calculateRoomAnalytics;    