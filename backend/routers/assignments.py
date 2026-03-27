from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.course import Enrollment
from models.assignment import Assignment, Submission
from schemas.assignment import AssignmentResponse, SubmissionResponse, SubmissionCreate, GradeResponse
from typing import List

router = APIRouter()

@router.get("/my", response_model=List[AssignmentResponse])
def get_my_assignments(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get courses the user is enrolled in
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    # Get assignments for those courses
    assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    return assignments

@router.post("/submit", response_model=SubmissionResponse)
def submit_assignment(submission: SubmissionCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.email.ilike(submission.user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    new_submission = Submission(
        assignment_id=submission.assignment_id,
        user_id=user.id,
        content=submission.content
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    return new_submission
@router.get("/grades", response_model=List[GradeResponse])
def get_user_grades(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    submissions = db.query(Submission).filter(
        Submission.user_id == user.id,
        Submission.grade.isnot(None)
    ).all()
    
    # Transform to match schema
    results = []
    for s in submissions:
        results.append({
            "assignment_title": s.assignment.title,
            "course_name": s.assignment.course.name,
            "submitted_at": s.submitted_at,
            "grade": s.grade
        })
    return results
