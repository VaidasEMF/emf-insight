# =====================
# IMPORTS
# =====================

import os
import uuid
import traceback
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    Depends,
)

from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routes.pricing import router as pricing_router

import stripe

import engine

from db.database import SessionLocal

from models.user import User
from models.project import Project
from models.report import Report

from models.project_version import (
    ProjectVersion,
)

from db.init_db import init_db

from routes.auth import (
    router as auth_router,
    get_current_user,
)

from routes.users import (
    router as users_router,
)

from routes.projects import (
    router as projects_router,
)

from routes.reports import (
    router as reports_router,
)


# =====================
# INIT
# =====================
init_db()

app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.include_router(
    reports_router,
)

app.include_router(
    projects_router,
)

app.include_router(pricing_router)


app.include_router(
    auth_router,
)

app.include_router(
    users_router,
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


# =====================
# PATH SETUP
# =====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")


# =====================
# CORS
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.emfinsight.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# STRIPE CHECKOUT
# =====================
@app.post("/create-checkout-session")
def create_checkout(body: dict):

    user_id = body.get("user_id")
    plan = body.get("plan")

    if plan not in [
        "single",
        "pro",
        "premium",
    ]:
        raise HTTPException(
            400,
            "Invalid plan",
        )

    price_map = {
        "single": 900,
        "pro": 2900,
        "premium": 9900,
    }

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": f"EMF {plan.capitalize()} Plan"},
                    "unit_amount": price_map[plan],
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url="https://emf-insight.pages.dev/success.html",
        cancel_url="https://emf-insight.pages.dev/dashboard.html",
        metadata={"user_id": user_id, "plan": plan},
    )

    return {"url": session.url}


# =====================
# STRIPE WEBHOOK
# =====================
@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception:
        raise HTTPException(400, "Invalid webhook")

    if event["type"] == "checkout.session.completed":

        session = event["data"]["object"]

        user_id = session["metadata"]["user_id"]
        plan = session["metadata"]["plan"]

        db = SessionLocal()

        user = db.query(User).filter(User.id == user_id).first()

        if user:

            # =====================
            # SINGLE REPORT
            # =====================

            if plan == "single":

                user.credits += 1

            # =====================
            # PRO
            # =====================

            elif plan == "pro":

                user.plan = "pro"

                user.credits = 999999

            # =====================
            # PREMIUM
            # =====================

            elif plan == "premium":

                user.plan = "premium"

                user.credits = 999999

            db.commit()

            print(
                "PAYMENT SUCCESS",
                user.email,
                plan,
            )

        db.close()

    return {"status": "ok"}

# =====================
# PROJECT SAVE (DB)
# =====================

