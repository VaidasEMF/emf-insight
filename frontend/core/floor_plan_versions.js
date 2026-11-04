
// =====================================================
// PHI FLOOR PLAN VERSION CONTROL
// =====================================================
//
// One Floor
// One Active Plan
// Version History
//
// This module manages floor plan version metadata.
// Existing assessment data remains on the Floor object
// until controlled version replacement is implemented.
//
// =====================================================


// =====================================================
// CREATE FLOOR PLAN VERSION
// =====================================================

function createFloorPlanVersion(
    floor,
    planData = {}
) {

    if (!floor || typeof floor !== "object") {

        console.error(
            "[FLOOR PLAN VERSION] Invalid floor object."
        );

        return null;
    }


    // -------------------------------------------------
    // ID FACTORY
    // -------------------------------------------------

    const idFactory =
        window.PhiIdFactory;

    if (
        !idFactory ||
        typeof idFactory.createPhiId !== "function"
    ) {

        console.error(
            "[FLOOR PLAN VERSION] PhiIdFactory unavailable."
        );

        return null;
    }


    // -------------------------------------------------
    // VERSION NUMBER
    // -------------------------------------------------

    const existingVersions =
        Array.isArray(floor.planVersions)
            ? floor.planVersions
            : [];

    const nextVersion =
        existingVersions.reduce(
            (max, item) => {

                const version =
                    Number(item.version) || 0;

                return Math.max(max, version);
            },
            0
        ) + 1;


    // -------------------------------------------------
    // VERSION OBJECT
    // -------------------------------------------------

    const versionId =
        idFactory.createPhiId(
            "plan_version"
        );

    const planVersion = {

        id: versionId,

        version: nextVersion,

        status: "active",

        plan: {

            imagePath:
                planData.imagePath || null,

            imageFileName:
                planData.imageFileName || null,

            imageFileSize:
                planData.imageFileSize ?? null,

            imageWidth:
                Number(planData.imageWidth) || 0,

            imageHeight:
                Number(planData.imageHeight) || 0
        },

        scale: {

            scaleConfirmed: false,

            currentScale: 0,

            scaleReferencePixels: 0,

            scaleReferenceMeters: 0
        },

        assessment: null,

        createdAt:
            new Date().toISOString(),

        archivedAt: null
    };


    // -------------------------------------------------
    // ACTIVATE VERSION
    // -------------------------------------------------

    if (!Array.isArray(floor.planVersions)) {

        floor.planVersions = [];
    }

    floor.planVersions.push(
        planVersion
    );

    floor.activePlanVersionId =
        versionId;


    console.log(
        "[FLOOR PLAN VERSION CREATED]",
        {
            floorId: floor.id,
            versionId,
            version: nextVersion
        }
    );

    return planVersion;
}


// =====================================================
// CREATE FULL ASSESSMENT SNAPSHOT
// =====================================================

function createAssessmentSnapshot(floor) {

    if (!floor || typeof floor !== "object") {

        console.error(
            "[ASSESSMENT SNAPSHOT] Invalid floor."
        );

        return null;
    }

    // -------------------------------------------------
    // DEEP COPY
    // -------------------------------------------------

    function deepCopy(value) {

        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }

    // -------------------------------------------------
    // ASSESSMENT DATA
    // -------------------------------------------------

    const snapshot = {

        floor: {
            id: floor.id || null,
            name: floor.name || null,
            assessmentContext:
                floor.assessmentContext || null
        },

        plan: {
            imagePath: floor.imagePath || null,
            imageFileName: floor.imageFileName || null,
            imageFileSize: floor.imageFileSize ?? null
        },

        scale: {
            scaleConfirmed:
                floor.scaleConfirmed ?? false,

            currentScale:
                floor.currentScale ?? 0,

            scaleReferencePixels:
                floor.scaleReferencePixels ?? 0,

            scaleReferenceMeters:
                floor.scaleReferenceMeters ?? 0,

            canvasWidth:
                floor.canvasWidth ?? 0,

            canvasHeight:
                floor.canvasHeight ?? 0
        },

        assessment: {

            rooms: deepCopy(floor.rooms || []),

            zones: deepCopy(floor.zones || []),

            sources: deepCopy(floor.sources || []),

            indoorSources:
                deepCopy(floor.indoorSources || []),

            outdoorSources:
                deepCopy(floor.outdoorSources || []),

            outdoorSourceRelationships:
                deepCopy(
                    floor.outdoorSourceRelationships || []
                )
        },

        createdAt: new Date().toISOString()
    };

    console.log(
        "[ASSESSMENT SNAPSHOT CREATED]",
        {
            floorId: floor.id,
            zones: snapshot.assessment.zones.length,
            sources: snapshot.assessment.sources.length,
            rooms: snapshot.assessment.rooms.length
        }
    );

    return snapshot;
}


