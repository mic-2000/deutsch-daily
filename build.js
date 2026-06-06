const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const files = ['index.html', 'auth.html', 'german_daily_planner.html', 'german_vocab_trainer.html', 'i18n.js'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/https:\/\/YOUR_PROJECT_ID\.supabase\.co/g, url)
    .replace(/YOUR_ANON_KEY/g, key);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`${file} — done`);
});