@app.post("/project/save")
def save_project(
    body: dict,
    current_user=Depends(get_current_user),
):

    project_id = body.get("project_id")

    print(
        "\n🔥🔥🔥 PROJECT SAVE",
        "| REQUEST PROJECT ID:",
        project_id,
        "| USER ID:",
        current_user.id,
    )

    # =================================================
    # PROJECT ID IS REQUIRED
    # =================================================

    if project_id is None:
        raise HTTPException(
            status_code=400,
            detail="project_id is required",
        )

    try:
        project_id = int(project_id)

    except (
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid project_id",
        )

    # =================================================
    # DATA
    # =================================================

    data = body.get(
        "data",
        {},
    )

    if not isinstance(
        data,
        dict,
    ):
        raise HTTPException(
            status_code=400,
            detail="Project data must be an object",
        )

    floors = data.get(
        "floors",
        [],
    )

    if not isinstance(
        floors,
        list,
    ):
        floors = []

    # =================================================
    # FLOOR DEBUG
    # =================================================

    for floor_index, floor in enumerate(
        floors
    ):

        if not isinstance(
            floor,
            dict,
        ):
            continue

        print(
            "\n🔥 FLOOR:",
            floor_index,
            "| NAME:",
            floor.get(
                "name",
                "Unnamed",
            ),
        )

        # =====================
        # ZONES
        # =====================

        zones = floor.get(
            "zones",
            [],
        )

        print(
            "🔥 ZONE COUNT:",
            len(zones)
            if isinstance(
                zones,
                list,
            )
            else "NOT_LIST",
        )

        if isinstance(
            zones,
            list,
        ):

            for zone in zones:

                if not isinstance(
                    zone,
                    dict,
                ):
                    continue

                grid = zone.get(
                    "grid",
                    [],
                )

                print(
                    "🔥 ZONE:",
                    "| ID:",
                    zone.get("id"),
                    "| TYPE:",
                    zone.get("type"),
                    "| ROOM:",
                    zone.get("roomCode"),
                    "| GRID:",
                    len(grid)
                    if isinstance(
                        grid,
                        list,
                    )
                    else "NOT_LIST",
                )

        # =====================
        # SOURCES
        # =====================

        sources = floor.get(
            "sources",
            [],
        )

        print(
            "🔥 SOURCE COUNT:",
            len(sources)
            if isinstance(
                sources,
                list,
            )
            else "NOT_LIST",
        )

        if isinstance(
            sources,
            list,
        ):

            for source in sources:

                if not isinstance(
                    source,
                    dict,
                ):
                    continue

                print(
                    "🔥 SOURCE:",
                    "| ID:",
                    source.get("id"),
                    "| TYPE:",
                    source.get(
                        "type",
                        "unknown",
                    ),
                    "| FLOOR:",
                    source.get(
                        "floorIndex"
                    ),
                    "| X:",
                    source.get("x"),
                    "| Y:",
                    source.get("y"),
                )

    # =================================================
    # DATABASE
    # =================================================

    db = SessionLocal()

    try:

        # =================================================
        # FIND EXISTING PROJECT
        # =================================================

        project = (
            db.query(
                Project
            )
            .filter(
                Project.id == project_id
            )
            .first()
        )

        # =================================================
        # PROJECT MUST EXIST
        #
        # SAVE NEVER CREATES A PROJECT
        # =================================================

        if project is None:

            print(
                "❌ PROJECT SAVE FAILED:",
                "PROJECT NOT FOUND",
                project_id,
            )

            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        # =================================================
        # OWNERSHIP CHECK
        #
        # A user can only save their own project.
        # =================================================

        if project.user_id != current_user.id:

            print(
                "❌ PROJECT SAVE FORBIDDEN",
                "| PROJECT USER:",
                project.user_id,
                "| CURRENT USER:",
                current_user.id,
            )

            raise HTTPException(
                status_code=403,
                detail="Forbidden",
            )

        print(
            "🔥 PROJECT MODE: UPDATE"
        )

        print(
            "🔥 EXISTING PROJECT ID:",
            project.id,
        )

        print(
            "🔥 PROJECT OWNER:",
            project.user_id,
        )

        # =================================================
        # CANONICAL PROJECT ID
        #
        # Database Project.id is the real identity.
        # =================================================

        data["project_id"] = project.id

        # =================================================
        # UPDATE PROJECT DATA
        # =================================================

        project.data = data

        # =================================================
        # OPTIONAL PROJECT NAME
        # =================================================

        project_name = body.get(
            "name"
        )

        if project_name:

            project.name = project_name

        # =================================================
        # VERIFY BEFORE COMMIT
        # =================================================

        print(
            "\n🔥🔥🔥 BEFORE DB COMMIT"
        )

        print(
            "🔥 DATA PROJECT ID:",
            data.get(
                "project_id"
            ),
        )

        print(
            "🔥 DATA ZONES:",
            [
                len(
                    floor.get(
                        "zones",
                        [],
                    )
                )
                if isinstance(
                    floor,
                    dict,
                )
                else "INVALID"
                for floor in data.get(
                    "floors",
                    [],
                )
            ],
        )

        print(
            "🔥 DATA SOURCES:",
            [
                len(
                    floor.get(
                        "sources",
                        [],
                    )
                )
                if isinstance(
                    floor,
                    dict,
                )
                else "INVALID"
                for floor in data.get(
                    "floors",
                    [],
                )
            ],
        )

        print(
            "🔥 DATA ROOMS:",
            [
                len(
                    floor.get(
                        "rooms",
                        [],
                    )
                )
                if isinstance(
                    floor,
                    dict,
                )
                else "INVALID"
                for floor in data.get(
                    "floors",
                    [],
                )
            ],
        )

        # =================================================
        # SAVE VERSION IN SAME TRANSACTION
        # =================================================

        version = ProjectVersion(
            project_id=project.id,
            data=project.data,
        )

        db.add(
            version
        )

        # =================================================
        # COMMIT
        # =================================================

        db.commit()

        # =================================================
        # REFRESH PROJECT
        # =================================================

        db.refresh(
            project
        )

        # =================================================
        # DB SAVE VERIFY
        # =================================================

        print(
            "\n🔥🔥🔥 DB SAVE VERIFY"
        )

        print(
            "🔥 DB PROJECT ID:",
            project.id,
        )

        print(
            "🔥 DB PROJECT OWNER:",
            project.user_id,
        )

        print(
            "🔥 DATA PROJECT ID:",
            project.data.get(
                "project_id"
            )
            if isinstance(
                project.data,
                dict,
            )
            else None,
        )

        saved_floors = (
            project.data.get(
                "floors",
                [],
            )
            if isinstance(
                project.data,
                dict,
            )
            else []
        )

        for floor_index, floor in enumerate(
            saved_floors
        ):

            if not isinstance(
                floor,
                dict,
            ):
                continue

            saved_zones = floor.get(
                "zones",
                [],
            )

            saved_sources = floor.get(
                "sources",
                [],
            )

            saved_rooms = floor.get(
                "rooms",
                [],
            )

            print(
                "🔥 SAVED FLOOR:",
                floor_index,
                "| NAME:",
                floor.get("name"),
                "| ZONES:",
                len(saved_zones)
                if isinstance(
                    saved_zones,
                    list,
                )
                else "NOT_LIST",
                "| SOURCES:",
                len(saved_sources)
                if isinstance(
                    saved_sources,
                    list,
                )
                else "NOT_LIST",
                "| ROOMS:",
                len(saved_rooms)
                if isinstance(
                    saved_rooms,
                    list,
                )
                else "NOT_LIST",
            )

        # =================================================
        # RESPONSE
        # =================================================

        return {
            "status": "ok",
            "project_id": project.id,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as err:

        db.rollback()

        print(
            "🔥🔥🔥 PROJECT SAVE ERROR:",
            err,
        )

        raise

    finally:

        db.close()

# =====================
# GET PROJECTS
# =====================
@app.get("/projects/{user_id}")
def get_projects(user_id: str):

    db = SessionLocal()

    projects = db.query(Project).filter(Project.user_id == user_id).all()

    result = [
        {"id": p.id, "name": p.name, "created_at": str(p.created_at)} for p in projects
    ]

    db.close()

    return result


# =====================
# GET PROJECT
# =====================
@app.get("/project/{project_id}")
def get_project(project_id: str):

    db = SessionLocal()

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        db.close()
        raise HTTPException(404, "Project not found")

    data = project.data

    db.close()

    return {"id": project.id, "name": project.name, "data": data}


# =====================
# GENERATE PDF
# =====================
@app.post("/generate-pdf")
def generate_pdf(data: dict):

    print("\n=== GENERATE PDF ===")

    db = SessionLocal()

    try:

        # =====================
        # 🔥 INPUTS
        # =====================

        pid = data.get("project_id")

        user_id = data.get("user_id")

        sessionA = data.get("sessionA") or "session_1"

        sessionB = data.get("sessionB") or "session_2"

        plan = data.get("plan", "premium")

        # =====================
        # 🔥 VALIDATION
        # =====================

        if not pid:

            raise HTTPException(400, "Missing project_id")

        # =====================
        # 🔥 LOAD PROJECT
        # =====================

        project_row = db.query(Project).filter(Project.id == pid).first()

        if not project_row:

            raise HTTPException(404, "Project not found")

        # =====================
        # 🔥 LOAD USER
        # =====================

        user = None

        if user_id:

            user = db.query(User).filter(User.id == user_id).first()

        # =====================
        # 🔥 DEV FALLBACK
        # =====================
        if not user:

            class MockUser:

                plan = "premium"
                credits = 999

            user = MockUser()

            print("⚠ Using MockUser")
                

        # =====================
        # 🔥 PROJECT DATA
        # =====================

        print("\n==========  RAW PROJECT ==========")
        print(type(project_row.data))
        print(project_row.data)
        print("=================================\n")

   
        project = project_row.data

        

        project["meta"] = {
            "company": "EMF Maps",
            "report_id": project.get("project_id"),
            "generated_at": datetime.now().strftime("%Y-%m-%d"),
            "version": "PHI Premium v1.0",
            "page": 1,
            "total_pages": 0,
        }

        
       
        for i, floor in enumerate(project.get("floors", [])):
           

            for zone in floor.get("zones", []):
                print(
                    "\nZONE:", zone.get("id"),
                    "\nkeys:", list(zone.keys()),
                    "\ngrid:", len(zone.get("grid", [])),
                    "\ngridDetail:", len(zone.get("gridDetail", [])),
                    "\nmeasurements:", len(zone.get("measurements", [])),
                )

        
        floors = project.get("floors", [])

       
        if floors:
            floor = floors[0]

           

        
        floors = project.get("floors", [])
       

        if floors:
            floor = floors[0]

            rooms = floor.get("rooms", [])
           

            

            for room in rooms:

                print(
                    "ROOM:",
                    room.get("name"),
                )

                print(
                    "KEYS:",
                    list(room.keys()),
                )

                print(
                    "ROOM:",
                    room,
                )

            print("========================================")

            if rooms:
                print("FIRST ROOM:", rooms[0]["id"])


            print(
                "FIRST ROOM POLYGON POINTS:"
            )

            for p in rooms[0].get(
                "polygon",
                []
            ):

                print(
                    "X:",
                    p.get("x"),
                    "Y:",
                    p.get("y"),
                )

        

        floors = project.get("floors", [])

       

        if floors:

            floor = floors[0]

           
            
            # ---------- ROOM ----------
            if floor.get("rooms"):

                room = floor["rooms"][0]

                print("\nFIRST ROOM ID:", room.get("id"))

                poly = room.get("polygon", [])

                print("ROOM POLYGON COUNT:", len(poly))

                for i, p in enumerate(poly[:5]):
                    print(f"ROOM P{i}: ({p['x']:.3f}, {p['y']:.3f})")

            # ---------- ZONE ----------
            if floor.get("zones"):

                zone = floor["zones"][0]

               

                poly = zone.get("polygon", [])


                for i, p in enumerate(poly[:5]):
                    print(f"ZONE P{i}: ({p['x']:.3f}, {p['y']:.3f})")

                grid = zone.get("grid", [])

                

                if grid:

                    gp = grid[0]

                   



        # ==================================================
        # 🔥 PROJECT SOURCE DEBUG
        # ==================================================

        project_indoor_sources = project.get(
            "indoorSources",
            []
        )

        project_outdoor_sources = project.get(
            "outdoorSources",
            []
        )

        project_sources = project.get(
            "sources",
            []
        )



        for source in (
            project_sources
            + project_indoor_sources
            + project_outdoor_sources
        ):

            if not isinstance(
                source,
                dict,
            ):
                continue

            

        for i, floor in enumerate(
            project.get(
                "floors",
                []
            )
        ):


            for s in floor.get(
                "sources",
                []
            ):

                print(
                    "SOURCE:",
                    s.get("type"),
                    s.get("id"),
                )

            

            print(
                f"FLOOR {i} OUTDOOR:",
                len(
                    floor.get(
                        "outdoorSources",
                        []
                    )
                )
            )

        # =====================
        # 🔥 PLAN CHECK
        # =====================

        if plan == "premium" and user.plan != "premium":

            raise HTTPException(403, "Upgrade required")

        if plan == "pro" and user.plan not in ["pro", "premium"]:

            raise HTTPException(403, "Upgrade required")

        # =====================
        # 🔥 VALIDATE DATA
        # =====================

        

        pts_before = engine.collect_points(
            project,
            sessionA,
        )

        

        if pts_before:

            print(
                "FIRST POINT:",
                pts_before[0],
            )

        if not pts_before:

            raise HTTPException(
                400,
                "No measurement data found",
            )

        # =====================
        # 🔥 CREDIT CHECK
        # =====================

        is_preview = False

        if user.plan == "premium":

            pass

        elif getattr(user, "credits", 0) > 0:

            user.credits -= 1

            db.commit()

        else:

            is_preview = True

        # =====================
        # 🔥 BUILD PDF
        # =====================

        pdf_path = engine.build_pdf(
            project,
            sessionA,
            sessionB,
            pid,
            plan=plan,
            preview=is_preview,
            user=user,
        )

       

        # =====================
        # 🔥 SAVE REPORT
        # =====================

        report = Report(
            pdf_path=pdf_path,
            preview=1 if is_preview else 0,
            project_id=project_row.id,
        )

        db.add(report)

        db.commit()

        db.refresh(report)

        # =====================
        # 🔥 RESPONSE
        # =====================

        filename = os.path.basename(pdf_path)

        return {
            "status": "ok",
            "pdf_url": f"/output/{filename}",
            "preview": is_preview,
        }

    except HTTPException:

        raise

    except Exception as e:

        print(traceback.format_exc())

        raise HTTPException(500, str(e))

    finally:

        db.close()
