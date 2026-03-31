'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function CreateCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    if (userData.role !== 'teacher') {
      alert("Only teachers can access this page.");
      router.push('/dashboard/courses');
      return;
    }
    setUser(userData);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Course Name is required");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          user_email: user.email
        })
      });

      if (res.ok) {
        router.push('/dashboard/courses');
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to create course');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <nav className="dashboard-nav" style={{ marginBottom: '3rem' }}>
          <Link href="/dashboard/courses" className="nav-logo">← Back to Courses</Link>
          <div className="role-badge" style={{ background: '#f59e0b', textTransform: 'capitalize' }}>
            {user.role}
          </div>
        </nav>

        {/* Content */}
        <div className="auth-card" style={{ padding: '3rem', animation: 'slideUp 0.6s ease forwards' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
            <h1 className="auth-title" style={{ fontSize: '2.2rem' }}>Create New Course</h1>
            <p className="auth-subtitle">Add a new curriculum offering for your students</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="name" style={{ fontWeight: '600', color: '#f8fafc' }}>Course Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Advanced Data Structures"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '1rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" style={{ fontWeight: '600', color: '#f8fafc' }}>Description (Optional)</label>
              <textarea
                id="description"
                placeholder="Briefly describe what students will learn..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '1rem',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  color: 'white',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link href="/dashboard/courses" className="btn btn-outline" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ 
                  flex: 2, 
                  background: '#f59e0b', 
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                  padding: '1rem',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
