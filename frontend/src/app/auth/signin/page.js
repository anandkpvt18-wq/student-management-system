'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-management-api-b4da.onrender.com';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Invalid credentials');
      } else {
        // Store user info and redirect to dashboard
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="auth-container">
        <Link href="/" className="back-link">&larr; Back to Home</Link>
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-credentials" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <p className="demo-title" style={{ color: '#a78bfa', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DEMO ACCOUNTS</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Student: <code>khushi@gmail.com</code> / <code>student123</code></p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Student: <code>student@school.com</code> / <code>student123</code></p>
          </div>

          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
