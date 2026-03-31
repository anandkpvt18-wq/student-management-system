import hashlib
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_l38GOnCuIejr@ep-divine-water-amvc3u8h-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Create users table if not exists
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# Insert sample users (skip if email already exists)
users = [
    ("student@school.com", hash_password("student123"), "John Student", "student"),
    ("teacher@school.com", hash_password("teacher123"), "Jane Teacher", "teacher"),
]

for email, pw_hash, name, role in users:
    cur.execute(
        "INSERT INTO users (email, password_hash, full_name, role) VALUES (%s, %s, %s, %s) ON CONFLICT (email) DO NOTHING",
        (email, pw_hash, name, role)
    )

conn.commit()
cur.close()
conn.close()
print("Done! Users seeded successfully.")
