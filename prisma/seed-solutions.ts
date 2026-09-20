/**
 * Seeds the Residential page — the master design — into the SolutionPage table.
 * Content mirrors the copy that previously lived in messages/en.json under
 * `solutions.residential` and the assets in lib/data/solutions/residential.ts,
 * so the DB-rendered page is visually identical to the old bespoke page.
 *
 * Run: npx tsx prisma/seed-solutions.ts
 */

import { DownloadStatus, Locale, PrismaClient, SolutionMenuGroup } from "@prisma/client";
import type { SolutionPageContent } from "../lib/solutions-projects/types";

const prisma = new PrismaClient();

const R = "/images/solutionsAndProjects/solutions/residential";

const residentialContent: SolutionPageContent = {
  hero: {
    eyebrow: "SOLUTIONS & PROJECTS",
    heading: "Residential",
    description:
      "CurrentNexus Group Limited delivers residential energy storage systems that maximize solar self-consumption, provide reliable backup power, and reduce household energy costs.",
    backgroundImage: `${R}/solutions-residential-heroBanner.webp`,
    layout: "centered",
  },
  stats: {
    items: [
      { value: "540W", label: "Module performance" },
      { value: "23%", label: "Efficiency" },
      { value: "0.4%", label: "Annual performance reduction" },
      { value: "30 year", label: "Power Linearity Warranty" },
    ],
  },
  whyChoose: {
    eyebrow: "WHY CHOOSE",
    heading: "Why choose solar for your residential?",
    description:
      "Residential solar is a smart investment that lowers energy costs, increases energy independence, and delivers clean, reliable power for years to come.",
    image: `${R}/solutions-residential-whyChooseImage.webp`,
    features: [
      {
        icon: `${R}/solar-panel-02.svg`,
        title: "Greater energy independence",
        description:
          "Reduce reliance on the grid and power your home with sustainable solar energy.",
      },
      {
        icon: `${R}/circle-dollar-sign.svg`,
        title: "Lower energy costs",
        description:
          "Generate your own electricity and reduce bills with high-efficiency solar modules.",
      },
      {
        icon: `${R}/solar-panel-05.svg`,
        title: "Reliable clean power",
        description:
          "Enjoy renewable energy with long-lasting performance and minimal maintenance.",
      },
    ],
  },
  productModels: {
    eyebrow: "PRODUCT MODEL",
    heading: "Discover our technology",
    datasheetLabel: "Get your data-sheets here",
    products: [
      {
        name: "G12-0BB Uranus Pro Module 730-765W",
        image: `${R}/solutions-residential-product-model-730-765w.webp`,
        datasheetHref: "/service/downloads",
        buttonVariant: "primary",
      },
      {
        name: "G12-0BB Venus Pro Module 530-565W",
        image: `${R}/solutions-residential-product-model-530-565w.webp`,
        datasheetHref: "/service/downloads",
        buttonVariant: "outline",
      },
    ],
  },
  applications: {
    eyebrow: "SCENE OF APPLICATIONS",
    heading: "Ideal applications for our solar solutions",
    previousLabel: "Previous application",
    nextLabel: "Next application",
    cards: [
      {
        title: "Independent houses",
        description:
          "Reduce electricity bills with reliable rooftop solar for everyday homes year-round.",
        image: "/images/home/residentialSolar.webp",
      },
      {
        title: "Villas & luxury homes",
        description:
          "Premium solar systems for modern, high-performance homes with elegant design.",
        image: "/images/home/commercialBuildings.webp",
      },
      {
        title: "Apartments",
        description:
          "Smart solar energy solutions for shared and multi-family residential buildings with efficiency.",
        image: "/images/home/utilityScaleSolar.webp",
      },
      {
        title: "Farmhouses",
        description:
          "Reliable solar power for rural and agricultural properties with lasting performance.",
        image: "/images/home/virtualPowerPlantSolutions.webp",
      },
      {
        title: "Gated communities",
        description:
          "Community solar solutions for sustainable neighborhood living and energy savings.",
        image: "/images/home/supplyChainFinancing.webp",
      },
      {
        title: "Smart homes",
        description:
          "Smart solar solutions for connected modern homes with reliable clean energy.",
        image: "/images/home/supplyChainFinancing.webp",
      },
    ],
  },
  caseStudy: {
    eyebrow: "CLIENT SUCCESS STORY",
    heading: "Trusted by industrial clients",
    backgroundImage: "/images/manufacturing/bc-solar/success-story-bg.webp",
    title: "5MW HJT tracker project designed for higher yield",
    body: "A European ground-mounted solar project used high-bifaciality HJT modules with local tracker systems to improve power generation and efficiency compared with previous standard N-type module layouts. CNX supported module selection, export coordination, technical documents, and after-sales communication.",
    specs: [
      { icon: "Layers", text: "324 Vertex N NEG19RC.20 modules" },
      { icon: "Settings", text: "1.3MW System size" },
      { icon: "Sun", text: "Q4 2025 Rooftop carport mount" },
    ],
  },
  // No `cta` → the template renders the site-wide default CTA band, exactly as
  // the old page did with a bare <CtaBand />.
};

async function main() {
  await prisma.solutionPage.upsert({
    where: { slug_locale: { slug: "residential", locale: Locale.EN } },
    update: {
      title: "Residential Solar Solutions",
      status: DownloadStatus.PUBLISHED,
      publishedAt: new Date(),
      menuGroup: SolutionMenuGroup.SOLUTIONS,
      menuLabel: "Residential",
      menuOrder: 1,
      showInMegaMenu: true,
      isProtectedTemplate: true,
      metaTitle: "Residential Solar Solutions | CNX Energy",
      metaDescription:
        "CurrentNexus Group Limited delivers residential energy storage systems that maximize solar self-consumption, provide reliable backup power, and reduce household energy costs.",
      content: residentialContent as object,
    },
    create: {
      title: "Residential Solar Solutions",
      slug: "residential",
      locale: Locale.EN,
      status: DownloadStatus.PUBLISHED,
      publishedAt: new Date(),
      menuGroup: SolutionMenuGroup.SOLUTIONS,
      menuLabel: "Residential",
      menuOrder: 1,
      showInMegaMenu: true,
      isProtectedTemplate: true,
      metaTitle: "Residential Solar Solutions | CNX Energy",
      metaDescription:
        "CurrentNexus Group Limited delivers residential energy storage systems that maximize solar self-consumption, provide reliable backup power, and reduce household energy costs.",
      content: residentialContent as object,
    },
  });

  console.log("Seeded Residential solution page.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
