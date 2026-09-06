

function openRoomZonesPopup(
    roomId
) {

    console.error(
        "🔥 OPEN ROOM ZONES POPUP — NEW",
        roomId
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (!floor) {

        console.error(
            "❌ NO CURRENT FLOOR"
        );

        return;
    }


    // ==================================================
    // ROOM
    // ==================================================

    const room =
        (floor.rooms || [])
            .find(
                r =>
                    r.id === roomId
            );


    if (!room) {

        console.error(
            "❌ ROOM NOT FOUND",
            roomId
        );

        return;
    }


    // ==================================================
    // ROOM ZONES
    // ==================================================

    const roomZones =
        (floor.zones || [])
            .filter(
                z =>
                    z.roomId === room.id
            );


    // ==================================================
    // POPUP ROOT
    // ==================================================

    const popup =
        document.getElementById(
            "roomZonesPopup"
        );


    // ==================================================
    // MOVE POPUP OUTSIDE CANVAS STACKING CONTEXT
    // ==================================================

    if (
        popup &&
        popup.parentElement !== document.body
    ) {

        document.body.appendChild(
            popup
        );
    }

    // ==================================================
    // 🔥 RESET POPUP TO VIEWPORT
    // ==================================================

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "inset",
        "0",
        "important"
    );

    popup.style.setProperty(
        "width",
        "100vw",
        "important"
    );

    popup.style.setProperty(
        "height",
        "100vh",
        "important"
    );

    popup.style.setProperty(
        "top",
        "0",
        "important"
    );

    popup.style.setProperty(
        "right",
        "0",
        "important"
    );

    popup.style.setProperty(
        "bottom",
        "0",
        "important"
    );

    popup.style.setProperty(
        "left",
        "0",
        "important"
    );

    popup.style.setProperty(
        "transform",
        "none",
        "important"
    );

    popup.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );


    if (!popup) {

        console.error(
            "❌ roomZonesPopup NOT FOUND"
        );

        return;
    }


    // ==================================================
    // 🔥 POPUP MUST LIVE IN BODY
    // ==================================================

    if (
        popup.parentElement !==
        document.body
    ) {

        document.body.appendChild(
            popup
        );
    }


    // ==================================================
    // 🔥 RESET POPUP GEOMETRY
    // ==================================================
    //
    // IMPORTANT:
    // #roomZonesPopup has legacy CSS which can override
    // normal inline styles. Therefore every geometry
    // property is forced with !important.
    //
    // The ROOT is the fullscreen overlay.
    // The popup content itself is positioned by the
    // existing popup layout.
    //

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "inset",
        "0",
        "important"
    );

    popup.style.setProperty(
        "top",
        "0",
        "important"
    );

    popup.style.setProperty(
        "right",
        "0",
        "important"
    );

    popup.style.setProperty(
        "bottom",
        "0",
        "important"
    );

    popup.style.setProperty(
        "left",
        "0",
        "important"
    );

    popup.style.setProperty(
        "width",
        "100vw",
        "important"
    );

    popup.style.setProperty(
        "height",
        "100vh",
        "important"
    );

    popup.style.setProperty(
        "min-width",
        "0",
        "important"
    );

    popup.style.setProperty(
        "min-height",
        "0",
        "important"
    );

    popup.style.setProperty(
        "max-width",
        "none",
        "important"
    );

    popup.style.setProperty(
        "max-height",
        "none",
        "important"
    );

    popup.style.setProperty(
        "margin",
        "0",
        "important"
    );

    popup.style.setProperty(
        "padding",
        "12px",
        "important"
    );

    popup.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

    popup.style.setProperty(
        "transform",
        "none",
        "important"
    );

    popup.style.setProperty(
        "z-index",
        "10000",
        "important"
    );

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );

    popup.style.setProperty(
        "align-items",
        "flex-start",
        "important"
    );

    popup.style.setProperty(
        "justify-content",
        "center",
        "important"
    );

    popup.style.setProperty(
        "background",
        "rgba(15, 23, 42, 0.42)",
        "important"
    );

    popup.style.setProperty(
        "overflow-y",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );


    // ==================================================
    // ZONE ICONS
    // ==================================================

    const zoneIcons = {

        sleep:
            "🛏️",

        rest:
            "🛋️",

        work:
            "💻",

        child:
            "🧸"

    };


    // ==================================================
    // BUILD DIALOG
    // ==================================================

    popup.innerHTML = `

        <div
            class="room-zones-dialog"
            role="dialog"
            aria-modal="true"
            onclick="
                event.stopPropagation();
            "
           style="
    position:relative;

    width:360px;
    max-width:calc(100vw - 32px);

    transform:none !important;

    max-height:calc(100vh - 48px);

    box-sizing:border-box;

    display:flex;
    flex-direction:column;

    background:#ffffff;

    border:
        1px solid #e2e8f0;

    border-radius:14px;

    box-shadow:
        0 20px 55px
        rgba(15,23,42,.22);

    overflow:hidden;

    color:#1e293b;

    font-family:inherit;
"
        >

            <!-- ======================================
                 HEADER
                 ====================================== -->

            <div
                style="
                    flex:0 0 auto;

                    display:flex;
                    align-items:center;
                    justify-content:space-between;

                    padding:12px 16px;

                    border-bottom:
                        1px solid #e5e7eb;
                "
            >

                <div
                    style="
                        font-size:15px;
                        font-weight:700;
                        color:#0f172a;
                    "
                >
                    ${room.code}
                    -
                    ${room.name || "Room"}
                    Zones
                </div>


                <button
                    type="button"
                    aria-label="Close"
                    onclick="
                        event.stopPropagation();
                        closeRoomZonesPopup();
                    "
                    style="
                        width:30px;
                        height:30px;

                        display:flex;
                        align-items:center;
                        justify-content:center;

                        padding:0;

                        border:none;

                        background:transparent;

                        color:#64748b;

                        font-size:22px;
                        line-height:1;

                        cursor:pointer;

                        border-radius:6px;
                    "
                    onmouseenter="
                        this.style.background='#f1f5f9';
                    "
                    onmouseleave="
                        this.style.background='transparent';
                    "
                >
                    ×
                </button>

            </div>


            <!-- ======================================
                 CONTENT
                 ====================================== -->

            <div
                style="
                    flex:1 1 auto;

                    min-height:0;

                    overflow-y:auto;

                    padding:10px 14px 12px;

                    box-sizing:border-box;
                "
            >

                ${roomZones.length === 0

            ? `

                        <div
                            style="
                                padding:
                                    20px 12px;

                                text-align:center;

                                font-size:12px;

                                color:#64748b;

                                border:
                                    1px dashed #cbd5e1;

                                border-radius:9px;

                                background:#f8fafc;
                            "
                        >
                            No zones created yet.
                        </div>

                    `

            : ""
        }


                <!-- ==================================
                     ZONE LIST
                     ================================== -->

                <div
                    style="
                        display:flex;

                        flex-direction:column;

                        gap:5px;
                    "
                >

                    ${roomZones
            .map(
                zone => {

                    const total =
                        (
                            zone.grid ||
                            []
                        ).length;


                    const measured =
                        (
                            zone.grid ||
                            []
                        )
                            .filter(
                                p =>
                                    p.measurements?.[
                                    sessionId
                                    ]
                            )
                            .length;


                    // ------------------------------
                    // STATUS
                    // ------------------------------

                    let status =
                        "○";

                    let statusColor =
                        "#94a3b8";


                    if (
                        measured > 0 &&
                        measured < total
                    ) {

                        status =
                            "◐";

                        statusColor =
                            "#8b5cf6";

                    }
                    else if (
                        total > 0 &&
                        measured === total
                    ) {

                        status =
                            "✓";

                        statusColor =
                            "#16a34a";
                    }


                    // ------------------------------
                    // DENSITY
                    // ------------------------------

                    const densityMeasured =
                        (
                            zone.grid ||
                            []
                        )
                            .filter(
                                p =>
                                    p.rf ||
                                    p.electric ||
                                    p.magnetic
                            )
                            .length;


                    // ------------------------------
                    // HOURS
                    // ------------------------------

                    const hoursValue =
                        zone.hoursPerDay == null
                            ? ""
                            : zone.hoursPerDay;


                    // ------------------------------
                    // OCCUPANCY
                    // ------------------------------

                    const occupancy =
                        getOccupancy(
                            zone.hoursPerDay
                        );


                    const selected =
                        AppState.ui
                            ?.selectedZone
                            ?.id ===
                        zone.id;


                    const icon =
                        zoneIcons[
                        zone.type
                        ] ||
                        "◉";


                    const roomIdJS =
                        JSON.stringify(
                            room.id
                        );


                    const zoneIdJS =
                        JSON.stringify(
                            zone.id
                        );


                    return `

                                    <div
                                        class="popup-zone-card"
                                        onclick="
                                            event.stopPropagation();

                                            selectZoneFromPopup(
                                                ${zoneIdJS},
                                                ${roomIdJS}
                                            );
                                        "
                                        style="
    position:relative;

    width:100%;

    margin:0;

    padding:7px 9px;

    box-sizing:border-box;

    border:
        1px solid #e2e8f0;

    border-radius:9px;

    background:#ffffff;

    box-shadow:
        0 1px 2px
        rgba(15,23,42,.04);

    cursor:pointer;
"
                                    >

                                        <!-- ZONE TOP -->

                                        <div
                                            style="
                                                display:flex;
                                                align-items:center;
                                                justify-content:space-between;

                                                gap:12px;

                                                margin-bottom:5px;
                                            "
                                        >

                                            <div
    style="
        min-width:0;

        display:flex;
        align-items:center;

        gap:6px;
    "
>

    <span
        style="
            font-size:14px;
            line-height:1;
        "
    >
        ${getZoneLabel(zone.type)}
    </span>

    <span
        style="
            font-size:13px;
            font-weight:700;
            color:#1e293b;
        "
    >
        (${measured}/${total})
    </span>

