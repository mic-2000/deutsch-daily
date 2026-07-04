/* tests/verb-present.test.js — the Präsens conjugation engine (VerbsTrainer.conjugatePresent).
 *
 * conjugatePresent(key) returns the six present-tense forms {ich,du,er,wir,ihr,sie} for a plain
 * (non-separable, non-reflexive) verb, using `praes` (present 3rd-sg) to drive the du/er stem change.
 * These forms feed the trainer's "Conjugation" card mode, so wrong output = teaching wrong German.
 * Guards a representative verb from every class: regular, t/d-stem, sibilant, -ern, strong vowel
 * change (a→ä, e→i, e→ie, au→äu, t-stem), modals + wissen, and the irregular sein/haben/werden.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* Objects come from the vm sandbox realm; normalize to a host plain object before deepEqual. */
const plain = (x) => JSON.parse(JSON.stringify(x));

function fresh() {
  return loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['conjugatePresent', 'availableModes', 'VERBS'],
  });
}

/* Hand-verified reference paradigms (Duden). */
const EXPECTED = {
  // regular weak
  machen: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' },
  spielen: { ich: 'spiele', du: 'spielst', er: 'spielt', wir: 'spielen', ihr: 'spielt', sie: 'spielen' },
  // t/d-stem → epenthetic -e- in du/er/ihr
  arbeiten: { ich: 'arbeite', du: 'arbeitest', er: 'arbeitet', wir: 'arbeiten', ihr: 'arbeitet', sie: 'arbeiten' },
  finden: { ich: 'finde', du: 'findest', er: 'findet', wir: 'finden', ihr: 'findet', sie: 'finden' },
  // consonant + n/m stem → epenthetic -e- (incl. -chnen, but NOT silent-h wohnen)
  zeichnen: { ich: 'zeichne', du: 'zeichnest', er: 'zeichnet', wir: 'zeichnen', ihr: 'zeichnet', sie: 'zeichnen' },
  wohnen: { ich: 'wohne', du: 'wohnst', er: 'wohnt', wir: 'wohnen', ihr: 'wohnt', sie: 'wohnen' },
  // sibilant stem → du drops the -s of -st
  heißen: { ich: 'heiße', du: 'heißt', er: 'heißt', wir: 'heißen', ihr: 'heißt', sie: 'heißen' },
  tanzen: { ich: 'tanze', du: 'tanzt', er: 'tanzt', wir: 'tanzen', ihr: 'tanzt', sie: 'tanzen' },
  // -ern infinitive
  wandern: { ich: 'wandere', du: 'wanderst', er: 'wandert', wir: 'wandern', ihr: 'wandert', sie: 'wandern' },
  // -eln infinitive → the -el- drops its e in ich (ich sammle, not sammele)
  sammeln: { ich: 'sammle', du: 'sammelst', er: 'sammelt', wir: 'sammeln', ihr: 'sammelt', sie: 'sammeln' },
  wechseln: { ich: 'wechsle', du: 'wechselst', er: 'wechselt', wir: 'wechseln', ihr: 'wechselt', sie: 'wechseln' },
  // -n infinitive (tun)
  tun: { ich: 'tue', du: 'tust', er: 'tut', wir: 'tun', ihr: 'tut', sie: 'tun' },
  // strong: a→ä
  fahren: { ich: 'fahre', du: 'fährst', er: 'fährt', wir: 'fahren', ihr: 'fahrt', sie: 'fahren' },
  tragen: { ich: 'trage', du: 'trägst', er: 'trägt', wir: 'tragen', ihr: 'tragt', sie: 'tragen' },
  // strong: a→ä on a sibilant stem
  wachsen: { ich: 'wachse', du: 'wächst', er: 'wächst', wir: 'wachsen', ihr: 'wachst', sie: 'wachsen' },
  // strong: a→ä on a t-stem (no epenthesis in du/er)
  halten: { ich: 'halte', du: 'hältst', er: 'hält', wir: 'halten', ihr: 'haltet', sie: 'halten' },
  // strong: a→ä on a d-stem
  laden: { ich: 'lade', du: 'lädst', er: 'lädt', wir: 'laden', ihr: 'ladet', sie: 'laden' },
  // strong: au→äu
  laufen: { ich: 'laufe', du: 'läufst', er: 'läuft', wir: 'laufen', ihr: 'lauft', sie: 'laufen' },
  // strong: e→i
  geben: { ich: 'gebe', du: 'gibst', er: 'gibt', wir: 'geben', ihr: 'gebt', sie: 'geben' },
  sprechen: { ich: 'spreche', du: 'sprichst', er: 'spricht', wir: 'sprechen', ihr: 'sprecht', sie: 'sprechen' },
  treffen: { ich: 'treffe', du: 'triffst', er: 'trifft', wir: 'treffen', ihr: 'trefft', sie: 'treffen' },
  werfen: { ich: 'werfe', du: 'wirfst', er: 'wirft', wir: 'werfen', ihr: 'werft', sie: 'werfen' },
  // strong: e→i with consonant doubling on a t-stem
  treten: { ich: 'trete', du: 'trittst', er: 'tritt', wir: 'treten', ihr: 'tretet', sie: 'treten' },
  // strong: e→i on a sibilant stem
  essen: { ich: 'esse', du: 'isst', er: 'isst', wir: 'essen', ihr: 'esst', sie: 'essen' },
  // strong: e→ie
  lesen: { ich: 'lese', du: 'liest', er: 'liest', wir: 'lesen', ihr: 'lest', sie: 'lesen' },
  sehen: { ich: 'sehe', du: 'siehst', er: 'sieht', wir: 'sehen', ihr: 'seht', sie: 'sehen' },
  // strong: e→i with -mm- (nehmen)
  nehmen: { ich: 'nehme', du: 'nimmst', er: 'nimmt', wir: 'nehmen', ihr: 'nehmt', sie: 'nehmen' },
  // modal verbs (ich = er, no ending; plural = infinitive)
  können: { ich: 'kann', du: 'kannst', er: 'kann', wir: 'können', ihr: 'könnt', sie: 'können' },
  müssen: { ich: 'muss', du: 'musst', er: 'muss', wir: 'müssen', ihr: 'müsst', sie: 'müssen' },
  dürfen: { ich: 'darf', du: 'darfst', er: 'darf', wir: 'dürfen', ihr: 'dürft', sie: 'dürfen' },
  sollen: { ich: 'soll', du: 'sollst', er: 'soll', wir: 'sollen', ihr: 'sollt', sie: 'sollen' },
  wollen: { ich: 'will', du: 'willst', er: 'will', wir: 'wollen', ihr: 'wollt', sie: 'wollen' },
  mögen: { ich: 'mag', du: 'magst', er: 'mag', wir: 'mögen', ihr: 'mögt', sie: 'mögen' },
  // preterite-present like the modals
  wissen: { ich: 'weiß', du: 'weißt', er: 'weiß', wir: 'wissen', ihr: 'wisst', sie: 'wissen' },
  // wildly irregular
  sein: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' },
  haben: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' },
  werden: { ich: 'werde', du: 'wirst', er: 'wird', wir: 'werden', ihr: 'werdet', sie: 'werden' },
};

