# 13. Known gaps / things to watch

> Section §13 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

Each item below names the gap, its **severity**, and the **recommended mitigation** if/when it's
worth doing. Ordered roughly by impact.

- **No conversation-length limit for AI chat.** *(severity: medium)* `lessonsCache[day]` grows
  unbounded; every turn re-sends the whole history to Gemini, so a long lesson eventually hits the
  model's context limit (hard error) and inflates the `lessons` row.
  → *Mitigation:* window the `contents` sent to `geminiRequest` (e.g. keep the seed day-plan message
  + the last N turns), or summarise-and-truncate past a threshold. Storage stays full-fidelity; only
  the request is trimmed.

- **Index/key alignment across base data + locales.** *(severity: low, now guarded)* Curriculum,
  vocab, and verb edits must stay aligned across `data/` and all three `locales/*` (§6). This is now
  **structurally enforced** by `tests/data-align.test.js` (length/coverage for vocab, weeks, verbs)
  and `tests/i18n.test.js` (identical `ui` key sets). The guard catches a shifted index or a
  forgotten slot — it does **not** verify that a translation is *semantically* right, only that a
  non-empty value of the correct shape exists. Run `npm test` after any data/locale edit.

> **Already resolved (kept for history):**
> - **Gemini key was localStorage-only** (lost on clearing browser storage, no cross-device use) —
>   the key modal now has an opt-in "remember this key on my account" checkbox that mirrors the key
>   to `progress.gemini_key` and restores it on other devices via `applyCloudKey` (§8). Default stays
>   local-only; the cloud write rides the offline outbox. (Guarded by `tests/outbox.test.js`.)
> - **Cloud writes were fire-and-forget** — a failed write is now parked in the offline outbox
>   (`localStorage['cloud_outbox']`) and replayed on reconnect, with `toast_offline_saved` /
>   `toast_sync_restored` feedback. See §4. (Guarded by `tests/outbox.test.js`.)
> - **Data-overlay fallback pointed at RU, not EN** — `getLocalizedDay` (planner),
>   `getTranslation` (vocab) and `verbGloss` (verbs) now fall back to `LOCALE_EN`, consistent with
>   `DEFAULT_LANG` and the rest of the i18n layer.
> - Untranslated spelling/end-screen strings — `T()` keys are now wired everywhere.
> - Orphaned `settings_*` / `toast_sync_*` locale keys — removed when FSA auto-sync was dropped.
> - Dead locale keys (`ai_thinking`, `spelling_hint`, `spelling_hint_next`, `spelling_input_placeholder`,
>   `lang_label`) — removed from all three locales; `auth_loading` was repurposed into `auth_subtitle`.
> - **`index.html` hardcoded Russian** (page subtitle + "Загрузка…") — the subtitle now reads from
>   `T('auth_subtitle')` in `render()` (so it follows the language switcher) and the loading text is
>   a neutral `…`; the page title is the language-neutral "Deutsch Daily".
> - **Planner keyboard hijack** — `←/→`/`c` no longer fire while typing in the chat textarea or
>   API-key input (the handler now bails on form fields and open modals).
> - **Chat auto-scroll on navigation** — `render()` only follows the chat to the bottom while a turn
>   is loading, so paging through days no longer jumps the viewport into the chat.
> - **Dead code** — the unused `TYPE_LABEL` map was removed from `planner.html` (labels come from the
>   `type_<type>` UI keys).
> - `<html lang="ru">` hardcoded — `i18n.js` sets `document.documentElement.lang` dynamically on init
>   and on every `setLang()` call, so the static attribute is a no-op.
> - `lessons` DDL not in repo — `schema.sql` added at project root (idempotent, safe to re-run).
> - **Dark-theme flash on load/switch** — an inline `<head>` snippet now applies `data-theme` from
>   `localStorage` before any CSS paints, so there's no light→dark flicker (§4, §14.7).
> - **Sections looked like separate sites** (different widths + duplicated headers) — unified to a
>   single `--page-max: 920px` token and a shared `appHeader()` in `header.js` (§4, §11, §14.8).
> - **Pages scattered at the repo root** — the four authenticated pages now live in `views/` and are
>   served via `vercel.json` pretty-URL rewrites; the legacy `auth.html` stub was removed (§3).
