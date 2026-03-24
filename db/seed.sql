-- Seed data for testing
-- Initialized: 2026-03-24

INSERT INTO users (email, password_hash, full_name, role)
VALUES 
    ('admin@example.com', 'scrypt:32768:8:1$p8s...', 'Admin User', 'admin'),
    ('student@example.com', 'scrypt:32768:8:1$p8s...', 'Student User', 'student')
ON CONFLICT (email) DO NOTHING;
