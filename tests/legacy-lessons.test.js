/* tests/legacy-lessons.test.js — hide legacy AI lessons after a v1→v2 reset
 * (curriculum-redesign-2026-07-v2.md §2 "Lessons Policy" / §12 Gate 6 / §14 Progress).
 *
 * A v1→v2 cutover keeps the old `lessons` rows in the DB, but they are keyed to the OLD day/week
 * numbers (weekly summaries live under negative days). Surfacing them under the unrelated new days
 * would be wrong, so cloud-sync.loadLessonsFromCloud drops every row written BEFORE the reset
 * (updated_at < planner_data.migratedFrom.at). Native / never-migrated accounts keep everything.
 *
 * cloud-sync.js is on the harness denylist (heavy side effects), so — like course-v2-cutover.test.js —
 * we load it directly into a vm sandbox with the Supabase client + browser globals shimmed.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { ROOT } = require('./harness');

/* Load cloud-sync.js into a sandbox. `lessonRows` is what the shimmed `lessons` table returns.
   Exposes the internals under test (_hideLegacyLessons / _noteMigratedAt / loadLessonsFromCloud)
   plus a setter for the module-level currentUser. */
function loadCloudSync(lessonRows) {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/cloud-sync.js'), 'utf8');
  const sb = {
    window: { addEventListener() {} },
    document: { addEventListener() {} },
    navigator: { onLine: true },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout() {}, clearTimeout() {},
    sb: {
      auth: {},
      from(table) {
        return {
          select() { return this; },
          eq() { return Promise.resolve({ data: table === 'lessons' ? (lessonRows || []) : [], error: null }); },
        };
      },
    },
    showToast() {},
  };
  vm.createContext(sb);
  vm.runInContext(src +
    '\n;this.__hide = _hideLegacyLessons;' +
    '\n;this.__note = _noteMigratedAt;' +
    '\n;this.__load = loadLessonsFromCloud;' +
    '\n;this.__setUser = (u) => { currentUser = u; };', sb);
  return sb;
}

/* Pull day numbers into a THIS-realm array (avoids deepStrictEqual's cross-realm prototype check). */
const days = (rows) => Array.from(rows, (r) => r.day);

test('_hideLegacyLessons keeps every row when the account was never migrated', () => {
  const env = loadCloudSync();
  env.__note({});                                  // no migratedFrom → _migratedAt stays null
  const rows = [{ day: 1, messages: [], updated_at: '2020-01-01T00:00:00.000Z' }];
  assert.equal(env.__hide(rows), rows, 'same array back, nothing filtered');
});

test('_hideLegacyLessons drops pre-reset lessons AND weekly summaries, keeps the rest', () => {
  const env = loadCloudSync();
  env.__note({ migratedFrom: { at: '2026-07-10T12:00:00.000Z' } });
  const rows = [
    { day: 40, messages: ['old'],        updated_at: '2026-06-01T00:00:00.000Z' }, // legacy lesson
    { day: -3, messages: ['old summary'],updated_at: '2026-05-01T00:00:00.000Z' }, // legacy weekly summary (negative day)
    { day: 1,  messages: ['new'],        updated_at: '2026-07-11T00:00:00.000Z' }, // written after the reset
    { day: 2,  messages: ['edge'],       updated_at: '2026-07-10T12:00:00.000Z' }, // exactly at the reset → kept (>=)
    { day: 3,  messages: ['nodate'] },                                             // no updated_at → can't prove legacy, kept
  ];
  assert.deepEqual(days(env.__hide(rows)), [1, 2, 3], 'only post-reset / undatable rows survive');
});

test('loadLessonsFromCloud hides legacy rows for a migrated account (both surfaces read through it)', async () => {
  const rows = [
    { day: 40, messages: ['old'],         updated_at: '2026-06-01T00:00:00.000Z' },
    { day: -2, messages: ['old summary'], updated_at: '2026-06-02T00:00:00.000Z' },
    { day: 1,  messages: ['fresh'],       updated_at: '2026-07-11T00:00:00.000Z' },
  ];
  const env = loadCloudSync(rows);
  env.__setUser({ id: 'u1' });
  env.__note({ migratedFrom: { at: '2026-07-10T00:00:00.000Z' } });
  const out = await env.__load();
  assert.deepEqual(days(out), [1], 'the new day view sees only the fresh lesson');
});

test('loadLessonsFromCloud returns all rows for a never-migrated account', async () => {
  const rows = [
    { day: 40, messages: ['a'], updated_at: '2026-06-01T00:00:00.000Z' },
    { day: 1,  messages: ['b'], updated_at: '2026-07-11T00:00:00.000Z' },
  ];
  const env = loadCloudSync(rows);
  env.__setUser({ id: 'u1' });
  env.__note({});                                  // never migrated
  const out = await env.__load();
  assert.deepEqual(days(out).sort((a, b) => a - b), [1, 40], 'nothing hidden');
});