</div>


                                           ${window.pendingDeleteZoneId === zone.id
                            ? `
        <div
            class="zone-delete-confirm"
            style="
                display:flex;
                align-items:center;
                gap:5px;
            "
        >

            <button
    type="button"
    class="zone-delete-cancel-btn"
    data-room-id="${room.id}"
    style="
        height:26px;
        padding:3px 9px;

        border:1px solid #cbd5e1;
        border-radius:6px;

        background:#ffffff;
        color:#64748b;

        font-size:10px;
        cursor:pointer;
    "
>
    Cancel
</button>

           <button
    type="button"
    class="zone-delete-confirm-btn"
    data-zone-id="${zone.id}"
    data-room-id="${room.id}"
    style="
        height:26px;
        padding:3px 9px;

        border:1px solid #fecaca;
        border-radius:6px;

        background:#fff7f7;
        color:#dc2626;

        font-size:10px;
        font-weight:600;

        cursor:pointer;
    "
>
    Delete
</button>

        </div>
    `
                            : `
        <button
            type="button"
            class="popup-delete-zone-btn"

            title="Delete Zone"

            onclick="
                event.preventDefault();
                event.stopPropagation();

                console.error(
                    '🔥 DELETE ZONE CLICKED DIRECT',
                    '${zone.id}',
                    '${room.id}'
                );

                window.pendingDeleteZoneId =
                    '${zone.id}';

                openRoomZonesPopup(
                    '${room.id}'
                );
            "

            style="
                width:28px;
                height:28px;

                display:flex;
                align-items:center;
                justify-content:center;

                padding:0;

                border:none;

                background:transparent;

                color:#94a3b8;

                font-size:13px;

                cursor:pointer;

                border-radius:6px;
            "
        >
            🗑️
        </button>
    `
                        }

                                        </div>


                                        <!-- DENSITY -->

                                        <div
                                            style="
                                                font-size:11px;

                                                color:#64748b;

                                                margin-bottom:5px;
                                            "
                                        >
                                            Density

                                            <b
                                                style="
                                                    color:#334155;
                                                    font-weight:600;
                                                "
                                            >
                                                ${densityMeasured}
                                                /
                                                ${total}
                                            </b>
                                        </div>


                                        <!-- EXPOSURE -->

                                        <div
                                            style="
                                                margin-top:5px;
                                            "
                                        >

                                            <div
                                                style="
                                                    font-size:10px;

                                                    color:#64748b;

                                                    margin-bottom:5px;
                                                "
                                            >
                                                Exposure Hours / Day
                                            </div>


                                            <div
                                                style="
                                                    display:flex;

                                                    align-items:center;

                                                    gap:6px;
                                                "
                                            >

                                                <input
                                                    id="zoneHours_${zone.id}"
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    step="0.5"
                                                    value="${hoursValue}"
                                                    placeholder="Unknown"
                                                    onclick="
                                                        event.stopPropagation();
                                                    "
                                                    onkeydown="
                                                        event.stopPropagation();
                                                    "
                                                    style="
                                                        width:78px;
                                                        height:28px;

                                                        box-sizing:border-box;

                                                        padding:
                                                            4px 7px;

                                                        border:
                                                            1px solid
                                                            #cbd5e1;

                                                        border-radius:6px;

                                                        background:#ffffff;

                                                        color:#334155;

                                                        font-size:11px;

                                                        outline:none;
                                                    "
                                                >


                                                <span
                                                    style="
                                                        font-size:11px;

                                                        color:#64748b;

                                                        white-space:nowrap;
                                                    "
                                                >
                                                    h/day
                                                </span>


                                                <button
                                                    type="button"
                                                    onclick="
                                                        event.stopPropagation();

                                                        saveZoneHours(
                                                            ${zoneIdJS},
                                                            ${roomIdJS}
                                                        );
                                                    "
                                                    style="
                                                        height:28px;

                                                        padding:
                                                            4px 10px;

                                                        border:
                                                            1px solid
                                                            #cbd5e1;

                                                        border-radius:6px;

                                                        background:#ffffff;

                                                        color:#475569;

                                                        font-size:10px;

                                                        font-weight:600;

                                                        cursor:pointer;
                                                    "
                                                >
                                                    Save
                                                </button>

                                            </div>


                                            <div
                                                style="
                                                    margin-top:4px;

                                                    font-size:10px;

                                                    color:#64748b;
                                                "
                                            >
                                                Occupancy

                                                <b
                                                    style="
                                                        color:#334155;
                                                        font-weight:600;
                                                    "
                                                >
                                                    ${occupancy}
                                                </b>
                                            </div>

                                        </div>

                                    </div>

                                `;
                }
            )
            .join("")
        }

                </div>


                <!-- ==================================
                     ADD ZONE
                     ================================== -->

                <button
                    class="popup-add-zone-btn"
                    type="button"
                    onclick="
                        event.stopPropagation();

                        const selectedRoom =
                            (getCurrentFloor()?.rooms || [])
                                .find(
                                    r =>
                                        r.id ===
                                        ${JSON.stringify(room.id)}
                                );

                        if (!selectedRoom) {

                            console.error(
                                '❌ ROOM NOT FOUND',
                                ${JSON.stringify(room.id)}
                            );

                            return;
                        }

                        AppState.ui.selectedRoom =
                            selectedRoom;

                        window.selectedRoom =
                            selectedRoom;

                        AppState.ui.selectedZone =
                            null;

                        window.selectedZone =
                            null;

                        showZoneCreationHelp(
                            selectedRoom
                        );
                    "
                    style="
                        width:100%;

                        min-height:38px;

                        margin-top:8px;

                        padding:
                            8px 12px;

                        box-sizing:border-box;

                        border:
                            1px solid #93c5fd;

                        border-radius:8px;

                        background:#ffffff;

                        color:#2563eb;

                        font-size:11px;

                        font-weight:600;

                        cursor:pointer;
                    "
                    onmouseenter="
                        this.style.background='#eff6ff';
                    "
                    onmouseleave="
                        this.style.background='#ffffff';
                    "
                >
                    + Add Zone
                </button>

            </div>

        </div>

    `;



    // ==================================================
    // 🔥 OVERLAY CLICK
    // ==================================================

    popup.onclick =
        function (event) {

            if (
                event.target ===
                popup
            ) {

                closeRoomZonesPopup();
            }
        };


    // ==================================================
    // ⌨️ KEYBOARD
    // ==================================================

    if (
        window.roomZonesPopupKeyHandler
    ) {

        document.removeEventListener(
            "keydown",
            window.roomZonesPopupKeyHandler
        );
    }


    window.roomZonesPopupKeyHandler =
        function (event) {

            const currentPopup =
                document.getElementById(
                    "roomZonesPopup"
                );


            if (
                !currentPopup ||
                getComputedStyle(
                    currentPopup
                ).display ===
                "none"
            ) {

                return;
            }


            // ------------------------------------------
            // ESC
            // ------------------------------------------

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();

                closeRoomZonesPopup();

                return;
            }


            // ------------------------------------------
            // ENTER
            // ------------------------------------------

            if (
                event.key ===
                "Enter"
            ) {

                const target =
                    event.target;


                if (
                    target &&
                    (
                        target.tagName ===
                        "INPUT" ||

                        target.tagName ===
                        "TEXTAREA"
                    )
                ) {

                    return;
                }


                const addZoneBtn =
                    currentPopup.querySelector(
                        ".popup-add-zone-btn"
                    );


                if (
                    addZoneBtn
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    addZoneBtn.click();
                }
            }
        };


    document.addEventListener(
        "keydown",
        window.roomZonesPopupKeyHandler
    );

    // ==================================================
    // 🔥 POPUP BUTTON EVENTS
    // ==================================================

    // ADD ZONE

    const addZoneBtn =
        popup.querySelector(
            ".popup-add-zone-btn"
        );

    if (addZoneBtn) {

        addZoneBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                console.error(
                    "🔥🔥🔥 ADD ZONE BUTTON CLICKED",
                    room.id
                );

                const selectedRoom =
                    (getCurrentFloor()?.rooms || [])
                        .find(
                            r =>
                                r.id === room.id
                        );

                if (!selectedRoom) {

                    console.error(
                        "❌ ROOM NOT FOUND",
                        room.id
                    );

                    return;
                }

                AppState.ui.selectedRoom =
                    selectedRoom;

                window.selectedRoom =
                    selectedRoom;

                AppState.ui.selectedZone =
                    null;

                window.selectedZone =
                    null;

                showZoneCreationHelp(
                    selectedRoom
                );
            }
        );
    }

    // ==================================================
    // 🗑️ DELETE ZONE EVENTS
    // ==================================================

    const deleteZoneButtons =
        popup.querySelectorAll(
            ".popup-delete-zone-btn"
        );

    deleteZoneButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const zoneId =
                        this.dataset.zoneId;

                    const roomId =
                        this.dataset.roomId;

                    console.error(
                        "🔥 DELETE ZONE BUTTON",
                        {
                            zoneId,
                            roomId
                        }
                    );

                    if (
                        !zoneId ||
                        !roomId
                    ) {

                        console.error(
                            "❌ INVALID DELETE IDS",
                            {
                                zoneId,
                                roomId
                            }
                        );

                        return;
                    }

                    window.pendingDeleteZoneId =
                        zoneId;

                    openRoomZonesPopup(
                        roomId
                    );
                }
            );
        }
    );


    // ==================================================
    // ❌ CANCEL DELETE
    // ==================================================

    const cancelDeleteButtons =
        popup.querySelectorAll(
            ".zone-delete-cancel-btn"
        );

    cancelDeleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const roomId =
                        this.dataset.roomId;

                    window.pendingDeleteZoneId =
                        null;

                    openRoomZonesPopup(
                        roomId
                    );
                }
            );
        }
    );


    // ==================================================
    // 🔥 CONFIRM DELETE
    // ==================================================

    const confirmDeleteButtons =
        popup.querySelectorAll(
            ".zone-delete-confirm-btn"
        );

    confirmDeleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const zoneId =
                        this.dataset.zoneId;

                    const roomId =
                        this.dataset.roomId;

                    console.error(
                        "🔥🔥 CONFIRM DELETE",
                        {
                            zoneId,
                            roomId
                        }
                    );

                    if (
                        !zoneId ||
                        !roomId
                    ) {

                        console.error(
                            "❌ INVALID CONFIRM DELETE IDS",
                            {
                                zoneId,
                                roomId
                            }
                        );

                        return;
                    }

                    const foundZone =
                        (getCurrentFloor()?.zones || [])
                            .find(
                                z =>
                                    z.id ===
                                    zoneId
                            );

                    if (!foundZone) {

                        console.error(
                            "❌ ZONE NOT FOUND",
                            zoneId
                        );

                        return;
                    }

                    AppState.ui.selectedZone =
                        foundZone;

                    window.selectedZone =
                        foundZone;

                    window.pendingDeleteZoneId =
                        null;

                    await deleteSelectedZone();

                    openRoomZonesPopup(
                        roomId
                    );
                }
            );
        }
    );


    // ==================================================
    // SHOW
    // ==================================================

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );


    console.error(
        "✅ NEW ROOM ZONES POPUP OPENED",
        {
            room:
                room.code,

            zones:
                roomZones.length,

            parent:
                popup.parentElement?.tagName,

            rect:
                popup
                    .querySelector(
                        ".room-zones-dialog"
                    )
                    ?.getBoundingClientRect()
        }
    );

    // ==================================================
    // FINAL POPUP PARENT
    // MUST BE OUTSIDE canvasWrap
    // ==================================================

    if (popup) {

        document.body.appendChild(
            popup
        );

        console.log(
            "🔥 FINAL ZONE POPUP PARENT:",
            popup.parentElement
        );
    }
}

