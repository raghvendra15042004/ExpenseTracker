from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pymongo import MongoClient
from bson.objectid import ObjectId
from models import Category, Expense, Profile
from auth_utils import decode_token
from typing import Optional
from models import ProfileUpdate
from auth_utils import hash_password

router = APIRouter()

client = MongoClient("mongodb+srv://raghavpratap:AgAQgKbnjyEYsWfr@cluster0.apayhzn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["expense_tracker"]
user_collection = db["users"]
expense_collection = db["expenses"]
category_collection = db["categories"]
profile_collection = db["profiles"]
user_collection.create_index("email", unique=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/db")

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
    cats = category_collection.find(
        {"user_id": user_id},
        {"title": 1, "_id": 0}
    )
    return [cat["title"] for cat in cats]


@router.delete("/categories/{title}")
def delete_category(title: str, user_id: str = Depends(get_current_user_id)):
    result = category_collection.delete_one({"user_id": user_id, "title": title})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


@router.post("/expenses")
def add_expense(expense: Expense, user_id: str = Depends(get_current_user_id)):
    data = expense.dict()
    data["user_id"] = user_id
    result = expense_collection.insert_one(data)
    return {"id": str(result.inserted_id)}

@router.get("/expenses")
def get_expenses(
    page: int = 1,
    pageSize: int = 4,
    user_id: str = Depends(get_current_user_id)
):
    skip = (page - 1) * pageSize
    total = expense_collection.count_documents({"user_id": user_id})
    expenses = list(
        expense_collection.find({"user_id": user_id})
        .skip(skip)
        .limit(pageSize)
    )
    return {"data": [serialize(e) for e in expenses], "total": total}


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
    d = profile.dict()
    d["user_id"] = user_id
    profile_collection.update_one(
        {"user_id": user_id},
        {"$set": d},
        upsert=True
    )
    return {"message": "Profile saved"}



otp_collection = db["otp_verification"]

@router.put("/profile")
def update_profile(profile: ProfileUpdate, user_id: str = Depends(get_current_user_id)):
    id=ObjectId(user_id)
    print(user_id)
    existing = user_collection.find_one({"_id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_fields = {k: v for k, v in profile.dict().items() if v is not None}

    # Optional: hash password if included
    if "password" in update_fields:
        update_fields["password"] = hash_password(update_fields["password"])

    user_collection.update_one(
        {"_id": id},
        {"$set": update_fields}
    )
    return {"message": "Profile updated"}
