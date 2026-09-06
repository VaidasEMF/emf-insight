// =====================================================
// 🔥 SESSION STORAGE
// =====================================================
//
// PHI V1
//
// Property
//     ↓
// Assessment
//     ↓
// Session
//
// HOME
//     Property Assessment
//     └── Home Assessment Session
//
// PROFESSIONAL
//     Professional Assessment
//     └── Professional Measurement Session
//
// window.sessions remains a compatibility layer for
// the existing measurement engine.
//
// IMPORTANT:
//
// This file must NOT create a session while loading.
//
// bootstrap / window.onload calls:
//     initializeSessions()
//
// after:
//     initializeProjects()
//
// =====================================================


console.log(
    "🔥 SESSIONS MODULE LOADED",
    {
        createSession:
            typeof createSession,

        windowCreateSession:
            typeof window.createSession
    }
);


// =====================================================
// 🔥 SESSION CONTEXT
// =====================================================
//
// AppMode is the primary runtime context.
//
// Project context is the compatibility fallback.
//
// =====================================================

function getSessionContext() {

    // ==================================================
    // PRIMARY CONTEXT
    // ==================================================

    if (
        window.AppMode?.current ===
        "home"
    ) {

        return "home";
    }


    if (
        window.AppMode?.current ===
        "business"
    ) {

        return "professional";
    }


    // ==================================================
    // PROJECT FALLBACK
    // ==================================================

    const project =
        AppState?.project ||
        null;


    if (
        project?.assessmentContext ===
        "home"
    ) {

        return "home";
    }


    if (
        project?.assessmentContext ===
        "professional"
    ) {

        return "professional";
    }


    // ==================================================
    // FINAL FALLBACK
    // ==================================================

    return "professional";
}


// =====================================================
// 🔥 CURRENT ASSESSMENT ID
// =====================================================
//
// The Assessment is determined from the active
// session context.
//
// HOME
//     AppState.propertyAssessment.id
//
// PROFESSIONAL
//     AppState.businessProject.assessmentId
//
// =====================================================

function getCurrentAssessmentId() {

    const sessionContext =
        getSessionContext();


    // ==================================================
    // HOME
    // ==================================================

    if (
        sessionContext ===
        "home"
    ) {

        return (

            AppState
                ?.propertyAssessment
                ?.id ||

            AppState
                ?.homeProject
                ?.assessmentId ||

            null
        );
    }


    // ==================================================
    // PROFESSIONAL
    // ==================================================

    if (
        AppState
            ?.businessProject
            ?.assessmentId
    ) {

        return (
            AppState
                .businessProject
                .assessmentId
        );
    }


    // ==================================================
    // PROFESSIONAL ASSESSMENT FALLBACK
    // ==================================================

    const activeAssessment =

        AppState
            ?.professionalAssessments
            ?.find(
                assessment =>
                    assessment &&
                    assessment.status ===
                    "active"
            );


    if (
        activeAssessment?.id
    ) {

        return (
            activeAssessment.id
        );
    }


    // ==================================================
    // FIRST PROFESSIONAL ASSESSMENT FALLBACK
    // ==================================================

    const firstAssessment =

        AppState
            ?.professionalAssessments
            ?.find(
                assessment =>
                    assessment &&
                    assessment.id
            );


    if (
        firstAssessment?.id
    ) {

        return (
            firstAssessment.id
        );
    }


    // ==================================================
    // LEGACY PROJECT FALLBACK
    // ==================================================

    return (

        AppState
            ?.project
            ?.assessmentId ||

        null
    );
}


// =====================================================
// 🔥 INITIALIZE SESSIONS
// =====================================================
//
// Sessions belong to the currently active Assessment.
//
// =====================================================

