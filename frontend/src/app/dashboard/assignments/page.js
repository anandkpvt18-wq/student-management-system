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
  const [submittingId, setSubmittingId] = useState(null);
  const [submitUrl, setSubmitUrl] = useState('');

  const handleSubmit = async (taskId) => {
    if (!submitUrl.trim()) return;
    try {
      const res = await fetch(`${API_URL}/assignments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: taskId,
          user_email: user.email,
          content: submitUrl
        })
      });
      if (res.ok) {
        alert('Submitted successfully!');
        setSubmittingId(null);
        setSubmitUrl('');
        // Optimistically remove or update the assignment from the list if desired
        // For now, simple alert and reset is fine.
      } else {
        alert('Failed to submit, try again.');
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please check console.');
    }
  };

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
                  {submittingId === task.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Paste URL or text..." 
                        value={submitUrl}
                        onChange={(e) => setSubmitUrl(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white' }}
                        autoFocus
                      />
                      <button className="action-btn" onClick={() => handleSubmit(task.id)} style={{ padding: '0.5rem 1rem' }}>Send</button>
                      <button onClick={() => setSubmittingId(null)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  ) : (
                    <button className="action-btn" onClick={() => setSubmittingId(task.id)} style={{ width: '100%', justifyContent: 'center' }}>
                      Submit Work
                    </button>
                  )}
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
