from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment, Submission
from schemas.dashboard import DashboardOverview
from typing import List

router = APIRouter()

@router.get("/overview", response_model=DashboardOverview)
def get_dashboard_overview(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Fetch enrollments
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    # 2. Fetch course details
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
    
    # 3. Fetch assignments
    assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    
    # 4. Fetch graded submissions count
    graded_count = db.query(Submission).filter(
        Submission.user_id == user.id,
        Submission.grade.isnot(None)
    ).count()
    
    # 5. Prepare statistics
    stats = {
        "course_count": len(courses),
        "assignment_count": len(assignments),
        "notifications": 3,
        "graded_count": graded_count
    }
    
    return {
        "user_name": user.full_name,
        "stats": stats,
        "recent_courses": courses[:3], # Show top 3
        "upcoming_assignments": assignments[:3] # Show top 3
    }