function startZoneMeasuring() {

    console.log(
        "🔥 START ZONE MEASURING"
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const zoneFloor =
        getCurrentFloor?.();

    if (!zoneFloor) {

        console.error(
            "❌ NO CURRENT FLOOR"
        );

        return;
    }


    // ==================================================
    // CURRENT ROOM
    // ==================================================

    const currentRoom =
        AppState.ui.selectedRoom ||
        window.selectedRoom ||
        null;


    const selectedRoom =
        currentRoom
            ? (zoneFloor.rooms || [])
                .find(
                    room =>
                        room.id ===
                        currentRoom.id
                )
            : null;


    // ==================================================
    // CURRENT ZONE
    // ==================================================

    const currentZone =
        AppState.ui.selectedZone ||
        window.selectedZone ||
        null;


    const selectedZone =
        currentZone
            ? (zoneFloor.zones || [])
                .find(
                    zone =>
                        zone.id ===
                        currentZone.id
                )
            : null;


    // ==================================================
    // AVAILABLE ZONES
    // ==================================================

    let availableZones =
        Array.isArray(
            zoneFloor.zones
        )
            ? zoneFloor.zones
            : [];


    // --------------------------------------------------
    // LIMIT TO SELECTED ROOM
    // --------------------------------------------------

    if (
        selectedRoom
    ) {

        availableZones =
            availableZones.filter(
                zone =>
                    zone.roomId ===
                    selectedRoom.id
            );
    }


    // ==================================================
    // SELECTED ZONE HAS PRIORITY
    // ==================================================

    let activeZone =
        null;


    if (
        selectedZone
    ) {

        activeZone =
            availableZones.find(
                zone =>
                    zone.id ===
                    selectedZone.id
            ) || null;
    }


    // ==================================================
    // OTHERWISE FIND FIRST UNMEASURED ZONE
    // ==================================================

    if (
        !activeZone
    ) {

        activeZone =
            availableZones.find(
                zone =>
                    (zone.grid || []).some(
                        point =>
                            !point.measurements?.[
                            sessionId
                            ]
                    )
            ) || null;
    }


    // ==================================================
    // NOTHING LEFT TO MEASURE
    // ==================================================

    if (
        !activeZone
    ) {

        updateStatus?.(

            selectedRoom

                ? "✅ All zones in this room are measured"

                : "✅ All zones are measured"

        );

        return;
    }


    // ==================================================
    // ZONE MEASURE MODE
    // ==================================================

    AppState.ui.mode =
        "zoneMeasure";


    // ==================================================
    // SYNC ROOM
    // ==================================================

    if (
        selectedRoom
    ) {

        AppState.ui.selectedRoom =
            selectedRoom;

        window.selectedRoom =
            selectedRoom;
    }


    // ==================================================
    // SYNC ZONE
    // ==================================================

    AppState.ui.selectedZone =
        activeZone;

    window.selectedZone =
        activeZone;


    // ==================================================
    // STATUS
    // ==================================================

    updateStatus?.(

        "🎯 Measuring " +

        getZoneLabel(
            activeZone.type
        )

    );


    console.log(
        "🔥 ACTIVE ZONE",
        {
            id:
                activeZone.id,

            type:
                activeZone.type,

            roomId:
                activeZone.roomId,

            gridPoints:
                activeZone.grid?.length || 0
        }
    );


    // ==================================================
    // UI
    // ==================================================

    window.updateWorkflowUI?.();

    requestRender?.();
}

function selectZoneFromPopup(
    zoneId,
    roomId
) {

    console.log(
        "🔥 SELECT ZONE FROM POPUP",
        {
            zoneId,
            roomId
        }
    );

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const room =
        (floor.rooms || [])
            .find(
                r =>
                    r.id === roomId
            );

    const zone =
        (floor.zones || [])
            .find(
                z =>
                    z.id === zoneId
            );

    if (!room || !zone) {

        console.error(
            "❌ POPUP ZONE SELECTION FAILED",
            {
                room,
                zone
            }
        );

        return;
    }

    // ==================================================
    // SYNC ROOM
    // ==================================================

    AppState.ui.selectedRoom =
        room;

    window.selectedRoom =
        room;


    // ==================================================
    // SYNC ZONE
    // ==================================================

    AppState.ui.selectedZone =
        zone;

    window.selectedZone =
        zone;


    console.log(
        "🔥 ZONE SELECTED",
        {
            id:
                zone.id,

            type:
                zone.type,

            roomId:
                zone.roomId,

            hoursPerDay:
                zone.hoursPerDay
        }
    );


    // ==================================================
    // REFRESH MAP
    // ==================================================

    requestRender?.();

    updateWorkflowUI?.();

    updateZoneStatusUI?.();
}

function handleAddManageZones() {

    clearSourceFocus?.();

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const zoneFloor =
        getCurrentFloor?.();


    if (!zoneFloor) {

        console.error(
            "❌ NO CURRENT FLOOR"
        );

        return;
    }


    // ==================================================
    // ROOMS
    // ==================================================

    const rooms =
        Array.isArray(
            zoneFloor.rooms
        )
            ? zoneFloor.rooms
            : [];


    if (
        rooms.length === 0
    ) {

        console.warn(
            "⚠️ NO ROOMS AVAILABLE"
        );

        return;
    }


    // ==================================================
    // TRY CURRENT SELECTED ROOM
    // ==================================================

    let room =
        window.selectedRoom;


    if (
        room
    ) {

        room =
            rooms.find(
                r =>
                    r.id === room.id
            );
    }


    // ==================================================
    // ONE ROOM
    // ==================================================

    if (!room) {

        if (
            rooms.length === 1
        ) {

            room =
                rooms[0];

        }

        else {

            // ------------------------------------------
            // MULTIPLE ROOMS
            // ------------------------------------------

            openZoneRoomSelector(
                rooms
            );

            return;
        }
    }


    // ==================================================
    // SYNC SELECTED ROOM
    // ==================================================

    AppState.ui.selectedRoom =
        room;

    window.selectedRoom =
        room;


    AppState.ui.selectedZone =
        null;

    window.selectedZone =
        null;


    // ==================================================
    // ROOM ZONES
    // ==================================================

    const roomZones =
        (zoneFloor.zones || [])
            .filter(
                z =>
                    z.roomId === room.id
            );


    console.log(
        "🔥 ZONE ROOM",
        {
            id:
                room.id,

            code:
                room.code,

            zones:
                roomZones.length
        }
    );


    // ==================================================
    // NO ZONES
    // ==================================================

    if (
        roomZones.length === 0
    ) {

        showZoneCreationHelp(
            room
        );

        return;
    }


    // ==================================================
    // EXISTING ZONES
    // ==================================================

    openRoomZonesPopup(
        room.id
    );
}

async function saveZoneHours(
    zoneId,
    roomId
) {

    console.error(
        "🔥 SAVE ZONE HOURS START",
        {
            zoneId,
            roomId
        }
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (
        !floor ||
        !Array.isArray(
            floor.zones
        )
    ) {

        console.error(
            "❌ SAVE ZONE HOURS — NO FLOOR"
        );

        return false;
    }


    // ==================================================
    // FIND CANONICAL ZONE
    // ==================================================

    const zone =
        floor.zones.find(
            z =>
                z.id === zoneId
        );


    if (
        !zone
    ) {

        console.error(
            "❌ SAVE ZONE HOURS — ZONE NOT FOUND",
            zoneId
        );

        return false;
    }


    // ==================================================
    // INPUT
    // ==================================================

    const input =
        document.getElementById(
            `zoneHours_${zoneId}`
        );


    if (
        !input
    ) {

        console.error(
            "❌ SAVE ZONE HOURS — INPUT NOT FOUND",
            `zoneHours_${zoneId}`
        );

        return false;
    }


    // ==================================================
    // READ VALUE
    // ==================================================

    const rawValue =
        input.value.trim();


    let hours =
        null;


    if (
        rawValue !== ""
    ) {

        const parsed =
            Number(
                rawValue
            );


        if (
            !Number.isFinite(
                parsed
            ) ||
            parsed < 0 ||
            parsed > 24
        ) {

            console.error(
                "❌ INVALID EXPOSURE HOURS",
                rawValue
            );

            return false;
        }


        hours =
            parsed;
    }


    // ==================================================
    // 🔥 WRITE DIRECTLY TO CANONICAL ZONE
    // ==================================================

    zone.hoursPerDay =
        hours;


    console.error(
        "🔥 ZONE HOURS WRITTEN",
        {
            zoneId:
                zone.id,

            zoneType:
                zone.type,

            hoursPerDay:
                zone.hoursPerDay,

            occupancy:
                getOccupancy(
                    zone.hoursPerDay
                )
        }
    );


    // ==================================================
    // EXIT EDIT MODE
    // ==================================================

    window.editingZoneHoursId =
        null;


    // ==================================================
    // SAVE COMPLETE PROJECT
    // ==================================================

    try {

        const saved =
            await saveProject();


        if (
            saved === false
        ) {

            console.error(
                "❌ SAVE ZONE HOURS — PROJECT SAVE FAILED"
            );

            return false;
        }

    }
    catch (
    error
    ) {

        console.error(
            "❌ SAVE ZONE HOURS ERROR",
            error
        );

        return false;
    }


    // ==================================================
    // VERIFY AFTER SAVE
    // ==================================================

    const verifyFloor =
        getCurrentFloor?.();


    const verifyZone =
        (verifyFloor?.zones || [])
            .find(
                z =>
                    z.id === zoneId
            );


    console.error(
        "🔥 ZONE HOURS AFTER SAVE",
        {
            zoneId,
            hoursPerDay:
                verifyZone?.hoursPerDay,
            occupancy:
                getOccupancy(
                    verifyZone?.hoursPerDay
                )
        }
    );


    // ==================================================
    // UI
    // ==================================================

    requestRender?.();


    openRoomZonesPopup(
        roomId
    );


    return true;
}

function closeRoomZonesPopup() {

    const popup =
        document.getElementById(
            "roomZonesPopup"
        );


    if (!popup) {

        return;
    }


    // ==================================================
    // 🔥 MOVE OUT OF CANVAS / TRANSFORMED CONTAINER
    // ==================================================
    //
    // The zone popup must never remain inside
    // #canvasWrap because canvasWrap has its own transform.
    //

    if (
        popup.parentElement !==
        document.body
    ) {

        document.body.appendChild(
            popup
        );
    }


    // ==================================================
    // 🔥 HIDE OVERLAY
    // ==================================================

    popup.style.setProperty(
        "display",
        "none",
        "important"
    );


    popup.style.setProperty(
        "pointer-events",
        "none",
        "important"
    );


    // ==================================================
    // 🔥 RESET FULLSCREEN GEOMETRY
    // ==================================================
    //
    // These values prevent the old canvasWrap geometry
    // from surviving until the next opening.
    //

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "inset",
        "0",
        "important"
    );

    popup.style.setProperty(
        "top",
        "0",
        "important"
    );

    popup.style.setProperty(
        "right",
        "0",
        "important"
    );

    popup.style.setProperty(
        "bottom",
        "0",
        "important"
    );

    popup.style.setProperty(
        "left",
        "0",
        "important"
    );

    popup.style.setProperty(
        "width",
        "100vw",
        "important"
    );

    popup.style.setProperty(
        "height",
        "100vh",
        "important"
    );

    popup.style.setProperty(
        "max-width",
        "none",
        "important"
    );

    popup.style.setProperty(
        "max-height",
        "none",
        "important"
    );

    popup.style.setProperty(
        "transform",
        "none",
        "important"
    );


    // ==================================================
    // 🔥 CLEAR ZONE POPUP STATE
    // ==================================================

    if (
        AppState?.ui
    ) {

        AppState.ui.selectedZone =
            null;

        AppState.ui.zoneDraft =
            null;
    }


    window.selectedZone =
        null;

    window.zone =
        null;


    // ==================================================
    // 🔥 CLEAR ACTIVE ZONE DRAWING STATE
    // ==================================================

    window.draggingZoneVertex =
        false;

    window.draggedVertexIndex =
        -1;


    // ==================================================
    // 🔥 RESTORE CANVAS INTERACTION
    // ==================================================

    if (
        window.canvas
    ) {

        window.canvas.style.pointerEvents =
            "auto";

        window.canvas.style.cursor =
            "default";
    }


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();


    console.log(
        "✅ ROOM ZONES POPUP CLOSED",
        {
            display:
                getComputedStyle(
                    popup
                ).display,

            parent:
                popup.parentElement?.id ||
                popup.parentElement?.tagName,

            pointerEvents:
                getComputedStyle(
                    popup
                ).pointerEvents
        }
    );
}

function openZoneRoomSelector(
    rooms
) {

    console.log(
        "🔥 OPEN ZONE ROOM SELECTOR",
        rooms
    );


    // ==================================================
    // POPUP
    // ==================================================

    let popup =
        document.getElementById(
            "roomZonesPopup"
        );


    if (!popup) {

        console.error(
            "❌ ROOM ZONES POPUP NOT FOUND"
        );

        return;
    }


    // ==================================================
    // 🔥 MOVE POPUP DIRECTLY TO BODY
    // ==================================================
    //
    // This is critical.
    // #canvasWrap has its own coordinate system / transform.
    // The modal must NOT live inside it.
    //

    if (
        popup.parentElement !==
        document.body
    ) {

        document.body.appendChild(
            popup
        );
    }


    // ==================================================
    // 🔥 RESET OLD POPUP GEOMETRY
    // ==================================================

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "inset",
        "0",
        "important"
    );

    popup.style.setProperty(
        "top",
        "0",
        "important"
    );

    popup.style.setProperty(
        "right",
        "0",
        "important"
    );

    popup.style.setProperty(
        "bottom",
        "0",
        "important"
    );

    popup.style.setProperty(
        "left",
        "0",
        "important"
    );

    popup.style.setProperty(
        "width",
        "100vw",
        "important"
    );

    popup.style.setProperty(
        "height",
        "100vh",
        "important"
    );

    popup.style.setProperty(
        "min-width",
        "0",
        "important"
    );

    popup.style.setProperty(
        "min-height",
        "0",
        "important"
    );

    popup.style.setProperty(
        "max-width",
        "none",
        "important"
    );

    popup.style.setProperty(
        "max-height",
        "none",
        "important"
    );

    popup.style.setProperty(
        "margin",
        "0",
        "important"
    );

    popup.style.setProperty(
        "padding",
        "12px",
        "important"
    );

    popup.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

    popup.style.setProperty(
        "transform",
        "none",
        "important"
    );

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );

    popup.style.setProperty(
        "align-items",
        "center",
        "important"
    );

    popup.style.setProperty(
        "justify-content",
        "center",
        "important"
    );

    popup.style.setProperty(
        "background",
        "rgba(42, 15, 37, 0.28)",
        "important"
    );

    popup.style.setProperty(
        "overflow-y",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "z-index",
        "999999",
        "important"
    );


    // ==================================================
    // ROOM LIST
    // ==================================================

    const safeRooms =
        Array.isArray(rooms)
            ? rooms
            : [];


    if (
        safeRooms.length === 0
    ) {

        console.warn(
            "⚠ NO ROOMS AVAILABLE FOR ZONE MANAGEMENT"
        );

        return;
    }


    // ==================================================
    // HTML
    // ==================================================

    popup.innerHTML = `

        <div
            class="room-zones-popup-card"
            style="
                position:relative;

                width:420px;
                max-width:calc(100vw - 24px);

                max-height:calc(100vh - 24px);

                margin:0;

                box-sizing:border-box;

                background:#ffffff;

                border:
                    1px solid #e2e8f0;

                border-radius:14px;

                box-shadow:
                    0 18px 45px
                    rgba(15,23,42,.20);

                overflow-y:auto;
            "
        >

            <!-- =========================================
                 HEADER
                 ========================================= -->

            <div
                class="room-zones-popup-header"
                style="
                    display:flex;

                    align-items:center;

                    justify-content:space-between;

                    padding:
                        14px 14px 10px 14px;
                "
            >

                <b
                    style="
                        font-size:17px;
                        line-height:1.2;

                        color:#0f172a;
                    "
                >
                    Add / Manage Zones
                </b>


                <button
                    type="button"
                    id="zoneRoomSelectorCloseButton"
                    aria-label="Close"
                    style="
                        width:30px;
                        height:30px;

                        padding:0;

                        border:0;

                        background:transparent;

                        color:#64748b;

                        font-size:21px;

                        line-height:1;

                        cursor:pointer;
                    "
                >
                    ✕
                </button>

            </div>


            <!-- =========================================
                 DESCRIPTION
                 ========================================= -->

            <div
                style="
                    padding:
                        0 14px 10px 14px;

                    font-size:11px;

                    line-height:1.4;

                    color:#64748b;
                "
            >
                Select a room to manage its zones.
            </div>


            <!-- =========================================
                 ROOM LIST
                 ========================================= -->

            <div
                id="zoneRoomSelectorList"
                style="
                    display:flex;

                    flex-direction:column;

                    gap:6px;

                    padding:
                        0 14px 14px 14px;
                "
            >

                ${safeRooms.map(
        room => `

                        <button
                            type="button"
                            class="zone-room-selector-button"
                            data-room-id="${String(
            room.id
        ).replace(
            /"/g,
            "&quot;"
        )}"
                            style="
                                width:100%;

                                min-height:38px;

                                padding:
                                    8px 10px;

                                box-sizing:border-box;

                                border:
                                    1px solid #dbe3ea;

                                border-radius:8px;

                                background:#ffffff;

                                color:#334155;

                                font-size:11px;

                                font-weight:500;

                                text-align:left;

                                cursor:pointer;
                            "
                        >

                            <span
                                style="
                                    color:#2563eb;

                                    font-weight:600;

                                    margin-right:6px;
                                "
                            >
                                ${room.code}
                            </span>

                            ${room.name || "Room"}

                        </button>

                    `
    ).join("")}

            </div>

        </div>

    `;



    popup
        .querySelectorAll(
            ".zone-delete-cancel-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        const roomId =
                            this.dataset.roomId;

                        window.pendingDeleteZoneId =
                            null;

                        openRoomZonesPopup(
                            roomId
                        );
                    }
                );
            }
        );


    popup
        .querySelectorAll(
            ".zone-delete-confirm-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        const zoneId =
                            this.dataset.zoneId;

                        const roomId =
                            this.dataset.roomId;

                        console.error(
                            "🔥🔥 CONFIRM DELETE",
                            {
                                zoneId,
                                roomId
                            }
                        );

                        const floor =
                            getCurrentFloor?.();

                        const foundZone =
                            (floor?.zones || [])
                                .find(
                                    z =>
                                        z.id ===
                                        zoneId
                                );

                        if (!foundZone) {

                            console.error(
                                "❌ ZONE NOT FOUND",
                                zoneId
                            );

                            return;
                        }

                        AppState.ui.selectedZone =
                            foundZone;

                        window.selectedZone =
                            foundZone;

                        window.pendingDeleteZoneId =
                            null;

                        await deleteSelectedZone();

                        openRoomZonesPopup(
                            roomId
                        );
                    }
                );
            }
        );

    // ==================================================
    // CLOSE
    // ==================================================

    const closeSelector =
        () => {

            closeRoomZonesPopup?.();

            requestRender?.();
        };


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    const closeButton =
        document.getElementById(
            "zoneRoomSelectorCloseButton"
        );


    closeButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeSelector();
        }
    );


    // ==================================================
    // ROOM BUTTONS
    // ==================================================

    const roomButtons =
        popup.querySelectorAll(
            ".zone-room-selector-button"
        );


    roomButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    const roomId =
                        button.dataset.roomId;


                    // ------------------------------------------
                    // FIND CURRENT ROOM OBJECT
                    // ------------------------------------------

                    const selectedRoom =
                        (
                            getCurrentFloor?.()
                                ?.rooms ||
                            []
                        ).find(
                            room =>
                                String(
                                    room.id
                                ) ===
                                String(
                                    roomId
                                )
                        );


                    if (!selectedRoom) {

                        console.error(
                            "❌ ZONE ROOM SELECTOR — ROOM NOT FOUND",
                            roomId
                        );

                        return;
                    }


                    // ------------------------------------------
                    // SAVE ROOM SELECTION
                    // ------------------------------------------

                    AppState.ui.selectedRoom =
                        selectedRoom;

                    window.selectedRoom =
                        selectedRoom;


                    AppState.ui.selectedZone =
                        null;

                    window.selectedZone =
                        null;


                    // ------------------------------------------
                    // CHECK EXISTING ZONES
                    // ------------------------------------------

                    const roomZones =
                        (
                            getCurrentFloor?.()
                                ?.zones ||
                            []
                        ).filter(
                            zone =>
                                zone.roomId ===
                                selectedRoom.id
                        );


                    console.log(
                        "🔥 ZONE ROOM SELECTED",
                        {
                            room:
                                selectedRoom,

                            zones:
                                roomZones.length
                        }
                    );


                    // ------------------------------------------
                    // NO ZONES YET
                    // ------------------------------------------

                    if (
                        roomZones.length === 0
                    ) {

                        showZoneCreationHelp(
                            selectedRoom
                        );

                        return;
                    }


                    // ------------------------------------------
                    // EXISTING ZONES
                    // ------------------------------------------

                    openRoomZonesPopup(
                        selectedRoom.id
                    );
                }
            );
        }
    );


    // ==================================================
    // ESC
    // ==================================================

    if (
        popup._zoneRoomSelectorEscapeHandler
    ) {

        document.removeEventListener(
            "keydown",
            popup._zoneRoomSelectorEscapeHandler
        );
    }


    const escapeHandler =
        event => {

            if (
                popup.style.display ===
                "none"
            ) {

                return;
            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();

                closeSelector();
            }
        };


    popup._zoneRoomSelectorEscapeHandler =
        escapeHandler;


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    // ==================================================
    // SHOW
    // ==================================================

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );


    console.log(
        "🔥 ZONE ROOM SELECTOR OPENED",
        {
            parent:
                popup.parentElement?.tagName,

            parentId:
                popup.parentElement?.id,

            position:
                getComputedStyle(
                    popup
                ).position,

            transform:
                getComputedStyle(
                    popup
                ).transform,

            width:
                getComputedStyle(
                    popup
                ).width,

            height:
                getComputedStyle(
                    popup
                ).height
        }
    );
}

