# Header + Mega Menu Implementation Spec

Figma source:
- Header states: node 79:3395 (Transparent, Light, Dark variants)
- Mega Menu: node 79:2790 (6 mega menus for each parent link)
- File key: p2yqDgoRg5CoXB6bc1ZPCj

## 0. Hard Rules (do NOT skip)

- Do NOT upgrade or add any package. All existing versions stay pinned.
- Do NOT invent new design tokens. Use existing CSS variables in `app/globals.css`. If a Figma color has no matching token, add the CSS variable to `globals.css` first using the exact Figma name, then use it.
- Project has `--color-*: initial` and `--spacing: 1px` in globals.css. Standard Tailwind color and spacing utilities do NOT work. Every color, padding, margin, gap, width, height MUST use arbitrary syntax: `bg-[var(--white)]`, `px-[80px]`, `gap-[24px]`, `text-[color:var(--secondary)]`, etc.
- Do NOT break existing i18n. All labels go through `next-intl` `useTranslations`. Add new keys to both `messages/en.json` and `messages/fr.json`.
- Do NOT rename or move files if a Header component already exists. Update in place.
- Do NOT touch dashboard, auth, database, or any admin route.
- Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build`.

## 1. Discovery (do this first)

Before writing anything, run these reads and report what exists:

1. `ls src/components/layout` (or wherever layout components live)
2. Read `src/app/globals.css` and list ALL CSS custom properties (colors, typography, spacing) currently defined
3. Read the current `Header.tsx` or equivalent
4. Read `messages/en.json` and `messages/fr.json` to see existing key structure
5. Confirm the font family for Switzer is loaded (check `app/layout.tsx` and `next/font` setup)

If Switzer is NOT loaded, add it via `next/font` using local files or `next/font/google` (Switzer is not on Google Fonts, so use the local `.woff2` files from `public/fonts/switzer/` if present, otherwise use `Fontshare` CDN as a fallback in a `link` tag in the root layout).

If required tokens are missing in `globals.css`, add ONLY these (do not touch existing ones):

```css
--neutral-1: #0a0d1b;
--neutral-4: #54565f;
--neutral-10: #e7e7e8;
--secondary: #d5ac5d;
--bg-2: #f8f8f8;
--white: #ffffff;
```

## 2. Data Model (create this file first)

Create `src/config/nav.config.ts`:

```ts
export type NavColumnKind = "links" | "products";

export type NavLink = {
  labelKey: string;
  href: string;
};

export type NavProduct = {
  labelKey: string;
  href: string;
  image: string;
};

export type NavColumn =
  | { kind: "links"; widthPx?: number; items: NavLink[] }
  | { kind: "products"; items: NavProduct[] };

