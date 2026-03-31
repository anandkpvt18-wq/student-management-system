'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function GradesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchGrades() {
      try {
        const res = await fetch(`${API_URL}/assignments/grades?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setGrades(data);
        }
      } catch (err) {
        console.error("Failed to fetch grades", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchGrades();
    }
  }, [router]);

  if (!user) return null;

  return (
    <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', padding: '2rem' }}>
      <div className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
          <div className="role-badge" style={{ background: '#22c55e' }}>Student</div>
        </nav>

        <div className="dashboard-welcome" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1 className="auth-title" style={{ 
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: '3rem'
          }}>Academic Performance</h1>
          <p className="auth-subtitle">Track your grades and submission feedback across all courses.</p>
        </div>

        <div className="auth-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assignment</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Course</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                      Fetching your academic records...
                    </td>
                  </tr>
                ) : grades.length > 0 ? (
                  grades.map((g, idx) => (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      transition: 'background 0.2s',
                      cursor: 'default'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                       onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>{g.assignment_title}</td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{g.course_name}</td>
                      <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(g.submitted_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                        <span className="role-badge" style={{ 
                          background: g.grade.startsWith('A') || parseInt(g.grade) >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                          color: g.grade.startsWith('A') || parseInt(g.grade) >= 80 ? '#4ade80' : '#a78bfa',
                          border: '1px solid currentColor',
                          padding: '0.4rem 1rem',
                          minWidth: '60px',
                          display: 'inline-block',
                          textAlign: 'center',
                          fontWeight: '800'
                        }}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                      <p className="auth-subtitle">No graded submissions found. Keep up the good work!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Grades are updated automatically upon quiz completion. 
            <Link href="/dashboard/assignments" style={{ color: 'var(--primary)', textDecoration: 'none', marginLeft: '0.5rem', fontWeight: '600' }}>
              Take more quizzes &rarr;
            </Link>
          </p>
        </div>
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