function showZoneCreationHelp(
    room
) {

    console.error(
        "🔥 SHOW ZONE CREATION START",
        room
    );


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !room ||
        !room.id
    ) {

        console.error(
            "❌ ZONE CREATION — NO ROOM"
        );

        return;
    }


    // ==================================================
    // DEFAULT ZONE TYPE
    // ==================================================

    window.selectedZoneType =
        window.selectedZoneType ||
        "sleep";


    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "roomZonesPopup"
        );


    if (!popup) {

        console.error(
            "❌ ROOM ZONES POPUP NOT FOUND"
        );

        return;
    }


    // ==================================================
    // REMOVE PREVIOUS ESC HANDLER
    // ==================================================

    if (
        popup._zoneEscapeHandler
    ) {

        document.removeEventListener(
            "keydown",
            popup._zoneEscapeHandler
        );

        popup._zoneEscapeHandler =
            null;
    }


    popup.style.position =
        "fixed";

    popup.style.top =
        "0";

    popup.style.left =
        "0";

    popup.style.right =
        "0";

    popup.style.bottom =
        "0";

    popup.style.width =
        "100vw";

    popup.style.height =
        "100vh";

    popup.style.setProperty(
        "pointer-events",
        "auto",
        "important"
    );

    popup.style.setProperty(
        "display",
        "flex",
        "important"
    );

    popup.style.alignItems =
        "center";

    popup.style.justifyContent =
        "center";

    popup.style.transform =
        "none";


    popup.style.padding =
        "0";

    popup.style.zIndex =
        "999999";

    // ==================================================
    // POPUP HTML
    // ==================================================

    popup.innerHTML = `

        <div
            class="room-zones-popup-card"
            style="
                width:470px;
                max-width:calc(100vw - 24px);
                max-height:calc(100vh - 24px);

                box-sizing:border-box;

                margin-top:0;

                position: relative;
margin: 0;

                background:#ffffff;

                border:1px solid #e2e8f0;

                border-radius:14px;

                box-shadow:
                    0 18px 45px rgba(15,23,42,.20);

                overflow-y:auto;
            "
        >

            <!-- =========================================
                 HEADER
                 ========================================= -->

            <div
                class="room-zones-popup-header"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;

                    padding:14px 14px 10px 14px;

                    cursor:default;
                "
            >

                <b
                    style="
                        font-size:18px;
                        line-height:1.2;
                        color:#0f172a;
                    "
                >
                    ✏️ Zone Creation Active
                </b>


                <button
                    type="button"
                    id="zoneCreationCloseButton"
                    aria-label="Close"
                    style="
                        width:30px;
                        height:30px;

                        padding:0;

                        border:0;

                        background:transparent;

                        color:#64748b;

                        font-size:22px;
                        line-height:1;

                        cursor:pointer;
                    "
                >
                    ✕
                </button>

            </div>


            <!-- =========================================
                 CONTENT
                 ========================================= -->

            <div
                class="zone-create-help"
                style="
                    padding:0 14px 12px 14px;
                "
            >

                <!-- =========================================
                     SELECTED ROOM
                     ========================================= -->

                <div
                    class="selected-room-box"
                    style="
                        padding:9px 10px;

                        border:1px solid #dbe3ec;
                        border-radius:8px;

                        background:#f8fafc;

                        margin-bottom:12px;
                    "
                >

                    <div
                        style="
                            font-size:10px;
                            line-height:1.2;
                            color:#64748b;

                            margin-bottom:3px;
                        "
                    >
                        Selected Room
                    </div>


                    <b
                        style="
                            font-size:13px;
                            line-height:1.3;
                            color:#1e293b;
                        "
                    >
                        ${room.code}
                        -
                        ${room.name || "Room"}
                    </b>

                </div>


                <!-- =========================================
                     ZONE TYPE
                     ========================================= -->

                <div
                    class="zone-type-section"
                >

                    <div
                        class="zone-type-title"
                        style="
                            font-size:12px;
                            font-weight:600;
                            color:#334155;

                            margin-bottom:7px;
                        "
                    >
                        Zone Type
                    </div>


                    <div
                        class="zone-type-buttons"
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(4, minmax(0, 1fr));

                            gap:7px;
                        "
                    >

                        <button
                            type="button"
                            class="
                                zone-type-btn
                                ${window.selectedZoneType === "sleep"
            ? "active"
            : ""
        }
                            "
                            data-zone-type="sleep"
                            style="
                                min-height:36px;
                                padding:6px 5px;

                                border-radius:7px;

                                cursor:pointer;
                            "
                        >
                            🛏️ Sleep
                        </button>


                        <button
                            type="button"
                            class="
                                zone-type-btn
                                ${window.selectedZoneType === "rest"
            ? "active"
            : ""
        }
                            "
                            data-zone-type="rest"
                            style="
                                min-height:36px;
                                padding:6px 5px;

                                border-radius:7px;

                                cursor:pointer;
                            "
                        >
                            🛋️ Rest
                        </button>


                        <button
                            type="button"
                            class="
                                zone-type-btn
                                ${window.selectedZoneType === "work"
            ? "active"
            : ""
        }
                            "
                            data-zone-type="work"
                            style="
                                min-height:36px;
                                padding:6px 5px;

                                border-radius:7px;

                                cursor:pointer;
                            "
                        >
                            💻 Work
                        </button>


                        <button
                            type="button"
                            class="
                                zone-type-btn
                                ${window.selectedZoneType === "child"
            ? "active"
            : ""
        }
                            "
                            data-zone-type="child"
                            style="
                                min-height:36px;
                                padding:6px 5px;

                                border-radius:7px;

                                cursor:pointer;
                            "
                        >
                            🧸 Child
                        </button>

                    </div>

                </div>


                <!-- =========================================
                     INSTRUCTIONS
                     ========================================= -->

                <div
                    class="zone-create-instructions"
                    style="
                        margin-top:12px;

                        font-size:13px;
                        line-height:1.65;

                        color:#475569;
                    "
                >

                    <div>
                        • Click to place points
                    </div>

                    <div>
                        • Minimum 3 points
                    </div>

                    <div>
                        • Double-click to finish
                    </div>

                    <div>
                        • Zone must stay inside room
                    </div>

                </div>

            </div>


            <!-- =========================================
                 ACTIONS
                 ========================================= -->

            <div
                class="zone-create-actions"
                style="
                    display:flex;

                    justify-content:flex-end;

                    gap:8px;

                    padding:
                        0 14px 14px 14px;
                "
            >

                <button
                    type="button"
                    id="zoneCreationCancelButton"
                    class="popup-cancel-btn"
                    style="
                        min-width:105px;
                        height:38px;

                        padding:7px 14px;

                        border:1px solid #cbd5e1;
                        border-radius:8px;

                        background:#ffffff;
                        color:#64748b;

                        font-size:12px;
                        font-weight:500;

                        cursor:pointer;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="zoneCreationStartButton"
                    class="popup-proceed-btn"
                    style="
                        min-width:140px;
                        height:38px;

                        padding:7px 14px;

                        border:1px solid #2563eb;
                        border-radius:8px;

                        background:#2563eb;
                        color:#ffffff;

                        font-size:12px;
                        font-weight:600;

                        cursor:pointer;
                    "
                >
                    Start Drawing
                </button>

            </div>

        </div>

    `;


    // ==================================================
    // ELEMENTS
    // ==================================================

    const startButton =
        document.getElementById(
            "zoneCreationStartButton"
        );


    const cancelButton =
        document.getElementById(
            "zoneCreationCancelButton"
        );


    const closeButton =
        document.getElementById(
            "zoneCreationCloseButton"
        );


    const zoneTypeButtons =
        popup.querySelectorAll(
            "[data-zone-type]"
        );


    // ==================================================
    // CLOSE / CANCEL
    // ==================================================

    const cancelZoneCreation =
        () => {

            AppState.ui.mode =
                "idle";

            closeRoomZonesPopup();

            requestRender?.();
        };


    // ==================================================
    // START DRAWING
    // ==================================================

    const startDrawing =
        () => {

            console.error(
                "🔥 START DRAWING CLICK",
                {
                    roomId:
                        room.id,

                    roomCode:
                        room.code,

                    zoneType:
                        window.selectedZoneType
                }
            );


            const foundRoom =
                (
                    getCurrentFloor?.()
                        ?.rooms ||
                    []
                ).find(
                    r =>
                        r.id ===
                        room.id
                );


            if (!foundRoom) {

                console.error(
                    "❌ START DRAWING — ROOM NOT FOUND",
                    room.id
                );

                return;
            }


            AppState.ui.selectedRoom =
                foundRoom;

            AppState.ui.selectedZone =
                null;


            window.selectedRoom =
                foundRoom;

            window.selectedZone =
                null;


            AppState.ui.mode =
                "zone";


            closeRoomZonesPopup();

            requestRender?.();
        };


    // ==================================================
    // ZONE TYPE BUTTONS
    // ==================================================

    zoneTypeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const type =
                        button.dataset.zoneType;


                    selectZoneType(
                        type
                    );
                }
            );
        }
    );


    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    startButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            startDrawing();
        }
    );


    cancelButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            cancelZoneCreation();
        }
    );


    closeButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            cancelZoneCreation();
        }
    );


    // ==================================================
    // ESC / ENTER
    // ==================================================

    const zoneKeyboardHandler =
        event => {

            if (
                popup.style.display !==
                "flex"
            ) {

                return;
            }


            // ------------------------------------------
            // ESC
            // ------------------------------------------

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();

                cancelZoneCreation();

                return;
            }


            // ------------------------------------------
            // ENTER
            // ------------------------------------------

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                event.stopPropagation();

                startDrawing();
            }
        };


    popup._zoneEscapeHandler =
        zoneKeyboardHandler;


    document.addEventListener(
        "keydown",
        zoneKeyboardHandler
    );


    // ==================================================
    // CLICK OUTSIDE
    //
    // Do NOT close on overlay click accidentally.
    // The user must use Cancel / X / Escape.
    // ==================================================

    popup.addEventListener(
        "mousedown",
        event => {

            if (
                event.target ===
                popup
            ) {

                event.preventDefault();
            }
        }
    );


    // ==================================================
    // SHOW
    // ==================================================

    console.error(
        "🔥 ZONE CREATION POPUP OPENED",
        {
            roomId:
                room.id,

            roomName:
                room.name,

            zoneType:
                window.selectedZoneType
        }
    );
}


