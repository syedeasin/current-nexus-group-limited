/**
 * The brand editor's sections, in page order. `settings` is the row itself
 * (name, address, status…); the rest edit `BrandPage.content` over the
 * template in lib/brands/template.ts. Shared by the editor page and the save
 * action so both agree on what is editable.
 */
export interface BrandEditorSection {
  id: string;
  label: string;
  path: string;
  description?: string;
}

export const BRAND_SETTINGS_SECTION: BrandEditorSection = {
  id: "settings",
  label: "Brand settings",
  path: "brand.settings",
  description: "Name, web address, status, category and logo. Draft pages are not on the website, the menu or the Tier 1 Brands page.",
};

export const BRAND_CONTENT_SECTIONS: BrandEditorSection[] = [
  { id: "seo", label: "SEO", path: "brand.seo", description: "Browser tab title and search-result description." },
  { id: "hero", label: "Hero", path: "brand.hero" },
  { id: "overview", label: "Brand overview", path: "brand.overview", description: "Leave a blank line between paragraphs." },
  {
    id: "products",
    label: "Product display",
    path: "brand.products",
    description: "Each product: photo, series, category and 3 to 5 key parameters. Filter tabs appear when products have two or more categories. A product without a photo shows the brand logo.",
  },
  { id: "advantages", label: "Product advantages", path: "brand.advantages" },
  { id: "buyers", label: "For the buyers", path: "brand.buyers", description: "Numbered 01, 02… in this order." },
  { id: "documents", label: "Technical documents & certifications", path: "brand.documents", description: "Leave a blank line between paragraphs." },
  { id: "applications", label: "Application scenarios", path: "brand.applications" },
  {
    id: "cases",
    label: "Case studies",
    path: "brand.cases",
    description: "Hidden until you add verified projects — untick “Hide this section” when they are ready.",
  },
  { id: "procurement", label: "Procurement & delivery support", path: "brand.procurement", description: "Leave a blank line between paragraphs." },
  { id: "faq", label: "FAQ", path: "brand.faq" },
  {
    id: "inquiry",
    label: "Final inquiry form",
    path: "brand.inquiry",
    description:
      "Add, remove, reorder or hide fields and choose which are required. The Email field is always shown. The “Product Series / Model” field is filled in when a visitor clicks a product's “Request a Quote”. Requests arrive in Dashboard → Inquiries.",
  },
];
