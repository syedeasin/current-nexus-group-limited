# Export Notes

`_starter-export/` is a copy of every file tagged **GENERIC** or **MIXED** in `STARTER-AUDIT.md`
(project root), genericized and reorganized into a self-contained tree. **CLIENT**-tagged files
(archive/story/participant/healer/narrator pages, KYCC/K-Town branding, Navbar/Footer, admin
taxonomy CRUD, `lib/types.ts`, `lib/queries.ts`, `lib/constants.ts`, `data/*`) were **not** copied
— nothing in the original repo was modified.

All internal imports were converted from the `@/...` alias (which resolves to the *original*
repo root, not this folder) to relative imports, so this folder no longer depends on anything
outside itself. `npx tsc --noEmit` passes for the whole repo, including this folder, with zero
errors.

## Files exported

### lib/

| File | Rename / fix | Manual review |
|---|---|---|
| `lib/utils.ts` | none | — |
| `lib/slug.ts` | none | — |
| `lib/supabase/client.ts` | none | Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your own `.env`. |
| `lib/supabase/server.ts` | none | Same env vars as above. |
| `lib/supabase/public.ts` | none | Same env vars as above. |
| `lib/supabase/middleware.ts` | `updateSession(request)` → `updateSession(request, { protectedPrefix, loginPath, redirectAuthedTo? })`. Hardcoded `/admin` strings became required options. | Caller (`middleware.ts`) already updated to pass `{ protectedPrefix: '/admin', loginPath: '/admin/login' }` — change those two strings if your protected area isn't `/admin`. |
| `lib/imageMeta.ts` | `getImageMeta(src)` → `getImageMeta(credits, src)`; `getPageImage(page, slot)` → `getPageImage(pageImages, page, slot)`. Originally imported a global `imageCredits`/`pageImages` singleton from `@/data/imageCredits` (CLIENT content, not exported) — now the caller supplies its own map. Also inlined the `ImageCredit`/`ImageCreditMap`/`PageImageMap` types (originally from `@/types/image`, also not exported). | You need to build your own credits map and pass it in wherever these are called (e.g. from `LegalPage`, if you re-wire it). |

### components/

| File | Rename / fix | Manual review |
|---|---|---|
| `components/ui/PasswordInput.tsx` | none | — |
| `components/ui/ThumbnailImage.tsx` | none | — |
| `components/ui/NewsletterForm.tsx` | none | Submit handler is a no-op (`e.preventDefault()`) in the source too — wire up your own endpoint. |
| `components/ui/CountUp.tsx` | none | — |
| `components/story/ImageViewer.tsx` | Hardcoded hex colors (`#E7E4D8`, `#FCF8EB`, `#2D2D2D`) replaced with neutral Tailwind grays (`gray-200`/`gray-50`/`gray-800`) so the component no longer depends on this project's brand palette. | Restyle if you want it to match your palette instead of gray. |
| `components/legal/LegalPage.tsx` | Removed hardcoded `<Navbar />` / `<Footer />` — replaced with `header`/`footer` render-prop slots. `LegalDoc`/`LegalSection` types now defined locally in this file (originally imported from `@/data/legal`, CLIENT content, not exported). `hero` image lookup via `getPageImage(page, slot)` replaced with a direct `heroImage?: { src, alt }` field on `LegalDoc` — removes the dependency on `lib/imageMeta`'s excluded data source. | You must build your own `LegalDoc` objects (title/eyebrow/intro/sections) — none of this project's legal copy was exported. |
| `components/researchers/ResearchAccessForm.tsx` | `roles` list is now a prop (`roles?: string[]`, defaults to a generic list with "Oral Historian" removed). Two "K-Town Archive Materials" strings replaced with a `materialsLabel?: string` prop, default `"our materials"`. Submit handler is still a stub (`setTimeout` + fake success), same as source. | Wire up the real submit handler; localize `materialsLabel` per site. |
| `components/sections/NarratorsCarousel.tsx` | `HomepageStory` type import from `@/lib/queries` (CLIENT, not exported) replaced with a locally-defined `CarouselStory` type of the same shape. `badge` computed from `story.primary_topic ?? story.collection_name ?? story.group_type` in the source — now the caller must pass `badge` directly (no domain-specific fallback chain). Hardcoded `"Oral History"` literal in the meta row removed — caller now passes a `meta: string[]` array directly. Hardcoded `/stories/${slug}` link replaced with a `hrefBase?: string` prop (default `/stories`). | Build `CarouselStory[]` objects yourself; decide what belongs in `badge` and `meta`. |

