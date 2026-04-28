# Supabase Database Setup

PhysioQR uses Supabase for PostgreSQL, Storage, and Authentication. Follow these exact steps to set up the production database:

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Run Migrations**: Go to the **SQL Editor**, paste and run the contents of:
   - `backend/migrations/001_initial.sql`
   - `backend/migrations/002_seed_exercises.sql`
3. **Configure Storage**: Go to **Storage**, and create two new buckets:
   - `logos` (keep this **private**)
   - `qrcodes` (set this to **public** so QR PNG URLs are publicly readable by patients)
4. **Enable Authentication**: Go to **Authentication** → **Providers** and ensure **Email** is enabled.
5. **Get Credentials**: Go to **Project Settings** → **API**. Copy the following for your environment files:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key
