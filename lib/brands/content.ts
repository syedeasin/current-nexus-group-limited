import type { BrandCategory } from "@prisma/client";
import { bool, entries, str } from "@/lib/page-content/read";
import { getAt, mergeNode, type MessageTree } from "@/lib/page-content/tree";
import { readContactFields, type ContactField } from "@/lib/inquiries/form-fields";
import { brandTemplate } from "@/lib/brands/template";

/**
 * Typed view of a brand page: the template for the brand, with the admin's
 * stored edits merged over it (same merge as Dashboard → Pages, so a stale or
 * hand-edited row can't inject structure the components don't expect).
 */

export interface BrandTextItem {
  id: string;
  icon: string;
  title: string;
  body: string;
}

export interface BrandSpec {
  label: string;
  value: string;
}

export interface BrandProduct {
  id: string;
  image: string;
  series: string;
  category: string;
  specs: BrandSpec[];
  specsHref: string;
  datasheetHref: string;
}

export interface BrandScenario {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface BrandCase {
  id: string;
  image: string;
  title: string;
  location: string;
  application: string;
  products: string;
  role: string;
  results: string;
  caseHref: string;
}

export interface BrandFaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Section {
  hidden: boolean;
  eyebrow: string;
  heading: string;
}

export interface BrandContent {
  seo: { metaTitle: string; metaDescription: string };
  hero: {
    eyebrow: string;
    heading: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    backgroundImage: string;
  };
  overview: Section & { paragraphs: string[] };
  products: Section & {
    allLabel: string;
    viewSpecsLabel: string;
    datasheetLabel: string;
    quoteLabel: string;
    closeLabel: string;
    items: BrandProduct[];
  };
  advantages: Section & { items: BrandTextItem[] };
  buyers: Section & { items: BrandTextItem[] };
  documents: Section & { paragraphs: string[]; ctaLabel: string; ctaHref: string; items: BrandTextItem[] };
  applications: Section & { previousLabel: string; nextLabel: string; items: BrandScenario[] };
  cases: Section & {
    locationLabel: string;
    applicationLabel: string;
    productsLabel: string;
    roleLabel: string;
    resultsLabel: string;
    readLabel: string;
    items: BrandCase[];
  };
  procurement: Section & { paragraphs: string[]; ctaLabel: string; ctaHref: string; steps: BrandTextItem[] };
  faq: Section & { items: BrandFaqItem[] };
  inquiry: { eyebrow: string; heading: string; body: string; submitLabel: string; fields: ContactField[] };
}

/** Blank-line separated paragraphs (single newlines stay inside a paragraph). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function section(tree: unknown): Section {
  return { hidden: bool(tree, "hideSection"), eyebrow: str(tree, "eyebrow"), heading: str(tree, "heading") };
}

function textItems(raw: unknown): BrandTextItem[] {
  return entries(raw).map(([id, item]) => ({
    id,
    icon: str(item, "icon"),
    title: str(item, "title"),
    body: str(item, "body"),
  }));
}

/** Template for this brand with the stored edits laid over it, rooted at "brand". */
export function mergedBrandTree(name: string, category: BrandCategory, stored: unknown): MessageTree {
  const base = brandTemplate(name, category);
  return (mergeNode(base, stored) as MessageTree | undefined) ?? base;
}

export function readBrandContent(name: string, category: BrandCategory, stored: unknown): BrandContent {
  const root = getAt(mergedBrandTree(name, category, stored), "brand");
  const at = (key: string) => getAt(root, key);

  const hero = at("hero");
  const overview = at("overview");
  const products = at("products");
  const documents = at("documents");
  const applications = at("applications");
  const cases = at("cases");
  const procurement = at("procurement");
  const faq = at("faq");
  const inquiry = at("inquiry");
  const seo = at("seo");

  return {
    seo: { metaTitle: str(seo, "metaTitle"), metaDescription: str(seo, "metaDescription") },
    hero: {
      eyebrow: str(hero, "eyebrow"),
      heading: str(hero, "heading"),
      body: str(hero, "body"),
      primaryLabel: str(hero, "primaryLabel"),
      primaryHref: str(hero, "primaryHref"),
      secondaryLabel: str(hero, "secondaryLabel"),
      secondaryHref: str(hero, "secondaryHref"),
      backgroundImage: str(hero, "backgroundImage"),
    },
    overview: { ...section(overview), paragraphs: paragraphs(str(overview, "body")) },
    products: {
      ...section(products),
      allLabel: str(products, "allLabel"),
      viewSpecsLabel: str(products, "viewSpecsLabel"),
      datasheetLabel: str(products, "datasheetLabel"),
      quoteLabel: str(products, "quoteLabel"),
      closeLabel: str(products, "closeLabel"),
      items: entries(getAt(products, "items")).map(([id, item]) => ({
        id,
        image: str(item, "image"),
        series: str(item, "series"),
        category: str(item, "category"),
        specs: entries(item.specs)
          .map(([, spec]) => ({ label: str(spec, "label"), value: str(spec, "value") }))
          .filter((spec) => spec.label && spec.value),
        specsHref: str(item, "specsHref"),
        datasheetHref: str(item, "datasheetHref"),
      })),
    },
    advantages: { ...section(at("advantages")), items: textItems(getAt(at("advantages"), "items")) },
    buyers: { ...section(at("buyers")), items: textItems(getAt(at("buyers"), "items")) },
    documents: {
      ...section(documents),
      paragraphs: paragraphs(str(documents, "body")),
      ctaLabel: str(documents, "ctaLabel"),
      ctaHref: str(documents, "ctaHref"),
      items: textItems(getAt(documents, "items")),
    },
    applications: {
      ...section(applications),
      previousLabel: str(applications, "previousLabel"),
      nextLabel: str(applications, "nextLabel"),
      items: entries(getAt(applications, "items")).map(([id, item]) => ({
        id,
        title: str(item, "title"),
        description: str(item, "description"),
        image: str(item, "image"),
      })),
    },
    cases: {
      ...section(cases),
      locationLabel: str(cases, "locationLabel"),
      applicationLabel: str(cases, "applicationLabel"),
      productsLabel: str(cases, "productsLabel"),
      roleLabel: str(cases, "roleLabel"),
      resultsLabel: str(cases, "resultsLabel"),
      readLabel: str(cases, "readLabel"),
      items: entries(getAt(cases, "items")).map(([id, item]) => ({
        id,
        image: str(item, "image"),
        title: str(item, "title"),
        location: str(item, "location"),
        application: str(item, "application"),
        products: str(item, "products"),
        role: str(item, "role"),
        results: str(item, "results"),
        caseHref: str(item, "caseHref"),
      })),
    },
    procurement: {
      ...section(procurement),
      paragraphs: paragraphs(str(procurement, "body")),
      ctaLabel: str(procurement, "ctaLabel"),
      ctaHref: str(procurement, "ctaHref"),
      steps: textItems(getAt(procurement, "steps")),
    },
    faq: {
      ...section(faq),
      items: entries(getAt(faq, "items")).map(([id, item]) => ({
        id,
        question: str(item, "question"),
        answer: str(item, "answer"),
      })),
    },
    inquiry: {
      eyebrow: str(inquiry, "eyebrow"),
      heading: str(inquiry, "heading"),
      body: str(inquiry, "body"),
      submitLabel: str(inquiry, "submitLabel"),
      fields: readContactFields(getAt(inquiry, "fields")),
    },
  };
}
