"""Authentication middleware for protected routes."""
from typing import Optional
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth

from ..auth.firebase import verify_id_token


security = HTTPBearer(auto_error=False)


async def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = None
) -> str:
    """
    Extract and verify user ID from Firebase ID token in Authorization header.

    Usage:
        @router.get("/protected")
        async def protected_route(uid: str = Depends(get_current_user_id)):
            ...

    Returns:
        Firebase user ID (uid)

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Parse "Bearer <token>" format
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = parts[1]

    try:
        decoded_token = verify_id_token(token)
        return decoded_token["uid"]

    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid ID token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="ID token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_optional_user_id(request: Request) -> Optional[str]:
    """
    Optionally extract user ID from token. Returns None if no valid token.

    Use for endpoints that work for both authenticated and anonymous users.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    try:
        decoded_token = verify_id_token(parts[1])
        return decoded_token["uid"]
    except Exception:
        return None
