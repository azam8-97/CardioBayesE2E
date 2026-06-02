from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
	full_name: str
	email: EmailStr
	password: str


class UserOut(BaseModel):
	email: EmailStr
	full_name: str
	role: str
