'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function StudentRoster() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    if (userData.role !== 'teacher') {
      router.push('/dashboard');
      return;
    }
    setUser(userData);

    async function fetchStudents() {
      try {
        const res = await fetch(`${API_URL}/dashboard/students?user_email=${userData.email}`);
        if (res.ok) {
          setStudents(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) {
      fetchStudents();
    }
  }, [router]);

  if (!user) return null;

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', padding: '2rem' }}>
      <div className="dashboard-container" style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Faculty Portal</Link>
          <div className="role-badge" style={{ background: '#f59e0b' }}>Instructor View</div>
        </nav>

        <div className="dashboard-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 className="auth-title" style={{ 
              background: 'linear-gradient(90deg, #f59e0b, #d97706)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: '3rem'
            }}>Student Roster</h1>
            <p className="auth-subtitle">View and manage all registered students in the system.</p>
          </div>
          <div className="stats-badge" style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.2)', 
            padding: '1.5rem', 
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Total Students</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{students.length}</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Search students by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1.2rem 2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        <div className="auth-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Full Name</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email Address</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Enrolled Courses</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Joined Date</th>
                  <th style={{ padding: '1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                      Loading student roster...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      transition: 'background 0.2s'
                    }}>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {s.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '600' }}>{s.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: '#94a3b8' }}>{s.email}</td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '20px', 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          color: '#3b82f6', 
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {s.enrollment_count} Courses
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', color: '#94a3b8' }}>
                        {new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                      <p className="auth-subtitle">No students found matching "{searchQuery}".</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(245, 158, 11, 0.1);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        tr:hover { background: rgba(255, 255, 255, 0.02); }
      `}</style>
    </main>
  );
}
