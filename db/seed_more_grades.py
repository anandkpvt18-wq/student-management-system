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

def seed_more():
    db = SessionLocal()
    try:
        email = "khushi@gmail.com"
        khushi = db.query(User).filter(User.email.ilike(email)).first()
        if not khushi:
            print(f"Error: User {email} not found. Run previous seed first.")
            return
        
        # We need a teacher (admin)
        admin = db.query(User).filter(User.role == 'admin').first()
        if not admin:
            admin = khushi
        
        # Additional Courses
        extra_courses_data = [
            {"name": "Database Systems", "description": "SQL optimization and relational design"},
            {"name": "Mobile Development", "description": "Building apps with React Native"},
            {"name": "Cloud Computing", "description": "AWS and Distributed Systems"},
            {"name": "Machine Learning", "description": "Introduction to statistical models"},
            {"name": "UI/UX Design", "description": "Design principles and prototyping"}
        ]
        
        courses = []
        for c_data in extra_courses_data:
            course = db.query(Course).filter(Course.name == c_data["name"]).first()
            if not course:
                course = Course(name=c_data["name"], description=c_data["description"], teacher_id=admin.id)
                db.add(course)
                db.commit()
                db.refresh(course)
            courses.append(course)

        # Enroll Khushi
        for course in courses:
            enrollment = db.query(Enrollment).filter(Enrollment.user_id == khushi.id, Enrollment.course_id == course.id).first()
            if not enrollment:
                enrollment = Enrollment(user_id=khushi.id, course_id=course.id)
                db.add(enrollment)
        db.commit()

        # Additional Assignments & Grades
        extra_assignments_data = [
            {"title": "SQL Indexing Lab", "course": courses[0], "grade": "A-", "days_ago": 15},
            {"title": "React Native Navigation", "course": courses[1], "grade": "A", "days_ago": 12},
            {"title": "AWS Lambda Function", "course": courses[2], "grade": "B+", "days_ago": 8},
            {"title": "Linear Regression Quiz", "course": courses[3], "grade": "A", "days_ago": 4},
            {"title": "Figma Wireframing", "course": courses[4], "grade": "A-", "days_ago": 1}
        ]

        for a_data in extra_assignments_data:
            assignment = db.query(Assignment).filter(Assignment.title == a_data["title"]).first()
            if not assignment:
                assignment = Assignment(
                    title=a_data["title"],
                    description=f"Lab work for {a_data['title']}",
                    course_id=a_data["course"].id,
                    due_date=datetime.utcnow() - timedelta(days=a_data["days_ago"]-1)
                )
                db.add(assignment)
                db.commit()
                db.refresh(assignment)
            
            # Add submission if not already exists
            existing_sub = db.query(Submission).filter(Submission.user_id == khushi.id, Submission.assignment_id == assignment.id).first()
            if not existing_sub:
                submission = Submission(
                    assignment_id=assignment.id,
                    user_id=khushi.id,
                    content=f"Completed {a_data['title']}",
                    grade=a_data["grade"],
                    submitted_at=datetime.utcnow() - timedelta(days=a_data["days_ago"])
                )
                db.add(submission)
        
        db.commit()
        print("Successfully added 5 more graded assignments for Khushi!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_more()
