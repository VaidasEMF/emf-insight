// =====================
// 🔥 SESSION COMPARE
// =====================

function compareSessions(

    room,

    sessionA,

    sessionB

) {

    if (!room) {
        return null;
    }

    const points =
        room.grid || [];

    let a = 0;

    let b = 0;

    let countA = 0;

    let countB = 0;

    points.forEach(point => {

        const mA =

            point.measurements?.[
            sessionA
            ];

        const mB =

            point.measurements?.[
            sessionB
            ];

        if (
            mA?.rf !== undefined
        ) {

            a += mA.rf;

            countA++;
        }

        if (
            mB?.rf !== undefined
        ) {

            b += mB.rf;

            countB++;
        }
    });

    const avgA =

        countA > 0

            ? a / countA

            : 0;

    const avgB =

        countB > 0

            ? b / countB

            : 0;

    const diff =
        avgB - avgA;

    const percent =

        avgA > 0

            ? (
                diff / avgA
            ) * 100

            : 0;

    return {

        avgA:
            Math.round(avgA),

        avgB:
            Math.round(avgB),

        diff:
            Math.round(diff),

        percent:
            Math.round(percent)
    };
}


// =====================
// 🔥 ROOM IMPROVEMENT
// =====================

function calculateRoomImprovement(
    room
) {

    const compareSelect =

        document.getElementById(
            "compareSession"
        );

    if (
        !compareSelect
    ) {

        return null;
    }

    const compareId =
        compareSelect.value;

    if (
        !compareId
    ) {

        return null;
    }

    return compareSessions(

        room,

        compareId,

        sessionId
    );
}

// =====================
// 🔥 EXPORTS
// =====================

window.compareSessions =
    compareSessions;

window.calculateRoomImprovement =
    calculateRoomImprovement;

