// =====================
// 🔥 ROOM TOOL V2
// =====================

window.roomTool = {

    active: false,

    points: [],

    rooms: []
};

const ROOM_COLORS = [

    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4"
];

// =====================
// 🔥 START ROOM MODE
// =====================

function startRoomMode() {

    console.log(
        "ROOM MODE ENABLED"
    );

    const floor =
        getCurrentFloor?.();

    if (
        !floor?.scaleConfirmed
    ) {

        alert(
            "Please set floor scale before drawing rooms."
        );

        return;
    }

    // =====================
    // 🔥 MODE
    // =====================

    AppState.ui.mode =
        "rooms";

    // =====================
    // 🔥 TOOLS
    // =====================

    if (window.scaleTool) {

        window.scaleTool.active =
            false;
    }

    if (!window.roomTool) {

        window.roomTool = {};
    }

    window.roomTool.active =
        true;

    window.roomTool.points =
        [];

    // =====================
    // 🔥 CURSOR
    // =====================

    if (window.canvas) {

        canvas.style.cursor =
            "crosshair";
    }

    // 🔥 DRAW ROOM BUTTON

    const btn =
        document.getElementById(
            "btnDrawRooms"
        );

    if (btn) {

        btn.style.background = "";
        btn.style.color = "";
        btn.style.outline = "";
        btn.style.outlineOffset = "";
    }

    // 🔥 FINISH BUTTON

    const finishBtn =
        document.getElementById(
            "btnFinishRoom"
        );

    if (finishBtn) {

        finishBtn.style.display =
            "none";
    }

    // =====================
    // 🔥 STATUS
    // =====================

    const status =
        document.getElementById(
            "statusText"
        );

    if (status) {

        status.innerText =
            "Step 2/4 — Click room corners";
    }

    console.log(
        "ROOM MODE ACTIVE:",
        AppState.ui.mode
    );

    setTimeout(() => {

        console.error(
            "MODE AFTER 100ms:",
            AppState.ui.mode
        );

    }, 100);

    requestRender?.();
}

function openRoomModal(room) {

    AppState.ui.selectedRoom = room;
    // TEMP MIGRATION
    window.selectedRoom = AppState.ui.selectedRoom;

    document.getElementById(
        "modalRoomCodeLabel"
    ).innerText =
        room.code || "";

    document.getElementById(
        "modalRoomName"
    ).value =
        room.name || "";

    document.getElementById(
        "modalRoomDescription"
    ).value =
        room.description || "";

    document.getElementById(
        "roomModal"
    ).style.display =
        "flex";

    document.getElementById(
        "modalRoomName"
    ).select();
}


function saveRoomDetails() {

    if (!selectedRoom) {
        return;
    }

    selectedRoom.name =

        document.getElementById(
            "roomNameInput"
        ).value;

    selectedRoom.description =

        document.getElementById(
            "roomDescriptionInput"
        ).value;

    requestRender?.();

    updateRoomProgressPanel?.();
}


function linesIntersect(

    a,
    b,

    c,
    d
) {

    function ccw(
        p1,
        p2,
        p3
    ) {

        return (

            (p3.y - p1.y)
            *
            (p2.x - p1.x)

            >

            (p2.y - p1.y)
            *
            (p3.x - p1.x)
        );
    }

    return (

        ccw(a, c, d)
        !==
        ccw(b, c, d)

        &&

        ccw(a, b, c)
        !==
        ccw(a, b, d)
    );
}


function isPointInsideRoom(
    point,
    polygon
) {

    let inside = false;

    for (
        let i = 0,
        j = polygon.length - 1;

        i < polygon.length;

        j = i++
    ) {

        const xi =
            polygon[i].x;

        const yi =
            polygon[i].y;

        const xj =
            polygon[j].x;

        const yj =
            polygon[j].y;

        const intersect =

            ((yi > point.y) !==
                (yj > point.y))

            &&

            (
                point.x
                <
                (
                    (xj - xi)
                    *
                    (point.y - yi)
                )
                /
                (yj - yi)
                +
                xi
            );

        if (intersect) {

            inside = !inside;
        }
    }

    return inside;
}

function openRoomModalById(roomId) {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const room =

        window.selectedRoom ||

        floor.rooms?.[0];

    if (!room) {
        return;
    }

    selectedRoom =
        room;

    openRoomModal?.(
        room
    );

    updateRoomProgressPanel?.();

    requestRender?.();
}

window.openRoomModalById =
    openRoomModalById;

// =====================
// 🔥 ROOM CLICK
// =====================

window.roomTool.invalidMessage =
    null;

