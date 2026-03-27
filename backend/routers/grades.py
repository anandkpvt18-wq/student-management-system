from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.assignment import Assignment, Submission
from typing import List
from pydantic import BaseModel

router = APIRouter()

class GradeResponse(BaseModel):
    assignment_title: str
    course_name: str
    grade: str
    submitted_at: str

@router.get("/my/grades", response_model=List[GradeResponse])
def get_my_grades(user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    submissions = db.query(Submission).filter(
        Submission.user_id == user.id,
        Submission.grade.isnot(None)
    ).all()
    
    results = []
    for s in submissions:
        results.append({
            "assignment_title": s.assignment.title,
            "course_name": s.assignment.course.name,
            "grade": s.grade,
            "submitted_at": s.submitted_at.strftime("%Y-%m-%d")
        })
    
    return results
