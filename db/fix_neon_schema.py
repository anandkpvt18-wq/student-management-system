import os
from sqlalchemy import create_engine, text

# Get the DB link from the user's message
DATABASE_URL = "postgresql://neondb_owner:npg_l38GOnCuIejr@ep-divine-water-amvc3u8h-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def fix_schema():
    print("Connecting to database to fix schema...")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Dropping old users table to ensure fresh start...")
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
        
        print("Creating users table with all required columns...")
        schema_sql = """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            role VARCHAR(20) DEFAULT 'student',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_users_email ON users(email);
        """
        conn.execute(text(schema_sql))
        conn.commit()
    print("Database schema fixed successfully!")

if __name__ == "__main__":
    try:
        fix_schema()
    except Exception as e:
        print(f"Error fixing schema: {e}")
