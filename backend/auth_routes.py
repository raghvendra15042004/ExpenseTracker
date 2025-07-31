from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from models import UserCreate, UserLogin, Token
from auth_utils import hash_password, verify_password, create_access_token, decode_token
from database import user_collection
from bson.objectid import ObjectId
from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from models import OTPRequest, OTPVerify, PasswordReset
from auth_utils import generate_otp, hash_password
from email_utils import send_otp_email
from database import otp_collection
from database import profile_collection



router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", summary="Register a new user")
def register(user: UserCreate):
    if user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    doc = {"name": user.name, "email": user.email, "password": hashed}
    result = user_collection.insert_one(doc)
    user_id = str(result.inserted_id)

    # 🔧 Create empty profile too
    profile_collection.insert_one({
        "user_id": user_id,
        "name": user.name,
        "email": user.email
    })

    return {"message": "User registered"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = user_collection.find_one({"email": form_data.username})
    if not db_user or not verify_password(form_data.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "Bearer"}

@router.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = user_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user











@router.post("/send-otp")
def send_otp(data: OTPRequest, background_tasks: BackgroundTasks):
    user = user_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_collection.update_one(
        {"email": data.email},
        {"$set": {"otp": otp, "expires_at": expires_at}},
        upsert=True
    )

    # Send in background to prevent delay
    background_tasks.add_task(send_otp_email, data.email, otp)

    return {"message": "OTP sent to email"}

@router.post("/verify-otp")
def verify_otp(data: OTPVerify):
    record = otp_collection.find_one({"email": data.email})
    if not record or record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    return {"message": "OTP verified"}

@router.post("/reset-password")
def reset_password(data: PasswordReset):
    record = otp_collection.find_one({"email": data.email})
    if not record or record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")

    hashed = hash_password(data.new_password)
    user_collection.update_one({"email": data.email}, {"$set": {"password": hashed}})
    otp_collection.delete_one({"email": data.email})  # Clean up

    return {"message": "Password reset successful"}
