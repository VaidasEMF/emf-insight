# =====================
# POINTS MODULE
# =====================

"""
Šis modulis atsakingas už:

✔ grid taškų surinkimą
✔ filtravimą
✔ measurement nuskaitymą
✔ floor / room logiką
"""

# =====================
# COLLECT POINTS
# =====================


def collect_points(
    project: dict, session: str, floor: str = None, room: str = None, height: int = None
) -> list:
    
    

    pts = []

    counter = 1

    for f in project.get("floors", []):

        

        for z in f.get(
            "zones",
            [],
        ):

            print(
                z.get("type"),
                "| grid:",
                len(
                    z.get(
                        "grid",
                        [],
                    )
                ),
                "| detail:",
                len(
                    z.get(
                        "grid",
                        [],
                    )
                ),
            )

        # 🔥 floor filter
        if floor and f.get("name") != floor:
            continue

        for r in f.get("rooms", []):

            # 🔥 room filter
            if room and r.get("name") != room:
                continue

           
            measured = 0

            for gp in r.get(
                "grid",
                [],
            ):

                if gp.get(
                    "measurements",
                    {},
                ):

                    measured += 1

           

            for g in r.get("grid", []):

                measurements = g.get(
                    "measurements",
                    {},
                )

                if not measurements:

                    

                    continue

               

                session_data = measurements.get(
                    session
                )

                if not session_data:

                   

                    continue

                # =====================
                # 🔥 SUPPORT SIMPLE FORMAT
                # =====================

                if "rf" in session_data:

                    m = session_data

                # =====================
                # 🔥 SUPPORT HEIGHT FORMAT
                # =====================

                else:

                    if height is not None:

                        m = session_data.get(str(height))

                        if not m:

                          

                            continue

                    else:

                        m = (
                            session_data.get("120")
                            or session_data.get("80")
                            or session_data.get("30")
                        )

                        if not m:

                          

                            continue

                # =====================
                # 🔥 SAFE PARSE
                # =====================

                try:

                    rf = float(m.get("rf", 0))

                    electric = float(m.get("electric", 0))

                    magnetic = float(m.get("magnetic", 0))

                except Exception as e:

                    
                    continue

                # =====================
                # 🔥 POINT OBJECT
                # =====================

               

                point = {
                    "id": f"P{counter}",
                    "x": int(g.get("x", 0)),
                    "y": int(g.get("y", 0)),
                    "room": r.get("name"),
                    "floor": f.get("name"),
                    "zone": g.get("zone", "default"),
                    "m": {
                        "rf": rf,
                        "electric": electric,
                        "magnetic": magnetic,
                        "height": (height if height else 120),
                    },
                }

                pts.append(point)

                counter += 1

   

    for f in project.get("floors", []):

        for r in f.get("rooms", []):

            for g in r.get("grid", []):

                m = g.get(
                    "measurements",
                    {},
                )

                if m:

                    print(
                        list(
                            m.keys()
                        )
                    )

    print("\n🔥🔥🔥 COLLECT POINTS FINAL DEBUG")

    for f in project.get("floors", []):

        print(
            "FLOOR:",
            f.get("name")
        )

        for r in f.get("rooms", []):

            print(
                "ROOM:",
                r.get("id"),
                r.get("name")
            )

            print(
                "ROOM GRID:",
                len(
                    r.get(
                        "grid",
                        []
                    )
                )
            )

            for g in r.get("grid", []):

                print(
                    "POINT:",
                    g.get("id"),
                    "MEASUREMENTS:",
                    g.get("measurements")
                )

    print(
        "FINAL COLLECTED POINTS:",
        len(pts)
    )                

    return pts


# =====================
# GET AVAILABLE HEIGHTS
# =====================


def get_available_heights(project: dict, session: str) -> list:

    heights = set()

    for f in project.get("floors", []):

        for r in f.get("rooms", []):

            for g in r.get("grid", []):

                measurements = g.get("measurements", {})

                session_data = measurements.get(session)

                for h in session_data.keys():

                    try:
                        heights.add(int(h))

                    except:
                        continue

    return sorted(list(heights))


# =====================
# GET ROOMS
# =====================


def get_rooms(project: dict, floor: str = None) -> list:

    rooms = []

    for f in project.get("floors", []):

        if floor and f.get("name") != floor:
            continue

        for r in f.get("rooms", []):

            rooms.append(r.get("name"))

    return rooms


# =====================
# GET FLOORS
# =====================


def get_floors(project: dict) -> list:

    return [f.get("name") for f in project.get("floors", [])]