function handleRoomToolClick(evt) {

    console.error("ROOM TOOL CLICK ENTERED");

    console.log("ROOM CLICK", {

        mode: AppState.ui.mode,

        active: roomTool?.active,

        pointCount: roomTool?.points?.length,

        rooms: getCurrentFloor?.()?.rooms?.length

    });

    const tool =
        window.roomTool;

    const p =
        getCanvasPoint(evt);

    const screen = {

        x:
            evt.clientX -
            canvas.getBoundingClientRect().left,

        y:
            evt.clientY -
            canvas.getBoundingClientRect().top
    };

    console.error(
        "ROOM CLICK",
        {
            screen,
            world: p
        }
    );

    const floor =
        getCurrentFloor?.();

    // =====================
    // 🔥 FINISH BUTTON
    // =====================

    if (
        tool.finishButton
    ) {

        const b =
            tool.finishButton;

        const hit =

            screen.x >= b.x &&
            screen.x <= b.x + b.width &&

            screen.y >= b.y &&
            screen.y <= b.y + b.height;

        if (hit) {

            finishRoomV2();


            return;
        }
    }

    // =====================
    // 🔥 OVERLAP PREVENTION
    // =====================

    const invalid =
        tool.rooms.some(room => {

            // =====================
            // 🔥 POINT INSIDE ROOM
            // =====================

            if (

                isPointInsideRoom(
                    p,
                    room.polygon
                )
            ) {

                return true;
            }

            // =====================
            // 🔥 LINE CROSSING ROOM
            // =====================

            if (
                tool.points.length === 0
            ) {

                return false;
            }

            const prev =
                tool.points[
                tool.points.length - 1
                ];

            const poly =
                room.polygon;

            for (
                let i = 0;
                i < poly.length;
                i++
            ) {

                const a =
                    poly[i];

                const b =
                    poly[
                    (i + 1)
                    %
                    poly.length
                    ];

                const hit =
                    linesIntersect(
                        prev,
                        p,
                        a,
                        b
                    );

                if (hit) {

                    return true;
                }
            }

            return false;
        });

    // =====================
    // 🔥 INVALID
    // =====================

    if (invalid) {

        // =====================
        // 🔥 FUTURE POLYGON CHECK
        // =====================

        if (
            tool.points.length >= 2
        ) {

            const futurePolygon = [

                ...tool.points,
                p
            ];

            const overlapsRoom =

                floor.rooms?.some(room => {

                    if (
                        !room.polygon ||
                        room.polygon.length < 3
                    ) {
                        return false;
                    }

                    return polygonsOverlap(
                        futurePolygon,
                        room.polygon
                    );
                });

            if (overlapsRoom) {

                tool.invalidMessage = {

                    x: p.x + 15,
                    y: p.y,

                    text:
                        "Room would overlap"
                };

                setTimeout(() => {

                    tool.invalidMessage =
                        null;

                    requestRender?.();

                }, 2000);

                requestRender?.();

                return;
            }
        }

        tool.invalidMessage = {

            x: p.x + 14,
            y: p.y + 12,

            text:
                "Cannot overlap existing room"
        };

        setTimeout(() => {

            tool.invalidMessage =
                null;

            requestRender?.();

        }, 2000);

        requestRender?.();

        return;
    }

    // =====================
    // 🔥 VALID
    // =====================

    tool.invalidMessage =
        null;

    tool.finishButton =
        null;

    // =====================
    // 🔥 SELF INTERSECTION
    // =====================

    if (
        tool.points.length >= 3
    ) {

        for (
            let i = 0;
            i < tool.points.length - 1;
            i++
        ) {

            const a =
                tool.points[i];

            const b =
                tool.points[i + 1];

            const lastPoint =

                tool.points[
                tool.points.length - 1
                ];

            // 🔥 skip adjacent edge

            if (

                a === lastPoint ||

                b === lastPoint

            ) {

                continue;
            }

            if (
                linesIntersect(
                    a,
                    b,
                    lastPoint,
                    p
                )
            ) {

                console.log(
                    "SELF INTERSECTION"
                );

                tool.invalidMessage = {

                    text:
                        "Room cannot cross itself"
                };

                setTimeout(() => {

                    tool.invalidMessage =
                        null;

                    requestRender?.();

                }, 2000);

                requestRender?.();

                return;
            }
        }
    }


    // =====================
    // 🔥 SELF CROSS CHECK
    // =====================

    if (
        tool.points.length >= 2
    ) {

        const lastPoint =
            tool.points[
            tool.points.length - 1
            ];

        for (
            let i = 0;
            i < tool.points.length - 2;
            i++
        ) {

            const wallA =
                tool.points[i];

            const wallB =
                tool.points[i + 1];

            if (

                linesIntersect(

                    wallA,
                    wallB,

                    lastPoint,
                    p
                )

            ) {

                tool.invalidMessage = {

                    x: p.x + 15,
                    y: p.y,

                    text:
                        "Rooms cannot overlap"
                };

                setTimeout(() => {

                    tool.invalidMessage =
                        null;

                    requestRender?.();

                }, 2000);

                requestRender?.();

                return;
            }
        }
    }

    // =====================
    // 🔥 BLOCK POINT INSIDE ROOM
    // =====================

    const blocked =

        floor.rooms?.some(room => {

            if (
                !room.polygon ||
                room.polygon.length < 3
            ) {
                return false;
            }

            const inside =

                isPointInsideRoom(
                    p,
                    room.polygon
                );

            if (inside) {

                console.log(
                    "ROOM INSIDE HIT:",
                    room.code
                );

                console.log(
                    "POINT:",
                    p
                );

                console.log(
                    "ROOM:",
                    room
                );
            }

            return inside;
        });

    if (blocked) {

        tool.invalidMessage = {

            text:
                "Cannot place point inside room"
        };

        setTimeout(() => {

            tool.invalidMessage =
                null;

            requestRender?.();

        }, 2000);

        requestRender?.();

        return;
    }


    for (
        let i = 0;
        i < tool.points.length - 1;
        i++
    ) {

        const a =
            tool.points[i];

        const b =
            tool.points[i + 1];

        const lastPoint =

            tool.points[
            tool.points.length - 1
            ];

        // kaimyninės kraštinės
        // negali būti laikomos susikirtimu

        if (

            a === lastPoint ||

            b === lastPoint

        ) {

            continue;
        }

        if (
            linesIntersect(
                a,
                b,
                tool.points[
                tool.points.length - 1
                ],
                p
            )
        ) {

            console.log(
                "SELF INTERSECTION"
            );

            console.log(
                "OLD SEGMENT:",
                a,
                b
            );

            console.log(
                "NEW SEGMENT:",
                tool.points[
                tool.points.length - 1
                ],
                p
            );

            tool.invalidMessage = {

                text:
                    "Cannot cross room walls"
            };

            setTimeout(() => {

                tool.invalidMessage =
                    null;

                requestRender?.();

            }, 2000);

            requestRender?.();

            return;
        }
    }

    console.error(
        "POINT BEFORE SAVE",
        p
    );

    // =====================
    // 🔥 PLAN BOUNDARY
    // =====================

    console.error(
        "PLAN CHECK",
        {
            point: p,
            inside: Boundaries.isInsidePlan(p)
        }
    );

    if (

        !Boundaries.isInsidePlan(p)

    ) {

        const screenPoint =
            EMFViewport.screenPoint(
                evt,
                window.canvas
            );

        NotificationBubble.show({

            text:
                "Room must stay inside floor plan",

            screenPoint,

            type: "error"

        });

        return;
    }

    console.error(
        "ROOM TOOL IDENTITY CHECK",
        {
            tool,
            windowRoomTool: window.roomTool,
            sameObject:
                tool === window.roomTool,
            toolPoints:
                tool?.points,
            windowPoints:
                window.roomTool?.points
        }
    );

    tool.points.push(p);

    setTimeout(() => {

        console.error(
            "🔥 POINTS AFTER 100ms",
            {
                mode:
                    AppState.ui.mode,

                active:
                    roomTool?.active,

                points:
                    roomTool?.points,

                length:
                    roomTool?.points?.length
            }
        );

    }, 100);

    console.log(
        "POINT ADDED",
        tool.points.length
    );

    console.error(
        "ZONE POINTS:",
        tool.points
    );


    console.error("TOOL POINTS:", tool.points);

    console.log(
        "DRAW TOOL POINTS:",
        tool.points.length
    );

    console.log(
        "ROOM POINT:",
        p
    );

    requestRender?.();
}

