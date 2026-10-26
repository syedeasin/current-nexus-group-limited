# CNX Energy Website — To-do

_Last updated: 2026-10-18. Client goal: launch the first version this week._

**Rule from the client (13 Oct):** no coding of NEW pages until they review the wireframes and confirm. Revisions, About Us changes and backend features are OK now.

Legend: `[ ]` todo · `[x]` done locally (not live yet) · `[?]` waiting on client

---

## 0. Ship what's already done (TODAY)

Ten days of fixes are sitting uncommitted on the local machine. The client has not seen any of them.

- [ ] Final type-check (`npx tsc --noEmit`) and a click-through on local
- [ ] Commit in logical pieces, push `main` → GitHub Actions deploys to AWS
- [ ] Watch the deploy run until it's green; open http://13.62.105.206 and check:
  - [ ] Footer: 6 columns matching the menu, legal links, cookie banner
  - [ ] Hidden pages answer 404, and Tier 1 Brands is gone from the menu
  - [ ] Product page: Request Quote / Download Datasheet scroll or open; no empty FAQ card
  - [ ] Dashboard → Settings → Page visibility loads and saves
  - [ ] Dashboard → Pages → Footer: add/remove a column and a social link
- [ ] Live data clean-up in the dashboard (no code):
  - [ ] BC product slug `bc-solar-panels` → `bc`; Residential `residential-solar-solutions` → `residential`
  - [ ] C&I page: replace the copied Residential content, or set it to Draft until content arrives
  - [ ] Delete the test event "abc"
  - [ ] Footer phone is still the placeholder `+1 (000) 000-0000`: ask the client for the real number
  - [ ] Social links: real URLs, or switch them off

Already done locally (goes out with this push):
- [x] C1 Product "Applications": image and text no longer touch
- [x] C2 Dashboard tables: the scroll area stays on screen, header and Actions column are pinned
- [x] C4/C5 Footer columns mirror the navbar; columns can be added, renamed and reordered in Pages → Footer
- [x] C6 Social links: any platform, Show/Hide per link
- [x] C7 Cookie banner + Privacy Policy, Cookie Policy, Terms (editable in Pages → Legal)
- [x] C8 Empty FAQ card hidden; contact card fields added in Manufacturing editor
- [x] C9 Floating bar buttons work; labels and links editable per product
- [x] Show/Hide for every page (Settings → Page visibility); links to missing pages never 404
- [x] Duplicate "| CNX Energy | CNX Energy" titles fixed

## 0b. Revision 1022 (docx "website modification suggestions 1022" + "CNX-About us Page", 24 Oct)

Done locally (not committed, not live):
- [x] Mobile: footer is one column on phones, sections stacked with equal 40px gaps (no empty gaps beside Tier 1 Brands); product cards 2-up on phones (home page ~23% shorter)
- [x] Mobile was kept as one responsive site (no separate mobile template) — answer to Vicky's "separate backend for mobile"
- [x] 1 Legal pages: photo banner; header logo SVGs served directly (black box on live)
- [x] 2 Cookie Policy text from the client (22 Oct 2026); "- " lines render as bullets
- [x] 4 Home "ODM-Vertical solar modules" card → Revamping
- [x] 5 "View all Tier 1 brands" moved outside the brand frame → /tier-1-brands
- [x] 7 Industry recognition hidden by default (home + About); "Show on the website" toggle in Pages
- [x] 8 FAQ: Project Inquiry Card replaces Emma card (home + product pages); heading + card stay in view beside long FAQs (no blank left side)
- [x] 9 Footer: Manufacturing = Solar Panels / BESS / Revamping; Solutions = all 8 pages (unpublished ones grey, not links)
- [x] Menu Solutions & Projects lists all 8 pages; About Us and Services are plain links while they have one page
- [x] CNX brand back to Draft (migration `20261024090000_unpublish_cnx_brand`)
- [x] Contact: Factory (Wuxi) + Office (Hong Kong) addresses, editable in Pages → Contact → Addresses
- [x] About Us page rebuilt to the brief: banner, Who we are + 4 stats, 6 advantages with links, One Partner / 4 sourcing cards (Revamping card in gold), project case, final inquiry

