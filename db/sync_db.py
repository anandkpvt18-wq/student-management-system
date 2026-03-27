import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import engine, Base
from models.user import User
from models.course import Course, Enrollment
from models.assignment import Assignment, Submission

def sync():
    print("Synchronizing database schema...")
    Base.metadata.create_all(bind=engine)
    print("Database schema synchronized successfully!")

if __name__ == "__main__":
    sync()
