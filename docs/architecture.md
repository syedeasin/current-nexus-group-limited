# CNX Website architecture

Next.js 16 App Router, TypeScript, Tailwind v4, Supabase.
Target size: 40 to 50 pages, multi language.

## Rules that must never be broken

1. Server Components by default. Add `"use client"` only on the smallest leaf
   that actually needs interaction.
2. No raw hex colours, no arbitrary Tailwind values. Everything comes from the
   tokens in `app/globals.css`.
3. No hardcoded copy, label, link or contact detail in a component.
   Static chrome comes from `site.config.ts`, translatable copy from `messages/`.
4. Every page exports `generateMetadata`. Every dynamic route exports
   `generateStaticParams`.
5. A component that appears on more than one page lives in `components/`,
   never inside an `app/` route folder.
6. Anything with no client name, colour or data model in it also gets copied to
   `F:\easin-next-starter`.

## Folder structure

```
app/
  layout.tsx                  passthrough only, no html tag
  globals.css
  fonts/
    index.ts
    Switzer-Variable.woff2
    LICENSE-Switzer.txt
  [locale]/
    layout.tsx                html and body, locale, font variable, providers
    not-found.tsx
    error.tsx
    (marketing)/
      layout.tsx              Navbar + main + Footer
      page.tsx                home
      about/page.tsx
      technology/page.tsx
      manufacturing/page.tsx
      contact/page.tsx
      downloads/page.tsx
      distributors/page.tsx
      warranty/page.tsx
      stock/page.tsx
      brands/
        page.tsx
        [slug]/page.tsx
      solutions/
        page.tsx
        [slug]/page.tsx
      services/
        page.tsx
        [slug]/page.tsx
      projects/
        page.tsx
        [slug]/page.tsx
      news/
        page.tsx
        [slug]/page.tsx
    (legal)/
      layout.tsx              narrow reading column
      privacy/page.tsx
      terms/page.tsx
      cookies/page.tsx
  api/
  sitemap.ts
  robots.ts

components/
  layout/
    Container.tsx
    Navbar/
      index.tsx
      NavDropdown.tsx
      MobileMenu.tsx
      LanguageSwitcher.tsx
    Footer/
      index.tsx
      FooterColumn.tsx
      NewsletterForm.tsx
      SocialLinks.tsx
  ui/                         design system primitives, no business logic
    Button.tsx
    Badge.tsx
    Input.tsx
    Card.tsx
    Heading.tsx
    Section.tsx
    Breadcrumbs.tsx
    Pagination.tsx
  sections/
    home/                     one file per homepage section
    shared/                   CTABand.tsx and anything reused across pages
  forms/
  seo/
    JsonLd.tsx

lib/
  supabase/
    client.ts
    server.ts
    public.ts
  queries/                    one file per table, all data access lives here
    brands.ts
    news.ts
    projects.ts
    downloads.ts
  utils.ts
  slug.ts
  imageMeta.ts
  seo.ts                      shared metadata builder
  constants.ts

types/
  database.ts                 generated from Supabase
  content.ts

i18n/
  routing.ts
  request.ts
  navigation.ts

messages/
  en.json
  zh.json

docs/
  architecture.md
  figma/

public/
  logo.svg
  footer-wordmark.svg
  images/
  logos/                      Tier 1 brand logos
```

## Why route groups

`(marketing)` and `(legal)` do not add URL segments. They exist so each group
can have its own layout. Marketing pages get Navbar and Footer. Legal pages get
a narrow reading column. Admin, when it arrives, goes in its own group with no
locale prefix and no public chrome.

## Data layer

- Supabase driven: brands, news, projects, downloads.
  Each gets a list page and a `[slug]` detail page.
- Everything else is a static page built from section components.
- All queries live in `lib/queries/`. A component never imports the Supabase
  client directly. This keeps caching and error handling in one place.
- Detail pages use `generateStaticParams` plus ISR so 50 pages do not become
  50 runtime database hits.

## i18n

- Library: `next-intl`.
- Locales live in `i18n/routing.ts`. Default is `en`.
- Every URL is prefixed, for example `/en/brands` and `/zh/brands`.
- `middleware.ts` handles locale detection and redirects.
- Navigation always goes through the wrappers in `i18n/navigation.ts`, never
  the raw `next/link`. This keeps the locale prefix correct everywhere.
- Slugs for database content stay language neutral. Translated titles live in
  the database, not in `messages/`.

## Naming

- Components: PascalCase files, default export.
- A component folder with an `index.tsx` is used only when it has siblings.
- Everything else: camelCase files.
- Route folders: lowercase, hyphenated, matching the public URL.
