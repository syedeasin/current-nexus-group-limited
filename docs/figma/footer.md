# Footer spec (from Figma, desktop frame 1600px)

Source node: 1599:6542
Tailwind v4. Spacing base is 1px, so `py-60` means 60px, `gap-32` means 32px.

## Shell
- `<footer>` with `bg-neutral-1`, `py-60`, `relative`, `overflow-hidden`, full width.
- Inside: `Container`.
- Inside that: a column, `flex flex-col gap-172`, full width.
  The 172px gap is real. The wordmark graphic sits in that space.

## Background wordmark
- A large outlined "CNX ENERGY" graphic, bleeding off the bottom of the footer.
- It must span the FULL viewport width at every screen size, not a fixed 1600px.
  Use `absolute inset-x-0 w-full h-auto`, never a fixed width.
- The SVG needs `preserveAspectRatio="xMidYMax slice"` behaviour, so render it
  with `<img src="/footer-wordmark.svg" className="w-full h-auto" />` and let it
  scale. Do not use next/image here, it fights the intrinsic sizing.
- Vertical position: `bottom-[var(--footer-wordmark-offset)]`.
  Define `--footer-wordmark-offset: -40px` on the footer element.
  This is the single value to tune. More negative pushes it further down and
  hides more of the letters. Less negative lifts it up and shows more.
- `pointer-events-none`, `select-none`, `aria-hidden="true"`, `z-0`.
- Use `/footer-wordmark.svg` from public. Do NOT redraw it in code.
- It must sit behind the content, so give the content `relative z-10`.

## Link columns
Row: `flex gap-32 items-start w-full`.

Column widths:
1. Quick links — fixed `w-204`
2. Tier 1 brands — `flex-1`
3. Solutions — `flex-1`
4. Services — `flex-1`
5. Contact — fixed `w-375`

Each link column: `flex flex-col gap-16`.
- Heading: `text-p3 font-normal text-neutral-6`
- Link list: `flex flex-col gap-12`
- Link: `text-p3 font-medium text-white`, hover `text-secondary`, 150ms transition

Data comes from `footerNav` in site.config.ts. Map over it, do not hardcode.

## Contact column
`flex flex-col gap-40`, width 375px.

Block 1, contact info: `flex flex-col gap-24`
- Heading `Contact info`: `text-p3 font-normal text-neutral-6`
- List: `flex flex-col gap-12`
- Each row: `flex gap-8 items-center`, icon 20px, text `text-p3 font-medium text-white`
- Rows, in order, from `siteConfig.contact`:
  - MapPin icon + location
  - Mail icon + email, wrapped in a `mailto:` link
  - Phone icon + phone, wrapped in a `tel:` link

Block 2, newsletter: `flex flex-col gap-16`
- Label `Sign up for our newsletter`: `text-p3 font-normal text-neutral-6`
- Form row: `bg-neutral-2 rounded-full pl-32 pr-6 py-6 flex items-center gap-24 w-full`
  - Email input: transparent background, no border, `text-p4 text-white`,
    placeholder `Enter your email...` in `text-neutral-7`, flex-1,
    `type="email"`, `required`, `aria-label="Email address"`
  - Submit button: `bg-secondary text-neutral-1 rounded-full px-24 py-12`
    `text-btn-sm font-semibold`, label `Subscribe`

Keep the form a plain `<form>` for now. No submit handler yet.

## Bottom bar
`flex items-center justify-between w-full`.

Left: `Copyright © {current year} {siteConfig.name}. All rights reserved.`
in `text-p4 text-neutral-7`. Compute the year at build time, do not hardcode 2026.

Right: `flex items-center gap-16`, mapped from `socialLinks`.
- Each item: a link, `flex items-center gap-6`, icon 18px,
  label in `text-p4 text-neutral-7`, hover `text-white`, 150ms transition
- Between items: a 1px wide, 10.5px tall vertical divider in `bg-neutral-5`,
  `aria-hidden`. No divider after the last item.

## Icons
`lucide-react`: MapPin, Mail, Phone, Facebook, Instagram, Linkedin.

## Accessibility
- Contrast on `bg-neutral-1` is fine: white 19.3, neutral-7 7.2, neutral-6 5.3.
- The newsletter placeholder must be `text-neutral-7`, not `text-neutral-6`.
  Neutral 6 on Neutral 2 is only 4.18 to 1 and fails WCAG AA.
- Every link needs a visible focus ring using `ring-secondary`.
- The wordmark is decorative, so `aria-hidden="true"`.

## Corrections applied to the Figma content
- Figma spells it `Technolgy`. Corrected to `Technology`.
- Figma repeats the Tier 1 brands list inside the Solutions column. Kept as is
  with a TODO in site.config.ts, since the real links are not decided.
- Figma shows the Facebook label in white and the other two in Neutral 7.
  That looks like a hover state left switched on. All three use Neutral 7.
- Column headings use three different fonts in Figma (Switzer, Urbanist and
  Stack Sans Headline) and mixed weights. All normalised to Switzer Regular.

## Not in scope
- The CTA band with the factory photo above the footer is a page section, not
  part of the global footer. It will be built separately.
- Mobile layout is not specified. Stack the columns on small screens and let
  the bottom bar wrap. Do not invent a new arrangement.
