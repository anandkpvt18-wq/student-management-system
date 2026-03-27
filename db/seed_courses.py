import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment
from database import Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def seed():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 1. Find the student user
        student = db.query(User).filter(User.email == 'anandkpvt18@gmail.com').first()
        if not student:
            print("Student 'anandkpvt18@gmail.com' not found. Please sign up first.")
            return

        # 1. Create unique courses
        existing_courses = {c.name: c for c in db.query(Course).all()}
        
        def get_or_create_course(name, desc, tid):
            if name in existing_courses:
                return existing_courses[name]
            course = Course(name=name, description=desc, teacher_id=tid)
            db.add(course)
            db.commit()
            db.refresh(course)
            existing_courses[name] = course
            return course

        c1 = get_or_create_course("Introduction to Computer Science", "Basics of programming and algorithms.", 1)
        c2 = get_or_create_course("Advanced Web Development", "Building modern web apps with Next.js and FastAPI.", 1)
        c3 = get_or_create_course("Database Management Systems", "SQL, NoSQL, and data modeling.", 1)
        c4 = get_or_create_course("Business Management 101", "Learn the fundamentals of leadership and strategy.", 1)
        c5 = get_or_create_course("Digital Marketing Essentials", "Social media, SEO, and content strategy for the modern web.", 1)

        # 2. Enroll the student (anand) uniquely
        if student:
            current_enrolls = {e.course_id for e in db.query(Enrollment).filter(Enrollment.user_id == student.id).all()}
            for course in [c1, c2, c3]:
                if course.id not in current_enrolls:
                    db.add(Enrollment(user_id=student.id, course_id=course.id))
            db.commit()

        # 3. Create unique assignments
        existing_assigns = {a.title for a in db.query(Assignment).all()}
        assignments_map = [
            ("Python Basics Quiz", "Loops and functions.", c1.id, datetime(2026, 4, 15)),
            ("First React Component", "Custom hooks and state.", c2.id, datetime(2026, 4, 20)),
            ("SQL Query Lab", "Complex joins.", c3.id, datetime(2026, 5, 5)),
            ("Marketing Strategy", "SEO and content.", c5.id, datetime(2026, 5, 10)),
            ("Binary Search Task", "O(log n) implementations.", c1.id, datetime(2026, 4, 18)),
            ("API Workshop", "Connecting to external services.", c2.id, datetime(2026, 4, 22)),
            ("Normalization Lab", "3NF and BCNF exercises.", c3.id, datetime(2026, 5, 12)),
            ("Leadership Essay", "Principles of modern management.", c4.id, datetime(2026, 5, 15)),
            ("Social Media Audit", "Analyze 3 brand presence.", c5.id, datetime(2026, 5, 18)),
            ("Budget Forecast", "Predict 12-month revenue.", c4.id, datetime(2026, 5, 20))
        ]

        for title, desc, cid, due in assignments_map:
            if title not in existing_assigns:
                db.add(Assignment(title=title, description=desc, course_id=cid, due_date=due))
        
        db.commit()
        print(f"Cleanup & Seed Successful: {len(db.query(Assignment).all())} unique assignments available for {student.full_name}.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
