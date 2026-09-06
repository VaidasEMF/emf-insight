// =====================
// 🔥 SOURCES LAYER
// =====================

const SOURCE_POPUP_WIDTH =
    420;

const SOURCE_POPUP_HEIGHT =
    520;

function drawSourcesLayerSourcesDebug(
    floor
) {


    const p =
        EMFViewport.worldPoint(s);

    ctx.save();

    if (!floor?.sources) return;

    floor.sources.forEach(s => {



        // 🔥 skip broken icon
        if (!icon) {
            return;
        }

        // draw icon if loaded
        if (icon.complete) {

            ctx.globalAlpha = 0.7;

            ctx.drawImage(
                icon,
                p.x - 18,
                p.y - 18,
                36,
                36
            );

            ctx.globalAlpha = 1;
        }

        // 🔥 selected
        // Indoor Sources use the rectangular source
        // marker only — no blue circular selection ring.

        const isIndoorSource =
            String(
                s?.environment ||
                ""
            ).toLowerCase() === "indoor" ||

            String(
                s?.placementType ||
                ""
            ).toLowerCase() === "indoor" ||

            (
                Array.isArray(
                    window.INDOOR_SOURCE_TYPES
                ) &&
                window.INDOOR_SOURCE_TYPES.includes(
                    s?.type
                )
            ) ||

            [
                "wifi_router",
                "bluetooth",
                "smart_meter",
                "electrical_panel"
            ].includes(
                s?.type
            );


        if (
            selectedSource === s &&
            !isIndoorSource
        ) {

            ctx.strokeStyle =
                "#00aaff";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                s.x,
                s.y,
                22,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        // draw label
        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "#111";


        ctx.fillText(
            s.id,
            p.x + 20,
            p.y + 4
        );

    });

    ctx.restore();
}


function closeSourceDistancePopup() {

    const popup =
        document.getElementById(
            "sourceDistancePopup"
        );

    if (popup) {

        popup.style.display =
            "none";
    }
}


function handleSourceClick(evt) {

    const OUTDOOR_SOURCE_TYPES = [

        "mobile_tower",

        "solar_inverter",
        "solar",

        "ev_charger",

        "heat_pump",

        "battery_storage",

        "power_lines",

        "electrical_substation",

        "generator",

        "wind_turbine"
    ];



    function isOutdoorSource(type) {

        return OUTDOOR_SOURCE_TYPES.includes(
            type
        );
    }

    // =====================
    // 🔥 ONLY SOURCE MODE
    // =====================

    if (
        AppState?.ui?.mode !== "source"
    ) {
        return;
    }

    const floor =
        getCurrentFloor();

    if (!floor) {

        updateStatus(
            "⚠ No floor selected"
        );

        return;
    }

    // =====================
    // 🔥 INIT SOURCES
    // =====================

    if (!Array.isArray(floor.sources)) {

        floor.sources = [];
    }


    // =====================
    // 🔥 POSITION
    // =====================

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =

        canvas.width /
        rect.width;

    const scaleY =

        canvas.height /
        rect.height;

    mouseX =

        (evt.clientX - rect.left) *
        scaleX;

    mouseY =

        (evt.clientY - rect.top) *
        scaleY;

    // =====================
    // 🔥 SOURCE TYPE
    // =====================

    const type =
        document.getElementById(
            "sourceType"
        )?.value || "wifi";

    const source = {

        // ==================================================
        // 🔥 PHI DOMAIN ID
        // ==================================================

        id:
            window.PhiIdFactory
                ?.createSourceId?.() ||
            (
                "source_" +
                Date.now()
            ),

        // ==================================================
        // 🔥 ASSESSMENT CONTEXT
        // ==================================================

        assessmentId:
            AppState
                ?.project
                ?.assessmentId ||
            null,

        // ==================================================
        // 🔥 SESSION CONTEXT
        // ==================================================

        sessionId:
            AppState
                ?.measurement
                ?.currentSession ||
            null,

        // ==================================================
        // 🔥 MODE / CONTEXT
        // ==================================================

        assessmentContext:
            AppState
                ?.project
                ?.assessmentContext ||
            (
                window.AppMode?.current ===
                    "home"
                    ? "home"
                    : "professional"
            ),

        // ==================================================
        // SOURCE TYPE
        // ==================================================

        type,

        // ==================================================
        // SPATIAL POSITION
        // ==================================================

        x:
            mouseX,

        y:
            mouseY,

        // ==================================================
        // SOURCE POWER
        // ==================================================

        power:
            1
    };

    // =====================
    // =====================
    // OUTDOOR VALIDATION
    // =====================

    const roomHit =

        (floor.rooms || []).find(
            room =>

                pointInPolygon(
                    {
                        x: mouseX,
                        y: mouseY
                    },
                    room.polygon
                )
        );

    console.log(
        "OUTDOOR CHECK",
        {
            mouseX,
            mouseY,
            sourceType: source.type,
            outdoor: isOutdoorSource(
                source.type
            ),
            roomHit: !!roomHit,
            firstRoomPoint:
                floor.rooms?.[0]?.polygon?.[0]
        }
    );

    if (

        roomHit &&
        isOutdoorSource(
            source.type
        )

    ) {

        updateStatus(
            "⚠ Outdoor source must be placed outside rooms"
        );

        return;
    }
    // =====================
    if (

        [
            "mobiletower",
            "solar",
            "evstove",
            "heatpump",
            "batterystorage",
            "highvoltageline",
            "electricalsubstation",
            "generator",
            "windturbine",
            "smart_meter"
        ].includes(object.type)

    ) {

        console.log(
            "SHOW DISTANCE POPUP",
            object.type
        );

        window.lastPlacedSource =
            object;

        showSourceDistancePopup(
            object.x,
            object.y
        );
    }
    // =====================
    // 🔥 AUTO SELECT
    // =====================
    showSourceDetails(
        source
    );

    // =====================
    // 🔥 PREVIEW
    // =====================

    showSourceImpact =
        isLocalIndoorSource(
            source.type
        );

    // =====================
    // 🔥 TOGGLE SYNC
    // =====================

    const toggle =
        document.getElementById(
            "sourceImpactToggle"
        );

    if (toggle) {

        toggle.checked =
            showSourceImpact;
    }

    // =====================
    // 🔥 OPEN PANEL
    // =====================

    const panel =
        document.getElementById(
            "sourcePanel"
        );

    if (panel) {

        panel.style.display =
            "block";
    }

    // =====================
    // 🔥 EXIT ADD MODE
    // =====================

    AppState.ui.mode =
        "idle";

    updateStatus(
        "📶 Source added"
    );

    requestRender();
}




function showSourceDistancePopup(
    source
) {



    console.log(
        "SOURCE TYPE:",
        source.type
    );

    console.log(
        "INDOOR TYPES:",
        window.INDOOR_SOURCE_TYPES
    );

    // =====================
    // 🔥 SAVE SOURCE
    // =====================

    window.lastPlacedSource =
        source;

    console.log(
        "SOURCE:",
        source.type
    );

    console.log(
        "IS INDOOR:",
        window.INDOOR_SOURCE_TYPES?.includes(
            source.type
        )
    );

    if (

        window.INDOOR_SOURCE_TYPES
            ?.includes(
                source.type
            )

    ) {

        saveProject?.();

        requestRender?.();

        updateStatus?.(
            "✓ Source added"
        );

        return;
    }

    window.selectedDistanceZoneIds =

        source.linkedZoneIds?.length

            ? [...source.linkedZoneIds]

            : source.linkedZoneId

                ? [source.linkedZoneId]

                : [];

    // =====================
    // 🔥 ELEMENTS
    // =====================

    const popup =
        document.getElementById(
            "sourceDistancePopup"
        );

    const canvas =
        window.canvas;

    if (
        !popup ||
        !canvas ||
        !source
    ) {

        console.error(
            "POPUP INIT FAILED"
        );

        return;
    }

    // =====================
    // 🔥 POPULATE ZONES
    // =====================

    populateDistanceZones?.();

    // =====================
    // 🔥 SHOW
    // =====================

    popup.style.display =
        "block";

    popup.style.position =
        "fixed";

    popup.style.zIndex =
        "999999";

    // =====================
    // 🔥 CANVAS RECT
    // =====================

    const canvasRect =

        canvas.getBoundingClientRect();

    // =====================
    // 🔥 POPUP SIZE
    // =====================

    const popupWidth =
        SOURCE_POPUP_WIDTH;

    const popupHeight =
        SOURCE_POPUP_HEIGHT;

    // =====================
    // 🔥 START POSITION
    // =====================

    const p =
        EMFViewport.worldPoint(source);

    let left =
        canvasRect.left +
        p.x +
        40;

    let top =
        canvasRect.top +
        p.y +
        20;

    // =====================
    // 🔥 RIGHT EDGE
    // =====================

    if (

        left + popupWidth >

        canvasRect.right - 20

    ) {

        left =

            canvasRect.right -
            popupWidth -
            20;
    }

    // =====================
    // 🔥 BOTTOM EDGE
    // =====================

    if (

        top + popupHeight >

        canvasRect.bottom - 20

    ) {

        top =

            canvasRect.bottom -
            popupHeight -
            20;
    }

    // =====================
    // 🔥 MIN SAFE
    // =====================

    left = Math.max(

        canvasRect.left + 20,

        left
    );

    top = Math.max(

        canvasRect.top + 20,

        top
    );

    // =====================
    // 🔥 APPLY
    // =====================

    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;

    console.log(
        "POPUP POSITION:",
        left,
        top
    );

}

function showIndoorDistancePopup(
    source,
    options = {}
) {

    const viewOnly =
        options.viewOnly === true;

    console.error(
        "🔥🔥🔥 REAL showIndoorDistancePopup ENTER",
        {
            id: source?.id,
            type: source?.type,
            state: source?.state
        }
    );

    console.trace(
        "🔥 REAL POPUP TRACE"
    );


    // ==================================================
    // VALIDATE SOURCE
    // ==================================================

    if (!source) {

        console.warn(
            "⚠️ INDOOR POPUP — NO SOURCE"
        );

        return;
    }


    // ==================================================
    // ACTIVE SOURCE
    // ==================================================

    window.selectedIndoorSource =
        source;

    window.activePopupSource =
        source;

    window.lastPlacedSource =
        source;


    console.log(
        "🔥 INDOOR ACTIVE SOURCE",
        source.id
    );


    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "indoorDistancePopup"
        );


    const canvas =
        window.canvas;


    if (
        !popup ||
        !canvas
    ) {

        console.error(
            "❌ INDOOR POPUP INIT FAILED",
            {
                popup:
                    !!popup,

                canvas:
                    !!canvas
            }
        );

        return;
    }


    // ==================================================
    // POPUP SIZE
    // ==================================================

    popup.style.setProperty(
        "width",
        "288px",
        "important"
    );

    popup.style.setProperty(
        "max-width",
        "calc(100vw - 32px)",
        "important"
    );

    popup.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );


    // ==================================================
    // POPUP SIZE
    // ==================================================

    popup.style.width = "288px";
    popup.style.maxWidth = "calc(100vw - 32px)";
    popup.style.boxSizing = "border-box";

    // ==================================================
    // SOURCE TYPE
    // ==================================================

    const typeLabel =
        OBJECT_CONFIGS?.[
            source.type
        ]?.label
        ||
        source.type
        ||
        "Indoor Source";


    // ==================================================
    // SOURCE ICON
    // ==================================================

    const typeIcon =
        OBJECT_CONFIGS?.[
            source.type
        ]?.icon
        ||
        (
            source.type ===
                "wifi_router"

                ? "📶"

                : source.type ===
                    "bluetooth"

                    ? "ᛒ"

                    : source.type ===
                        "smart_meter"

                        ? "📊"

                        : source.type ===
                            "electrical_panel"

                            ? "⚡"

                            : "📡"
        );


    // ==================================================
    // SUMMARY
    // ==================================================

    const summary =
        document.getElementById(
            "indoorSourceSummary"
        );


    if (summary) {

        summary.style.cssText =
            `
                margin-top:12px;

                padding:10px 12px;

                box-sizing:border-box;

                background:#f5f8fc;

                border:1px solid #d9e3ef;

                border-radius:8px;
            `;


        summary.innerHTML =
            `

                <div
                    style="
                        display:flex;
                        align-items:center;

                        gap:9px;
                    "
                >

                    <div
                        style="
                            width:30px;
                            height:30px;

                            display:flex;
                            align-items:center;
                            justify-content:center;

                            flex:0 0 30px;

                            border-radius:7px;

                            background:#eaf2ff;

                            font-size:17px;
                        "
                    >
                        ${typeIcon}
                    </div>


                    <div
                        style="
                            min-width:0;
                        "
                    >

                        <div
                            id="indoorSourceType"

                            style="
                                font-size:13px;
                                line-height:16px;

                                font-weight:700;

                                color:#0f172a;

                                white-space:nowrap;
                                overflow:hidden;
                                text-overflow:ellipsis;
                            "
                        >
                            ${typeLabel}
                        </div>


                        <div
                            style="
                                margin-top:2px;

                                font-size:10px;
                                line-height:13px;

                                color:#64748b;
                            "
                        >
                            Indoor EMF Source
                        </div>

                    </div>

                </div>

            `;
    }


    // ==================================================
    // SOURCE STATE
    // ==================================================

    const allowedStates = [
        "on",
        "off",
        "unknown"
    ];


    if (
        !allowedStates.includes(
            source.state
        )
    ) {

        source.state =
            "unknown";
    }





    // ==================================================
    // STATE BLOCK
    // ==================================================

    let stateBlock =
        document.getElementById(
            "indoorSourceStateBlock"
        );


    if (!stateBlock) {

        stateBlock =
            document.createElement(
                "div"
            );

        stateBlock.id =
            "indoorSourceStateBlock";

        const summaryEl =
            document.getElementById(
                "indoorSourceSummary"
            );


        if (summaryEl) {

            summaryEl.insertAdjacentElement(
                "afterend",
                stateBlock
            );

        }

    }


    stateBlock.style.cssText =
        `
            margin-top:12px;

            padding:10px 12px;

            box-sizing:border-box;

            background:#ffffff;

            border:1px solid #dbe3ec;

            border-radius:8px;
        `;


    stateBlock.innerHTML =
        `

            <div
                style="
                    font-size:11px;
                    line-height:14px;

                    font-weight:700;

                    color:#334155;

                    margin-bottom:6px;
                "
            >
                Source State
            </div>


            <select
                id="indoorSourceState"

                aria-label="Source State"

                style="
                    width:100%;
                    height:34px;

                    box-sizing:border-box;

                    padding:5px 10px;

                    border:1px solid #cbd5e1;
                    border-radius:7px;

                    background:#ffffff;

                    color:#1e293b;

                    font-size:12px;
                    font-weight:500;

                    outline:none;

                    cursor:pointer;
                "
            >

                <option value="on">
                    ON
                </option>

                <option value="off">
                    OFF
                </option>

                <option value="unknown">
                    UNKNOWN
                </option>

            </select>

        `;


    const stateEl =
        document.getElementById(
            "indoorSourceState"
        );


    if (stateEl) {

        stateEl.value =
            source.state;

        stateEl.onchange =
            function () {

                source.state =
                    this.value;

                console.log(
                    "INDOOR SOURCE STATE CHANGED",
                    source.state
                );

            };

    }


    // ==================================================
    // ANALYSIS STATE
    // ==================================================

    const badge =
        popup.querySelector(
            ".source-auto-badge"
        );


    const subtitle =
        popup.querySelector(
            ".distance-popup-sub"
        );


    const analysisState =
        getIndoorSourceState(
            source
        );


    if (badge) {

        badge.style.cssText =
            `
                margin-top:10px;

                padding:8px 10px;

                box-sizing:border-box;

                border:1px solid #d8e4f2;

                border-radius:7px;

                background:#f5f9ff;

                color:#2563eb;

                font-size:10px;
                line-height:13px;

                font-weight:600;
            `;

    }


    if (subtitle) {

        subtitle.style.cssText =
            `
                margin-top:10px;

                font-size:10px;
                line-height:14px;

                color:#64748b;
            `;

    }


    if (
        analysisState ===
        "setup"
    ) {

        if (badge) {

            badge.innerHTML =
                "✓ Automatic distance calculation";

        }


        if (subtitle) {

            subtitle.innerHTML =
                `
                    Source impact will be calculated
                    after room and zone measurements
                    are completed.
                `;

        }

    }

    else if (
        analysisState ===
        "measured"
    ) {

        if (badge) {

            badge.innerHTML =
                "✓ Measurements available";

        }


        if (subtitle) {

            subtitle.innerHTML =
                `
                    🔒 Upgrade to unlock:

                    <br><br>

                    • Affected zones

                    <br>

                    • Impact levels

                    <br>

                    • Exposure contribution

                    <br>

                    • Confidence score
                `;

        }

    }

    else {

        if (badge) {

            badge.innerHTML =
                "✓ Premium analysis available";

        }


        if (subtitle) {

            subtitle.innerHTML =
                `
                    Source impact analysis
                    is available.
                `;

        }

    }


    // ==================================================
    // ZONE STATE
    // ==================================================

    window.currentZoneContainer =
        "indoorZoneOptions";


    window.selectedDistanceZoneIds =

        source.linkedZoneIds?.length

            ? [
                ...source.linkedZoneIds
            ]

            : [];


    // ==================================================
    // POPULATE ZONES
    //
    // IMPORTANT:
    // Keep existing automatic zone/distance logic.
    // ==================================================

    populateDistanceZones?.();

    // ==================================================
    // VIEW-ONLY UI
    // ==================================================

    if (viewOnly) {

        if (zoneOptions) {
            zoneOptions.style.display = "none";
        }

        const autoBadge =
            popup.querySelector(
                ".source-auto-badge"
            );

        if (autoBadge) {
            autoBadge.style.display = "none";
        }

        const popupSub =
            popup.querySelector(
                ".distance-popup-sub"
            );

        if (popupSub) {
            popupSub.style.display = "none";
        }

    }
    else {

        if (zoneOptions) {
            zoneOptions.style.display = "";
        }

        const autoBadge =
            popup.querySelector(
                ".source-auto-badge"
            );

        if (autoBadge) {
            autoBadge.style.display = "";
        }

        const popupSub =
            popup.querySelector(
                ".distance-popup-sub"
            );

        if (popupSub) {
            popupSub.style.display = "";
        }

    }


    // ==================================================
    // ZONE CONTAINER STYLE
    // ==================================================

    const zoneOptions =
        document.getElementById(
            "indoorZoneOptions"
        );


    if (zoneOptions) {

        zoneOptions.style.cssText =
            `
                margin-top:10px;

                max-height:170px;

                overflow-y:auto;

                box-sizing:border-box;
            `;

    }




    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    const deleteButton =
        popup.querySelector(
            ".room-mini-btn"
        );


    const saveButton =
        popup.querySelector(
            ".distance-save-btn"
        );


    if (deleteButton) {

        deleteButton.type =
            "button";


        deleteButton.style.cssText =
            `
                height:32px;

                min-width:72px;

                padding:5px 13px;

                border:1px solid #fecaca;

                border-radius:7px;

                background:#fff7f7;

                color:#dc2626;

                font-size:11px;

                font-weight:600;

                cursor:pointer;
            `;

    }


    if (saveButton) {

        saveButton.type =
            "button";


        saveButton.style.cssText =
            `
                height:32px;

                min-width:72px;

                padding:5px 14px;

                border:1px solid #2563eb;

                border-radius:7px;

                background:#2563eb;

                color:#ffffff;

                font-size:11px;

                font-weight:600;

                cursor:pointer;
            `;

    }


    // ==================================================
    // FOOTER
    // ==================================================

    const actions =
        popup.querySelector(
            ".distance-save-btn"
        )?.parentElement;


    if (actions) {

        actions.style.cssText =
            `
                display:flex;

                align-items:center;
                justify-content:space-between;

                gap:8px;

                margin-top:14px;

                padding-top:10px;

                border-top:1px solid #e2e8f0;
            `;

    }


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    const closeButton =
        popup.querySelector(
            ".distance-popup-close"
        );


    if (closeButton) {

        closeButton.type =
            "button";


        closeButton.style.cssText =
            `
                width:32px;
                height:32px;

                display:flex;
                align-items:center;
                justify-content:center;

                padding:0;

                border:1px solid #cbd5e1;

                border-radius:7px;

                background:#ffffff;

                color:#64748b;

                font-size:18px;
                line-height:1;

                cursor:pointer;
            `;

    }


    // ==================================================
    // POPUP BASE STYLE
    // ==================================================

    popup.style.boxSizing =
        "border-box";

    popup.style.width =
        "360px";

    popup.style.maxWidth =
        "calc(100vw - 32px)";

    popup.style.maxHeight =
        "calc(100vh - 40px)";

    popup.style.padding =
        "14px";

    popup.style.background =
        "#ffffff";

    popup.style.border =
        "1px solid #dbe3ec";

    popup.style.borderRadius =
        "14px";

    popup.style.boxShadow =
        "0 18px 45px rgba(15,23,42,.18)";

    popup.style.overflowY =
        "auto";

    popup.style.overflowX =
        "hidden";

    popup.style.position =
        "fixed";

    popup.style.zIndex =
        "999999";


    // ==================================================
    // NO FULL-SCREEN OVERLAY
    //
    // Important for PAN.
    // Canvas remains interactive outside
    // the popup itself.
    // ==================================================

    popup.style.pointerEvents =
        "auto";


    // ==================================================
    // POSITION FUNCTION
    //
    // Keeps popup attached to source.
    // ==================================================

    function positionPopup() {

        if (
            popup.style.display ===
            "none"
        ) {

            return;
        }


        const currentCanvas =
            window.canvas;


        if (
            !currentCanvas
        ) {

            return;
        }


        const canvasRect =
            currentCanvas.getBoundingClientRect();


        const p =
            EMFViewport.worldPoint(
                source
            );


        const rect =
            popup.getBoundingClientRect();


        const popupWidth =
            rect.width ||
            360;


        const popupHeight =
            rect.height ||
            420;


        let left =
            canvasRect.left +
            p.x +
            40;


        let top =
            canvasRect.top +
            p.y +
            20;


        // ----------------------------------------------
        // RIGHT
        // ----------------------------------------------

        if (
            left + popupWidth >
            window.innerWidth - 20
        ) {

            left =
                window.innerWidth -
                popupWidth -
                20;

        }


        // ----------------------------------------------
        // LEFT
        // ----------------------------------------------

        if (
            left <
            20
        ) {

            left =
                20;

        }


        // ----------------------------------------------
        // BOTTOM
        // ----------------------------------------------

        if (
            top + popupHeight >
            window.innerHeight - 20
        ) {

            top =
                window.innerHeight -
                popupHeight -
                20;

        }


        // ----------------------------------------------
        // TOP
        // ----------------------------------------------

        if (
            top <
            20
        ) {

            top =
                20;

        }


        popup.style.left =
            `${left}px`;


        popup.style.top =
            `${top}px`;

    }


    // ==================================================
    // SHOW FIRST
    //
    // Needed so dimensions are real.
    // ==================================================

    popup.style.display =
        "block";


    // ==================================================
    // KEYBOARD
    // ==================================================

    popup.tabIndex =
        -1;


    popup.onkeydown =
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();

                closeIndoorDistancePopup();

                return;
            }


            if (
                event.key ===
                "Enter"
            ) {

                const target =
                    event.target;


                // Do not interfere with
                // native select interaction.

                if (
                    target &&
                    target.tagName ===
                    "SELECT"
                ) {

                    return;
                }


                event.preventDefault();

                event.stopPropagation();


                saveIndoorDistance?.();

            }

        };


    // ==================================================
    // CLOSE BUTTON KEYBOARD
    // ==================================================

    if (closeButton) {

        closeButton.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeIndoorDistancePopup();

            };

    }


    // ==================================================
    // FOCUS
    // ==================================================

    requestAnimationFrame(
        () => {

            try {

                popup.focus();

            }

            catch (error) {

                console.warn(
                    "INDOOR POPUP FOCUS FAILED",
                    error
                );

            }

        }
    );


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "✅ INDOOR SOURCE POPUP OPEN",
        {
            id:
                source.id,

            type:
                source.type,

            state:
                source.state,

            analysisState,

            linkedZoneIds:
                window.selectedDistanceZoneIds
        }
    );

}

