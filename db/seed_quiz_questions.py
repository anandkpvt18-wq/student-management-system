import sys
import os
import json
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.user import User
from models.course import Course
from models.assignment import Assignment

def seed_quizzes():
    db = SessionLocal()
    try:
        # 1. Python Basics Quiz
        python_qs = [
            {"id": 1, "question": "What is the output of print(type([]))?", "options": ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], "answer": 1},
            {"id": 2, "question": "Which keyword is used to create a function in Python?", "options": ["function", "def", "method", "create"], "answer": 1},
            {"id": 3, "question": "How do you start a comment in Python?", "options": ["//", "/*", "#", "<!--"], "answer": 2},
            {"id": 4, "question": "What is the correct way to create a dictionary?", "options": ["x = []", "x = ()", "x = {}", "x = set()"], "answer": 2},
            {"id": 5, "question": "Which of these is NOT a numeric type in Python?", "options": ["int", "float", "complex", "double"], "answer": 3},
            {"id": 6, "question": "What does 'len()' do?", "options": ["Returns length", "Returns type", "Returns value", "Returns index"], "answer": 0},
            {"id": 7, "question": "How do you define a block of code in Python?", "options": ["Brackets", "Indentation", "Parentheses", "Quotes"], "answer": 1},
            {"id": 8, "question": "What is the result of 3 * 'A'?", "options": ["3A", "AAA", "Error", "A3"], "answer": 1},
            {"id": 9, "question": "Which operator is used for power (exponentiation)?", "options": ["^", "**", "*", "//"], "answer": 1},
            {"id": 10, "question": "What is the default return value of a function?", "options": ["0", "False", "None", "Error"], "answer": 2}
        ]

        # 2. React Quiz
        react_qs = [
            {"id": 1, "question": "Which hook is used to manage state in a functional component?", "options": ["useEffect", "useContext", "useState", "useReducer"], "answer": 2},
            {"id": 2, "question": "What does JSX stand for?", "options": ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Xerox"], "answer": 0},
            {"id": 3, "question": "How do you pass data from a parent to a child?", "options": ["State", "Props", "Context", "Redux"], "answer": 1},
            {"id": 4, "question": "Which tool is commonly used to create a new React app?", "options": ["npm start", "create-react-app", "react-new", "pip install react"], "answer": 1},
            {"id": 5, "question": "What is the purpose of useEffect?", "options": ["Handle events", "Update state", "Side effects", "Render UI"], "answer": 2},
            {"id": 6, "question": "What is the 'Virtual DOM'?", "options": ["A direct copy of the DOM", "A lightweight copy of the DOM", "A browser feature", "A CSS framework"], "answer": 1},
            {"id": 7, "question": "Which command is used to start the development server?", "options": ["npm run build", "npm start", "npm test", "npm run clean"], "answer": 1},
            {"id": 8, "question": "How do you handle a click event in React?", "options": ["onclick", "onClick", "on-click", "click"], "answer": 1},
            {"id": 9, "question": "What is useMemo used for?", "options": ["State", "Memoization", "Routing", "Context"], "answer": 1},
            {"id": 10, "question": "What is the entry point of a React app?", "options": ["index.html", "index.js", "App.js", "main.css"], "answer": 1}
        ]

        # 3. Binary Search Quiz
        algo_qs = [
            {"id": 1, "question": "What is the time complexity of Binary Search?", "options": ["O(n)", "O(n^2)", "O(log n)", "O(1)"], "answer": 2},
            {"id": 2, "question": "Binary search requires the input array to be...", "options": ["Large", "Sorted", "Unique", "Empty"], "answer": 1},
            {"id": 3, "question": "What is the middle index calculation?", "options": ["(low + high) / 2", "(low * high) / 2", "low + (high - low) / 2", "Both A and C are safe"], "answer": 3},
            {"id": 4, "question": "In a sorted array of 1024 elements, max steps?", "options": ["1024", "512", "10", "100"], "answer": 2},
            {"id": 5, "question": "What happens if target < mid?", "options": ["high = mid - 1", "low = mid + 1", "Stop", "Error"], "answer": 0},
            {"id": 6, "question": "What happens if target > mid?", "options": ["high = mid - 1", "low = mid + 1", "Stop", "Error"], "answer": 1},
            {"id": 7, "question": "Base case for recursive binary search?", "options": ["low > high", "low == high", "found", "None"], "answer": 0},
            {"id": 8, "question": "Binary search is a type of...", "options": ["Greedy algorithm", "Dynamic programming", "Divide and conquer", "Brute force"], "answer": 2},
            {"id": 9, "question": "Can binary search work on a linked list efficiently?", "options": ["Yes", "No", "Only if sorted", "Only if small"], "answer": 1},
            {"id": 10, "question": "Optimal space complexity (iterative)?", "options": ["O(n)", "O(log n)", "O(1)", "O(n^2)"], "answer": 2}
        ]

        # 4. API Workshop Quiz
        api_qs = [
            {"id": 1, "question": "What does REST stand for?", "options": ["Representational State Transfer", "Request State Tool", "Remote System Test", "Realtime Stat Transfer"], "answer": 0},
            {"id": 2, "question": "Which HTTP method is used for updates?", "options": ["GET", "POST", "PUT/PATCH", "DELETE"], "answer": 2},
            {"id": 3, "question": "What is a 404 status code?", "options": ["Success", "Internal Error", "Not Found", "Forbidden"], "answer": 2},
            {"id": 4, "question": "What is the purpose of headers?", "options": ["Store metadata", "Store UI", "Store state", "Store logs"], "answer": 0},
            {"id": 5, "question": "What is JSON?", "options": ["JavaScript Object Notation", "Java Syntax Object", "Joint System Node", "Just Some Old Note"], "answer": 0},
            {"id": 6, "question": "Which method is used to fetch data?", "options": ["GET", "POST", "UPDATE", "FETCH"], "answer": 0},
            {"id": 7, "question": "What is an API Key used for?", "options": ["Encryption", "Authentication", "Routing", "Storage"], "answer": 1},
            {"id": 8, "question": "What is CORS?", "options": ["Cross-Origin Resource Sharing", "Core Object Resource", "Client Origin Request", "None"], "answer": 0},
            {"id": 9, "question": "What is a 201 status code?", "options": ["OK", "Created", "Accepted", "No Content"], "answer": 1},
            {"id": 10, "question": "What format is most commonly used for APIs today?", "options": ["XML", "JSON", "CSV", "Plain Text"], "answer": 1}
        ]

        # Update assignments
        all_assignments = db.query(Assignment).all()
        for a in all_assignments:
            title = a.title.lower()
            if "python" in title:
                a.questions = python_qs
            elif "react" in title:
                a.questions = react_qs
            elif "binary search" in title:
                a.questions = algo_qs
            elif "api" in title:
                a.questions = api_qs
            else:
                a.questions = python_qs # Fallback

        db.commit()
        print("Successfully seeded questions for all assignments!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_quizzes()
