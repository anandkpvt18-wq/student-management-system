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

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchAssignments() {
      try {
        const res = await fetch(`${API_URL}/assignments/my?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchAssignments();
    }
  }, [router]);

  if (!user) return null;

  return (
    <main>
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo">&larr; Back to Dashboard</Link>
          <div className="role-badge" style={{ background: '#22c55e' }}>Student</div>
        </nav>

        <div className="dashboard-welcome" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1 className="auth-title" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Assignments</h1>
          <p className="auth-subtitle">Keep track of your upcoming deadlines and submissions</p>
        </div>

        <div className="dashboard-grid">
          {loading ? (
            <div className="dash-card dash-card-wide" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
              <div className="loading-spinner"></div>
              <p>Fetching your tasks...</p>
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((task, idx) => (
              <div key={task.id} className="dash-card" style={{ 
                animation: `slideUp 0.5s ease forwards ${idx * 0.1}s`,
                opacity: 0,
                borderLeft: '4px solid #f59e0b'
              }}>
                <div className="dash-card-icon">📋</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{task.title}</h3>
                  <span className="role-badge" style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="dash-card-meta">{task.description}</p>
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <button className="action-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Work
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
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(245, 158, 11, 0.1);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
