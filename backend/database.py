from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("CRITICAL ERROR: DATABASE_URL environment variable is not set!")
    # We allow the engine to be None during initialization but this will fail later 
    # if not handled. Actually, for Render logs, it's better to raise loudly.
    raise ValueError("DATABASE_URL is missing! Please set it in the Render Dashboard.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