window.updateIndoorDistancePopupPosition =
    function () {

        const popup =
            document.getElementById(
                "indoorDistancePopup"
            );

        const source =
            window.activePopupSource ||
            window.selectedIndoorSource;

        const canvas =
            window.canvas;

        if (
            !popup ||
            !source ||
            !canvas ||
            getComputedStyle(popup).display === "none"
        ) {
            return;
        }

        const canvasRect =
            canvas.getBoundingClientRect();

        const p =
            EMFViewport.worldPoint(
                source
            );

        const rect =
            popup.getBoundingClientRect();

        const popupWidth =
            rect.width;

        const popupHeight =
            rect.height;

        let left =
            canvasRect.left +
            p.x +
            40;

        let top =
            canvasRect.top +
            p.y +
            20;


        if (
            left + popupWidth >
            window.innerWidth - 20
        ) {

            left =
                window.innerWidth -
                popupWidth -
                20;
        }


        if (
            left < 20
        ) {

            left = 20;
        }


        if (
            top + popupHeight >
            window.innerHeight - 20
        ) {

            top =
                window.innerHeight -
                popupHeight -
                20;
        }


        if (
            top < 20
        ) {

            top = 20;
        }


        popup.style.left =
            `${left}px`;

        popup.style.top =
            `${top}px`;
    };


document.addEventListener(
    "keydown",
    function (event) {

        const popup =
            document.getElementById(
                "businessSourcePopup"
            );

        if (
            !popup ||
            getComputedStyle(popup).display === "none"
        ) {
            return;
        }




        if (
            event.key === "Escape"
        ) {

            event.preventDefault();

            closeBusinessSourcePopup();

            return;
        }


        if (
            event.key === "Enter"
        ) {

            if (
                event.target?.tagName ===
                "SELECT"
            ) {
                return;
            }

            event.preventDefault();

            saveBusinessSource();

        }

    }
);


// ==================================================
// 🔥 OUTDOOR POPUP KEYBOARD CONTROL
// ==================================================

if (
    !window.__outdoorPopupKeyboardBound
) {

    window.__outdoorPopupKeyboardBound =
        true;


    document.addEventListener(
        "keydown",
        function (evt) {

            const popup =
                document.getElementById(
                    "outdoorSourcePopup"
                );


            if (
                !popup ||
                popup.style.display ===
                "none"
            ) {

                return;
            }


            // ==========================================
            // ESC → CLOSE
            // ==========================================

            if (
                evt.key ===
                "Escape"
            ) {

                evt.preventDefault();
                evt.stopPropagation();

                closeOutdoorSourcePopup?.();

                requestRender?.();

                return;
            }


            // ==========================================
            // ENTER → SAVE
            // ==========================================

            if (
                evt.key ===
                "Enter"
            ) {

                // Don't interfere with buttons.
                if (
                    evt.target?.tagName ===
                    "BUTTON"
                ) {

                    return;
                }


                evt.preventDefault();
                evt.stopPropagation();

                saveOutdoorSourceSettings?.();

                return;
            }

        },
        true
    );
}



function updateIndoorDistancePopupPosition() {

    const popup =
        document.getElementById(
            "indoorDistancePopup"
        );

    const canvas =
        window.canvas;

    const source =
        window.activePopupSource ||
        window.selectedIndoorSource;

    if (
        !popup ||
        !canvas ||
        !source ||
        getComputedStyle(popup).display === "none"
    ) {
        return;
    }


    const canvasRect =
        canvas.getBoundingClientRect();


    const p =
        EMFViewport.worldPoint(
            source
        );


    const popupWidth =
        popup.getBoundingClientRect().width;


    const popupHeight =
        popup.getBoundingClientRect().height;


    let left =
        canvasRect.left +
        p.x +
        40;


    let top =
        canvasRect.top +
        p.y +
        20;


    // ==================================================
    // RIGHT EDGE
    // ==================================================

    if (
        left + popupWidth >
        canvasRect.right - 20
    ) {

        left =
            canvasRect.right -
            popupWidth -
            20;
    }


    // ==================================================
    // BOTTOM EDGE
    // ==================================================

    if (
        top + popupHeight >
        canvasRect.bottom - 20
    ) {

        top =
            canvasRect.bottom -
            popupHeight -
            20;
    }


    // ==================================================
    // SAFE BOUNDS
    // ==================================================

    left =
        Math.max(
            canvasRect.left + 20,
            left
        );


    top =
        Math.max(
            canvasRect.top + 20,
            top
        );


    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;
}