function selectZoneType(type) {

    console.log(
        "🔥 ZONE TYPE SELECTED",
        type
    );

    if (
        ![
            "sleep",
            "rest",
            "work",
            "child"
        ].includes(type)
    ) {

        console.error(
            "❌ INVALID ZONE TYPE",
            type
        );

        return;
    }


    window.selectedZoneType =
        type;


    // ==================================================
    // CURRENT ROOM
    // ==================================================

    const room =
        AppState.ui?.selectedRoom ||
        window.selectedRoom;


    if (!room) {

        console.error(
            "❌ NO SELECTED ROOM"
        );

        return;
    }


    // ==================================================
    // REFRESH CREATION POPUP
    // ==================================================

    showZoneCreationHelp(
        room
    );
}


function updateZoneStatusUI() {

    const floor =
        getCurrentFloor();

    if (!floor) return;

    const el =
        document.getElementById(
            "zoneStatus"
        );

    if (!el) return;

    let html = "";
    html += `
      <div style="
        font-size:13px;
        font-weight:bold;
        margin-bottom:10px;
        color:#93c5fd;
      ">
        Measurement Progress
      </div>
      `;

    (floor.zones || []).forEach(zone => {

        const total =
            (zone.grid || []).length;

        let measured = 0;

        (zone.grid || []).forEach(p => {

            if (
                p.measurements?.[sessionId]
            ) {
                measured++;
            }
        });

        html += `

      <div style="margin-bottom:6px;">
        🟣 ${zone.type}
        ${measured}/${total}
      </div>
    `;
    });

    console.log(
        "HTML:",
        html
    );

    console.error(
        "FINAL HTML",
        html
    );

    el.innerHTML = html;

    console.error(
        "ROOM PANEL HTML",
        el.innerHTML
    );

    console.error(html);
}


