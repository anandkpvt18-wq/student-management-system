---
description: How to set up and manage the Neon PostgreSQL database layer
---

# Database Setup — Neon PostgreSQL

## Prerequisites
- Neon account ([neon.tech](https://neon.tech))
- Connection string from Neon dashboard

## Steps

### 1. Create a Neon Project
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)

### 2. Store Connection Config
1. Create `db/config.py` with the connection string (use env vars, never hardcode secrets)
2. Create a `.env` file at the project root with `DATABASE_URL=<your_connection_string>`

### 3. Define Schema
1. Create SQL migration files in `db/migrations/`
2. Define table schemas in `db/schema.sql`
3. Use `db/seed.sql` for initial test data

### 4. Test Connection
```bash
# From backend folder, test the connection
python -c "from db.config import get_db_url; print(get_db_url())"
```

## File Structure
```
db/
├── README.md
├── config.py          # Connection config (reads from .env)
├── schema.sql         # Full schema DDL
├── seed.sql           # Seed/test data
└── migrations/        # Versioned migration scripts
    ├── 001_initial.sql
    └── ...
```

## Notes
- Always use `sslmode=require` for Neon connections
- Use connection pooling for production (Neon provides pooled endpoints)
- Keep migration files numbered sequentially
