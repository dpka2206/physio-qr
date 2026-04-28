# Next.js Frontend Deployment

Deploy the PhysioQR frontend to Vercel via these exact steps:

1. Push your monorepo code to GitHub.
2. Go to [vercel.com](https://vercel.com) → Add New... → **Project** → Import from your GitHub repo.
3. Keep the framework preset to **Next.js**. Wait until prompted to fix root directory if needed, and point it to `frontend`.
4. Add the following required environment variables:
   - `NEXT_PUBLIC_API_URL` (The public URL assigned by Railway for your backend)
   - `NEXT_PUBLIC_SUPABASE_URL` (The Project URL from Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (The anon public key from Supabase)
5. Deploy. Vercel will provide you a URL (e.g., `physioqr.vercel.app`).
6. **IMPORTANT**: Copy this Vercel URL, go back to your **Railway** backend Variables, and set the `FRONTEND_URL` and `ALLOWED_ORIGINS` to precisely match your Vercel URL to unlock CORS completely.
7. Setup a custom domain (like `physioqr.app`) if you have one.
