# Mega menu — full site navigation

Target: replace the current `Navbar` dropdown with a data-driven mega menu covering the whole sitemap, on desktop and mobile.

## What is wrong with the current navbar (fix these, do not carry them forward)

1. Only "Manufacturing" has a dropdown, hardcoded in JSX. Every other nav item is a `<button>` with no menu and no link, so About Us, Tier 1 Brands, Solutions, News Room, and Service are all dead ends.
2. The dropdown opens on CSS `group-hover` only. That works for a mouse, half-works for keyboard, and does not work at all on touch devices and tablets.
3. The mobile hamburger renders three bars and does nothing.
4. Parent items that resolve to a real page (Manufacturing, About Us) are `<button>` elements, so they are not clickable or crawlable as links.

The rebuild fixes all four. Keep everything else about the current header: the fixed positioning, the transparent-to-solid scroll behaviour, the `isSolidPage` rule for news detail pages, the `Container`, the logo, search, Contact us button, and the locale switcher.

## Rules that carry over from the rest of the project

- All header content stays inside the shared `Container` so it lines up with every page's content column. The mega panel background may be full-bleed, but the panel's inner content sits inside a `Container`.
- Fully responsive: desktop mega panels at `lg` and up, full-screen drawer below that. No horizontal scroll at any width.
- Animation must feel like the rest of the site: short, calm, and respectful of `prefers-reduced-motion`. Panels fade plus translate 8px over 150 to 200ms with ease-out. Do not add a new animation library.
- All labels come from `next-intl` under the `nav` namespace. Never hardcode English strings in the component.
- Keep using `Link` and `usePathname` from `@/i18n/navigation` so every link stays locale-aware.
- Run only `npx tsc --noEmit`. Do NOT run `npm run build` — the dev server is running and a production build corrupts the `.next` cache.

---

# Step 1 — The navigation data model

All structure lives in `src/site.config.ts` (extend the existing `mainNav`). The component renders whatever the data says; adding a menu item must never require touching the component.

```ts
export type NavLink = {
  labelKey: string;        // i18n key under "nav"
  href: string;
};

export type NavColumn = {
  labelKey: string;        // column heading, e.g. "Solar Panels"
  href?: string;           // heading itself can be a link
  links: NavLink[];
};

export type NavItem = {
  labelKey: string;
  href: string;            // parents always resolve somewhere, never "#"
  menu?:
    | { variant: 'list'; links: NavLink[] }
    | { variant: 'mega'; columns: NavColumn[]; feature?: { titleKey: string; bodyKey: string; href: string; image: string } };
};
```

Two menu shapes only:

- `list` — one flat column of links. Used by About Us, Tier 1 Brands, News Room, Service.
- `mega` — a wide panel with several titled columns. Used by Manufacturing and Solutions & Projects.

The optional `feature` block is a promo card on the right side of a mega panel. Include the type now; leave it unset until the client supplies content.

## The full structure

### 1. About Us — `list` — href `/about/why-choose-cnx`

| Label | Href |
| --- | --- |
| Technology | `/about/technology` |
| Why Choose CNX | `/about/why-choose-cnx` |
| PV & BESS Brands | `/about/pv-bess-brands` |

### 2. Manufacturing — `mega` — href `/manufacturing/solar-panels`

Column 1 — **Solar Panels** (heading links to `/manufacturing/solar-panels`)

| Label | Href |
| --- | --- |
| BC | `/manufacturing/solar-panels/bc` |
| HJT | `/manufacturing/solar-panels/hjt` |
| TOPCon | `/manufacturing/solar-panels/topcon` |
| ODM / Vertical Solar Modules | `/manufacturing/solar-panels/odm-vertical-solar-modules` |

Column 2 — **BESS** (heading links to `/manufacturing/bess`)

| Label | Href |
| --- | --- |
| Residential BESS | `/manufacturing/bess/residential` |
| 112kWh | `/manufacturing/bess/112kwh` |
| 261kWh | `/manufacturing/bess/261kwh` |
| 488kWh | `/manufacturing/bess/488kwh` |

### 3. Tier 1 Brands — `list` — href `/tier-1-brands`

JA Solar `/tier-1-brands/ja-solar`, TONGWEI `/tier-1-brands/tongwei`, Hithium `/tier-1-brands/hithium`, Growatt `/tier-1-brands/growatt`, DEYE `/tier-1-brands/deye`, Solis `/tier-1-brands/solis`, Goodwe `/tier-1-brands/goodwe`.

Because this is seven items, render it as a **two-column list** inside the dropdown so it does not become a tall thin strip. Same `list` variant, just allow the panel to use `columns-2` when it has more than five links.

### 4. Solutions & Projects — `mega` — href `/solutions-projects/solutions`

Column 1 — **Solutions** (heading links to `/solutions-projects/solutions`)

