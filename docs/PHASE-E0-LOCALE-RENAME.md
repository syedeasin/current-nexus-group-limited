# Phase E0 — Locale Rename (`zh` → `fr`)

Prerequisite to `docs/PHASE-E1-PUBLIC-NEWS-DB.md`. Small, high-risk change that must land cleanly before E1 can proceed.

---

## 0. Locked environment

| Package | Locked version |
|---|---|
| next | 16.3.0 |
| next-intl | 4.13.7 |
| prisma / @prisma/client | 6.19.3 |

### Hard rules

1. **Do NOT run** `npm install <pkg>@latest`, `npm update`, `npm audit fix`, or `npm audit fix --force`.
2. **Do NOT upgrade or downgrade** anything. No new dependencies this phase.
3. **Do NOT run** `npm run build`.
4. Only verification command is `npx tsc --noEmit`.
5. **Do NOT touch `prisma/schema.prisma`.** The DB `Locale` enum `EN | FR` is already correct.
6. **Do NOT touch `lib/data/news.ts` or any news page.** That work belongs to E1, which runs after this phase.

---

## 1. Why this phase exists

The audit in `docs/news-audit-2.md` found a mismatch:

- The site's next-intl routing declares locales `en | zh`.
- The database's `Locale` enum is `EN | FR`.
- The project's intended locales are **EN and FR** (memory-confirmed).

Consequence today:
- `/en` — 200
- `/fr` — falls through to `/en/fr` because `fr` is not a routing locale
- `/zh` — currently 500 (was expected 404), because `zh` is still a routing locale but its content is broken

E1 cannot ship without this fix — its `getPublishedPostBySlug(locale, slug)` will be called with `en` or `zh` from the URL, but the DB only knows `EN` and `FR`. Every FR-locale post would be unreachable.

---

## 2. Scope

Rename the intl routing locale `zh` → `fr`. Rename any corresponding `messages/zh.json` (or equivalent) file to `messages/fr.json`. Preserve every other next-intl setting exactly. Do nothing else.

**Translation is not this phase's job.** `/fr/*` may render untranslated English strings after this rename — that is acceptable. Actual French copy is a later editorial task.

---

## 3. Pre-flight — report, then stop

Do NOT modify anything yet.

1. Print the full contents of `i18n/routing.ts`, `i18n/request.ts`, and `i18n/navigation.ts` (whichever exist).
2. Report every file under `messages/` (or equivalent — some setups use `locales/` or `src/messages/`). For each, print the first ~10 lines so we know its shape.
3. Grep the whole repo (excluding `node_modules`, `.next`, `.git`) for the string `"zh"` and the identifier `zh` used as a locale value. List every hit with file and line. Explicitly separate:
   - Hits that are the intl locale (must change)
   - Hits that are something else, e.g. a comment, an unrelated variable, a Prisma enum string, a Chinese character in content (must NOT change)
4. Grep for `"fr"` and `FR` used as a locale to make sure the code isn't already using `fr` somewhere that would collide.
5. Confirm whether `next-intl/routing`'s `defineRouting` is what's used, and print the exact call site.
6. Report whether `proxy.ts` (root) or anywhere else contains a hardcoded locale list (e.g. an array `["en", "zh"]` used in middleware matching).

**CHECKPOINT E0-0** — report all six, then stop.

### How the answers change the work

- If `messages/zh.json` exists: rename to `messages/fr.json`, keep contents verbatim.
- If no `messages/` folder exists: report that; next-intl config may load messages from elsewhere, and we adjust accordingly.
- If a hardcoded locale array lives in `proxy.ts` or anywhere else, every copy must be updated together — a missed copy re-breaks routing silently.

---

## 4. Task E0-1 — do the rename

After CHECKPOINT E0-0 is approved:

1. In `i18n/routing.ts` (or wherever `defineRouting` is called), replace the locale `zh` with `fr` in the `locales` array. Keep `defaultLocale: "en"` unchanged. Keep `localePrefix`, `pathnames`, and every other option **exactly** as they are.
2. If a `messages/zh.json` (or equivalent) exists, rename it to `messages/fr.json`. Do not translate anything; leave the English/existing content in place.
3. If any other hardcoded locale list exists (from Pre-flight answer 6), update it to `["en", "fr"]`. Every copy, in the same commit-worth-of-changes.
4. Do NOT edit any dashboard file, any Prisma file, any `lib/data/*` file, or any news page.
5. Do NOT add a "coming soon" or placeholder FR page. Missing translations are fine; a stub page is not.

**CHECKPOINT E0-A** — run `npx tsc --noEmit`, print the diff of every changed file, and list any file renamed.

---

## 5. Verification

Dev server running on port 3000. Report the HTTP status and any redirect target for each:

| # | URL | Expected |
|---|---|---|
| 1 | `/en` | 200 |
| 2 | `/fr` | 200 (untranslated English content is fine) |
| 3 | `/zh` | 404 or redirect to `/en` — must not 500, must not resolve as a locale |
| 4 | `/en/news` | 200, unchanged content |
| 5 | `/en/about/why-choose-cnx` | 200, unchanged content |
| 6 | `/login` | 200 |
| 7 | `/dashboard` (signed in) | 200 |

Then read the browser console on `/fr` and `/en`. Report any next-intl warnings about missing messages — those are expected for `/fr`, and are not blockers.

If any of checks 1, 4, 5, 6, 7 changes behaviour, stop and report. That means the routing edit broke something upstream and E1 must not start.

---

## 6. Out of scope

- Any French translations. `messages/fr.json` is a stub carrying English text until a translation pass is scheduled.
- A locale switcher UI. If one exists and shows "中文", the label text needs updating in a later phase — do not silently change it now unless it obviously appears in an already-touched file.
- Any Prisma schema change. The DB is already `EN | FR`.
- Any news page or `lib/data/news.ts` work — that is E1.

---

## 7. Final instruction

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