// =====================================================
// ARCHIVE ACTIVE FLOOR PLAN VERSION
// =====================================================

function archiveActiveFloorPlanVersion(floor) {

    if (!floor || typeof floor !== "object") {
        console.error(
            "[FLOOR PLAN ARCHIVE] Invalid floor."
        );
        return null;
    }

    const versions = Array.isArray(floor.planVersions)
        ? floor.planVersions
        : [];

    const activeVersion = versions.find(
        version =>
            version.id === floor.activePlanVersionId &&
            version.status === "active"
    );

    if (!activeVersion) {
        console.warn(
            "[FLOOR PLAN ARCHIVE] No active version found."
        );
        return null;
    }

    // Preserve the complete current assessment.
    const snapshot = window.createAssessmentSnapshot(floor);

    if (!snapshot) {
        console.error(
            "[FLOOR PLAN ARCHIVE] Snapshot creation failed."
        );
        return null;
    }

    // Attach snapshot to the old version.
    activeVersion.assessment = snapshot;

    activeVersion.status = "archived";

    activeVersion.archivedAt =
        new Date().toISOString();

    console.log(
        "[FLOOR PLAN VERSION ARCHIVED]",
        {
            floorId: floor.id,
            versionId: activeVersion.id,
            version: activeVersion.version,
            zones: snapshot.assessment.zones.length,
            sources: snapshot.assessment.sources.length
        }
    );

    return activeVersion;
}


// =====================================================
// ACTIVATE NEW FLOOR PLAN VERSION
// =====================================================

