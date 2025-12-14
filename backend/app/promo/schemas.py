"""Pydantic schemas for promo code redemption."""
from pydantic import BaseModel, Field


class RedeemRequest(BaseModel):
    """Request to redeem a promo code."""
    code: str = Field(..., min_length=1, max_length=50, description="Promo code to redeem")


class RedeemResponse(BaseModel):
    """Response after successful redemption."""
    success: bool = True
    credits_added: int = Field(..., description="Number of credits added")
    new_balance: int = Field(..., description="User's new credit balance")
    message: str = Field(..., description="Success message")
