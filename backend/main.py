from fastapi import FastAPI, Response
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
        import models.course
        if engine:
            models.user.Base.metadata.create_all(bind=engine)
            print("Database tables initialized successfully.")
        else:
            print("Database initialization skipped: engine is None")
    except Exception as e:
        print(f"WARNING: Database initialization failed: {e}")
    yield

app = FastAPI(title="Student Management API", lifespan=lifespan)

@app.middleware("http")
async def manual_cors_middleware(request, call_next):
    if request.method == "OPTIONS":
        response = Response()
        response.status_code = 200
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# We keep the standard one as well, just in case
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"GLOBAL ERROR: {exc}")
    # Put the actual error in 'detail' for easier frontend display
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server Error: {str(exc)}", "message": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

from routers import auth, courses, assignments

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Student Management API is running"}
