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

    // Fetch stats
    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/courses/my?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoadingStats(false);
      }
    }

    if (userData.email) {
      fetchStats();
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
            <div className="dash-card-icon">🎓</div>
            <div className="dash-card-content">
              <h3>Role</h3>
              <span className="role-badge" style={{ background: roleColors[user.role] || '#8b5cf6' }}>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
              </span>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">
              {user.role === 'admin' ? '🔒' : user.role === 'teacher' ? '📚' : '📖'}
            </div>
            <div className="dash-card-content">
              <h3>
                {user.role === 'admin' ? 'Security' : user.role === 'teacher' ? 'Classes' : 'Courses'}
              </h3>
              <p className="dash-card-value">
                {user.role === 'admin' ? 'System Active' : 
                 user.role === 'teacher' ? '4 Active' : 
                 `${stats.enrolled_courses} Enrolled`}
              </p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-icon">🔔</div>
            <div className="dash-card-content">
              <h3>Notifications</h3>
              <p className="dash-card-meta">{stats.notifications} New Updates</p>
            </div>
          </div>
        </div>

        <div className="dash-card dash-card-wide">
          <h3>
            {user.role === 'admin' ? 'Administrative Controls' : 
             user.role === 'teacher' ? 'Classroom Management' : 
             'Academic Actions'}
          </h3>
          <div className="quick-actions">
            {user.role === 'admin' ? (
              <>
                <button className="action-btn">👥 Manage Users</button>
                <button className="action-btn">🛡️ System Logs</button>
                <button className="action-btn">⚙️ Settings</button>
                <button className="action-btn">📊 Reports</button>
              </>
            ) : user.role === 'teacher' ? (
              <>
                <button className="action-btn">📝 Gradebook</button>
                <button className="action-btn">📅 Schedule</button>
                <button className="action-btn">📤 Material</button>
                <button className="action-btn">💬 Messages</button>
              </>
            ) : (
              <>
                <Link href="/dashboard/courses" className="action-btn" style={{ textDecoration: 'none' }}>📚 My Courses</Link>
                <button className="action-btn">📋 Assignments</button>
                <button className="action-btn">📈 View Grades</button>
                <button className="action-btn">📜 Transcript</button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
