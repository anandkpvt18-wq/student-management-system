'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function MyAssignments() {
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
        const [assigRes, coursesRes] = await Promise.all([
          fetch(`${API_URL}/assignments/my?user_email=${userData.email}`),
          fetch(`${API_URL}/courses/enrolled?user_email=${userData.email}`)
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
          due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()
        })
      });
      if (res.ok) {
        const created = await res.json();
        setAssignments([...assignments, created]);
        setIsAddModalOpen(false);
        setNewQuiz({ title: '', description: '', course_id: '' });
      } else {
        alert("Failed to create quiz.");
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
    // Calculate Score
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

  if (!user) return null;

  return (
    <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', padding: '2rem' }}>
      <div className="dashboard-container">
        {!quizAssignment ? (
          <>
            <nav className="dashboard-nav">
              <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="role-badge" 
                     style={{ background: '#22c55e', cursor: 'pointer' }}
                     onClick={() => {
                       if(confirm('Do you want to sign out?')) {
                         localStorage.removeItem('user');
                         router.push('/auth/signin');
                       }
                     }}>
                  Student (Sign Out)
                </div>
              </div>
            </nav>

            <div className="dashboard-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <div>
                <h1 className="auth-title" style={{ 
                  background: 'linear-gradient(90deg, #f59e0b, #ef4444)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontSize: '3rem'
                }}>My Assignments</h1>
                <p className="auth-subtitle">Complete your interactive quizzes to earn grades</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary" 
                style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                + Add New Quiz
              </button>
            </div>

            {loading ? (
              <div className="dash-card dash-card-wide" style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div className="loading-spinner"></div>
                <p>Fetching your interactive tasks...</p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {assignments.length > 0 ? (
                  assignments.map((a, idx) => (
                    <div key={a.id} className="dash-card" style={{ 
                      animation: `slideUp 0.5s ease forwards ${idx * 0.1}s`,
                      opacity: 0,
                      borderLeft: '4px solid #f59e0b',
                      display: 'flex', flexDirection: 'column', height: '100%',
                      padding: '2rem'
                    }}>
                      <div className="dash-card-icon">📋</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>{a.title}</h3>
                        <div className="badge" style={{ 
                          margin: 0, 
                          padding: '0.2rem 0.6rem', 
                          fontSize: '0.75rem', 
                          background: 'rgba(249, 115, 22, 0.1)', 
                          borderColor: 'rgba(249, 115, 22, 0.3)', 
                          color: '#fb923c' 
                        }}>
                          Due: {new Date(a.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="dash-card-meta" style={{ flex: 1, marginBottom: '2rem', fontSize: '0.95rem' }}>{a.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '1.5rem' }}>
                        <button 
                          onClick={() => startQuiz(a)}
                          className="btn btn-primary" 
                          style={{ flex: '1 1 120px', padding: '1rem', fontSize: '1rem', fontWeight: '700', minWidth: '120px' }}
                        >
                          Start Assignment
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            if (confirm('Delete this assignment permanently?')) {
                              try {
                                const res = await fetch(`${API_URL}/assignments/${a.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setAssignments(assignments.filter(item => item.id !== a.id));
                                } else {
                                  alert('Failed to delete assignment.');
                                }
                              } catch (err) {
                                console.error('Error deleting assignment', err);
                              }
                            }
                          }}
                          className="btn btn-secondary" 
                          style={{ flex: '1 1 80px', padding: '0.8rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', boxShadow: 'none', minWidth: '80px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dash-card dash-card-wide" style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>☕</div>
                    <p className="auth-subtitle">All caught up! No pending assignments for your courses.</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ maxWidth: '700px', margin: '2rem auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="auth-card" style={{ padding: '3.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(30px)' }}>
              {!quizResult ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <span className="role-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.8rem' }}>
                        Question {currentQuestionIndex + 1} of {quizAssignment.questions?.length}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{quizAssignment.title}</span>
                    </div>
                    <button onClick={closeQuiz} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>&times; Cancel</button>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '3rem', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${((currentQuestionIndex + 1) / (quizAssignment.questions?.length || 1)) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                      transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
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
                          padding: '1.4rem', 
                          background: answers[currentQuestionIndex] === i ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                          borderColor: answers[currentQuestionIndex] === i ? '#f59e0b' : 'rgba(255,255,255,0.1)',
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
                          borderColor: answers[currentQuestionIndex] === i ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: '800',
                          color: answers[currentQuestionIndex] === i ? '#f59e0b' : 'var(--text-muted)'
                        }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ fontSize: '1.05rem', color: answers[currentQuestionIndex] === i ? 'white' : 'var(--text-main)' }}>{opt}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {currentQuestionIndex < (quizAssignment.questions?.length || 0) - 1 ? (
                      <button 
                        disabled={answers[currentQuestionIndex] === undefined}
                        onClick={nextQuestion}
                        className="btn btn-primary"
                        style={{ padding: '1rem 3rem' }}
                      >
                        Next Question &rarr;
                      </button>
                    ) : (
                      <button 
                        disabled={answers[currentQuestionIndex] === undefined || isSubmitting}
                        onClick={submitQuiz}
                        className="btn btn-primary pulse"
                        style={{ width: '100%', background: '#22c55e', border: 'none', boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
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
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Score</p>
                    <p style={{ fontSize: '4.5rem', fontWeight: '900', color: '#f59e0b', textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>{quizResult.score}</p>
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
      <style jsx>{`
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(245, 158, 11, 0.1);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="auth-card" style={{ width: '100%', maxWidth: '500px', background: '#1e1b4b', padding: '2.5rem', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create New Quiz</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddQuiz} className="auth-form">
              <div className="form-group">
                <label>Quiz Title *</label>
                <input type="text" required value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} placeholder="e.g. Advanced React Patterns" />
              </div>
              <div className="form-group">
                <label>Select Course *</label>
                <select required value={newQuiz.course_id} onChange={e => setNewQuiz({...newQuiz, course_id: e.target.value})}>
                  <option value="">-- Choose a Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input type="text" value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} placeholder="Brief overview of the quiz" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1, padding: '0.8rem', background: '#f59e0b', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}>
                  {isCreating ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
