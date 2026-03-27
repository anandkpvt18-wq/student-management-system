import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.course import Course, Enrollment
from models.assignment import Assignment, Submission
from models.user import User

def seed_grades():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'anandkpvt18@gmail.com').first()
        if not user:
            print("User not found")
            return

        # Get some assignments to "submit" and "grade"
        assignments = db.query(Assignment).limit(3).all()
        
        # Clear existing submissions to avoid duplicates for this test
        db.query(Submission).filter(Submission.user_id == user.id).delete()
        
        grades = ["A", "B+", "A-"]
        for i, assign in enumerate(assignments):
            sub = Submission(
                assignment_id=assign.id,
                user_id=user.id,
                content=f"Sample work for {assign.title}",
                grade=grades[i % len(grades)],
                submitted_at=datetime.utcnow()
            )
            db.add(sub)
        
        db.commit()
        print(f"Successfully seeded {len(assignments)} graded submissions for {user.full_name}!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_grades()
