# FastAPI Backend Deployment

Deploy the PhysioQR backend to Railway via these exact steps:

1. Push your monorepo code to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**.
3. Select this repository and set the **root directory** to `/backend`.
4. Go to the service **Variables**, and set the following required environment variables:
   - `SUPABASE_URL` (from Supabase)
   - `SUPABASE_SERVICE_KEY` (from Supabase service role key)
   - `FRONTEND_URL` (the Vercel URL you will get, or temporarily generic `*` or `http://localhost:3000`)
   - `ALLOWED_ORIGINS` (comma separated values like `https://physioqr.vercel.app,http://localhost:3000`)
5. Deploy. Railway assigns a public URL. **Copy it**. You will need it for the Next.js `NEXT_PUBLIC_API_URL` variable.