function initializeSessions() {

    console.log(
        "🔥🔥🔥 INITIALIZE SESSIONS"
    );


    // ==================================================
    // RESET STORAGE
    // ==================================================

    window.sessions = [];


    // ==================================================
    // RESOLVE CONTEXT
    // ==================================================

    const sessionContext =
        getSessionContext();


    // ==================================================
    // RESOLVE ASSESSMENT
    // ==================================================

    const assessmentId =
        getCurrentAssessmentId();


    console.error(
        "🔥🔥🔥 SESSION INIT CONTEXT",
        {
            sessionContext,

            assessmentId,

            appMode:
                window.AppMode?.current,

            projectType:
                AppState
                    ?.project
                    ?.type,

            projectAssessmentContext:
                AppState
                    ?.project
                    ?.assessmentContext,

            homeAssessmentId:
                AppState
                    ?.propertyAssessment
                    ?.id,

            homeProjectAssessmentId:
                AppState
                    ?.homeProject
                    ?.assessmentId,

            professionalAssessmentId:
                AppState
                    ?.businessProject
                    ?.assessmentId
        }
    );


    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        !assessmentId
    ) {

        console.error(
            "❌ SESSION INITIALIZATION FAILED:",
            "NO ASSESSMENT ID"
        );

        return null;
    }


    // ==================================================
    // CREATE FIRST SESSION
    // ==================================================
    //
    // Keep session_1 for compatibility with the
    // existing measurement engine.
    //
    // ==================================================

    const firstSession =
        createSession(
            "Session 1 · Initial Survey",
            "#00d4ff",
            "session_1",
            sessionContext,
            assessmentId
        );


    // ==================================================
    // STORE
    // ==================================================

    window.sessions.push(
        firstSession
    );


    // ==================================================
    // CURRENT SESSION
    // ==================================================

    AppState.measurement.currentSession =
        firstSession.id;


    // ==================================================
    // VISIBLE SESSIONS
    // ==================================================

    AppState.measurement.visibleSessions = [

        firstSession.id

    ];


    // ==================================================
    // DEBUG
    // ==================================================

    console.error(
        "🔥🔥🔥 CURRENT SESSION AFTER INIT",
        {
            id:
                firstSession.id,

            sessionContext:
                firstSession.sessionContext,

            assessmentId:
                firstSession.assessmentId
        }
    );


    // ==================================================
    // RENDER
    // ==================================================

    renderSessionTabs?.();


    return firstSession;
}


// =====================================================
// 🔥 ADD SESSION
// =====================================================

function addSession() {

    const name =
        prompt(
            "Session name:"
        );


    if (
        !name
    ) {

        return;
    }


    // ==================================================
    // COLORS
    // ==================================================

    const colors = [

        "#00d4ff",

        "#ff9800",

        "#ff4d6d",

        "#22c55e",

        "#a855f7",

        "#facc15"

    ];


    const color =
        colors[
        (
            window.sessions ||
            []
        ).length %
        colors.length
        ];


    // ==================================================
    // CURRENT CONTEXT
    // ==================================================

    const sessionContext =
        getSessionContext();


    // ==================================================
    // CURRENT ASSESSMENT
    // ==================================================

    const assessmentId =
        getCurrentAssessmentId();


    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        !assessmentId
    ) {

        console.error(
            "❌ CANNOT CREATE SESSION:",
            "NO ASSESSMENT ID"
        );

        updateStatus?.(
            "❌ No active assessment"
        );

        return;
    }


    // ==================================================
    // CREATE PHI SESSION
    // ==================================================
    //
    // ID = null
    //
    // createSession() will generate the canonical
    // Home / Professional Session ID.
    //
    // ==================================================

    const session =
        createSession(
            name,
            color,
            null,
            sessionContext,
            assessmentId
        );


    // ==================================================
    // STORE
    // ==================================================

    window.sessions.push(
        session
    );


    // ==================================================
    // CURRENT
    // ==================================================

    AppState.measurement.currentSession =
        session.id;


    // ==================================================
    // VISIBLE
    // ==================================================

    if (
        !Array.isArray(
            AppState
                .measurement
                .visibleSessions
        )
    ) {

        AppState
            .measurement
            .visibleSessions = [];
    }


    AppState
        .measurement
        .visibleSessions
        .push(
            session.id
        );


    // ==================================================
    // RENDER
    // ==================================================

    renderSessionTabs?.();


    updateStatus?.(
        "🆕 Session created"
    );


    requestRender?.();


    // ==================================================
    // DEBUG
    // ==================================================

    console.error(
        "🔥🔥🔥 NEW SESSION CREATED",
        {
            id:
                session.id,

            context:
                session.sessionContext,

            assessmentId:
                session.assessmentId,

            name:
                session.name
        }
    );


    return session;
}