function closeIndoorDistancePopup() {

    const popup =
        document.getElementById(
            "indoorDistancePopup"
        );


    if (!popup) {
        return;
    }


    popup.style.display =
        "none";


    // ==================================================
    // 🔥 CLEANUP INDOOR PAN
    // ==================================================

    if (
        popup._indoorPanCleanup
    ) {

        popup._indoorPanCleanup();

        popup._indoorPanCleanup =
            null;
    }


    // ==================================================
    // CLEAR ACTIVE SOURCE
    // ==================================================

    if (
        window.activePopupSource ===
        window.selectedIndoorSource
    ) {

        window.activePopupSource =
            null;

    }


    window.selectedIndoorSource =
        null;
}


function setIndoorDistance(
    preset,
    btn
) {

    const source =
        window.lastPlacedSource;

    if (!source) {

        console.error(
            "NO SOURCE"
        );

        return;
    }

    source.distanceCategory =
        preset;

    document
        .querySelectorAll(
            "#indoorDistancePopup .distance-chip"
        )
        .forEach(chip =>

            chip.classList.remove(
                "active"
            )
        );

    btn.classList.add(
        "active"
    );

    console.log(
        "INDOOR DISTANCE:",
        preset
    );
}

window.setIndoorDistance =
    setIndoorDistance;


function saveSourceDistance() {

    const source =
        window.lastPlacedSource;

    if (!source) {
        return;
    }

    const hasCategory =

        !!source.distanceCategory;

    const hasExactDistance =

        !!source.exactDistance;

    if (

        !hasCategory &&

        !hasExactDistance

    ) {

        alert(

            "Please select a distance or enter an exact distance."

        );

        return;
    }

    console.log(
        "SELECTED ZONES",
        window.selectedDistanceZoneIds
    );

    console.log(
        "SOURCE BEFORE",
        source
    );

    if (!source) {

        console.error(
            "NO SOURCE"
        );

        return;
    }

    // =====================
    // 🔥 ZONES
    // =====================

    source.linkedZoneIds =

        window.selectedDistanceZoneIds || [];

    console.log(
        "SOURCE AFTER",
        source
    );

    console.log(
        "SAVED ZONES:",
        source.linkedZoneIds
    );

    // =====================
    // 🔥 DISTANCE
    // =====================

    const input =
        document.getElementById(
            "exactDistanceInput"
        );

    if (
        input?.value
    ) {

        source.exactDistance =

            parseFloat(
                input.value
            );
    }

    // =====================
    // 🔥 CLOSE
    // =====================

    closeSourcePopup?.();

    requestRender?.();

    console.log(
        "AFTER SAVE SOURCE",
        source
    );

    console.log(
        "LINKED IDS",
        source.linkedZoneIds
    );
}



function closeSourcePopup() {

    const popup =
        document.getElementById(
            "sourceDistancePopup"
        );

    if (popup) {

        popup.style.display =
            "none";
    }
}

function setSourceDistance(
    preset,
    btn
) {

    const source =
        window.lastPlacedSource;

    if (!source) {

        console.error(
            "NO SOURCE"
        );

        return;
    }

    source.distanceCategory =
        preset;

    document
        .querySelectorAll(
            ".distance-chip"
        )
        .forEach(chip =>

            chip.classList.remove(
                "active"
            )
        );

    btn.classList.add(
        "active"
    );

    console.log(
        "DISTANCE SAVED",
        source.type,
        preset,
        source.distanceCategory
    );

    console.log(
        "DISTANCE SET:",
        preset
    );
}

function populateDistanceZones() {

    const wrap =
        document.getElementById(

            window.currentZoneContainer ||

            "distanceZoneOptions"
        );

    if (!wrap) {
        return;
    }

    wrap.innerHTML = "";

    const floor =

        AppState.project
            ?.floors?.[

        AppState.project
            ?.currentFloorIndex || 0
        ];

    console.log(
        "POPUP FLOOR:",
        floor
    );

    console.log(
        "POPUP ZONES:",
        floor?.zones
    );

    if (!floor) {
        return;
    }

    floor.zones.forEach(zone => {

        const meta =

            OBJECT_CONFIGS[
            zone.type
            ];

        const btn =
            document.createElement(
                "button"
            );

        btn.className =
            "distance-zone-btn";

        btn.innerText =
            meta?.label || "Zone";

        if (

            window.selectedDistanceZoneIds?.includes(
                zone.id
            )

        ) {

            btn.classList.add(
                "active"
            );
        }

        btn.onclick = () => {

            console.error(
                "ZONE CLICK",
                zone.id
            );

            if (
                !window.selectedDistanceZoneIds
            ) {

                window.selectedDistanceZoneIds = [];
            }

            if (

                window.selectedDistanceZoneIds.includes(
                    zone.id
                )

            ) {

                window.selectedDistanceZoneIds =

                    window.selectedDistanceZoneIds
                        .filter(id =>
                            id !== zone.id
                        );
            }
            else {

                window.selectedDistanceZoneIds.push(
                    zone.id
                );

                console.log(
                    "SELECTED:",
                    window.selectedDistanceZoneIds
                );
            }

            btn.classList.toggle(
                "active"
            );

            console.error(
                "SELECTED IDS AFTER",
                window.selectedDistanceZoneIds
            );
        };

        wrap.appendChild(btn);
    });
}

window.DISTANCE_PRESETS = {

    "<1m": {

        label:
            "Extreme",

        exposure:
            "VERY HIGH"
    },

    "1-3m": {

        label:
            "Very Close",

        exposure:
            "HIGH"
    },

    "3-10m": {

        label:
            "Close",

        exposure:
            "MODERATE"
    },

    "10-30m": {

        label:
            "Nearby",

        exposure:
            "LOW"
    },

    "30-100m": {

        label:
            "Far",

        exposure:
            "VERY LOW"
    },

    "100-300m": {

        label:
            "Distant",

        exposure:
            "MINIMAL"
    },

    "300m-1km": {

        label:
            "Remote",

        exposure:
            "VERY LOW"
    },

    "1km+": {

        label:
            "Very Remote",

        exposure:
            "NEGLIGIBLE"
    }
};

