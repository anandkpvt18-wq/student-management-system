from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_l38GOnCuIejr@ep-divine-water-amvc3u8h-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Adding 'questions' column to 'assignments' table...")
        try:
            conn.execute(text("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS questions JSONB;"))
            conn.commit()
            print("Successfully added 'questions' column.")
        except Exception as e:
            print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
