const AppState = {

    property: {

        // =================================================
        // 🔥 CANONICAL PROPERTY ID
        // =================================================

        id: null,

        // =================================================
        // 🔥 PROPERTY HEALTH RECORD
        // =================================================
        //
        // One persistent PHR belongs to one Property.
        //
        // The PHR is NOT an assessment.
        //
        // Assessments are historical/current assessment
        // events attached to this Property Health Record.
        //
        // =================================================

        propertyHealthRecordId: null,

        name: "",

country: "",

state: "",

region: "",

city: "",

address: "",

propertyType: "",

        floors: [],

        currentFloorIndex: 0,
    },


    // =====================================================
    // PROPERTY ASSESSMENT
    //
    // Home / Property Assessment
    //
    // Context-based assessment.
    // No rooms / grids / physical measurements required.
    // =====================================================

    // =====================================================
    // PROPERTY ASSESSMENT
    //
    // Canonical Home / Property Assessment.
    //
    // One Property may have a current / historical
    // Property Assessment.
    //
    // The spatial Home workspace remains in
    // AppState.homeProject for compatibility.
    // =====================================================

    propertyAssessment: {

        // =================================================
        // 🔥 ASSESSMENT ID
        // =================================================

        id: null,

        // =================================================
        // 🔥 PROPERTY LINK
        // =================================================

        propertyId: null,

        // =================================================
        // 🔥 PHR LINK
        // =================================================

        propertyHealthRecordId: null,

        // =================================================
        // 🔥 CONTEXT
        // =================================================

        type: "property",

        assessmentContext: "home",

        // =================================================
        // LEGACY / COMPATIBILITY DATA
        // =================================================

        zones: [],

        sources: [],

        sessions: [],

        workflow: {},

        settings: {},

        reports: [],

        analysis: null,
    },


    // =====================================================
    // PROFESSIONAL ASSESSMENTS
    //
    // One property may have multiple professional
    // assessments over time.
    //
    // Example:
    //
    // Professional Assessment #1
    // Professional Assessment #2
    // Re-measurement
    // etc.
    // =====================================================

    professionalAssessments: [],





    // =====================================================
    // ACTIVE ASSESSMENT
    // =====================================================

    activeAssessment: {

        type: "property",

        id: null,
    },


    // =====================================================
    // ACTIVE PROJECT
    //
    // Temporary compatibility pointer.
    //
    // Existing engine code can continue using:
    //
    //     AppState.project
    //
    // while we migrate the rest of the application.
    // =====================================================

    project: null,


    // =====================================================
    // UI
    // =====================================================

    ui: {

        mode: null,

        selectedRoom: null,

        selectedZone: null,

        selectedSource: null,

        hoveredSourceId: null,

        roomDraft: null,

        zoneDraft: null,
    },


    // =====================================================
    // RENDER
    // =====================================================

    render: {

        zoom: 1,

        offsetX: 0,

        offsetY: 0,

        needsRender: false,
    },


    // =====================================================
    // MEASUREMENTS
    //
    // Professional Assessment only.
    //
    // Kept globally for compatibility with the existing
    // measurement engine during migration.
    // =====================================================

    measurement: {

        interaction: {

            mouseX: 0,

            mouseY: 0,

            lastMouseX: 0,

            lastMouseY: 0,

            isPanning: false,

            panStartX: 0,

            panStartY: 0,

            draggingSource: null,

            editingVertex: null,
        },

        currentSession: "session_1",

        measureMode: "rf",
    },
};

// =====================================================
// 🔥 CREATE PROFESSIONAL ASSESSMENT
// =====================================================
//
// A Property may have multiple Professional
// Assessments over time.
//
// Every Professional Assessment:
//
//     belongs to the same Property
//     belongs to the same PHR
//     gets its own unique Assessment ID
//
// The assessment is the canonical PHI object.
//
// businessProject is only the compatibility workspace.
//
// =====================================================

