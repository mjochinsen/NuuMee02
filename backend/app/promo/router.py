"""Promo code redemption API router."""
import logging

from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore

from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id
from .schemas import RedeemRequest, RedeemResponse
from .service import redeem_promo_code, PromoRedemptionError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/promo", tags=["promo"])


@router.post("/redeem", response_model=RedeemResponse)
async def redeem_promo(
    request: RedeemRequest,
    user_id: str = Depends(get_current_user_id),
    db: firestore.Client = Depends(get_firestore_client),
) -> RedeemResponse:
    """
    Redeem a promo code for credits.

    Validates the code and adds credits to the user's account.
    Each code can only be redeemed once per user.

    Returns:
        RedeemResponse with credits_added and new_balance

    Raises:
        HTTPException 400: Invalid, expired, or already redeemed code
    """

    try:
        credits_added, new_balance = redeem_promo_code(db, user_id, request.code)

        return RedeemResponse(
            success=True,
            credits_added=credits_added,
            new_balance=new_balance,
            message=f"Added {credits_added} credits to your account!"
        )

    except PromoRedemptionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error redeeming promo: {e}")
        raise HTTPException(status_code=500, detail="Failed to redeem promo code")
