import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment

def seed_more():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'anandkpvt18@gmail.com').first()
        enrolls = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
        course_ids = [e.course_id for e in enrolls]
        unique_course_ids = list(set(course_ids))

        print(f"Found {len(unique_course_ids)} unique courses for {user.full_name}. Seeding assignments...")

        new_assignments = []
        for cid in unique_course_ids:
            course = db.query(Course).get(cid)
            # Add 3 assignments per course
            new_assignments.append(Assignment(title=f"{course.name}: Binary Search", description="Implement a binary search algorithm in Python.", course_id=cid, due_date=datetime(2026, 4, 15)))
            new_assignments.append(Assignment(title=f"{course.name}: State Management", description="Handle global state using Context API or Redux.", course_id=cid, due_date=datetime(2026, 4, 20)))
            new_assignments.append(Assignment(title=f"{course.name}: SQL Optimization", description="Optimize slow queries using indexes and query planning.", course_id=cid, due_date=datetime(2026, 5, 5)))

        db.add_all(new_assignments)
        db.commit()
        print(f"Successfully added {len(new_assignments)} new assignments!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_more()
