import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment, Submission

def cleanup():
    db = SessionLocal()
    try:
        print("Cleaning up academic tables...")
        db.query(Submission).delete()
        db.query(Assignment).delete()
        db.query(Enrollment).delete()
        db.query(Course).delete()
        db.commit()
        print("Academic tables cleaned successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
