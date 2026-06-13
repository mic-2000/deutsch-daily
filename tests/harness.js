/* tests/harness.js — load the app's browser-globals code into a Node `vm` sandbox.
 *
 * The app has no build step: each page is plain markup + a few `<script src>` modules
 * + one inline `<script>`. This harness mirrors what the browser loads so tests run
 * against the REAL code regardless of which module a function lives in.
 *
 * For a given page it:
 *   1. loads the page's local `<script src="assets/js/…">` / `data/…` deps that are
 *      side-effect-safe (everything except the denylist below — those are shimmed),
 *   2. concatenates them with the page's inline `<script>` content,
 *   3. neutralises the bootstrap (`initApp()` …) so no auth/render side effects fire,
 *   4. evaluates it all as ONE script in a fresh sandbox seeded with browser shims
 *      (so top-level `const`/`let`/`function` share one lexical scope, like the browser),
 *   5. captures the requested global names and returns them.
 *
 * Because it loads whatever `<script src>` a page references, it keeps working after the
 * planned refactor moves inline helpers into new modules (e.g. leitner.js / speech.js).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

/* Modules with heavy side effects (network/auth/DOM bootstrap) — shimmed, not loaded. */
const DENY = new Set(['supabase.js', 'cloud-sync.js', 'theme.js', 'ai-config.js']);

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

/* Resolve a page html path: the app pages live in views/ (login index.html stays at root),
   so callers can pass the bare filename (e.g. 'vocab.html') and we find it wherever it is. */
function resolvePage(page) {
  if (fs.existsSync(path.join(ROOT, page))) return page;
  const inViews = path.join('views', page);
  if (fs.existsSync(path.join(ROOT, inViews))) return inViews;
  return page; // fall through → read() throws a clear ENOENT
}

/* Pull the local `<script src="…">` paths (assets/js/* or data/*) from a page, in order. */
function localScriptSrcs(html) {
  const out = [];
  const re = /<script\s+src="([^"]+)"><\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const src = m[1].replace(/^\//, ''); // pages use root-absolute paths (/assets/.., /data/..)
    if (src.startsWith('assets/js/') || src.startsWith('data/')) out.push(src);
  }
  return out;
}

/* Extract the inline `<script>` blocks (those without a src attribute). */
function inlineScripts(html) {
  const out = [];
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

/* Remove the page bootstrap so loading the code has no auth/render side effects. */
function stripBootstrap(code) {
  return code
    .replace(/initApp\(\)\s*\.then\([^)]*\)\s*;?/g, ';')
    .replace(/initApp\(\)\s*;?/g, ';');
}

function makeFakeEl() {
  const el = {
    innerHTML: '', value: '', textContent: '', checked: false,
    style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  };
  return new Proxy(el, {
    get(t, p) {
      if (p in t) return t[p];
      if (typeof p === 'symbol') return undefined;
      // Any unknown property is treated as a no-op DOM method returning another fake element.
      return () => makeFakeEl();
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}

/* A persistent #app element so render() output can be inspected. */
function makeDocument(appEl) {
  return {
    getElementById(id) { return id === 'app' ? appEl : makeFakeEl(); },
    querySelector() { return makeFakeEl(); },
    querySelectorAll() { return []; },
    createElement() { return makeFakeEl(); },
    addEventListener() {},
    head: makeFakeEl(),
    body: makeFakeEl(),
    documentElement: makeFakeEl(),
  };
}

function makeLocalStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

/* Capture every SpeechSynthesisUtterance handed to speechSynthesis.speak(). */
function makeSpeech(voices) {
  const spoken = [];
  const synth = {
    spoken,
    getVoices: () => voices,
    cancel() {},
    speak(u) { spoken.push(u); },
    onvoiceschanged: null,
  };
  return synth;
}

/**
 * Load a page's code into a sandbox.
 * @param {object} opts
 * @param {string} [opts.page]        page-relative html path (e.g. 'vocab.html')
 * @param {string[]} [opts.extraFiles] extra files to load (e.g. ['locales/en.js'])
 * @param {string[]} opts.exports     global names to return
 * @param {object[]} [opts.voices]    fake speech voices
 * @param {object} [opts.shims]       extra/override sandbox globals
 * @returns {object} captured exports + { app, speech, sandbox }
 */
function loadPage(opts) {
  const { page, extraFiles = [], exports = [], voices = [], shims = {} } = opts;

  const parts = [];
  if (page) {
    const html = read(resolvePage(page));
    for (const src of localScriptSrcs(html)) {
      const base = path.basename(src);
      if (src.startsWith('assets/js/') && DENY.has(base)) continue; // shimmed
      parts.push(read(src));
    }
    for (const inline of inlineScripts(html)) parts.push(stripBootstrap(inline));
  }
  for (const f of extraFiles) parts.push(read(f));

  const appEl = makeFakeEl();
  const speech = makeSpeech(voices);

  const sandbox = {
    console,
    setTimeout: () => 0, // render() uses setTimeout for scroll/focus — make it a no-op
    clearTimeout: () => {},
    SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
    navigator: { language: 'en', clipboard: undefined },
    location: { href: '', replace() {}, assign() {} },
    localStorage: makeLocalStorage(),
    fetch: () => Promise.reject(new Error('network disabled in tests')),
    // --- shimmed modules (supabase / cloud-sync / theme / ai-config) ---
    sb: { auth: { getSession: async () => ({ data: { session: null } }) } },
    currentUser: null,
    initApp: () => Promise.resolve(),
    saveToCloud: () => {},
    saveLangToCloud: () => {},
    saveThemeToCloud: () => {},
    saveVerbsToCloud: () => {},
    loadLessonsFromCloud: async () => [],
    saveLessonToCloud: async () => {},
    deleteLessonFromCloud: async () => {},
    logout: () => {},
    renderThemeToggle: () => '',
    AI_MODEL_ID: 'test-model',
    AI_PRO_MODEL_ID: 'test-pro-model',
    getAiSystemPrompt: () => '',
    getAiSummaryPrompt: () => '',
    getCollectionsTranslatePrompt: () => '',
    // collections table CRUD (cloud-sync is shimmed)
    loadCollectionsFromCloud: async () => [],
    saveCollectionToCloud: () => {},
    saveCollectionMastery: () => {},
    deleteCollectionFromCloud: () => {},
    ...shims,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = makeDocument(appEl);
  sandbox.speechSynthesis = speech;

  const capture =
    '\n;globalThis.__captured = {};\n' +
    exports
      .map((n) => `try{globalThis.__captured[${JSON.stringify(n)}]=${n};}catch(e){globalThis.__captured[${JSON.stringify(n)}]=undefined;}`)
      .join('\n');

  const source = parts.join('\n;\n') + capture;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: (page || 'sandbox') + '.bundle.js' });

  return Object.assign({}, sandbox.__captured, { app: appEl, speech, sandbox });
}

module.exports = { loadPage, ROOT, read };
