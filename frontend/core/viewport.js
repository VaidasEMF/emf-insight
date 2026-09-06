// =====================
// VIEWPORT V3
// =====================
window.EMFViewport = {

    // ==================================================
    // IMAGE
    // ==================================================

    imageWidth: 0,
    imageHeight: 0,

    // ==================================================
    // VIEWPORT
    // ==================================================

    viewportWidth: 0,
    viewportHeight: 0,

    // ==================================================
    // DRAW
    // ==================================================

    drawWidth: 0,
    drawHeight: 0,

    offsetX: 0,
    offsetY: 0,

    // ==================================================
    // SCALE
    // ==================================================

    baseScale: 1,
    zoom: 1,
    scale: 1,

    // ==================================================
    // PAN
    // ==================================================

    panX: 0,
    panY: 0,

    // ==================================================
    // ACTIVE FLOOR
    // ==================================================

    activeFloorId: null,

    // ==================================================
    // UPDATE
    // ==================================================

    // ==================================================
    // UPDATE
    // ==================================================

    update(
        areaWidth,
        areaHeight,
        floor
    ) {

        console.error(
            "🔥🔥🔥 EMFViewport.update CALLED",
            {
                areaWidth,
                areaHeight,

                floorId:
                    floor?.id,

                floorName:
                    floor?.name
            }
        );

        console.trace(
            "🔥🔥🔥 WHO CALLED EMFViewport.update"
        );

        const image =
            floor?.image;

        const imageWidth =
            image?.naturalWidth ||
            image?.width ||
            0;

        const imageHeight =
            image?.naturalHeight ||
            image?.height ||
            0;

        this.viewportWidth =
            Math.max(
                1,
                areaWidth
            );

        this.viewportHeight =
            Math.max(
                1,
                areaHeight
            );

        this.imageWidth =
            imageWidth;

        this.imageHeight =
            imageHeight;

        // ==================================================
        // NO IMAGE
        // ==================================================

        if (
            !imageWidth ||
            !imageHeight
        ) {

            this.drawWidth =
                this.viewportWidth;

            this.drawHeight =
                this.viewportHeight;

            this.offsetX =
                0;

            this.offsetY =
                0;

            this.baseScale =
                1;

            this.scale =
                1;

            this.zoom =
                1;

            this.panX =
                0;

            this.panY =
                0;

            this.activeFloorId =
                floor?.id ??
                null;

            console.warn(
                "⚠️ EMFViewport.UPDATE — NO IMAGE",
                {
                    viewportWidth:
                        this.viewportWidth,

                    viewportHeight:
                        this.viewportHeight
                }
            );

            return;
        }

        // ==================================================
        // DETECT FLOOR CHANGE
        // ==================================================

        const floorChanged =
            this.activeFloorId !==
            (
                floor?.id ??
                null
            );

        // ==================================================
        // FLOOR CHANGE
        // ==================================================
        //
        // Reset zoom/pan only when
        // the actual floor changes.
        //
        // Normal resize must preserve
        // the current zoom/pan.
        //
        // ==================================================

        if (
            floorChanged
        ) {

            this.zoom =
                1;

            this.panX =
                0;

            this.panY =
                0;

            this.activeFloorId =
                floor?.id ??
                null;
        }

        // ==================================================
        // IMAGE RATIO
        // ==================================================

        const imageRatio =
            imageWidth /
            imageHeight;

        const viewportRatio =
            this.viewportWidth /
            this.viewportHeight;

        // ==================================================
        // FIT IMAGE INTO VIEWPORT
        // ==================================================

        let baseDrawWidth;

        let baseDrawHeight;

        if (
            imageRatio >
            viewportRatio
        ) {

            // ----------------------------------------------
            // IMAGE IS WIDER
            // ----------------------------------------------

            baseDrawWidth =
                this.viewportWidth;

            baseDrawHeight =
                this.viewportWidth /
                imageRatio;
        }
        else {

            // ----------------------------------------------
            // IMAGE IS TALLER
            // ----------------------------------------------

            baseDrawHeight =
                this.viewportHeight;

            baseDrawWidth =
                this.viewportHeight *
                imageRatio;
        }

        // ==================================================
        // BASE SCALE
        // ==================================================

        this.baseScale =
            baseDrawWidth /
            imageWidth;

        // ==================================================
        // FINAL SCALE
        // ==================================================

        this.scale =
            this.baseScale *
            this.zoom;

        // ==================================================
        // DRAW SIZE
        // ==================================================

        this.drawWidth =
            imageWidth *
            this.scale;

        this.drawHeight =
            imageHeight *
            this.scale;

        // ==================================================
        // RECALCULATE POSITION
        // ==================================================

        this.recalculate();

        // ==================================================
        // DEBUG
        // ==================================================

        console.error(
            "🔥🔥🔥 VIEWPORT UPDATE",
            {
                floorId:
                    floor?.id,

                floorName:
                    floor?.name,

                floorChanged,

                imageWidth,

                imageHeight,

                viewportWidth:
                    this.viewportWidth,

                viewportHeight:
                    this.viewportHeight,

                baseScale:
                    this.baseScale,

                zoom:
                    this.zoom,

                scale:
                    this.scale,

                drawWidth:
                    this.drawWidth,

                drawHeight:
                    this.drawHeight,

                offsetX:
                    this.offsetX,

                offsetY:
                    this.offsetY,

                panX:
                    this.panX,

                panY:
                    this.panY
            }
        );
    },

    // ==================================================
    // RECALCULATE
    // ==================================================

    recalculate() {

        if (
            !this.imageWidth ||
            !this.imageHeight
        ) {

            return;
        }

        // ==================================================
        // SCALE
        // ==================================================

        this.scale =
            this.baseScale *
            this.zoom;

        // ==================================================
        // DRAW SIZE
        // ==================================================

        this.drawWidth =
            this.imageWidth *
            this.scale;

        this.drawHeight =
            this.imageHeight *
            this.scale;

        // ==================================================
        // RESET PAN AT FIT
        // ==================================================
        //
        // zoom = 1 is always the clean fitted state.
        //
        // Therefore there must be no residual pan.
        //
        // ==================================================

        if (
            this.zoom <= 1
        ) {

            this.zoom = 1;

            this.panX = 0;
            this.panY = 0;
        }

        // ==================================================
        // CLAMP PAN
        // ==================================================

        this.clampPan();

        // ==================================================
        // CENTER BASE POSITION
        // ==================================================

        const baseOffsetX =
            (
                this.viewportWidth -
                this.drawWidth
            ) / 2;

        const baseOffsetY =
            (
                this.viewportHeight -
                this.drawHeight
            ) / 2;

        // ==================================================
        // FINAL POSITION
        // ==================================================

        this.offsetX =
            baseOffsetX +
            this.panX;

        this.offsetY =
            baseOffsetY +
            this.panY;

        // ==================================================
        // DEBUG
        // ==================================================

        console.error(
            "🔥 RECALCULATE RESULT",
            {
                viewportWidth:
                    this.viewportWidth,

                viewportHeight:
                    this.viewportHeight,

                drawWidth:
                    this.drawWidth,

                drawHeight:
                    this.drawHeight,

                baseOffsetX:
                    baseOffsetX,

                baseOffsetY:
                    baseOffsetY,

                panX:
                    this.panX,

                panY:
                    this.panY,

                finalOffsetX:
                    this.offsetX,

                finalOffsetY:
                    this.offsetY,

                zoom:
                    this.zoom,

                scale:
                    this.scale
            }
        );
    },

    // ==================================================
    // RESET ZOOM
    // ==================================================

    resetZoom() {

        this.zoom = 1;

        this.panX = 0;
        this.panY = 0;

        this.recalculate();

        window.positionMeasurementPopup?.();
    },

    // ==================================================
    // ZOOM AT SCREEN POINT
    // ==================================================

    // ==================================================
    // ZOOM AT SCREEN POINT
    // ==================================================

    zoomAt(
        screenX,
        screenY,
        factor
    ) {

        if (
            !this.imageWidth ||
            !this.imageHeight
        ) {

            return;
        }

        const oldScale =
            this.scale;

        if (
            !oldScale
        ) {

            return;
        }

        // ==================================================
        // WORLD POINT UNDER CURSOR
        // ==================================================

        const worldX =
            (
                screenX -
                this.offsetX
            ) /
            oldScale;

        const worldY =
            (
                screenY -
                this.offsetY
            ) /
            oldScale;

        // ==================================================
        // NEW ZOOM
        // ==================================================
        //
        // 1.0 = FIT / DEFAULT
        //
        // Never zoom out below the
        // initial fitted view.
        //
        // ==================================================

        const newZoom =
            Math.max(
                1,
                Math.min(
                    5,
                    this.zoom *
                    factor
                )
            );

        this.zoom =
            newZoom;

        // ==================================================
        // NEW SCALE
        // ==================================================

        const newScale =
            this.baseScale *
            this.zoom;

        // ==================================================
        // NEW DRAW SIZE
        // ==================================================

        const newDrawWidth =
            this.imageWidth *
            newScale;

        const newDrawHeight =
            this.imageHeight *
            newScale;

        // ==================================================
        // CENTER BASE POSITION
        // ==================================================

        const baseOffsetX =
            (
                this.viewportWidth -
                newDrawWidth
            ) / 2;

        const baseOffsetY =
            (
                this.viewportHeight -
                newDrawHeight
            ) / 2;

        // ==================================================
        // KEEP WORLD POINT
        // UNDER CURSOR
        // ==================================================

        this.panX =
            screenX -
            baseOffsetX -
            worldX *
            newScale;

        this.panY =
            screenY -
            baseOffsetY -
            worldY *
            newScale;

        // ==================================================
        // RECALCULATE
        // ==================================================

        this.recalculate();

        // ==================================================
        // POPUP
        // ==================================================

        window.positionMeasurementPopup?.();

        // ==================================================
        // DEBUG
        // ==================================================

        console.error(
            "🔥 VIEWPORT ZOOM",
            {
                screenX,
                screenY,
                factor,

                zoom:
                    this.zoom,

                scale:
                    this.scale,

                drawWidth:
                    this.drawWidth,

                drawHeight:
                    this.drawHeight,

                offsetX:
                    this.offsetX,

                offsetY:
                    this.offsetY,

                panX:
                    this.panX,

                panY:
                    this.panY
            }
        );
    },

    // ==================================================
    // CLAMP PAN
    // ==================================================
    //
    // Keeps the floor plan inside the viewport.
    //
    // If the image is smaller than the viewport,
    // it stays centered and cannot be panned.
    //
    // If the image is larger than the viewport,
    // its edges can be moved only until they
    // reach the viewport edges.
    //
    // ==================================================

    clampPan() {

        // ==================================================
        // HORIZONTAL
        // ==================================================

        const baseOffsetX =
            (
                this.viewportWidth -
                this.drawWidth
            ) / 2;

        if (
            this.drawWidth <=
            this.viewportWidth
        ) {

            this.panX = 0;

        }
        else {

            const minOffsetX =
                this.viewportWidth -
                this.drawWidth;

            const maxOffsetX =
                0;

            const minPanX =
                minOffsetX -
                baseOffsetX;

            const maxPanX =
                maxOffsetX -
                baseOffsetX;

            this.panX =
                Math.max(
                    minPanX,
                    Math.min(
                        maxPanX,
                        this.panX
                    )
                );
        }

        // ==================================================
        // VERTICAL
        // ==================================================

        const baseOffsetY =
            (
                this.viewportHeight -
                this.drawHeight
            ) / 2;

        if (
            this.drawHeight <=
            this.viewportHeight
        ) {

            this.panY = 0;

        }
        else {

            const minOffsetY =
                this.viewportHeight -
                this.drawHeight;

            const maxOffsetY =
                0;

            const minPanY =
                minOffsetY -
                baseOffsetY;

            const maxPanY =
                maxOffsetY -
                baseOffsetY;

            this.panY =
                Math.max(
                    minPanY,
                    Math.min(
                        maxPanY,
                        this.panY
                    )
                );
        }
    },

    // ==================================================
    // PAN
    // ==================================================

    panBy(
        dx,
        dy
    ) {

        this.panX +=
            dx;

        this.panY +=
            dy;

        // ==================================================
        // APPLY PAN LIMITS
        // ==================================================

        this.clampPan();

        // ==================================================
        // RECALCULATE
        // ==================================================

        this.recalculate();

        // ==================================================
        // POPUP
        // ==================================================

        window.positionMeasurementPopup?.();
    },

    // ==================================================
    // WORLD → SCREEN
    // ==================================================

    worldToScreen(
        x,
        y
    ) {

        return {

            x:
                this.offsetX +
                x *
                this.scale,

            y:
                this.offsetY +
                y *
                this.scale
        };
    },

    // ==================================================
    // SCREEN → WORLD
    // ==================================================

    screenToWorld(
        x,
        y
    ) {

        if (
            !this.scale
        ) {

            return {
                x: 0,
                y: 0
            };
        }

        return {

            x:
                (
                    x -
                    this.offsetX
                ) /
                this.scale,

            y:
                (
                    y -
                    this.offsetY
                ) /
                this.scale
        };
    },

    // ==================================================
    // WORLD POINT
    // ==================================================

    worldPoint(
        p
    ) {

        if (
            !p
        ) {

            return {
                x: 0,
                y: 0
            };
        }

        return this.worldToScreen(
            p.x,
            p.y
        );
    },

    // ==================================================
    // EVENT → WORLD
    // ==================================================

    canvasToWorld(
        evt,
        canvas
    ) {

        const rect =
            canvas.getBoundingClientRect();

        const screenX =
            evt.clientX -
            rect.left;

        const screenY =
            evt.clientY -
            rect.top;

        return this.screenToWorld(
            screenX,
            screenY
        );
    },

    // ==================================================
    // EVENT → SCREEN
    // ==================================================

    screenPoint(
        evt,
        canvas
    ) {

        const rect =
            canvas.getBoundingClientRect();

        return {

            x:
                evt.clientX -
                rect.left,

            y:
                evt.clientY -
                rect.top
        };
    },

    // ==================================================
    // ALIAS
    // ==================================================

    wp(
        p
    ) {

        return this.worldPoint(
            p
        );
    },

    // ==================================================
    // WORLD POINTS
    // ==================================================

    worldPoints(
        points
    ) {

        return (
            points || []
        ).map(
            p =>
                this.worldPoint(
                    p
                )
        );
    },

    // ==================================================
    // DRAW POLYGON
    // ==================================================

    drawPolygon(
        ctx,
        points
    ) {

        if (
            !points?.length
        ) {

            return;
        }

        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        ctx.closePath();
    },

    // ==================================================
    // CENTER
    // ==================================================

    center(
        points
    ) {

        if (
            !points?.length
        ) {

            return {
                x: 0,
                y: 0
            };
        }

        return {

            x:
                points.reduce(
                    (
                        sum,
                        p
                    ) =>
                        sum + p.x,
                    0
                ) /
                points.length,

            y:
                points.reduce(
                    (
                        sum,
                        p
                    ) =>
                        sum + p.y,
                    0
                ) /
                points.length
        };
    },

    // ==================================================
    // SCREEN CENTER
    // ==================================================

    screenCenter(
        points
    ) {

        return this.worldPoint(
            this.center(
                points
            )
        );
    },

    // ==================================================
    // PLAN BOUNDS
    // ==================================================
    //
    // Returns the CURRENT visible floor-plan image
    // bounds in CANVAS / SCREEN coordinates.
    //
    // IMPORTANT:
    // These values MUST match the image actually
    // drawn on the canvas.
    //
    // ==================================================

    planBounds() {

        return {

            left:
                this.offsetX,

            top:
                this.offsetY,

            right:
                this.offsetX +
                this.drawWidth,

            bottom:
                this.offsetY +
                this.drawHeight
        };
    },

    // ==================================================
    // OUTDOOR PLACEMENT BOUNDS
    // ==================================================
    //
    // Visual placement area around the floor-plan image.
    //
    // IMPORTANT:
    // - This is NOT geographic space.
    // - This is NOT real distance.
    // - Outdoor sources may only be placed outside
    //   the floor-plan image.
    // - The placement area MUST remain inside the canvas.
    //
    // ==================================================

    outdoorBounds(
        paddingRatio = 0.20
    ) {

        const plan =
            this.planBounds();

        if (!plan) {
            return null;
        }

        // ------------------------------------------------
        // CANVAS BOUNDS
        // ------------------------------------------------

        const canvasWidth =
            this.viewportWidth;

        const canvasHeight =
            this.viewportHeight;

        if (
            !canvasWidth ||
            !canvasHeight
        ) {
            return null;
        }


        // ------------------------------------------------
        // PLAN SIZE
        // ------------------------------------------------

        const planWidth =
            plan.right -
            plan.left;

        const planHeight =
            plan.bottom -
            plan.top;


        // ------------------------------------------------
        // DESIRED OUTDOOR PADDING
        // ------------------------------------------------

        const desiredPadX =
            planWidth *
            paddingRatio;

        const desiredPadY =
            planHeight *
            paddingRatio;


        // ------------------------------------------------
        // AVAILABLE CANVAS SPACE
        // ------------------------------------------------

        const availableLeft =
            plan.left;

        const availableTop =
            plan.top;

        const availableRight =
            canvasWidth -
            plan.right;

        const availableBottom =
            canvasHeight -
            plan.bottom;


        // ------------------------------------------------
        // USE THE AVAILABLE SPACE
        //
        // We never allow the virtual outdoor area
        // to extend outside the actual canvas.
        // ------------------------------------------------

        const padLeft =
            Math.min(
                desiredPadX,
                availableLeft
            );

        const padTop =
            Math.min(
                desiredPadY,
                availableTop
            );

        const padRight =
            Math.min(
                desiredPadX,
                availableRight
            );

        const padBottom =
            Math.min(
                desiredPadY,
                availableBottom
            );


        // ------------------------------------------------
        // RESULT
        // ------------------------------------------------

        return {

            left:
                plan.left -
                padLeft,

            top:
                plan.top -
                padTop,

            right:
                plan.right +
                padRight,

            bottom:
                plan.bottom +
                padBottom
        };
    },
};