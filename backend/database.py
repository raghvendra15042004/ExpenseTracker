from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pymongo import MongoClient
from bson.objectid import ObjectId
from models import Category, Expense, Profile
from auth_utils import decode_token
from typing import Optional

router = APIRouter()

client = MongoClient("mongodb+srv://raghavpratap:AgAQgKbnjyEYsWfr@cluster0.apayhzn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["expense_tracker"]
user_collection = db["users"]
expense_collection = db["expenses"]
category_collection = db["categories"]
profile_collection = db["profiles"]
user_collection.create_index("email", unique=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.post("/categories")
def add_category(category: Category, user_id: str = Depends(get_current_user_id)):
    if category_collection.find_one({"user_id": user_id, "title": category.title}):
        raise HTTPException(status_code=400, detail="Category exists")
    result = category_collection.insert_one({"user_id": user_id, "title": category.title})
    return {"id": str(result.inserted_id)}

@router.get("/categories")
def get_categories(user_id: str = Depends(get_current_user_id)):
    cats = list(category_collection.find({"user_id": user_id}, {"user_id": 0}))
    return cats

@router.post("/expenses")
def add_expense(expense: Expense, user_id: str = Depends(get_current_user_id)):
    data = expense.dict()
    data["user_id"] = user_id
    result = expense_collection.insert_one(data)
    return {"id": str(result.inserted_id)}

@router.get("/expenses")
def get_expenses(user_id: str = Depends(get_current_user_id)):
    exps = list(expense_collection.find({"user_id": user_id}))
    return [serialize(e) for e in exps]

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, user_id: str = Depends(get_current_user_id)):
    result = expense_collection.delete_one({"_id": ObjectId(expense_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Deleted"}

@router.get("/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    profile = profile_collection.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    return profile or {}

@router.post("/profile")
def save_profile(profile: Profile, user_id: str = Depends(get_current_user_id)):
    profile_collection.delete_many({"user_id": user_id})
    d = profile.dict()
    d["user_id"] = user_id
    profile_collection.insert_one(d)
    return {"message": "Profile saved"}
