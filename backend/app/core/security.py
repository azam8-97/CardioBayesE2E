import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

# Config
SECRET_KEY = os.environ.get("JWT_SECRET", "dev_secret_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_password_hash(password: str) -> str:
	return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
	subject: str,
	expires_delta: Optional[timedelta] = None,
	extra: Optional[dict] = None,
) -> str:
	to_encode = {"sub": subject}
	if extra:
		to_encode.update({k: v for k, v in extra.items() if v is not None})
	expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return payload
	except JWTError as e:
		raise HTTPException(status_code=401, detail=f"Token decode error: {str(e)}")


def get_bearer_token(authorization: Optional[str] = Header(None)) -> str:
	if not authorization:
		raise HTTPException(status_code=401, detail="Missing Authorization header")
	parts = authorization.split()
	if len(parts) != 2 or parts[0].lower() != "bearer":
		raise HTTPException(status_code=401, detail="Invalid authorization header")
	return parts[1]


async def get_current_user(token: str = Depends(get_bearer_token)) -> dict:
	"""Get current user from JWT token."""
	payload = decode_access_token(token)
	if payload.get("token_use") == "refresh":
		raise HTTPException(status_code=401, detail="Invalid token type")
	user_id = payload.get("sub")
	if user_id is None:
		raise HTTPException(status_code=401, detail="Invalid token")
	return {
		"id": user_id,
		"email": payload.get("email"),
		"role": payload.get("role", "user"),
	}


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
	if not authorization or not authorization.lower().startswith("bearer "):
		return None
	parts = authorization.split()
	if len(parts) != 2:
		return None
	try:
		payload = decode_access_token(parts[1])
	except HTTPException:
		return None
	if payload.get("token_use") == "refresh":
		return None
	uid = payload.get("sub")
	if not uid:
		return None
	return {"id": uid, "email": payload.get("email"), "role": payload.get("role", "user")}


class RoleChecker:
	"""Dependency to check if user has required role."""
	def __init__(self, allowed_roles: list[str]):
		self.allowed_roles = allowed_roles

	async def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
		if current_user.get("role") not in self.allowed_roles:
			raise HTTPException(
				status_code=status.HTTP_403_FORBIDDEN,
				detail="Not enough permissions"
			)
		return current_user

