from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = None
if not DATABASE_URL:
    print("!!! WARNING: DATABASE_URL environment variable is not set! !!!")
    print("!!! Please add DATABASE_URL in the Render Dashboard (Environment tab) !!!")
else:
    try:
        engine = create_engine(DATABASE_URL)
    except Exception as e:
        print(f"!!! WARNING: Failed to create engine: {e} !!!")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
