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
    
    if user.role == "teacher":
        # 1. Fetch courses taught by the teacher
        courses = db.query(Course).filter(Course.teacher_id == user.id).all()
        course_ids = [c.id for c in courses]
        
        # 2. Fetch assignments created in those courses
        assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all() if course_ids else []
            
        # 3. Fetch ungraded submissions count
        ungraded_count = 0
        if course_ids:
            ungraded_count = db.query(Submission).join(Assignment).filter(
                Assignment.course_id.in_(course_ids),
                Submission.grade.is_(None)
            ).count()
            
        stats = {
            "course_count": len(courses),
            "assignment_count": len(assignments),
            "notifications": 0,
            "ungraded_count": ungraded_count,
            "graded_count": 0
        }
    else:
        # Default (Student) logic
        # 1. Fetch enrollments
        enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
        course_ids = [e.course_id for e in enrollments]
        
        # 2. Fetch course details
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
        
        # 3. Fetch assignments
        assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all() if course_ids else []
            
        # 4. Fetch graded submissions count
        graded_count = db.query(Submission).filter(
            Submission.user_id == user.id,
            Submission.grade.isnot(None)
        ).count()
        
        stats = {
            "course_count": len(courses),
            "assignment_count": len(assignments),
            "notifications": 3,
            "graded_count": graded_count,
            "ungraded_count": 0
        }
    
    return {
        "user_name": user.full_name,
        "stats": stats,
        "recent_courses": courses[:3], # Show top 3
        "upcoming_assignments": assignments[:3] # Show top 3
    }
@router.get("/students", response_model=List[dict])
def get_student_roster(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user or user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access student roster")
        
    students = db.query(User).filter(User.role == "student").all()
    results = []
    for s in students:
        # Get enrollment count for each student
        enrollment_count = db.query(Enrollment).filter(Enrollment.user_id == s.id).count()
        results.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "created_at": s.created_at,
            "enrollment_count": enrollment_count
        })
    return results
