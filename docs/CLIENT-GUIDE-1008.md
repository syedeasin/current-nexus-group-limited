# CNX Energy website — Revision 1008: what changed and where to edit it

Live site: http://13.62.105.206 · Dashboard: http://13.62.105.206/dashboard

All the changes below are live. After you save something in the dashboard, the website updates straight away. If you don't see a change, refresh the page.

---

## 1. Product page: image and text too close together
**Fixed.** On the product page, the image and the text in the "Applications" section now keep a clear gap on every screen size. Nothing to edit.

## 2. Dashboard tables: the horizontal scroll bar was only at the bottom
**Fixed.** Lists in the dashboard (Posts, Downloads, Users, Inquiries, Categories, Tags) now scroll inside their own box, so the scroll bar is always on screen. The column headings stay at the top and the **Actions** column (Edit, Delete…) stays on the right while you scroll.

## 3. Events showed the publish date instead of the event date
**Fixed.** Events now have their own dates and location.

**How to set them:** Dashboard → News → **Posts** → open the event (or create one) → in **News Room placement**, set **Section** to **Events** → the **Event details** box appears:
- **Start date** (required): the first day of the exhibition or meeting
- **End date** (optional)
- **Location** (optional), e.g. "Messe München, Munich · Booth B4.410"

The Events page and the event article show these dates instead of the publish date. Upcoming events are listed first (the soonest at the top), and past events move below them automatically.

> Please open each existing event once, add its start date and save. Until then, it still shows the publish date.

## 4. Footer: same categories as the navigation bar
**Fixed.** The footer columns now follow the main menu: About Us · Manufacturing · Tier 1 Brands · Solutions & Projects · Services · News Room.

## 5. Can we change the footer ourselves? / Where do we add a first-level category?
**Yes.** Go to Dashboard → **Pages** → **Footer** (under "Site-wide"):
- **Link columns**: each column is one first-level category. You can **add a column** (e.g. "Manufacturing"), rename it, reorder it or remove it. Inside each column, add, edit, reorder or remove its links.
  - The "Manufacturing" and "Solutions & Projects" columns also list your published Manufacturing and Solutions pages automatically.
- **Contact info**: office, email and phone shown in the footer and on the Contact page.
- **Headings & labels**: newsletter text, copyright line, legal link names.

> The footer phone number is still the placeholder "+1 (000) 000-0000". Please replace it in Contact info.

## 6. Social media: add YouTube and others, or hide them
**Done.** Dashboard → **Pages** → **Footer** → **Social links**:
- **Add** a social link: set **Platform** (facebook, instagram, linkedin, youtube or x; anything else shows a globe icon), the **Label** and the **Link** (full https:// address).
- **Show on the website**: untick to hide a link without deleting it.

YouTube is already in the list, switched off. Add your channel link and tick **Show on the website**.

## 7. Cookie pop-up and Privacy Policy
**Done.**
- A **cookie banner** appears for every visitor until they click **Accept all** or **Reject non-essential**. The choice is remembered for 6 months, and the **Cookie settings** link in the footer opens the banner again.
- New pages: **Privacy Policy**, **Cookie Policy** and **Terms of Use**, linked at the bottom of the footer.
- The text is based on standard policies for similar company websites and uses CNX's details.

**To edit:** Dashboard → **Pages** → group **Legal** → Privacy Policy / Cookie Policy / Terms of Use / Cookie banner. Each policy is a list of sections (heading + text); you can add, edit, reorder or remove sections. Start a new line in the text for a new paragraph.

> Please check the policies with your legal team and fill in the company's registered details.

## 8. Empty box next to the FAQ on the product page
**Fixed.** This box is a contact card ("Need to ask something else?" with a person's photo, name and button). It was empty because its details had never been filled in. An empty card is now hidden automatically.

**To show it:** Dashboard → **Manufacturing** → edit the product → section **10 · FAQ** → **Contact card**: add a photo, name, role, message and button. Leave the name and message empty to hide the card.

## 9. "Request Quote" and "Download Datasheet" buttons did nothing
**Fixed.** The floating buttons at the bottom of product pages now work:
- **Request Quote** scrolls to the quotation form
- **Download Datasheet** opens the datasheet link
- **Talk to ODM Specialist** opens the specialist link

**To change where they go:** Dashboard → **Manufacturing** → edit the product → section **13 · Floating action bar**. For each button you can set the text and the link: a page (/contact), a section of the same page (#quotation) or a file from Media (e.g. a datasheet PDF). Leave a field empty to use the default. The switch at the top of the section hides the whole bar on that product.

## 10. Contact form: add, delete or hide fields and choose which are required
**Done.** Dashboard → **Pages** → **Contact** → **Form fields**. Each field has:
- **Label**: the field name visitors see
- **Field type**: Short text, Email, Phone, Number, Long text or Dropdown
- **Placeholder**: grey example text inside the field
- **Dropdown options**: for Dropdown fields, one option per line
- **Required**: visitors must fill it in
- **Hide this field**: removes it from the form but keeps its settings
- **Full width**: the field spans the whole row

You can **add** new fields, **delete** fields and **reorder** them. The **Email** field always stays visible and required, because it is how we reply.

Messages arrive in Dashboard → **Inquiries**. Answers to any fields you added appear in their own box on each message, and are included in the notification email.

## 11. Missing pages and backend editing
**Show / hide any page:** Dashboard → **Settings** → **Page visibility**. Untick a page to hide it: it disappears from the menu, the footer and the sitemap, and its address shows "Page not found". Tick it again to publish it. Pages that are not designed yet (Tier 1 brands, Technology, PV & BESS Brands, Global Distributor, Warranty, Stock Products and the Solutions / Projects overviews) are hidden for now, so visitors never reach an empty page.

Manufacturing and Solutions & Projects pages are shown or hidden with **Draft / Published** on each page.

**New page designs** (Revamping, Tier 1 brands, Solutions & Projects, Distributor): the wireframes are in Figma for your review. We'll build each page once you confirm, and each will be editable in the dashboard.
