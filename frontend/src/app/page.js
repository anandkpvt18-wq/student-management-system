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
    </main>
  );
}
