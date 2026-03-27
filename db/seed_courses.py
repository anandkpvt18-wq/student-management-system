import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models.user import User
from models.course import Course, Enrollment
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

        # 2. Create sample courses
        course1 = Course(name="Introduction to Computer Science", description="Basics of programming and algorithms.", teacher_id=1)
        course2 = Course(name="Advanced Web Development", description="Building modern web apps with Next.js and FastAPI.", teacher_id=1)
        course3 = Course(name="Database Management Systems", description="SQL, NoSQL, and data modeling.", teacher_id=1)
        course4 = Course(name="Business Management 101", description="Learn the fundamentals of organizational leadership and strategy.", teacher_id=1)
        course5 = Course(name="Digital Marketing Essentials", description="Social media, SEO, and content strategy for the modern web.", teacher_id=1)
        
        db.add_all([course1, course2, course3, course4, course5])
        db.commit()
        db.refresh(course1)
        db.refresh(course2)
        db.refresh(course3)

        # 3. Enroll the student in these courses
        enroll1 = Enrollment(user_id=student.id, course_id=course1.id)
        enroll2 = Enrollment(user_id=student.id, course_id=course2.id)
        
        db.add_all([enroll1, enroll2])
        db.commit()

        print(f"Successfully seeded 3 courses and enrolled {student.full_name} in 2 of them!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
