import os
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import sys

# Add backend to path to import models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import Base, engine, SessionLocal
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment, Submission

# Load DB URL
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_grading_demo():
    db = SessionLocal()
    try:
        # 1. Ensure our Teacher (sanjuu) exists
        teacher_email = "sanju123@gmail.com"
        teacher = db.query(User).filter(User.email.ilike(teacher_email)).first()
        if not teacher:
            teacher = User(email=teacher_email, password_hash="hashed", full_name="sanjuu", role="teacher")
            db.add(teacher)
            db.commit()
            db.refresh(teacher)

        # 2. Create some Test Students
        students_data = [
            {"email": "alex@student.com", "name": "Alex Johnson"},
            {"email": "maria@student.com", "name": "Maria Garcia"},
            {"email": "sam@student.com", "name": "Sam Smith"}
        ]
        students = []
        for s_data in students_data:
            s = db.query(User).filter(User.email == s_data["email"]).first()
            if not s:
                s = User(email=s_data["email"], password_hash="hashed", full_name=s_data["name"], role="student")
                db.add(s)
                db.commit()
                db.refresh(s)
            students.append(s)

        # 3. Create a Demo Course
        course = db.query(Course).filter(Course.name == "Advanced Web Systems").first()
        if not course:
            course = Course(name="Advanced Web Systems", description="Fullstack integration and design", teacher_id=teacher.id)
            db.add(course)
            db.commit()
            db.refresh(course)

        # 4. Create Demo Assignments
        assignments_data = [
            {"title": "React Architecture Quiz", "days_ago": 5},
            {"title": "Backend API Integration", "days_ago": 2}
        ]
        assignments = []
        for a_data in assignments_data:
            a = db.query(Assignment).filter(Assignment.title == a_data["title"]).first()
            if not a:
                a = Assignment(
                    title=a_data["title"],
                    description=f"Automated lab for {a_data['title']}",
                    course_id=course.id,
                    due_date=datetime.utcnow() - timedelta(days=a_data["days_ago"])
                )
                db.add(a)
                db.commit()
                db.refresh(a)
            assignments.append(a)

        # 5. Create Sample Submissions for each filter
        # Clear existing to avoid confusion
        db.query(Submission).filter(Submission.user_id.in_([s.id for s in students])).delete()
        
        submissions_to_create = [
            {
                "student": students[0], 
                "assignment": assignments[0], 
                "content": "Raw Score: 5/5", 
                "grade": "A+", # Graded
            },
            {
                "student": students[1], 
                "assignment": assignments[0], 
                "content": "Raw Score: 3/5", 
                "grade": None, # Pending
            },
            {
                "student": students[2], 
                "assignment": assignments[1], 
                "content": "Raw Score: 4/5", 
                "grade": None, # Pending
            }
        ]

        for s_info in submissions_to_create:
            sub = Submission(
                assignment_id=s_info["assignment"].id,
                user_id=s_info["student"].id,
                content=s_info["content"],
                grade=s_info["grade"],
                submitted_at=datetime.utcnow() - timedelta(hours=10)
            )
            db.id = sub.id # Just for clarity
            db.add(sub)
            
            # Enroll them too
            enrollment = db.query(Enrollment).filter(Enrollment.user_id == s_info["student"].id, Enrollment.course_id == course.id).first()
            if not enrollment:
                enrollment = Enrollment(user_id=s_info["student"].id, course_id=course.id)
                db.add(enrollment)
        
        db.commit()

        print("Successfully seeded grading demo data!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_grading_demo()