for (const [verb, forms] of Object.entries(EXPECTED)) {
  test(`conjugatePresent(${verb}) matches the full Präsens paradigm`, () => {
    const v = fresh();
    assert.deepEqual(plain(v.conjugatePresent(verb)), forms);
  });
}

test('every conjugation source verb exists in VERBS (or is sein/werden)', () => {
  const v = fresh();
  for (const verb of Object.keys(EXPECTED)) {
    assert.ok(verb in v.VERBS, `${verb} present in dictionary`);
  }
});

test('the Conjugation mode is offered for plain verbs but not separable/reflexive/multi-word', () => {
  const v = fresh();
  assert.ok(v.availableModes('gehen').includes('conjug'));
  assert.ok(v.availableModes('fahren').includes('conjug'));
  assert.ok(!v.availableModes('abholen').includes('conjug'), 'separable excluded');
  assert.ok(!v.availableModes('sich freuen').includes('conjug'), 'reflexive excluded');
  assert.ok(!v.availableModes('schlafen gehen').includes('conjug'), 'multi-word excluded');
});

test('structural sanity: every plain verb yields 6 non-empty forms, plural = infinitive', () => {
  const v = fresh();
  for (const key of Object.keys(v.VERBS)) {
    const e = v.VERBS[key];
    if (e.refl || e.sep || key.includes(' ')) continue;
    const f = v.conjugatePresent(key);
    for (const p of ['ich', 'du', 'er', 'wir', 'ihr', 'sie']) {
      assert.ok(f[p] && /\S/.test(f[p]) && !/undefined/.test(f[p]), `${key}.${p} = "${f[p]}"`);
    }
    // wir / sie are the bare infinitive in the present tense (except the wildly irregular "sein")
    if (key === 'sein') continue;
    assert.equal(f.wir, key, `${key}: wir === infinitive`);
    assert.equal(f.sie, key, `${key}: sie === infinitive`);
  }
});
