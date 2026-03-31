'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

const COURSE_COLORS = [
  { gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', shadow: 'rgba(99, 102, 241, 0.3)' },
  { gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.3)' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245, 158, 11, 0.3)' },
  { gradient: 'linear-gradient(135deg, #ec4899, #db2777)', shadow: 'rgba(236, 72, 153, 0.3)' },
  { gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(59, 130, 246, 0.3)' },
  { gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', shadow: 'rgba(20, 184, 166, 0.3)' },
];

const COURSE_ICONS = ['📚', '💻', '🔬', '📊', '🎨', '⚡', '🧪', '📐', '🌐', '🎯'];

export default function MyCourses() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropping, setDropping] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

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
        const res = await fetch(`${API_URL}/courses/all`);
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

  async function handleDrop(courseId, courseName) {
    if (!confirm(`Are you sure you want to drop "${courseName}"?`)) return;
    setDropping(courseId);
    setAlert({ type: '', message: '' });

    try {
      const res = await fetch(`${API_URL}/courses/unenroll/${courseId}?user_email=${user.email}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setAlert({ type: 'success', message: `Successfully dropped "${courseName}".` });
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      } else {
        setAlert({ type: 'error', message: 'Failed to drop course. Please try again.' });
      }
    } catch (err) {
      console.error('Error dropping course', err);
      setAlert({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setDropping(null);
    }
  }

  if (!user) return null;

  return (
    <main>
      <div className="dashboard-container" style={{ maxWidth: '1100px' }}>
        {/* Navigation */}
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo">← Back to Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="role-badge"
                 style={{ background: '#22c55e', cursor: 'pointer' }}
                 onClick={() => {
                   if(confirm('Do you want to sign out?')) {
                     localStorage.removeItem('user');
                     window.location.href = '/auth/signin';
                   }
                 }}>
              Student (Sign Out)
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="courses-header">
          <div className="courses-header-text">
            <h1 className="auth-title" style={{ fontSize: '2.2rem' }}>My Enrolled Courses</h1>
            <p className="auth-subtitle">Manage your current academic workload</p>
          </div>
          <Link href="/dashboard/courses/browse" className="btn btn-primary courses-browse-btn">
            + Browse New Courses
          </Link>
        </div>

        {/* Alerts */}
        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}
               style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
            {alert.message}
          </div>
        )}

        {/* Course Count Badge */}
        {!loading && courses.length > 0 && (
          <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            <span className="badge" style={{ fontSize: '0.8rem' }}>
              {courses.length} Course{courses.length !== 1 ? 's' : ''} Enrolled
            </span>
          </div>
        )}

        {/* Course Grid */}
        <div className="courses-grid">
          {loading ? (
            /* Skeleton Loading */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="course-card skeleton-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="skeleton-icon"></div>
                <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
                <div className="skeleton-line" style={{ width: '100%', height: '12px' }}></div>
                <div className="skeleton-line" style={{ width: '85%', height: '12px' }}></div>
                <div className="skeleton-line" style={{ width: '40%', height: '36px', marginTop: 'auto' }}></div>
              </div>
            ))
          ) : courses.length > 0 ? (
            courses.map((course, idx) => {
              const color = COURSE_COLORS[idx % COURSE_COLORS.length];
              const icon = COURSE_ICONS[idx % COURSE_ICONS.length];
              return (
                <div key={course.id} className="course-card"
                     style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Color Banner */}
                  <div className="course-card-banner"
                       style={{ background: color.gradient }}>
                    <span className="course-card-banner-icon">{icon}</span>
                  </div>

                  {/* Content */}
                  <div className="course-card-body">
                    <Link href={`/dashboard/courses/${course.id}`}
                          style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                      <h3 className="course-card-title">{course.name}</h3>
                      <p className="course-card-desc">
                        {course.description || 'No description available for this course.'}
                      </p>
                    </Link>

                    {/* Footer */}
                    <div className="course-card-footer">
                      <Link href={`/dashboard/courses/${course.id}`}
                            className="course-view-btn"
                            style={{ '--accent': color.shadow }}>
                        View Details →
                      </Link>
                      <button
                        className="course-drop-btn"
                        onClick={() => handleDrop(course.id, course.name)}
                        disabled={dropping === course.id}
                      >
                        {dropping === course.id ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="drop-spinner"></span> Dropping...
                          </span>
                        ) : 'Drop Course'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="courses-empty">
              <div className="courses-empty-icon">📭</div>
              <h3>No Courses Yet</h3>
              <p>You haven't enrolled in any courses. Browse available courses and start your learning journey!</p>
              <Link href="/dashboard/courses/browse" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ── Header ── */
        .courses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .courses-header-text {
          text-align: left;
        }
        .courses-browse-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        /* ── Grid ── */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        /* ── Course Card ── */
        .course-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.6s ease forwards;
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
        }
        .course-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(139, 92, 246, 0.35);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
        }

        /* Banner */
        .course-card-banner {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .course-card-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.25));
        }
        .course-card-banner-icon {
          font-size: 2.5rem;
          z-index: 1;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        }

        /* Body */
        .course-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .course-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.6rem;
          line-height: 1.3;
        }
        .course-card-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Footer */
        .course-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: auto;
        }

        .course-view-btn {
          font-size: 0.85rem;
          font-weight: 600;
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .course-view-btn:hover {
          color: #c4b5fd;
          transform: translateX(3px);
        }

        .course-drop-btn {
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .course-drop-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }
        .course-drop-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .drop-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(248, 113, 113, 0.3);
          border-top-color: #f87171;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ── Empty State ── */
        .courses-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          animation: fadeIn 0.6s ease;
        }
        .courses-empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }
        .courses-empty h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.75rem;
        }
        .courses-empty p {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Skeleton Loading ── */
        .skeleton-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 240px;
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }
        .skeleton-icon {
          width: 100%;
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .skeleton-line {
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .courses-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .courses-browse-btn {
            width: 100%;
            text-align: center;
          }
          .courses-grid {
            grid-template-columns: 1fr;
          }
          .course-card-banner {
            height: 80px;
          }
          .course-card-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          .course-view-btn,
          .course-drop-btn {
            text-align: center;
            display: block;
          }
        }
        @media (max-width: 480px) {
          .course-card-title {
            font-size: 0.95rem;
          }
          .course-card-desc {
            font-size: 0.82rem;
          }
          .courses-empty {
            padding: 3rem 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
