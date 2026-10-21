# Tier 1 Brands — gap report (docx vs Figma vs code)

_2026-10-21. Sources: Vicky's "CNX-Tier 1 brands-Specific Landing Page.docx", Figma "📐 Phase 2 Wireframes" (frames 162:3196 JA Solar, 164:3496 PV & BESS Brands + notes), code on `main` (dadfb9d), localhost:3000._

> The "Tier 1 brands **Collection** page.docx" was not among the files received (the second file was the old revision-1008 docx). Collection-page notes below come from the Figma wireframe only.

## 1. Current state

| Item | State |
|---|---|
| `/tier-1-brands/[slug]` route | **Does not exist** → 404. Links render as plain text (`ROUTES_WITHOUT_PAGE.prefixes`) and are hidden by default (`DEFAULT_HIDDEN_PATHS`) |
| `/about/pv-bess-brands` (collection) | Banner-only placeholder, hidden → 404 |
| Brand data / CMS | None. Mega menu brand list is hard-coded in `config/nav.config.ts` (7 brands); visibility list hard-coded in `config/page-visibility.ts` |
| `QuotationForm` (product pages, live) | **Stub** — `submitInquiryStub` only `console.info`s. Quote requests from BC page are lost today |
| Inquiry form builder | Supports text/email/tel/number/textarea/select. No **date**, no **file upload** |
| Case studies | No model, no detail page. `CaseStudySection` = one full-bleed case, not a card grid |
| Downloads | Filter groups exist; no "Brand" group (admin can add, no code) |

## 2. Brand page: docx vs Figma wireframe

The docx **replaces** the wireframe structure. Main differences:

| # | Docx section | Figma wireframe | Change |
|---|---|---|---|
| 1 | Hero: H1 "Source [Brand] [Category] Through CNX Energy", body, 2 CTAs + text link "Need help selecting a model?" | H1 "JA Solar modules, supplied and supported by CNX", 2 CTAs, **stats strip** (Tier 1 / 2005 / XX GW / IEC) | New H1 formula per brand (see list below), add text link, stats strip not in docx |
| 2 | Brand Overview (2 paragraphs, neutral) | About the brand + image | Copy tone change |
| 3 | Product display: photo, series/model, category, 3–5 params, **View Specifications / Download Datasheet / Request a Quote** | Cards with filter chips, Datasheet + Inquire | 3 buttons, category label, param list |
| 4 | **Product Advantages** — highlights depend on category (modules: power, size, bifaciality, temp coeff · inverters: power range, phases, grid compat, monitoring · BESS: energy, power, cycle life, integration) | — | **New** |
| 5 | **For the buyers** — 6 numbered items | "Why source through CNX" — 4 cards | Replace, 6 items numbered 01–06 |
| 6 | **Technical Documents & Certifications** — intro + 5 doc types + CTA "Request Technical Documents" | Certification badge row | Replace |
| 7 | **Application Scenarios** — image + text cards (Residential, C&I, Utility, Energy Storage) | — | **New** |
| 8 | Case Studies — Location, Application, Products Supplied, CNX's Role, Verified Results, Read Case Study | 3 cards (location·MW, title, text) | More structured fields |
| 9 | **Procurement & Delivery Support** — H2, 3 paragraphs, 4 numbered steps, CTA | — | **New** |
| 10 | FAQ — 7 questions | 4 questions | More items |
| 11 | Final Inquiry — 10 fields incl. **Required Delivery Date** and **Upload BOQ** | 7 fields (incl. phone, brand dropdown) | New field set, date + file upload |
| — | — | "Complete your system" cross-sell (CNX BESS / inverters / C&I) | **Not in docx** → drop, unless client wants it |

**Compliance tone:** the docx avoids "authorised supplier / sourced directly from the brand / full manufacturer warranty" claims that the wireframe used ("availability … confirmed individually"). Build copy must follow the docx.

**Brand list mismatch:** docx H1 list = JA Solar, Deye, Solis, Hithium, **CNX**. Menu/wireframe = JA Solar, Tongwei, Hithium, Growatt, Deye, Solis, GoodWe. Tongwei, Growatt, GoodWe not in docx; CNX is new as a "brand". Deye is multi-category (inverters + storage) → product tabs needed. Hithium H1 uses "Explore … Solutions" instead of "Source … Through CNX".

## 3. Work needed

