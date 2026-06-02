from datetime import timedelta
from typing import Dict
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.core import security
from app.services.supabase_service import supabase_service

router = APIRouter()


class RegisterRequest(BaseModel):
	full_name: str
	email: EmailStr
	password: str


class LoginRequest(BaseModel):
	email: EmailStr
	password: str


class TokenResponse(BaseModel):
	access_token: str
	refresh_token: str | None = None
	token_type: str = "bearer"


class RefreshRequest(BaseModel):
	refresh_token: str


class ProfileUpdate(BaseModel):
	full_name: str | None = None


@router.post("/register", response_model=dict)
def register(req: RegisterRequest):
	email = req.email.lower()
	
	# Check if user already exists in users table
	existing_user = supabase_service.get_user_by_email(email)
	if existing_user:
		raise HTTPException(status_code=400, detail="User already exists")

	# Hash password
	hashed = security.get_password_hash(req.password)
	user_id = str(uuid.uuid4())

	# Create user in Supabase (both users and user_profiles tables)
	if not supabase_service.create_user(
		user_id=user_id,
		email=email,
		password_hash=hashed,
		full_name=req.full_name,
	):
		raise HTTPException(status_code=500, detail="Failed to create user")

	# Log event
	supabase_service.log_event(
		"user_registered",
		f"User registered: {email}",
		"info",
		{"email": email, "user_id": user_id},
	)

	return {
		"message": "Registered successfully",
		"user_id": user_id,
	}





@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
	email = req.email.lower()
	
	# Get user from Supabase
	user = supabase_service.get_user_by_email(email)
	if not user or not security.verify_password(req.password, user["password_hash"]):
		raise HTTPException(status_code=401, detail="Invalid credentials")

	user_id = user["id"]
	
	# Update last login
	supabase_service.update_last_login(user_id)
	
	# Get user profile for role
	profile = supabase_service.get_user_profile(user_id)
	role = profile.get("role", "user") if profile else "user"
	
	access_token = security.create_access_token(
		subject=user_id,
		extra={"email": email, "role": role},
	)
	refresh_token = security.create_access_token(
		subject=user_id,
		extra={"email": email, "role": role, "token_use": "refresh"},
		expires_delta=timedelta(days=7),
	)

	supabase_service.log_event("user_login", f"User logged in: {email}", "info", {"email": email})

	return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(req: RefreshRequest):
	payload = security.decode_access_token(req.refresh_token)
	if payload.get("token_use") != "refresh":
		raise HTTPException(status_code=401, detail="Invalid refresh token")
	
	uid = payload.get("sub")
	email = payload.get("email")
	if not uid or not email:
		raise HTTPException(status_code=401, detail="Invalid refresh payload")
	
	# Get user from Supabase
	user = supabase_service.get_user_by_email(email)
	if not user or user.get("id") != uid:
		raise HTTPException(status_code=401, detail="User not found")
	
	# Get profile for role
	profile = supabase_service.get_user_profile(uid)
	role = profile.get("role", "user") if profile else "user"
	
	access_token = security.create_access_token(
		subject=uid,
		extra={"email": email, "role": role},
	)
	new_refresh = security.create_access_token(
		subject=uid,
		extra={"email": email, "role": role, "token_use": "refresh"},
		expires_delta=timedelta(days=7),
	)
	return {"access_token": access_token, "refresh_token": new_refresh, "token_type": "bearer"}


@router.post("/logout", response_model=dict)
def logout():
	return {"ok": True, "message": "Signed out (client should discard tokens)"}


@router.get("/me")
def me(current: dict = Depends(security.get_current_user)):
	profile = supabase_service.get_user_profile(current["id"])
	if profile:
		return {
			"id": profile["id"],
			"email": profile.get("email"),
			"full_name": profile.get("full_name"),
			"role": profile.get("role", current.get("role", "user")),
		}
	raise HTTPException(status_code=404, detail="Profile not found")


@router.patch("/profile")
def patch_profile(body: ProfileUpdate, current: dict = Depends(security.get_current_user)):
	if body.full_name is None:
		raise HTTPException(status_code=400, detail="Nothing to update")
	if not supabase_service.update_user_full_name(current["id"], body.full_name):
		raise HTTPException(status_code=500, detail="Failed to update profile")
	return {"ok": True, "full_name": body.full_name}
