'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function GradesPage() {
  const router = useRouter();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        const res = await fetch(`${API_URL}/grades/my/grades?user_email=${userData.email}`);
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

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p className="auth-subtitle">Loading your academic records...</p>
        </div>
      </div>
    );
  }

  return (
    <main style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo">&larr; Back to Dashboard</Link>
          <div className="role-badge" style={{ background: '#22c55e' }}>Student</div>
        </nav>

        <div className="dashboard-welcome" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1 className="auth-title">Academic Performance</h1>
          <p className="auth-subtitle">Track your grades and submission feedback across all courses.</p>
        </div>

        <div className="dash-card dash-card-wide" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1.2rem' }}>Assignment</th>
                <th style={{ padding: '1.2rem' }}>Course</th>
                <th style={{ padding: '1.2rem' }}>Date</th>
                <th style={{ padding: '1.2rem' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? grades.map((g, i) => (
                <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1.2rem' }}>{g.assignment_title}</td>
                  <td style={{ padding: '1.2rem', color: '#94a3b8' }}>{g.course_name}</td>
                  <td style={{ padding: '1.2rem', color: '#94a3b8' }}>{g.submitted_at}</td>
                  <td style={{ padding: '1.2rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '6px', 
                      background: g.grade.startsWith('A') ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                      color: g.grade.startsWith('A') ? '#4ade80' : '#fbbf24',
                      fontWeight: '700'
                    }}>
                      {g.grade}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No graded submissions found. Keep up the good work!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
