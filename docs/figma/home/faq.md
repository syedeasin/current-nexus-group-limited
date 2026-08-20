# FAQ spec

Homepage section 11, below Latest News.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8784`
- Frame: 1600 x 812

Read `docs/figma/home/_animation.md` first. Then read `2283:8784` with `get_design_context` and `get_metadata` and pull every exact number from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Prerequisite

This section reuses `components/ui/Accordion.tsx`, built in `docs/figma/home/why-choose-cnx.md`. Build that section first. If the primitive does not exist, stop and build it there rather than writing a second accordion here.

## Structure

```
Section, white background
└── Container size="section"
    ├── Left column, narrow
    │   ├── eyebrow      FREQUENTLY ASKED QUESTION
    │   ├── h2           two lines
    │   └── contact card sits low, aligned to the bottom of the column
    └── Right column, wide
        └── Accordion    six question rows
```

Note the left column heading sits at the top and the contact card sits near the bottom, with a large gap between them. That is deliberate. Reproduce it with the column as a flex container using `justify-between`, not with a hardcoded margin.

## Left column

- Eyebrow: `FREQUENTLY ASKED QUESTION`, using `SectionEyebrow`. Note it is singular in Figma, not `QUESTIONS`. Reproduce as designed and flag it.
- Heading, `h2`, two lines:
  `Do you have any`
  `questions for me?`
- Above the card: `Need to ask something else?`
- Contact card, a light rounded panel. Pull the fill, radius and padding from Figma.
  - Avatar, then `Emma Collins` on one line and `Customer care` beneath it.
  - Message: `Hi, I'm Emma from the CNX team.` then `Have a question? I'm here to help anytime.`
  - Button: `Let's talk`, filled with the secondary gold token, with a small icon before the label. Use the `Button` primitive. Links to `/contact` for now.
  - Download the icon from Figma, never hand-write an SVG path.

Watch the apostrophes. `I'm` and `Let's` must use the correct character and must be escaped properly in JSX so the build does not complain.

## Right column, the accordion

Six question rows on a light grey fill, rounded, with a gap between them. Pull the fill, radius, padding and gap from Figma.

- Each row: the question on the left, a plus or minus control on the right.
- The open row shows a minus in the secondary gold token, closed rows show a plus in a muted colour. That is the same control in two states, not two icons.
- In Figma the **first** question shows the minus but the **second** shows the answer text. That is a design-file inconsistency, one of them is wrong. Decide that the open row is the one showing its answer, make it item 1 on load, and flag this to me.
- One open at a time.
- Reuse `components/ui/Accordion.tsx`. Same `grid-template-rows` `0fr` to `1fr` technique, same keyboard behaviour, same ARIA.

### Questions

1. `Q. What products does CNX Energy provide?`
2. `Q. Do you offer private-label (ODM/OEM) manufacturing?` — answer: `Yes. CNX Energy provides OEM and ODM manufacturing services for solar modules and energy storage products, helping partners build their own brands with reliable production and strict quality control.`
3. `Q. What do I receive with my purchase?`
4. `Q. Which Tier 1 brands do you work with?`
5. `Q. Can CNX support large commercial and utility-scale projects?`
6. `Q. Do you provide technical and after-sales support?`

Only question 2 has an answer in Figma. Do **not** invent answers for the other five. Add them with an empty `answer` field, a `TODO` comment in the data file, and report the list back to me.

The `Q.` prefix is part of the designed text. Keep it in the copy rather than adding it in the component, so the Chinese translation can drop it if that language does not use it.

All copy into `messages/en.json` under `home.faq`, same keys into `zh.json` with English placeholders.

## SEO

Add `FAQPage` JSON-LD structured data for the questions that have real answers. Skip the empty ones, Google penalises empty answers. Render it with a `<script type="application/ld+json">` in the server component. Do not use `dangerouslySetInnerHTML` on user input, this data is static and local so it is safe.

## Images

The avatar already exists at `public/images/home`. Do not download it from Figma and do not generate anything. The button icon may need downloading into `public/icons/`.

## Responsive

- **1440 and 1280**: two columns as designed. Pull the exact split and gap from Figma.
- **1024**: keep two columns, narrow the left one. The contact card may lose its bottom alignment and sit directly under the heading. That is acceptable, say that you did it.
- **768**: stack to one column. Order: eyebrow, heading, accordion, `Need to ask something else?`, contact card. The questions are the point of this section, so they must come before the contact card. State that you made this change.
- **480 and below**: same order. Accordion row padding tightens. The question text must never collide with the plus control, so give the control a fixed width and let the question wrap beside it.
- The `Let's talk` button goes full width at 480 and below.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Left column revealed first: eyebrow, heading, then the contact card.
- Accordion rows staggered 80ms apart, capped at 400ms total.
- Expand and collapse: 300ms on `grid-template-rows`. The plus rotates 45 degrees into a cross, or swaps to a minus, over the same duration. Match whichever Figma shows.
- Under reduced motion, panels open and close instantly.

## Files

- `components/sections/home/Faq.tsx` — Server Component, also renders the JSON-LD
- `components/sections/home/faq/FaqAccordion.tsx` — `"use client"`, thin wrapper over the shared `Accordion`
- `components/sections/home/faq/ContactCard.tsx` — Server Component
- `lib/data/faq.ts` — typed array

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no question colliding with the plus control, no clipped answer.
- Opening a row never shifts the content above it.
- Keyboard: arrows move between triggers, Enter and Space toggle, focus ring visible.
- The JSON-LD validates and contains only questions that have answers.
- Apostrophes render correctly and the build does not complain about unescaped entities.
- Heading order correct: this is an `h2`, each question trigger is a `<button>` inside an `h3`.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
