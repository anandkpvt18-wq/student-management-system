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

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function initializeCourses() {
      try {
        if (userData.role === 'teacher') {
          // Teachers just fetch their own courses
          const res = await fetch(`${API_URL}/courses/teaching?user_email=${userData.email}`);
          if (res.ok) {
            const data = await res.json();
            setCourses(data);
          }
        } else {
          // Students: Perform Initial Sync Once per User
          const syncKey = `synced_v2_${userData.id}`;
          const alreadySynced = localStorage.getItem(syncKey);

          if (!alreadySynced) {
            console.log("Performing initial course sync...");
            const allRes = await fetch(`${API_URL}/courses/all`);
            const allCourses = allRes.ok ? await allRes.json() : [];

            await Promise.all(
              allCourses.map(course =>
                fetch(`${API_URL}/courses/enroll`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ course_id: course.id, user_email: userData.email })
                }).catch(() => {})
              )
            );
            localStorage.setItem(syncKey, 'true');
          }

          // Fetch currently enrolled courses
          const enrolledRes = await fetch(`${API_URL}/courses/enrolled?user_email=${userData.email}`);
          if (enrolledRes.ok) {
            const data = await enrolledRes.json();
            setCourses(data);
          }
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        setAlert({ type: 'error', message: 'Failed to connect to the server.' });
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      initializeCourses();
    }
  }, [router]);

  async function handleAction(courseId, courseName) {
    const isTeacher = user.role === 'teacher';
    const actionText = isTeacher ? 'delete' : 'drop';
    
    if (!confirm(`Are you sure you want to ${actionText} "${courseName}"?`)) return;
    
    setActionInProgress(courseId);
    setAlert({ type: '', message: '' });

    try {
      const endpoint = isTeacher 
        ? `${API_URL}/courses/${courseId}?user_email=${user.email}`
        : `${API_URL}/courses/unenroll/${courseId}?user_email=${user.email}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setAlert({ type: 'success', message: `Successfully ${actionText}ed "${courseName}".` });
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      } else {
        setAlert({ type: 'error', message: data.detail || `Failed to ${actionText} course.` });
      }
    } catch (err) {
      console.error('Error during course action', err);
      setAlert({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setActionInProgress(null);
    }
  }

  if (!user) return null;

  const isTeacher = user.role === 'teacher';

  return (
    <main>
      <div className="dashboard-container" style={{ maxWidth: '1100px' }}>
        {/* Navigation */}
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo">← Back to Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="role-badge"
                 style={{ background: isTeacher ? '#f59e0b' : '#22c55e', cursor: 'pointer', textTransform: 'capitalize' }}
                 onClick={() => {
                   if(confirm('Do you want to sign out?')) {
                     localStorage.removeItem('user');
                     window.location.href = '/auth/signin';
                   }
                 }}>
              {user.role} (Sign Out)
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="courses-header">
          <div className="courses-header-text">
            <h1 className="auth-title" style={{ fontSize: '2.2rem' }}>
              {isTeacher ? 'Course Management' : 'My Enrolled Courses'}
            </h1>
            <p className="auth-subtitle">
              {isTeacher ? 'Manage and monitor your curriculum' : 'Manage your current academic workload'}
            </p>
          </div>
          {isTeacher ? (
            <Link href="/dashboard/courses/create" className="btn btn-primary courses-browse-btn" style={{ background: '#f59e0b' }}>
              + Create New Course
            </Link>
          ) : (
            <Link href="/dashboard/courses/browse" className="btn btn-primary courses-browse-btn">
              + Browse New Courses
            </Link>
          )}
        </div>

        {/* Alerts */}
        {alert.message && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}
               style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
            {alert.message}
          </div>
        )}

        {/* Count Badge */}
        {!loading && courses.length > 0 && (
          <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            <span className="badge" style={{ fontSize: '0.8rem', background: isTeacher ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)', color: isTeacher ? '#f59e0b' : '#a78bfa' }}>
              {courses.length} Course{courses.length !== 1 ? 's' : ''} {isTeacher ? 'Teaching' : 'Enrolled'}
            </span>
          </div>
        )}

        {/* Course Grid */}
        <div className="courses-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="course-card skeleton-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="skeleton-icon"></div>
                <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
                <div className="skeleton-line" style={{ width: '100%', height: '12px' }}></div>
                <div className="skeleton-line" style={{ width: '85%', height: '12px' }}></div>
              </div>
            ))
          ) : courses.length > 0 ? (
            courses.map((course, idx) => {
              const color = COURSE_COLORS[idx % COURSE_COLORS.length];
              const icon = COURSE_ICONS[idx % COURSE_ICONS.length];
              return (
                <div key={course.id} className="course-card"
                     style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="course-card-banner"
                       style={{ background: color.gradient }}>
                    <span className="course-card-banner-icon">{icon}</span>
                  </div>

                  <div className="course-card-body">
                    <Link href={`/dashboard/courses/${course.id}`}
                          style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                      <h3 className="course-card-title">{course.name}</h3>
                      <p className="course-card-desc">
                        {course.description || 'No description available for this course.'}
                      </p>
                    </Link>

                    <div className="course-card-footer">
                      <Link href={`/dashboard/courses/${course.id}`}
                            className="course-view-btn"
                            style={{ color: isTeacher ? '#f59e0b' : '#a78bfa' }}>
                        {isTeacher ? 'Manage Class →' : 'View Details →'}
                      </Link>
                      <button
                        className="course-drop-btn"
                        style={isTeacher ? { color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' } : {}}
                        onClick={() => handleAction(course.id, course.name)}
                        disabled={actionInProgress === course.id}
                      >
                        {actionInProgress === course.id ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="drop-spinner"></span> {isTeacher ? 'Deleting...' : 'Dropping...'}
                          </span>
                        ) : (isTeacher ? 'Delete Course' : 'Drop Course')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="courses-empty">
              <div className="courses-empty-icon">{isTeacher ? '👨‍🏫' : '📭'}</div>
              <h3>{isTeacher ? 'No Courses Created' : 'No Enrolled Courses'}</h3>
              <p>
                {isTeacher 
                  ? "You haven't started teaching any courses yet. Start your faculty journey today!" 
                  : "You haven't joined any courses yet. Browse available courses and start learning!"}
              </p>
              {isTeacher ? (
                <Link href="/dashboard/courses/create" className="btn btn-primary" style={{ marginTop: '1.5rem', background: '#f59e0b' }}>
                  Create First Course
                </Link>
              ) : (
                <Link href="/dashboard/courses/browse" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                  Browse Courses
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .courses-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem; }
        .courses-header-text { text-align: left; }
        .courses-browse-btn { padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; white-space: nowrap; }
        .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        
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
          transition: all 0.3s ease;
        }
        .course-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); }
        
        .course-card-banner { height: 100px; display: flex; align-items: center; justify-content: center; position: relative; }
        .course-card-banner-icon { font-size: 2.5rem; z-index: 1; }
        
        .course-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
        .course-card-title { font-size: 1.05rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; margin-bottom: 0.6rem; }
        .course-card-desc { font-size: 0.88rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; }
        
        .course-card-footer { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.07); }
        .course-view-btn { font-size: 0.85rem; font-weight: 600; text-decoration: none; }
        
        .course-drop-btn { 
          padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.08); color: #f87171; 
          border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; 
        }

        .courses-empty { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.02); border-radius: 20px; }
        .courses-empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }

        .skeleton-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .skeleton-icon { height: 80px; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .skeleton-line { height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 768px) {
          .courses-grid { grid-template-columns: 1fr; }
          .courses-header { flex-direction: column; align-items: flex-start; }
          .courses-browse-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </main>
  );
}
