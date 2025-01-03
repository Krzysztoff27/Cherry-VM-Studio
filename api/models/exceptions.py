from fastapi import HTTPException, status


class RaisedException(Exception):
    pass


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class CredentialsException(UnauthorizedException):
    def __init__(self):
        super().__init__(detail="Could not validate credentials.")
