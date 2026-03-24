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
          <a href="/auth/signin" className="btn btn-secondary">
            Sign In
          </a>
          <a href="/auth/signup" className="btn btn-primary">
            Get Started Free
          </a>
        </div>
      </section>

      <style jsx>{`
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
      `}</style>
    </main>
  );
}