// =====================================================
// 🔥 SWITCH SESSION
// =====================================================

function switchSession(
    id
) {

    const session =
        (
            window.sessions ||
            []
        ).find(
            s =>
                s.id === id
        );


    if (
        !session
    ) {

        console.warn(
            "⚠ SESSION NOT FOUND",
            id
        );

        return;
    }


    AppState.measurement.currentSession =
        id;


    renderSessionTabs?.();

    requestRender?.();

    updateStatus?.(
        "📊 Session switched"
    );
}


// =====================================================
// 🔥 TOGGLE VISIBILITY
// =====================================================

function toggleSessionVisibility(
    id
) {

    if (
        !Array.isArray(
            AppState
                .measurement
                .visibleSessions
        )
    ) {

        AppState
            .measurement
            .visibleSessions = [];
    }


    const visible =
        AppState
            .measurement
            .visibleSessions;


    if (
        visible.includes(id)
    ) {

        AppState
            .measurement
            .visibleSessions =

            visible.filter(
                s =>
                    s !== id
            );
    }

    else {

        visible.push(id);
    }


    requestRender?.();
}


// =====================================================
// 🔥 RENDER SESSION TABS
// =====================================================

function renderSessionTabs() {

    const wrap =
        document.getElementById(
            "sessionTabs"
        );


    if (
        !wrap
    ) {

        return;
    }


    wrap.innerHTML = "";


    (
        window.sessions ||
        []
    ).forEach(
        session => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "session-row";


            // ==========================================
            // BUTTON
            // ==========================================

            const btn =
                document.createElement(
                    "button"
                );


            btn.innerText =
                session.name;


            btn.style.border =

                "2px solid " +
                session.color;


            if (

                AppState
                    .measurement
                    .currentSession ===
                session.id

            ) {

                btn.style.boxShadow =

                    "0 0 10px " +
                    session.color;
            }


            btn.onclick =
                () =>
                    switchSession(
                        session.id
                    );


            // ==========================================
            // VISIBILITY
            // ==========================================

            const toggle =
                document.createElement(
                    "input"
                );


            toggle.type =
                "checkbox";


            toggle.checked =

                AppState
                    .measurement
                    .visibleSessions
                    .includes(
                        session.id
                    );


            toggle.onchange =
                () =>
                    toggleSessionVisibility(
                        session.id
                    );


            row.appendChild(
                toggle
            );


            row.appendChild(
                btn
            );


            wrap.appendChild(
                row
            );
        }
    );
}


// =====================================================
// 🔥 CURRENT SESSION
// =====================================================

function getCurrentSession() {

    return (
        window.sessions ||
        []
    ).find(

        session =>

            session.id ===

            AppState
                .measurement
                .currentSession
    );
}


// =====================================================
// 🔥 VISIBLE SESSIONS
// =====================================================

function getVisibleSessions() {

    return (

        AppState
            .measurement
            .visibleSessions ||

        []
    );
}


// =====================================================
// 🔥 EXPORTS
// =====================================================

window.getSessionContext =
    getSessionContext;

window.getCurrentAssessmentId =
    getCurrentAssessmentId;

window.initializeSessions =
    initializeSessions;

window.addSession =
    addSession;

window.switchSession =
    switchSession;

window.renderSessionTabs =
    renderSessionTabs;

window.toggleSessionVisibility =
    toggleSessionVisibility;

window.getCurrentSession =
    getCurrentSession;

window.getVisibleSessions =
    getVisibleSessions;