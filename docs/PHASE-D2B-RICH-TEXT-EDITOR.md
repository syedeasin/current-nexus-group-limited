# Phase D2-B — Rich Text Editor (Tiptap)

Implementation spec for Claude Code. Work top to bottom. Stop at every **CHECKPOINT**.

Prerequisite: Phase D2-A is complete. Image upload works, `lib/storage.ts` and the upload action persist `Media` rows, magic-byte validation is verified, and the post form has a plain `<textarea>` for content.

Scope: replace that textarea with a Tiptap rich text editor whose output is clean semantic HTML. Inline images inside the content reuse the existing upload pipeline. This is the last piece that makes the post editor feel like WordPress.

---

## 0. Locked environment

| Package | Locked version |
|---|---|
| next | 16.3.0 |
| next-intl | 4.13.7 |
| prisma / @prisma/client | 6.19.3 |
| zod | 4.4.3 |
| react | as installed (19.x) |

### Hard rules

1. **Do NOT run** `npm install <pkg>@latest`, `npm update`, `npm audit fix`, or `npm audit fix --force`.
2. **Do NOT upgrade or downgrade** next, react, prisma, next-intl, or typescript.
3. **New dependencies ARE allowed in this phase, but only the Tiptap packages listed in section 2, pinned to explicit versions.** Install nothing else. After installing, report the exact versions that landed in package.json.
4. **Do NOT run** `npm run build`.
5. Only verification command is `npx tsc --noEmit`.
6. **No new colour tokens.** `docs/PHASE-C-DESIGN-CORRECTION.md` governs design.
7. Do not touch `app/[locale]/`, `messages/`, `i18n/`, `proxy.ts`, or Phase B auth files.

### Compatibility notes — read before installing

- Tiptap **v3** core and `@tiptap/react` support React 19 and Next 16. This is confirmed. Use the current v3 line.
- Tiptap's own **prebuilt UI Components** are NOT fully React 19 ready. **Do not install or use `@tiptap/ui-components` or any `tiptap-ui-*` package.** We build our own toolbar from the low-level editor API, which is stable on React 19.
- Next renders on the server by default, which causes a hydration mismatch with Tiptap unless disabled. The editor **must** be created with `immediatelyRender: false`. This is mandatory, not optional.
- The editor component is `"use client"` and must never be imported by a server component directly in a way that pulls it into the server bundle. Load it via `next/dynamic` with `ssr: false` from the post form.

---

## 1. Pre-flight — report, then stop

1. Print the installed `react` and `react-dom` versions (`npm ls react react-dom`).
2. Print the current content field in `components/dashboard/post-form.tsx` — the exact `<textarea>` block being replaced, with its surrounding label, hint, and any name/id.
3. Confirm the content field name submitted to the server (it should be `content`), and confirm `lib/validation/post.ts` treats `content` as an optional string defaulting to `""`.
4. Confirm the upload action from D2-A: its exact exported name, file path, and return shape, since the inline-image button will call it.
5. Report whether any sanitisation library (`dompurify`, `isomorphic-dompurify`, `sanitize-html`) is already installed. Almost certainly not.

**CHECKPOINT D2B-0** — report all five, then wait for the install go-ahead.

---

## 2. Packages to install

Only these. Pin them; do not add carets that could pull a mismatched core. Install `@tiptap/react`, `@tiptap/pm`, and `@tiptap/starter-kit` first, note the resolved version, then install the extensions **at that same version** so core and extensions never diverge — mismatched Tiptap package versions are a known, hard-to-debug failure.

Core:
- `@tiptap/react`
- `@tiptap/pm`
- `@tiptap/starter-kit`

