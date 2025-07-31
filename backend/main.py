from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth_routes import router as auth_router
from database import router as db_router

app = FastAPI(title="Expense Tracker API with JWT Auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(db_router,prefix="/db", tags=["Data"])