function showOutdoorSourcePopup(source) {

    console.log(
        "OUTDOOR SOURCE POPUP",
        source
    );


    // ==================================================
    // ACTIVE SOURCE
    // ==================================================

    window.selectedOutdoorSource =
        source;

    window.activePopupSource =
        source;


    // ==================================================
    // SOURCE LABEL
    // ==================================================

    const typeEl =
        document.getElementById(
            "outdoorSourceType"
        );

    if (typeEl) {

        const config =
            window.OBJECT_CONFIGS?.[
            source.type
            ];

        const label =
            config?.label ||
            source.type;

        const image =
            config?.image ||
            null;


        if (image) {

            typeEl.innerHTML = `
            <span style="
                display:flex;
                align-items:center;
                gap:8px;
            ">
                <img
                    src="${image}"
                    alt=""
                    style="
                        width:30px;
                        height:30px;
                        object-fit:contain;
                        flex-shrink:0;
                    "
                >

                <span>
                    ${label}
                </span>
            </span>
        `;

        }
        else {

            typeEl.innerText =
                label;
        }
    }


    // ==================================================
    // DISTANCE INPUT
    // ==================================================

    const distanceInput =
        document.getElementById(
            "outdoorDistanceInput"
        );

    if (distanceInput) {

        distanceInput.value =
            source.exactDistance ??
            "";
    }


    // ==================================================
    // DISTANCE CATEGORY
    // ==================================================

    const distanceCategory =
        source.distanceCategory ||
        "unknown";


    const distanceSelect =
        document.getElementById(
            "outdoorDistanceCategory"
        );


    if (distanceSelect) {

        distanceSelect.value =
            distanceCategory;
    }


    // ==================================================
    // RADIO CATEGORY
    // ==================================================

    const radioInputs =
        document.querySelectorAll(
            '#outdoorSourcePopup input[name="outdoorDistanceCategory"]'
        );


    radioInputs.forEach(
        radio => {

            radio.checked =
                radio.value ===
                distanceCategory;
        }
    );


    // ==================================================
    // EXACT DISTANCE ↔ DISTANCE RANGE
    // ==================================================
    //
    // Manual distance and range selection are mutually
    // exclusive.
    //
    // Enter exact distance:
    //     → clear radio selection
    //
    // Select distance range:
    //     → clear exact distance
    // ==================================================

    if (
        !window.__outdoorDistanceSyncBound
    ) {

        window.__outdoorDistanceSyncBound =
            true;


        // ----------------------------------------------
        // MANUAL DISTANCE → CLEAR RANGE
        // ----------------------------------------------

        document.addEventListener(
            "input",
            function (evt) {

                if (
                    evt.target?.id !==
                    "outdoorDistanceInput"
                ) {

                    return;
                }


                const value =
                    evt.target.value.trim();


                if (
                    value === ""
                ) {

                    return;
                }


                document
                    .querySelectorAll(
                        '#outdoorSourcePopup input[name="outdoorDistanceCategory"]'
                    )
                    .forEach(
                        radio => {
                            radio.checked =
                                false;
                        }
                    );
            }
        );


        // ----------------------------------------------
        // RANGE → CLEAR MANUAL DISTANCE
        // ----------------------------------------------

        document.addEventListener(
            "change",
            function (evt) {

                const radio =
                    evt.target;


                if (
                    !radio ||
                    radio.name !==
                    "outdoorDistanceCategory"
                ) {

                    return;
                }


                const input =
                    document.getElementById(
                        "outdoorDistanceInput"
                    );


                if (input) {

                    input.value =
                        "";
                }
            }
        );
    }


    // ==================================================
    // SPATIAL CONFIDENCE
    // ==================================================

    const confidence =
        source.spatialConfidence ||
        "approximate";


    const confidenceEl =
        document.getElementById(
            "outdoorSpatialConfidence"
        );


    if (confidenceEl) {

        confidenceEl.innerText =
            confidence === "approximate"
                ? "Approximate location"
                : confidence;
    }


    // ==================================================
    // DISTANCE BASIS
    // ==================================================

    const basisEl =
        document.getElementById(
            "outdoorDistanceBasis"
        );


    if (basisEl) {

        basisEl.innerText =
            "User-estimated distance";
    }


    // ==================================================
    // 🔥 CONTEXTUAL LIFESTYLE AREA
    // ==================================================
    //
    // Outdoor Source is Property-level.
    //
    // The current floor relationship is derived from:
    //     currentFloor.outdoorSourceRelationships
    //
    // DO NOT use:
    //     source.linkedZoneIds
    //
    // This is contextual information only.
    // It is NOT a Risk result.
    // ==================================================

    const floor =
        getCurrentFloor?.();


    const relationships =
        Array.isArray(
            floor?.outdoorSourceRelationships
        )
            ? floor.outdoorSourceRelationships
            : [];


    const relationship =
        relationships.find(
            item =>
                item?.sourceId ===
                source.id
        );


    const linkedZone =
        relationship
            ? (
                floor?.zones || []
            ).find(
                zone =>
                    zone?.id ===
                    relationship.targetAreaId
            )
            : null;


    const zoneEl =
        document.getElementById(
            "outdoorLinkedZone"
        );


    if (
        zoneEl
    ) {

        if (
            linkedZone
        ) {

            let zoneLabel =
                linkedZone.name ||
                null;


            if (
                !zoneLabel
            ) {

                if (
                    linkedZone.zoneType ===
                    "sleep"
                ) {

                    zoneLabel =
                        "Sleep Area";

                }

                else if (
                    linkedZone.zoneType ===
                    "work"
                ) {

                    zoneLabel =
                        "Work Area";

                }

                else if (
                    linkedZone.zoneType ===
                    "relax"
                ) {

                    zoneLabel =
                        "Relax Area";

                }

                else if (
                    linkedZone.zoneType ===
                    "child"
                ) {

                    zoneLabel =
                        "Child Area";

                }

                else {

                    zoneLabel =
                        "Lifestyle Area";
                }
            }


            zoneEl.innerText =
                `Potentially relevant to ${zoneLabel}`;

        }

        else {

            zoneEl.innerText =
                "No Lifestyle Area relationship available";
        }
    }

    // ==================================================
    // STATUS
    // ==================================================

    const statusEl =
        document.getElementById(
            "outdoorSourceStatus"
        );


    if (statusEl) {

        statusEl.innerHTML = `
            <div style="
                font-size:9px;
                line-height:12px;
                color:#64748b;
            ">
                Outdoor position is approximate.
                The map shows the side of the property;
                distance is entered separately.
            </div>
        `;

        statusEl.style.marginBottom =
            "6px";
    }


    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "outdoorSourcePopup"
        );


    const canvas =
        window.canvas;


    if (
        !popup ||
        !canvas ||
        !source
    ) {

        return;
    }


    // ==================================================
    // COMPACT POPUP STYLE
    // ==================================================

    popup.style.display =
        "block";

    updateOutdoorDistanceCategoryLabels();


    // ==================================================
    // 🔥 POPUP DRAG / PAN
    // ==================================================
    //
    // The popup itself can be moved around the screen.
    // Dragging the popup does NOT move the floor plan.
    //
    // ==================================================

    if (
        !popup.dataset.dragInitialized
    ) {

        popup.dataset.dragInitialized =
            "true";


        let popupDragging =
            false;

        let popupDragOffsetX =
            0;

        let popupDragOffsetY =
            0;


        popup.addEventListener(
            "pointerdown",
            event => {

                // Buttons / inputs / controls must remain
                // normal interactive controls.

                const interactive =
                    event.target.closest(
                        "button, input, select, textarea, label"
                    );


                if (
                    interactive
                ) {

                    return;
                }


                popupDragging =
                    true;


                const rect =
                    popup.getBoundingClientRect();


                popupDragOffsetX =
                    event.clientX -
                    rect.left;


                popupDragOffsetY =
                    event.clientY -
                    rect.top;


                popup.setPointerCapture?.(
                    event.pointerId
                );


                popup.style.cursor =
                    "grabbing";


                event.preventDefault();
            }
        );


        popup.addEventListener(
            "pointermove",
            event => {

                if (
                    !popupDragging
                ) {

                    return;
                }


                popup.style.left =
                    (
                        event.clientX -
                        popupDragOffsetX
                    ) +
                    "px";


                popup.style.top =
                    (
                        event.clientY -
                        popupDragOffsetY
                    ) +
                    "px";


                // Remove transform if an older
                // positioning rule is still present.

                popup.style.transform =
                    "none";


                event.preventDefault();
            }
        );


        popup.addEventListener(
            "pointerup",
            event => {

                popupDragging =
                    false;


                popup.releasePointerCapture?.(
                    event.pointerId
                );


                popup.style.cursor =
                    "";
            }
        );


        popup.addEventListener(
            "pointercancel",
            () => {

                popupDragging =
                    false;

                popup.style.cursor =
                    "";
            }
        );
    }

    popup.style.position =
        "fixed";

    popup.style.zIndex =
        "999999";

    popup.style.width =
        "300px";

    popup.style.maxWidth =
        "calc(100vw - 32px)";

    popup.style.maxHeight =
        "calc(100vh - 24px)";

    popup.style.overflowY =
        "auto";

    popup.style.overflowX =
        "hidden";

    popup.style.boxSizing =
        "border-box";

    popup.style.padding =
        "11px";

    popup.style.border =
        "1px solid #dbe4f0";

    popup.style.borderRadius =
        "10px";

    popup.style.background =
        "#ffffff";

    popup.style.boxShadow =
        "0 8px 24px rgba(15,23,42,0.16)";


    // ==================================================
    // POPUP TITLE
    // ==================================================

    const popupTitle =
        popup.querySelector(
            "h2, h3"
        );

    if (popupTitle) {

        popupTitle.style.fontSize =
            "15px";

        popupTitle.style.margin =
            "0 0 8px 0";
    }


    // ==================================================
    // COMPACT INFORMATION BLOCKS
    // ==================================================

    const compactBlocks = [
        "outdoorSourceStatus",
        "outdoorLinkedZone"
    ];


    compactBlocks.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );

            if (!el) {
                return;
            }

            el.style.marginBottom =
                "5px";
        }
    );


    // ==================================================
    // APPROXIMATE LOCATION BLOCK
    // ==================================================

    const confidenceParent =
        confidenceEl?.parentElement;


    if (confidenceParent) {

        confidenceParent.style.padding =
            "7px 9px";

        confidenceParent.style.marginBottom =
            "6px";

        confidenceParent.style.borderRadius =
            "7px";

        confidenceParent.style.background =
            "#f8fafc";

        confidenceParent.style.border =
            "1px solid #dbe4f0";

        confidenceParent.style.fontSize =
            "10px";

        confidenceParent.style.lineHeight =
            "12px";
    }


    if (confidenceEl) {

        confidenceEl.style.fontSize =
            "10px";

        confidenceEl.style.lineHeight =
            "12px";
    }


    if (basisEl) {

        basisEl.style.fontSize =
            "9px";

        basisEl.style.lineHeight =
            "11px";

        basisEl.style.color =
            "#94a3b8";
    }


    // ==================================================
    // FIND DISTANCE RADIO CONTAINER
    // ==================================================

    const firstRadio =
        popup.querySelector(
            'input[name="outdoorDistanceCategory"]'
        );


    if (firstRadio) {

        const radioLabel =
            firstRadio.closest(
                "label"
            );


        if (radioLabel) {

            const radioContainer =
                radioLabel.parentElement;


            if (
                radioContainer
            ) {

                // ------------------------------------------
                // TWO COLUMN GRID
                // ------------------------------------------

                radioContainer.style.display =
                    "grid";

                radioContainer.style.gridTemplateColumns =
                    "1fr 1fr";

                radioContainer.style.columnGap =
                    "5px";

                radioContainer.style.rowGap =
                    "4px";

                radioContainer.style.width =
                    "100%";
            }
        }
    }


    // ==================================================
    // STYLE RADIO ROWS
    // ==================================================

    radioInputs.forEach(
        radio => {

            const label =
                radio.closest(
                    "label"
                );


            if (!label) {
                return;
            }


            label.style.display =
                "flex";

            label.style.alignItems =
                "center";

            label.style.gap =
                "6px";

            label.style.minHeight =
                "26px";

            label.style.height =
                "26px";

            label.style.boxSizing =
                "border-box";

            label.style.padding =
                "3px 6px";

            label.style.margin =
                "0";

            label.style.border =
                "1px solid #dbe4f0";

            label.style.borderRadius =
                "6px";

            label.style.background =
                "#f8fafc";

            label.style.fontSize =
                "10px";

            label.style.lineHeight =
                "12px";

            label.style.color =
                "#334155";

            label.style.cursor =
                "pointer";

            radio.style.margin =
                "0";

            radio.style.flexShrink =
                "0";
        }
    );


    // ==================================================
    // DISTANCE INPUT
    // ==================================================

    if (distanceInput) {

        distanceInput.style.height =
            "27px";

        distanceInput.style.boxSizing =
            "border-box";

        distanceInput.style.padding =
            "4px 7px";

        distanceInput.style.fontSize =
            "11px";

        distanceInput.style.border =
            "1px solid #cbd5e1";

        distanceInput.style.borderRadius =
            "5px";

        distanceInput.style.width =
            "100%";
    }


    if (distanceInput) {

        distanceInput.addEventListener(
            "input",
            function () {

                const hasExactDistance =
                    this.value.trim() !== "";

                if (!hasExactDistance) {
                    return;
                }

                document
                    .querySelectorAll(
                        '#outdoorSourcePopup input[name="outdoorDistanceCategory"]'
                    )
                    .forEach(
                        radio => {
                            radio.checked = false;
                        }
                    );
            }
        );
    }


    // ==================================================
    // SECTION HEADINGS
    // ==================================================

    popup
        .querySelectorAll(
            "h4, h5"
        )
        .forEach(
            heading => {

                heading.style.fontSize =
                    "11px";

                heading.style.lineHeight =
                    "14px";

                heading.style.margin =
                    "6px 0 3px 0";
            }
        );


    // ==================================================
    // ALL SMALL TEXT
    // ==================================================

    popup
        .querySelectorAll(
            "small"
        )
        .forEach(
            el => {

                el.style.fontSize =
                    "9px";

                el.style.lineHeight =
                    "11px";
            }
        );


    // ==================================================
    // BUTTONS
    // ==================================================

    popup
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {

                button.style.borderRadius =
                    "6px";

                button.style.padding =
                    "5px 10px";

                button.style.minHeight =
                    "27px";

                button.style.fontSize =
                    "10px";

                button.style.lineHeight =
                    "14px";

                button.style.cursor =
                    "pointer";

                button.style.boxSizing =
                    "border-box";
            }
        );


    // ==================================================
    // SAVE BUTTON
    // ==================================================

    const saveButton =
        popup.querySelector(
            'button[onclick*="saveOutdoorSourceSettings"]'
        );


    if (saveButton) {

        saveButton.style.background =
            "#2563eb";

        saveButton.style.color =
            "#ffffff";

        saveButton.style.border =
            "1px solid #2563eb";

        saveButton.style.fontWeight =
            "600";
    }


    // ==================================================
    // DELETE BUTTON
    // ==================================================

    const deleteButton =
        popup.querySelector(
            'button[onclick*="delete"]'
        );


    if (deleteButton) {

        deleteButton.style.background =
            "#ffffff";

        deleteButton.style.color =
            "#dc2626";

        deleteButton.style.border =
            "1px solid #fecaca";
    }


    // ==================================================
    // POSITION
    // ==================================================

    const canvasRect =
        canvas.getBoundingClientRect();


    const p =
        EMFViewport.worldPoint(
            source
        );


    const popupWidth =
        300;


    // Popup is already rendered at this point,
    // so use its real height.

    const popupHeight =
        Math.min(
            popup.offsetHeight ||
            420,
            window.innerHeight - 24
        );


    let left =
        canvasRect.left +
        p.x +
        24;


    let top =
        canvasRect.top +
        p.y -
        20;


    // ==================================================
    // KEEP INSIDE VIEWPORT
    // ==================================================

    if (
        left +
        popupWidth >
        window.innerWidth -
        12
    ) {

        left =
            canvasRect.left +
            p.x -
            popupWidth -
            24;
    }


    if (
        left < 12
    ) {

        left =
            12;
    }


    if (
        top +
        popupHeight >
        window.innerHeight -
        12
    ) {

        top =
            window.innerHeight -
            popupHeight -
            12;
    }


    if (
        top < 12
    ) {

        top =
            12;
    }


    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;


    // ==================================================
    // FOCUS DISTANCE INPUT
    // ==================================================

    if (distanceInput) {

        setTimeout(
            () => {

                distanceInput.focus();

            },
            50
        );
    }
}

function openOutdoorSourceTypePopup() {

    const popup =

        document.getElementById(
            "outdoorSourcesPopup"
        );

    if (!popup) {
        return;
    }

    popup.innerHTML = `

    <div
        class="room-zones-popup-header"
    >

        <b>
            Choose Outdoor Source
        </b>

        <span

            onclick="
                openOutdoorSourcesPopup();
            "

            style="
                cursor:pointer;
                font-size:20px;
            "

        >

            ✕

        </span>

    </div>

    ${OUTDOOR_SOURCE_TYPES.map(type => `

        <button

            class="popup-add-zone-btn"

            style="
                width:100%;
                margin-bottom:8px;
            "

            onclick="

                createOutdoorSource({

                    type:'${type.type}',

                    name:'${type.name}',

                    icon:'${type.icon}'

                });

            "

        >

            ${type.icon}

            ${type.name}

        </button>

    `).join("")}

    `;
}


function startOutdoorSourcePlacement() {

    console.warn(
        "Legacy outdoor placement disabled"
    );
}


function closeOutdoorSourcesPopup() {

    const popup =

        document.getElementById(
            "outdoorSourcesPopup"
        );

    if (popup) {

        popup.style.display =
            "none";
    }
}

function showOutdoorSourcePicker() {

    openOutdoorSourceTypePopup();

}

function createOutdoorSource(typeObj) {

    if (
        !AppState.project.outdoorSources
    ) {

        AppState.project.outdoorSources = [];
    }

    AppState.project.outdoorSources.push({

        id:
            window.PhiIdFactory
                ?.createSourceId?.() ||
            (
                "source_" +
                Date.now()
            ),

        floorId:
            getCurrentFloor()?.id || null,

        type:
            typeObj.type,

        name:
            typeObj.name,

        icon:
            typeObj.icon,

        distance:
            null,

        x:
            null,

        y:
            null,

        placed:
            false,

        notes:
            ""

    });

    renderHomeFloorTabs?.();

    updateRoomProgressPanel?.();

    saveProject?.();

    openOutdoorSourcesPopup();
}

function openSourcePanel(source) {

    if (!source) return;

    document.getElementById(
        "sourcePanel"
    ).style.display = "block";

    document.getElementById(
        "sourceId"
    ).value = source.id || "";

    document.getElementById(
        "sourceTypeEdit"
    ).value = source.type || "wifi";

    document.getElementById(
        "sourcePower"
    ).value = source.power || 1;
}


function saveSourceEdit() {

    if (!selectedSource) {
        return;
    }

    selectedSource.id =
        document.getElementById(
            "sourceId"
        ).value;

    selectedSource.type =
        document.getElementById(
            "sourceTypeEdit"
        ).value;

    selectedSource.power =
        parseInt(
            document.getElementById(
                "sourcePower"
            ).value
        );

    requestRender();

    updateStatus(
        "✅ Source updated"
    );
}


