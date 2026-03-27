import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_l38GOnCuIejr@ep-divine-water-amvc3u8h-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def apply_sql(file_path):
    print(f"Applying {file_path}...")
    with open(file_path, "r") as f:
        sql = f.read()
    
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Split by ';' to execute multiple statements if needed, 
        # or just execute the whole block if it's simple.
        # SQLAlchemy's engine.execute(text(sql)) handles basic multi-statement scripts in some dialects.
        conn.execute(text(sql))
        conn.commit()
    print(f"Successfully applied {file_path}")

if __name__ == "__main__":
    try:
        apply_sql("db/schema.sql")
        apply_sql("db/seed.sql")
    except Exception as e:
        print(f"Error: {e}")
