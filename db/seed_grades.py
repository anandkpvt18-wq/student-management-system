import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.course import Course
from models.user import User
from models.assignment import Assignment, Submission

def seed_grades():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email.ilike("student@school.com")).first()
        if not user:
            print("User student@school.com not found, skipping grade seeding.")
            return

        # Get some assignments
        python_assignment = db.query(Assignment).filter(Assignment.title.ilike("%Python%")).first()
        react_assignment = db.query(Assignment).filter(Assignment.title.ilike("%React%")).first()
        algo_assignment = db.query(Assignment).filter(Assignment.title.ilike("%Binary Search%")).first()

        submissions = []
        if python_assignment:
            submissions.append(Submission(
                assignment_id=python_assignment.id,
                user_id=user.id,
                content="Quiz Completed: Score 9/10",
                grade="90%",
                submitted_at=datetime(2026, 3, 20)
            ))
        
        if react_assignment:
            submissions.append(Submission(
                assignment_id=react_assignment.id,
                user_id=user.id,
                content="Quiz Completed: Score 8/10",
                grade="80%",
                submitted_at=datetime(2026, 3, 22)
            ))

        if algo_assignment:
            submissions.append(Submission(
                assignment_id=algo_assignment.id,
                user_id=user.id,
                content="Quiz Completed: Score 10/10",
                grade="100%",
                submitted_at=datetime(2026, 3, 25)
            ))

        # Clear existing submissions for this user to avoid duplicates if re-running
        db.query(Submission).filter(Submission.user_id == user.id).delete()
        
        db.add_all(submissions)
        db.commit()
        print(f"Successfully seeded {len(submissions)} grades for student@school.com")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_grades()
