from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from database import engine
import models.user

models.user.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Student Management API is running"}
