"""Internal endpoints for system operations (Pub/Sub, schedulers, etc.)."""

from fastapi import APIRouter

from .completion import router as completion_router
from .watchdog import router as watchdog_router

router = APIRouter(prefix="/internal", tags=["Internal"])

router.include_router(completion_router)
router.include_router(watchdog_router)