export type NavItem = {
  labelKey: string;
  href: string;
  columns?: NavColumn[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "aboutUs",
    href: "/about",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "technology", href: "/about/technology" },
          { labelKey: "whyChooseCnx", href: "/why-choose-cnx" },
          { labelKey: "pvBessBrands", href: "/brands" },
        ],
      },
    ],
  },
  {
    labelKey: "manufacturing",
    href: "/manufacturing",
    columns: [
      {
        kind: "links",
        widthPx: 180,
        items: [
          { labelKey: "solarPanels", href: "/manufacturing/solar-panels" },
          { labelKey: "bess", href: "/manufacturing/bess" },
        ],
      },
      {
        kind: "products",
        items: [
          { labelKey: "backContact", href: "/products/back-contact", image: "/nav/back-contact.png" },
          { labelKey: "hjt", href: "/products/hjt", image: "/nav/hjt.png" },
          { labelKey: "topcon", href: "/products/topcon", image: "/nav/topcon.png" },
          { labelKey: "odmVertical", href: "/products/odm-vertical", image: "/nav/odm.png" },
        ],
      },
    ],
  },
  {
    labelKey: "tier1Brands",
    href: "/brands",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "jaSolar", href: "/brands/ja-solar" },
          { labelKey: "tongwei", href: "/brands/tongwei" },
          { labelKey: "hithium", href: "/brands/hithium" },
          { labelKey: "growatt", href: "/brands/growatt" },
          { labelKey: "deye", href: "/brands/deye" },
          { labelKey: "solis", href: "/brands/solis" },
          { labelKey: "goodwe", href: "/brands/goodwe" },
        ],
      },
    ],
  },
  {
    labelKey: "solutionsProjects",
    href: "/solutions",
    columns: [
      {
        kind: "links",
        widthPx: 180,
        items: [
          { labelKey: "solutions", href: "/solutions" },
          { labelKey: "renewableProjects", href: "/projects" },
        ],
      },
      {
        kind: "links",
        widthPx: 292,
        items: [
          { labelKey: "residential", href: "/solutions/residential" },
          { labelKey: "ci", href: "/solutions/commercial-industrial" },
          { labelKey: "utilities", href: "/solutions/utilities" },
          { labelKey: "vpp", href: "/solutions/vpp" },
          { labelKey: "supplyChainFinancing", href: "/solutions/financing" },
        ],
      },
      {
        kind: "products",
        items: [
          { labelKey: "uranusPro", href: "/products/uranus-pro", image: "/nav/uranus.png" },
          { labelKey: "venusPro", href: "/products/venus-pro", image: "/nav/venus.png" },
        ],
      },
    ],
  },
  {
    labelKey: "services",
    href: "/services",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "downloads", href: "/downloads" },
          { labelKey: "globalDistributor", href: "/services/distributors" },
          { labelKey: "warranty", href: "/services/warranty" },
          { labelKey: "stockProducts", href: "/services/stock" },
        ],
      },
    ],
  },
  {
    labelKey: "newsRoom",
    href: "/news",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "news", href: "/news" },
          { labelKey: "reAnalysis", href: "/news/re-analysis" },
          { labelKey: "knowledge", href: "/news/knowledge" },
          { labelKey: "events", href: "/events" },
        ],
      },
    ],
  },
];
```

## 3. i18n Keys

Add to `messages/en.json` under `nav`:

```json
{
  "nav": {
    "aboutUs": "About us",
    "manufacturing": "Manufacturing",
    "tier1Brands": "Tier 1 Brands",
    "solutionsProjects": "Solutions & Projects",
    "services": "Services",
    "newsRoom": "News room",
    "contactUs": "Contact us",
    "search": "Search",
    "language": "Language",
    "megaMenu": {
      "technology": "Technology",
      "whyChooseCnx": "Why Choose CNX",
      "pvBessBrands": "PV & BESS Brands",
      "solarPanels": "Solar Panels",
      "bess": "BESS",
      "backContact": "Back Contact",
      "hjt": "HJT",
      "topcon": "TOPCon",
      "odmVertical": "ODM-Vertical Solar",
      "jaSolar": "JA Solar",
      "tongwei": "Tongwei",
      "hithium": "Hithium",
      "growatt": "Growatt",
      "deye": "Deye",
      "solis": "Solis",
      "goodwe": "Goodwe",
      "solutions": "Solutions",
      "renewableProjects": "Renewable Projects",
      "residential": "Residential",
      "ci": "Commercial & Industrial",
      "utilities": "Utilities",
      "vpp": "Virtual Power Plant Solutions",
      "supplyChainFinancing": "Supply Chain Financing for PV and BESS",
      "uranusPro": "G12-0BB Uranus Pro Module 730-765W",
      "venusPro": "G12-0BB Venus Pro Module 530-565W",
      "downloads": "Downloads",
      "globalDistributor": "Global Distributor",
      "warranty": "Warranty",
      "stockProducts": "Stock Products with Discount Price",
      "news": "News",
      "reAnalysis": "RE Analysis",
      "knowledge": "Knowledge Database",
      "events": "Events"
    }
  }
}
```

Add the same keys to `messages/fr.json` with French translations. If translations are not ready, mirror the English values as placeholders (mark with `TODO_FR:` prefix so they are easy to find later).

## 4. Header Component

Create or update `src/components/layout/site-header/header.tsx`.

### 4.1 Variants

Header has a `variant` prop with three values, plus internal scroll state:

```ts
type HeaderVariant = "transparent" | "light" | "dark";
```

Rules:
- Pages with a **dark full-bleed hero** (Home, About, Solutions, Projects, Products, Downloads, News, Contact hero pages): pass `variant="transparent"`
- Pages with a **light hero or no hero**: pass `variant="light"`
- Reserve `variant="dark"` for future dark-theme pages only

### 4.2 Scroll Behavior (critical)

When `variant === "transparent"`:
- Above 80px scroll: render Transparent state (transparent bg, white text)
- After 80px scroll: render Light state (white bg, dark text, `1px solid var(--neutral-10)` bottom border)
- Smooth transition on background, color, border, box-shadow (`transition: all 250ms ease`)
- When mega menu is open: render Light state regardless of scroll position, so mega menu (white) blends into header

When `variant === "light"`: always Light state, regardless of scroll.

When `variant === "dark"`: always Dark state.

Use a `useEffect` with `window.addEventListener("scroll")` (throttled with `requestAnimationFrame`) to track scroll. Store `isScrolled` in state. Compute the actual rendered state:

```ts
const state: "transparent" | "light" | "dark" =
  variant === "dark" ? "dark"
  : variant === "light" ? "light"
  : (isScrolled || isMegaOpen) ? "light"
  : "transparent";
