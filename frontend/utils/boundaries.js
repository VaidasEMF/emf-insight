// =====================
// BOUNDARIES
// =====================

window.Boundaries = {

    // ==================================================
    // PLAN
    // ==================================================
    isInsidePlan(worldPoint) {

        if (
            !worldPoint ||
            typeof worldPoint.x !== "number" ||
            typeof worldPoint.y !== "number"
        ) {
            return false;
        }


        const b =
            EMFViewport.planBounds();


        if (!b) {
            return false;
        }


        // ==================================================
        // WORLD → SCREEN
        // ==================================================

        const screenPoint =
            typeof EMFViewport?.worldPoint ===
                "function"

                ? EMFViewport.worldPoint(
                    worldPoint
                )

                : null;


        if (!screenPoint) {
            return false;
        }


        // ==================================================
        // CHECK SCREEN POINT AGAINST PLAN BOUNDS
        // ==================================================

        return (

            screenPoint.x >=
            b.left &&

            screenPoint.x <=
            b.right &&

            screenPoint.y >=
            b.top &&

            screenPoint.y <=
            b.bottom
        );
    },


    // ==================================================
    // OUTDOOR PLACEMENT ZONE
    //
    // World-space area surrounding the floor-plan image.
    //
    // IMPORTANT:
    // This is NOT a real geographic distance.
    //
    // It only defines where an outdoor source icon
    // may be visually placed around the plan.
    // ==================================================

    outdoorBounds(paddingRatio = 0.20) {

        const b =
            EMFViewport.planBounds();

        if (!b) {
            return null;
        }

        const width =
            b.right - b.left;

        const height =
            b.bottom - b.top;

        const padX =
            width * paddingRatio;

        const padY =
            height * paddingRatio;

        return {

            left:
                b.left - padX,

            top:
                b.top - padY,

            right:
                b.right + padX,

            bottom:
                b.bottom + padY
        };
    },


    // ==================================================
    // OUTDOOR
    //
    // TRUE OUTDOOR PLACEMENT:
    //
    // inside the surrounding placement area
    // BUT outside the actual floor-plan image.
    // ==================================================

    // =====================
    // 🔥 OUTDOOR
    // =====================

    isInsideOutdoor(point) {

        if (!point) {
            return false;
        }

        const screenPoint =
            EMFViewport.worldToScreen(
                point.x,
                point.y
            );

        const plan =
            EMFViewport.planBounds();

        const outdoor =
            EMFViewport.outdoorBounds(
                0.20
            );

        if (
            !screenPoint ||
            !plan ||
            !outdoor
        ) {
            return false;
        }

        // ==================================================
        // MUST BE INSIDE THE CANVAS OUTDOOR AREA
        // ==================================================

        const insideOutdoorRectangle =

            screenPoint.x >= outdoor.left &&
            screenPoint.x <= outdoor.right &&

            screenPoint.y >= outdoor.top &&
            screenPoint.y <= outdoor.bottom;

        if (
            !insideOutdoorRectangle
        ) {
            return false;
        }

        // ==================================================
        // MUST BE OUTSIDE THE ACTUAL FLOOR PLAN
        // ==================================================

        const insidePlan =

            screenPoint.x >= plan.left &&
            screenPoint.x <= plan.right &&

            screenPoint.y >= plan.top &&
            screenPoint.y <= plan.bottom;

        if (
            insidePlan
        ) {
            return false;
        }

        return true;
    },

    // =====================
    // 🔥 CLAMP TO OUTDOOR
    // =====================

    clampOutdoorPoint(
        point,
        iconSize = 36
    ) {

        if (!point) {
            return null;
        }

        const outdoor =
            EMFViewport.outdoorBounds(
                0.20
            );

        const plan =
            EMFViewport.planBounds();

        if (
            !outdoor ||
            !plan
        ) {
            return point;
        }

        // ==================================================
        // WORLD → SCREEN
        //
        // Bounds are screen-space.
        // ==================================================

        const p =
            EMFViewport.worldPoint(
                point
            );

        const pad =
            iconSize / 2 + 4;

        // ==================================================
        // FIRST CLAMP TO OUTER 20% REGION
        // ==================================================

        let x =
            Math.max(
                outdoor.left + pad,
                Math.min(
                    p.x,
                    outdoor.right - pad
                )
            );

        let y =
            Math.max(
                outdoor.top + pad,
                Math.min(
                    p.y,
                    outdoor.bottom - pad
                )
            );

        // ==================================================
        // DO NOT ALLOW THE ICON INSIDE THE FLOOR PLAN
        // ==================================================

        const insidePlan =

            x >= plan.left &&
            x <= plan.right &&

            y >= plan.top &&
            y <= plan.bottom;

        if (insidePlan) {

            const distances = {

                left:
                    x - plan.left,

                right:
                    plan.right - x,

                top:
                    y - plan.top,

                bottom:
                    plan.bottom - y
            };

            let nearestSide =
                "left";

            let nearestDistance =
                distances.left;

            for (
                const side in distances
            ) {

                if (
                    distances[side] <
                    nearestDistance
                ) {

                    nearestSide =
                        side;

                    nearestDistance =
                        distances[side];
                }
            }

            // --------------------------------------------------
            // Push the icon just outside the nearest plan edge.
            // --------------------------------------------------

            if (
                nearestSide ===
                "left"
            ) {

                x =
                    plan.left -
                    pad;
            }

            else if (
                nearestSide ===
                "right"
            ) {

                x =
                    plan.right +
                    pad;
            }

            else if (
                nearestSide ===
                "top"
            ) {

                y =
                    plan.top -
                    pad;
            }

            else if (
                nearestSide ===
                "bottom"
            ) {

                y =
                    plan.bottom +
                    pad;
            }
        }

        // ==================================================
        // SCREEN → WORLD
        // ==================================================

        return EMFViewport.screenToWorld(
            x,
            y
        );
    },


    // ==================================================
    // FIND ROOM
    // ==================================================

    findRoomAt(point) {

        const floor =
            getCurrentFloor?.();

        if (!floor) {
            return null;
        }

        for (
            const room
            of floor.rooms || []
        ) {

            if (
                window.pointInPolygon(
                    point,
                    room.polygon
                )
            ) {

                return room;
            }
        }

        return null;
    },


    // ==================================================
    // FIND ZONE
    // ==================================================

    findZoneAt(point) {

        const floor =
            getCurrentFloor?.();

        if (!floor) {
            return null;
        }

        for (
            const zone
            of floor.zones || []
        ) {

            if (
                window.pointInPolygon(
                    point,
                    zone.polygon
                )
            ) {

                return zone;
            }
        }

        return null;
    }

};