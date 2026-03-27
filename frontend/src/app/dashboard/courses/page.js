'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function MyCourses() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchCourses() {
      try {
        const res = await fetch(`${API_URL}/courses/enrolled?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchCourses();
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

        <div className="dashboard-welcome" style={{ textAlign: 'left' }}>
          <h1 className="auth-title">My Enrolled Courses</h1>
          <p className="auth-subtitle">Manage your current academic workload</p>
        </div>

        <div className="dashboard-grid">
          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <div key={course.id} className="dash-card">
                <div className="dash-card-icon">📚</div>
                <h3>{course.name}</h3>
                <p className="dash-card-meta">{course.description}</p>
              </div>
            ))
          ) : (
            <div className="dash-card dash-card-wide" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="auth-subtitle">You are not enrolled in any courses yet.</p>
              <Link href="/dashboard/courses/browse" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
