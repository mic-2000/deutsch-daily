# 12. Environment notes

> Section §12 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The app targets an **HTTPS browser session** (Vercel + Supabase). The following defensive patterns
still matter and should be preserved:

- **Speech voices load async** — `getVoices()` is often empty on first call; keep the
  `onvoiceschanged` listener.
- **In-page confirm modal** — keep using `state.confirm`, not the native `confirm()`.
- **Never swallow handler errors silently** — surface failures via `showToast`.

`file://` usage (double-clicking the HTML files) is effectively **historical**: it can't establish
a Supabase session, so auth/sync don't work there. Treat `file://` as out of scope unless that
explicitly changes.

`localStorage` holds five persistent preference keys — `ui_lang` (language), `ui_theme`
(`light`|`dark`, written by `theme.js`), `auth_redirect` (post-login return URL), `gemini_key`
(user's Gemini API key) and `gemini_key_sync` (`'1'` if the user opted to mirror the key to their
account — §8) — plus two **transient** keys: `cloud_outbox` (the offline write queue — exists only
while a failed write is pending and is cleared the moment it replays, §4) and `cloud_cache` (the
offline read mirror — a copy of the last successful cloud read used as a cold-start fallback, §5).
Both are convenience buffers, **not progress stores**, and both are scoped to the signed-in user;
all learning progress and chat history lives in Supabase, which always overwrites them.
