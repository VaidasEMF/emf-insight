

// =====================
// 🔥 GET CURRENT FLOOR
// =====================

function getCurrentFloor() {

    if (!AppState?.project?.floors?.length) {
        return null;
    }

    return AppState.project.floors[
        AppState.project.currentFloorIndex ?? 0
    ] || null;
}

window.getCurrentFloor =
    getCurrentFloor;

