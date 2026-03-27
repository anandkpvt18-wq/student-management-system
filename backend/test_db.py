import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(f"Connected to: {result.fetchone()[0]}")
    print("Database connection test PASSED")
except Exception as e:
    print(f"Database connection test FAILED: {e}")
    exit(1)