// =====================================================
// CREATE / EDIT
// =====================================================

function finishZone() {

    console.error(
        "FINISH ZONE RUN"
    );

    console.trace("FINISH START");

    console.error(
        "FINISH CURRENT ZONE",
        AppState.ui.zoneDraft
    );

    console.error(
        "ZONE TYPE AT FINISH",
        AppState.ui.zoneDraft?.type
    );

    console.error(
        "FINISH CURRENT ZONE ID",
        AppState.ui.zoneDraft?.id
    );

    // 🔥 nothing drawn
    if (
        !AppState.ui.zoneDraft ||
        !AppState.ui.zoneDraft.polygon ||
        AppState.ui.zoneDraft.polygon.length < 3
    ) {

        alert(
            "Draw zone first"
        );

        return;
    }

    const floor =
        getCurrentFloor();

    if (!floor) {
        return;
    }

    const zone =
        AppState.ui.zoneDraft;

    // 🔥 ensure zones array
    floor.zones =
        floor.zones || [];

    // =====================
    // 🔥 AUTO ZONE GRID
    // =====================
    //
    // Zone Grid is generated automatically
    // when the Zone is finished.
    //
    // Grid size is selected from the
    // Zone polygon area.
    //

    const zoneArea =
        getRoomArea(
            zone
        );

    console.log(
        "ZONE AREA",
        zoneArea
    );

    if (zoneArea < 3) {

        zone.gridSize =
            0.7;

    }
    else if (zoneArea < 8) {

        zone.gridSize =
            0.8;

    }
    else {

        zone.gridSize =
            1;
    }

    console.log(
        "AUTO ZONE GRID SIZE",
        zone.gridSize
    );

    // Generate actual Zone measurement points.
    generateZoneGrid(
        zone
    );

    // Small-zone fallback.
    // If the selected spacing produces
    // fewer than 4 points, retry at 0.5 m.
    if (
        zone.grid.length < 4 &&
        zone.gridSize > 0.5
    ) {

        zone.gridSize =
            0.5;

        console.log(
            "ZONE GRID FALLBACK",
            zone.gridSize
        );

        generateZoneGrid(
            zone
        );
    }

    console.log(
        "ZONE GRID GENERATED",
        {
            zoneId:
                zone.id,

            gridSize:
                zone.gridSize,

            gridLength:
                zone.grid?.length
        }
    );
    // =====================
    // 🔥 DISABLE ROOM POINTS
    // =====================

    (floor.rooms || []).forEach(room => {

        (room.grid || []).forEach(p => {

            if (
                pointInPolygon(
                    p,
                    zone.polygon
                )
            ) {

                p.zoneId =
                    zone.id;
            }
        });

    });

    console.error(
        "BEFORE ROOM LINK",
        zone
    );

    zone.floorIndex =
        AppState.project.currentFloorIndex;

    // 🔥 save zone

    let parentRoom = null;

    for (const room of floor.rooms || []) {

        const fullyInside =
            zone.polygon.every(pt =>
                pointInPolygon(
                    pt,
                    room.polygon
                )
            );

        if (fullyInside) {

            parentRoom = room;
            break;
        }
    }

    if (!parentRoom) {

        alert(
            "Zone must remain inside room boundaries"
        );

        return;
    }

    let room = null;

    for (const r of floor.rooms || []) {

        const fullyInside =
            zone.polygon.every(
                pt =>
                    pointInPolygon(
                        pt,
                        r.polygon
                    )
            );

        if (fullyInside) {

            room = r;
            break;
        }
    }

    if (!room) {

        alert(
            "Zone must remain inside room boundaries"
        );

        return;
    }

    if (room) {

        zone.roomId =
            room.id;

        zone.roomCode =
            room.code;
    }

    console.error(
        "BEFORE PUSH",
        floor.zones,
        zone
    );

    console.error(
        "BEFORE PUSH",
        zone
    );

    console.error(
        "CURRENT ZONE ID",
        zone?.id
    );

    // 🔥 DEFAULT HOURS

    console.log(
        "ZONE OCCUPANCY:",
        zone.occupancy
    );

    console.log(
        "ZONE HOURS:",
        zone.hoursPerDay
    );

    // 🔥 DEFAULT HOURS

    if (
        zone.hoursPerDay ===
        undefined
    ) {

        zone.hoursPerDay =
            null;
    }

    floor.zones.push(
        zone
    );

    AppState.ui.selectedZone = null;

    // TEMP MIGRATION
    window.selectedZone = AppState.ui.selectedZone;

    console.error(
        "ZONE SAVED",
        zone.id
    );

    console.error(
        "AFTER PUSH",
        floor.zones.length
    );

    // 🔥 AUTO UPDATE SOURCES

    AppState.project.floors.forEach(
        floor => {

            (floor.sources || []).forEach(
                source => {

                    // 🔥 tik tas pats aukštas

                    if (
                        source.floorIndex !==
                        zone.floorIndex
                    ) {

                        return;
                    }

                    if (
                        !source.linkedZoneIds
                    ) {
                        source.linkedZoneIds = [];
                    }

                    if (
                        !source.linkedZoneIds.includes(
                            zone.id
                        )
                    ) {

                        source.linkedZoneIds.push(
                            zone.id
                        );
                    }
                }
            );
        }
    );

    updateStatus(
        "✅ Zone created"
    );

    AppState.ui.selectedRoom = room;

    // TEMP
    window.selectedRoom =
        AppState.ui.selectedRoom;

    AppState.ui.selectedZone = zone;

    // TEMP MIGRATION
    window.selectedZone = AppState.ui.selectedZone;

    AppState.ui.mode =
        "idle";

    AppState.ui.zoneDraft = null;

    // TEMP
    window.zone =
        AppState.ui.zoneDraft;

    console.error("AFTER NULL", zone);

    // 🔥 refresh

    saveProject?.();

    window.updateWorkflowUI?.();

    updateRoomProgressPanel?.();

    requestRender();

    console.error(
        "FINAL FLOOR ZONES",
        floor.zones
    );

    updateProgressUI?.();
}




function cancelZone() {

    AppState.ui.zoneDraft = null;

    // TEMP
    window.zone =
        AppState.ui.zoneDraft;

    AppState.ui.selectedZone = null;

    hoveredZone = null;

    AppState.ui.mode = null;


    // 🔥 reset preview
    mouseX = null;
    mouseY = null;

    document
        .getElementById(
            "floatingFinishBtn"
        )
        ?.classList.add("hidden");

    updateStatus(
        "❌ Zone cancelled"
    );

    requestRender?.();
}





