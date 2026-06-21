const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const files = ['assets/js/supabase.js'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/https:\/\/YOUR_PROJECT_ID\.supabase\.co/g, url)
    .replace(/YOUR_ANON_KEY/g, key);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`${file} — done`);
});

// Stamp the service-worker cache version so EVERY deploy busts the old shell cache
// automatically — no manual VERSION bump needed. The stamp is monotonic (build time, so it
// always increases per deploy, like a counter) and carries the commit SHA when Vercel
// provides one, for traceability. The committed sw.js keeps a static VERSION for local dev;
// this only rewrites it in the deployed copy (same pattern as the supabase.js injection).
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 8);
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12); // UTC YYYYMMDDHHMM
const swVersion = (sha ? sha + '-' : '') + stamp;
{
  const swFile = 'sw.js';
  const before = fs.readFileSync(swFile, 'utf8');
  const after = before.replace(/const VERSION = '[^']*';/, `const VERSION = '${swVersion}';`);
  if (after === before) {
    console.warn(`${swFile} — WARNING: VERSION line not found; cache-busting NOT applied`);
  } else {
    fs.writeFileSync(swFile, after, 'utf8');
    console.log(`${swFile} — VERSION = ${swVersion}`);
  }
}
