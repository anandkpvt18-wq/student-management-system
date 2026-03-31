from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.course import Enrollment
from models.assignment import Assignment, Submission
from schemas.assignment import AssignmentResponse, SubmissionResponse, SubmissionCreate, GradeResponse
import schemas.assignment
import models.course
from typing import List

router = APIRouter()

@router.get("/my", response_model=List[AssignmentResponse])
def get_my_assignments(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    return assignments

@router.get("/teaching", response_model=List[AssignmentResponse])
def get_teaching_assignments(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized - Only teachers can view this")
    
    courses = db.query(models.course.Course).filter(models.course.Course.teacher_id == user.id).all()
    course_ids = [c.id for c in courses]
    
    assignments = db.query(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
    return assignments

@router.post("/", response_model=AssignmentResponse)
def create_assignment(req: schemas.assignment.AssignmentCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(req.user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create assignments")
        
    course = db.query(models.course.Course).filter(models.course.Course.id == req.course_id, models.course.Course.teacher_id == user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not owned by you")
        
    default_questions = [
        {
            "question": f"What is the most important concept in {req.title}?",
            "options": ["The core fundamentals", "Random trivia", "Syntax rules", "Nothing"],
            "answer": 0
        },
        {
            "question": "How do you apply this in a real-world project?",
            "options": ["Read stackoverflow", "Build a small prototype", "Memorize it", "Ignore it"],
            "answer": 1
        }
    ]
    
    new_assignment = Assignment(
        title=req.title,
        description=req.description,
        due_date=req.due_date,
        course_id=req.course_id,
        questions=default_questions
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

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
            "id": s.id,
            "assignment_title": s.assignment.title,
            "course_name": s.assignment.course.name,
            "submitted_at": s.submitted_at,
            "grade": s.grade
        })
    return results

@router.delete("/grades/{submission_id}")
def delete_grade(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    db.delete(submission)
    db.commit()
    return {"message": "Grade deleted successfully"}

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete assignments")
        
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    course = db.query(models.course.Course).filter(models.course.Course.id == assignment.course_id).first()
    if not course or course.teacher_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this assignment")
    
    # Simple cascade or manual delete for demo
    db.query(Submission).filter(Submission.assignment_id == assignment_id).delete()
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}
