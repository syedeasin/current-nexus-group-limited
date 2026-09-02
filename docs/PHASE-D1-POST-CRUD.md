# Phase D1 — Post CRUD

Implementation spec for Claude Code. Work top to bottom, one task at a time.
Stop and report at every **CHECKPOINT**.

Prerequisite: Phase C is complete. `/dashboard` and `/dashboard/posts` render inside the shell, the post list has search, status filter and pagination, and `app/dashboard/[...notfound]/page.tsx` keeps unbuilt sections inside the shell.

Scope of this phase: full create, edit, delete, publish and unpublish for posts, with every field the Post model carries. The content field is a **plain textarea** in this phase. The rich text editor and image upload arrive in Phase D2. Build the form so swapping that one field later touches nothing else.

---

## 0. Locked environment — do not change

| Package | Locked version |
|---|---|
| next | 16.3.0 |
| next-intl | 4.13.7 |
| prisma / @prisma/client | 6.19.3 |
| zod | 4.4.3 |
| bcryptjs | 3.0.3 |
| lucide-react | as installed in Phase C |

### Hard rules

1. **Do NOT run** `npm install <pkg>@latest`, `npm update`, `npm audit fix`, or `npm audit fix --force`.
2. **Do NOT upgrade or downgrade** any package. Adapt code to versions, never the reverse.
3. **No new dependencies in this phase.** Everything needed is already installed. If you believe something is missing, stop and report rather than installing.
4. **Do NOT run** `npm run build`. A dev server is running and a production build corrupts the `.next` cache.
5. The only verification command is `npx tsc --noEmit`.
6. **Do NOT add any colour token.** `docs/PHASE-C-DESIGN-CORRECTION.md` governs all design values in this phase too.
7. Do not touch `app/[locale]/`, `messages/`, `i18n/`, `proxy.ts`, or any Phase B `lib/` auth file.
8. Do not build the rich text editor, image upload, media library, or featured image picker. Those are Phase D2.

### Version-specific behaviour

- **Next 16:** `params` and `searchParams` in page props are Promises. Type them as `Promise<...>` and `await`.
- **Next 16:** `cookies()` is async, already handled inside `lib/session.ts`.
- **zod 4:** use `z.email()`, `z.url()` — not `z.string().email()`.
- **Server actions:** mutations go through server actions, not route handlers.

---

## 1. Design values — reuse Phase C decisions

All from `docs/PHASE-C-DESIGN-CORRECTION.md`. Restated here so this file is self-contained:

