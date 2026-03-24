# 📋 Project Tracker — Student Management System

> Master document tracking all finalized steps, decisions, and progress.

---

## Tech Stack Summary

| Layer | Technology | Deployment | Status |
|-------|-----------|------------|--------|
| Frontend | Next.js (HTML/CSS focused) | Vercel | 🔲 Not started |
| Backend | FastAPI (Python) | Render | 🔲 Not started |
| Database | PostgreSQL | Neon | 🔲 Not started |

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

## 🔜 Upcoming Steps

- [ ] Define database schema (tables, relationships)
- [ ] Set up Neon PostgreSQL connection
- [ ] Initialize FastAPI project with dependencies
- [ ] Initialize Next.js project
- [ ] Connect all layers end-to-end
