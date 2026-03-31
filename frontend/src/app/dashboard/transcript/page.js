'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function TranscriptPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/auth/signin');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);

    async function fetchGrades() {
      try {
        const res = await fetch(`${API_URL}/assignments/grades?user_email=${userData.email}`);
        if (res.ok) {
          const data = await res.json();
          setGrades(data);
        }
      } catch (err) {
        console.error("Failed to fetch grades", err);
      } finally {
        setLoading(false);
      }
    }

    if (userData.email) fetchGrades();
  }, [router]);

  // Group grades by Course
  const groupedTranscript = grades.reduce((acc, g) => {
    if (!acc[g.course_name]) acc[g.course_name] = [];
    acc[g.course_name].push(g);
    return acc;
  }, {});

  if (!user) return null;

  return (
    <main style={{ background: 'var(--bg-gradient)', minHeight: '100vh', padding: '2rem' }}>
      <div className="dashboard-container" style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <nav className="dashboard-nav">
          <Link href="/dashboard" className="nav-logo" style={{ textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
          <button onClick={() => window.print()} className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.2rem' }}>
            🖨️ Print Transcript
          </button>
        </nav>

        <div className="transcript-document" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '4rem',
          color: 'var(--text-main)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #f59e0b, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>Official Transcript</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>Student Management System Academic Record</p>
          </div>

          {/* Student Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</p>
              <p style={{ fontSize: '1.4rem', fontWeight: '700' }}>{user.full_name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Email</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</p>
            </div>
          </div>

          {/* Transcript Data */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loading-spinner"></div>Generating Transcript...</div>
          ) : Object.keys(groupedTranscript).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h3 style={{ color: 'var(--text-muted)' }}>No graded courses on record yet.</h3>
            </div>
          ) : (
            Object.entries(groupedTranscript).map(([course, tasks], idx) => (
              <div key={idx} style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '1.5rem', color: '#60a5fa' }}>
                  {course}
                </h2>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assignment Task</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center', width: '100px' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{t.assignment_title}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'right' }}>{new Date(t.submitted_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '800', color: t.grade.startsWith('A') || parseInt(t.grade) >= 80 ? '#4ade80' : '#a78bfa' }}>
                            {t.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}

          {/* Seal */}
          <div style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.5 }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>End of Official Transcript</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .loading-spinner {
          width: 40px; height: 40px; border: 4px solid rgba(96, 165, 250, 0.1); border-top-color: #60a5fa; border-radius: 50%;
          animation: spin 1s linear infinite; margin: 0 auto 1.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body { background: white; color: black; }
          .dashboard-nav, .dashboard-nav * { display: none !important; }
          .transcript-document { background: transparent !important; border: none !important; box-shadow: none !important; color: black !important; padding: 0 !important; }
          .transcript-document * { color: black !important; text-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}
