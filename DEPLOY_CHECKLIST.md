# PhysioQR Production Final Checklist

Before promoting the application to live traffic, ensure every item is completed:

- [ ] Supabase migrations (`001_initial.sql`, `002_seed_exercises.sql`) executed successfully.
- [ ] Supabase storage buckets (`logos` private, `qrcodes` public) created with correct permissions.
- [ ] Email Authentication enabled in Supabase Providers.
- [ ] Backend (Railway) environment variables configured (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL`).
- [ ] Frontend (Vercel) environment variables configured (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] `FRONTEND_URL` and `ALLOWED_ORIGINS` are correctly mapped back in Railway post-Vercel deploy.
- [ ] CORS explicitly successfully maps to the active Vercel domain during handshake test.
- [ ] **Test Sequence 1:** Registered a new doctor account successfully.
- [ ] **Test Sequence 2:** Created a mock patient.
- [ ] **Test Sequence 3:** Built a prescription schema, ordered exercises, and generated a QR successfully.
- [ ] **Test Sequence 4:** Scanned the generated QR over mobile — validated patient view resolves smoothly.
- [ ] **Test Sequence 5:** QR download PNG and WhatsApp external share links trigger perfectly.