// =====================
// 🔥 FINISH ROOM
// =====================

function finishRoomV2() {



    const tool =
        window.roomTool;

    const floor =
        getCurrentFloor?.();



    // =====================
    // 🔥 SAFETY
    // =====================

    if (!tool) {

        console.error(
            "NO ROOM TOOL"
        );

        return;
    }

    if (!floor) {

        console.error(
            "NO FLOOR"
        );

        return;
    }

    if (!Array.isArray(
        floor.rooms
    )) {

        floor.rooms = [];
    }

    tool.invalidMessage =
        null;

    // =====================
    // 🔥 VALIDATE POINTS
    // =====================

    if (
        tool.points.length < 3
    ) {

        console.warn(
            "NOT ENOUGH POINTS"
        );

        return;
    }

    // =====================
    // 🔥 FINAL POLYGON
    // =====================

    const finalPolygon =
        [...tool.points];

    console.log("================================");

    console.log("ROOM FINISH");

    console.log("POINT COUNT:",
        tool.points.length
    );

    console.log(
        "POINTS:",
        JSON.parse(
            JSON.stringify(tool.points)
        )
    );

    console.log(
        "ROOMS:",
        floor.rooms.map(r => ({
            code: r.code,
            points: r.polygon.length
        }))
    );

    console.log("================================");

    // =====================
    // 🔥 ROOM OVERLAP
    // =====================

    console.log(
        "CHECKING OVERLAP..."
    );

    const overlaps =

        (floor?.rooms || [])
            .some(room => {

                return (
                    room?.polygon || []
                ).some(point =>

                    isPointInsideRoom?.(
                        point,
                        finalPolygon
                    )
                );
            });

    if (overlaps) {

        console.log(
            "OVERLAP DETECTED"
        );

        console.log(
            "NEW ROOM:",
            finalPolygon
        );

        console.log(
            "EXISTING:",
            floor.rooms
        );

        console.error(
            "ROOM OVERLAP"
        );

        tool.invalidMessage = {

            x:
                finalPolygon[0]?.x + 20,

            y:
                finalPolygon[0]?.y + 20,

            text:
                "ROOM OVERLAP"
        };

        setTimeout(() => {

            tool.invalidMessage =
                null;

            requestRender?.();

        }, 2000);

        requestRender?.();

        return;
    }


    // =====================
    // 🔥 ROOM CENTER
    // =====================



    const roomNumber =
        floor.rooms.length + 1;

    const centerX =
        tool.points.reduce(
            (s, p) => s + p.x,
            0
        ) / tool.points.length;

    const centerY =
        tool.points.reduce(
            (s, p) => s + p.y,
            0
        ) / tool.points.length;

    console.error(
        "POINTS BEFORE SAVE:",
        tool.points
    );

    const room = {

        id:
            window.PhiIdFactory
                ?.createRoomId?.() ||
            (
                "room_" +
                Date.now()
            ),

        code:
            "R" + roomNumber,

        name:
            "Room " + roomNumber,

        description:
            "",

        color:
            ROOM_COLORS[
            floor.rooms.length %
            ROOM_COLORS.length
            ],

        center: {

            x: centerX,

            y: centerY
        },

        polygon:
            [...tool.points]
    };

    console.log("===== ROOM SAVE =====");

    console.log(
        "Canvas:",
        canvas.width,
        canvas.height
    );

    console.log(
        "Image:",
        window.planImage?.width,
        window.planImage?.height
    );

    console.log(
        "Room polygon:",
        room.polygon
    );

    floor.rooms.push(room);

    console.error(
        "ROOM SAVED",
        JSON.stringify(room, null, 2)
    );

    console.error(
        "ROOM COUNT",
        floor.rooms.length
    );

    console.error(
        "ROOMS AFTER ADD",
        floor.rooms.map(
            r => ({
                code: r.code,
                grid: r.grid?.length
            })
        )
    );

    console.error(
        "ROOM ADDED",
        floor.rooms.length
    );


    console.log(
        "ROOMS AFTER FINISH",
        floor.rooms
    );

    selectedRoom = room;

    console.error(
        "OPEN ROOM MODAL",
        room
    );

    AppState.ui.selectedRoom = room;
    // TEMP MIGRATION
    window.selectedRoom = AppState.ui.selectedRoom;

    requestRender?.();

    window.updateWorkflowUI?.();

    //generateGrid();

    openRoomModal(room);

    //renderHomeFloorTabs?.();

    //renderFloorTabs?.();

    //updateProjectHeader?.();

    // =====================
    // 🔥 CLEANUP
    // =====================

    tool.points = [];

    tool.active = false;

    AppState.ui.mode =
        "rooms";

    tool.invalidMessage =
        null;

    // 🔥 EXIT ROOM MODE

    AppState.ui.mode =
        "idle";


    room;

    updateRoomProgressPanel?.();

    console.error(
        "FINISH -> WORKFLOW ROOM COUNT:",
        floor.rooms.length
    );

    window.updateWorkflowUI?.();
    requestRender?.();

    window.hoveredRoom =
        null;

    // =====================
    // 🔥 DRAW BUTTON
    // =====================

    const drawBtn =
        document.getElementById(
            "btnDrawRooms"
        );

    if (drawBtn) {

        drawBtn.style.background =
            "#a1bde6";

        drawBtn.style.outline =
            "none";

        drawBtn.style.color =
            "#ffffff";
    }

    // =====================
    // 🔥 FINISH BUTTON
    // =====================

    const finishBtn =
        document.getElementById(
            "btnFinishRoom"
        );

    if (finishBtn) {

        finishBtn.style.display =
            "none";
    }

    // =====================
    // 🔥 STATUS
    // =====================

    const status =
        document.getElementById(
            "statusText"
        );

    if (status) {

        status.innerText =
            "✓ Room created";
    }

    // =====================
    // 🔥 UI UPDATE
    // =====================

    window.updateWorkflowUI?.();

    updateGuideText?.();

    updateWellnessCard?.();

    AppState.ui.roomDraft = null;

    // TEMP
    window.currentRoom =
        AppState.ui.roomDraft;

    requestRender?.();

    console.log(
        "ROOM SAVED SUCCESSFULLY"
    );

    console.log(
        "AFTER FINISH ROOM DRAFT",
        AppState.ui.roomDraft
    );

}


