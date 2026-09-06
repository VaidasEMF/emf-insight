// =====================================================
// 🔥 INITIALIZE PROJECTS
// =====================================================
//
// Projects are compatibility workspaces.
//
// Canonical PHI objects:
//
// Property
//     ↓
// Property Health Record
//     ↓
// Home Assessment
//     ↓
// Professional Assessments[]
//
// homeProject / businessProject are NOT canonical
// assessment objects. They are active workspaces.
//
// =====================================================

// =====================================================
// 🔥 INITIALIZE PROJECT WORKSPACES
// =====================================================
//
// IMPORTANT:
//
// homeProject / businessProject are compatibility
// workspaces for the existing Home / Business UI.
//
// They are NOT the canonical active server project.
//
// The canonical active project is:
//
//     AppState.project
//
// initializeProjects() MUST NEVER overwrite an
// already loaded AppState.project.
//
// =====================================================
// =====================================================
// 🔥 INITIALIZE PROJECT WORKSPACES
// =====================================================
//
// CANONICAL PHI MODEL:
//
// PROPERTY
//   ├── Home Assessment Sessions
//   └── Professional Assessments
//
// HOME:
//   Property Assessment context
//   image / plan
//   sources
//
// BUSINESS:
//   Professional Assessment
//   floors
//   rooms
//   zones
//   sources
//   measurement points
//   measurements
//
// homeProject / businessProject are ONLY compatibility
// workspaces for the existing UI.
//
// They must NEVER be used to convert Home into Business
// or Business into Home.
// =====================================================

