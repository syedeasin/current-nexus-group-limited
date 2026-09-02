# Phase D2-A — Image Upload & Media

Implementation spec for Claude Code. Work top to bottom. Stop at every **CHECKPOINT**.

Prerequisite: Phase D1 is code-complete. Post create, edit, delete, publish and unpublish work, and the post form has a Featured image panel currently accepting a pasted URL.

Scope: real file upload for the featured image, persisted as `Media` rows, with a storage adapter that swaps to S3 by editing one file. The rich text editor and inline in-content images are D2-B, not this phase.

---

## 0. Locked environment

| Package | Locked version |
|---|---|
| next | 16.3.0 |
| next-intl | 4.13.7 |
| prisma / @prisma/client | 6.19.3 |
| zod | 4.4.3 |

### Hard rules

1. **Do NOT run** `npm install <pkg>@latest`, `npm update`, `npm audit fix`, or `npm audit fix --force`.
2. **Do NOT upgrade or downgrade** anything.
3. **No new dependencies.** Image dimensions are read in the browser, not with `sharp` or `image-size`. If you believe a package is unavoidable, stop and report instead of installing.
4. **Do NOT run** `npm run build`.
5. Only verification command is `npx tsc --noEmit`.
6. **No new colour tokens.** `docs/PHASE-C-DESIGN-CORRECTION.md` governs design.
7. Do not touch `app/[locale]/`, `messages/`, `i18n/`, `proxy.ts`, or Phase B auth files.

---

## 1. Carry-over items from D1 — do these first

Two things from the previous prompt were not completed. Close them before starting upload work.

**1a. The try/catch audit was never answered.** Report explicitly: do any of the five actions in `app/dashboard/posts/actions.ts` wrap a `notFound()` or `redirect()` call inside a `try/catch`? Those work by throwing a control-flow error, so a broad catch swallows them and authorisation silently stops working. If yes, narrow the catch to Prisma errors or re-throw Next control-flow errors. If no, say so plainly.

**1b. The search preview still renders `/blog/your-post-slug`.** The real route is `app/[locale]/(marketing)/news/[slug]`. Create `lib/routes.ts` as the single source of truth:

```ts
export function postPublicPath(locale: string, slug: string): string;
export function postPublicUrl(locale: string, slug: string): string; // absolute, via NEXT_PUBLIC_SITE_URL
```

Confirm the actual resolved path — report whether the `(marketing)` group means it is `/{locale}/news/{slug}`. Use the helper in the search preview and in the slug preview line under the slug field. Restore the "View on site" link on the edit page for `PUBLISHED` posts, using `postPublicUrl`, `target="_blank"`, `rel="noopener noreferrer"`.

Everything that later needs this path — canonical URL, `og:url`, sitemap — uses this helper. Never a hardcoded string.

**CHECKPOINT D2-0** — report both, run `npx tsc --noEmit`, then continue.

---

## 2. Architecture — files on disk, metadata in the database

The image file never goes into Postgres. Binary in the database bloats backups, defeats CDN caching, and burns expensive RDS storage. The `Media` table stores where the file is and what it is; the bytes live on disk, and later in S3.

```
Browser picks a file
   → reads width/height locally, then POSTs the File in FormData
       → server action validates type, size, and magic bytes
           → lib/storage.ts writes it and returns a public URL
               → Prisma creates a Media row
                   → the URL goes into the post's featuredImage field
```

### Local storage decision, and its limit

Files go to `public/uploads/` in this phase. Next serves that directory statically, so it works immediately in development with no extra route.

State the limit plainly rather than discovering it at deploy time: **files written into `public/` at runtime are not reliably served by a production Next build**, and on any container or serverless host the disk is ephemeral, so uploads vanish on restart. That is acceptable here only because S3 replaces this adapter before the AWS deploy. Do not build any feature that assumes local disk persists.

---

## 3. Task D2A-1 — `lib/storage.ts`

The whole point of this file is that swapping to S3 later touches nothing else. Keep the interface storage-agnostic: no callers should know whether a file is on disk or in a bucket.

```ts
export type StoredFile = {
  url: string;       // public URL or root-relative path
  key: string;       // storage key, e.g. "uploads/2026/08/abc123.webp"
  fileName: string;  // sanitised original name, for display
  mimeType: string;
  size: number;
};

export async function putFile(file: File, opts?: { prefix?: string }): Promise<StoredFile>;
export async function deleteFile(key: string): Promise<void>;
```

Implementation requirements for the local driver:

