'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function BrowseCourses() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchAllCourses() {
      try {
        const res = await fetch(`${API_URL}/courses/all`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setError("Could not load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllCourses();
  }, [router]);

  async function handleEnroll(courseId) {
    setEnrolling(courseId);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/courses/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          user_email: user.email
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Successfully enrolled! You can now see this course in your dashboard.");
        // Optional: remove from list or mark as enrolled
      } else {
        setError(data.detail || "Enrollment failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setEnrolling(null);
    }
  }

  if (!user) return null;

  return (
    <main>
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <Link href="/dashboard/courses" className="nav-logo">&larr; Back to My Courses</Link>
          <div className="role-badge" style={{ background: '#22c55e' }}>Student</div>
        </nav>

        <div className="dashboard-welcome" style={{ textAlign: 'left' }}>
          <h1 className="auth-title">Explore Courses</h1>
          <p className="auth-subtitle">Find and join new academic programs</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="dashboard-grid">
          {loading ? (
            <p>Loading all available courses...</p>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <div key={course.id} className="dash-card">
                <div className="dash-card-icon">📖</div>
                <h3>{course.name}</h3>
                <p className="dash-card-meta" style={{ marginBottom: '1.5rem' }}>{course.description}</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling === course.id}
                >
                  {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ))
          ) : (
            <div className="dash-card dash-card-wide" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="auth-subtitle">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
