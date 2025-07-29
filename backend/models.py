from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

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
