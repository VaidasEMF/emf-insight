// =====================================================
// 🔥 CREATE PROJECT MODEL
// =====================================================
//
// PHI V1
//
// The project model is a compatibility workspace used
// by the existing engine.
//
// It must NOT be confused with the PHI domain model.
//
// HOME
//     Property Assessment
//     → Home spatial/context workspace
//
// BUSINESS
//     Professional Assessment
//     → Professional spatial/measurement workspace
//
// =====================================================

function createProjectModel(
    type = "home",
    propertyId = null,
    existingAssessmentId = null,
    existingProjectId = null
) {

    // ==================================================
    // 🔥 RESOLVE CONTEXT
    // ==================================================

    const projectType =
        type === "business"
            ? "business"
            : "home";


    const assessmentContext =
        projectType === "home"
            ? "home"
            : "professional";


    // ==================================================
    // 🔥 RESOLVE PROPERTY
    // ==================================================
    //
    // IMPORTANT:
    //
    // createProjectModel() MUST NOT create a Property.
    //
    // Property is the persistent parent object.
    //
    // The same Property may contain:
    //
    //     Home Assessment
    //     Professional Assessment #1
    //     Professional Assessment #2
    //     Professional Assessment #3
    //
    // ==================================================

    const resolvedPropertyId =
        propertyId ||
        null;


    // ==================================================
    // PROJECT ID
    // ==================================================

    const resolvedProjectId =
        existingProjectId ||
        null;


    // ==================================================
    // 🔥 RESOLVE ASSESSMENT ID
    // ==================================================
    //
    // If an existing canonical assessment ID is supplied,
    // reuse it.
    //
    // Otherwise create a new assessment ID.
    //
    // This prevents the compatibility workspace from
    // creating duplicate Home Assessment identities.
    //
    // ==================================================

    let assessmentId =
        existingAssessmentId || null;


    if (
        !assessmentId
    ) {

        if (
            assessmentContext ===
            "home"
        ) {

            assessmentId =
                window.PhiIdFactory
                    ?.createPropertyAssessmentId?.();

        }

        else {

            assessmentId =
                window.PhiIdFactory
                    ?.createProfessionalAssessmentId?.();
        }
    }


    // ==================================================
    // 🔥 SAFETY FALLBACK
    // ==================================================

    if (
        !assessmentId
    ) {

        assessmentId =
            (
                assessmentContext ===
                    "home"
                    ? "property_assessment_"
                    : "professional_assessment_"
            ) +
            Date.now();
    }


    // ==================================================
    // 🔥 CREATE INITIAL FLOOR
    // ==================================================
    //
    // IMPORTANT:
    //
    // The floor receives the assessment context
    // explicitly.
    //
    // HOME:
    //     home_floor_<UUID>
    //
    // PROFESSIONAL:
    //     floor_<UUID>
    //
    // ==================================================

    const initialFloor =
        createDefaultFloor(
            "Main Floor",
            assessmentContext
        );


    // ==================================================
    // 🔥 PROJECT MODEL
    // ==================================================

    return {

        // =================================================
        // LEGACY PROJECT TYPE
        // =================================================

        type:
            projectType,


        // =================================================
        // PHI ASSESSMENT CONTEXT
        // =================================================

        assessmentContext:
            assessmentContext,


        // =================================================
        // PHI ASSESSMENT ID
        // =================================================

        assessmentId:
            assessmentId,


        // =================================================
        // PROPERTY CONTEXT
        // =================================================
        //
        // This points to the persistent Property.
        //
        // It does NOT create a Property.
        //
        // =================================================

        propertyId:
            resolvedPropertyId,

        project_id:
            resolvedProjectId,


        // =================================================
        // PROPERTY TYPE
        // =================================================
        propertyType:
            "house",

        units:
            "m",

        // =================================================
        // FLOORS
        // =================================================
        //
        // HOME:
        //     Home Floors
        //
        // PROFESSIONAL:
        //     Professional Floors
        //
        // =================================================

        floors: [

            initialFloor

        ],


        currentFloorIndex:
            0,


        // =================================================
        // WORKFLOW
        // =================================================

        workflow:
            {},


        // =================================================
        // SETTINGS
        // =================================================

        settings:
            {},


        // =================================================
        // REPORTS
        // =================================================

        reports:
            [],


        // =================================================
        // SESSIONS
        // =================================================
        //
        // Compatibility structure.
        //
        // Long-term PHI model:
        //
        // HOME
        //     Home Assessment Sessions
        //
        // PROFESSIONAL
        //     Professional Measurement Sessions
        //
        // =================================================

        sessions:
            [],


        activeSessionId:
            null,


        // =================================================
        // OUTDOOR SOURCES
        // =================================================

        outdoorSources:
            []
    };
}


// =====================================================
// 🔥 EXPORT
// =====================================================

window.createProjectModel =
    createProjectModel;