function updateCurrentExposure() {

    console.log("STEP 1");

    const floor =
        getCurrentFloor?.();

    const floors =
        AppState.project?.floors || [];

    if (!floor) {
        return;
    }

    const summary =
        document.getElementById(
            "currentExposureSummary"
        );

    const insights =
        document.getElementById(
            "availableInsights"
        );

    "availableInsights"

    const improvement =
        document.getElementById(
            "potentialImprovement"
        );

    const wholeHome =
        document.getElementById(
            "wholeHomeInsights"
        );

    if (
        !summary ||
        !insights ||
        !improvement
    ) {
        return;
    }

    const zones =

        floors.flatMap(
            floor =>
                floor.zones || []
        );

    console.log("STEP 2");

    const sources =

        floors.flatMap(
            floor =>
                floor.sources || []
        );

    console.log("STEP 3");

    // =====================
    // 🔥 COMPLETENESS
    // =====================

    let completeness = 0;

    completeness +=
        Math.min(
            zones.length * 20,
            50
        );

    completeness +=
        Math.min(
            sources.length * 10,
            50
        );

    completeness =
        Math.min(
            completeness,
            100
        );

    // =====================
    // 🔥 INSIGHTS
    // =====================

    let insightCount = 0;

    const teaserInsights = [];



    const sourceScores = [];


    window.debugSourceScores =
        sourceScores;

    function addSourceScore(
        title,
        score
    ) {

        sourceScores.push({

            title,

            score,

            level:
                getExposureLevel(
                    score
                )
        });
    }

    const sleepAreas =
        zones.filter(
            z =>
                z.type === "sleep"
        );

    const workAreas =
        zones.filter(
            z =>
                z.type === "work_area"
        );

    const childAreas =
        zones.filter(
            z =>
                z.type === "child_area"
        );

    const wirelessSources =
        sources.filter(
            s =>

                s.type ===
                "wifi_router" ||

                s.type ===
                "bluetooth"
        );

    const electricalSources =
        sources.filter(
            s =>

                s.type ===
                "smart_meter" ||

                s.type ===
                "electrical_panel"
        );

    const outdoorExposureSources =
        sources.filter(
            s =>

                s.type === "mobile_tower" ||

                s.type === "power_lines" ||

                s.type === "electrical_substation" ||

                s.type === "wind_turbine" ||

                s.type === "solar_inverter" ||

                s.type === "ev_charger" ||

                s.type === "heat_pump" ||

                s.type === "battery_storage"
        );

    // 🔥 Basic assessment

    if (
        zones.length &&
        sources.length
    ) {

        insightCount++;
    }

    // 🔥 Sleep risk

    sleepAreas.forEach(zone => {

        wirelessSources.forEach(source => {

            const linked =

                source.linkedZoneIds?.includes(
                    zone.id
                );

            if (!linked) {
                return;
            }

            insightCount++;

            teaserInsights.push({

                title:
                    "Sleep area near WiFi Router",

                impact:
                    15,

                priority:
                    "high",

                recommendation:
                    "Move router farther from sleep area"
            });

            const distance =

                getIndoorDistance(
                    source,
                    zone
                );

            const hours =

                zone.hours || 1;

            const score =

                calculateIndoorExposure(

                    source.type,

                    distance,

                    hours
                );

            console.log(
                "WIFI SCORE",
                zone.type,
                distance,
                score
            );

            addSourceScore(

                "WiFi Router",

                score
            );
        });
    });

    // 🔥 Work risk
    workAreas.forEach(zone => {

        electricalSources.forEach(source => {

            const linked =

                source.linkedZoneIds?.includes(
                    zone.id
                );

            if (!linked) {
                return;
            }

            insightCount++;

            teaserInsights.push({

                title:
                    "Electrical source near work area",

                impact:
                    12,

                recommendation:
                    "Increase distance from work area"
            });

            const distance =

                getIndoorDistance(
                    source,
                    zone
                );

            const hours =

                zone.hours || 1;

            const score =

                calculateIndoorExposure(

                    source.type,

                    distance,

                    hours
                );

            addSourceScore(

                "Electrical Panel",

                score
            );
        });
    });

    // 🔥 Child risk

    if (
        childAreas.length &&
        sources.length
    ) {

        insightCount++;
        teaserInsights.push({

            title:
                "Child area exposure detected",

            impact:
                10,

            recommendation:
                "Reduce nearby EMF sources"

        });


        addSourceScore(

            "Child Area Exposure",

            100
        );
    }

    // 🔥 Multiple source overlap

    if (
        sources.length >= 3
    ) {

        insightCount++;

        teaserInsights.push({

            title:
                "Multiple source overlap detected",

            impact:
                15,

            recommendation:
                "Review source placement"

        });



        console.log(
            "ADD SCORE",
            sourceScores
        );
    }

    // 🔥 Outdoor source

    outdoorExposureSources.forEach(
        source => {

            const zoneId =

                source.linkedZoneIds?.[0];

            const zone =

                floor.zones?.find(
                    z => z.id === zoneId
                );

            let sourceName =
                "Outdoor source";

            switch (
            source.type
            ) {

                case "mobile_tower":

                    sourceName =
                        "Mobile tower";

                    break;

                case "power_lines":

                    sourceName =
                        "Power lines";

                    break;

                case "solar_inverter":

                    sourceName =
                        "Solar inverter";

                    break;

                case "ev_charger":

                    sourceName =
                        "EV charger";

                    break;

                case "heat_pump":

                    sourceName =
                        "Heat pump";

                    break;

                case "battery_storage":

                    sourceName =
                        "Battery storage";

                    break;
            }

            let zoneName =
                "home";

            if (zone) {

                const meta =

                    OBJECT_CONFIGS?.[
                    zone.type
                    ];

                zoneName =
                    meta?.label ||
                    zone.type;
            }

            insightCount++;

            teaserInsights.push({

                title:
                    `${sourceName} near ${zoneName}`,

                impact:
                    8,

                priority:
                    "medium",

                recommendation:
                    "Personalized recommendation available"

            });



            console.log(
                "ADD SCORE",
                sourceScores
            );
        }
    );

    // 🔥 Ensure at least one teaser

    if (
        teaserInsights.length === 0 &&
        insightCount > 0
    ) {

        teaserInsights.push({

            title:
                "Personalized insight available",

            impact:
                0,

            recommendation:
                ""

        });
    }

    const totalImprovement =

        teaserInsights.reduce(

            (sum, insight) =>

                sum + insight.impact,

            0
        );

    const improvementScore =
        document.getElementById(
            "improvementScore"
        );

    if (improvementScore) {

        improvementScore.innerHTML =

            `
        <div class="improvement-label">

            Potential Improvement

        </div>

        <div class="improvement-value">

            +${totalImprovement}%

        </div>
        `;
    }

    // =====================
    // 🔥 WHOLE HOME
    // =====================

    let totalInsights = 0;

    const floorBreakdown = [];

    floors.forEach(floorItem => {

        const zones =
            floorItem.zones || [];

        const sources =
            floorItem.sources || [];

        let floorInsights = 0;

        const sleepAreas =
            zones.filter(
                z =>
                    z.type === "sleep"
            );

        const workAreas =
            zones.filter(
                z =>
                    z.type === "work_area"
            );

        const childAreas =
            zones.filter(
                z =>
                    z.type === "child_area"
            );

        const wirelessSources =
            sources.filter(
                s =>

                    s.type ===
                    "wifi_router" ||

                    s.type ===
                    "bluetooth"
            );

        const electricalSources =
            sources.filter(
                s =>

                    s.type ===
                    "smart_meter" ||

                    s.type ===
                    "electrical_panel"
            );

        const outdoorExposureSources =
            sources.filter(
                s =>

                    s.type === "mobile_tower" ||

                    s.type === "power_lines" ||

                    s.type === "electrical_substation" ||

                    s.type === "wind_turbine" ||

                    s.type === "solar_inverter" ||

                    s.type === "ev_charger" ||

                    s.type === "heat_pump" ||

                    s.type === "battery_storage"
            );

        if (
            zones.length &&
            sources.length
        ) {

            floorInsights++;
        }

        if (
            sleepAreas.length &&
            wirelessSources.length
        ) {

            floorInsights++;
        }

        if (
            workAreas.length &&
            electricalSources.length
        ) {

            floorInsights++;
        }

        if (
            childAreas.length &&
            sources.length
        ) {

            floorInsights++;
        }

        if (
            sources.length >= 3
        ) {

            floorInsights++;
        }

        totalInsights +=
            floorInsights;

        floorBreakdown.push({

            name:
                floorItem.name,

            count:
                floorInsights
        });
    });



    // =====================
    // 🔥 FIRST INSIGHT FOUND
    // =====================

    sourceScores.sort(

        (a, b) =>

            b.score - a.score
    );

    console.log("STEP 4");

    const topSources =

        sourceScores.slice(
            0,
            3
        );

    window.topSources =
        topSources;

    if (

        insightCount > 0 &&

        window.lastInsightCount !==
        insightCount

    ) {

        window.lastInsightCount =
            insightCount;

        updateStatus?.(

            `🔒 ${insightCount} personalized insights available`

        );



        const lockedPreview =

            document.getElementById(
                "lockedInsightsPreview"
            );

        if (lockedPreview) {

            const hiddenCount =

                Math.max(
                    0,
                    teaserInsights.length - 3
                );

            lockedPreview.innerHTML =

                teaserInsights

                    .slice(0, 3)

                    .map(

                        insight =>

                            `
                <div class="locked-insight-item">

                    <div class="locked-title">

                        🔒 ${insight.title}

                    </div>

                </div>
                `
                    )

                    .join("")

                +

                (

                    hiddenCount > 0

                        ?

                        `
        <div class="hidden-insights-count">

            +X more hidden insights

        </div>
        `

                        :

                        ""
                );

        }

        const readyCard =

            document.getElementById(
                "insightsReadyCard"
            );

        if (

            readyCard &&

            !window.insightsCardShown

        ) {

            window.insightsCardShown =
                true;

            setTimeout(() => {

                readyCard.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }, 300);
        }
    }

    if (wholeHome) {

        wholeHome.innerHTML =

            `
    <b>Whole Home</b><br>

    ${floorBreakdown.map(

                floor =>

                    `${floor.name} • ${floor.count} risks`

            ).join("<br>")}

    <br><br>

    <b>Total • ${totalInsights} risks</b>

    <br><br>

    <b>Top Risks Found</b>

    <br>

    ${teaserInsights
                .slice(0, 2)
                .map(

                    insight =>

                        `
          🔒 ${insight.title}
          <br><br>
          `
                )
                .join("")}

    ${teaserInsights.length > 2
                ? `+${teaserInsights.length - 2} more hidden insights`
                : ""
            }
    `;
    }

    // =====================
    // 🔥 IMPROVEMENT
    // =====================

    const potentialImprovement =

        Math.min(
            insightCount * 12,
            45
        );

    const insightsStep =

        document.querySelector(
            '#homeWorkflowBar [data-step="insights"] .workflow-label'
        );

    if (insightsStep) {

        insightsStep.innerHTML =

            insightCount > 0

                ? `Insights 🔒${insightCount}`

                : "Insights";
    }

    const readyCard =
        document.getElementById(
            "insightsReadyCard"
        );

    const readyText =
        document.getElementById(
            "insightsReadyText"
        );

    if (
        readyCard &&
        readyText
    ) {

        if (insightCount > 0) {

            readyCard.style.display =
                "block";

            readyText.innerHTML =

                `${insightCount}
            personalized insights available`;
        }
        else {

            readyCard.style.display =
                "none";
        }
    }

    // =====================
    // 🔥 UI
    // =====================

    summary.innerHTML =

        `
      <strong>Analysis Ready</strong>
      `;

    insights.innerHTML =

        `
        🔒 ${insightCount}
        personalized insights available
        `;



    const title =
        document.getElementById(
            "analysisTitle"
        );

    if (title) {

        title.innerText =

            floors.length > 1

                ? "Whole Home Exposure"

                : "Current Exposure";
    }
}




function updateSourceButtons() {

    document
        .getElementById(
            "btnAddSource"
        )
        ?.classList.remove("active");

    document
        .getElementById(
            "btnEditSource"
        )
        ?.classList.remove("active");

    if (AppState.ui.mode === "source") {

        document
            .getElementById(
                "btnAddSource"
            )
            ?.classList.add("active");
    }

    if (AppState.ui.mode === "editSource") {

        const floor =
            getCurrentFloor();

        floor?.sources?.forEach(s => {

            const d = Math.hypot(
                mouseX - s.x,
                mouseY - s.y
            );

            if (d < 24) {

                draggingSource = s;
            }
        });
    }

    selectedSource = null;
    draggingSource = null;
}




function openOutdoorSourcesPopup() {

    const popup =

        document.getElementById(
            "outdoorSourcesPopup"
        );

    if (!popup) {
        return;
    }

    const sources =

        AppState.project
            .outdoorSources || [];

    popup.innerHTML = `

<div
    class="room-zones-popup-header"
>

    <b>
        Outdoor Sources
    </b>

    <span

        onclick="
            closeOutdoorSourcesPopup();
        "

        style="
            cursor:pointer;
            font-size:20px;
        "

    >

        ✕

    </span>

</div>

${sources.length === 0

            ? `

<div
    style="
        padding:20px;
        color:#64748b;
    "
>

    No outdoor sources added.

</div>

`

            : `

<div
    class="outdoor-sources-list"
>

${sources.map(source => `

<div
    class="outdoor-source-card"
>

    <div
        class="outdoor-source-name"
    >

        ${source.icon}

        ${source.name}

    </div>

    <div
        class="outdoor-source-distance"
    >

        Distance:
        ${source.distance || "Unknown"}

    </div>

    <button

        class="room-mini-btn"

        onclick="

            startOutdoorSourcePlacement(
                '${source.id}'
            );

        "

    >

        Place on Map

    </button>

</div>

`).join("")}

</div>

`
        }

<button

    class="popup-add-zone-btn"

    onclick="

        showOutdoorSourcePicker();

    "

>

    + Add Outdoor Source

</button>

`;

    popup.style.display =
        "block";
}


// ==================================================
// CLEAR SOURCE FOCUS
//
// Removes only the temporary visual source focus.
// Does NOT delete or modify the source itself.
// ==================================================

function clearSourceFocus() {

    window.viewingSourceId =
        null;

    if (
        window.objectTool
    ) {

        window.objectTool.selectedObjectId =
            null;

        window.objectTool.draggingObject =
            null;

        window.objectTool.dragging =
            false;
    }

    stopDrag?.();

    requestRender?.();
}


window.clearSourceFocus =
    clearSourceFocus;


