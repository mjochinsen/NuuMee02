"""Promo code management service for admin panel."""
import logging
from datetime import datetime, timezone
from typing import List, Optional

from google.cloud import firestore

from ..schemas import PromoCode, CreatePromoRequest

logger = logging.getLogger(__name__)

# Firestore client (lazy initialization)
_db = None


def get_db():
    """Get Firestore client."""
    global _db
    if _db is None:
        _db = firestore.Client()
    return _db


async def list_promos() -> List[PromoCode]:
    """List all promo codes (active and inactive)."""
    db = get_db()
    promos_ref = db.collection("promo_codes")

    # Order by created_at descending (newest first)
    query = promos_ref.order_by("created_at", direction=firestore.Query.DESCENDING)

    promos = []
    for doc in query.stream():
        data = doc.to_dict()
        promos.append(PromoCode(
            id=doc.id,
            code=data.get("code", ""),
            credits=data.get("credits", 0),
            max_uses=data.get("max_uses"),
            current_uses=data.get("current_uses", 0),
            expires_at=data.get("expires_at"),
            active=data.get("active", True),
            created_at=data.get("created_at", datetime.now(timezone.utc)),
        ))

    return promos


async def create_promo(request: CreatePromoRequest) -> PromoCode:
    """Create a new promo code."""
    db = get_db()
    promos_ref = db.collection("promo_codes")

    # Normalize code to uppercase
    code = request.code.upper().strip()

    # Check if code already exists
    existing = promos_ref.where("code", "==", code).limit(1).stream()
    if any(existing):
        raise ValueError(f"Promo code '{code}' already exists")

    # Create promo document
    promo_data = {
        "code": code,
        "credits": request.credits,
        "max_uses": request.max_uses,
        "current_uses": 0,
        "expires_at": request.expires_at,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    }

    # Add to Firestore
    doc_ref = promos_ref.add(promo_data)

    logger.info(f"Admin created promo code: {code} ({request.credits} credits)")

    return PromoCode(
        id=doc_ref[1].id,
        code=code,
        credits=request.credits,
        max_uses=request.max_uses,
        current_uses=0,
        expires_at=request.expires_at,
        active=True,
        created_at=promo_data["created_at"],
    )


async def delete_promo(promo_id: str) -> bool:
    """Deactivate a promo code (soft delete)."""
    db = get_db()
    promo_ref = db.collection("promo_codes").document(promo_id)

    promo_doc = promo_ref.get()
    if not promo_doc.exists:
        return False

    # Soft delete - set active to False
    promo_ref.update({
        "active": False,
        "deactivated_at": datetime.now(timezone.utc),
    })

    promo_data = promo_doc.to_dict()
    logger.info(f"Admin deactivated promo code: {promo_data.get('code')}")

    return True


async def get_promo_by_code(code: str) -> Optional[PromoCode]:
    """Get promo code by code string (for redemption)."""
    db = get_db()
    promos_ref = db.collection("promo_codes")

    code_upper = code.upper().strip()
    query = promos_ref.where("code", "==", code_upper).where("active", "==", True).limit(1)

    for doc in query.stream():
        data = doc.to_dict()

        # Check if expired
        expires_at = data.get("expires_at")
        if expires_at and expires_at < datetime.now(timezone.utc):
            return None

        # Check if max uses reached
        max_uses = data.get("max_uses")
        current_uses = data.get("current_uses", 0)
        if max_uses and current_uses >= max_uses:
            return None

        return PromoCode(
            id=doc.id,
            code=data.get("code", ""),
            credits=data.get("credits", 0),
            max_uses=max_uses,
            current_uses=current_uses,
            expires_at=expires_at,
            active=True,
            created_at=data.get("created_at", datetime.now(timezone.utc)),
        )

    return None


async def redeem_promo(promo_id: str, user_id: str) -> int:
    """
    Redeem a promo code for a user.
    Returns the number of credits awarded.
    """
    db = get_db()

    promo_ref = db.collection("promo_codes").document(promo_id)
    promo_doc = promo_ref.get()

    if not promo_doc.exists:
        raise ValueError("Promo code not found")

    data = promo_doc.to_dict()

    if not data.get("active"):
        raise ValueError("Promo code is inactive")

    # Check expiration
    expires_at = data.get("expires_at")
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise ValueError("Promo code has expired")

    # Check max uses
    max_uses = data.get("max_uses")
    current_uses = data.get("current_uses", 0)
    if max_uses and current_uses >= max_uses:
        raise ValueError("Promo code has reached maximum uses")

    # Check if user already used this code
    redemptions_ref = db.collection("promo_redemptions")
    existing = redemptions_ref.where("promo_id", "==", promo_id).where("user_id", "==", user_id).limit(1).stream()
    if any(existing):
        raise ValueError("You have already used this promo code")

    credits = data.get("credits", 0)

    # Increment usage count
    promo_ref.update({
        "current_uses": firestore.Increment(1),
    })

    # Record redemption
    redemptions_ref.add({
        "promo_id": promo_id,
        "user_id": user_id,
        "credits": credits,
        "redeemed_at": datetime.now(timezone.utc),
    })

    # Add credits_balance to user (consistent with rest of codebase)
    user_ref = db.collection("users").document(user_id)
    user_ref.update({
        "credits_balance": firestore.Increment(credits),
    })

    # Record credit transaction
    db.collection("credit_transactions").add({
        "user_id": user_id,
        "type": "promo",
        "amount": credits,
        "description": f"Promo code: {data.get('code')}",
        "created_at": datetime.now(timezone.utc),
    })

    logger.info(f"User {user_id} redeemed promo {data.get('code')} for {credits} credits")

    return credits
