import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="badge">Next Generation Education</div>
        <h1>Elevate Student <br/>Management</h1>
        <p className="description">
          A powerful, intuitive platform designed to streamline administration, 
          track progress, and empower educators and students alike.
        </p>
        <div className="cta-group">
          <Link href="/auth/signin" className="btn btn-secondary">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn btn-primary">
            Get Started Free
          </Link>
        </div>
      </section>

      <style jsx>{`
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8rem 2rem;
          min-height: 80vh;
          justify-content: center;
        }
        .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 9999px;
          color: #a78bfa;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(4px);
        }
        h1 {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .description {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 600px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }
        .cta-group {
          display: flex;
          gap: 1rem;
        }
        .btn {
          padding: 0.75rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.39);
        }
        .btn-primary:hover {
          background: #ea580c;
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}
