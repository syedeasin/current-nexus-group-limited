/**
 * Data model for a Solutions & Projects page.
 *
 * The page body is a fixed, ordered set of sections that mirror the Residential
 * master design (SolutionsProjectTemplate renders them in this order):
 *
 *   hero → stats → whyChoose → productModels → applications → caseStudy → cta
 *
 * Every section except the hero is optional: an omitted section is simply not
 * rendered. This shape is what `SolutionPage.content` (Prisma, JSON) holds and
 * what the dashboard form reads and writes, so it is the single source of truth
 * for both the renderer and the editor.
 */

import type { SolutionMenuGroup } from "@prisma/client";

export type PublishStatus = "DRAFT" | "PUBLISHED";

/** Hero / page banner (PageBanner). `layout` picks the two banner variants the
 *  master design uses: manufacturing-style bottom-aligned, or the taller
 *  Residential variant that centres a heading + paragraph. */
export interface SolutionHero {
  eyebrow: string;
  heading: string;
  description?: string;
  backgroundImage: string;
  layout?: "centered" | "bottom";
}

export interface SolutionStat {
  /** Rendered verbatim — units like "540W", "30 year", not counted numbers. */
  value: string;
  label: string;
}

export interface SolutionStatsSection {
  items: SolutionStat[];
}

export interface SolutionFeature {
  /** Image URL for the card icon (svg), e.g. /images/…/solar-panel-02.svg. */
  icon: string;
  title: string;
  description: string;
}

export interface SolutionWhyChooseSection {
  eyebrow: string;
  heading: string;
  description: string;
  image: string;
  features: SolutionFeature[];
}

export interface SolutionProduct {
  name: string;
  image: string;
  /** Datasheet target (e.g. /service/downloads). */
  datasheetHref: string;
  /** `primary` = filled gold; `outline` = neutral hairline. */
  buttonVariant?: "primary" | "outline";
}

export interface SolutionProductModelsSection {
  eyebrow: string;
  heading: string;
  datasheetLabel: string;
  products: SolutionProduct[];
}

export interface SolutionApplicationCard {
  title: string;
  description: string;
  image: string;
}

export interface SolutionApplicationsSection {
  eyebrow: string;
  heading: string;
  previousLabel: string;
  nextLabel: string;
  cards: SolutionApplicationCard[];
}

export interface SolutionCaseSpec {
  /** lucide-react icon name, resolved by the renderer (e.g. "Layers"). */
  icon: string;
  text: string;
}

export interface SolutionCaseStudySection {
  eyebrow: string;
  heading: string;
  backgroundImage: string;
  title: string;
  body: string;
  specs: SolutionCaseSpec[];
}

export interface SolutionCtaLink {
  label: string;
  href: string;
}

export interface SolutionCtaSection {
  heading?: string;
  subtext?: string;
  primary?: SolutionCtaLink;
  /** `null` = single-button CTA; omitted = the site's default secondary button. */
  secondary?: SolutionCtaLink | null;
  image?: { src: string; alt?: string };
}

export interface SolutionPageContent {
  hero: SolutionHero;
  stats?: SolutionStatsSection;
  whyChoose?: SolutionWhyChooseSection;
  productModels?: SolutionProductModelsSection;
  applications?: SolutionApplicationsSection;
  caseStudy?: SolutionCaseStudySection;
  /** Omit to render the site-wide default CTA band. */
  cta?: SolutionCtaSection;
}

/** A published page as the mega menu needs it — no body, just placement. */
export interface SolutionMenuEntry {
  slug: string;
  menuLabel: string;
  menuGroup: SolutionMenuGroup;
  menuOrder: number;
}
