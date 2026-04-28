// Validate essential frontend environments at load
export const ENV = {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

if (!ENV.API_URL) {
    throw new Error("CRITICAL STARTUP ERROR: NEXT_PUBLIC_API_URL is missing! Ensure Vercel environment variables are set correctly.");
}