function populateIndoorDistanceZones(
    source
) {

    const wrap =
        document.getElementById(
            "indoorZoneOptions"
        );

    if (!wrap) {
        return;
    }

    wrap.innerHTML = "";

    const floor =

        AppState.project
            ?.floors?.[
        AppState.project
            ?.currentFloorIndex || 0
        ];

    if (
        !floor?.zones?.length
    ) {
        return;
    }

    floor.zones.forEach(
        zone => {

            const btn =
                document.createElement(
                    "button"
                );

            btn.className =
                "distance-zone-chip";

            btn.textContent =
                getObjectMeta(
                    zone.type
                )?.label
                || zone.type;

            const selected =

                source.linkedZoneIds
                    ?.includes(
                        zone.id
                    );

            if (selected) {

                btn.classList.add(
                    "active"
                );
            }

            btn.onclick = () => {

                console.error(
                    "BEFORE",
                    window.selectedDistanceZoneIds
                );

                source.linkedZoneIds =
                    [zone.id];

                wrap
                    .querySelectorAll(
                        ".distance-zone-chip"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                btn.classList.add(
                    "active"
                );
            };

            const outdoorBtn =
                document.createElement(
                    "button"
                );

            outdoorBtn.className =
                "home-floor-tab";

            outdoorBtn.innerHTML = `

<div class="floor-card">

    <div class="floor-card-title">

        🌳 Outdoor Sources

    </div>

    <div class="floor-card-meta">

        ${(AppState.project.outdoorSources || []).length}

    </div>

</div>

`;

            outdoorBtn.onclick =
                () => {

                    openOutdoorSourcesPopup?.();

                };

            wrap.appendChild(
                outdoorBtn
            );

            wrap.appendChild(
                btn
            );
        }
    );
}


function saveOutdoorSourceSettings() {

    const source =
        window.activePopupSource ||
        window.selectedOutdoorSource ||
        window.lastPlacedSource;


    if (
        !source
    ) {

        console.warn(
            "⚠️ NO OUTDOOR SOURCE TO SAVE"
        );

        return;
    }


    // ==================================================
    // DISTANCE
    // ==================================================

    const input =
        document.getElementById(
            "outdoorDistanceInput"
        );


    const rawValue =
        input?.value?.trim() ||
        "";


    if (
        rawValue === ""
    ) {

        source.exactDistance =
            null;

        source.distanceBasis =
            "unknown";

    }

    else {

        const numericValue =
            parseFloat(
                rawValue
            );


        if (
            !Number.isFinite(
                numericValue
            ) ||
            numericValue < 0
        ) {

            alert(
                "Please enter a valid approximate distance."
            );

            input?.focus();

            return;
        }


        source.exactDistance =
            numericValue;

        source.distanceBasis =
            "user_estimated";

        source.spatialConfidence =
            "approximate";
    }


    // ==================================================
    // 🔥 MANUAL DISTANCE OVERRIDES PRESET
    // ==================================================

    if (
        rawValue !== ""
    ) {

        source.distanceCategory =
            null;

        source.distancePreset =
            null;


        document
            .querySelectorAll(
                'input[name="outdoorDistanceCategory"]'
            )
            .forEach(
                radio => {

                    radio.checked =
                        false;
                }
            );


        const distanceSelect =
            document.getElementById(
                "outdoorDistanceCategory"
            );


        if (
            distanceSelect
        ) {

            distanceSelect.value =
                "";
        }
    }


    // ==================================================
    // OUTDOOR SOURCE MUST REMAIN OUTSIDE PLAN
    // ==================================================

    const screenPoint =
        typeof EMFViewport?.worldPoint ===
            "function"

            ? EMFViewport.worldPoint(
                source
            )

            : null;


    const planBounds =
        typeof EMFViewport?.planBounds ===
            "function"

            ? EMFViewport.planBounds()

            : null;


    const insidePlan =
        !!screenPoint &&
        !!planBounds &&
        screenPoint.x >=
        planBounds.left &&
        screenPoint.x <=
        planBounds.right &&
        screenPoint.y >=
        planBounds.top &&
        screenPoint.y <=
        planBounds.bottom;


    if (
        insidePlan
    ) {

        alert(
            "Outdoor sources must remain outside the floor plan."
        );

        return;
    }


    // ==================================================
    // 🔥 RECALCULATE CONTEXT
    // ==================================================

    window.refreshOutdoorLifestyleLinks?.();


    // ==================================================
    // 🔥 SAVE IS COMMIT
    //
    // Therefore Cancel must no longer remove
    // this source.
    // ==================================================

    window.outdoorSourcePopupIsNew =
        false;


    saveProject?.();

    requestRender?.();


    // ==================================================
    // CLOSE
    // ==================================================

    closeOutdoorSourcePopup();


    console.log(
        "✅ OUTDOOR SOURCE SAVED",
        {
            id:
                source.id,

            type:
                source.type,

            exactDistance:
                source.exactDistance,

            distanceBasis:
                source.distanceBasis
        }
    );
}

function closeOutdoorSourcePopup() {

    const popup =
        document.getElementById(
            "outdoorSourcePopup"
        );


    // ==================================================
    // 🔥 CANCEL NEW SOURCE
    // ==================================================

    if (
        window.outdoorSourcePopupIsNew ===
        true
    ) {

        const source =
            window.selectedOutdoorSource ||
            window.activePopupSource ||
            window.lastPlacedSource;


        if (
            source?.id
        ) {

            const sources =
                Array.isArray(
                    AppState.project
                        ?.outdoorSources
                )
                    ? AppState.project
                        .outdoorSources
                    : [];


            AppState.project.outdoorSources =
                sources.filter(
                    item =>
                        item?.id !==
                        source.id
                );


            console.log(
                "🗑 OUTDOOR SOURCE CANCELLED",
                source.id
            );
        }
    }


    // ==================================================
    // CLOSE POPUP
    // ==================================================

    if (
        popup
    ) {

        popup.style.display =
            "none";
    }


    // ==================================================
    // CLEAR STATE
    // ==================================================

    window.outdoorSourcePopupIsNew =
        false;

    window.selectedOutdoorSource =
        null;

    window.activePopupSource =
        null;

    window.lastPlacedSource =
        null;


    if (
        window.objectTool
    ) {

        window.objectTool.selectedObjectId =
            null;

        window.objectTool.draggingObject =
            null;
    }


    // ==================================================
    // SAVE / RENDER
    // ==================================================

    saveProject?.();

    requestRender?.();
}

// ==================================================
// 🔥 BUSINESS SOURCE POPUP POSITION
//
// Keeps the Business Source popup anchored to
// the active Source during:
// - zoom
// - pan
// - viewport changes
//
// Popup is always kept inside the canvas bounds.
// ==================================================

function updateBusinessSourcePopupPosition() {

    const popup =
        document.getElementById(
            "businessSourcePopup"
        );

    const canvas =
        window.canvas;

    const source =
        window.activePopupSource;


    if (
        !popup ||
        !canvas ||
        !source
    ) {

        return;
    }


    // ==================================================
    // ONLY WHEN VISIBLE
    // ==================================================

    const popupStyle =
        window.getComputedStyle(
            popup
        );


    if (
        popupStyle.display ===
        "none"
    ) {

        return;
    }


    // ==================================================
    // CANVAS
    // ==================================================

    const canvasRect =
        canvas.getBoundingClientRect();


    if (
        !canvasRect.width ||
        !canvasRect.height
    ) {

        return;
    }


    // ==================================================
    // SOURCE SCREEN POSITION
    //
    // Same viewport conversion used by
    // the Measurement popup.
    // ==================================================

    const screen =
        EMFViewport.worldPoint(
            source
        );


    if (
        !screen
    ) {

        return;
    }


    // ==================================================
    // POPUP SIZE
    //
    // Read actual rendered size instead of
    // hardcoding width / height.
    // ==================================================

    const popupRect =
        popup.getBoundingClientRect();


    const popupWidth =
        popupRect.width ||
        320;


    const popupHeight =
        popupRect.height ||
        285;


    const GAP =
        20;


    const EDGE =
        10;


    // ==================================================
    // SOURCE SCREEN COORDINATES
    // ==================================================

    const sourceX =
        canvasRect.left +
        screen.x;


    const sourceY =
        canvasRect.top +
        screen.y;


    // ==================================================
    // DEFAULT
    //
    // Popup opens to the bottom-right
    // of the Source.
    // ==================================================

    let left =
        sourceX +
        GAP;


    let top =
        sourceY +
        GAP;


    // ==================================================
    // RIGHT EDGE
    //
    // If popup does not fit on the right,
    // place it on the left side of Source.
    // ==================================================

    if (
        left +
        popupWidth >
        canvasRect.right -
        EDGE
    ) {

        left =
            sourceX -
            popupWidth -
            GAP;
    }


    // ==================================================
    // BOTTOM EDGE
    //
    // If popup does not fit below Source,
    // place it above Source.
    // ==================================================

    if (
        top +
        popupHeight >
        canvasRect.bottom -
        EDGE
    ) {

        top =
            sourceY -
            popupHeight -
            GAP;
    }


    // ==================================================
    // FINAL HORIZONTAL CLAMP
    //
    // Popup must remain inside canvas.
    // ==================================================

    const minLeft =
        canvasRect.left +
        EDGE;


    const maxLeft =
        canvasRect.right -
        popupWidth -
        EDGE;


    if (
        maxLeft >=
        minLeft
    ) {

        left =
            Math.min(
                Math.max(
                    left,
                    minLeft
                ),
                maxLeft
            );

    }

    else {

        // Canvas narrower than popup.
        // Keep popup aligned to canvas start.
        left =
            minLeft;
    }


    // ==================================================
    // FINAL VERTICAL CLAMP
    // ==================================================

    const minTop =
        canvasRect.top +
        EDGE;


    const maxTop =
        canvasRect.bottom -
        popupHeight -
        EDGE;


    if (
        maxTop >=
        minTop
    ) {

        top =
            Math.min(
                Math.max(
                    top,
                    minTop
                ),
                maxTop
            );

    }

    else {

        top =
            minTop;
    }


    // ==================================================
    // APPLY
    // ==================================================

    popup.style.position =
        "fixed";

    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;


    console.log(
        "🔥 BUSINESS POPUP POSITION",
        {
            source:
                source.id,

            sourceScreen: {
                x:
                    screen.x,

                y:
                    screen.y
            },

            popup: {
                left,
                top,
                width:
                    popupWidth,
                height:
                    popupHeight
            },

            canvas: {
                left:
                    canvasRect.left,

                top:
                    canvasRect.top,

                right:
                    canvasRect.right,

                bottom:
                    canvasRect.bottom
            },

            zoom:
                EMFViewport?.zoom,

            panX:
                EMFViewport?.panX,

            panY:
                EMFViewport?.panY
        }
    );
}


window.updateBusinessSourcePopupPosition =
    updateBusinessSourcePopupPosition;




// ==================================================
// BUSINESS SOURCE POPUP
// ==================================================

function showBusinessSourcePopup(
    source
) {

    console.trace(
        "🔥 SHOW BUSINESS POPUP CALLED",
        source?.id,
        source?.type
    );


    // ==================================================
    // VALIDATE SOURCE
    // ==================================================

    if (
        !source
    ) {

        console.warn(
            "⚠️ BUSINESS SOURCE POPUP — NO SOURCE"
        );

        return;
    }


    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "businessSourcePopup"
        );


    if (
        !popup
    ) {

        console.error(
            "❌ businessSourcePopup not found"
        );

        return;
    }


    // ==================================================
    // ACTIVE SOURCE
    //
    // Business popup is shared by:
    // - Indoor Sources
    // - Outdoor Sources
    //
    // activePopupSource is the single source
    // that the popup is currently attached to.
    // ==================================================

    window.activePopupSource =
        source;


    // ==================================================
    // SOURCE STATE
    //
    // Allowed Business Source states:
    // ON / OFF / UNKNOWN
    //
    // Missing or invalid state defaults to UNKNOWN.
    // ==================================================

    const allowedStates = [
        "on",
        "off",
        "unknown"
    ];


    if (
        !allowedStates.includes(
            source.state
        )
    ) {

        source.state =
            "unknown";
    }


    // ==================================================
    // SOURCE TYPE
    // ==================================================

    const typeLabel =
        OBJECT_CONFIGS?.[
            source.type
        ]?.label

        ||

        source.type

        ||

        "EMF Source";


    const typeEl =
        document.getElementById(
            "businessSourceType"
        );


    if (
        typeEl
    ) {

        typeEl.innerText =
            typeLabel;
    }


    // ==================================================
    // SOURCE CATEGORY
    // ==================================================

    const outdoorTypes = [

        "mobile_tower",
        "solar_inverter",
        "solar",
        "ev_charger",
        "heat_pump",
        "battery_storage",
        "power_lines",
        "electrical_substation",
        "generator",
        "wind_turbine"

    ];


    const isOutdoor =
        outdoorTypes.includes(
            source.type
        );


    const categoryEl =
        document.getElementById(
            "businessSourceCategory"
        );


    if (
        categoryEl
    ) {

        categoryEl.innerText =
            isOutdoor
                ? "Outdoor EMF Source"
                : "Indoor EMF Source";
    }


    // ==================================================
    // TITLE
    // ==================================================

    const titleEl =
        document.getElementById(
            "businessSourcePopupTitle"
        );


    if (
        titleEl
    ) {

        titleEl.innerText =
            isOutdoor
                ? "Outdoor Source"
                : "Indoor Source";
    }


    // ==================================================
    // STATE SELECT
    // ==================================================

    const stateSelect =
        document.getElementById(
            "businessSourceState"
        );


    if (
        stateSelect
    ) {

        stateSelect.value =
            source.state;
    }


    // ==================================================
    // SHOW POPUP
    //
    // Make the popup visible BEFORE calculating
    // its position so getBoundingClientRect()
    // returns the actual rendered dimensions.
    // ==================================================

    popup.style.display =
        "block";


    popup.style.position =
        "fixed";


    popup.style.zIndex =
        "999999";

    popup.style.setProperty(
        "width",
        "288px",
        "important"
    );

    popup.style.setProperty(
        "max-width",
        "calc(100vw - 32px)",
        "important"
    );

    popup.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

    popup.focus();

    // ==================================================
    // 🔥 DRAG POPUP
    // Move popup independently from the floor plan.
    // ==================================================

    if (
        popup._dragCleanup
    ) {

        popup._dragCleanup();

    }


    const header =
        popup.querySelector(
            ".distance-popup-header"
        );


    if (
        header
    ) {

        let dragging =
            false;

        let startX =
            0;

        let startY =
            0;

        let startLeft =
            0;

        let startTop =
            0;


        const onMouseDown =
            function (event) {

                // Do not drag when clicking controls
                if (
                    event.target?.closest(
                        "button, select, input, textarea"
                    )
                ) {

                    return;
                }


                dragging =
                    true;


                const rect =
                    popup.getBoundingClientRect();


                startX =
                    event.clientX;

                startY =
                    event.clientY;

                startLeft =
                    rect.left;

                startTop =
                    rect.top;


                header.style.cursor =
                    "grabbing";


                event.preventDefault();

            };


        const onMouseMove =
            function (event) {

                if (
                    !dragging
                ) {

                    return;
                }


                const dx =
                    event.clientX -
                    startX;


                const dy =
                    event.clientY -
                    startY;


                popup.style.left =
                    `${startLeft + dx}px`;

                popup.style.top =
                    `${startTop + dy}px`;


                event.preventDefault();

            };


        const onMouseUp =
            function () {

                if (
                    !dragging
                ) {

                    return;
                }


                dragging =
                    false;


                header.style.cursor =
                    "grab";

            };


        header.style.cursor =
            "grab";


        header.addEventListener(
            "mousedown",
            onMouseDown
        );


        document.addEventListener(
            "mousemove",
            onMouseMove
        );


        document.addEventListener(
            "mouseup",
            onMouseUp
        );


        popup._dragCleanup =
            function () {

                header.removeEventListener(
                    "mousedown",
                    onMouseDown
                );

                document.removeEventListener(
                    "mousemove",
                    onMouseMove
                );

                document.removeEventListener(
                    "mouseup",
                    onMouseUp
                );

            };

    }


    // ==================================================
    // POSITION / SOURCE ANCHOR
    //
    // Do NOT calculate the position here manually.
    //
    // updateBusinessSourcePopupPosition()
    // uses the current EMFViewport state and
    // therefore remains correct after:
    //
    // - zoom
    // - pan
    // - resize
    // - viewport changes
    // ==================================================

    updateBusinessSourcePopupPosition?.();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "BUSINESS SOURCE POPUP OPEN",
        {
            id:
                source.id,

            type:
                source.type,

            state:
                source.state,

            isOutdoor
        }
    );
}

