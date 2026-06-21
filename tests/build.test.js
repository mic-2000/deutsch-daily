/* tests/build.test.js — guards the deploy-time injections in build.js.
 *
 * build.js can't be require()'d here (it exits when the Supabase env vars are absent and
 * rewrites real files), so these are source-level contract checks: the placeholders /
 * VERSION line that build.js targets must keep existing, or a deploy would silently skip an
 * injection. The actual replacement regex is exercised below against the real sw.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('build.js still injects the Supabase placeholders', () => {
  const b = read('build.js');
  assert.match(b, /YOUR_PROJECT_ID/, 'targets the project-id placeholder');
  assert.match(b, /YOUR_ANON_KEY/, 'targets the anon-key placeholder');
});

test('build.js stamps the sw.js cache VERSION per deploy', () => {
  const b = read('build.js');
  assert.match(b, /VERCEL_GIT_COMMIT_SHA/, 'uses the commit SHA when available');
  assert.match(b, /const VERSION = '\$\{swVersion\}';/, 'writes the new VERSION line');
});

test('sw.js exposes a single-quoted VERSION line that build.js can rewrite', () => {
  const sw = read('sw.js');
  assert.match(sw, /const VERSION = '[^']*';/, 'VERSION line shape matches build.js regex');
  // and the regex build.js uses actually flips the value:
  const stamped = sw.replace(/const VERSION = '[^']*';/, "const VERSION = 'deadbeef-202601010000';");
  assert.notEqual(stamped, sw, 'build.js regex matches and replaces');
  assert.match(stamped, /const VERSION = 'deadbeef-202601010000';/);
});
