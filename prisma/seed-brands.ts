/**
 * Seeds the Tier 1 brand pages (Dashboard → Tier 1 Brands): the seven brands
 * in the menu, plus a draft CNX page from the brief's H1 list. JA Solar is the
 * protected master template.
 *
 * Runs on every deploy (.github/workflows/deploy.yml) but only does anything
 * while the brand table is empty, so a brand an admin deleted never comes
 * back. `--fill` adds any missing brand (same slug + locale) to a non-empty
 * table; existing pages and their edits are never overwritten.
 *
 * Product series below are SAMPLE DATA from public product ranges, written as
 * classes ("600 W+") rather than datasheet values. Replace them with the
 * client's product list and datasheets before relying on them.
 *
 * Run: npx tsx prisma/seed-brands.ts
 */

import { BrandCategory, DownloadStatus, Locale, PrismaClient, type Prisma } from "@prisma/client";
import { toStorage, type MessageTree } from "../lib/page-content/tree";

const prisma = new PrismaClient();

type Spec = [label: string, value: string];
type Product = { series: string; category: string; specs: Spec[]; image?: string; specsHref?: string };

/** Products as a `brand.products.items` collection override. */
function products(items: Product[]): MessageTree {
  return {
    brand: {
      products: {
        items: Object.fromEntries(
          items.map((item, index) => [
            `p${index + 1}`,
            {
              image: item.image ?? "",
              series: item.series,
              category: item.category,
              specs: Object.fromEntries(item.specs.map(([label, value], i) => [`s${i + 1}`, { label, value }])),
              specsHref: item.specsHref ?? "",
              datasheetHref: "/service/downloads",
            },
          ])
        ),
      },
    },
  };
}

const L = "/images/trustedLogos";

interface SeedBrand {
  name: string;
  slug: string;
  category: BrandCategory;
  logo: string;
  summary: string;
  status: DownloadStatus;
  protected?: boolean;
  content: MessageTree;
}

