"""Promo code redemption service with Firestore transactions."""
import logging
from datetime import datetime, timezone
from typing import Tuple

from google.cloud import firestore

logger = logging.getLogger(__name__)


class PromoRedemptionError(Exception):
    """Raised when promo redemption fails."""
    pass


def redeem_promo_code(db: firestore.Client, user_id: str, code: str) -> Tuple[int, int]:
    """
    Redeem a promo code for the authenticated user.

    Uses a Firestore transaction to ensure atomicity:
    1. Validate promo code exists and is valid
    2. Check user hasn't already redeemed
    3. Update promo code (increment uses, add user to redeemed_by)
    4. Update user credits

    Args:
        db: Firestore client
        user_id: Authenticated user's UID
        code: Promo code to redeem (will be uppercased)

    Returns:
        Tuple of (credits_added, new_balance)

    Raises:
        PromoRedemptionError: If redemption fails for any reason
    """
    # Normalize code to uppercase
    code = code.strip().upper()

    @firestore.transactional
    def redeem_in_transaction(transaction: firestore.Transaction) -> Tuple[int, int]:
        # Get promo code document
        promo_ref = db.collection("promo_codes").document(code)
        promo_doc = promo_ref.get(transaction=transaction)

        if not promo_doc.exists:
            logger.warning(f"Promo code not found: {code}")
            raise PromoRedemptionError("Invalid or expired promo code")

        promo_data = promo_doc.to_dict()

        # Validate: active
        if not promo_data.get("active", False):
            logger.warning(f"Promo code inactive: {code}")
            raise PromoRedemptionError("Invalid or expired promo code")

        # Validate: not expired
        expires_at = promo_data.get("expires_at")
        if expires_at:
            # Handle both Firestore timestamp and datetime
            if hasattr(expires_at, "timestamp"):
                expires_dt = datetime.fromtimestamp(expires_at.timestamp(), tz=timezone.utc)
            else:
                expires_dt = expires_at

            if expires_dt < datetime.now(timezone.utc):
                logger.warning(f"Promo code expired: {code}")
                raise PromoRedemptionError("Invalid or expired promo code")

        # Validate: uses remaining
        max_uses = promo_data.get("max_uses")
        current_uses = promo_data.get("current_uses", 0)
        if max_uses is not None and current_uses >= max_uses:
            logger.warning(f"Promo code max uses reached: {code}")
            raise PromoRedemptionError("Invalid or expired promo code")

        # Validate: user hasn't already redeemed
        redeemed_by = promo_data.get("redeemed_by", [])
        if user_id in redeemed_by:
            logger.warning(f"User {user_id} already redeemed: {code}")
            raise PromoRedemptionError("You have already redeemed this code")

        # Get credits to add
        credits_to_add = promo_data.get("credits", 0)
        if credits_to_add <= 0:
            logger.error(f"Promo code has invalid credits: {code}")
            raise PromoRedemptionError("Invalid or expired promo code")

        # Get user document
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get(transaction=transaction)

        if not user_doc.exists:
            logger.error(f"User not found: {user_id}")
            raise PromoRedemptionError("User not found")

        user_data = user_doc.to_dict()
        current_credits = user_data.get("credits", 0)
        new_balance = current_credits + credits_to_add

        # Update promo code: increment uses and add user to redeemed_by
        transaction.update(promo_ref, {
            "current_uses": firestore.Increment(1),
            "redeemed_by": firestore.ArrayUnion([user_id])
        })

        # Update user credits
        transaction.update(user_ref, {
            "credits": new_balance
        })

        logger.info(f"User {user_id} redeemed {code} for {credits_to_add} credits")
        return credits_to_add, new_balance

    # Execute transaction
    transaction = db.transaction()
    return redeem_in_transaction(transaction)