// ==================================================
// SOURCE → ROOM HIT TEST
//
// Determines whether a source physically belongs
// to a room based on its coordinates.
//
// IMPORTANT:
// Room Indoor membership does NOT depend on zones.
// ==================================================

function isSourceInsideRoom(
    source,
    room
) {

    if (
        !source ||
        !room ||
        !Array.isArray(
            room.polygon
        ) ||
        room.polygon.length < 3
    ) {

        return false;
    }


    const x =
        Number(
            source.x
        );

    const y =
        Number(
            source.y
        );


    if (
        !isFinite(x) ||
        !isFinite(y)
    ) {

        return false;
    }


    let inside =
        false;


    for (
        let i = 0,
        j = room.polygon.length - 1;

        i < room.polygon.length;

        j = i++
    ) {

        const xi =
            Number(
                room.polygon[i]?.x
            );

        const yi =
            Number(
                room.polygon[i]?.y
            );

        const xj =
            Number(
                room.polygon[j]?.x
            );

        const yj =
            Number(
                room.polygon[j]?.y
            );


        if (
            !isFinite(xi) ||
            !isFinite(yi) ||
            !isFinite(xj) ||
            !isFinite(yj)
        ) {

            continue;
        }


        const intersects =

            (
                (yi > y) !==
                (yj > y)
            )

            &&

            (
                x <
                (
                    (xj - xi) *
                    (y - yi) /
                    (
                        yj - yi
                    )
                ) +
                xi
            );


        if (
            intersects
        ) {

            inside =
                !inside;
        }
    }


    return inside;
}


window.isSourceInsideRoom =
    isSourceInsideRoom;


