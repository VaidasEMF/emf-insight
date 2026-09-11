# =====================
# IMPORTS
# =====================

import os
import uuid
import traceback
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import text

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

from routes.admin_pricing import router as admin_pricing_router

from routes.admin_professionals import (
    router as admin_professionals_router,
)

import stripe

import engine
from engine.analysis.business.analysis import (
    build_business_analysis,
)

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

from routes.professional_requests import (
    router as professional_requests_router,
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
    professional_requests_router,
)

app.include_router(
    projects_router,
)

app.include_router(pricing_router)

app.include_router(admin_pricing_router)

app.include_router(
    admin_professionals_router
)


app.include_router(
    auth_router,
)

app.include_router(
    users_router,
)

app.include_router(
    professional_requests_router,
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
    allow_origins=[
        "https://app.emfinsight.com",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# STRIPE CHECKOUT
# =====================

# Stripe Price IDs are configured in Render Environment Variables.
# Do not hardcode Stripe Price IDs in source code.
STRIPE_PRICE_IDS = {
    "EUR": {
        "single": os.getenv("STRIPE_EU_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_EU_BUSINESS_PRO_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_EU_HOME_FULL_REPORT_PRICE_ID"),
    },
    "USD": {
        "single": os.getenv("STRIPE_US_BUSINESS_SINGLE_PRICE_ID"),
        "pro": os.getenv("STRIPE_US_BUSINESS_PRO_PRICE_ID"),
        "home_full_report": os.getenv("STRIPE_US_HOME_FULL_REPORT_PRICE_ID"),
    },
}

STRIPE_ALLOWED_PLANS = {
    "single": "Business Single",
    "pro": "Business Pro",
    "home_full_report": "Full EMF Insight Report",
}

STRIPE_APP_URL = os.getenv("APP_BASE_URL", "https://app.emfinsight.com").rstrip("/")


def _ensure_stripe_events_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS stripe_events (
            event_id VARCHAR(255) PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

def _ensure_home_entitlements_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS home_entitlements (
            user_id VARCHAR(255) PRIMARY KEY,
            full_report_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
            stripe_session_id VARCHAR(255),
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

def _ensure_professional_requests_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS professional_requests (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            project_id VARCHAR(255),
            country VARCHAR(100),
            region VARCHAR(100),
            city VARCHAR(100),
            postal_code VARCHAR(30),
            status VARCHAR(50) NOT NULL DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    db.execute(
    text("""
        ALTER TABLE professional_requests
        ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30)
    """)
)

def _claim_stripe_event(db, event_id):
    result = db.execute(
        text("""
            INSERT INTO stripe_events (event_id)
            VALUES (:event_id)
            ON CONFLICT (event_id) DO NOTHING
        """),
        {"event_id": event_id},
    )
    return result.rowcount == 1


@app.post("/create-checkout-session")
def create_checkout(
    body: dict,
    current_user=Depends(get_current_user),
):
    plan = body.get("plan")
    currency = str(body.get("currency") or "EUR").upper()

    if plan not in STRIPE_ALLOWED_PLANS:
        raise HTTPException(400, "Invalid or unavailable plan")

    if currency not in STRIPE_PRICE_IDS:
        raise HTTPException(400, "Unsupported currency")

    price_id = STRIPE_PRICE_IDS[currency].get(plan)

    if not price_id:
        raise HTTPException(
            503,
            "Stripe price is not configured for this currency",
        )

    # Business Pro is the only recurring V1 product.
    # Business Single and Home Full Report are one-time payments.
    mode = "subscription" if plan == "pro" else "payment"

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode=mode,
            success_url=f"{STRIPE_APP_URL}/success.html",
            cancel_url=f"{STRIPE_APP_URL}/dashboard.html#billing",
            metadata={
                "user_id": str(current_user.id),
                "plan": plan,
                "currency": currency,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan": plan,
                    "currency": currency,
                }
            } if mode == "subscription" else None,
        )
    except Exception as exc:
        print("Stripe checkout error:", repr(exc))
        raise HTTPException(502, "Unable to create Stripe checkout session")

    return {"url": session.url}


# =====================
# STRIPE WEBHOOK
# =====================

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            endpoint_secret,
        )
    except Exception:
        raise HTTPException(400, "Invalid webhook")

    event_type = event["type"]
    event_id = event["id"]
    db = SessionLocal()

    try:
        # The event ID is stored with a primary key. If Stripe retries the
        # same delivery, the second delivery is ignored safely.
        _ensure_stripe_events_table(db)
        _ensure_home_entitlements_table(db)
        if not _claim_stripe_event(db, event_id):
            db.rollback()
            print("Stripe webhook already processed:", event_id)
            return {"status": "ok"}

        # =============================================================
        # INITIAL CHECKOUT
        # =============================================================
        if event_type == "checkout.session.completed":
            session = event["data"]["object"]
            session = session.to_dict()
            metadata = session.get("metadata") or {}

            user_id = metadata.get("user_id")
            plan = metadata.get("plan")

            if not user_id or plan not in STRIPE_ALLOWED_PLANS:
                print("Stripe checkout webhook missing/invalid metadata")
                db.commit()
                return {"status": "ok"}

            user = db.query(User).filter(User.id == int(user_id)).first()

            if not user:
                print("Stripe webhook user not found:", user_id)
                db.commit()
                return {"status": "ok"}

            if plan == "single":
                # One successful Business Single purchase = one Business credit.
                user.credits = (user.credits or 0) + 1

            elif plan == "pro":
                # First Pro billing cycle = 5 Business report credits.
                user.plan = "pro"
                user.credits = 5

            elif plan == "home_full_report":
                # Home Full Report is deliberately separate from Business credits.
                db.execute(
                    text("""
                        INSERT INTO home_entitlements
                            (user_id, full_report_unlocked, stripe_session_id)
                        VALUES
                            (:user_id, TRUE, :stripe_session_id)
                        ON CONFLICT (user_id) DO UPDATE SET
                            full_report_unlocked = TRUE,
                            stripe_session_id = EXCLUDED.stripe_session_id,
                            unlocked_at = CURRENT_TIMESTAMP
                    """),
                    {
                        "user_id": str(user.id),
                        "stripe_session_id": session.get("id"),
                    },
                )

            db.commit()

            print(
                "PAYMENT SUCCESS",
                user.email,
                plan,
                metadata.get("currency"),
            )

        # =============================================================
        # RECURRING BUSINESS PRO PAYMENT
        # =============================================================
        elif event_type == "invoice.paid":
            invoice = event["data"]["object"]
            subscription_id = invoice.get("subscription")

            if subscription_id:
                subscription = stripe.Subscription.retrieve(subscription_id)
                metadata = subscription.get("metadata") or {}

                user_id = metadata.get("user_id")
                plan = metadata.get("plan")

                if user_id and plan == "pro":
                    user = db.query(User).filter(User.id == user_id).first()

                    if user:
                        # New successful monthly billing cycle = fresh 5-credit allowance.
                        user.plan = "pro"
                        user.credits = 5
                        print(
                            "PRO MONTHLY RENEWAL",
                            user.email,
                            "5 credits",
                        )

            db.commit()

        else:
            # We received a valid Stripe event that this V1 backend does not
            # currently need. Mark it processed so Stripe retries are harmless.
            db.commit()

        return {"status": "ok"}

    except Exception:
        db.rollback()
        print(traceback.format_exc())
        raise HTTPException(500, "Webhook processing failed")

    finally:
        db.close()


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


@app.get("/business-analysis/{project_id}")
def get_business_analysis(
    project_id: int,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        project_row = (
            db.query(Project)
            .filter(
                Project.id == project_id,
                Project.user_id == current_user.id,
            )
            .first()
        )

        if not project_row:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        project = project_row.data

        analysis = build_business_analysis(
            project,
            "session_1",
            "session_2",
        )

        analysis["project_id"] = project_id

        return analysis

    finally:
        db.close()


# =====================
# GENERATE PDF
# =====================
@app.post("/generate-pdf")
def generate_pdf(
    data: dict,
    current_user=Depends(get_current_user),
):

    print("\n=== GENERATE PDF ===")

    db = SessionLocal()

    try:

        # =====================
        # 🔥 INPUTS
        # =====================

        pid = data.get("project_id")

        sessionA = data.get("sessionA") or "session_1"

        sessionB = data.get("sessionB") or "session_2"

        plan = "premium"

        # =====================
        # 🔥 VALIDATION
        # =====================

        if not pid:

            raise HTTPException(400, "Missing project_id")

        # =====================
        # 🔥 LOAD PROJECT
        # =====================


        project_row = (
            db.query(Project)
            .filter(
                Project.id == pid,
                Project.user_id == current_user.id,
            )
            .first()
        )
        if not project_row:
            raise HTTPException(404, "Project not found")


        # =====================
        # AUTHENTICATED USER
        # =====================

        user = current_user

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
