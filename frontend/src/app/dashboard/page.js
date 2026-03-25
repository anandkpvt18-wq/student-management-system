'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    setUser(JSON.parse(stored));
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
          <p className="auth-subtitle">Here&apos;s your dashboard overview</p>
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
            <div className="dash-card-icon">🎓</div>
            <div className="dash-card-content">
              <h3>Role</h3>
              <span className="role-badge" style={{ background: roleColors[user.role] || '#8b5cf6' }}>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
              </span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">📊</div>
            <div className="dash-card-content">
              <h3>Status</h3>
              <span className="status-indicator">● Active</span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">📅</div>
            <div className="dash-card-content">
              <h3>Session</h3>
              <p className="dash-card-meta">Logged in just now</p>
            </div>
          </div>
        </div>

        <div className="dash-card dash-card-wide">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn">📝 View Courses</button>
            <button className="action-btn">📋 Assignments</button>
            <button className="action-btn">📈 Grades</button>
            <button className="action-btn">⚙️ Settings</button>
          </div>
        </div>
      </div>
    </main>
  );
}
