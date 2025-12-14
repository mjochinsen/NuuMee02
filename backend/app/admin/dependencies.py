"""Admin authentication dependencies."""
import os
from fastapi import Request, HTTPException


def get_admin_password() -> str:
    """Get admin password from environment."""
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        raise HTTPException(
            status_code=500,
            detail="Admin password not configured"
        )
    return password


async def verify_admin_password(request: Request) -> bool:
    """
    Verify admin password from X-Admin-Password header.

    Usage:
        @router.get("/admin/endpoint")
        async def admin_endpoint(_: bool = Depends(verify_admin_password)):
            ...

    Returns:
        True if password is valid

    Raises:
        HTTPException 401: If password is missing or invalid
    """
    admin_password = request.headers.get("X-Admin-Password")

    if not admin_password:
        raise HTTPException(
            status_code=401,
            detail="Admin password required",
            headers={"WWW-Authenticate": "X-Admin-Password"}
        )

    expected_password = get_admin_password()

    if admin_password != expected_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin password",
            headers={"WWW-Authenticate": "X-Admin-Password"}
        )

    return True