function createProfessionalAssessment() {

    // ==================================================
    // 🔥 PROPERTY CHECK
    // ==================================================

    const propertyId =
        AppState.property?.id || null;

    const propertyHealthRecordId =
        AppState.property
            ?.propertyHealthRecordId || null;


    if (!propertyId) {

        console.error(
            "❌ CANNOT CREATE PROFESSIONAL ASSESSMENT: PROPERTY ID MISSING"
        );

        return null;
    }


    if (!propertyHealthRecordId) {

        console.error(
            "❌ CANNOT CREATE PROFESSIONAL ASSESSMENT: PHR ID MISSING"
        );

        return null;
    }


    // ==================================================
    // 🔥 CREATE ASSESSMENT ID
    // ==================================================

    let assessmentId =

        window.PhiIdFactory
            ?.createProfessionalAssessmentId?.();


    // ==================================================
    // 🔥 SAFETY FALLBACK
    // ==================================================

    if (!assessmentId) {

        assessmentId =
            "professional_assessment_" +
            Date.now();
    }


    // ==================================================
    // 🔥 CREATE CANONICAL ASSESSMENT
    // ==================================================

    const assessment = {

        // =================================================
        // ID
        // =================================================

        id:
            assessmentId,


        // =================================================
        // PROPERTY
        // =================================================

        propertyId:
            propertyId,


        // =================================================
        // PHR
        // =================================================

        propertyHealthRecordId:
            propertyHealthRecordId,


        // =================================================
        // CONTEXT
        // =================================================

        type:
            "professional",

        assessmentContext:
            "professional",


        // =================================================
        // STATUS
        // =================================================

        status:
            "active",


        // =================================================
        // CREATED
        // =================================================

        createdAt:
            Date.now(),


        // =================================================
        // MEASUREMENT SESSIONS
        // =================================================

        measurementSessions:
            [],


        // =================================================
        // REPORTS
        // =================================================

        reports:
            [],


        // =================================================
        // ANALYSIS
        // =================================================

        analysis:
            null
    };


    // ==================================================
    // 🔥 STORE
    // ==================================================

    AppState.professionalAssessments
        .push(
            assessment
        );


    // ==================================================
    // 🔥 DEBUG
    // ==================================================

    console.log(
        "🔥 PROFESSIONAL ASSESSMENT CREATED:",
        assessment
    );


    return assessment;
}


// =====================================================
// 🔥 EXPORT
// =====================================================

window.createProfessionalAssessment =
    createProfessionalAssessment;

// =====================================================
// 🔥 INITIALIZE PROPERTY ID
// =====================================================
//
// A Property is the permanent anchor for the
// Property Health Record.
//
// It must survive across Home Assessments,
// Professional Assessments and future monitoring.
//
// =====================================================

// =====================================================
// 🔥 INITIALIZE PROPERTY ID
// =====================================================
//
// A Property is the permanent anchor for the
// Property Health Record.
//
// It must survive across Home Assessments,
// Professional Assessments and future monitoring.
//
// =====================================================

if (
    !AppState.property.id
) {

    if (
        !window.PhiIdFactory ||
        typeof window.PhiIdFactory.createPropertyId !==
        "function"
    ) {

        console.error(
            "❌ PHI ID FACTORY NOT AVAILABLE"
        );

    }
    else {

        AppState.property.id =
            window.PhiIdFactory
                .createPropertyId();

    }
}

// =====================================================
// 🔥 INITIALIZE PROPERTY HEALTH RECORD ID
// =====================================================
//
// The Property Health Record is persistent across
// multiple assessments of the same Property.
//
// One Property
//     ↓
// One Property Health Record
//     ↓
// Multiple Assessments over time
//
// =====================================================

if (
    !AppState.property.propertyHealthRecordId
) {

    if (
        !window.PhiIdFactory ||
        typeof window.PhiIdFactory
            .createPropertyHealthRecordId !==
        "function"
    ) {

        console.error(
            "❌ PHR ID FACTORY NOT AVAILABLE"
        );

    }
    else {

        AppState.property
            .propertyHealthRecordId =
            window.PhiIdFactory
                .createPropertyHealthRecordId();

    }
}

// =====================================================
// 🔥 INITIALIZE CANONICAL HOME ASSESSMENT
// =====================================================
//
// One Property
//     ↓
// One Property Health Record
//     ↓
// Home Property Assessment
//
// AppState.homeProject remains the compatibility
// workspace, but its assessmentId must point to this
// canonical assessment.
//
// =====================================================

if (
    !AppState.propertyAssessment.id
) {

    if (
        !window.PhiIdFactory ||
        typeof window.PhiIdFactory
            .createPropertyAssessmentId !==
        "function"
    ) {

        console.error(
            "❌ PROPERTY ASSESSMENT ID FACTORY NOT AVAILABLE"
        );

    }
    else {

        AppState.propertyAssessment.id =
            window.PhiIdFactory
                .createPropertyAssessmentId();

    }
}


// =====================================================
// 🔥 LINK HOME ASSESSMENT TO PROPERTY
// =====================================================

AppState.propertyAssessment.propertyId =
    AppState.property.id;


// =====================================================
// 🔥 LINK HOME ASSESSMENT TO PHR
// =====================================================

AppState.propertyAssessment
    .propertyHealthRecordId =

    AppState.property
        .propertyHealthRecordId;


// =====================================================
// 🔥 DEBUG
// =====================================================

console.log(
    "🔥 CANONICAL HOME ASSESSMENT:",
    AppState.propertyAssessment
);


// =====================================================
// 🔥 PROPERTY / PHR DEBUG
// =====================================================

console.log(
    "🔥 PROPERTY ID:",
    AppState.property.id
);

console.log(
    "🔥 PROPERTY HEALTH RECORD ID:",
    AppState.property
        .propertyHealthRecordId
);




// =====================================================
// ACTIVE PROJECT POINTER
// =====================================================
//
// Property Assessment is the default starting point.
//
// Existing code can continue using:
//
//     AppState.project
//
// without knowing yet about the new architecture.
// =====================================================

AppState.project =
    AppState.property;


// =====================================================
// GLOBAL EXPORT
// =====================================================

window.AppState =
    AppState;