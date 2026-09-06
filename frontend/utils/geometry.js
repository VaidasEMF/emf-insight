function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.sqrt(

        (x2 - x1) ** 2 +

        (y2 - y1) ** 2
    );
}


function distancePointToSegment(
    px,
    py,
    x1,
    y1,
    x2,
    y2
) {

    const A = px - x1;
    const B = py - y1;

    const C = x2 - x1;
    const D = y2 - y1;

    const dot =
        A * C + B * D;

    const lenSq =
        C * C + D * D;

    let param =
        lenSq
            ? dot / lenSq
            : -1;

    let xx;
    let yy;

    if (param < 0) {

        xx = x1;
        yy = y1;

    }
    else if (param > 1) {

        xx = x2;
        yy = y2;

    }
    else {

        xx =
            x1 + param * C;

        yy =
            y1 + param * D;
    }

    const dx =
        px - xx;

    const dy =
        py - yy;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


function segmentsIntersect(a, b, c, d) {

    function ccw(p1, p2, p3) {

        return (
            (p3.y - p1.y) * (p2.x - p1.x) >
            (p2.y - p1.y) * (p3.x - p1.x)
        )
    }

    return (
        ccw(a, c, d) !== ccw(b, c, d) &&
        ccw(a, b, c) !== ccw(a, b, d)
    );
}


function wouldIntersect(polygon, newPoint) {

    if (!polygon || polygon.length < 3) {
        return false;
    }

    const last =
        polygon[polygon.length - 1];

    for (let i = 0; i < polygon.length - 2; i++) {

        const a = polygon[i];
        const b = polygon[i + 1];

        if (
            segmentsIntersect(
                a,
                b,
                last,
                newPoint
            )
        ) {

            return true;
        }
    }

    return false;
}

function snapToGrid(v) {
    return Math.round(v / 20) * 20;
}


function sharpAngle(p1, p2, p3) {

    const a =
        Math.atan2(
            p1.y - p2.y,
            p1.x - p2.x
        );

    const b =
        Math.atan2(
            p3.y - p2.y,
            p3.x - p2.x
        );

    let angle =
        Math.abs((a - b) * 180 / Math.PI);

    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle < 25;
}


function pointInPolygon(
    point,
    polygon
) {

    if (
        !Array.isArray(
            polygon
        ) ||

        polygon.length < 3
    ) {

        return false;
    }

    let inside =
        false;

    for (
        let i = 0,
        j = polygon.length - 1;

        i < polygon.length;

        j = i++
    ) {

        const xi =
            polygon[i].x;

        const yi =
            polygon[i].y;

        const xj =
            polygon[j].x;

        const yj =
            polygon[j].y;

        const intersect =

            ((yi > point.y) !==
                (yj > point.y)) &&

            (
                point.x <

                ((xj - xi) *
                    (point.y - yi)) /

                (yj - yi) +

                xi
            );

        if (intersect) {

            inside = !inside;
        }
    }

    return inside;
}



function backwardsTurn(p1, p2, p3) {

    const v1x = p2.x - p1.x;
    const v1y = p2.y - p1.y;

    const v2x = p3.x - p2.x;
    const v2y = p3.y - p2.y;

    const dot =
        v1x * v2x +
        v1y * v2y;

    return dot < -1000;
}

// =====================
// 🔥 DISTANCE
// =====================

window.distance =
    distance;

window.distancePointToSegment =
    distancePointToSegment;


// =====================
// 🔥 POLYGON
// =====================

window.segmentsIntersect =
    segmentsIntersect;

window.wouldIntersect =
    wouldIntersect;


// =====================
// 🔥 GEOMETRY
// =====================

window.sharpAngle =
    sharpAngle;

window.backwardsTurn =
    backwardsTurn;

window.snapToGrid =
    snapToGrid;

window.pointInPolygon =
    pointInPolygon;    