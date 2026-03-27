from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None

class CourseCreate(CourseBase):
    teacher_id: int

class CourseResponse(CourseBase):
    id: int
    teacher_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EnrollmentBase(BaseModel):
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    user_id: int

class EnrollmentResponse(EnrollmentBase):
    id: int
    user_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True

class UserDashboardData(BaseModel):
    enrolled_courses: int
    active_assignments: int = 0
    notifications: int = 2

class EnrollRequest(BaseModel):
    course_id: int
    user_email: str
