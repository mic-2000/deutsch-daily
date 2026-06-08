/* tests/speech.test.js — text-to-speech (Web Speech API) behaviour.
 * The plan extracts GERMAN_VOICE / pickVoice() / speak() into assets/js/speech.js, keeping
 * per-page wrappers speakWord() (vocab) and speakVerb() (verbs). The harness captures every
 * utterance passed to speechSynthesis.speak(), so we can assert language, rate and voice
 * selection without a real browser.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

const VOICES = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: 'de-DE', name: 'Anna' },
  { lang: 'fr-FR', name: 'Thomas' },
];

test('pickVoice: selects a de-* voice when available', () => {
  const v = loadPage({ page: 'verbs.html', exports: ['pickVoice', 'GERMAN_VOICE'], voices: VOICES });
  // pickVoice already ran at load; re-run to be explicit
  v.pickVoice();
  const v2 = loadPage({ page: 'verbs.html', exports: ['GERMAN_VOICE'], voices: VOICES });
  assert.ok(v2.GERMAN_VOICE);
  assert.equal(v2.GERMAN_VOICE.lang, 'de-DE');
});

test('pickVoice: leaves GERMAN_VOICE null when no German voice exists', () => {
  const v = loadPage({ page: 'verbs.html', exports: ['GERMAN_VOICE'], voices: [{ lang: 'en-US', name: 'Sam' }] });
  assert.equal(v.GERMAN_VOICE, null);
});

test('vocab speakWord: speaks German at rate 0.88 with lang de-DE', () => {
  const v = loadPage({ page: 'vocab.html', exports: ['speakWord', 'VOCAB'], voices: VOICES });
  v.speakWord(1, 0);
  assert.equal(v.speech.spoken.length, 1);
  const u = v.speech.spoken[0];
  assert.equal(u.lang, 'de-DE');
  assert.equal(u.rate, 0.88);
  assert.equal(u.voice.lang, 'de-DE');
});

test('vocab speakWord: strips the Perfekt form after the em dash', () => {
  const v = loadPage({ page: 'vocab.html', exports: ['speakWord', 'VOCAB'], voices: VOICES });
  // find a word containing an em dash (e.g. "gehen — gegangen (sein)")
  let found = null;
  for (const wk of Object.keys(v.VOCAB)) {
    const i = v.VOCAB[wk].words.findIndex((w) => w.includes('—'));
    if (i >= 0) { found = [Number(wk), i, v.VOCAB[wk].words[i]]; break; }
  }
  assert.ok(found, 'a word with an em dash exists');
  v.speakWord(found[0], found[1]);
  const spoken = v.speech.spoken[0].text;
  assert.ok(!spoken.includes('—'));
  assert.equal(spoken, found[2].split('—')[0].trim());
});

test('verbs speakVerb: speaks the full triad at rate 0.9', () => {
  const v = loadPage({ page: 'verbs.html', exports: ['speakVerb', 'VERBS'], voices: VOICES });
  v.speakVerb('gehen');
  const u = v.speech.spoken[0];
  assert.equal(u.lang, 'de-DE');
  assert.equal(u.rate, 0.9);
  const e = v.VERBS['gehen'];
  assert.equal(u.text, `gehen, ${e.praet}, ${e.aux} ${e.pp}`);
});
