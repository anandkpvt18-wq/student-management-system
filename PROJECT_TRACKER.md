# 📋 Project Tracker — Student Management System

> Master document tracking all finalized steps, decisions, and progress.

---

## Tech Stack Summary

| Layer | Technology | Deployment | Status |
|-------|-----------|------------|--------|
| Layer | Technology | Deployment | Status |
|-------|-----------|------------|--------|
| Frontend | Next.js (HTML/CSS focused) | [Vercel](https://student-management-frontend.vercel.app) | 🟡 Linked (Manual Connection Needed) |
| Backend | FastAPI (Python) | [Render](https://student-management-api-b4da.onrender.com) | ✅ Active (Auto-deploy set) |
| Database | PostgreSQL | Neon | 🔴 Auth Blocked (Link Required) |

---

## ✅ Finalized Steps

### Step 1 — Project Structure Setup (2026-03-23)

**Decision:** Created the base project structure with three separate folders.

```
student.man/
├── db/                  # Neon PostgreSQL — schema, migrations, seeds
│   └── README.md
├── backend/             # FastAPI on Render — API, models, services
│   └── README.md
├── frontend/            # Next.js on Vercel — pages, components, styles
│   └── README.md
├── PROJECT_TRACKER.md   # This file — tracks all finalized steps
└── .agent/workflows/    # Skills/workflows for each section
    ├── db-setup.md
    ├── backend-setup.md
    └── frontend-setup.md
```

**Rationale:**
- Separate folders keep concerns isolated and allow independent deployment.
- Each section maps to its own deployment target.
- Frontend uses HTML/CSS wherever possible, with minimal JavaScript.

### Step 2 — Git Initialization & GitHub Push (2026-03-23)

**Decision:** Initialized a local Git repository and pushed all project files to GitHub.

**Action:**
- Created `.gitignore` to exclude `token` and sensitive helper scripts.
- Scrubbed hardcoded tokens from validation scripts.
- Pushed clean content to `https://github.com/anandkpvt18-wq/student.man`.

**Outcome:** Source control is now active and synchronized with the cloud.

---

### Step 3 — Index Page & Layer Initialization (2026-03-24)

**Decision:** Developed the core index page and initialized the full-stack architecture with a new GitHub repository.

**Action:**
- **Database:** Defined `users` table schema in `db/schema.sql` and `db/seed.sql`.
- **Backend:** Initialized FastAPI with `auth` routers (Signup/Signin) and SQLAlchemy models.
- **Frontend:** Built a premium landing page using Next.js and Vanilla CSS, focusing on a high-end dark theme.
- **Git:** Created a new repository [`student-management-system`](https://github.com/anandkpvt18-wq/student-management-system) and pushed all code.

**Outcome:** The application foundation is complete with a unified codebase.

---

## 🔜 Upcoming Steps

- [ ] Connect Neon PostgreSQL (Manual project creation/link required)
- [ ] Connect Render Web Service (Manual owner/link check)
- [ ] Connect Vercel Project (Manual GitHub connection required)
- [ ] Implement actual authentication logic (JWT/Sessions)
- [ ] Create Student Dashboard layout

