from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    print("Starting up: Initializing database tables...")
    try:
        from database import engine
        import models.user
        models.user.Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR during database initialization: {e}")
        # In production, we might want to continue or fail. 
        # Failing is clearer for debugging startup issues.
        raise e
    yield
    # Shutdown logic if needed

app = FastAPI(title="Student Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://student-management-system-ngd5.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Student Management API is running"}