| Label | Href |
| --- | --- |
| Residential | `/solutions-projects/solutions/residential` |
| C&I | `/solutions-projects/solutions/commercial-industrial` |
| Utilities | `/solutions-projects/solutions/utilities` |
| Virtual Power Plant Solutions | `/solutions-projects/solutions/virtual-power-plant` |
| Supply Chain Financing for PV and BESS | `/solutions-projects/solutions/supply-chain-financing` |

Column 2 — **Renewable Projects** (heading links to `/solutions-projects/renewable-projects`)

| Label | Href |
| --- | --- |
| Grid-tie Projects | `/solutions-projects/renewable-projects/grid-tie` |
| Offgrid Projects | `/solutions-projects/renewable-projects/offgrid` |
| Project Financing | `/solutions-projects/renewable-projects/project-financing` |

### 5. News Room — `list` — href `/news`

| Label | Href |
| --- | --- |
| News | `/news` |
| RE Analysis | `/news/re-analysis` |
| Knowledge Database | `/news/knowledge-database` |
| Events | `/news/events` |

**Decision to be aware of:** the blog already owns `/news` and `/news/[slug]`. Putting these three siblings under `/news/` keeps the menu coherent, and Next.js App Router gives a static segment priority over a dynamic one, so `/news/re-analysis` resolves to the static page, not to a blog post. The trade-off is that no blog post may ever use the slug `re-analysis`, `knowledge-database`, or `events`. Add a comment in the news data file recording that reserved-slug rule. If Easin prefers a separate prefix, change these three to `/news-room/...` — that is a one-line data change and nothing else moves.

### 6. Service — `list` — href `/service/downloads`

| Label | Href |
| --- | --- |
| Downloads | `/service/downloads` |
| Global Distributor | `/service/global-distributor` |
| Warranty | `/service/warranty` |
| Stock Products with Discount Price | `/service/stock-products` |

### Home

The logo links to `/`. There is no "Home" text item in the nav.

---

# Step 2 — Desktop behaviour (`lg` and up)

Build `src/components/layout/nav/` with: `Navbar.tsx` (shell, keeps the existing scroll and solid-page logic), `DesktopNav.tsx`, `MenuPanel.tsx` (renders `list` or `mega`), `MobileNav.tsx`, and `useMenuState.ts`.

## Opening and closing

Do not rely on CSS `group-hover`. Use one piece of state in the nav: `openKey: string | null`.

- **Hover intent:** opening on `mouseenter` after a 100ms delay, closing on `mouseleave` after a 150ms delay. The delays stop the menu flickering when the pointer crosses items, and the close delay gives the user time to travel from the trigger down into the panel.
- Keep an invisible padding strip (about 12px) between the trigger and the panel top so the pointer never crosses a dead gap. The current code already does this with `pt-12` — keep that idea.
- **Click / Enter / Space** on a trigger toggles its panel. Because the trigger is also a link, the first Enter opens the panel rather than navigating; give the trigger an explicit "go to section" link inside the panel (the column heading already covers this for mega panels; for `list` panels add the parent as the first item or make the panel heading a link).
- **Escape** closes the open panel and returns focus to its trigger.
- Clicking anywhere outside the header closes the panel.
- Route change closes the panel. Watch `pathname` and reset `openKey` in an effect.
- Only one panel is open at a time. Moving the pointer to a different trigger while one is open swaps immediately with no delay (the menu is already "active"), which is how good mega menus feel.

## Keyboard and accessibility

- Trigger: `<Link>` styled as the nav item, with `aria-expanded`, `aria-controls` pointing at the panel id, and `aria-haspopup="true"`.
- Panel: an element with that id, `role="group"` (or a `<nav>` with its own `aria-label`), hidden from assistive tech and removed from the tab order when closed. Use conditional rendering or `hidden`, not just opacity, so closed links are never focusable.
- Left / Right arrow keys move between top-level triggers. Down arrow from a trigger opens the panel and moves focus to its first link. Up / Down move within the panel. Escape closes.
- Every interactive element keeps the existing focus ring style (`focus-visible:ring-2 focus-visible:ring-secondary`).
- The whole desktop nav lives in `<nav aria-label={t("main")}>`, which the current code already does.

## Active state

Use `usePathname` to mark the current section. A top-level item is active when the pathname starts with its section prefix (for example `/manufacturing`). Show it with the gold `secondary` color plus a 2px underline, not with color alone. Inside a panel, the exact current page gets the same treatment and `aria-current="page"`.

## Panel appearance

- The panel is anchored under the header and spans the full viewport width for `mega`, and is a normal anchored dropdown for `list`.
- Background: solid `primary` (`#0A0D1B`), 1px top border `white/10`, `rounded-b-16` for the full-width variant or `rounded-12` for the anchored one, plus a soft shadow. It must be fully opaque — a translucent panel over a hero photo is unreadable.
- **Important interaction with the transparent header:** while any panel is open, force the header into its solid state even if the page has not scrolled. Otherwise the panel appears to float off a transparent bar and the hero shows through the seam. Compute it as `solid = scrolled || isSolidPage || openKey !== null`.
- Full-width mega panel inner layout: content inside `Container`, `py-40`, columns in a `grid` with `gap-48`, each column `flex flex-col gap-16`.
  - Column heading: 18/28 semibold white; if it has an `href`, it is a link with a hover underline.
  - Column links: 16/24 regular `#CECFD1`, `py-8`, hover to white with a subtle left shift (`translate-x-2`) or a background tint `white/5` on a rounded row. Pick one and use it everywhere.
