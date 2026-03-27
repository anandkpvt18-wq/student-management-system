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

        <div className="dashboard-welcome" style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1 className="auth-title" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3rem' }}>Explore Courses</h1>
          <p className="auth-subtitle">Elevate your skills with our curated academic programs</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>{success}</div>}

        <div className="dashboard-grid">
          {loading ? (
            <div className="dash-card dash-card-wide" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
              <div className="loading-spinner"></div>
              <p>Fetching the future of your education...</p>
            </div>
          ) : courses.length > 0 ? (
            courses.map((course, idx) => (
              <div key={course.id} className="dash-card" style={{ 
                animation: `slideUp 0.5s ease forwards ${idx * 0.1}s`,
                opacity: 0,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <div className="dash-card-icon" style={{ 
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {idx % 3 === 0 ? '🚀' : idx % 3 === 1 ? '💻' : '📊'}
                </div>
                <h3>{course.name}</h3>
                <p className="dash-card-meta" style={{ minHeight: '80px', marginBottom: '2rem', opacity: 0.8 }}>
                  {course.description || "No description provided for this course."}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <button 
                    className="action-btn" 
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1' }}
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                  >
                    {enrolling === course.id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="spinner-small"></div> Processing...
                      </span>
                    ) : 'Enroll Now'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="dash-card dash-card-wide" style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <p className="auth-subtitle">Our curriculum is growing. Check back soon for new courses!</p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .dash-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </main>
  );
}
