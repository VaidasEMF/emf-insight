from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["pricing"])

PRICING_FILE = Path(__file__).resolve().parent.parent / "config" / "pricing.json"


def load_pricing() -> dict:
    try:
        with PRICING_FILE.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=500,
            detail="Pricing configuration is unavailable."
        ) from exc


@router.get("/pricing")
def get_pricing():
    return load_pricing()
