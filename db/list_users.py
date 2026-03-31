import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("SELECT email, full_name, role FROM users")
    users = cur.fetchall()
    print("Users in database:")
    for user in users:
        print(f"Email: {user[0]}, Name: {user[1]}, Role: {user[2]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
