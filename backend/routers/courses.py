from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.course import Course, Enrollment
from schemas.course import CourseResponse, EnrollmentResponse, UserDashboardData, EnrollRequest
from typing import List

router = APIRouter()

@router.get("/all", response_model=List[CourseResponse])
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

from schemas.course import CourseCreateRequest
@router.post("/", response_model=CourseResponse)
def create_course(req: CourseCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(req.user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create courses")
        
    new_course = Course(
        name=req.name,
        description=req.description,
        teacher_id=user.id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.post("/enroll", response_model=EnrollmentResponse)
def enroll_in_course(req: EnrollRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(req.user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == req.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    new_enrollment = Enrollment(user_id=user.id, course_id=req.course_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

@router.get("/my", response_model=UserDashboardData)
def get_my_dashboard_stats(user_email: str, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email.ilike(user_email)).first()
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
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all courses where the user is enrolled
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    course_ids = [e.course_id for e in enrollments]
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
    
    return courses

@router.get("/teaching", response_model=List[CourseResponse])
def get_teaching_courses(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized - Only teachers can access this")
    
    # Allow teachers to see ALL courses
    return db.query(Course).all()

@router.delete("/unenroll/{course_id}")
def unenroll_course(course_id: int, user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    db.delete(enrollment)
    db.commit()
    return {"message": "Successfully unenrolled from course"}

@router.delete("/{course_id}")
def delete_course(course_id: int, user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete courses")
    
    # Allow teachers to delete ANY course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete related enrollments first or rely on cascade (if configured)
    db.query(Enrollment).filter(Enrollment.course_id == course.id).delete()
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}
@router.get("/{course_id}", response_model=CourseResponse)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