const BRANDS: SeedBrand[] = [
  {
    name: "JA Solar",
    slug: "ja-solar",
    category: BrandCategory.MODULES,
    logo: `${L}/jaSolarLogo.svg`,
    summary: "n-type bifacial modules",
    status: DownloadStatus.PUBLISHED,
    protected: true,
    content: products([
      { series: "DeepBlue 4.0 Pro · 72-cell", category: "PV module", specs: [["Cell technology", "n-type TOPCon"], ["Power class", "600 W+"], ["Construction", "Bifacial, dual-glass"], ["Best for", "Utility & C&I ground mount"]] },
      { series: "DeepBlue 4.0 Pro · 54-cell", category: "PV module", specs: [["Cell technology", "n-type TOPCon"], ["Power class", "400 W+"], ["Format", "Compact 54-cell"], ["Best for", "Residential & C&I rooftops"]] },
      { series: "DeepBlue 3.0 · 72-cell", category: "PV module", specs: [["Cell technology", "p-type PERC"], ["Power class", "540 W+"], ["Construction", "Mono-facial or bifacial"], ["Best for", "Cost-focused utility projects"]] },
    ]),
  },
  {
    name: "Tongwei",
    slug: "tongwei",
    category: BrandCategory.MODULES,
    logo: `${L}/twSolarLogo.svg`,
    summary: "High-efficiency n-type modules",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "TNC Series · 72-cell", category: "PV module", specs: [["Cell technology", "n-type TOPCon"], ["Power class", "600 W+"], ["Construction", "Bifacial, dual-glass"], ["Best for", "Utility & C&I"]] },
      { series: "TNC Series · 54-cell", category: "PV module", specs: [["Cell technology", "n-type TOPCon"], ["Power class", "400 W+"], ["Format", "Compact 54-cell"], ["Best for", "Residential & C&I rooftops"]] },
      { series: "THC Series", category: "PV module", specs: [["Cell technology", "n-type heterojunction (HJT)"], ["Power class", "700 W+"], ["Construction", "Bifacial"], ["Best for", "Utility-scale plants"]] },
    ]),
  },
  {
    name: "Hithium",
    slug: "hithium",
    category: BrandCategory.BESS,
    logo: `${L}/hthium Logo.svg`,
    summary: "LFP cells & energy storage systems",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "PV and ESS Integrated Machine 125kW/261kWh", category: "C&I energy storage", image: "/images/premiumSolutions/hithiumPVndEssIntegratedMachine.webp", specs: [["Rated power", "125 kW"], ["Rated energy", "261 kWh"], ["Cell chemistry", "LFP"], ["Best for", "C&I solar-plus-storage"]] },
      { series: "ESS Cabinet 125kW/261kWh", category: "C&I energy storage", image: "/images/premiumSolutions/hithiumEssCabinet.webp", specs: [["Rated power", "125 kW"], ["Rated energy", "261 kWh"], ["Cell chemistry", "LFP"], ["Best for", "Peak shaving & backup"]] },
      { series: "∞Block 418 kWh", category: "Utility-scale storage", image: "/images/premiumSolutions/hithiumBlock.webp", specs: [["Rated energy", "418 kWh"], ["Cell chemistry", "LFP"], ["Format", "Modular block"], ["Best for", "Utility & grid-scale"]] },
    ]),
  },
  {
    name: "Growatt",
    slug: "growatt",
    category: BrandCategory.INVERTERS,
    logo: `${L}/growatt Logo.svg`,
    summary: "String & hybrid inverters",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "MIN TL-X Series", category: "String inverter", specs: [["Power range", "2.5–6 kW"], ["Phase", "Single-phase"], ["Grid", "On-grid"], ["Monitoring", "Wi-Fi app & cloud"]] },
      { series: "MOD TL3-X Series", category: "String inverter", specs: [["Power range", "3–15 kW"], ["Phase", "Three-phase"], ["Grid", "On-grid"], ["Monitoring", "Wi-Fi app & cloud"]] },
      { series: "MAX TL3-X Series", category: "String inverter", specs: [["Power range", "50 kW+"], ["Phase", "Three-phase"], ["Application", "Commercial rooftops"], ["Monitoring", "Cloud platform"]] },
    ]),
  },
  {
    name: "Deye",
    slug: "deye",
    category: BrandCategory.MIXED,
    logo: `${L}/deye Logo.svg`,
    summary: "Hybrid inverters & energy storage",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "SUN-SG04LP3 Series", category: "Hybrid inverter", specs: [["Power range", "5–12 kW"], ["Phase", "Three-phase"], ["Battery", "Low-voltage, 48 V"], ["Monitoring", "Wi-Fi app & cloud"]] },
      { series: "SUN-SG03LP1 Series", category: "Hybrid inverter", specs: [["Power range", "3.6–6 kW"], ["Phase", "Single-phase"], ["Battery", "Low-voltage, 48 V"], ["Monitoring", "Wi-Fi app & cloud"]] },
      { series: "RW-M6.1 Battery", category: "Energy storage", specs: [["Energy", "6.14 kWh per module"], ["Cell chemistry", "LFP"], ["Voltage", "51.2 V"], ["Scalability", "Parallel modules"]] },
    ]),
  },
  {
    name: "Solis",
    slug: "solis",
    category: BrandCategory.INVERTERS,
    logo: `${L}/solisLogo.svg`,
    summary: "String inverters",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "S6 Single-phase Series", category: "String inverter", specs: [["Power range", "2.5–6 kW"], ["Phase", "Single-phase"], ["Application", "Residential"], ["Monitoring", "Wi-Fi app & cloud"]] },
      { series: "Three-phase 5G Series", category: "String inverter", specs: [["Power range", "25–50 kW"], ["Phase", "Three-phase"], ["Application", "Commercial & industrial"], ["Monitoring", "Cloud platform"]] },
      { series: "EHV 5G Utility Series", category: "String inverter", specs: [["Power class", "255 kW"], ["Phase", "Three-phase, 1500 V"], ["Application", "Utility-scale"], ["Monitoring", "Plant SCADA ready"]] },
    ]),
  },
  {
    name: "GoodWe",
    slug: "goodwe",
    category: BrandCategory.INVERTERS,
    logo: `${L}/goodweLogo.svg`,
    summary: "Hybrid & C&I inverters",
    status: DownloadStatus.PUBLISHED,
    content: products([
      { series: "ET Plus+ Series", category: "Hybrid inverter", specs: [["Power range", "5–10 kW"], ["Phase", "Three-phase"], ["Battery", "High-voltage"], ["Monitoring", "SEMS portal"]] },
      { series: "DNS Series", category: "String inverter", specs: [["Power range", "3–6 kW"], ["Phase", "Single-phase"], ["Application", "Residential"], ["Monitoring", "SEMS portal"]] },
      { series: "SMT Series", category: "String inverter", specs: [["Power range", "25–36 kW"], ["Phase", "Three-phase"], ["Application", "Commercial & industrial"], ["Monitoring", "SEMS portal"]] },
    ]),
  },
  {
    // From the brief's H1 list. CNX's own products also have their own
    // Manufacturing pages, so this stays a draft until the client confirms it.
    name: "CNX",
    slug: "cnx",
    category: BrandCategory.MODULES,
    logo: "",
    summary: "HJT, TOPCon & BC modules, ODM",
    status: DownloadStatus.DRAFT,
    content: {
      brand: {
        ...(products([
          { series: "G12-0BB Uranus Pro Module 730–765W", category: "PV module", image: "/images/manufacturing/bc-solar/g12-0bb-uranus-pro.webp", specsHref: "/manufacturing/solar-panels/bc", specs: [["Power range", "730–765 W"], ["Cell technology", "Back contact (BC)"], ["Format", "G12"], ["Best for", "Utility & C&I"]] },
          { series: "G12-0BB Venus Pro Module 530–565W", category: "PV module", image: "/images/manufacturing/bc-solar/g12-0bb-venus-pro.webp", specsHref: "/manufacturing/solar-panels/bc", specs: [["Power range", "530–565 W"], ["Cell technology", "Back contact (BC)"], ["Format", "G12"], ["Best for", "Rooftop & C&I"]] },
        ]).brand as MessageTree),
        hero: { heading: "CNX Solar Modules & Customized PV Manufacturing Solutions" },
      },
    },
  },
];

async function main() {
  if ((await prisma.brandPage.count()) > 0 && !process.argv.includes("--fill")) {
    console.log("Brand pages: already set up, nothing to do.");
    return;
  }
  let created = 0;
  for (const [index, brand] of BRANDS.entries()) {
    const exists = await prisma.brandPage.findUnique({
      where: { slug_locale: { slug: brand.slug, locale: Locale.EN } },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.brandPage.create({
      data: {
        name: brand.name,
        slug: brand.slug,
        locale: Locale.EN,
        category: brand.category,
        status: brand.status,
        publishedAt: brand.status === DownloadStatus.PUBLISHED ? new Date() : null,
        isProtectedTemplate: brand.protected ?? false,
        logo: brand.logo,
        summary: brand.summary,
        menuOrder: index + 1,
        showInMegaMenu: true,
        content: toStorage(brand.content) as Prisma.InputJsonValue,
      },
    });
    created++;
  }
  console.log(`Brand pages: ${created} created, ${BRANDS.length - created} already there.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
