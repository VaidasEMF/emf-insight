
# EMF Insight — Database Migrations

## Prerequisites

- PostgreSQL database must be configured.
- Environment variables and database connection must be available.
- Run commands from the project root.

## Initial database setup

First, create the application tables and register all SQLAlchemy models:

```powershell
python -c "from backend.db.init_db import init_db; init_db()"
```

## Home Deeper Analysis and Repeat Analysis

After `init_db()` completes successfully, run:

```powershell
python backend/migrate_home_deeper_analysis.py
```

This migration ensures:

- Property and Property Health Record links.
- Measurement Cycle link on Home Deeper Analysis.
- Unique Measurement Cycle to Deeper Analysis relationship.
- Repeat Analysis reservation table.
- Reservation indexes and constraints.

## Measurement Cycle Data verification

The `measurement_cycle_data` table is already registered in SQLAlchemy models and created by `init_db()`.

The following migration is retained for explicit verification or recovery:

```powershell
python backend/migrate_measurement_cycle_data.py
```

## Important

- Do not execute migrations automatically on every application startup.
- Run migrations deliberately against the intended database.
- Verify migration output before deploying the application.
- Never run migrations against production without confirming the active database connection.