### app/

| File | Rename / fix | Manual review |
|---|---|---|
| `app/admin/(panel)/Toast.tsx` | none | — |
| `app/admin/(panel)/AdminSearchBar.tsx` | none | — |
| `app/admin/(panel)/layout.tsx` | Removed hardcoded `<AdminNav />` (CLIENT, tied to this project's taxonomy sections) — replaced with a `nav?: React.ReactNode` slot prop. | Pass your own sidebar nav component. |
| `app/admin/login/actions.ts` | Import path only (`@/lib/supabase/server` → `../../../lib/supabase/server`). | — |
| `app/admin/login/page.tsx` | Removed hardcoded `<BrandLogo />` (CLIENT) — replaced with a `logo?: React.ReactNode` slot prop. Copy "Sign in to manage the archive." → "Sign in to manage your content." Dropped a commented-out dead "Sign Up" link block that referenced the disabled signup flow. | Pass your own logo. |
| `app/signup/actions.ts` | Import path only. | — |
| `app/signup/page.tsx` | Dropped the ~90-line commented-out original signup form (contained "K-Town Archive" copy and imported the excluded `BrandLogo`/`PasswordInput`-with-confirm pattern) — replaced with a one-line pointer comment. Live behavior (redirect to `/admin/login`) is unchanged. | Restore a real signup form if/when you re-enable public signup — `PasswordInput` is already exported and generic. |
| `app/globals.css` | No structural changes. Added a comment flagging that the two raw hex values (`#2d2d2d`, `#fcf8eb`) duplicate this project's `ink`/`cream` brand tokens from `tailwind.config.ts`. | **Not genericized** — these are literal brand colors baked outside Tailwind's token system. Replace both hex values (and the matching tokens in `tailwind.config.ts`) if you adopt a different palette. Font names (`Fjalla One`, `IBM Plex Mono`) are generic typeface choices, left as-is. |
| `app/photos/PhotoGrid.tsx` | `Photo.participant_name` → `Photo.subjectName`, `Photo.participant_slug` → `Photo.subjectSlug`. Hardcoded `/stories/${slug}` link replaced with a `hrefBase?: string` prop (default `/stories`). | — |
| `app/stories-gallery/PhotoMasonryGrid.tsx` | Same renames/fix as `PhotoGrid.tsx` (`MasonryPhoto` type). | — |
| `app/stories-gallery/Pagination.tsx` | Dropped a ~100-line commented-out duplicate old version at the bottom of the file (dead code, contained old brand hex colors). Live component unchanged. | — |
| `app/stories-gallery/ActivePills.tsx` | Dropped a ~120-line commented-out duplicate old version. `FILTER_PARAMS` hardcoded const → `filterParams?: string[]` prop (same default values). `isImageView` + hardcoded `PHOTO_FORMAT_SLUG === 'format'` special-case → generic `pinned?: { paramName, slug }` prop. `FilterParam` union type widened to `string`. | Taxonomy names in the default (`subject/topic/keyword/format/genre/year/age`) are still domain-flavored — override via `filterParams` for a different data model. |
| `app/stories-gallery/FilterPanel.tsx` | Dropped a ~130-line commented-out duplicate old version. `isImageView` + `PHOTO_FORMAT_SLUG` special-case → generic `pinned?: { groupId, slug }` prop. Placeholder text "Search your topic..." → "Search options...". | Same taxonomy-naming note as `ActivePills.tsx`. |
| `app/stories-gallery/FilterDrawer.tsx` | `FILTER_PARAMS` hardcoded const → `filterParams?: string[]` prop. `isImageView` prop replaced with `pinned` (forwarded to `FilterPanel`). Added required `viewHrefBase` prop, forwarded to `ViewToggle`. | — |
| `app/stories-gallery/Toolbar.tsx` | Dropped a ~160-line commented-out duplicate old version. Hardcoded `'/stories-list'` / `'/stories-gallery'` route strings in `viewHref` → required `hrefBase: { gallery, list }` prop (shared `ViewHrefBase` type imported from `ViewToggle.tsx`). | — |
| `app/stories-gallery/ViewToggle.tsx` | Same route-string fix as `Toolbar.tsx` — added required `hrefBase: ViewHrefBase` prop, exports the `ViewHrefBase` type for reuse. | — |

### Root config

| File | Rename / fix | Manual review |
|---|---|---|
| `package.json` | `name` → `"starter-kit"`. Dropped `mammoth` (unused anywhere in the source repo — dead dependency, confirmed via repo-wide grep) and `cross-env` (was only used to set `NEXT_BUILD_DIR` for a build-output-folder trick specific to the source project's dev workflow). `build`/`start` scripts simplified to plain `next build` / `next start`. | Run `npm install` inside `_starter-export/` before using it as its own project. |
| `tsconfig.json` | Dropped the `.next-build/types/**/*.ts` include entry (artifact of the dropped `cross-env`/`NEXT_BUILD_DIR` trick). Otherwise identical. | — |
| `postcss.config.js` | none | — |
| `tailwind.config.ts` | Removed the large leading block of commented-out dead config (an old duplicate). Colors/fonts otherwise unchanged. | **Not genericized** — hex values are this project's exact brand palette. Token names are generic; swap values for your brand. |
| `next.config.mjs` | Replaced the hardcoded Supabase storage hostname (`rywkkitxkixdoychcoco.supabase.co`) with a placeholder `YOUR-PROJECT-REF.supabase.co`. | Fill in your own Supabase project ref, or this image loader will reject real image URLs. |
| `middleware.ts` | Calls the now-parametrized `updateSession` with `{ protectedPrefix: '/admin', loginPath: '/admin/login' }` instead of hardcoded values baked into the function. | Change the two strings if your protected route isn't `/admin`. |
| `next-env.d.ts` | none (copied so this folder can be its own standalone TS project). | — |

## Files intentionally NOT exported

Everything tagged **CLIENT** in `STARTER-AUDIT.md`: all admin taxonomy CRUD (`collections`,
`content-warnings`, `keywords`, `subjects`, `topics`, `genres`, `formats`), `AdminNav.tsx`,
`BrandLogo.tsx`, all public archive pages (`app/page.tsx`, `about`, `our-team`, `narrators`,
`for-everyone`, `researchers`, `contact*`, `categories`, `healers/*`, `stories/*`,
`stories-gallery/page.tsx`, `stories-list/page.tsx`, `photos/page.tsx`, `privacy`, `terms`,
`photo-credits`), every hardcoded-copy homepage/about/team section under `components/sections`,
`components/about`, `components/team`, `components/healers`, `components/HealersSection.tsx`,
`Navbar.tsx`, `Footer.tsx`, and `lib/types.ts` / `lib/queries.ts` / `lib/constants.ts`.
`react-dom`'s only direct import in the audited tree (`useFormState` in the six admin
`CreateXForm.tsx` files) lives entirely in this excluded set — it's still in `package.json`
above because Next.js requires it as a runtime dependency regardless.

## Verification

`npx tsc --noEmit` run from the repo root (which type-checks this folder too, since it shares
the root `tsconfig.json`'s `**/*.ts`/`**/*.tsx` include globs) — **zero errors**.
`npm run build` was intentionally not run per instructions (dev server running; a production
build would corrupt the `.next` cache).
