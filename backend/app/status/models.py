"""Pydantic models for status endpoints."""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ServiceStatus(str, Enum):
    """Status values for individual services."""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"


class SystemStatus(str, Enum):
    """Overall system status."""
    OPERATIONAL = "operational"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"


class ServiceHealth(BaseModel):
    """Health status of a single service."""
    name: str = Field(..., description="Service name")
    status: ServiceStatus = Field(..., description="Current status")
    latency_ms: Optional[float] = Field(None, description="Response latency in milliseconds")
    message: Optional[str] = Field(None, description="Additional status message")
    last_checked: datetime = Field(..., description="When the service was last checked")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "API",
                "status": "operational",
                "latency_ms": 45.2,
                "message": None,
                "last_checked": "2025-11-30T12:00:00Z"
            }
        }


class SystemHealthResponse(BaseModel):
    """Overall system health response."""
    status: SystemStatus = Field(..., description="Overall system status")
    services: List[ServiceHealth] = Field(..., description="Individual service statuses")
    uptime_percentage: float = Field(..., description="System uptime percentage (30-day)")
    last_incident: Optional[str] = Field(None, description="Description of last incident")
    last_incident_date: Optional[datetime] = Field(None, description="Date of last incident")
    checked_at: datetime = Field(..., description="When this health check was performed")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "operational",
                "services": [
                    {"name": "API", "status": "operational", "latency_ms": 45.2, "last_checked": "2025-11-30T12:00:00Z"},
                    {"name": "Database", "status": "operational", "latency_ms": 12.5, "last_checked": "2025-11-30T12:00:00Z"},
                ],
                "uptime_percentage": 99.97,
                "last_incident": None,
                "last_incident_date": None,
                "checked_at": "2025-11-30T12:00:00Z"
            }
        }
