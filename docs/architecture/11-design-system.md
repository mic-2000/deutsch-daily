# 11. Design system (`assets/css/base.css`)

> Section §11 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

CSS custom properties on `:root`:

```css
--paper:#F2EDE3; --paper-2:#E8E0D0; --paper-3:#FAF6EC;   /* warm-paper backgrounds */
--ink:#1C1A17;  --ink-soft:#4A453D;  --line:#BFB5A0;      /* text + borders */
--accent:#8F3B6B; --accent-2:#6B2C50;                     /* plum ("Слива") + hover (dark: #C77EA8/#A85E8A) */
--green:#4A7C3A;  --gold:#C5963B;                         /* mastered / in-progress */
--der:#2F5C8F;  --die:#A23B2D;  --das:#3F7A3A;            /* trainer gender colors */
--serif:'Fraunces', Georgia, serif;  --sans:'Manrope', system-ui, sans-serif;
--page-max:920px;                                         /* single content width for all app pages */
```

Editorial/typographic aesthetic: large light (300) serif headings (Fraunces), Manrope body,
minimal rounding, thin borders, tabular numerals (`.num`). The Google-Fonts `<link>` (identical on
all pages) loads **both the upright and italic Fraunces axes** (`ital,opsz,wght@0,…;1,…`) so the
italic serif (subtitles, `<em>` accents, the landing's headings) renders as true Fraunces italic
rather than a browser-synthesised slant. **Container width is unified:** every
app page uses one `--page-max: 920px` token — `.container { max-width: var(--page-max) }` in
`base.css`. The old per-page overrides (planner 820px, vocab's 26px header padding) were removed so
the four sections read as one site; `auth.css` (the login page) narrows to 480px and `landing.css`
(the public landing) lays out its own editorial sections on the same `--page-max` content column.
Responsive via `@media (max-width: 600px)` across `base.css` + every page CSS + `chat.css` (and a
700/720px tier on some pages; `landing.css` collapses the hero/grids at 720px and tightens padding
at 560px).

CSS files: `base.css` (tokens, reset, header/footer/info-box/toast/container + `--page-max`),
`components.css` (`.user-bar-right`, nav-tabs, lang-switcher + the mobile nav-tabs horizontal-scroll
strip and email-ellipsis rules), then page-specific `planner.css` / `vocab.css` / `verbs.css` /
`collections.css` / `auth.css` / `landing.css` / `today.css` (the `/today` wizard chrome — intro
checklist, step header, grammar card, done screen; the in-flow sessions reuse `vocab.css`/`verbs.css`). `chat.css` is loaded by `planner.html` **and** `today.html` and covers `.ai-messages`, `.ai-msg` (user + model variants), `.ai-input-row` (the `<textarea>` auto-grows
to fit its content — incl. a paste — via the shared `aiGrowInput()` in `utils.js`, capped at `60vh`;
the helper anchors the box's bottom edge so it visually expands *upward* and the Send button stays in
view), `.ai-table`, the loading-dots animation, the key/summary modals, and the pinned
`.ai-rule-wrap` "topic breakdown" block (shared by both AI views). `landing.css`
(loaded only by `index.html`) reuses the `base.css` tokens + `components.css` switcher/toggle and adds
the editorial hero, the section grids, and the decorative `lp*`-prefixed keyframe animations
(disabled under `prefers-reduced-motion`).
