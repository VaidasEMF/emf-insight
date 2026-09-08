from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.pricing import Pricing

router = APIRouter(tags=["pricing"])


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/pricing")
def get_pricing(
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Pricing)
        .order_by(
            Pricing.region,
            Pricing.product_key,
        )
        .all()
    )

    regions = {}

    for row in rows:

        if row.region not in regions:
            regions[row.region] = {
                "currency": row.currency,
                "products": {},
            }

        regions[row.region]["products"][row.product_key] = {
            "name": row.name,
            "price": row.price,
            "billing": row.billing,
            "credits": row.credits,
            "available": row.available,
        }

    if not regions:
        return {
            "version": 1,
            "default_region": "EU",
            "default_currency": "EUR",
            "regions": {},
        }

    return {
        "version": 1,
        "default_region": "EU",
        "default_currency": "EUR",
        "regions": regions,
    }
