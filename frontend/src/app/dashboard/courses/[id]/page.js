'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function CourseDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }

    async function fetchCourse() {
      try {
        const res = await fetch(`${API_URL}/courses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (err) {
        console.error("Failed to fetch course details", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchCourse();
    }
  }, [params.id, router]);

  if (loading) return (
    <main>
      <div className="dashboard-container">
        <p>Loading course content...</p>
      </div>
    </main>
  );

  if (!course) return (
    <main>
      <div className="dashboard-container">
        <p>Course not found.</p>
        <Link href="/dashboard/courses">Go Back</Link>
      </div>
    </main>
  );

  return (
    <main>
      <div className="dashboard-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <nav className="dashboard-nav">
          <Link href="/dashboard/courses" className="nav-logo">&larr; Back to My Courses</Link>
        </nav>

        <div className="course-hero">
          <div className="dash-card-icon" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📚</div>
          <h1 className="auth-title" style={{ marginBottom: '1rem' }}>{course.name}</h1>
          <p className="auth-subtitle" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>{course.description}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card dash-card-wide">
            <h3>Course Overview</h3>
            <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
              Welcome to <strong>{course.name}</strong>. This course covers the fundamental principles and advanced techniques 
              required to master the subject. Explore the modules below to begin your learning journey.
            </p>
          </div>
          
          {/* Modules Placeholder */}
          <div className="dash-card">
            <div className="dash-card-icon">📖</div>
            <h3>Module 1: Foundations</h3>
            <p className="dash-card-meta">Introduction to core concepts and industry standards.</p>
          </div>
          <div className="dash-card" style={{ opacity: 0.7 }}>
            <div className="dash-card-icon">🔒</div>
            <h3>Module 2: Advanced Techniques</h3>
            <p className="dash-card-meta">Mastering complex workflows and optimization.</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/dashboard/assignments" className="btn btn-primary">
            View Related Assignments
          </Link>
        </div>
      </div>
    </main>
  );
}
