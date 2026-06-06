/* supabase.js — Supabase client (credentials injected at build time by build.js). */
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
