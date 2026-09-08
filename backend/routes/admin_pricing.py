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


class PricingUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    billing: str | None = None
    credits: int | None = None
    available: bool | None = None


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
        pricing.name = update_data["name"]

    if "price" in update_data:
        pricing.price = update_data["price"]

    if "billing" in update_data:
        pricing.billing = update_data["billing"]

    if "credits" in update_data:
        pricing.credits = update_data["credits"]

    if "available" in update_data:
        pricing.available = update_data["available"]

    db.commit()
    db.refresh(pricing)

    return pricing