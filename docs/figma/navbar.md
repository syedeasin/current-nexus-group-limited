# Navbar spec (from Figma, desktop frame 1600px)

Source node: 1564:2144
Tailwind v4. Spacing base is 1px, so `px-80` means 80px, `gap-24` means 24px.

## Shell
- `<header>` fixed to top, full width, z-50.
- Inside: `Container` (already `max-w-1600 px-20 md:px-80`) with `py-20`.
- Inside that: flex row, `items-center justify-between`, full width.
- Total header height at desktop is 88px.

## Background
- Default state: transparent, with a downward dark gradient scrim so white text
  stays readable over the hero image.
- Scrolled state: once `scrollY > 32`, swap to solid `bg-primary` plus a subtle
  shadow. Transition 200ms.
- The scroll listener makes this a client component. Keep it the only client
  component in the layout shell.

## Left: logo
- `<Link href="/">` wrapping the logo.
- Size: 130px wide, 32px tall.
- Use `next/image` with `/logo.svg`, `priority`, alt = siteConfig.name.

## Middle: nav
- `<nav aria-label="Main">`, flex, `items-center gap-24`.
- Map over `mainNav` from site.config.ts.
- Each item: `<button>` with `flex items-center gap-4`, `text-p4 text-white`.
- When `hasDropdown` is true, append `<ChevronDown />` at 16px.
- Do NOT build dropdown panels yet. Triggers only.

## Right: actions
Wrapper: flex, `items-center`.

1. Search button
   - `p-14`, `rounded-full`, `text-white`
   - `<Search />` at 20px
   - `aria-label="Search"`

2. Contact us
   - `<Link href="/contact">`
   - `h-48 px-28 rounded-full bg-secondary text-neutral-1`
   - `text-btn-sm font-semibold`
   - `flex items-center gap-8`
   - `<PhoneCall />` at 18px before the label
   - Label: `Contact us`

3. Language switcher
   - `<button>` with `pl-14 py-12 flex items-center gap-4`
   - `<Globe />` at 20px
   - Text `EN` in `text-p4 text-white`
   - `<ChevronDown />` at 16px
   - `aria-label="Change language"`

## Icons
Use `lucide-react` (already a dependency): ChevronDown, Search, PhoneCall, Globe.

## Accessibility
- Header is a landmark, nav has `aria-label="Main"`.
- Icon-only buttons need `aria-label`.
- Every interactive element gets a visible focus ring using `ring-secondary`.
- Never put text on `bg-secondary` in white. Use `text-neutral-1`.

## Not decided yet
- Mobile navbar layout is not specified. Build desktop only for now and let the
  nav collapse cleanly (hide the nav and actions below `md`), leaving a
  placeholder menu button. Do not invent a full mobile drawer.