function initializeProjects() {

    console.log(
        "🔥 INITIALIZE PROJECT WORKSPACES"
    );


    // ==================================================
    // PROPERTY CONTEXT
    // ==================================================

    const propertyId =
        AppState.property?.id ||
        null;

    const propertyHealthRecordId =
        AppState.property
            ?.propertyHealthRecordId ||
        null;

    const homeAssessmentId =
        AppState.propertyAssessment
            ?.id ||
        null;


    console.error(
        "🔥 PROPERTY CONTEXT",
        {
            propertyId,
            propertyHealthRecordId,
            homeAssessmentId
        }
    );


    // ==================================================
    // PERSISTED WORKSPACE INFORMATION
    // ==================================================
    //
    // IMPORTANT:
    //
    // These IDs identify projects that MAY exist.
    //
    // They do NOT mean that a project is currently
    // active.
    //
    // Therefore initializeProjects() MUST NOT:
    //
    //     createProjectModel()
    //
    // merely because an ID exists.
    //
    // A project becomes active only through:
    //
    //     New Project
    //     Open Project
    //
    // ==================================================

    const workspaceMode =
        localStorage.getItem(
            "workspaceMode"
        ) || "home";


    const homeProjectId =
        localStorage.getItem(
            "home_project_id"
        );


    const businessProjectId =
        localStorage.getItem(
            "business_project_id"
        );


    console.error(
        "🔥 STARTUP WORKSPACE IDS",
        {
            workspaceMode,
            homeProjectId,
            businessProjectId
        }
    );


    // ==================================================
    // HOME COMPATIBILITY WORKSPACE
    // ==================================================
    //
    // DO NOT CREATE A HOME PROJECT HERE.
    //
    // If a Home project was already created by
    // New Project / Open Project and exists in memory,
    // only normalize its structure.
    //
    // ==================================================

    if (
        AppState.homeProject
    ) {

        const homeProject =
            AppState.homeProject;


        // ----------------------------------------------
        // FLOORS
        // ----------------------------------------------

        if (
            !Array.isArray(
                homeProject.floors
            )
        ) {

            homeProject.floors =
                [];
        }


        // ----------------------------------------------
        // PROPERTY CONTEXT
        // ----------------------------------------------

        homeProject.propertyId =
            propertyId;


        homeProject.assessmentId =
            homeProject.assessmentId ||
            homeAssessmentId;


        // ----------------------------------------------
        // HOME FLOOR SAFETY
        // ----------------------------------------------

        if (
            homeProject.floors.length > 0
        ) {

            if (
                homeProject.currentFloorIndex ===
                undefined ||
                homeProject.currentFloorIndex ===
                null ||
                homeProject.currentFloorIndex < 0 ||
                homeProject.currentFloorIndex >=
                homeProject.floors.length
            ) {

                homeProject.currentFloorIndex =
                    0;
            }


            // ------------------------------------------
            // HOME FLOOR STRUCTURE
            // ------------------------------------------

            homeProject.floors.forEach(
                floor => {

                    if (
                        !floor
                    ) {
                        return;
                    }


                    floor.rooms =
                        [];


                    floor.zones =
                        [];


                    floor.grid =
                        [];


                    floor.measurements =
                        [];


                    if (
                        !Array.isArray(
                            floor.sources
                        )
                    ) {

                        floor.sources =
                            [];
                    }
                }
            );
        }


        console.error(
            "🔥 EXISTING HOME WORKSPACE NORMALIZED",
            {
                projectId:
                    homeProject
                        ?.project_id ??
                    homeProject
                        ?.id ??
                    null,

                floors:
                    homeProject
                        ?.floors
                        ?.length ||
                    0
            }
        );
    }

    else {

        console.log(
            "ℹ️ NO HOME PROJECT IN MEMORY"
        );
    }


    // ==================================================
    // BUSINESS COMPATIBILITY WORKSPACE
    // ==================================================
    //
    // DO NOT CREATE A BUSINESS PROJECT HERE.
    //
    // If Business was already created by New Project
    // or loaded by Open Project, normalize it.
    //
    // ==================================================

    if (
        AppState.businessProject
    ) {

        const businessProject =
            AppState.businessProject;


        // ----------------------------------------------
        // FLOORS
        // ----------------------------------------------

        if (
            !Array.isArray(
                businessProject.floors
            )
        ) {

            businessProject.floors =
                [];
        }


        // ----------------------------------------------
        // PROPERTY CONTEXT
        // ----------------------------------------------

        businessProject.propertyId =
            propertyId;


        businessProject.propertyHealthRecordId =
            propertyHealthRecordId;


        // ----------------------------------------------
        // BUSINESS FLOOR SAFETY
        // ----------------------------------------------

        if (
            businessProject.floors.length > 0
        ) {

            if (
                businessProject.currentFloorIndex ===
                undefined ||
                businessProject.currentFloorIndex ===
                null ||
                businessProject.currentFloorIndex < 0 ||
                businessProject.currentFloorIndex >=
                businessProject.floors.length
            ) {

                businessProject.currentFloorIndex =
                    0;
            }
        }


        console.error(
            "🔥 EXISTING BUSINESS WORKSPACE NORMALIZED",
            {
                projectId:
                    businessProject
                        ?.project_id ??
                    businessProject
                        ?.id ??
                    null,

                floors:
                    businessProject
                        ?.floors
                        ?.length ||
                    0
            }
        );
    }

    else {

        console.log(
            "ℹ️ NO BUSINESS PROJECT IN MEMORY"
        );
    }


    // ==================================================
    // IMPORTANT
    // ==================================================
    //
    // initializeProjects() DOES NOT:
    //
    //     createProjectModel("home")
    //
    //     createProjectModel("business")
    //
    //     createProfessionalAssessment()
    //
    //     loadProject()
    //
    //     AppState.project = ...
    //
    // These actions belong to explicit project flows.
    //
    // ==================================================


    console.error(
        "🔥 INITIALIZE PROJECTS COMPLETE",
        {

            workspaceMode,

            persistedHomeProjectId:
                homeProjectId,

            persistedBusinessProjectId:
                businessProjectId,

            homeProjectExists:
                !!AppState.homeProject,

            businessProjectExists:
                !!AppState.businessProject,

            activeProjectExists:
                !!AppState.project,

            activeProjectId:
                AppState.project
                    ?.project_id ??
                AppState.project
                    ?.id ??
                null,

            activeProjectType:
                AppState.project
                    ?.projectType ??
                AppState.project
                    ?.type ??
                null,

            homeFloors:
                AppState.homeProject
                    ?.floors
                    ?.length ||
                0,

            businessFloors:
                AppState.businessProject
                    ?.floors
                    ?.length ||
                0
        }
    );
}

// =====================================================
// EXPORT
// =====================================================

window.initializeProjects =
    initializeProjects;

