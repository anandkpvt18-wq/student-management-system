from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.course import Course, Enrollment
from schemas.course import CourseResponse, EnrollmentResponse, UserDashboardData
from typing import List

router = APIRouter()

@router.get("/my", response_model=UserDashboardData)
def get_my_dashboard_stats(user_email: str, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Count enrolled courses
    course_count = db.query(Enrollment).filter(Enrollment.user_id == user.id).count()
    
    return {
        "enrolled_courses": course_count,
        "active_assignments": 0,  # Placeholder for now
        "notifications": 2        # Placeholder for now
    }

@router.get("/enrolled", response_model=List[CourseResponse])
def get_my_courses(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all courses where the user is enrolled
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    course_ids = [e.course_id for e in enrollments]
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
    
    return courses
