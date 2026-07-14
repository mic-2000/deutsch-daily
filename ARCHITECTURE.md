# Architecture — Deutsch Daily (German A1 → B1 learning tools)

Comprehensive technical reference for this project, **split by feature** so you can load only the
section(s) relevant to your task instead of one huge file. For day-to-day editing rules and gotchas
see [CLAUDE.md](CLAUDE.md); this reference is the deeper "how it all fits together" material.
(Originally re-derived from the source on 2026-06-10; split into per-section files on 2026-07-14.)

**How to use this index.** Every section keeps its historical `§N` number — a reference like
"§19" anywhere in the repo (CLAUDE.md, code comments, tests) resolves to
`docs/architecture/<NN>-<slug>.md` below. Read the file for the feature you're changing, plus
§4 (shared modules) and/or §5 (DB schema) when your change touches cross-page plumbing or cloud
data. Don't read the whole set for a scoped change.

| § | File | What's inside |
| --- | --- | --- |
| 1 | [docs/architecture/01-product.md](docs/architecture/01-product.md) | What the product is: the surfaces (planner / vocab / verbs / AI tutor / collections / stats / settings / today), the 36-week course shape, `course-consts.js`, the mixed-cache-version guard |
| 2 | [docs/architecture/02-stack-deployment.md](docs/architecture/02-stack-deployment.md) | Vanilla-JS stack, Supabase, Vercel rewrites, `build.js` (cred injection + `sw.js` VERSION stamping) |
| 3 | [docs/architecture/03-project-structure.md](docs/architecture/03-project-structure.md) | Repo layout, routing model (landing / login / `views/`), per-page script load order, lazy locales, early shell render |
| 4 | [docs/architecture/04-shared-modules.md](docs/architecture/04-shared-modules.md) | Every `assets/js/*` module: i18n, theme, header/footer, planner-data, stats, trainer engines, legal, ai-config, gemini, markdown, leitner, speech, utils, feedback, supabase, **cloud-sync** (the `initApp` per-page contract, offline outbox, read mirror, lessons/collections API) |
| 5 | [docs/architecture/05-auth-cloud-sync.md](docs/architecture/05-auth-cloud-sync.md) | DB schema (`progress` / `lessons` / `collections` / `entitlements` / `feedback`), RLS, `hasPremium()`, the login page (modes incl. password recovery) |
| 6 | [docs/architecture/06-i18n.md](docs/architecture/06-i18n.md) | Locale file shape (`ui` / `vocab` / `verbs` / `weeks`), index-/key-matching rules, EN fallback |
| 7 | [docs/architecture/07-data-model.md](docs/architecture/07-data-model.md) | `data/weeks.js` / `vocab.js` (+`PLURALS`) / `verbs.js` / `hints.js` shapes; flattening weeks → days |
| 8 | [docs/architecture/08-planner.md](docs/architecture/08-planner.md) | Planner state, AI Lehrer chat (key management, lesson flow, weekly summary), render & keyboard |
| 9 | [docs/architecture/09-vocab.md](docs/architecture/09-vocab.md) | Vocab engine: state, Leitner routing, verb cross-trainer routing, exercise modes, plural track, session scopes, per-day new-card budget |
| 10 | [docs/architecture/10-verbs.md](docs/architecture/10-verbs.md) | Verbs engine: state, four card modes, filters/selection, session scopes |
| 11 | [docs/architecture/11-design-system.md](docs/architecture/11-design-system.md) | CSS tokens (`base.css`), typography, `--page-max`, CSS file inventory |
| 12 | [docs/architecture/12-environment.md](docs/architecture/12-environment.md) | HTTPS-only reality, defensive patterns to preserve, the full `localStorage` key inventory |
| 13 | [docs/architecture/13-known-gaps.md](docs/architecture/13-known-gaps.md) | Known gaps / things to watch (+ resolved-history list) |
| 14 | [docs/architecture/14-fixed-bugs.md](docs/architecture/14-fixed-bugs.md) | Already-fixed bugs — **do not reintroduce** |
| 15 | [docs/architecture/15-tests.md](docs/architecture/15-tests.md) | Test harness (`tests/harness.js`), what's covered, what can't be covered |
| 16 | [docs/architecture/16-collections.md](docs/architecture/16-collections.md) | Collections page: state, CRUD, screens, CSV import, AI translate |
| 17 | [docs/architecture/17-pwa.md](docs/architecture/17-pwa.md) | PWA: manifest, icons, `sw.js` caching strategy, what works offline |
| 18 | [docs/architecture/18-landing.md](docs/architecture/18-landing.md) | Public landing page: render model, auth routing, copy/i18n, pricing-is-presentational note |
| 19 | [docs/architecture/19-today.md](docs/architecture/19-today.md) | `/today` wizard: descriptor-driven steps, tariffs, easy day (DEV-12), grammar-review track, listen/produce/weak blocks, engine hosting, cloud columns, resume |
| 20 | [docs/architecture/20-welcome-onboarding.md](docs/architecture/20-welcome-onboarding.md) | `/welcome` onboarding: the gate (`onbVersion`), the five questions and their real effects, persistence |
| 21 | [docs/architecture/21-course-v2-pipeline.md](docs/architecture/21-course-v2-pipeline.md) | Course v2 pipeline: `authoring/` → `gen-course.js` → `cutover-v2.js`, `band-verbs.js`, `srs-budget.js`, the gate tests |
| 22 | [docs/architecture/22-stats.md](docs/architecture/22-stats.md) | `/stats` page: data sources, sections, B1 forecast, premium gating |

Common starting points by task:

- **Adding/changing a page or flow** → that page's § (8–10, 16, 18–20, 22) + §3 (load order) + §4
  (`cloud-sync` contract).
- **Anything touching cloud data or auth** → §5 (schema/RLS) + §4 (`cloud-sync.js`).
- **Curriculum / vocabulary / verb content** → §21 (authoring pipeline) + §7 (data shapes) + §6
  (locale matching).
- **Trainer/session behaviour** → §9/§10 (engines) + §19 if it runs inside `/today`.
- **Styling** → §11. **Offline/install** → §17. **Before finishing any change** → §14 (do not
  reintroduce) and §15 (tests).
