# Homepage build order

Build one section per Claude Code session. Run `/clear` between each one. Do not batch them.

Read `_animation.md` before any section. It defines the shared motion language and every section must obey it.

| # | Section | Spec | Status |
|---|---|---|---|
| 1 | Hero | `../hero-v2.md` | done |
| 2 | Trusted Logos | `../trusted-logos.md` | done |
| 3 | About CNX | `../about-cnx.md` | done |
| 4 | Energy Ecosystem | `../energy-ecosystem.md` | |
| 5 | Premium Solutions | `../premium-solutions.md` | |
| 6 | Application Scenes | `application-scenes.md` | |
| 7 | Client Testimonials | `client-testimonials.md` | |
| 8 | Why Choose CNX | `why-choose-cnx.md` | |
| 9 | Awards | `awards.md` | |
| 10 | Latest News | `latest-news.md` | |
| 11 | FAQ | `faq.md` | |
| 12 | CTA Band | `cta-band.md` | |

Mark a row `done` only after it has been checked in a browser at 1440, 1280, 1024, 768, 480, 375 and 320.

## Dependencies between sections

These are hard ordering constraints, not suggestions.

- **4 before 5**: Energy Ecosystem creates `SectionEyebrow` and `ProductCard`. Premium Solutions reuses both.
- **6 before 10**: Application Scenes creates the scroll-snap carousel and the progress track. Latest News reuses the same behaviour.
- **8 before 11**: Why Choose CNX creates `components/ui/Accordion.tsx`. FAQ reuses it.

Everything else can be built in table order.

## Shared primitives created along the way

| Component | Created in | Reused by |
|---|---|---|
| `SectionEyebrow` | Energy Ecosystem | every section |
| `ProductCard` | Energy Ecosystem | Premium Solutions |
| `SceneCarousel` | Application Scenes | Latest News |
| `Accordion` | Why Choose CNX | FAQ |
| `BlogCard` | Latest News | news pages later |
| `CtaBand` | CTA Band | other pages later |

If a section needs something this table says already exists, reuse it. Never fork a primitive silently. If it genuinely does not fit, extend it and say what you added.

## Content that is still missing

These are placeholders in Figma. Do not invent copy for them. Leave the field empty, add a `TODO`, and report it.

- Application Scenes: the fourth card's description is cut off in the design.
- Premium Solutions: six of the seven brands have no products.
- Why Choose CNX: five of the six accordion items have no body text.
- Awards: all five captions are identical placeholder text.
- FAQ: five of the six questions have no answer.

## Standing rules for every section

- `Container size="section"` gives the 1320 content width. Chrome keeps `size="page"`.
- All copy lives in `messages/en.json` and `messages/zh.json`. Nothing hardcoded in JSX.
- All data lives in typed arrays under `lib/data/`.
- Server Components by default. Client components are the smallest possible leaf.
- No new hex values, no arbitrary font sizes. Tokens only.
- Every image comes from `public/images/`. Never download from Figma when a local file exists, never generate one.
- Icons come from Figma. Never hand-write an SVG path.
- Exactly one `h1` on the page and it is in the Hero. Every section heading is an `h2`.
- Every prompt ends with: run only `npx tsc --noEmit`, never `npm run build`.