function activateNewFloorPlanVersion(
    floor,
    planData = {},
    options = {}
) {

    if (!floor || typeof floor !== "object") {
        console.error(
            "[FLOOR PLAN ACTIVATION] Invalid floor."
        );
        return null;
    }

    const idFactory = window.PhiIdFactory;

    if (
        !idFactory ||
        typeof idFactory.createPhiId !== "function"
    ) {
        console.error(
            "[FLOOR PLAN ACTIVATION] ID factory unavailable."
        );
        return null;
    }

    const versions = Array.isArray(floor.planVersions)
        ? floor.planVersions
        : [];

    // -------------------------------------------------
    // FIND CURRENT ACTIVE VERSION
    // -------------------------------------------------

    const activeVersion = versions.find(
        version =>
            version.id === floor.activePlanVersionId &&
            version.status === "active"
    );

    if (floor.activePlanVersionId && !activeVersion) {
        console.error(
            "[FLOOR PLAN ACTIVATION] Active version not found."
        );
        return null;
    }

    // -------------------------------------------------
    // SAFETY: DO NOT DISCARD UNVERSIONED ASSESSMENT
    // -------------------------------------------------

    const hasExistingAssessment = [
        floor.rooms,
        floor.zones,
        floor.sources,
        floor.indoorSources,
        floor.outdoorSources
    ].some(
        collection =>
            Array.isArray(collection) &&
            collection.length > 0
    );

    if (!activeVersion && hasExistingAssessment) {
        console.error(
            "[FLOOR PLAN ACTIVATION] Existing assessment has no active version. Aborting."
        );
        return null;
    }

    // -------------------------------------------------
    // PREPARE OLD ASSESSMENT SNAPSHOT
    // -------------------------------------------------

    const preserveAssessment =
        options.preserveAssessment !== false;

    let oldSnapshot = null;

    if (activeVersion && preserveAssessment) {

        oldSnapshot =
            window.createAssessmentSnapshot(floor);

        if (!oldSnapshot) {
            console.error(
                "[FLOOR PLAN ACTIVATION] Snapshot failed. Aborting."
            );
            return null;
        }
    }

    // -------------------------------------------------
    // PREPARE NEW VERSION (WITHOUT MUTATING FLOOR)
    // -------------------------------------------------

    const nextVersionNumber =
        versions.reduce(
            (max, item) =>
                Math.max(max, Number(item.version) || 0),
            0
        ) + 1;

    const newVersion = {

        id: planData.planVersionId ||
            idFactory.createPhiId("plan_version"),

        version: nextVersionNumber,

        status: "active",

        plan: {
            imagePath: planData.imagePath || null,
            imageFileName: planData.imageFileName || null,
            imageFileSize: planData.imageFileSize ?? null,
            imageWidth: Number(planData.imageWidth) || 0,
            imageHeight: Number(planData.imageHeight) || 0
        },

        scale: {
            scaleConfirmed: false,
            currentScale: 0,
            scaleReferencePixels: 0,
            scaleReferenceMeters: 0
        },

        assessment: null,

        createdAt: new Date().toISOString(),

        archivedAt: null
    };

    // -------------------------------------------------
    // COMMIT: ARCHIVE OLD VERSION
    // -------------------------------------------------

    if (activeVersion) {

        activeVersion.assessment =
            preserveAssessment
                ? oldSnapshot
                : null;

        activeVersion.status = "archived";

        activeVersion.archivedAt =
            new Date().toISOString();
    }

    // -------------------------------------------------
    // COMMIT: RESET CURRENT ASSESSMENT
    // -------------------------------------------------

    floor.rooms = [];
    floor.zones = [];
    floor.sources = [];
    floor.indoorSources = [];
    floor.outdoorSources = [];
    floor.outdoorSourceRelationships = [];

    // -------------------------------------------------
    // RESET SCALE
    // -------------------------------------------------

    floor.scaleConfirmed = false;
    floor.currentScale = 0;

    floor.scaleReferencePixels = 0;
    floor.scaleReferenceMeters = 0;

    floor.canvasWidth = 0;
    floor.canvasHeight = 0;

    // -------------------------------------------------
    // APPLY NEW PLAN METADATA
    // -------------------------------------------------

    floor.imagePath = planData.imagePath || null;
    floor.imageFileName = planData.imageFileName || null;
    floor.imageFileSize = planData.imageFileSize ?? null;

    floor.image = null;
    floor.imageData = null;

    // -------------------------------------------------
    // REGISTER NEW ACTIVE VERSION
    // -------------------------------------------------

    if (!Array.isArray(floor.planVersions)) {
        floor.planVersions = [];
    }

    floor.planVersions.push(newVersion);

    floor.activePlanVersionId = newVersion.id;

    console.log(
        "[FLOOR PLAN ACTIVATED]",
        {
            floorId: floor.id,
            previousVersion: activeVersion?.version ?? null,
            newVersion: newVersion.version,
            archived: !!activeVersion,
            assessmentReset: true
        }
    );

    return newVersion;
}


// =====================================================
// EXPORT ACTIVATION FUNCTION
// =====================================================

window.activateNewFloorPlanVersion =
    activateNewFloorPlanVersion;


// =====================================================
// EXPORT ARCHIVE FUNCTION
// =====================================================

window.archiveActiveFloorPlanVersion =
    archiveActiveFloorPlanVersion;


// =====================================================
// EXPORT SNAPSHOT FUNCTION
// =====================================================

window.createAssessmentSnapshot =
    createAssessmentSnapshot;


// =====================================================
// EXPORT
// =====================================================

window.createFloorPlanVersion =
    createFloorPlanVersion;