To do:
- [x] 6 "View Case Study" → newest published post in the new News → **Case Studies** section (same layout as a news post, /news/<slug>); button hidden while there is none. Migration `20261024100000_case_studies_section`. List page /news/case-studies hidden by default
- [x] Solar Panels collection: "Why Choose CNX?" with the client's copy (intro, 4 cards, 2 CTAs); BESS version built and hidden ("Show on the website" in Pages → BESS)
- [x] Tier 1 collection: categories in one swipeable row of tabs — All Brands · Solar Modules · Solar Inverters · Battery Energy Storage (with counts)
- [x] 18 Date fields: large calendar (month/year jump, Today, Clear, keyboard) on every enquiry form
- [ ] Publish the first real case study on live (Dashboard → Posts → section "Case Studies"); local DB has a sample from the testimonial text
- [ ] Tier 1 collection "design completely according to the document": need that docx (not received) to finish the rest of the page
- [ ] Brand pages: more colour contrast and interaction
- [ ] Revamping page doesn't exist yet → its links show as grey text until it is published
- [ ] After deploy: Pages edits saved in the live DB override new defaults (Cookie Policy, FAQ, About) — check each page; "Use default" restores the new copy
- [ ] Why Choose Us item 06 (Logistics) photo is a stand-in — ask the client for a real port/shipping photo

Design polish after the revision (owner feedback, 24–26 Oct), done locally:
- [x] Type scale: body text 20/18/16/14 on every screen (regular body 16); no breakpoint bumps; stray 11–13px sizes removed
- [x] Buttons: 18px text, 8px text–icon gap, 20×20 icons everywhere (chevron icon gets a square `boxed` mode)
- [x] Page titles: h1 tag everywhere; homepage at h1 size (64px), all other pages at h2 size (48px)
- [x] Header nav items 16px
- [x] Home: Tier 1 products section — title left, gold "View all Tier 1 brands" button right
- [x] About Us redesign: hero (taller, copy bottom-left, "Our promise" card); Who we are (split + stat row); Why choose us (scroll-pinned 01→06 with photos, 120px padding); Sourcing routes (open row + Revamping band, 4:3 photo); final CTA in the site CtaBand style blending into the footer
- [x] Case study section readable on phones (dark card under the photo) — shared, so product + solutions pages too
- [x] Lint clean (CookieConsent effect fix, unused vars); body suppressHydrationWarning for browser-extension attributes
- [x] Case Studies: list page /news/case-studies is live and in News Room menu + footer. Case pages get their own layout (clear photo hero, facts bar, story + sticky inquiry card, results, client quote, more cases, CTA). Facts/results/quote edited in Dashboard → Posts → "Case study details" (migration `20261026090000_post_case_study`). Local DB has 3 sample cases — replace with real ones on live
- [x] Home: client success story shows a real case study (Pages → Homepage → `caseSlug`, else newest) with facts + results; Why choose us steps through on scroll with a photo per reason and a text-link CTA; FAQ lighter cards and more space; inquiry card title/note line breaks
- [x] Product pages: Manufacturing excellence matches the About "Six reasons" layout; Manufacturing workflow pins and draws the gold line step to step on scroll
- [x] Solar Panels "Why Choose CNX?": sticky intro + numbered list (55/45); product card buttons on the shared button spec
- [x] Legal pages rebuilt: sticky "On this page", "At a glance" summary, 680px reading column; Privacy Policy and Terms rewritten in full (template wording: client/lawyer to review before live)
- [x] Wrapping rule: descriptions break top heavy (first line 2–3 words longer) via `TopHeavyText`, not text-balance

## 1. Finish revision 1008 (this week)

- [ ] **C3 Event date**: add start/end date + location to posts (migration). Show the event date on Events cards and the detail page; sort upcoming first
- [ ] **C10 Contact form builder**: add, delete or hide fields and set required from the dashboard (migration: custom answers stored as JSON on Inquiry). Show custom answers in Dashboard → Inquiries
- [ ] C11 Reply to "where in the backend": send the client a short guide with screenshots (Footer, Social, Page visibility, FAQ contact card, Floating bar, Legal pages)
- [ ] Send Vicky an item-by-item reply to docx 1008: what was fixed and where to find it

Before C3/C10: stop `next dev` while running `prisma generate` (EPERM otherwise). Migration SQL via `prisma migrate diff`, applied with `migrate deploy`; never `migrate reset`.

## 2. About Us change (client, 13 Oct)

"Use Why Choose CNX as the main About Us page; hide the three sub-pages; add sections from the mind map."

- [ ] Menu: "About Us" links straight to `/about/why-choose-cnx` (no dropdown) while the sub-pages are hidden
- [ ] Footer "About Us" column follows automatically (Technology and PV & BESS Brands already hidden)
- [ ] Add sections to Why Choose CNX (mind map branch "why choose CNX"), reusing existing designs:

| Mind map section | Reuse | Status |
|---|---|---|
| Hero banner | existing | have |
| Manufacturing | "Manufacturing excellence" block from the product page (6 factories, traceability) | add |
| Global partner | Tier 1 logo ticker from the homepage | add |
| Products | Homepage product showcase (modules / BESS / inverters tabs) | add |
| Advantages (6) | existing "Competitive advantage" grid; replace the copy with the client's 6 items: Vertical Manufacturing & QC, Bankable Tier-1 Brand Portfolio, EPC+F Credit Financing, Hybrid Procurement Synergy, Technical Sales & After-sales Engineering, Global Logistics & Tariff Compliance | update copy |
| Our service | existing "Beyond products" steps | have |
| FAQ | FAQ section from the product page | add |

