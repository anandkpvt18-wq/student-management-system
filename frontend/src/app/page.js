import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* Decorative Background Elements */}
      <div className="bg-glow glow-top-left"></div>
      <div className="bg-glow glow-bottom-right"></div>
      
      <main className="home-main">
        <section className="hero">
          <div className="badge pulse">Next Generation Education</div>
          <h1 className="hero-title">
            Elevate Student <br />
            <span className="text-gradient">Management</span>
          </h1>
          <p className="description slide-up">
            A powerful, intuitive platform designed to streamline your learning, 
            track your progress, and empower your academic journey.
          </p>
          <div className="cta-group slide-up-delay">
            <Link href="/auth/signup" className="btn btn-primary btn-glow">
              Get Started Free
            </Link>
            <Link href="/auth/signin" className="btn btn-secondary btn-outline">
              Sign In
            </Link>
          </div>
        </section>

        <section className="features-section">
          <div className="feature-card fade-in">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3>Real-Time Tracking</h3>
            <p>Monitor student progress with instantly updated dashboards and analytics.</p>
          </div>
          <div className="feature-card fade-in delay-1">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3>Personal Progress</h3>
            <p>Enterprise-grade security ensuring your academic data is private, secure, and always accessible.</p>
          </div>
          <div className="feature-card fade-in delay-2">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Data Analytics</h3>
            <p>Actionable insights derived from comprehensive performance and behavior data.</p>
          </div>
        </section>
        
        <footer className="home-footer">
          <p className="stats slide-up-delay-2">Trusted by <span className="highlight">10,000+</span> students globally</p>
        </footer>
      </main>
    </div>
  );
}
