# from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Category(BaseModel):
    title: str

class Expense(BaseModel):
    amount: float
    date: datetime
    description: str
    category: Optional[Category] = None

class Profile(BaseModel):
    name: str
    avatar: Optional[str] = None
    totalBudget: Optional[int] = 0
    email: Optional[EmailStr] = None


class UserPublic(BaseModel):
    id: str
    name: str
    email: str


class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class PasswordReset(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6)



class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    totalBudget: Optional[int] = None
    password: Optional[str] = None  # optional if password update is supported