- [ ] Every new section editable in Pages → Why Choose CNX
- [ ] Send the client a screenshot for approval (sections reuse approved designs, so no new Figma needed)

## 3. Wireframes (waiting on client review)

- [?] Client feedback on the Figma page "📐 Phase 2 Wireframes"
- [ ] Update T4 Technology and T5 PV & BESS Brands to match the mind map:
  - Technology: Hero, Vertical Manufacturing (cells → modules → BESS, data-driven), Technology Deep Dive (HJT vs TOPCon vs BC, PID/LeTID, BESS cycle life and round-trip efficiency), Partner Brand Technologies, R&D & Certifications (logo wall, R&D photos, key numbers), Application Scenarios
  - PV & BESS Brands = the "Tier 1 brands collection page": Hero (positioning statement), Our Brand Portfolio (logo, description, partnership tag), Why Choose Our Brand Mix (hybrid procurement, one-stop sourcing, bankability), Global Partnership Map, Brand News & Updates (news cards), Main product display (links to product pages)
- [ ] Confirm with the client: is the "Tier 1 brands collection page" the PV & BESS Brands page, or a separate `/tier-1-brands` page?

## 4. Phase 2 build (only after client confirms)

Tier 1 brands — built 21 Oct on branch `feat/tier-1-brands` (not merged, not live). Rollback tag for live: `live-2026-10-21`.
- [x] Brand page template from the client brief (11 sections) + 7 brand pages + draft CNX page (`prisma/seed-brands.ts`, runs on deploy while the table is empty)
- [x] Collection page `/tier-1-brands` (mind-map "PV & BESS brands" structure); `/about/pv-bess-brands` forwards there when switched on
- [x] Dashboard → Tier 1 Brands (add / duplicate / delete / draft-publish, full editor) and Pages → Tier 1 Brands
- [x] Product page quotation form now really sends (was a console.log stub); date + file (BOQ) field types
- [x] Figma page "🏷️ Tier 1 Brands — Hi-fi (Oct 2026)": both pages, captured from the build
- [?] Client: collection page docx (not received), real product lists + datasheets per brand (seed data is sample), verified case studies, CNX brand page yes/no
- [ ] Merge to `main` → deploy, then check /tier-1-brands and one brand page live

Launch set the client asked for:
- [ ] Revamping (custom page; content ready)
- [x] Tier 1 brands collection + 7 brand pages (one template) — see above
- [ ] Solutions and Renewable Projects overviews + content for C&I, Utilities, VPP, Supply Chain Financing, Grid-tie, Off-grid, Project Financing (existing template)
- [ ] Global Distributor
- [?] Content from the client: brand info, logos and products, distributor list, solution copy

Later (hidden until ready): Technology, Warranty, Stock Products, Case study detail, remaining product pages (HJT, TOPCon, ODM, 4 BESS).

## 5. Earlier reviews: re-check on live after deploy

0929:
- [ ] Image inserted in a news post shows on the site
- [ ] Media delete works
- [ ] Highlights selectable (Posts → Highlight toggle)
- [ ] RE Analysis and Knowledge DB share the News layout
- [x] Footer content and order (replaced by the new footer)
- [ ] Solar Panels and BESS listing pages editable (Pages → Manufacturing)
- [ ] Every primary and secondary page has an edit entry (Pages)

0911 (design review), spot-check:
- [ ] Mega menu: horizontal second level, brand logos, hover reveals third level, Revamping highlighted
- [ ] Homepage: hover tabs, product links, "View all" links, slider arrows on top
- [ ] Quotation form: phone optional, Quantity/MW and Message required
- [ ] Case sections: 3+ cases, text truncated with "read more"

## 6. Launch checklist

- [ ] Domain + SSL (site still on a raw IP over HTTP)
- [ ] `NEXT_PUBLIC_SITE_URL` / Settings → Site address set to the real domain (canonical, OG, sitemap)
- [ ] Settings → Allow indexing ON only at launch
- [ ] Contact and quotation emails delivered (Settings → Email delivery → send test)
- [ ] Real contact details (phone, email) and social URLs
- [ ] Every visible menu link answers 200 (re-run the route check)
- [ ] Mobile pass on Home, product, solution, news, contact
- [ ] DB backup on the server

## 7. Client relationship

- [ ] Same-day reply to every message, even if it's only "noted, working on it"
- [ ] After each deploy: a short message with what changed, a link and a screenshot
- [ ] Give dates and keep them; say early if something slips