function showRoomDetails(room) {

    const panel =

        document.getElementById(
            "roomDetailsPanel"
        );

    if (!panel || !room) return;

    panel.style.display =
        "block";

    document.getElementById(
        "roomCodeInput"
    ).value =

        room.code || "";

    document.getElementById(
        "roomNameInput"
    ).value =

        room.name === "Room"
            ? ""
            : room.name || "";

    document.getElementById(
        "roomDescriptionInput"
    ).value =

        room.description || "";
}


// =====================
// 🔥 DRAW ROOM TOOL
// =====================




function drawRoomTool() {


    console.error(
        "DRAW ROOM TOOL CALLED"
    );

    const tool =
        window.roomTool;

    const ctx =
        window.ctx;

    if (!ctx) {

        console.error(
            "NO ROOM CTX"
        );

        return;
    }

    console.error(
        "DRAW ROOM TOOL ACTIVE:",
        tool?.active
    );

    console.error(
        "DRAW ROOM TOOL POINTS:",
        tool?.points?.length
    );

    const floor =
        getCurrentFloor?.();



    if (!ctx) {

        console.error(
            "NO CTX"
        );

        return;
    }

    // 🔥 HOME SAFE

    if (
        !floor
    ) {

        return;
    }

    // 🔥 NO ROOMS SAFE

    if (
        !Array.isArray(
            floor.rooms
        )
    ) {

        return;
    }

    ctx.save();

    // =====================
    // 🔥 ROOM LAYER
    // =====================


    ctx.strokeStyle =
        "#3b82f6";

    ctx.lineWidth =
        2;

    // =====================
    // 🔥 ACTIVE ROOM
    // =====================

    console.log("ROOM TOOL STATE", {

        active: tool.active,

        pointCount: tool.points.length,

        points: tool.points

    });

    if (
        tool.active &&
        tool.points.length > 0
    ) {


        // =====================
        // 🔥 ROOM FILL
        // =====================

        if (
            tool.points.length >= 3
        ) {

            const cx =

                tool.points.reduce(
                    (s, p) => s + p.x,
                    0
                ) / tool.points.length;

            const cy =

                tool.points.reduce(
                    (s, p) => s + p.y,
                    0
                ) / tool.points.length;

            const last =
                EMFViewport.worldPoint(

                    tool.points[
                    tool.points.length - 1
                    ]
                );

            const bx =

                Math.min(
                    canvas.width - 110,
                    Math.max(
                        10,
                        last.x + 20
                    )
                );

            const by =

                Math.max(
                    10,
                    last.y - 50
                );

            ctx.fillStyle =
                "#22c55e";

            ctx.beginPath();

            ctx.roundRect(
                bx,
                by,
                90,
                34,
                8
            );

            ctx.fill();

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 14px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "Finish",
                bx + 45,
                by + 22
            );

            tool.finishButton = {

                x: bx,
                y: by,
                width: 90,
                height: 34
            };
        }

        // =====================
        // 🔥 ROOM OUTLINE
        // =====================

        ctx.beginPath();

        const start =
            EMFViewport.worldPoint(
                tool.points[0]
            );

        ctx.moveTo(
            start.x,
            start.y
        );

        for (
            let i = 1;
            i < tool.points.length;
            i++
        ) {

            const p =
                EMFViewport.worldPoint(
                    tool.points[i]
                );

            ctx.lineTo(
                p.x,
                p.y
            );
        }

        if (
            tool.points.length >= 3
        ) {

            ctx.closePath();

            // =====================
            // 🔥 PREVIEW FILL
            // =====================

            ctx.fillStyle =
                ctx.fillStyle =
                "rgba(37,99,235,0.08)";

            ctx.fill();

            ctx.save();

            ctx.setLineDash(
                [8, 4]
            );
        }

        ctx.strokeStyle =
            "#2563eb";

        ctx.lineWidth =
            5;

        ctx.stroke();

        ctx.restore();

        // =====================
        // 🔥 PREVIEW LINE
        // =====================

        if (

            AppState.mouseX !== undefined &&

            AppState.mouseY !== undefined &&

            Boundaries.isInsidePlan({

                x: AppState.mouseX,

                y: AppState.mouseY

            })

        ) {

            const last =
                EMFViewport.worldPoint(
                    tool.points[
                    tool.points.length - 1
                    ]
                );

            const mouse =
                EMFViewport.worldPoint({

                    x: AppState.mouseX,
                    y: AppState.mouseY

                });

            ctx.beginPath();

            ctx.moveTo(
                last.x,
                last.y
            );

            ctx.lineTo(
                mouse.x,
                mouse.y
            );

            ctx.strokeStyle =
                "#2563eb";

            ctx.lineWidth =
                2;

            ctx.stroke();
        }
        // =====================
        // 🔥 POINTS
        // =====================

        tool.points.forEach(p => {

            ctx.beginPath();

            const sp =
                EMFViewport.worldPoint(
                    p
                );

            ctx.arc(
                sp.x,
                sp.y,
                8,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#2563eb";

            ctx.fill();

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth =
                2;

            ctx.stroke();
        });

        // =====================
        // 🔥 CLOSE ROOM MARKER
        // =====================

        if (
            tool.points.length >= 2
        ) {

            const start =
                EMFViewport.worldPoint(
                    tool.points[0]
                );

            const mouse =
                EMFViewport.worldPoint({

                    x: AppState.mouseX,
                    y: AppState.mouseY

                });

            const mouseDist =
                Math.hypot(

                    mouse.x - start.x,

                    mouse.y - start.y
                );

            if (
                mouseDist < 25
            ) {

                ctx.beginPath();

                ctx.arc(
                    start.x,
                    start.y,
                    16,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    "#22c55e";

                ctx.fill();

                ctx.fillStyle =
                    "#ffffff";

                ctx.font =
                    "bold 11px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "Close",
                    start.x,
                    start.y + 4
                );
            }
        }
    }

    // =====================
    // 🔥 INVALID TOOLTIP
    // =====================

    if (
        tool.invalidMessage
    ) {

        const t =
            tool.invalidMessage;

        const w = 320;
        const h = 48;

        const screen =

            EMFViewport.worldPoint({

                x: t.x,

                y: t.y

            });


        const x = Math.max(

            10,

            Math.min(

                screen.x - w / 2,

                canvas.width - w - 10

            )

        );

        const y = Math.max(

            10,

            screen.y + 20

        );

        ctx.fillStyle =
            "rgba(239,68,68,0.96)";

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            w,
            h,
            12
        );

        ctx.fill();

        // icon

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            x + 22,
            y + 24,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // text

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            t.text,
            x + 38,
            y + 29
        );
    }

    ctx.restore();

    console.error(
        "ROOM MODE SET:",
        AppState.ui.mode
    );
}


