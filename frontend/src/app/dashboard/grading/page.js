'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function GradingPortal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'graded'

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    if (userData.role !== 'teacher') {
      router.push('/dashboard');
      return;
    }
    setUser(userData);

    async function fetchSubmissions() {
      try {
        const res = await fetch(`${API_URL}/assignments/all-submissions?user_email=${userData.email}`);
        if (res.ok) {
          setSubmissions(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchSubmissions();
    }
  }, [router]);

  const handleUpdateGrade = async (submissionId, newGrade) => {
    if (!newGrade) return;
    setUpdatingId(submissionId);
    try {
      const res = await fetch(`${API_URL}/assignments/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: newGrade })
      });
      if (res.ok) {
        setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, grade: newGrade } : s));
      } else {
        alert('Failed to update grade.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating grade.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) return null;

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'pending') return !s.grade;
    if (filter === 'graded') return !!s.grade;
    return true;
  });

  return (
    <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', padding: '2rem' }}>
      <div className="dashboard-container" style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Faculty Portal</Link>
          <div className="role-badge" style={{ background: '#f59e0b' }}>Instructor View</div>
        </nav>

        <div className="dashboard-welcome" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1 className="auth-title" style={{ 
            background: 'linear-gradient(90deg, #f59e0b, #d97706)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: '3rem'
          }}>Student Grading Portal</h1>
          <p className="auth-subtitle">Review interactive quiz submissions and finalize academic records.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['all', 'pending', 'graded'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                border: '1px solid currentColor',
                background: filter === f ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: filter === f ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {f} Submissions
            </button>
          ))}
        </div>

        <div className="auth-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assignment</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Results (Raw Score)</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Final Grade</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                      Loading student submissions...
                    </td>
                  </tr>
                ) : filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((s, idx) => (
                    <tr key={s.id} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      transition: 'background 0.2s'
                    }}>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{s.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.student_email}</div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ fontWeight: '500' }}>{s.assignment_title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Submitted {new Date(s.submitted_at).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#3b82f6' }}>
                          {s.content}
                        </code>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <select 
                          value={s.grade || ''} 
                          onChange={(e) => handleUpdateGrade(s.id, e.target.value)}
                          disabled={updatingId === s.id}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="">Pending</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="F">F</option>
                        </select>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {s.grade ? (
                            <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>
                          ) : (
                            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>○</span>
                          )}
                          <span style={{ fontSize: '0.85rem', color: s.grade ? '#22c55e' : '#f59e0b', fontWeight: '700' }}>
                            {s.grade ? 'GRADED' : 'PENDING'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                      <p className="auth-subtitle">No submissions found matching your current filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(245, 158, 11, 0.1);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
