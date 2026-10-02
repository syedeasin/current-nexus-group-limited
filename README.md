# CNX Energy website

Public website (English/French) and content dashboard for CurrentNexus Group.
Next.js 16 (App Router), Prisma + PostgreSQL, Tailwind CSS 4, next-intl.

## Local development

```bash
docker compose up -d        # PostgreSQL on localhost:6543 (Docker Desktop must be running)
npm install
npx prisma migrate deploy   # never `migrate reset` — it wipes the database
npx prisma db seed          # first run only: admin user + sample content
npm run dev
```

- Website: http://localhost:3000/en · Dashboard: http://localhost:3000/dashboard
- Type-check with `npx tsc --noEmit` (the production build skips type-checking to fit the server's memory).
- Stop the dev server before `npx prisma generate` on Windows — the running server locks the Prisma engine DLL.
- Never run `npm run build` while the dev server is running; it corrupts `.next`.

## Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection |
| `JWT_SECRET` | Signs dashboard session cookies |
| `SESSION_MAX_AGE_DAYS` | Session length (default 7) |
| `COOKIE_SECURE` | `"false"` while the site is served over plain http (browsers drop secure cookies there); remove once HTTPS is live |
| `STORAGE_DRIVER` | `local` — uploads are stored in `public/uploads` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | First admin, created by the seed |
| `APP_URL` | Optional. Address used in password emails when Dashboard → Settings → Website → *Site address* is empty |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE` | Optional. Enables forgot-password and invitation emails (Dashboard → Settings → Email delivery shows the status and sends a test) |

Without SMTP the dashboard still works: admins copy reset/invitation links from Dashboard → Users and send them themselves.

## Contact page & newsletter

`/contact` and the footer newsletter form store every submission in the `inquiries` table first (Dashboard → Inquiries, with a CSV export of the newsletter list), then email Contact-page messages when SMTP is configured — to Settings → Website → *Send Contact-page messages to*, or the public contact email from Pages → Footer.

## Dashboard roles

Roles and what each can do are listed in Dashboard → Users → *Roles & permissions* (source: `lib/permissions.ts`). Every page and server action checks the permission, not just the menu.

## Deployment

Pushing to `main` deploys to the AWS server (`.github/workflows/deploy.yml`): the server is reset to exactly `origin/main`, then `npm ci`, `prisma generate`, `prisma migrate deploy`, `npm run build`, `pm2 restart cnx-web`, and a health check. Any failing step turns the run red and stops before the restart.

`.env` and `public/uploads` are untracked, so the reset never touches them. nginx must allow uploads of at least 26MB (`client_max_body_size`).

## Dependencies

`package-lock.json` is generated with **npm 10**, the version on the server — npm 11 writes a lockfile that the server's `npm ci` rejects. Add or update packages with:

```bash
npx npm@10 install <package>
```
