# Phase E0 — Pre-flight dump (CHECKPOINT E0-0)

Read-only reconnaissance. Nothing modified.

---

## 1. i18n config files (full contents)

### `i18n/routing.ts`
```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
```

### `i18n/request.ts`
```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### `i18n/navigation.ts`
```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

No `pathnames` option anywhere. `localePrefix: "always"` is the only extra option.

---

## 2. `messages/` directory

Path: `messages/` (repo root). Two files, no subfolders.

| File | Bytes | First lines |
|---|---|---|
| `messages/en.json` | 22336 | `{ "home": { "hero": { "ariaLabel": "Featured products carousel", ... } } }` |
| `messages/zh.json` | 22465 | line 1 `{`, line 2 `"_note": "TODO: replace with real Chinese copy approved by the client. English is a placeholder so the build does not break."`, then same shape as en.json (English placeholder text) |

`messages/zh.json` holds **English placeholder text**, not Chinese. Rename-verbatim to `messages/fr.json` is safe per spec section 4.2.

No `locales/` or `src/messages/` dir exists.

---

## 3. Repo grep — `zh` as locale vs other

### Hits that ARE the intl locale — MUST change

| File:line | Content | Action |
|---|---|---|
| `i18n/routing.ts:4` | `locales: ["en", "zh"],` | change `"zh"` → `"fr"` |
| `messages/zh.json` (filename) | English placeholder message bundle | rename → `messages/fr.json` |

That is the complete set of must-change hits. `i18n/request.ts` builds the message path dynamically (`../messages/${locale}.json`) — no literal `zh`, works automatically once file + routing renamed.

### Hits that reference `zh` but MUST NOT change (comments / docs / stale notes)

| File:line | Content | Why leave it |
|---|---|---|
| `lib/routes.ts:17` | doc-comment `* (en \| zh) — there is no "fr" route configured...` | stale comment; not spec scope (E0 rules: touch only routing + messages + hardcoded arrays). Flag for a follow-up comment fix. |
| `lib/data/awards.ts:15` | comment `matching ... messages/en.json + zh.json` | comment only |
| `lib/data/latestNews.ts:15` | comment `into messages/en.json + zh.json under ...` | comment only |
| `docs/news-audit-2.md` (multiple) | audit prose describing the mismatch | docs |
| `docs/PHASE-E0-LOCALE-RENAME.md` (multiple) | this phase's own spec | docs |

No `zh` Prisma enum string exists (enum is `EN | FR`). No Chinese characters (`中文`) in any `.ts/.tsx` source — only in `docs/PHASE-E0-LOCALE-RENAME.md:111` (spec text) and `public/logo.svg` (unrelated long line, not the string "中文").

### Language-switcher UI

`components/layout/nav/Navbar.tsx:73` and `components/layout/nav/MobileNav.tsx:253` render a `<Globe>` button showing `{locale.toUpperCase()}` — value comes from `useLocale()`, **not hardcoded**. It will display `FR` automatically after the rename. No "中文" literal. No dropdown/switch list found. Out of scope, no change needed.

---

## 4. Repo grep — `fr` / `FR` as locale (collision check)

- `prisma/schema.prisma:26` — `FR` (Locale enum member). Correct, spec says do not touch.
- `prisma/migrations/20260825161721_init/migration.sql:8` — `CREATE TYPE "Locale" AS ENUM ('EN', 'FR');`. Migration history, do not touch.
- `lib/validation/post.ts:47` — `locale: z.enum(["EN", "FR"]).default("EN")`. Dashboard form validation, uppercase Prisma-enum form. Not a routing locale. Spec: do not touch dashboard.
- `components/dashboard/post-form.tsx:20,527,529` — `"EN" | "FR"`, `<option value="FR">French</option>`. Dashboard UI. Do not touch.
- `docs/*` — prose.

**No collision.** Nothing already uses `"fr"` (lowercase) as a routing locale. `routing.locales` is the only lowercase locale list. Adding `"fr"` there is clean.

---

## 5. `defineRouting` confirmation

Yes. `next-intl/routing`'s `defineRouting` is used, single call site:

`i18n/routing.ts:3`
```ts
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
});
```

Everything else (`i18n/request.ts`, `i18n/navigation.ts`, `app/[locale]/layout.tsx`, `lib/routes.ts`) consumes `routing.locales` / `routing.defaultLocale` derived from this one object. Single source of truth.

---

## 6. Hardcoded locale lists elsewhere (`proxy.ts` etc.)

### `proxy.ts` (repo root)
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
...
const intlProxy = createMiddleware(routing);
...
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/dashboard/:path*", "/login"],
};
```
**No hardcoded locale array.** Passes `routing` object through. Matcher regex has no locale enumeration. Nothing to change here.

Note: `middleware.ts` was deleted in the working tree (pre-existing auth refactor, uncommitted); `proxy.ts` is its replacement. Not E0's concern but relevant — the active middleware is `proxy.ts`, and it is already `routing`-driven.

### Elsewhere
`app/[locale]/layout.tsx:20` — `return routing.locales.map((locale) => ({ locale }));` (generateStaticParams) — derived, not hardcoded.
`app/[locale]/layout.tsx:32` — `if (!hasLocale(routing.locales, locale))` — derived.
`lib/routes.ts:4,7` — `RouteLocale` type + `isRouteLocale()` both read `routing.locales` — derived.

**No second hardcoded copy exists.** The rename in `i18n/routing.ts` propagates everywhere automatically.

---

## Summary for E0-1 (the actual rename, after approval)

1. `i18n/routing.ts:4` — `["en", "zh"]` → `["en", "fr"]`. Nothing else in that file.
2. `git mv messages/zh.json messages/fr.json` — contents verbatim (English placeholder).
3. No other file needs editing. No hardcoded arrays, no second config, no dashboard/Prisma/news touch.
4. Stale comment in `lib/routes.ts:16-18` mentions `(en | zh)` — flag only, fix in a later cleanup (out of E0 scope).
