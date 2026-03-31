'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function AssignmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', course_id: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  // Quiz State
  const [quizAssignment, setQuizAssignment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchData() {
      try {
        const isTeacher = userData.role === 'teacher';
        
        const assignmentsEndpoint = isTeacher 
          ? `${API_URL}/assignments/teaching?user_email=${userData.email}`
          : `${API_URL}/assignments/my?user_email=${userData.email}`;
          
        const coursesEndpoint = isTeacher
          ? `${API_URL}/courses/teaching?user_email=${userData.email}`
          : `${API_URL}/courses/enrolled?user_email=${userData.email}`;

        const [assigRes, coursesRes] = await Promise.all([
          fetch(assignmentsEndpoint),
          fetch(coursesEndpoint)
        ]);
        
        if (assigRes.ok) setAssignments(await assigRes.json());
        if (coursesRes.ok) setCourses(await coursesRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchData();
    }
  }, [router]);

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    if (!newQuiz.title || !newQuiz.course_id) return alert("Title and Course are required.");
    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/assignments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          course_id: parseInt(newQuiz.course_id),
          due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          user_email: user.email
        })
      });
      if (res.ok) {
        const created = await res.json();
        setAssignments([...assignments, created]);
        setIsAddModalOpen(false);
        setNewQuiz({ title: '', description: '', course_id: '' });
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to create quiz.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const startQuiz = (assignment) => {
    setQuizAssignment(assignment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizResult(null);
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (quizAssignment.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitQuiz = async () => {
    if (!user || !quizAssignment || isSubmitting) return;
    
    setIsSubmitting(true);
    let correct = 0;
    const total = quizAssignment.questions?.length || 0;
    quizAssignment.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });

    const score = `${correct}/${total}`;
    
    try {
      const res = await fetch(`${API_URL}/assignments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: quizAssignment.id,
          user_email: user.email,
          content: `Interactive Quiz Score: ${score}`
        })
      });

      if (res.ok) {
        setQuizResult({ score, total, correct });
      } else {
        alert('Failed to save quiz result. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeQuiz = () => {
    setQuizAssignment(null);
    setQuizResult(null);
  };

  const deleteAssignment = async (e, id) => {
    e.preventDefault();
    if (confirm('Delete this assignment permanently?')) {
      try {
        const res = await fetch(`${API_URL}/assignments/${id}?user_email=${user.email}`, { method: 'DELETE' });
        if (res.ok) {
          setAssignments(assignments.filter(item => item.id !== id));
        } else {
          const errData = await res.json();
          alert(errData.detail || 'Failed to delete assignment.');
        }
      } catch (err) {
        console.error('Error deleting assignment', err);
      }
    }
  };

  if (!user) return null;

  const isTeacher = user.role === 'teacher';

  return (
    <main>
      <div className="dashboard-container" style={{ maxWidth: '1100px' }}>
        {!quizAssignment ? (
          <>
            <nav className="dashboard-nav">
              <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="role-badge" 
                     style={{ background: isTeacher ? '#f59e0b' : '#22c55e', cursor: 'pointer', textTransform: 'capitalize' }}
                     onClick={() => {
                       if(confirm('Do you want to sign out?')) {
                         localStorage.removeItem('user');
                         router.push('/auth/signin');
                       }
                     }}>
                  {user.role} (Sign Out)
                </div>
              </div>
            </nav>

            <div className="courses-header" style={{ marginBottom: '3rem' }}>
              <div className="courses-header-text">
                <h1 className="auth-title" style={{ fontSize: '2.2rem' }}>
                  {isTeacher ? 'Assignment Management' : 'My Assignments'}
                </h1>
                <p className="auth-subtitle">
                  {isTeacher ? 'Create and monitor class assessments' : 'Complete your interactive quizzes to earn grades'}
                </p>
              </div>
              {isTeacher && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary courses-browse-btn" 
                  style={{ background: '#f59e0b' }}>
                  + Add New Quiz
                </button>
              )}
            </div>

            <div className="courses-grid">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="course-card skeleton-card" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="skeleton-icon" style={{ height: '60px' }}></div>
                    <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
                    <div className="skeleton-line" style={{ width: '100%', height: '12px' }}></div>
                    <div className="skeleton-line" style={{ width: '85%', height: '12px' }}></div>
                  </div>
                ))
              ) : assignments.length > 0 ? (
                assignments.map((a, idx) => (
                  <div key={a.id} className="course-card" style={{ 
                    animationDelay: `${idx * 0.1}s`,
                    borderLeft: `4px solid ${isTeacher ? '#f59e0b' : '#22c55e'}`
                  }}>
                    <div className="course-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>📋</div>
                        <div className="badge" style={{ 
                          background: isTeacher ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                          color: isTeacher ? '#f59e0b' : '#22c55e',
                          fontSize: '0.75rem' 
                        }}>
                          Due: {new Date(a.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="course-card-title">{a.title}</h3>
                      <p className="course-card-desc" style={{ marginBottom: '2rem' }}>
                        {a.description || 'No description provided.'}
                      </p>
                      
                      <div className="course-card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                        {!isTeacher ? (
                          <button 
                            onClick={() => startQuiz(a)}
                            className="btn btn-primary" 
                            style={{ width: '100%', background: '#22c55e', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)' }}
                          >
                            Start Assignment
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <button 
                              onClick={(e) => deleteAssignment(e, a.id)}
                              className="course-drop-btn" 
                              style={{ flex: 1, textAlign: 'center' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="courses-empty">
                  <div className="courses-empty-icon">☕</div>
                  <h3>{isTeacher ? 'No Assignments Created' : 'All caught up!'}</h3>
                  <p>
                    {isTeacher 
                      ? "You haven't created any assignments yet. Create one to test your students." 
                      : "No pending assignments for your courses. Enjoy your free time!"}
                  </p>
                  {isTeacher && (
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ marginTop: '1.5rem', background: '#f59e0b' }}>
                      Create First Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ maxWidth: '700px', margin: '2rem auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="auth-card" style={{ padding: '3.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(30px)' }}>
              {!quizResult ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <span className="role-badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '0.8rem' }}>
                        Question {currentQuestionIndex + 1} of {quizAssignment.questions?.length}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{quizAssignment.title}</span>
                    </div>
                    <button onClick={closeQuiz} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>&times; Cancel</button>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '3rem', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${((currentQuestionIndex + 1) / (quizAssignment.questions?.length || 1)) * 100}%`, 
                      height: '100%', 
                      background: '#22c55e',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>

                  <h2 style={{ fontSize: '1.6rem', marginBottom: '2.5rem', lineHeight: '1.4', fontWeight: '600' }}>
                    {quizAssignment.questions?.[currentQuestionIndex].question}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
                    {quizAssignment.questions?.[currentQuestionIndex].options.map((opt, i) => (
                      <div 
                        key={i}
                        onClick={() => handleAnswerSelect(i)}
                        className="action-btn"
                        style={{ 
                          textAlign: 'left', 
                          padding: '1.2rem', 
                          background: answers[currentQuestionIndex] === i ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.04)',
                          borderColor: answers[currentQuestionIndex] === i ? '#22c55e' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.2rem',
                          borderRadius: '16px'
                        }}
                      >
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          border: '2px solid',
                          borderColor: answers[currentQuestionIndex] === i ? '#22c55e' : 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: '800',
                          color: answers[currentQuestionIndex] === i ? '#22c55e' : '#94a3b8'
                        }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ fontSize: '1.05rem', color: answers[currentQuestionIndex] === i ? 'white' : '#f8fafc' }}>{opt}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {currentQuestionIndex < (quizAssignment.questions?.length || 0) - 1 ? (
                      <button 
                        disabled={answers[currentQuestionIndex] === undefined}
                        onClick={nextQuestion}
                        className="btn btn-primary"
                        style={{ padding: '1rem 3rem', background: '#3b82f6' }}
                      >
                        Next Question &rarr;
                      </button>
                    ) : (
                      <button 
                        disabled={answers[currentQuestionIndex] === undefined || isSubmitting}
                        onClick={submitQuiz}
                        className="btn btn-primary"
                        style={{ width: '100%', background: '#22c55e' }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Finish & Finalize'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.8s ease-out' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🏆</div>
                  <h2 className="auth-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Assignment Complete!</h2>
                  <p className="auth-subtitle" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
                    You've successfully finished the <strong>{quizAssignment.title}</strong> module.
                  </p>
                  
                  <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '3rem', 
                    borderRadius: '24px', 
                    marginBottom: '3rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Score</p>
                    <p style={{ fontSize: '4.5rem', fontWeight: '900', color: '#22c55e', textShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}>{quizResult.score}</p>
                    <div style={{ 
                      marginTop: '1.5rem', 
                      display: 'inline-block',
                      padding: '0.5rem 1.5rem',
                      background: quizResult.correct / quizResult.total >= 0.7 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '999px',
                      color: quizResult.correct / quizResult.total >= 0.7 ? '#4ade80' : '#f87171',
                      fontWeight: '700',
                      border: '1px solid currentColor'
                    }}>
                      {quizResult.correct / quizResult.total >= 0.7 ? "PASSED" : "REVIEW REQUIRED"}
                    </div>
                  </div>

                  <button 
                    onClick={closeQuiz} 
                    className="btn btn-outline" 
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px' }}
                  >
                    Back to Assignments Tracker
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="auth-card" style={{ width: '100%', maxWidth: '500px', background: '#0f172a', padding: '2.5rem', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="auth-title" style={{ fontSize: '1.5rem' }}>Create New Quiz</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddQuiz} className="auth-form">
              <div className="form-group">
                <label>Quiz Title *</label>
                <input type="text" required value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} placeholder="e.g. Advanced React Patterns" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>
              <div className="form-group">
                <label>Select Course *</label>
                <select required value={newQuiz.course_id} onChange={e => setNewQuiz({...newQuiz, course_id: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px' }}>
                  <option value="">-- Choose a Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input type="text" value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} placeholder="Brief overview of the quiz" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1, padding: '0.8rem', background: '#f59e0b' }}>
                  {isCreating ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .courses-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem; }
        .courses-header-text { text-align: left; }
        .courses-browse-btn { padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; white-space: nowrap; }
        .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        
        .course-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.6s ease forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .course-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); }
        
        .course-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
        .course-card-title { font-size: 1.05rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; margin-bottom: 0.6rem; }
        .course-card-desc { font-size: 0.88rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; }
        
        .course-card-footer { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.07); margin-top: auto; }
        
        .course-drop-btn { 
          padding: 0.8rem 1rem; background: rgba(239, 68, 68, 0.08); color: #f87171; 
          border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; 
        }

        .courses-empty { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.02); border-radius: 20px; }
        .courses-empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }

        .skeleton-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .skeleton-icon { height: 80px; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .skeleton-line { height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 768px) {
          .courses-grid { grid-template-columns: 1fr; }
          .courses-header { flex-direction: column; align-items: flex-start; }
          .courses-browse-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </main>
  );
}
