'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ enrolled_courses: 0, active_assignments: 0, notifications: 2 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    // Fetch consolidated dashboard data
    async function fetchDashboardData() {
      try {
        const res = await fetch(`${API_URL}/dashboard/overview?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoadingStats(false);
      }
    }

    if (userData.email) {
      fetchDashboardData();
    }
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem('user');
    router.push('/');
  }

  if (!user) {
    return (
      <main>
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <p className="auth-subtitle">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  const roleColors = {
    admin: '#ef4444',
    teacher: '#f59e0b',
    student: '#22c55e',
  };

  return (
    <main>
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <Link href="/" className="nav-logo">StudentMS</Link>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </nav>

        <div className="dashboard-welcome">
          <h1 className="auth-title">Welcome, {user.full_name}!</h1>
          <p className="auth-subtitle">
            {user.role === 'admin' ? 'System Administrator Overview' : 
             user.role === 'teacher' ? 'Faculty Member Portal' : 
             'Student Academic Dashboard'}
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-icon">👤</div>
            <div className="dash-card-content">
              <h3>Profile</h3>
              <p className="dash-card-value">{user.full_name}</p>
              <p className="dash-card-meta">{user.email}</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">🔔</div>
            <div className="dash-card-content">
              <h3>Academic Progress</h3>
              <p className="dash-card-meta">{stats.graded_count} Graded Tasks</p>
            </div>
          </div>
        </div>

        <div className="dash-card dash-card-wide">
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Academic Actions
          </h3>
          <div className="quick-actions">
            <Link href="/dashboard/courses" className="action-btn" style={{ textDecoration: 'none' }}>📚 My Courses</Link>
            <Link href="/dashboard/assignments" className="action-btn" style={{ textDecoration: 'none' }}>📋 Assignments</Link>
            <Link href="/dashboard/grades" className="action-btn" style={{ textDecoration: 'none' }}>📈 View Grades</Link>
            <Link href="/dashboard/transcript" className="action-btn" style={{ textDecoration: 'none' }}>📜 Transcript</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