- Colours: `primary`, `secondary`, `tertiary`, `surface-1`, `surface-2`, `neutral-1` … `neutral-11`, `success`, `warning`, `error`, `white`. Nothing else exists.
- Spacing scale is 1px based: `p-24` is 24px.
- Type scale: `text-h4` page titles, `text-h6` section headings, `text-p2` panel headings, `text-p3` body, `text-p4` labels and helper text, `text-btn-sm` buttons, `text-badge` badges.
- Radius: `rounded-16` cards and panels, `rounded-8` inputs and selects, `rounded-full` buttons.
- Borders `border-neutral-10`. Hover fills `surface-1`. Page background `surface-2`.
- Readable text never lighter than `neutral-5`.
- Focus ring on everything interactive: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`.
- Transitions on colour properties only, `duration-200`.

Reuse the existing `components/dashboard/*` pieces rather than writing new variants. If a form input style is needed in more than one place, extract it into a shared component instead of repeating class strings.

---

## 2. Task D1-1 — `lib/slug.ts`

Create if it does not already exist. Check first.

```ts
import slugify from "slugify";

export function makeSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function readingTimeFromHtml(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
```

Then add a uniqueness helper in the same file. The `Post` model has `@@unique([slug, locale])`, so a duplicate slug throws a Prisma `P2002` error. Resolve it before writing rather than catching afterwards:

```ts
// Returns the given slug, or slug-2, slug-3 … until free for that locale.
// excludeId lets an edit keep its own slug.
export async function uniquePostSlug(
  base: string,
  locale: Locale,
  excludeId?: string
): Promise<string>
```

Implementation: query existing slugs matching `base` or `base-%` for that locale, then pick the first free suffix. One query, not a loop of queries.

---

## 3. Task D1-2 — `lib/validation/post.ts`

A single zod schema shared by the client form and the server action. Defining it once is the point — do not write a second copy inside the action.

Fields and rules:

| Field | Rule |
|---|---|
| `title` | required, 1–180 chars, trimmed |
| `slug` | optional; if blank the action derives it from the title. If provided, must match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` |
| `locale` | `z.enum(["EN", "FR"])`, default `EN` |
| `excerpt` | optional, max 300 |
| `content` | optional string, defaults to `""` |
| `status` | `z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"])` |
| `categoryId` | optional string, empty string coerced to `null` |
| `tags` | optional string of comma-separated names, max 10 tags, each 1–40 chars |
| `featuredImage` | optional, must be a URL or a root-relative path, max 500 |
| `featuredImageAlt` | optional, max 180 |
| `metaTitle` | optional, max 60 |
| `metaDescription` | optional, max 160 |
| `focusKeyword` | optional, max 80 |
| `canonicalUrl` | optional, `z.url()`, max 500 |
| `ogImage` | optional, URL or root-relative path, max 500 |
| `noIndex` | boolean, default false |

Notes:

- `metaTitle` 60 and `metaDescription` 160 are the practical limits before Google truncates. Enforce them as hard `max()` rules, and surface a live counter in the UI (Task D1-5).
- Empty form fields arrive as `""`, not `undefined`. Preprocess so blank optional fields become `null`/`undefined` rather than storing empty strings in the database — the difference matters when generating meta tags later.
- Export both the schema and its inferred type.

---

## 4. Task D1-3 — `app/dashboard/posts/actions.ts`

All mutations. `"use server"` at the top.

### Shared rules for every action

1. **First statement is the permission check.** No exceptions, and never rely on the UI having hidden a button.
2. Validate input with the zod schema before touching Prisma.
3. Return a discriminated result rather than throwing for expected failures:
   ```ts
   type ActionResult =
     | { ok: true; id: string }
     | { ok: false; error: string; fieldErrors?: Record<string, string> };
   ```
4. Call `revalidatePath("/dashboard/posts")` and `revalidatePath("/dashboard")` after any write, so the list and the overview counters refresh.
5. Never trust `authorId`, `viewCount`, `createdAt` or `id` from form input. Set them server-side.

### `createPost(formData: FormData)`

- `const user = await requirePermission("post.create")`
- Validate.
- **Publish gate:** if the requested status is `PUBLISHED` and the user cannot `post.publish`, downgrade to `PENDING_REVIEW` and include a note in the result so the UI can tell them. Do not silently publish, and do not hard-fail either — an AUTHOR submitting for review is normal workflow.
- Derive the slug from the title when blank, then run it through `uniquePostSlug`.
- Compute `readingTime` from content.
- Set `publishedAt` to now only when the resulting status is `PUBLISHED`.
- `authorId` comes from the session user, never from the form.
- Handle tags: split, trim, drop blanks, dedupe case-insensitively, `upsert` each `Tag` on `slug_locale`, then connect through `PostTag`.
- Redirect is the caller's job — return the new id, let the client navigate.

### `updatePost(id: string, formData: FormData)`

- Load the existing post first (`select` only `authorId` and `status`).
- `notFound()` if missing.
- Authorise with `canEditPost(user, post)` from `@/lib/permissions`, not with a role string comparison. An AUTHOR may edit only their own post.
- Same publish gate as create.
- Slug uniqueness must pass `excludeId: id` so an unchanged slug does not collide with itself.
- `publishedAt` rule: set it when the post transitions into `PUBLISHED` for the first time. Do **not** overwrite an existing `publishedAt` on subsequent edits — that would silently change the public sort order and the article's stated date.
- Tags: replace the whole set. Delete `PostTag` rows for this post that are no longer present, create the new ones. Do not delete `Tag` rows themselves — other posts may use them.

### `deletePost(id: string)`

- Load `authorId` and `status`, authorise with `canDeletePost(user, post)`. An AUTHOR may delete only their own `DRAFT`.
- `PostTag` rows cascade automatically via the schema. Do not delete them manually.
- Return `{ ok: true }`.

### `publishPost(id: string)` and `unpublishPost(id: string)`

- `requirePermission("post.publish")`.
- `publishPost` sets `status: "PUBLISHED"` and sets `publishedAt` only if currently null.
- `unpublishPost` sets `status: "DRAFT"` and leaves `publishedAt` untouched, so re-publishing keeps the original date.

**CHECKPOINT D1-A** — run `npx tsc --noEmit` and report. List the exported action signatures.

---

## 5. Task D1-4 — shared form controls

Before the post form, extract the repeated input styling into small server components under `components/dashboard/form/`:

- `field-label.tsx` — `<label>` at `text-p4`, `neutral-4`, with an optional required marker that is **not** colour-only (append a visually-hidden "required" for screen readers alongside any asterisk)
- `text-input.tsx` — `rounded-8`, `border-neutral-10`, `bg-white`, `px-16 py-12`, `text-p3`, focus ring
- `textarea.tsx` — same, with `min-h` and `resize-y`
- `select.tsx` — same shape as text input
- `field-error.tsx` — `text-p4` in `error`, with `role="alert"`
- `field-hint.tsx` — `text-p4` in `neutral-5`

Every control must accept and forward `id`, `name`, `aria-describedby` and `aria-invalid`. Labels are real `<label htmlFor>` — never a floating `<div>` styled to look like one, and never placeholder-as-label.

These are generic and go to the starter kit later. Keep CNX-specific values out of them.

---

## 6. Task D1-5 — `components/dashboard/post-form.tsx`

Client component. Used by both create and edit.

### Props

```ts
type PostFormProps = {
  mode: "create" | "edit";
  post?: PostFormValues & { id: string };
  categories: { id: string; name: string; locale: string }[];
  canPublish: boolean;
};
```

### Layout

Two columns on `lg` and above, single column below. Left column is the main content, right column is a sticky settings rail at `w-360`.

**Left column — one bordered `rounded-16` white panel per group:**

1. **Content**
   - Title (large input, `text-h6` sized text since it is the primary field)
   - Slug, with a live preview line beneath reading `/blog/<slug>` in `neutral-5`
   - Excerpt (textarea, 3 rows, counter to 300)
   - Content (plain `<textarea>`, `min-h-400`, monospace is fine here since Phase D2 replaces it)

2. **SEO**
   - Meta title, with a live counter `n/60` that turns `warning` past 55 and `error` past 60
   - Meta description, counter `n/160`, same thresholds at 150 and 160
   - Focus keyword
   - Canonical URL
   - OG image URL
   - "Hide from search engines" checkbox bound to `noIndex`, with a hint explaining it adds a `noindex` tag
   - A small **search preview** block: renders the meta title in `primary`, the URL in `success`, and the meta description in `neutral-5`, approximating a Google result. Fall back to the post title and excerpt when the meta fields are blank, exactly as search engines do. This is the single most useful thing on the page for an SEO-focused client — build it properly, not as an afterthought.

**Right column — sticky rail, stacked panels:**

3. **Publish**
   - Status select. When `canPublish` is false, omit the `PUBLISHED` option entirely and show a hint that an editor must approve it.
   - Primary submit button: "Publish" when status is `PUBLISHED`, otherwise "Save"
   - Secondary "Save as draft" button that submits with status forced to `DRAFT`
   - In edit mode, a delete control (see below)

4. **Organisation**
   - Locale select (EN / FR)
   - Category select, populated from props, with an empty "No category" option
   - Tags: a single text input taking comma-separated names, with a hint explaining the format and the 10-tag limit. Do not build a token/chip input in this phase.

5. **Featured image** (Phase D1 placeholder)
   - A URL text input plus an alt text input
   - A hint saying upload arrives next phase
   - If a URL is present, render a preview with `<img>` and the alt text applied. Do not use `next/image` for arbitrary external URLs without configuring domains — a plain `<img>` is correct here.

### Behaviour

- Use `useTransition` for the pending state; disable the submit buttons and change their label while pending.
- On success in create mode, `router.push` to the edit page for the returned id, then `router.refresh()`.
- On success in edit mode, stay on the page, `router.refresh()`, and show an inline success message that clears after a few seconds.
- On failure, render `fieldErrors` next to the relevant inputs and a summary at the top with `role="alert"`. Move focus to the summary so keyboard and screen reader users are not left guessing.
- **Slug behaviour:** in create mode, auto-fill the slug from the title as the user types, but stop auto-filling the moment the user edits the slug manually. In edit mode, never auto-change an existing slug — changing a published URL breaks inbound links and search rankings. If the user edits the slug of a `PUBLISHED` post, show a warning hint that the old URL will stop working.
- **Unsaved changes guard:** track whether the form is dirty and warn on navigation away. A `beforeunload` listener covers browser navigation. Keep it simple; do not intercept in-app router navigation in this phase.
- Delete uses a two-step inline confirmation: the button becomes "Confirm delete" plus a "Cancel", and only the second click calls the action. Do not use `window.confirm`, and do not build a modal in this phase.

---

## 7. Task D1-6 — the pages

### `app/dashboard/posts/new/page.tsx`

- Server component.
- `const user = await requirePermission("post.create")`.
- Fetch categories: `prisma.category.findMany({ orderBy: { sortOrder: "asc" } })`.
- Compute `canPublish = can(user.role, "post.publish")`.
- Render the page header (eyebrow "Content", `h1` "New post") and `<PostForm mode="create" ... />`.
- No `<main>` — the layout owns it.

### `app/dashboard/posts/[id]/edit/page.tsx`

- Server component. `params` is a Promise, await it.
- Load the post with its category and tags. `notFound()` if missing.
- Authorise with `canEditPost`. If the user cannot edit it, call `notFound()` rather than showing a forbidden page — do not confirm to an unauthorised user that a given post id exists.
- Map the loaded post into `PostFormValues`, joining tag names into the comma-separated string.
- Header shows the post title and, when published, a "View on site" link to `/{locale}/blog/{slug}` opening in a new tab. If the public blog route does not exist yet at that path, report it and omit the link rather than shipping a broken one.

### Wire up the list

- `components/dashboard/posts-table.tsx`: make each title a link to the edit page. Add an Actions column with Edit, and Publish or Unpublish depending on current status, each gated on the viewer's permissions.
- `app/dashboard/posts/page.tsx`: the New Post button becomes a real link to `/dashboard/posts/new`, no longer `aria-disabled`. Render it only when the user can `post.create`.
- Row-level publish and unpublish need a tiny client component wrapping the server action, since the table itself is a server component.

**CHECKPOINT D1-B** — run `npx tsc --noEmit` and list every file created or modified.

---

## 8. Verification

Run `npx tsc --noEmit`, then walk these in the browser and report pass/fail:

| # | Action | Expected |
|---|---|---|
| 1 | Click New Post | Form loads, both columns render |
| 2 | Type a title | Slug auto-fills, `/blog/...` preview updates |
| 3 | Edit the slug manually, then keep typing the title | Slug stops auto-following |
| 4 | Submit with an empty title | Inline error, focus moves to the summary, nothing saved |
| 5 | Fill title and content, Save as draft | Redirects to edit page, post appears in the list as DRAFT |
| 6 | Type past 60 chars in meta title | Counter turns `error`, submit blocked with a field error |
| 7 | Fill meta fields | Search preview updates live |
| 8 | Add `solar, bess, africa` to tags and save | Three tags created, reloading the edit page shows them back in the input |
| 9 | Set status to Published and save | Post shows PUBLISHED in the list, `publishedAt` set |
| 10 | Edit that post and save again | `publishedAt` unchanged from step 9 |
| 11 | Unpublish from the list row | Status becomes DRAFT, `publishedAt` still set |
| 12 | Create a post with a title matching an existing one | Slug becomes `existing-slug-2`, no Prisma error |
| 13 | Delete a draft, two-step confirm | Removed from the list, overview counters update |
| 14 | Set your role to AUTHOR in Prisma Studio, reload the form | No PUBLISHED option in the status select, hint shown |
| 15 | As AUTHOR, open the edit URL of a post authored by someone else | 404, not a forbidden page |
| 16 | Set role back to ADMIN | Everything returns |
| 17 | Tab through the whole form | Every control reachable, visible focus ring, labels announced |
| 18 | Visit `/`, `/en`, `/fr` and one blog URL | Public site unchanged |

Check 15 is the one people skip. Do it.

---

## 9. Out of scope — Phase D2 and later

- Rich text editor, image upload, media library, featured image picker
- Bulk actions, row selection, column sorting
- Revision history, autosave, scheduled publishing
- Category, tag, user or settings management screens
- The public blog page reading from the database
- Translation linking through `translationKey`

---

## 10. Reusable

Flag at the end, do not copy yet:

- `components/dashboard/form/*` — generic once verified
- `lib/slug.ts` — fully generic

---

## 11. Final instruction

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
