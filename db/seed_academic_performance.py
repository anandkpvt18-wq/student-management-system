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

# Use the URL from backend/.env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in backend/.env")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def seed():
    db = SessionLocal()
    try:
        # 1. Reset or Create Khushi
        email = "khushi@gmail.com"
        password = "student123"
        khushi = db.query(User).filter(User.email.ilike(email)).first()
        if khushi:
            khushi.password_hash = hash_password(password)
            khushi.full_name = "Khushi"
            print(f"Updated existing user: {email}")
        else:
            khushi = User(
                email=email,
                password_hash=hash_password(password),
                full_name="Khushi",
                role="student"
            )
            db.add(khushi)
            print(f"Created new user: {email}")
        
        db.commit()
        db.refresh(khushi)

        # 2. Ensure Courses exist
        courses_data = [
            {"name": "Advanced Python Programming", "description": "Mastering Python internals and patterns"},
            {"name": "Frontend Development with React", "description": "Building modern SPAs with React and Next.js"},
            {"name": "Data Structures & Algorithms", "description": "Core concepts for software engineering"}
        ]
        
        # We need a teacher (admin or any user with teacher role)
        admin = db.query(User).filter(User.role == 'admin').first()
        if not admin:
            # Fallback to the first user or create an admin
            admin = khushi # Temporary fallback if no admin exists
        
        courses = []
        for c_data in courses_data:
            course = db.query(Course).filter(Course.name == c_data["name"]).first()
            if not course:
                course = Course(name=c_data["name"], description=c_data["description"], teacher_id=admin.id)
                db.add(course)
                db.commit()
                db.refresh(course)
            courses.append(course)

        # 3. Enroll Khushi in courses
        for course in courses:
            enrollment = db.query(Enrollment).filter(Enrollment.user_id == khushi.id, Enrollment.course_id == course.id).first()
            if not enrollment:
                enrollment = Enrollment(user_id=khushi.id, course_id=course.id)
                db.add(enrollment)
        db.commit()

        # 4. Ensure Assignments exist and Create Submissions/Grades
        assignments_data = [
            {"title": "Python Decorators Quiz", "course": courses[0], "grade": "A+", "days_ago": 10},
            {"title": "React State Management", "course": courses[1], "grade": "A", "days_ago": 5},
            {"title": "Binary Tree Traversal", "course": courses[2], "grade": "B+", "days_ago": 2}
        ]

        # Clear old submissions for khushi to avoid clutter
        db.query(Submission).filter(Submission.user_id == khushi.id).delete()
        
        for a_data in assignments_data:
            assignment = db.query(Assignment).filter(Assignment.title == a_data["title"]).first()
            if not assignment:
                assignment = Assignment(
                    title=a_data["title"],
                    description=f"Automated assignment for {a_data['title']}",
                    course_id=a_data["course"].id,
                    due_date=datetime.utcnow() - timedelta(days=a_data["days_ago"]-1)
                )
                db.add(assignment)
                db.commit()
                db.refresh(assignment)
            
            submission = Submission(
                assignment_id=assignment.id,
                user_id=khushi.id,
                content=f"Completed {a_data['title']}",
                grade=a_data["grade"],
                submitted_at=datetime.utcnow() - timedelta(days=a_data["days_ago"])
            )
            db.add(submission)
        
        db.commit()
        print("Successfully seeded courses, assignments, and grades for Khushi!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
