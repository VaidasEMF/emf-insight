// =====================================================
// 🔥 SESSION FACTORY
// =====================================================
//
// PHI V1
//
// PROPERTY
//     ↓
// PROPERTY HEALTH RECORD
//     ↓
// ASSESSMENT
//     ↓
// SESSION
//
// HOME
//     Property Assessment
//     └── Home Assessment Sessions
//
// PROFESSIONAL
//     Professional Assessment
//     └── Professional Measurement Sessions
//
// A Session belongs to an Assessment.
// A Session is NOT a Property.
// A Session is NOT a PHR.
//
// =====================================================

console.error(
    "🔥🔥🔥 SESSION_FACTORY EXECUTED — PHI V1"
);


// =====================================================
// 🔥 CREATE SESSION
// =====================================================

function createSession(
    name = "Session",
    color = "#00d4ff",
    id = null,
    context = null,
    assessmentId = null
) {

    console.error(
        "🔥🔥🔥 CREATE SESSION",
        {
            name,
            context,
            assessmentId,
            suppliedId: id
        }
    );


    // ==================================================
    // 🔥 RESOLVE SESSION CONTEXT
    // ==================================================

    let sessionContext =
        context;


    // --------------------------------------------------
    // Explicit HOME
    // --------------------------------------------------

    if (
        sessionContext ===
        "home"
    ) {

        sessionContext =
            "home";
    }


    // --------------------------------------------------
    // Explicit PROFESSIONAL
    // --------------------------------------------------

    else if (
        sessionContext ===
        "business" ||
        sessionContext ===
        "professional"
    ) {

        sessionContext =
            "professional";
    }


    // --------------------------------------------------
    // Compatibility fallback
    // --------------------------------------------------

    else if (
        window.AppMode?.current ===
        "home"
    ) {

        sessionContext =
            "home";
    }

    else {

        sessionContext =
            "professional";
    }


    // ==================================================
    // 🔥 CREATE SESSION ID
    // ==================================================
    //
    // Existing IDs are preserved.
    //
    // New sessions receive canonical PHI IDs.
    //
    // ==================================================

    let sessionId =
        id;


    if (
        !sessionId
    ) {

        if (
            sessionContext ===
            "home"
        ) {

            sessionId =
                window.PhiIdFactory
                    ?.createHomeAssessmentSessionId?.();
        }

        else {

            sessionId =
                window.PhiIdFactory
                    ?.createProfessionalMeasurementSessionId?.();
        }
    }


    // ==================================================
    // 🔥 SAFETY FALLBACK
    // ==================================================

    if (
        !sessionId
    ) {

        sessionId =
            (
                sessionContext ===
                    "home"
                    ? "home_session_"
                    : "professional_session_"
            ) +
            Date.now();
    }


    // ==================================================
    // 🔥 RESOLVE PARENT ASSESSMENT
    // ==================================================
    //
    // Priority:
    //
    // 1. Explicit assessmentId
    //
    // 2. Home canonical assessment
    //
    // 3. Active canonical professional assessment
    //
    // 4. Active project compatibility fallback
    //
    // ==================================================

    let resolvedAssessmentId =
        assessmentId;


    // ==================================================
    // HOME
    // ==================================================

    if (
        !resolvedAssessmentId &&
        sessionContext ===
        "home"
    ) {

        resolvedAssessmentId =

            AppState
                ?.propertyAssessment
                ?.id ||

            null;
    }


    // ==================================================
    // PROFESSIONAL
    // ==================================================

    if (
        !resolvedAssessmentId &&
        sessionContext ===
        "professional"
    ) {

        // ----------------------------------------------
        // Find active/current Professional Assessment
        // ----------------------------------------------

        const activeProfessionalAssessment =

            AppState
                ?.professionalAssessments
                ?.find(
                    assessment =>

                        assessment &&
                        assessment.status ===
                        "active"
                );


        if (
            activeProfessionalAssessment
        ) {

            resolvedAssessmentId =

                activeProfessionalAssessment
                    .id;
        }


        // ----------------------------------------------
        // Fallback to first Professional Assessment
        // ----------------------------------------------

        if (
            !resolvedAssessmentId
        ) {

            resolvedAssessmentId =

                AppState
                    ?.professionalAssessments
                    ?.find(
                        assessment =>
                            assessment &&
                            assessment.id
                    )
                    ?.id ||

                null;
        }
    }


    // ==================================================
    // 🔥 FINAL COMPATIBILITY FALLBACK
    // ==================================================
    //
    // This keeps older engine code working.
    //
    // It is intentionally LAST.
    //
    // ==================================================

    if (
        !resolvedAssessmentId
    ) {

        resolvedAssessmentId =

            AppState
                ?.project
                ?.assessmentId ||

            null;
    }


    // ==================================================
    // 🔥 SESSION OBJECT
    // ==================================================

    const session = {

        // =================================================
        // IDENTITY
        // =================================================

        id:
            sessionId,


        // =================================================
        // PHI CONTEXT
        // =================================================

        sessionContext:
            sessionContext,


        // =================================================
        // PARENT ASSESSMENT
        // =================================================

        assessmentId:
            resolvedAssessmentId,


        // =================================================
        // SESSION NAME
        // =================================================

        name,


        // =================================================
        // UI COLOR
        // =================================================

        color,


        // =================================================
        // CREATED
        // =================================================

        createdAt:
            Date.now(),


        // =================================================
        // NOTES
        // =================================================

        notes:
            "",


        // =================================================
        // VISIBILITY
        // =================================================

        visible:
            true
    };


    // ==================================================
    // 🔥 DEBUG
    // ==================================================

    console.error(
        "🔥🔥🔥 SESSION CREATED",
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
// 🔥 EXPORT
// =====================================================

window.createSession =
    createSession;