function editSelectedZone() {

    if (!AppState.ui.selectedZone) {

        alert(
            "Select zone first"
        );

        return;
    }

    // 🔥 IMPORTANT
    AppState.ui.zoneDraft = null;

    // TEMP
    window.zone =
        AppState.ui.zoneDraft;

    draggingZone = false;

    AppState.ui.mode = "editZone";

    document
        .getElementById(
            "btnEditZone"
        )
        ?.classList.add("active");

    updateStatus(
        "✏ Drag selected zone"
    );

    requestRender?.();
}

async function deleteSelectedZone() {

    console.error(
        "🔥 DELETE ZONE FUNCTION ENTERED"
    );


    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (
        !floor ||
        !Array.isArray(
            floor.zones
        )
    ) {

        console.error(
            "❌ DELETE ZONE — NO FLOOR / ZONES"
        );

        return false;
    }


    // ==================================================
    // SELECTED ZONE
    // ==================================================

    const selectedZone =
        AppState.ui?.selectedZone ||
        window.selectedZone;


    if (
        !selectedZone
    ) {

        alert(
            "Select a zone first"
        );

        return false;
    }


    const zoneId =
        selectedZone.id;


    // ==================================================
    // 🔥 IMPORTANT
    // SYNC ALL OPEN ZONE HOURS BEFORE DELETE
    // ==================================================

    console.error(
        "🔥 SYNCING ZONE HOURS BEFORE DELETE"
    );


    floor.zones.forEach(
        zone => {

            const input =
                document.getElementById(
                    `zoneHours_${zone.id}`
                );


            if (!input) {
                return;
            }


            const rawValue =
                input.value.trim();


            let hours =
                null;


            if (
                rawValue !== ""
            ) {

                const parsed =
                    Number(
                        rawValue
                    );


                if (
                    Number.isFinite(
                        parsed
                    ) &&
                    parsed >= 0 &&
                    parsed <= 24
                ) {

                    hours =
                        parsed;
                }
            }


            zone.hoursPerDay =
                hours;


            console.error(
                "🔥 ZONE HOURS SYNC",
                {
                    zoneId:
                        zone.id,

                    type:
                        zone.type,

                    hoursPerDay:
                        zone.hoursPerDay,

                    occupancy:
                        getOccupancy?.(
                            zone.hoursPerDay
                        )
                }
            );
        }
    );


    // ==================================================
    // FIND ZONE BY ID
    // ==================================================

    const deletedZone =
        floor.zones.find(
            zone =>
                zone.id === zoneId
        );


    if (
        !deletedZone
    ) {

        console.error(
            "❌ DELETE ZONE — ZONE NOT FOUND",
            zoneId
        );

        return false;
    }


    // ==================================================
    // DEBUG BEFORE DELETE
    // ==================================================

    console.error(
        "🔥 ZONES BEFORE DELETE",
        floor.zones.map(
            zone => ({
                id:
                    zone.id,

                type:
                    zone.type,

                hoursPerDay:
                    zone.hoursPerDay
            })
        )
    );


    // ==================================================
    // DELETE ONLY SELECTED ZONE
    // ==================================================

    floor.zones =
        floor.zones.filter(
            zone =>
                zone.id !== zoneId
        );


    // ==================================================
    // RESTORE ROOM GRID POINTS
    // ==================================================

    (floor.rooms || [])
        .forEach(
            room => {

                (room.grid || [])
                    .forEach(
                        point => {

                            if (
                                point.zoneId ===
                                zoneId
                            ) {

                                point.disabledByZone =
                                    false;

                                point.zoneId =
                                    null;
                            }
                        }
                    );
            }
        );


    // ==================================================
    // CLEAR SELECTION
    // ==================================================

    AppState.ui.selectedZone =
        null;

    window.selectedZone =
        null;


    // ==================================================
    // DEBUG AFTER DELETE
    // ==================================================

    console.error(
        "🔥 ZONES AFTER DELETE",
        floor.zones.map(
            zone => ({
                id:
                    zone.id,

                type:
                    zone.type,

                hoursPerDay:
                    zone.hoursPerDay,

                occupancy:
                    getOccupancy?.(
                        zone.hoursPerDay
                    )
            })
        )
    );


    // ==================================================
    // SAVE COMPLETE PROJECT
    // ==================================================

    if (
        typeof saveProject ===
        "function"
    ) {

        const saved =
            await saveProject();


        if (
            saved === false
        ) {

            console.error(
                "❌ DELETE ZONE — SAVE FAILED"
            );

            return false;
        }
    }


    // ==================================================
    // STATUS
    // ==================================================

    updateStatus(
        "🗑 Zone deleted"
    );


    // ==================================================
    // UI
    // ==================================================

    updateBusinessSourceLocks?.();

    requestRender?.();


    setTimeout(
        () => {

            updateBusinessSourceLocks?.();

        },
        50
    );


    return true;
}

// =====================================================
// GRID
// =====================================================


function generateZoneGrid(zone) {

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        console.warn(
            "ZONE GRID — current floor not available"
        );
        return;
    }


    // ==================================================
    // VALIDATE ZONE
    // ==================================================

    if (
        !zone ||
        !Array.isArray(zone.polygon) ||
        zone.polygon.length < 3
    ) {

        console.warn(
            "ZONE GRID — invalid zone polygon",
            zone
        );

        return;
    }


    // ==================================================
    // VALIDATE SCALE
    // ==================================================

    if (
        !floor.currentScale ||
        !isFinite(floor.currentScale) ||
        floor.currentScale <= 0
    ) {

        console.warn(
            "ZONE GRID — invalid floor scale",
            floor.currentScale
        );

        return;
    }


    // ==================================================
    // INITIALIZE GRID
    // ==================================================

    zone.grid = [];


    // ==================================================
    // GRID SPACING
    // ==================================================

    const spacing =
        (1 / floor.currentScale) *
        (zone.gridSize || 1);


    if (
        !spacing ||
        !isFinite(spacing) ||
        spacing <= 0
    ) {

        console.warn(
            "ZONE GRID — invalid spacing",
            {
                currentScale:
                    floor.currentScale,

                gridSize:
                    zone.gridSize,

                spacing
            }
        );

        return;
    }


    // ==================================================
    // EDGE BUFFER
    // ==================================================

    let bufferMeters =
        0.05;


    if (
        zone.gridSize >= 0.8
    ) {

        bufferMeters =
            0.20;
    }


    const bufferPx =
        (1 / floor.currentScale) *
        bufferMeters;


    console.log(
        "ZONE GRID",
        {
            zoneId:
                zone.id,

            gridSize:
                zone.gridSize,

            spacing,

            bufferMeters,

            bufferPx
        }
    );


    // ==================================================
    // POLYGON BOUNDS
    // ==================================================

    let minX =
        Infinity;

    let minY =
        Infinity;

    let maxX =
        -Infinity;

    let maxY =
        -Infinity;


    zone.polygon.forEach(
        p => {

            if (
                p.x < minX
            ) {
                minX =
                    p.x;
            }

            if (
                p.y < minY
            ) {
                minY =
                    p.y;
            }

            if (
                p.x > maxX
            ) {
                maxX =
                    p.x;
            }

            if (
                p.y > maxY
            ) {
                maxY =
                    p.y;
            }
        }
    );


    // ==================================================
    // GENERATE GRID POINTS
    // ==================================================

    for (
        let gx = minX;
        gx <= maxX;
        gx += spacing
    ) {

        for (
            let gy = minY;
            gy <= maxY;
            gy += spacing
        ) {

            const point = {
                x: gx,
                y: gy
            };


            const inside =
                pointInPolygon(
                    point,
                    zone.polygon
                );


            if (!inside) {
                continue;
            }


            /*
             * Edge buffer intentionally disabled
             * for now.
             *
             * Keep this logic available for
             * future refinement.
             */

            /*
            const edgeDistance =
                distanceToPolygonEdge(
                    point,
                    zone.polygon
                );

            if (
                edgeDistance < bufferPx
            ) {
                continue;
            }
            */


            zone.grid.push({

                id:
                    "Z" +
                    zonePointCounter++,

                type:
                    "zone",

                x:
                    gx,

                y:
                    gy,

                measurements:
                    {},

                measured:
                    false
            });
        }
    }


    // ==================================================
    // BACKWARD COMPATIBILITY / STATUS
    // ==================================================

    updateStatus?.(
        "✅ Zone grid generated"
    );


    // ==================================================
    // LINK ROOM GRID POINTS
    // ==================================================

    (floor.rooms || []).forEach(
        room => {

            (room.grid || []).forEach(
                p => {

                    if (
                        pointInPolygon(
                            {
                                x:
                                    p.x,

                                y:
                                    p.y
                            },
                            zone.polygon
                        )
                    ) {

                        p.zoneId =
                            zone.id;
                    }
                }
            );
        }
    );


    // ==================================================
    // DEBUG — SAFE
    // ==================================================

    console.log(
        "ZONE GRID GENERATED",
        {
            zoneId:
                zone.id,

            zoneType:
                zone.type,

            gridSize:
                zone.gridSize,

            gridLength:
                zone.grid.length
        }
    );


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();

    window.updateWorkflowUI?.();

    updateNextStepCard?.();
}





function generateZoneGridForSelectedZone() {

    const floor =
        getCurrentFloor?.();

    if (!floor) {
        return;
    }

    const zone =
        AppState.ui.selectedZone ||

        floor.zones?.find(
            z =>
                z &&
                z.id &&
                z.polygon?.length >= 3
        );

    if (!zone) {

        updateStatus?.(
            "Select a zone first"
        );

        return;
    }

    // ==================================================
    // ZONE AREA
    // ==================================================
    //
    // calculatePolygonArea() does not exist in the
    // current project.
    //
    // getRoomArea() already calculates polygon area
    // in m² and accepts any object containing polygon.
    //
    // Therefore the existing helper is reused here.
    // ==================================================

    const area =
        getRoomArea(
            zone
        );

    console.log(
        "ZONE AREA",
        area
    );

    if (area < 3) {

        zone.gridSize =
            0.7;

    }
    else if (area < 8) {

        zone.gridSize =
            0.8;

    }
    else {

        zone.gridSize =
            1;
    }

    console.log(
        "AUTO GRID",
        zone.gridSize
    );

    // ==================================================
    // GENERATE GRID
    // ==================================================

    generateZoneGrid(
        zone
    );

    // ==================================================
    // FALLBACK
    // ==================================================

    if (
        zone.grid.length < 4 &&
        zone.gridSize > 0.5
    ) {

        zone.gridSize =
            0.5;

        console.log(
            "ZONE GRID FALLBACK",
            zone.gridSize
        );

        generateZoneGrid(
            zone
        );
    }

    console.log(
        "ZONE GRID RESULT",
        {
            zoneId:
                zone.id,

            gridSize:
                zone.gridSize,

            gridLength:
                zone.grid?.length
        }
    );

    window.updateWorkflowUI?.();

    requestRender?.();
}




