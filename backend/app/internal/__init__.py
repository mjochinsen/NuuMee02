"""Internal endpoints for system operations (Pub/Sub, schedulers, etc.)."""

from fastapi import APIRouter

from .completion import router as completion_router

router = APIRouter(prefix="/internal", tags=["Internal"])

router.include_router(completion_router)