- Read `STORAGE_DRIVER` from env. It is already set to `local` in `.env`. Throw a clear error for any unrecognised value rather than silently falling back.
- **Never use the client-supplied filename as the stored filename.** Generate the stored name yourself: `crypto.randomUUID()` plus the extension derived from the validated MIME type. This closes path traversal (`../../etc/passwd`), overwrite attacks, and Windows reserved names in one move.
- Keep the original name only as a display label, and sanitise it before storing: strip directory separators, control characters, and leading dots; truncate to 120 chars.
- Organise by date: `public/uploads/YYYY/MM/`. A single flat folder becomes unmanageable and slows directory listing once a client has uploaded a few thousand files.
- Create directories recursively with `fs/promises.mkdir({ recursive: true })`.
- Return a root-relative `url` like `/uploads/2026/08/<uuid>.webp`.
- `deleteFile` must resolve the final path and verify it still sits inside the uploads root before unlinking. Never unlink a path derived from user input without that check.

Add `/public/uploads` to `.gitignore`. Uploaded content is not source code.

---

## 4. Task D2A-2 — validation rules

Put these in `lib/validation/upload.ts` so both the action and any future uploader share them.

- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/gif`. Nothing else. Explicitly reject `image/svg+xml` — SVG is executable markup and an SVG upload is a stored XSS vector unless sanitised. If SVG support is wanted later it needs a sanitiser, so it is out of scope now; note that rather than quietly allowing it.
- **Max size:** 8 MB. Reject above that with a message naming the actual size.
- **Verify magic bytes, do not trust `file.type`.** The MIME type in a multipart upload is attacker-controlled. Read the first bytes and confirm the signature matches the claimed type:
  - JPEG `FF D8 FF`
  - PNG `89 50 4E 47 0D 0A 1A 0A`
  - GIF `47 49 46 38`
  - WebP `52 49 46 46` at 0 with `57 45 42 50` at 8
  - AVIF `66 74 79 70` at 4, brand `avif` or `avis`
  Mismatch means reject. This is the single most important check here — without it, "image upload" is "arbitrary file upload".
- Derive the stored extension from the **verified** signature, never from the submitted filename.

---

## 5. Task D2A-3 — `app/dashboard/media/actions.ts`

```ts
export async function uploadMedia(formData: FormData): Promise<
  | { ok: true; media: { id: string; url: string; alt: string | null; width: number | null; height: number | null } }
  | { ok: false; error: string }
>;

export async function deleteMedia(id: string): Promise<{ ok: true } | { ok: false; error: string }>;

