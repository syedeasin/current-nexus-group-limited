export interface ProductStat {
  value: string;
  label: string;
}

export interface ProductCta {
  label: string;
  href: string;
}

export interface ProductHero {
  eyebrow: string;
  heading: string;
  body: string;
  primaryCta: ProductCta;
  secondaryCta: ProductCta;
  stats: ProductStat[];
  /** Full-bleed background photo, landscape crop (>= lg). Ships pre-scrimmed. */
  backgroundImage: string;
  /** Portrait crop of the same photo — Figma art-directs a separate mobile hero frame. */
  backgroundImageMobile: string;
  /** The product shot layered on top: right of the copy on desktop, below it on mobile. */
  productImage: string;
}

export interface ProductIntroduction {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  image: string;
}

export interface FeatureItem {
  /** Looked up in a local ICONS map by the component that renders it. */
  icon: string;
  title: string;
  body: string;
}

export interface CompetitiveAdvantageSection {
  eyebrow: string;
  heading: string;
  items: FeatureItem[];
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface EngineeringTab {
  id: string;
  label: string;
  rows: SpecRow[];
  /** True when the Figma file has no content for this panel — render an empty-state row instead of inventing datasheet values. */
  pending?: boolean;
  /** Per-tab product image. Omit to fall back to `EngineeringDetails.image` (the first tab's photo) until a dedicated shot exists. */
  image?: string;
}

export interface EngineeringDetails {
  eyebrow: string;
  heading: string;
  /** Also the fallback image for any tab that doesn't set its own `image`. */
  image: string;
  tabs: EngineeringTab[];
}

export interface ManufacturingReliability {
  eyebrow: string;
  heading: string;
  intro: string;
  items: string[];
  image: string;
}

export interface WorkflowStep {
  label: string;
  title: string;
  body: string;
}

export interface ManufacturingWorkflow {
  eyebrow: string;
  heading: string;
  intro: string;
  steps: WorkflowStep[];
}

export interface AwardCard {
  image: string;
  alt: string;
  caption: string;
}

export interface AwardsSectionData {
  eyebrow: string;
  heading: string;
  backgroundImage: string;
  cards: AwardCard[];
}

export interface SpecTableRow {
  label: string;
  value: string;
  /** Internal designer instruction from Figma's "Note" column. Never rendered — see docs/figma/product-detail-bc.md warning 3. */
  internalNote?: string;
}

export interface ElectricalRow {
  model: string;
  pmax: string;
  vmp: string;
  imp: string;
  voc: string;
  isc: string;
  maxVoltage: string;
  fuse: string;
}

export interface TechnicalSpecifications {
  eyebrow: string;
  heading: string;
  tableA: SpecTableRow[];
  tableB: ElectricalRow[];
}

export interface ChartValue {
  label: string;
  value: number;
}

export interface ComparisonChart {
  title: string;
  /** Values are negative and lower is better (e.g. temperature coefficient) — height maps by absolute value and the panel shows a "lower is better" caption. */
  lowerIsBetter?: boolean;
  values: ChartValue[];
}

export interface ComparisonRow {
  technology: string;
  positioning: string;
  strength: string;
  tradeOff: string;
  bestFit: string;
  /** Highlights this row with the gold top/bottom border (the product's own technology). */
  highlight?: boolean;
}

export interface WhyChooseComparison {
  eyebrow: string;
  heading: string;
  charts: ComparisonChart[];
  table: ComparisonRow[];
}

export interface EnergyGainBar {
  /** Magnitude used for proportional bar height, scaled against the section's yAxisMax. */
  value: number;
  /** What's actually printed on the bar (e.g. "+2.0%") — distinct from `value` only in sign/formatting. */
  displayValue: string;
  caption: string;
}

export interface EnergyGainSection {
  eyebrow: string;
  heading: string;
  /** Descending Y-axis gridline labels, e.g. [110, 88, 66, 44, 22, 0]. */
  yAxisLabels: number[];
  bars: EnergyGainBar[];
}

export interface ProductVariantSpec {
  label: string;
  value: string;
}

export interface ProductVariant {
  eyebrowPair: [string, string];
  name: string;
  body: string;
  specs: ProductVariantSpec[];
  image: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ProductVariantsSection {
  eyebrow: string;
  heading: string;
  variants: ProductVariant[];
}

export interface OdmFeature {
  /** Looked up in a local ICONS map by the component that renders it. */
  icon: string;
  title: string;
  body: string;
}

export interface OdmSection {
  eyebrow: string;
  heading: string;
  intro: string;
  features: OdmFeature[];
  image: string;
  serviceFlowHeading: string;
  serviceFlowSteps: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface CaseStudySpec {
  /** Looked up in a local ICONS map by the component that renders it. */
  icon: string;
  text: string;
}

export interface CaseStudySection {
  eyebrow: string;
  heading: string;
  backgroundImage: string;
  title: string;
  body: string;
  specs: CaseStudySpec[];
}

export interface RelatedProduct {
  title: string;
  body: string;
  image: string;
  href: string;
  featured?: boolean;
}

export interface RelatedProductsSection {
  eyebrow: string;
  heading: string;
  items: RelatedProduct[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqContact {
  avatarSrc: string;
  name: string;
  role: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FaqSection {
  eyebrow: string;
  heading: string;
  items: FaqItem[];
  defaultOpenId: string;
  /** "Need to ask something else?" label above the contact card (Figma node 114:99410). */
  needHelpLabel: string;
  contact: FaqContact;
}

export interface QuotationFormSection {
  eyebrow: string;
  heading: string;
  productInterestOptions: string[];
  productInterestPlaceholder: string;
}

export interface DocumentsCtaSection {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundImage: string;
}

export interface ProductDetail {
  slug: string;
  category: string;
  meta: { title: string; description: string };
  hero: ProductHero;
  introduction?: ProductIntroduction;
  competitiveAdvantage?: CompetitiveAdvantageSection;
  engineeringDetails?: EngineeringDetails;
  manufacturingReliability?: ManufacturingReliability;
  manufacturingWorkflow?: ManufacturingWorkflow;
  awards?: AwardsSectionData;
  technicalSpecifications?: TechnicalSpecifications;
  whyChooseComparison?: WhyChooseComparison;
  energyGain?: EnergyGainSection;
  productVariants?: ProductVariantsSection;
  odm?: OdmSection;
  caseStudy?: CaseStudySection;
  relatedProducts?: RelatedProductsSection;
  faq?: FaqSection;
  quotationForm?: QuotationFormSection;
  documentsCta?: DocumentsCtaSection;
}
