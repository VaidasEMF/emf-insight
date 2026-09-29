from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.pricing import Pricing
from models.user import User
from routes.auth import get_current_user


router = APIRouter(
    prefix="/admin",
    tags=["admin-pricing"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


# ============================================================
# SCHEMAS
# ============================================================

class PricingCreate(BaseModel):
    region: str
    currency: str
    product_key: str
    name: str
    price: float | None = None
    billing: str
    credits: int | None = None
    available: bool = True


class PricingUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    billing: str | None = None
    credits: int | None = None
    available: bool | None = None


# ============================================================
# GET ALL PRICING
# ============================================================

@router.get("/pricing")
def get_admin_pricing(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    rows = (
        db.query(Pricing)
        .order_by(
            Pricing.region,
            Pricing.product_key,
        )
        .all()
    )

    return rows


# ============================================================
# CREATE PRICING
# ============================================================

@router.post("/pricing")
def create_admin_pricing(
    data: PricingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    # Normalize identifiers
    region = data.region.strip().upper()
    currency = data.currency.strip().upper()
    product_key = data.product_key.strip().upper()

    if not region:
        raise HTTPException(
            status_code=400,
            detail="Region is required",
        )

    if not currency:
        raise HTTPException(
            status_code=400,
            detail="Currency is required",
        )

    if not product_key:
        raise HTTPException(
            status_code=400,
            detail="Product key is required",
        )

    if not data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Product name is required",
        )

    if not data.billing.strip():
        raise HTTPException(
            status_code=400,
            detail="Billing type is required",
        )

    # Prevent duplicate pricing entries
    existing = (
        db.query(Pricing)
        .filter(
            Pricing.region == region,
            Pricing.currency == currency,
            Pricing.product_key == product_key,
        )
        .first()
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Pricing entry already exists for "
                f"{region}/{currency}/{product_key}"
            ),
        )

    pricing = Pricing(
        region=region,
        currency=currency,
        product_key=product_key,
        name=data.name.strip(),
        price=data.price,
        billing=data.billing.strip(),
        credits=data.credits,
        available=data.available,
    )

    db.add(pricing)
    db.commit()
    db.refresh(pricing)

    return pricing


# ============================================================
# UPDATE PRICING
# ============================================================

@router.put("/pricing/{pricing_id}")
def update_admin_pricing(
    pricing_id: int,
    data: PricingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    pricing = (
        db.query(Pricing)
        .filter(Pricing.id == pricing_id)
        .first()
    )

    if pricing is None:
        raise HTTPException(
            status_code=404,
            detail="Pricing entry not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        name = update_data["name"]

        if name is not None:
            name = name.strip()

            if not name:
                raise HTTPException(
                    status_code=400,
                    detail="Product name cannot be empty",
                )

            pricing.name = name
        else:
            pricing.name = None

    if "price" in update_data:
        pricing.price = update_data["price"]

    if "billing" in update_data:
        billing = update_data["billing"]

        if billing is not None:
            billing = billing.strip()

            if not billing:
                raise HTTPException(
                    status_code=400,
                    detail="Billing type cannot be empty",
                )

            pricing.billing = billing
        else:
            pricing.billing = None

    if "credits" in update_data:
        pricing.credits = update_data["credits"]

    if "available" in update_data:
        pricing.available = update_data["available"]

    db.commit()
    db.refresh(pricing)

    return pricing