export async function updateMediaAlt(id: string, alt: string): Promise<{ ok: true } | { ok: false; error: string }>;
```

Rules:

- `uploadMedia` first statement: `const user = await requirePermission("media.upload")`.
- Validate before writing anything to disk. A rejected file must leave no trace.
- Accept optional `width` and `height` form fields sent by the browser. Parse as integers, clamp to a sane range, ignore anything non-numeric. These are display metadata only, so untrusted values are tolerable — but never use them for layout maths without a fallback.
- Create the `Media` row with `uploadedById: user.id`.
- If the Prisma insert fails after the file is written, delete the orphaned file before returning the error. An upload that half-succeeds is worse than one that fails.
- `deleteMedia`: `requirePermission("media.deleteAny")`, or allow the uploader to delete their own. Remove the `Media` row and the file. If the file is already gone, still remove the row and do not error.
- `revalidatePath("/dashboard/media")` and `revalidatePath("/dashboard")` after writes.

### Server action body size limit

Next caps server action request bodies at 1 MB by default, so an 8 MB upload fails with an unhelpful error. Raise it in `next.config.ts`:

```ts
experimental: {
  serverActions: { bodySizeLimit: "10mb" },
}
```

Confirm the correct key for Next 16.3 before editing, and report if it has moved out of `experimental`. Set the limit slightly above the 8 MB validation ceiling so the app's own error message is what the user sees, not a framework-level failure.

---

## 6. Task D2A-4 — `components/dashboard/image-upload.tsx`

Client component. Replaces the URL text input in the post form's Featured image panel.

### Props

```ts
type ImageUploadProps = {
  name: string;            // form field name for the URL, e.g. "featuredImage"
  altName: string;         // form field name for alt text
  defaultUrl?: string | null;
  defaultAlt?: string | null;
  label?: string;
};
```

### Behaviour

- Renders a drop zone: dashed `border-neutral-10` at `rounded-16`, `surface-2` fill, an `ImagePlus` lucide icon at `neutral-6`, and text inviting a click or drop.
- The real `<input type="file">` is visually hidden but focusable and labelled. **Do not use `display: none`** — that removes it from the tab order. Use a visually-hidden class and a `<label>` wrapping the drop zone.
- Drag and drop supported, with a visible `border-primary` state while dragging over.
- On selection: read `width` and `height` in the browser via `createImageBitmap` (fall back to an `Image` element with `URL.createObjectURL`), show an immediate local preview using the object URL, then upload. Revoke the object URL when done to avoid a memory leak.
- Show a determinate progress state if straightforward, otherwise a clear pending state. Disable the surrounding submit buttons while uploading so a post cannot be saved mid-upload.
- On success: store the returned URL in a hidden input named `name`, and render the preview from the real URL.
- On failure: inline error with `role="alert"`, drop zone returns to empty, hidden input untouched.
- Once an image is set: show the preview, the file size, the pixel dimensions, a Replace button and a Remove button. Remove clears the hidden input; it does **not** delete the `Media` row, since the same file may be used elsewhere.

### Alt text is required, and enforced

Below the preview, an alt text input that is **required whenever an image is set**. Client-side validation blocks submit with an empty alt, and `lib/validation/post.ts` gets a refinement enforcing the same rule server-side — `featuredImage` present implies `featuredImageAlt` non-empty.

This is not optional politeness. Alt text is a WCAG 2.1 A requirement, and for this client it is also SEO surface. Making it required at the moment of upload is the only reliable way to get it filled in; a form that lets it slide will ship a site full of empty alts.

Add a hint explaining what good alt text is: describe the image's content and purpose, do not start with "image of", leave it empty only for purely decorative images — and note that a featured image is never decorative.

### Preview rendering

Use a plain `<img>`, not `next/image`. Uploaded paths are runtime values and `next/image` needs configured domains or loaders. Set explicit `width` and `height` attributes from the stored dimensions so the layout does not jump, plus `loading="lazy"`.

---

## 7. Task D2A-5 — wire into the post form

- Replace the Featured image panel's URL input with `<ImageUpload name="featuredImage" altName="featuredImageAlt" ... />`.
- Keep the same field names so `actions.ts` and the zod schema need no changes beyond the new alt refinement.
- Apply the identical treatment to the **OG image** field in the SEO panel, reusing the same component with `name="ogImage"`. OG images have no alt text, so make the alt input optional via a prop rather than duplicating the component.
- Update the search preview so that when an OG image is set it renders a small thumbnail, which is closer to how the link will actually appear when shared.

---

## 8. Task D2A-6 — minimal media list

Not the full media library, just enough to see and manage what has been uploaded.

`app/dashboard/media/page.tsx`, server component:

- `requirePermission("media.upload")`
- Grid of uploaded media, newest first, paginated at 24
- Each tile: thumbnail, filename, dimensions, size, upload date, uploader name
- Alt text shown beneath, editable inline via `updateMediaAlt`, with an obvious warning marker on any item missing alt text
- Delete control, two-step inline confirm, gated on permission
- Empty state consistent with the existing `empty-state.tsx`

This makes `/dashboard/media` a real route, so the catch-all no longer intercepts it. Leave categories, tags, users and settings as they are.

**CHECKPOINT D2A-A** — run `npx tsc --noEmit`, list every file created or modified, and report the `next.config.ts` change.

---

## 9. Verification

| # | Action | Expected |
|---|---|---|
| 1 | Open New Post, click the drop zone | File picker opens |
| 2 | Tab to the drop zone | It is focusable with a visible ring, Space or Enter opens the picker |
| 3 | Upload a normal JPEG | Preview appears, dimensions and size shown |
| 4 | Save the post, reopen it | Image still there, alt text preserved |
| 5 | Check `public/uploads/YYYY/MM/` | File present with a UUID name, not the original filename |
| 6 | Check Prisma Studio `media` table | Row with url, mimeType, size, width, height, uploadedById |
| 7 | Try to save with an image but empty alt | Blocked client-side, and blocked server-side if the client check is bypassed |
| 8 | Rename a `.txt` file to `.jpg` and upload | Rejected on magic bytes, no file written to disk |
| 9 | Upload an `.svg` | Rejected with a clear reason |
| 10 | Upload something over 8 MB | Rejected with the app's own message, not a framework error |
| 11 | Drag and drop an image | Same result as the picker, drag-over state visible |
| 12 | Remove an image from a post | Field clears, `Media` row still exists |
| 13 | Visit `/dashboard/media` | Grid shows uploads, missing-alt items flagged |
| 14 | Delete from the media list | Row and file both gone |
| 15 | Set role to AUTHOR, upload | Still works (AUTHOR has `media.upload`) |
| 16 | Set role to VIEWER, open New Post | Blocked, no upload possible |
| 17 | Search preview | Shows `/news/<slug>`, not `/blog/<slug>` |
| 18 | Public site `/`, `/en`, `/fr`, one news URL | Unchanged |

Checks 8 and 9 are the security ones. Do not skip them.

---

## 10. Out of scope

- Rich text editor and inline in-content images (D2-B)
- Image resizing, thumbnail generation, WebP conversion — needs `sharp`, deliberately deferred
- S3 driver — written when the AWS deploy happens, by editing `lib/storage.ts` only
- Media picker modal for choosing from previously uploaded files
- Bulk upload, folders, tagging media
- SVG support

---

## 11. Reusable

Flag, do not copy yet:

- `lib/storage.ts` — fully generic
- `lib/validation/upload.ts` — fully generic
- `components/dashboard/image-upload.tsx` — generic once colours are tokenised
- `lib/routes.ts` — project-specific paths, generic shape

---

## 12. Final instruction

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