Extensions (match the version that starter-kit resolved to):
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-placeholder`

Sanitisation (server-side, required — see section 5):
- `isomorphic-dompurify`

Do not install `@tiptap/extension-underline` (StarterKit v3 may already include it — check the StarterKit exports first and only add it if genuinely missing). Do not install table, mention, collaboration, or any other extension this phase does not use.

**CHECKPOINT D2B-1** — after install, report the exact resolved versions of every Tiptap package and confirm they all share the same version number. Then `npx tsc --noEmit`.

---

## 3. Task D2B-1 — the editor component

`components/dashboard/rich-text-editor.tsx`, `"use client"`.

### Configuration

```ts
const editor = useEditor({
  immediatelyRender: false, // MANDATORY for Next SSR
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] }, // h1 is the post title; body content starts at h2
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    }),
    Image.configure({
      HTMLAttributes: { class: "rounded-8" },
    }),
    Placeholder.configure({ placeholder: "Write the article…" }),
  ],
  content: initialHtml,
  editorProps: {
    attributes: {
      class: "prose-editor focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```

### Props

```ts
type RichTextEditorProps = {
  name: string;            // hidden input field name, "content"
  defaultValue?: string;   // existing HTML in edit mode
};
```

### Behaviour

- Keep the current HTML in React state, mirrored into a **hidden `<input type="hidden" name={name}>`** (or a hidden textarea) so the existing form submission and server action need zero changes. The Tiptap editor is a UI over that hidden field, nothing more.
- `onUpdate` writes `editor.getHTML()` into state and the hidden field.
- Heading levels restricted to H2 and H3. The post title is the page's single H1; allowing H1 in body content breaks document outline and SEO.
- Link handling: a toolbar button prompts for a URL (a small inline popover, not `window.prompt` if reasonable, but `window.prompt` is an acceptable fallback this phase). Validate the URL with `z.url()` before applying; reject anything that is not http(s). Empty input removes the link.
- Destroy the editor on unmount to avoid leaks.

### Toolbar

Build it yourself from `editor.chain().focus()...run()` commands and `editor.isActive(...)` for active state. A sticky bar above the editor surface, using existing design tokens:

- Bold, Italic, Strike
- H2, H3, Paragraph
- Bullet list, Ordered list
- Blockquote
- Link, Unlink
- Image (see D2B-2)
- Undo, Redo

Each button:
- lucide icon at `strokeWidth={1.5}`, `16px`
- `aria-label` describing the action
- `aria-pressed` reflecting `editor.isActive(...)` for toggles
- active state uses `bg-surface-1 text-primary`
- disabled state (e.g. Undo with empty history) uses `opacity` and `aria-disabled`
- focus ring per the design correction
- buttons are `type="button"` — critical, or they submit the form

Group related buttons with thin `border-neutral-10` dividers. No radius on individual buttons beyond the group's `rounded-8` container, matching the toolbar pattern of the rest of the dashboard.

### Editor surface styling

The editor renders raw HTML, so its inner elements need styling that the design system's `--color-*: initial` reset does not provide by default. Add a scoped `.prose-editor` block in `globals.css` (this is the one place new CSS is acceptable this phase, and it adds no colour tokens — it uses existing token values via `var(--color-...)`):

- `min-height` around 400px, `p-16`, `rounded-8`, `border-neutral-10`, white background
- Paragraphs, headings (h2/h3), lists, blockquote, links, and images each need sensible spacing and the type scale. Headings use the existing `--text-h5`/`--text-h6` sizes, body uses `--text-p3`.
- Links render in `--color-primary` with an underline.
- Images render at `max-width: 100%`, `height: auto`, `rounded-8`.
- Blockquote gets a left border in `--color-neutral-10` and muted text.
- The placeholder (empty state) shows in `--color-neutral-6` via Tiptap's `is-editor-empty` class.

Report this CSS block for review rather than inventing arbitrary pixel values that clash with the scale.

---

## 4. Task D2B-2 — inline image upload inside the editor

The Image toolbar button reuses the D2-A pipeline. Do not build a second upload path.

- Clicking Image opens a hidden file input (same visually-hidden, focusable pattern as the featured image uploader).
- On selection, call the **existing** `uploadMedia` action from D2-A. Do not duplicate validation or write a new action.
- While uploading, insert nothing yet; show a pending indicator near the toolbar and disable the Image button.
- On success, insert the image at the current cursor with `editor.chain().focus().setImage({ src: url, alt }).run()`.
- **Prompt for alt text before insertion**, defaulting to empty but strongly encouraged via the prompt copy. Unlike the featured image, inline images are not hard-blocked on alt (some are genuinely decorative), but the prompt must ask for it every time.
- On failure, surface the same error text the uploader uses, inline near the toolbar, `role="alert"`.
- The uploaded file becomes a `Media` row exactly as featured images do, so it appears in `/dashboard/media`.

---

## 5. Task D2B-3 — sanitise on save (server-side, non-negotiable)

The editor produces HTML that gets stored and later rendered on the public site. Storing raw editor HTML and rendering it with `dangerouslySetInnerHTML` is a stored-XSS hole if any crafted HTML ever reaches the field — and the content field is a plain string a determined user could POST to directly, bypassing the editor entirely.

Sanitise **on the server, inside the post action, before writing to the database.** Never trust that the client-side editor is the only source of the HTML.

- Create `lib/sanitize-html.ts` exporting `sanitizePostHtml(dirty: string): string` using `isomorphic-dompurify`.
- Allowlist only the tags the editor can produce: `p, br, strong, em, s, h2, h3, ul, ol, li, blockquote, a, img`.
- Allowed attributes: `href, target, rel` on `a`; `src, alt, class` on `img`. Nothing else.
- Force `a` tags to carry `rel="noopener noreferrer nofollow"` and `target="_blank"` regardless of input.
- Restrict `img src` to same-origin `/uploads/...` paths or the configured site URL. Reject `data:` URIs and external hosts — a `data:` image is an exfiltration and payload vector.
- Strip every event handler attribute and any `style` attribute.
- Call `sanitizePostHtml` inside both `createPost` and `updatePost` in `app/dashboard/posts/actions.ts`, on the `content` field, before it reaches Prisma. Recompute `readingTime` from the sanitised HTML.

This runs regardless of what the editor did on the client. The client editor is convenience; this is the security boundary.

**CHECKPOINT D2B-2** — run `npx tsc --noEmit`, list files created or modified, and show the DOMPurify config and the two call sites in the post action.

---

## 6. Task D2B-4 — wire into the post form

- In `components/dashboard/post-form.tsx`, replace the content `<textarea>` with the editor, loaded via `next/dynamic`:

```ts
const RichTextEditor = dynamic(
  () => import("@/components/dashboard/rich-text-editor"),
  { ssr: false, loading: () => <div className="min-h-400 rounded-8 border border-neutral-10" /> }
);
```

- Pass `name="content"` and `defaultValue={post?.content ?? ""}`.
- The hidden field keeps the existing form submission working with no change to the action's `formData.get("content")` call.
- Keep the field label, hint, and panel exactly as they are — only the input mechanism changes.
- Verify the unsaved-changes dirty tracking still fires when only the editor content changes (the hidden input's value changing may not trigger React's dirty check the same way a textarea did — wire `onChange` from the editor into the same dirty flag).

---

## 7. Task D2B-5 — render on the public news page (read-only, minimal)

The stored HTML needs to display correctly where articles already live, `app/[locale]/(marketing)/news/[slug]`. **Do not rebuild that route or change its data source in this phase** — only ensure that if it renders post `content`, it does so safely and with matching typography.

- If the news detail page already renders content HTML, confirm it uses the same sanitisation on output as a defence-in-depth measure, or at minimum that the stored HTML is already sanitised (it is, from D2B-3).
- Provide a shared `.prose-content` CSS class (mirroring `.prose-editor` minus the editor chrome) so an article reads identically to how it looked in the editor. Reuse the same spacing and type rules.
- If the news route does **not** currently pull from the database (it may still be static from the original build), do not wire it up now. Report that state — connecting the public blog to the database is its own later phase. This task is only about having the styling and sanitisation ready.

**CHECKPOINT D2B-3** — report whether the news route is static or DB-driven, and stop.

---

## 8. Verification

Run `npx tsc --noEmit`, then in the browser:

| # | Action | Expected |
|---|---|---|
| 1 | Open New Post | Editor loads, toolbar visible, no hydration error in console |
| 2 | Type a paragraph, bold a word, add an H2 | Formatting applies, toolbar buttons show active state |
| 3 | Create a bullet list and a blockquote | Both render correctly |
| 4 | Add a link to https://example.com | Link applied; a non-http value is rejected |
| 5 | Click the image button, upload a JPEG, give alt text | Image inserts at the cursor |
| 6 | Check `/dashboard/media` | The inline image appears as a Media row |
| 7 | Save as draft, reopen the post | All content and formatting preserved exactly |
| 8 | View the stored `content` in Prisma Studio | Clean semantic HTML, no `style=`, no event handlers |
| 9 | In Prisma Studio, manually set a post's content to `<img src=x onerror=alert(1)>` then edit-and-save it through the form | After save, the onerror is stripped — sanitiser ran server-side |
| 10 | Tab through the toolbar | Every button reachable, visible focus ring, aria-labels announced |
| 11 | Toolbar buttons do not submit the form | Clicking Bold etc. never triggers a save |
| 12 | Reload mid-edit with unsaved changes | Browser warns about leaving |
| 13 | Public `/`, `/en`, `/fr`, one news URL | Unchanged |

Check 9 is the security proof. If the `onerror` survives, the sanitiser is not running server-side — stop and fix before anything else.

---

## 9. Out of scope

- Tables, mentions, embeds, code blocks with syntax highlighting, collaborative editing
- Autosave, revision history
- A media picker to reuse previously uploaded images inside the editor (nice later, not now)
- Connecting the public news page to the database as its data source
- Image resizing / thumbnail generation
- S3 storage driver

---

## 10. Reusable

Flag, do not copy yet:

- `components/dashboard/rich-text-editor.tsx` — generic once colours are tokenised
- `lib/sanitize-html.ts` — fully generic, high value for the starter kit
- The `.prose-editor` / `.prose-content` CSS — generic

---

## 11. Final instruction

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
