/* tests/refactor-guards.test.js — source-level guards for the INTENTIONAL changes in the plan.
 *
 *  ⚠️  These are RED on today's code and turn GREEN as the refactor lands. They encode the
 *      acceptance criteria for:
 *        • Phase 2 — trainer end/spelling screens use T() instead of hardcoded Russian
 *        • Phase 4 — orphaned locale keys removed; <html lang> no longer hardcoded to "ru"
 *
 *  Run the rest of the suite for the "nothing broke" regression net; treat the failures here
 *  as a to-do checklist while refactoring.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- Phase 2: no hardcoded Russian in the trainer session UI ---------- */
test('[Phase 2] vocab.html renderSpelling/renderEnd contain no hardcoded Russian strings', () => {
  const src = read('vocab.html');
  const offenders = [
    'Напиши по-немецки',
    'Тренировка завершена',
    'Безупречно! Все слова с первого раза.',
    'Отличный результат!',
    'Неплохо — слова с ошибками вернутся раньше.',
    'Эти слова ещё в работе. Они скоро повторятся.',
    'Проверить',
    'Дальше →',
  ];
  const found = offenders.filter((s) => src.includes(s));
  assert.deepEqual(found, [], 'these literals should be replaced by T(...) keys');
});

/* ---------- Phase 4: orphaned locale keys removed ---------- */
const DEAD_KEYS = [
  'settings_create_file', 'settings_open_file', 'settings_auto_on', 'settings_sync_hint',
  'toast_sync_created', 'toast_sync_opened', 'toast_sync_unavailable', 'toast_file_corrupt',
];

test('[Phase 4] orphaned locale keys are removed from all locales', () => {
  for (const f of ['locales/en.js', 'locales/ru.js', 'locales/ua.js']) {
    const src = read(f);
    const still = DEAD_KEYS.filter((k) => new RegExp('\\b' + k + '\\s*:').test(src));
    assert.deepEqual(still, [], `${f} still defines dead keys`);
  }
});

test('[Phase 4] orphaned keys are not referenced via T() anywhere', () => {
  const pages = ['planner.html', 'vocab.html', 'verbs.html', 'index.html'];
  for (const p of pages) {
    const src = read(p);
    const used = DEAD_KEYS.filter((k) => src.includes(`T('${k}'`) || src.includes(`T("${k}"`));
    assert.deepEqual(used, [], `${p} still references a dead key`);
  }
});

/* ---------- Phase 4: <html lang> no longer hardcoded to ru ---------- */
test('[Phase 4] no page hardcodes <html lang="ru">', () => {
  for (const p of ['planner.html', 'vocab.html', 'verbs.html', 'index.html', 'auth.html']) {
    const src = read(p);
    assert.ok(!/<html[^>]*\blang="ru"/.test(src), `${p} hardcodes lang="ru"`);
  }
});