// =====================================================
// VALIDATION
// =====================================================

function roomHasZone(room, type) {

    if (!room?.polygon || !zones) return false;

    return zones.some(z => {

        if (z.type !== type) return false;
        if (!z.polygon) return false;

        // jei bent vienas zone taškas patenka į room
        return z.polygon.some(pt =>
            pointInPolygon(pt.x, pt.y, room.polygon)
        );
    });
}




function getZoneLabel(type) {

    switch (type) {

        case "sleep":
            return "🛏️ Sleep";

        case "rest":
            return "🛋️ Rest";

        case "work":
            return "💻 Work";

        case "child":
            return "🧸 Child";

        case "custom":
            return "✏️ Custom";

        default:
            return type;
    }
}



function distanceToPolygonEdge(
    a,
    b,
    c
) {

    let point;
    let polygon;

    // Naujas API
    if (
        typeof a === "object"
    ) {

        point = a;
        polygon = b;

    }
    // Senas API
    else {

        point = {
            x: a,
            y: b
        };

        polygon = c;
    }

    let min = Infinity;

    for (
        let i = 0;
        i < polygon.length;
        i++
    ) {

        const p1 = polygon[i];

        const p2 =
            polygon[
            (i + 1) %
            polygon.length
            ];

        const d =
            distancePointToSegment(
                point.x,
                point.y,
                p1.x,
                p1.y,
                p2.x,
                p2.y
            );

        min = Math.min(
            min,
            d
        );
    }

    return min;
}


// =====================
// 🔥 ZONES LAYER
// =====================
function drawZonesLayer(floor) {

    ctx.save();

    window.zoneFinishButton = null;

    if (!floor) {

        ctx.restore();

        return;
    }

    // =====================================================
    // ZONE LAYER VISIBILITY
    // =====================================================
    // Zone boundaries are controlled by the unified layer
    // visibility state.
    //
    // IMPORTANT:
    // Zone Grid is a separate layer and is intentionally
    // NOT controlled here.
    // =====================================================

    const zonesVisible =
        window.layerVisibility?.zones !== false;

    console.error(
        "ZONES LAYER VISIBILITY:",
        zonesVisible
    );

    // =====================================================
    // CURRENT ZONE PREVIEW
    // =====================================================

    if (
        zonesVisible &&
        AppState.ui.zoneDraft &&
        AppState.ui.zoneDraft.polygon &&
        AppState.ui.zoneDraft.polygon.length > 0
    ) {

        const poly =
            AppState.ui.zoneDraft.polygon;

        ctx.save();

        ctx.strokeStyle =
            "magenta";

        ctx.lineWidth =
            3;

        ctx.fillStyle =
            "rgba(255,0,255,0.10)";

        ctx.beginPath();

        const p0 =
            EMFViewport.worldPoint(
                poly[0]
            );

        ctx.moveTo(
            p0.x,
            p0.y
        );

        for (
            let i = 1;
            i < poly.length;
            i++
        ) {

            const p =
                EMFViewport.worldPoint(
                    poly[i]
                );

            ctx.lineTo(
                p.x,
                p.y
            );
        }

        // =================================================
        // PREVIEW LINE TO MOUSE
        // =================================================

        if (
            poly.length < 3
        ) {

            const mouse =
                EMFViewport.worldToScreen(
                    AppState.mouseX,
                    AppState.mouseY
                );

            ctx.lineTo(
                mouse.x,
                mouse.y
            );
        }

        if (
            poly.length >= 2
        ) {

            ctx.fill();
        }

        ctx.stroke();

        // =================================================
        // VERTICES
        // =================================================

        poly.forEach(pt => {

            const v =
                EMFViewport.worldPoint(
                    pt
                );

            ctx.beginPath();

            ctx.arc(
                v.x,
                v.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "magenta";

            ctx.fill();

        });

        // =================================================
        // FINISH BUTTON
        // =================================================

        if (
            poly.length >= 3
        ) {

            const last =
                EMFViewport.worldPoint(
                    poly[
                    poly.length - 1
                    ]
                );

            const bx =
                last.x + 16;

            const by =
                last.y - 18;

            ctx.beginPath();

            ctx.fillStyle =
                "#16a34a";

            ctx.save();

            ctx.globalCompositeOperation =
                "source-over";

            ctx.globalAlpha =
                1;

            ctx.fillRect(
                bx,
                by,
                130,
                40
            );

            ctx.restore();

            ctx.strokeStyle =
                "magenta";

            ctx.lineWidth =
                2;

            ctx.strokeRect(
                bx,
                by,
                130,
                40
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 14px Arial";

            ctx.fillText(
                "Finish Zone",
                bx + 18,
                by + 25
            );

            window.zoneFinishButton = {

                x: bx,

                y: by,

                width: 130,

                height: 40
            };
        }

        ctx.restore();
    }

    // =====================================================
    // IMPORTANT
    // =====================================================
    //
    // If Zone layer is OFF, stop here.
    //
    // This hides:
    // - Zone polygons
    // - Zone fills
    // - Zone labels
    //
    // It does NOT affect:
    // - Room Grid
    // - Zone Grid
    // - Rooms
    // - Sources
    // - Heatmap
    // =====================================================

    if (!zonesVisible) {

        ctx.restore();

        return;
    }

    console.error(
        "DRAW ZONES",
        floor.zones
    );

    // =====================================================
    // DRAW SAVED ZONES
    // =====================================================

    (floor.zones || []).forEach(zone => {

        console.error(
            "ZONE COORDINATE DEBUG",
            {
                floorId: floor.id,
                floorName: floor.name,

                zoneId: zone.id,
                zoneType: zone.type,

                polygonCount:
                    zone.polygon?.length || 0,

                polygon:
                    zone.polygon || [],

                polygonScreen:
                    EMFViewport.worldPoints(
                        zone.polygon || []
                    ),

                viewport: {
                    imageWidth:
                        EMFViewport.imageWidth,

                    imageHeight:
                        EMFViewport.imageHeight,

                    scale:
                        EMFViewport.scale,

                    drawWidth:
                        EMFViewport.drawWidth,

                    drawHeight:
                        EMFViewport.drawHeight,

                    offsetX:
                        EMFViewport.offsetX,

                    offsetY:
                        EMFViewport.offsetY
                }
            }
        );

        if (
            !zone.polygon ||
            zone.polygon.length < 3
        ) {
            return;
        }

        ctx.save();

        // =================================================
        // STYLE
        // =================================================

        if (
            AppState.ui.selectedZone === zone
        ) {

            ctx.strokeStyle =
                "#8b5cf6";

            ctx.lineWidth =
                5;

            ctx.shadowColor =
                "#8b5cf6";

            ctx.shadowBlur =
                12;

        } else if (
            hoveredZone === zone
        ) {

            ctx.strokeStyle =
                "#66ffff";

            ctx.lineWidth =
                3;

            ctx.shadowColor =
                "#66ffff";

            ctx.shadowBlur =
                6;

        } else {

            ctx.strokeStyle =
                "magenta";

            ctx.lineWidth =
                2;

            ctx.shadowBlur =
                0;
        }

        // =================================================
        // DRAW POLYGON
        // =================================================

        const pts =
            EMFViewport.worldPoints(
                zone.polygon
            );

        EMFViewport.drawPolygon(
            ctx,
            pts
        );

        // =================================================
        // ZONE FILL
        // =================================================

        if (
            zone.type === "sleep"
        ) {

            ctx.fillStyle =
                "rgba(168,85,247,0.08)";

        } else if (
            zone.type === "rest"
        ) {

            ctx.fillStyle =
                "rgba(34,197,94,0.08)";

        } else if (
            zone.type === "work"
        ) {

            ctx.fillStyle =
                "rgba(59,130,246,0.08)";

        } else if (
            zone.type === "child"
        ) {

            ctx.fillStyle =
                "rgba(251,146,60,0.08)";

        } else {

            ctx.fillStyle =
                "rgba(0,255,255,0.08)";
        }

        ctx.fill();

        // =================================================
        // ZONE BORDER
        // =================================================

        ctx.stroke();

        ctx.shadowBlur =
            0;

        // =================================================
        // ZONE LABEL
        // =================================================

        const label =
            EMFViewport.screenCenter(
                zone.polygon
            );

        const total =
            (zone.grid || []).length;

        let measured =
            0;

        (zone.grid || []).forEach(p => {

            if (
                p.measurements?.[sessionId]
            ) {
                measured++;
            }

        });

        const zoneLabel =

            zone.type === "sleep"
                ? "🛏 Sleep"

                : zone.type === "rest"
                    ? "🛋 Rest"

                    : zone.type === "work"
                        ? "💻 Work"

                        : zone.type === "child"
                            ? "🧸 Child"

                            : zone.type;

        ctx.fillStyle =
            "#7c3aed";

        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "alphabetic";

        ctx.fillText(
            `${zoneLabel} ${measured}/${total}`,
            label.x,
            label.y + 14
        );

        ctx.restore();
    });

    ctx.restore();
}

// =====================
// EXPORT
// =====================
window.drawZonesLayer = drawZonesLayer;
window.generateZoneGrid = generateZoneGrid;

window.openRoomZonesPopup = openRoomZonesPopup;
window.closeRoomZonesPopup = closeRoomZonesPopup;
window.showZoneCreationHelp = showZoneCreationHelp;

window.selectZoneType = selectZoneType;

window.finishZone = finishZone;
window.cancelZone = cancelZone;
window.editSelectedZone = editSelectedZone;
window.deleteSelectedZone = deleteSelectedZone;

window.generateZoneGrid = generateZoneGrid;
window.generateZoneGridForSelectedZone =
    generateZoneGridForSelectedZone;

window.updateZoneStatusUI =
    updateZoneStatusUI;

window.roomHasZone =
    roomHasZone;

window.pointInPolygon =
    pointInPolygon;

window.getZoneLabel =
    getZoneLabel;

window.distanceToPolygonEdge =
    distanceToPolygonEdge;