```

### 4.3 Header Layout

- `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `z-index: 50`
- `height: 88px` (use `h-[88px]`)
- `padding: 20px 80px` (use `py-[20px] px-[80px]`)
- Inner flex row: `justify-between items-center w-full`
- Left: Logo (128.89 x 32.06 px, use `w-[129px] h-[32px]`)
- Center: Nav links group (`flex items-center gap-[24px]`)
- Right: Actions group (`flex items-center`, no gap because inner items have their own padding)

### 4.4 Nav Link

Each nav link is a button that opens its mega menu on hover/focus. Structure:

- Flex row, `gap-[4px] items-center`
- Text: Switzer Regular 16px, line-height 24px, `whitespace-nowrap`
- Chevron icon 16px (use `lucide-react` `ChevronDown` at `size={16}`), inside a wrapper with `pt-[5px] pb-[3px]`
- Text color by state:
  - Light state text: `var(--neutral-1)` (#0A0D1B)
  - Transparent state text: `var(--white)`
  - Dark state text: `var(--white)`
- **Active/open link** (mega menu is currently open, or matches current route):
  - Font: Switzer Medium 500
  - Text color: `var(--secondary)` (#D5AC5D)
  - Chevron rotates 180 degrees (`ChevronUp` or CSS `rotate-180`)
- Hover: text becomes `var(--secondary)` without changing weight

### 4.5 Right Actions

Search icon button:
- 20px `Search` icon from lucide-react
- Padding `p-[14px]`, `rounded-full`
- Color follows nav text color

Contact us button:
- Height 48px, `px-[28px]`, `rounded-full`
- Background `var(--secondary)` (#D5AC5D) always, regardless of header state
- Inner flex: `gap-[8px] items-center`
- 18px `Phone` icon
- Text: Switzer SemiBold 18px, line-height 28px, color `var(--neutral-1)`
- Hover: background `#c39a4d` (10% darker)

Language toggle:
- Flex row `gap-[4px]`, `pl-[14px] py-[12px] rounded-full`
- 20px `Globe` icon
- Text "EN" (or current locale), Switzer Regular 16px
- 20px `ChevronDown` icon
- On click: switch between EN and FR using `next-intl` navigation helper
- Color follows nav text color

## 5. Mega Menu

Create `src/components/layout/site-header/mega-menu.tsx`.

### 5.1 Behavior

- Opens when parent nav link is hovered or focused
- Closes when mouse leaves the entire header + mega menu area (100ms grace period so user can move cursor down)
- Closes on Escape key, closes on click of any mega menu link
- Only one mega menu open at a time; hovering a different parent switches instantly (no close/open flash)
- Manage state at the Header level: `const [openMenu, setOpenMenu] = useState<string | null>(null)`

### 5.2 Positioning and Structure

- `position: absolute`, `top: 88px` (immediately below header), `left: 0`, `right: 0`, `z-index: 49`
- Background `var(--white)`, full width
- Padding `px-[80px] py-[48px]`
- Border-top: `1px solid var(--neutral-10)` (visible because header has its own bg by that point)
- Content max-width: match nav container (`max-w-[1600px] mx-auto`)
- Inner: `flex gap-[40px] items-start`

### 5.3 Column Rendering

For each `NavColumn` in the item's `columns` array:

**`kind: "links"`:**
- `flex flex-col gap-[20px] items-start`
- If `widthPx` set: `w-[<widthPx>px]`
- Each link: Switzer Regular 16px, `var(--neutral-1)`
- Active/current link: Switzer Medium, `var(--secondary)`
- Hover: color `var(--secondary)`

**`kind: "products"`:**
- `flex gap-[12px] items-start`
- Each product card:
  - Background `var(--bg-2)` (#F8F8F8)
  - `w-[200px]`, `p-[20px]`, `rounded-[8px]`
  - Inner: `flex flex-col gap-[20px] items-center`
  - Image: `w-[140px] h-[160px]`, `object-contain`
  - Label: Switzer SemiBold 16px, `text-center`, `var(--neutral-1)`

**Divider between columns:**
- Between adjacent columns, render a vertical divider: `w-[1px] self-stretch bg-[var(--neutral-10)]`
- Only render divider when both sides exist

## 6. Accessibility

- Nav wrapper: `<nav aria-label="Primary">`
- Parent link button: `aria-haspopup="true"`, `aria-expanded={openMenu === item.labelKey}`, `aria-controls="mega-<slug>"`
- Mega menu panel: `id="mega-<slug>"`, `role="region"`, `aria-label={item.label}`
- Keyboard: Tab moves through nav links; Enter/Space opens mega menu; Escape closes; arrow keys move within open mega menu
- Focus ring: 2px offset outline in `var(--secondary)` (visible only on `:focus-visible`)
- Search button `aria-label="Search"`, language button `aria-label="Change language"`
- Prefers-reduced-motion: skip the background transition animation

## 7. Wire it into the layout

Update `src/app/[locale]/layout.tsx` (or the page-level layout):
- Import Header and render it at the top of `<body>`
- Determine variant based on route (create a small helper `getHeaderVariant(pathname)`):
  - Home, Solutions, Projects, About, Products, Downloads, News landing, Contact hero: `"transparent"`
  - All other routes (news detail, article pages, forms without hero): `"light"`
- Since Header is client component and pathname is needed, either pass variant from the page level, or use `usePathname` inside Header

Recommended: create `src/components/layout/site-header/site-header-wrapper.tsx` (server component or client) that reads pathname and passes correct variant to `Header`.

## 8. Body padding compensation

Since Header is `position: fixed`, either:
- Add `padding-top: 88px` to the main content wrapper, OR
- For pages with `variant="transparent"`, let hero flow under the header (no padding), and for `variant="light"` pages, add `pt-[88px]`

Decide per page. Home hero should flow under transparent header.

## 9. Checkpoints (do these in order, report after each)

**Checkpoint 1:** Discovery pass. Report file structure, existing tokens, existing Header (if any), Switzer font status, current i18n key structure. Do NOT write code yet.

**Checkpoint 2:** Add missing tokens to `globals.css`, load Switzer font, create `src/config/nav.config.ts`, add i18n keys to both message files. Run `npx tsc --noEmit`. Report result.

**Checkpoint 3:** Build Header component (all three variants, scroll behavior, all right-side actions). Wire it into the layout. Home page loads with transparent header, scrolls to white. Run `npx tsc --noEmit`. Report result.

**Checkpoint 4:** Build MegaMenu component. Wire all 6 mega menus to the correct parent links. Verify hover open/close, keyboard nav, escape close. Run `npx tsc --noEmit`. Report result.

**Checkpoint 5:** Accessibility pass. Verify ARIA attributes, keyboard flow, focus rings, reduced motion. Run `npx tsc --noEmit`. Report result.

## 10. Reminder

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build`. My dev server is running and a production build corrupts the .next cache.