### A. Data + CMS (backend)
1. Prisma `BrandPage` model, same pattern as `SolutionPage` / `ManufacturingPage`: `slug`, `locale`, `status`, `publishedAt`, `isProtectedTemplate`, `menuLabel`, `menuOrder`, `showInMegaMenu`, `logo`, `category` (modules / inverters / BESS / mixed), `content Json`, `seo Json`. Migration via `migrate diff` + `migrate deploy`.
2. `lib/brands/types.ts` — `BrandContent` shape for the 11 sections (each optional except hero), arrays editable (products, buyer items, docs, scenarios, cases, steps, FAQ).
3. Dashboard → **Tier 1 Brands**: list, new, edit, duplicate, draft/publish, delete (template protected). Reuse `solution-form` / `manufacturing-form` patterns, `FormAccordion`, `ImageUpload`, SEO tab.
4. Seed: one master template (JA Solar, full docx copy) + drafts for the other brands.

### B. Public pages
5. `app/[locale]/(marketing)/tier-1-brands/[slug]/page.tsx` + `BrandPageTemplate`.
6. Components — reuse vs new:

| Section | Reuse | New / extend |
|---|---|---|
| Hero | `product/Hero` | add text link under CTAs |
| Brand overview | `ProductIntroduction` | — |
| Product display | `manufacturing/ProductCard` / `ProductGrid` | params list, 3 buttons, category tabs (Deye) |
| Product advantages | `FeatureGrid` | category-specific item set |
| For the buyers | `FeatureGrid` | numbered (01–06) variant |
| Docs & certifications | — | **new** doc-type list + CTA |
| Application scenarios | `ResidentialApplications` / `ApplicationScenes` | — |
| Case studies | — | **new** card grid with 5 fields; hide "Read Case Study" until case pages exist |
| Procurement support | `ManufacturingWorkflow` | 4-step + CTA |
| FAQ | `product/FaqSection` | — |
| Final inquiry | `QuotationForm` | new field set, see C |

7. Routing/visibility: add `/tier-1-brands/` to `CMS_DETAIL_BASES`, remove it from `ROUTES_WITHOUT_PAGE`, drop the 7 hard-coded brand rows from `VISIBILITY_PAGES` / `DEFAULT_HIDDEN_PATHS` (Draft/Published takes over).
8. Mega menu: Tier 1 Brands panel from DB (published brands, logo, order) like Solutions/Manufacturing; top "Tier 1 Brands" link → collection page. Footer column follows menu.
9. SEO: `generateMetadata` from `seo` JSON; JSON-LD Brand + ItemList + FAQPage + BreadcrumbList; add published brands to `sitemap.ts`.

### C. Forms (also fixes a live bug)
10. Wire `QuotationForm` to a real server action → `Inquiry` (new `InquiryKind.QUOTE`, extra answers in `answers` JSON, `sourcePath`, brand pre-filled) + email notification. Show in Dashboard → Inquiries with a Quote filter.
11. Brand inquiry fields: Full Name, Business Email, Company, Country / Delivery Destination, Product Series / Model, Quantity, Project Capacity (opt), Required Delivery Date (opt), Technical Requirements (opt), Upload BOQ (opt). Fields editable per brand like the contact form builder.
12. New field types: `date`, `file`. File upload on a public form needs: type allow-list (PDF/XLSX/DOCX/images), size cap (`lib/upload-limits.ts`), private storage (not public media), signed download link in dashboard, rate limit / honeypot.

### D. Downloads link-up
13. "Download Datasheet" → `/service/downloads?brand=<slug>`. Admin adds a "Brand" filter group and doc types "Test Reports & Certificates", "Product Selection Guide" (dashboard only). Check `downloads-params` handles the pre-filter.

### E. Collection page (`/about/pv-bess-brands` or `/tier-1-brands`) — from wireframe, docx missing
14. Hub: hero, why multi-brand (3), brand wall by category (modules / inverters / BESS, CNX first, grey→colour hover), comparison table, CNX manufacturing callout, FAQ, CTA band. Cards from `BrandPage` automatically. Editable in Pages.

## 4. Questions for the client
1. Send the **Collection page docx** (not received).
2. Final brand list: the 7 in the menu, the 5 in the docx, or both? Is CNX a brand page or does it link to Manufacturing?
3. Keep the wireframe's stats strip and "Complete your system" section, or follow the docx only?
4. Collection page URL: `/about/pv-bess-brands` or a separate `/tier-1-brands`?
5. Per brand content: logo SVG, hero photo, product list with params + datasheets, case studies, application photos.
6. Case studies: real verified projects available? Otherwise the section stays hidden.
7. BOQ upload: max file size, and should files be emailed or only kept in the dashboard?

## 5. Suggested order
1. C10 — fix `QuotationForm` stub (live bug, small).
2. A1–A4 + B5–B7 — brand model, dashboard, template page with JA Solar.
3. C11–C12 — brand inquiry form with date + file.
4. B8–B9, D13 — menu, SEO, downloads.
5. E14 — collection page after its docx arrives.
