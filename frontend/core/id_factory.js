// =====================================================
// PHI ID FACTORY
// =====================================================
//
// Centralized identifier generation for PHI.
//
// IDs identify domain objects.
// UI counters such as P1 / Z1 are NOT domain IDs.
//
// =====================================================

function createPhiId(
    prefix
) {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return (
            prefix +
            "_" +
            crypto.randomUUID()
        );
    }

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


// =====================================================
// PROPERTY
// =====================================================

function createPropertyId() {

    return createPhiId(
        "property"
    );
}


// =====================================================
// PROPERTY HEALTH RECORD
// =====================================================

function createPropertyHealthRecordId() {

    return createPhiId(
        "phr"
    );
}


// =====================================================
// PROPERTY ASSESSMENT
// =====================================================

function createPropertyAssessmentId() {

    return createPhiId(
        "property_assessment"
    );
}


// =====================================================
// HOME ASSESSMENT SESSION
// =====================================================

function createHomeAssessmentSessionId() {

    return createPhiId(
        "home_session"
    );
}


// =====================================================
// PROFESSIONAL ASSESSMENT
// =====================================================

function createProfessionalAssessmentId() {

    return createPhiId(
        "professional_assessment"
    );
}


// =====================================================
// PROFESSIONAL MEASUREMENT SESSION
// =====================================================

function createProfessionalMeasurementSessionId() {

    return createPhiId(
        "professional_session"
    );
}


// =====================================================
// HOME FLOOR
// =====================================================

function createHomeFloorId() {

    return createPhiId(
        "home_floor"
    );
}


// =====================================================
// PROFESSIONAL FLOOR
// =====================================================

function createProfessionalFloorId() {

    return createPhiId(
        "floor"
    );
}


// =====================================================
// LIFESTYLE AREA
// =====================================================

function createLifestyleAreaId() {

    return createPhiId(
        "lifestyle_area"
    );
}


// =====================================================
// PROFESSIONAL ROOM
// =====================================================

function createRoomId() {

    return createPhiId(
        "room"
    );
}


// =====================================================
// PROFESSIONAL ZONE
// =====================================================

function createZoneId() {

    return createPhiId(
        "zone"
    );
}


// =====================================================
// SOURCE
// =====================================================

function createSourceId() {

    return createPhiId(
        "source"
    );
}


// =====================================================
// MEASUREMENT POINT
// =====================================================

function createMeasurementPointId() {

    return createPhiId(
        "measurement_point"
    );
}


// =====================================================
// MEASUREMENT
// =====================================================

function createMeasurementId() {

    return createPhiId(
        "measurement"
    );
}


// =====================================================
// EXPORT
// =====================================================

window.PhiIdFactory = {

    createPhiId,

    createPropertyId,

    createPropertyHealthRecordId,

    createPropertyAssessmentId,

    createHomeAssessmentSessionId,

    createProfessionalAssessmentId,

    createProfessionalMeasurementSessionId,

    createHomeFloorId,

    createProfessionalFloorId,

    createLifestyleAreaId,

    createRoomId,

    createZoneId,

    createSourceId,

    createMeasurementPointId,

    createMeasurementId
};