function editRoom(roomId) {

    const floor =
        getCurrentFloor?.();

    if (!floor) {

        return;
    }

    const room =
        floor.rooms?.find(
            r => r.id === roomId
        );

    if (!room) {

        return;
    }

    selectedRoom =
        room;

    openRoomModal(
        room
    );
}

function showDeleteRoomConfirm(
    room,
    onConfirm
) {

    document
        .getElementById(
            "deleteRoomConfirmModal"
        )
        ?.remove();


    const roomCode =
        room?.code ||
        "this room";


    const roomName =
        room?.name ||
        "";


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "deleteRoomConfirmModal";


    modal.style.cssText = `
        position: fixed;
        inset: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;
        box-sizing: border-box;

        background: rgba(15,23,42,0.28);
        backdrop-filter: blur(6px);

        z-index: 999999;

        pointer-events: auto;
    `;


    modal.innerHTML = `

        <div
            role="dialog"
            aria-modal="true"
            style="
                width: 420px;
                max-width: calc(100vw - 32px);

                box-sizing: border-box;

                background: #ffffff;

                border: 1px solid #dbe3ec;

                border-radius: 16px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.18);

                overflow: hidden;
            "
        >

            <!-- ==========================================
                 HEADER
            =========================================== -->

            <div
                style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 16px 18px 12px;

                    border-bottom:
                        1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        font-size: 20px;
                        font-weight: 700;

                        color: #172033;
                    "
                >

                    <span
                        style="
                            font-size: 19px;
                            line-height: 1;
                        "
                    >
                        🗑️
                    </span>

                    Delete Room

                </div>


                <button
                    type="button"
                    id="deleteRoomCloseButton"
                    aria-label="Close"
                    style="
                        width: 30px;
                        height: 30px;

                        padding: 0;

                        border: 0;

                        background: transparent;

                        color: #64748b;

                        font-size: 25px;
                        line-height: 1;

                        cursor: pointer;
                    "
                >
                    ×
                </button>

            </div>


            <!-- ==========================================
                 CONTENT
            =========================================== -->

            <div
                style="
                    padding: 16px 18px 18px;
                "
            >

                <div
                    style="
                        margin-bottom: 12px;

                        font-size: 17px;
                        line-height: 1.45;

                        color: #243047;
                    "
                >

                    Delete
                    <strong>
                        "${roomCode}"
                    </strong>
                    ?

                </div>


                <div
                    style="
                        max-width: 450px;

                        font-size: 15px;
                        line-height: 1.55;

                        color: #64748b;
                    "
                >

                    All zones, measurements and sources
                    associated with this room will be
                    removed from the current project state.

                </div>

            </div>


            <!-- ==========================================
                 ACTIONS
            =========================================== -->

            <div
                style="
                    display: flex;
                    justify-content: flex-end;

                    gap: 14px;

                    padding:
                        0 18px 18px;
                "
            >

                <button
                    type="button"
                    id="deleteRoomCancelButton"
                    style="
                        min-width: 110px;
height: 44px;

                        padding: 0 18px;

                        border:
                            1px solid #cbd5e1;

                        border-radius: 10px;

                        background: #ffffff;

                        color: #64748b;

                        font-size: 14px;
                        font-weight: 600;

                        cursor: pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="deleteRoomConfirmButton"
                    style="
                        min-width: 126px;
height: 44px;

                        padding: 0 18px;

                        border:
                            1px solid #dc2626;

                        border-radius: 10px;

                        background: #dc2626;

                        color: #ffffff;

                        font-size: 14px;
                        font-weight: 700;

                        cursor: pointer;
                    "
                >
                    Delete Room
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==================================================
    // ELEMENTS
    // ==================================================

    const closeButton =
        modal.querySelector(
            "#deleteRoomCloseButton"
        );


    const cancelButton =
        modal.querySelector(
            "#deleteRoomCancelButton"
        );


    const confirmButton =
        modal.querySelector(
            "#deleteRoomConfirmButton"
        );


    // ==================================================
    // CLOSE
    // ==================================================

    const closeModal =
        () => {

            modal.remove();

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

        };


    // ==================================================
    // ESC
    // ==================================================

    const escapeHandler =
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        };


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    // ==================================================
    // CANCEL
    // ==================================================

    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    // ==================================================
    // CLICK OUTSIDE
    // ==================================================

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    // ==================================================
    // CONFIRM DELETE
    // ==================================================

    confirmButton?.addEventListener(
        "click",
        () => {

            closeModal();

            onConfirm?.();

        }
    );


    // ==================================================
    // FOCUS
    // ==================================================

    setTimeout(
        () => {

            cancelButton?.focus();

        },
        50
    );

}


function deleteRoomById(
    roomId
) {

    console.error(
        "🔥 DELETE ROOM START",
        roomId
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (
        !floor
    ) {

        console.error(
            "❌ DELETE ROOM — NO ACTIVE FLOOR"
        );

        return;
    }


    // ==================================================
    // FIND ROOM
    // ==================================================

    const room =
        (
            floor.rooms ||
            []
        ).find(
            r =>
                r.id ===
                roomId
        );


    if (
        !room
    ) {

        console.error(
            "❌ DELETE ROOM — ROOM NOT FOUND",
            roomId
        );

        return;
    }


    // ==================================================
    // CONFIRM
    // ==================================================

    showDeleteRoomConfirm(
        room,
        () => {

            // ==================================================
            // 🔥 CLOSE ANY OPEN ZONE UI FIRST
            // ==================================================
            //
            // Important:
            // #roomZonesPopup is a persistent DOM element.
            // Deleting its selected room must never leave
            // the modal overlay active.
            //

            closeRoomZonesPopup?.();


            const roomZonesPopup =
                document.getElementById(
                    "roomZonesPopup"
                );


            if (
                roomZonesPopup
            ) {

                roomZonesPopup.style.display =
                    "none";

                roomZonesPopup.style.pointerEvents =
                    "none";
            }


            // ==================================================
            // CLEAR ZONE POPUP STATE
            // ==================================================

            AppState.ui.selectedZone =
                null;

            window.selectedZone =
                null;


            AppState.ui.zoneDraft =
                null;


            window.zone =
                null;


            // ==================================================
            // 🔥 DELETE ROOM
            // ==================================================

            floor.rooms =
                (
                    floor.rooms ||
                    []
                ).filter(
                    r =>
                        r.id !==
                        roomId
                );


            // ==================================================
            // 🔥 DELETE ROOM ZONES
            // ==================================================

            floor.zones =
                (
                    floor.zones ||
                    []
                ).filter(
                    z =>
                        z.roomId !==
                        roomId
                );


            // ==================================================
            // CLEAR ACTIVE ROOM
            // ==================================================

            if (
                AppState.ui.selectedRoom?.id ===
                roomId
            ) {

                AppState.ui.selectedRoom =
                    null;
            }


            if (
                window.selectedRoom?.id ===
                roomId
            ) {

                window.selectedRoom =
                    null;
            }


            if (
                selectedRoom?.id ===
                roomId
            ) {

                selectedRoom =
                    null;
            }


            // ==================================================
            // SELECT FIRST REMAINING ROOM
            // ==================================================

            if (
                floor.rooms?.length
            ) {

                const nextRoom =
                    floor.rooms[0];


                AppState.ui.selectedRoom =
                    nextRoom;


                window.selectedRoom =
                    nextRoom;


                selectedRoom =
                    nextRoom;
            }


            // ==================================================
            // RESET HOVERS
            // ==================================================

            window.hoveredRoom =
                null;

            window.hoveredZone =
                null;


            if (
                typeof hoveredRoom !==
                "undefined"
            ) {

                hoveredRoom =
                    null;
            }


            if (
                typeof hoveredZone !==
                "undefined"
            ) {

                hoveredZone =
                    null;
            }


            // ==================================================
            // RESET ROOM / ZONE INTERACTION
            // ==================================================

            AppState.ui.mode =
                "idle";


            if (
                window.roomTool
            ) {

                window.roomTool.active =
                    false;
            }


            window.draggingZoneVertex =
                false;

            window.draggedVertexIndex =
                -1;


            // ==================================================
            // SAVE
            // ==================================================

            saveProject?.();


            // ==================================================
            // UI REFRESH
            // ==================================================

            window.updateWorkflowUI?.();

            updateRoomProgressPanel?.();

            updateProgressUI?.();

            updateGuideText?.();

            updateUIState?.();


            // ==================================================
            // RENDER
            // ==================================================

            requestRender?.();


            console.error(
                "🗑 DELETE ROOM COMPLETE",
                {
                    deletedRoom:
                        roomId,

                    remainingRooms:
                        floor.rooms.length,

                    remainingZones:
                        floor.zones?.length || 0,

                    selectedRoom:
                        AppState.ui.selectedRoom?.id ||
                        null
                }
            );

        }
    );
}
function getRoomArea(room) {

    if (
        !room ||
        !room.polygon ||
        room.polygon.length < 3
    ) {
        return 0;
    }

    let area = 0;

    const pts =
        room.polygon;

    for (
        let i = 0;
        i < pts.length;
        i++
    ) {

        const j =
            (i + 1) % pts.length;

        area +=
            pts[i].x * pts[j].y;

        area -=
            pts[j].x * pts[i].y;
    }

    // 🔥 px²
    area =
        Math.abs(area / 2);

    // 🔥 convert to m²
    if (!scale || scale <= 0) {
        return 0;
    }

    const sqm =
        area / (scale * scale);

    return sqm;
}


function validateGridSize(room) {

    // 🔥 invalid room
    if (
        !room ||
        !room.polygon ||
        room.polygon.length < 3
    ) {
        return true;
    }

    // 🔥 invalid scale
    if (!scale || scale <= 0) {
        return true;
    }

    const area =
        getRoomArea(room);

    // 🔥 invalid area
    if (!area || isNaN(area)) {
        return true;
    }

    const selected =
        document.querySelector(
            'input[name="gridPreset"]:checked'
        );

    const meters =
        parseFloat(
            selected?.value || 1
        );

    // 🔥 warning only
    if (
        area < 6 &&
        meters >= 2
    ) {

        const el =
            document.getElementById(
                "gridWarning"
            );

        if (el) {

            el.style.display =
                "block";

            el.innerText =
                "⚠ Recommended: 0.5m or 1m for small rooms";
        }

    } else {

        const el =
            document.getElementById(
                "gridWarning"
            );

        if (el) {
            el.style.display =
                "none";
        }
    }

    return true;
}

function getRoomStatus(room) {

    const floor =
        getCurrentFloor();

    if (!floor) {
        return "NO FLOOR";
    }

    const roomZones =
        (floor.zones || [])
            .filter(
                z => z.roomId === room.id
            );

    if (!room.grid?.length) {
        return "Needs Grid";
    }

    const zones = floor.zones || [];

    const points =
        Array.isArray(room.grid)
            ? room.grid
            : [];

    console.log(
        "ROOM GRID:",
        room.grid.length
    );

    console.error(
        "ROOM",
        room.code,
        "GRID",
        points.length
    );

    let measured = 0;

    let total =
        points.length;

    let bedTotal = 0;
    let bedMeasured = 0;

    let workTotal = 0;
    let workMeasured = 0;

    points.forEach(p => {



        const val = p.measurements?.[sessionId]?.[measureType];

        if (val !== undefined) measured++;

        // 🔥 tikrinam zonas
        if (zones) {

            zones.forEach(z => {

                if (!z.polygon) {
                    return;
                }

                if (
                    pointInPolygon(
                        p.x,
                        p.y,
                        z.polygon
                    )
                ) {

                    if (
                        z.type === "sleep"
                    ) {

                        bedTotal++;

                        if (
                            val !== undefined
                        ) {

                            bedMeasured++;
                        }
                    }

                    if (
                        z.type === "work"
                    ) {

                        workTotal++;

                        if (
                            val !== undefined
                        ) {

                            workMeasured++;
                        }
                    }
                }

            });

        }

    });


}

function getLegacyRoomStatus(room) {

    if (
        !room.grid ||
        room.grid.length === 0
    ) {

        return {
            text: "Needs Grid",
            icon: "⚪"
        };
    }

    const stats =

        window.getRoomMeasurementStats?.(
            room
        );

    if (
        stats.canComplete
    ) {

        return {
            text: "Completed",
            icon: "✅"
        };
    }

    return {
        text: "Measuring",
        icon: "🟡"
    };
}

function getRoomReadiness(
    room
) {

    const floor =
        getCurrentFloor?.();

    if (
        !room ||
        !floor
    ) {
        return 0;
    }

    let score = 0;

    // =====================
    // ZONES
    // =====================

    const roomZones =

        (floor.zones || [])
            .filter(
                z =>
                    z.roomId === room.id
            );

    if (
        roomZones.length > 0
    ) {

        score += 30;
    }

    // =====================
    // MEASUREMENTS
    // =====================

    let totalPoints = 0;
    let measuredPoints = 0;

    roomZones.forEach(zone => {

        totalPoints +=
            (zone.grid || []).length;

        measuredPoints +=

            (zone.grid || [])
                .filter(
                    p =>
                        p.measurements &&
                        Object.keys(
                            p.measurements
                        ).length > 0
                )
                .length;
    });

    if (totalPoints > 0) {

        score +=

            Math.round(
                (
                    measuredPoints /
                    totalPoints
                ) * 50
            );
    }

    // =====================
    // EXPOSURE
    // =====================

    const exposureReady =

        roomZones.every(
            z =>
                z.hoursPerDay != null
        );

    if (
        roomZones.length &&
        exposureReady
    ) {

        score += 20;
    }

    return Math.min(
        score,
        100
    );
}


function getReadinessLabel(
    score
) {

    if (score >= 90) {
        return "Ready";
    }

    if (score >= 60) {
        return "Good";
    }

    if (score >= 30) {
        return "In Progress";
    }

    return "Needs Work";
}

function undoRoomPoint() {

    const tool =
        window.roomTool;

    tool.points.pop();

    requestRender?.();
}

// =====================
// 🔥 EDIT
// =====================

window.undoRoomPoint =
    undoRoomPoint;

window.editRoom =
    editRoom;

window.deleteRoomById =
    deleteRoomById;


// =====================
// 🔥 ROOM TOOL
// =====================

window.handleRoomToolClick =
    handleRoomToolClick;

window.startRoomMode =
    startRoomMode;

window.finishRoomV2 =
    finishRoomV2;

window.drawRoomTool =
    drawRoomTool;


// =====================
// 🔥 ROOM DETAILS
// =====================

window.showRoomDetails =
    showRoomDetails;

window.openRoomModal =
    openRoomModal;

window.saveRoomDetails =
    saveRoomDetails;


// =====================
// 🔥 ROOM ANALYSIS
// =====================

window.getRoomArea =
    getRoomArea;

window.validateGridSize =
    validateGridSize;

window.getRoomStatus =
    getRoomStatus;

window.getLegacyRoomStatus =
    getLegacyRoomStatus;

window.getRoomReadiness =
    getRoomReadiness;

window.getReadinessLabel =
    getReadinessLabel;