// =====================
// 🔥 OVERLAY UI LAYER
// =====================

function drawOverlayUI() {

    console.error("DRAW OVERLAY ENTER");

    console.error(
        "OVERLAY CURRENT",
        window.NotificationBubble.current
    );

    console.error(
        "OVERLAY OBJECT",
        window.NotificationBubble
    );

    const ctx =
        window.ctx;

    const canvas =
        window.canvas;

    if (!ctx || !canvas) {
        return;
    }

    ctx.save();
    // =====================
    // 🔥 NOTIFICATION BUBBLE
    // =====================

    const bubble =
        window.NotificationBubble?.current;

    console.error(
        "CURRENT BUBBLE",
        bubble,
        window.NotificationBubble
    );
    if (bubble) {

        let screen;

        if (bubble.screenPoint) {

            screen =
                bubble.screenPoint;

        }
        else if (bubble.worldPoint) {

            screen =
                EMFViewport.worldPoint(
                    bubble.worldPoint
                );

        }
        else {

            return;

        }

        console.error(
            "BUBBLE SCREEN",
            screen
        );

        // =====================
        // 🔥 BUBBLE SIZE
        // =====================

        const padding = 14;

        ctx.font =
            "bold 15px Arial";

        const textWidth =
            ctx.measureText(
                bubble.text
            ).width;

        const w =

            Math.min(

                320,

                textWidth + 46

            );

        const h = 48;

        // =====================
        // 🔥 POSITION
        // =====================

        let x =
            screen.x - w / 2;

        let y =
            screen.y - 60;

        // =====================
        // 🔥 AUTO FLIP
        // =====================

        if (

            y < 10

        ) {

            y =
                screen.y + 22;

        }

        // =====================
        // 🔥 KEEP INSIDE CANVAS
        // =====================

        x = Math.max(

            10,

            Math.min(

                x,

                canvas.width - w - 10

            )

        );

        y = Math.max(

            10,

            Math.min(

                y,

                canvas.height - h - 10

            )

        );

        ctx.fillStyle =

            bubble.type === "error"

                ? "rgba(239,68,68,0.95)"

                : "rgba(0,0,0,0.85)";

        ctx.beginPath();

        ctx.roundRect(

            x,
            y,
            w,
            h,
            12

        );

        ctx.fill();

        ctx.fillStyle = "#fff";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(

            bubble.text,

            x + 18,

            y + 30

        );

    }


    // =====================
    // 🔥 RESTORE ALWAYS
    // =====================

    ctx.restore();

    // =====================
    // 🔥 SOURCE PREVIEW
    // =====================

    if (

        AppState.ui.mode === "source" &&
        !selectedSource &&
        mouseX !== null &&
        mouseY !== null

    ) {

        const type =

            document.getElementById(
                "sourceType"
            )?.value;

        const icon =
            sourceIcons[type];

        if (icon?.complete) {

            ctx.globalAlpha = 0.7;

            ctx.drawImage(

                icon,

                mouseX - 18,
                mouseY - 18,

                36,
                36
            );

            ctx.globalAlpha = 1;
        }
    }

    // =====================
    // 🔥 MEASURE HELPER
    // =====================

    if (
        AppState.ui.mode === "measure"
    ) {

        let text =
            "📊 Move cursor to grid point";

        if (
            hoveredMeasurePoint
        ) {

            const m =

                hoveredMeasurePoint
                    .measurements?.[
                sessionId
                ] || {};

            text =

                "📍 " +

                hoveredMeasurePoint.id +

                " • RF: " +
                (m.rf || 0) +

                " • E: " +
                (m.electric || 0) +

                " • M: " +
                (m.magnetic || 0);
        }

        // background
        ctx.fillStyle =
            "rgba(0,0,0,0.82)";

        ctx.beginPath();

        ctx.roundRect(
            20,
            canvas.height - 70,
            320,
            44,
            10
        );

        ctx.fill();

        // text
        ctx.fillStyle =
            "white";

        ctx.font =
            "15px Arial";

        ctx.fillText(
            text,
            35,
            canvas.height - 42
        );
    }

    // =====================
    // 🔥 FLOATING FINISH
    // =====================

    const floatingBtn =

        document.getElementById(
            "floatingFinishBtn"
        );

    let activePolygon = null;

    // =====================
    // 🔥 ROOM
    // =====================

    if (

        AppState.ui.mode === "room" &&
        AppState.ui.roomDraft &&
        AppState.ui.roomDraft.polygon &&
        AppState.ui.roomDraft.polygon.length >= 3
    ) {

        activePolygon =
            AppState.ui.roomDraft.polygon;
    }

    // =====================
    // 🔥 ZONE
    // =====================

    if (

        AppState.ui.mode === "zone" &&
        currentZone &&
        currentZone.polygon &&
        currentZone.polygon.length > 0

    ) {

        activePolygon =
            currentZone.polygon;
    }

    // =====================
    // 🔥 POSITION BUTTON
    // =====================

    console.log("OVERLAY STATE", {

        mode: AppState.ui.mode,

        hasDraft:
            !!AppState.ui.roomDraft,

        polygonLength:
            activePolygon?.length || 0,

        hidden:
            floatingBtn?.classList.contains(
                "hidden"
            )

    });

    if (

        floatingBtn &&
        activePolygon &&
        activePolygon.length > 0

    ) {

        console.log("SHOW FLOATING BUTTON");

        const last =

            activePolygon[
            activePolygon.length - 1
            ];

        const p =
            EMFViewport.worldPoint(last);

        console.log("BUTTON POSITION", {
            world: last,
            screen: p
        });

        floatingBtn.style.left =
            (p.x + 18) + "px";

        floatingBtn.style.top =
            (p.y - 18) + "px";

        floatingBtn.classList.remove(
            "hidden"
        );

    } else {

        console.log("HIDE FLOATING BUTTON");

        floatingBtn?.classList.add(
            "hidden"
        );
    }
}

window.drawOverlayUI =
    drawOverlayUI;