- Anchored `list` panel: `min-w-240`, `p-8`, links as rounded rows `px-16 py-10`, `rounded-8`, hover `bg-white/10`. When a list has more than five links, switch to two columns with `gap-x-32`.
- Animation: fade plus 8px downward translate, 150 to 200ms ease-out, disabled under `prefers-reduced-motion`.

---

# Step 3 — Mobile and tablet (below `lg`)

A mega panel is unusable on a phone. Build a proper drawer.

- The hamburger becomes a real `<button>` with `aria-label`, `aria-expanded`, and `aria-controls`. Animate the three bars into an X when open.
- Opening slides in a full-screen panel (or a right-side drawer at `max-w-420` on tablet) with the solid `primary` background, covering the viewport below the header. Lock body scroll while open.
- Inside, render the same nav data as an **accordion**:
  - Top-level rows are buttons with a chevron that rotates when expanded, unless the item has no menu, in which case it is a plain link.
  - Expanding shows the child links indented; for `mega` items, show the column heading as a sub-heading with its links beneath, so all three levels are reachable.
  - Use the same grid-rows `0fr` to `1fr` expand technique already used in the FAQ and Why Choose accordions, so the motion matches the rest of the site.
  - Allow only one top-level section open at a time.
- Below the accordion, repeat the utility actions: search, the gold Contact us button (full width), and the language switcher.
- Close the drawer on route change, on Escape, and on the close button. Return focus to the hamburger on close. Trap focus inside the drawer while it is open.
- Every row needs a minimum 44px touch target.

---

# Step 4 — i18n

Add every label under the `nav` namespace, mirroring the structure, for example:

```
nav.aboutUs, nav.technology, nav.whyChooseCnx, nav.pvBessBrands,
nav.manufacturing, nav.solarPanels, nav.bess, nav.bc, nav.hjt, nav.topcon, nav.odmVerticalSolarModules,
nav.residentialBess, nav.bess112, nav.bess261, nav.bess488,
nav.tier1Brands, nav.jaSolar, nav.tongwei, nav.hithium, nav.growatt, nav.deye, nav.solis, nav.goodwe,
nav.solutionsProjects, nav.solutions, nav.residential, nav.commercialIndustrial, nav.utilities, nav.virtualPowerPlant, nav.supplyChainFinancing,
nav.renewableProjects, nav.gridTie, nav.offgrid, nav.projectFinancing,
nav.newsRoom, nav.news, nav.reAnalysis, nav.knowledgeDatabase, nav.events,
nav.service, nav.downloads, nav.globalDistributor, nav.warranty, nav.stockProducts
```

Keep the existing keys (`nav.main`, `nav.search`, `nav.contact`, `nav.changeLanguage`, `nav.openMenu`) and add `nav.closeMenu`. Remove the now-unused `nav.manufacturingDropdown.*` keys. Add matching empty keys to any other locale files so nothing throws.

---

# Step 5 — Missing pages

Most of these routes do not exist yet, which is expected. Do NOT create placeholder pages as part of this task; the menu should link to the real future URLs. Only these currently exist: `/`, `/about/*` (three pages), `/manufacturing/solar-panels`, `/manufacturing/bess`, `/news`, `/news/[slug]`.

At the end, print a checklist of every href in the menu marked as existing or not yet built, so the remaining page work is visible.

---

# Build order for Claude Code

1. Read `src/site.config.ts` and the current `Navbar.tsx` to match conventions, then extend the nav types and data with the full structure above.
2. Build `useMenuState.ts` (open key, hover intent delays, outside click, Escape, route change reset).
3. Build `MenuPanel.tsx` handling both `list` and `mega` variants.
4. Build `DesktopNav.tsx` with the triggers, keyboard handling, and active states.
5. Build `MobileNav.tsx` as the drawer with the accordion.
6. Rewire `Navbar.tsx` to compose them, keeping the existing scroll and solid-page behaviour, and adding `openKey !== null` to the solid condition.
7. Add the i18n keys; remove the old `manufacturingDropdown` keys.
8. Verify: every menu item opens on hover and on click, keyboard-only navigation reaches every link, Escape closes, the panel is opaque over the hero, the mobile drawer reaches all three levels, no horizontal scroll at 360 / 768 / 1024 / 1440 / 1920, and reduced motion is respected.
9. Run only `npx tsc --noEmit`. Do NOT run `npm run build`.

## Starter kit note

The mega menu engine (`useMenuState`, `MenuPanel`, `DesktopNav`, `MobileNav`) contains no CNX-specific names once the structure is passed as data. After it works, copy the generic version into `F:\easin-next-starter` and leave the CNX structure behind in `site.config.ts`.