function openRoomSourcesPopup(
    roomId
) {

    // ==================================================
    // CURRENT FLOOR
    // ==================================================

    const floor =
        getCurrentFloor?.();


    if (
        !floor
    ) {

        console.error(
            "❌ ROOM SOURCES — CURRENT FLOOR NOT FOUND"
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
                    r.id ===
                    roomId
            );


    if (
        !room
    ) {

        console.error(
            "❌ ROOM SOURCES — ROOM NOT FOUND",
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
                zone =>
                    zone.roomId ===
                    room.id
            );


    // ==================================================
    // ROOM INDOOR SOURCES
    //
    // Indoor membership is determined by the source
    // position inside the Room polygon.
    //
    // DO NOT use linkedZoneIds here.
    // A room may have zero zones and still contain
    // Indoor sources.
    // ==================================================

    const roomSources =
        (floor.sources || [])
            .filter(
                source => {

                    const isIndoor =
                        window.INDOOR_SOURCE_TYPES
                            ?.includes(
                                source.type
                            );


                    if (
                        !isIndoor
                    ) {

                        return false;
                    }


                    return (
                        window.isSourceInsideRoom?.(
                            source,
                            room
                        ) === true
                    );

                }
            );


    const sourcesCount =
        roomSources.length;




    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "roomIndoorSourcesPopup"
        );

    const panel =
        document.getElementById(
            "roomIndoorSourcesPanel"
        );

    const list =
        document.getElementById(
            "roomIndoorSourcesList"
        );


    if (
        !popup ||
        !panel ||
        !list
    ) {

        console.error(
            "❌ ROOM SOURCES POPUP ELEMENTS NOT FOUND"
        );

        return;
    }


    // ==================================================
    // MOVE POPUP TO BODY
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
    // ACTIVE ROOM
    // ==================================================

    window.activeRoomSourcesRoomId =
        room.id;


    // ==================================================
    // TITLE
    // ==================================================

    const title =
        document.getElementById(
            "roomIndoorSourcesTitle"
        );


    if (
        title
    ) {

        title.innerText =
            `${room.code || room.name} · Indoor Sources`;
    }


    // ==================================================
    // RENDER LIST
    // ==================================================

    if (
        roomSources.length === 0
    ) {

        list.innerHTML = `

            <div
                style="
                    padding:18px 10px;

                    text-align:center;

                    font-size:12px;

                    color:#64748b;
                "
            >
                No indoor sources added
                to this room yet.
            </div>

        `;

    }

    else {

        list.innerHTML =

            roomSources
                .map(
                    source => {

                        const config =
                            OBJECT_CONFIGS?.[
                            source.type
                            ] || {};


                        // OBJECT_CONFIGS uses
                        // "image", not "icon".

                        const icon =
                            config.image
                                ? `
                                    <img
                                        src="${config.image}"
                                        alt=""
                                        style="
                                            width:18px;
                                            height:18px;
                                            object-fit:contain;
                                            display:block;
                                        "
                                    >
                                  `
                                : "📶";


                        const label =
                            config.label ||
                            source.type ||
                            "EMF Source";


                        return `

                            <div
                                style="
                                    display:flex;

                                    align-items:center;

                                    gap:8px;

                                    margin-bottom:6px;

                                    padding:8px 9px;

                                    box-sizing:border-box;

                                    border:1px solid #dbe3ec;

                                    border-radius:8px;

                                    background:#ffffff;
                                "
                            >

                                <button
                                    type="button"

                                    onclick="
                                        event.stopPropagation();

                                        viewRoomIndoorSource(
                                            '${source.id}'
                                        );
                                    "

                                    style="
                                        flex:1;

                                        min-width:0;

                                        display:flex;

                                        align-items:center;

                                        gap:8px;

                                        padding:0;

                                        border:0;

                                        background:transparent;

                                        text-align:left;

                                        cursor:pointer;
                                    "
                                >

                                    <span
                                        style="
                                            width:28px;
                                            height:28px;

                                            flex:0 0 28px;

                                            display:flex;

                                            align-items:center;

                                            justify-content:center;

                                            border-radius:7px;

                                            background:#f1f5f9;
                                        "
                                    >
                                        ${icon}
                                    </span>


                                    <span
                                        style="
                                            min-width:0;
                                        "
                                    >

                                        <span
                                            style="
                                                display:block;

                                                font-size:12px;

                                                font-weight:600;

                                                color:#0f172a;

                                                white-space:nowrap;

                                                overflow:hidden;

                                                text-overflow:ellipsis;
                                            "
                                        >
                                            ${label}
                                        </span>


                                        <span
                                            style="
                                                display:block;

                                                margin-top:2px;

                                                font-size:10px;

                                                color:#64748b;
                                            "
                                        >
                                            View on floor plan →
                                        </span>

                                    </span>

                                </button>


                                <button
                                    type="button"

                                    onclick="
                                        event.stopPropagation();

                                        deleteRoomIndoorSource(
                                            '${source.id}'
                                        );
                                    "

                                    style="
                                        flex:0 0 auto;

                                        height:28px;

                                        padding:4px 9px;

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

                        `;

                    }
                )
                .join("");

    }


    // ==================================================
    // SHOW POPUP
    // ==================================================

    popup.style.setProperty(
        "display",
        "block",
        "important"
    );

    popup.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    popup.style.setProperty(
        "left",
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
        "min-height",
        "100vh",
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
        "0",
        "important"
    );

    popup.style.setProperty(
        "transform",
        "none",
        "important"
    );

    popup.style.setProperty(
        "border-radius",
        "0",
        "important"
    );

    popup.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

    popup.style.setProperty(
        "z-index",
        "2000000",
        "important"
    );

    popup.style.setProperty(
        "overflow",
        "visible",
        "important"
    );



    // ==================================================
    // FOCUS
    // ==================================================

    requestAnimationFrame(
        () => {

            panel.focus();

        }
    );

    console.log(
        "🔥 ROOM INDOOR SOURCES OPEN",
        {
            roomId:
                room.id,

            roomCode:
                room.code,

            sourcesCount,

            sourceIds:
                roomSources.map(
                    source =>
                        source.id
                ),

            sourceTypes:
                roomSources.map(
                    source =>
                        source.type
                )
        }
    );
}

function viewRoomIndoorSource(
    sourceId
) {

    const roomId =
        window.activeRoomSourcesRoomId;


    const floor =
        getCurrentFloor?.();


    const source =
        floor?.sources?.find?.(
            s =>
                s.id ===
                sourceId
        );


    if (
        !source
    ) {

        console.warn(
            "⚠️ ROOM SOURCE NOT FOUND",
            sourceId
        );

        return;
    }


    // ==================================================
    // CLOSE ROOM SOURCES POPUP
    // ==================================================

    closeRoomIndoorSourcesPopup?.();


    // ==================================================
    // VIEW-ONLY SOURCE FOCUS
    //
    // IMPORTANT:
    // This is ONLY a visual focus on the floor plan.
    // It must NOT select or activate the source
    // for dragging.
    // ==================================================

    window.viewingSourceId =
        source.id;


    // ==================================================
    // CLEAR NORMAL OBJECT SELECTION
    //
    // Prevent the source from becoming draggable.
    // ==================================================

    if (
        window.objectTool
    ) {

        window.objectTool.selectedObjectId =
            null;
    }


    // ==================================================
    // CLEAR DRAG STATE
    // ==================================================

    stopDrag?.();

    if (
        window.objectTool
    ) {

        window.objectTool.draggingObject =
            null;

        window.objectTool.dragging =
            false;
    }


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();
}

function deleteRoomIndoorSource(
    sourceId
) {

    const roomId =
        window.activeRoomSourcesRoomId;


    const floor =
        getCurrentFloor?.();


    if (
        !floor
    ) {

        console.error(
            "❌ DELETE ROOM SOURCE — FLOOR NOT FOUND"
        );

        return;
    }


    const room =
        (floor.rooms || [])
            .find(
                room =>
                    room.id ===
                    roomId
            );


    if (
        !room
    ) {

        console.error(
            "❌ DELETE ROOM SOURCE — ROOM NOT FOUND",
            roomId
        );

        return;
    }


    const source =
        (floor.sources || [])
            .find(
                source =>
                    source.id ===
                    sourceId
            );


    if (
        !source
    ) {

        console.error(
            "❌ DELETE ROOM SOURCE — SOURCE NOT FOUND",
            sourceId
        );

        return;
    }


    // ==================================================
    // REMOVE FROM FLOOR SOURCES
    // ==================================================

    floor.sources =
        (floor.sources || [])
            .filter(
                source =>
                    source.id !==
                    sourceId
            );


    // ==================================================
    // CLEAR ACTIVE SOURCE
    // ==================================================

    if (
        window.lastPlacedSource?.id ===
        sourceId
    ) {

        window.lastPlacedSource =
            null;
    }


    if (
        window.activePopupSource?.id ===
        sourceId
    ) {

        window.activePopupSource =
            null;
    }


    if (
        window.selectedIndoorSource?.id ===
        sourceId
    ) {

        window.selectedIndoorSource =
            null;
    }


    // ==================================================
    // CLOSE SOURCE POPUP
    // ==================================================

    closeIndoorDistancePopup?.();

    closeBusinessSourcePopup?.();
    closeOutdoorSourcePopup?.();


    // ==================================================
    // SAVE
    // ==================================================

    saveProject?.();


    // ==================================================
    // RENDER
    // ==================================================

    requestRender?.();


    // ==================================================
    // REFRESH ROOM POPUP
    // ==================================================

    openRoomSourcesPopup(
        roomId
    );


    console.log(
        "✅ ROOM INDOOR SOURCE DELETED",
        {
            sourceId,
            roomId
        }
    );
}

function closeRoomIndoorSourcesPopup() {

    const popup =
        document.getElementById(
            "roomIndoorSourcesPopup"
        );


    if (
        !popup
    ) {

        return;
    }


    popup.style.display =
        "none";


    window.activeRoomSourcesRoomId =
        null;
}

document.addEventListener(
    "keydown",
    function (event) {

        const popup =
            document.getElementById(
                "roomIndoorSourcesPopup"
            );


        if (
            !popup ||
            getComputedStyle(
                popup
            ).display === "none"
        ) {

            return;
        }


        if (
            event.key === "Escape"
        ) {

            event.preventDefault();

            closeRoomIndoorSourcesPopup();

            return;
        }

    }
);


// ==================================================
// SAVE BUSINESS SOURCE
// ==================================================

function saveBusinessSource() {

    const source =
        window.activePopupSource;


    if (
        !source
    ) {

        console.warn(
            "⚠️ NO ACTIVE BUSINESS SOURCE"
        );

        return;
    }


    const stateSelect =
        document.getElementById(
            "businessSourceState"
        );


    const state =
        stateSelect?.value;


    const allowedStates = [
        "on",
        "off",
        "unknown"
    ];


    source.state =
        allowedStates.includes(
            state
        )
            ? state
            : "unknown";


    console.log(
        "BUSINESS SOURCE SAVED",
        {
            id:
                source.id,

            type:
                source.type,

            state:
                source.state
        }
    );


    saveProject?.();

    requestRender?.();

    closeBusinessSourcePopup();
}

// ==================================================
// CLOSE BUSINESS SOURCE POPUP
// ==================================================

function closeBusinessSourcePopup() {

    const popup =
        document.getElementById(
            "businessSourcePopup"
        );


    if (
        popup
    ) {

        popup.style.display =
            "none";
    }


    window.activePopupSource =
        null;


    window.selectedIndoorSource =
        null;


    requestRender?.();
}

// ==================================================
// DELETE BUSINESS SOURCE
// ==================================================

function deleteBusinessSource() {

    const source =
        window.activePopupSource;


    if (
        !source
    ) {

        return;
    }


    const floor =
        getCurrentFloor?.();


    if (
        !floor?.sources
    ) {

        return;
    }


    floor.sources =
        floor.sources.filter(
            s =>
                s.id !==
                source.id
        );


    console.log(
        "BUSINESS SOURCE DELETED",
        source.id
    );


    window.activePopupSource =
        null;


    window.selectedIndoorSource =
        null;


    saveProject?.();

    requestRender?.();

    closeBusinessSourcePopup();
}

function updateBusinessSourceLocks() {

    console.error(
        "LOCK CHECK",
        getCurrentFloor()?.zones?.length
    );

    const floor =
        getCurrentFloor?.();

    const hasZones =
        floor?.zones?.length > 0;

    const hint =
        document.getElementById(
            "indoorSourcesHint"
        );

    if (hasZones) {

        hint.innerHTML =
            "Choose indoor EMF sources";

    }
    else {

        hint.innerHTML =
            "🔒 Create at least one Zone first";

    }

    if (hint) {

        hint.style.display =
            hasZones
                ? "none"
                : "block";
    }

    [
        "btnWifiRouter",
        "btnBluetooth",
        "btnSmartMeter",
        "btnElectricalPanel"
    ].forEach(id => {

        const btn =
            document.getElementById(id);

        if (!btn) {
            return;
        }

        btn.disabled =
            !hasZones;
    });
}

function toggleOutdoorDirectionBlock() {


    const block =
        document.getElementById(
            "directionBlock"
        );

    if (!block) {
        return;
    }

    block.style.opacity =
        manual ? "0.4" : "1";

    block.style.pointerEvents =
        manual ? "none" : "auto";
}



function openSourceTypePopup() {

    const popup =
        document.getElementById(
            "outdoorSourcesPopup"
        );

    if (!popup) {
        return;
    }


    // ==================================================
    // SOURCE DESCRIPTIONS
    // ==================================================

    const sourceDescriptions = {

        wifi_router:
            "Wireless internet router.",

        bluetooth:
            "Short-range wireless devices.",

        smart_meter:
            "Utility meter. May be inside or outside a wall.",

        electrical_panel:
            "Main electrical distribution panel.",

        mobile_tower:
            "Cell tower / base station.",

        power_lines:
            "High voltage power lines.",

        solar:
            "Solar panels and inverters.",

        solar_inverter:
            "Solar panels and inverters.",

        heat_pump:
            "Air or ground source heat pump.",

        battery:
            "Home battery storage system.",

        ev_charger:
            "Electric vehicle charging station.",

        electrical_substation:
            "Electrical substation or transformer.",

        substation:
            "Electrical substation or transformer."

    };


    // ==================================================
    // INDOOR ICONS
    // ==================================================

    const indoorIcons = {

        wifi_router:
            "📶",

        bluetooth:
            "ᛒ",

        smart_meter:
            "📊",

        electrical_panel:
            "⚡"

    };


    // ==================================================
    // SOURCE CARD
    // ==================================================

    function createSourceCard(
        type,
        label,
        icon,
        description,
        variant
    ) {

        const borderColor =
            variant === "outdoor"
                ? "#d6e3d8"
                : "#d4deea";


        return `

            <button
                type="button"
                class="popup-source-type-btn"
                data-source-type="${type}"

                style="
                    width:100%;
                    height:45px;

                    min-width:0;

                    display:flex;
                    align-items:center;

                    box-sizing:border-box;

                    margin:0;
                    padding:5px 8px;

                    border:1px solid ${borderColor};
                    border-radius:6px;

                    background:#ffffff;

                    cursor:pointer;
                    text-align:left;

                    overflow:hidden;
                    flex-shrink:0;
                "
            >

                <span
                    style="
                        width:27px;
                        min-width:27px;

                        height:27px;

                        display:flex;
                        align-items:center;
                        justify-content:center;

                        margin-right:7px;

                        font-size:18px;
                        line-height:1;
                    "
                >
                    ${icon}
                </span>


                <span
                    style="
                        min-width:0;
                        flex:1;

                        display:flex;
                        flex-direction:column;
                        justify-content:center;

                        overflow:hidden;
                    "
                >

                    <span
                        style="
                            display:block;

                            font-size:10px;
                            font-weight:700;
                            line-height:13px;

                            color:#2563eb;

                            white-space:nowrap;
                            overflow:hidden;
                            text-overflow:ellipsis;
                        "
                    >
                        ${label}
                    </span>


                    <span
                        style="
                            display:block;

                            font-size:8px;
                            line-height:10px;

                            color:#64748b;

                            white-space:nowrap;
                            overflow:hidden;
                            text-overflow:ellipsis;
                        "
                    >
                        ${description}
                    </span>

                </span>

            </button>

        `;
    }


    // ==================================================
    // INDOOR CARDS
    // ==================================================

    const indoorCards =
        INDOOR_SOURCE_TYPES
            .map(type => {

                return createSourceCard(

                    type,

                    OBJECT_CONFIGS[type]?.label
                    || type,

                    indoorIcons[type]
                    || "📡",

                    sourceDescriptions[type]
                    || "",

                    "indoor"

                );

            })
            .join("");


    // ==================================================
    // OUTDOOR CARDS
    // ==================================================

    const outdoorCards =
        OUTDOOR_SOURCE_TYPES
            .map(item => {

                return createSourceCard(

                    item.type,

                    item.name,

                    item.icon,

                    sourceDescriptions[item.type]
                    || "",

                    "outdoor"

                );

            })
            .join("");


    // ==================================================
    // POPUP HTML
    // ==================================================

    popup.innerHTML = `

        <div
            style="
                height:48px;

                display:flex;
                align-items:center;
                justify-content:space-between;

                padding:0 14px;

                box-sizing:border-box;

                border-bottom:1px solid #e2e8f0;
            "
        >

            <div
                style="
                    font-size:16px;
                    font-weight:700;
                    color:#0f172a;
                "
            >
                Add Source
            </div>


            <button
                type="button"
                id="sourceTypePopupCloseBtn"
                title="Close"

                style="
                    width:28px;
                    height:28px;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    padding:0;

                    border:none;
                    background:transparent;

                    color:#64748b;

                    font-size:20px;
                    line-height:1;

                    cursor:pointer;
                    border-radius:6px;
                "
            >
                ✕
            </button>

        </div>


        <div
            style="
                display:grid;

                grid-template-columns:
                    minmax(0,1fr)
                    minmax(0,1fr);

                gap:8px;

                padding:7px 10px 4px;

                box-sizing:border-box;

                align-items:start;
            "
        >

            <!-- INDOOR -->

            <div
                style="
                    width:100%;

                    padding:7px;

                    box-sizing:border-box;

                    background:#f5f8fc;

                    border:1px solid #dce5ef;

                    border-radius:8px;

                    overflow:hidden;
                "
            >

                <div
                    style="
                        font-size:11px;
                        font-weight:700;
                        line-height:14px;

                        color:#0f172a;

                        margin-bottom:1px;
                    "
                >
                    Indoor Sources
                </div>


                <div
                    style="
                        font-size:8px;
                        line-height:10px;

                        color:#64748b;

                        margin-bottom:5px;
                    "
                >
                    Sources typically located inside the building.
                </div>


                <div
                    style="
                        display:flex;
                        flex-direction:column;

                        gap:3px;

                        width:100%;
                    "
                >

                    ${indoorCards}

                </div>

            </div>


            <!-- OUTDOOR -->

            <div
                style="
                    width:100%;

                    padding:7px;

                    box-sizing:border-box;

                    background:#f5f9f6;

                    border:1px solid #dce8de;

                    border-radius:8px;

                    overflow:hidden;
                "
            >

                <div
                    style="
                        font-size:11px;
                        font-weight:700;
                        line-height:14px;

                        color:#0f172a;

                        margin-bottom:1px;
                    "
                >
                    Outdoor Sources
                </div>


                <div
                    style="
                        font-size:8px;
                        line-height:10px;

                        color:#64748b;

                        margin-bottom:5px;
                    "
                >
                    Sources located outside the building or on the property.
                </div>


                <div
                    style="
                        display:flex;
                        flex-direction:column;

                        gap:3px;

                        width:100%;
                    "
                >

                    ${outdoorCards}

                </div>

            </div>

        </div>


        <!-- INFO -->

        <div
            style="
                min-height:25px;

                display:flex;
                align-items:center;

                padding:2px 10px 5px;

                box-sizing:border-box;
            "
        >

            <div
                style="
                    display:flex;
                    align-items:center;

                    gap:4px;

                    min-width:0;

                    font-size:8px;
                    line-height:10px;

                    color:#64748b;
                "
            >

                <span
                    style="
                        color:#2563eb;
                        font-size:12px;
                    "
                >
                    ⓘ
                </span>

                <span>
                    Select a source type to start placement on the floor plan.
                </span>

            </div>

        </div>

    `;

    // ==================================================
    // SOURCE POPUP POSITION
    // ==================================================

    popup.style.position =
        "fixed";

    popup.style.left =
        "50%";

    popup.style.top =
        "220px";

    popup.style.right =
        "auto";

    popup.style.bottom =
        "auto";

    popup.style.transform =
        "translateX(-50%)";

    popup.style.margin =
        "0";

    popup.style.width =
        "520px";

    popup.style.maxWidth =
        "calc(100vw - 32px)";

    popup.style.maxHeight =
        "calc(100vh - 220px)";

    popup.style.overflowY =
        "auto";

    popup.style.overflowX =
        "hidden";

    popup.style.boxSizing =
        "border-box";

    popup.style.border =
        "1px solid #dbe3ec";

    popup.style.borderRadius =
        "14px";

    popup.style.boxShadow =
        "0 18px 45px rgba(15,23,42,.18)";

    popup.style.background =
        "#ffffff";

    popup.style.display =
        "block";

    popup.style.visibility =
        "visible";

    popup.style.opacity =
        "1";

    popup.style.pointerEvents =
        "auto";

    popup.style.zIndex =
        "2000000";



    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    const closeBtn =
        document.getElementById(
            "sourceTypePopupCloseBtn"
        );


    if (closeBtn) {

        closeBtn.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeOutdoorSourcesPopup();

            };

    }


    // ==================================================
    // SOURCE BUTTONS
    // ==================================================

    const sourceButtons =
        popup.querySelectorAll(
            ".popup-source-type-btn"
        );


    sourceButtons.forEach(
        button => {

            button.addEventListener(
                "mouseenter",
                function () {

                    this.style.background =
                        "#eff6ff";

                    this.style.borderColor =
                        "#60a5fa";

                }
            );


            button.addEventListener(
                "mouseleave",
                function () {

                    const type =
                        this.dataset.sourceType;


                    const isOutdoor =
                        OUTDOOR_SOURCE_TYPES.some(
                            item =>
                                item.type === type
                        );


                    this.style.background =
                        "#ffffff";

                    this.style.borderColor =
                        isOutdoor
                            ? "#d6e3d8"
                            : "#d4deea";

                }
            );


            button.addEventListener(
                "focus",
                function () {

                    this.style.outline =
                        "2px solid #93c5fd";

                    this.style.outlineOffset =
                        "1px";

                }
            );


            button.addEventListener(
                "blur",
                function () {

                    this.style.outline =
                        "none";

                }
            );


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const type =
                        this.dataset.sourceType;


                    if (!type) {
                        return;
                    }


                    closeOutdoorSourcesPopup();


                    startObjectPlacement(
                        type
                    );

                }
            );

        }
    );


    // ==================================================
    // KEYBOARD
    // ==================================================

    popup.setAttribute(
        "tabindex",
        "0"
    );


    popup.onkeydown =
        function (event) {

            if (
                event.key === "Escape"
            ) {

                event.preventDefault();

                event.stopPropagation();

                closeOutdoorSourcesPopup();

                return;
            }


            if (
                event.key === "Enter"
            ) {

                const active =
                    document.activeElement;


                if (
                    active &&
                    popup.contains(active) &&
                    active.classList.contains(
                        "popup-source-type-btn"
                    )
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    active.click();

                }

            }

        };


    requestAnimationFrame(
        () => {

            popup.focus();

        }
    );

}


function initOutdoorDirectionHandlers() {

    document
        .querySelectorAll(
            'input[name="outdoorPlacement"]'
        )
        .forEach(radio => {

            radio.addEventListener(
                "change",
                toggleOutdoorDirectionBlock
            );

        });
}

document
    .querySelectorAll(
        'input[name="outdoorPlacement"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            toggleOutdoorDirectionBlock
        );

    });


// =====================
// 🔥 PLACEMENT
// =====================

window.handleSourceClick =
    handleSourceClick;

window.openSourceTypePopup =
    openSourceTypePopup;

window.openOutdoorSourceTypePopup =
    openOutdoorSourceTypePopup;

window.openOutdoorSourcesPopup =
    openOutdoorSourcesPopup;

window.closeOutdoorSourcesPopup =
    closeOutdoorSourcesPopup;

window.startOutdoorSourcePlacement =
    startOutdoorSourcePlacement;

window.showOutdoorSourcePicker =
    showOutdoorSourcePicker;

window.createOutdoorSource =
    createOutdoorSource;


// =====================
// 🔥 DISTANCE
// =====================

window.showIndoorDistancePopup =
    showIndoorDistancePopup;

window.closeIndoorDistancePopup =
    closeIndoorDistancePopup;

window.populateIndoorDistanceZones =
    populateIndoorDistanceZones;

window.saveSourceDistance =
    saveSourceDistance;


// =====================
// 🔥 OUTDOOR
// =====================

window.showOutdoorSourcePopup =
    showOutdoorSourcePopup;

window.closeOutdoorSourcePopup =
    closeOutdoorSourcePopup;

window.saveOutdoorSourceSettings =
    saveOutdoorSourceSettings;


// =====================
// 🔥 EDIT
// =====================

window.openSourcePanel =
    openSourcePanel;

window.closeSourcePopup =
    closeSourcePopup;

window.saveSourceEdit =
    saveSourceEdit;


// =====================
// 🔥 STATUS
// =====================

window.updateSourceButtons =
    updateSourceButtons;

window.updateCurrentExposure =
    updateCurrentExposure;  