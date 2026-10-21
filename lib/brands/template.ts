import type { BrandCategory } from "@prisma/client";
import type { MessageTree } from "@/lib/page-content/tree";

/**
 * The shared Tier 1 brand page template (client brief "CNX-Tier 1 brands-
 * Specific Landing Page", Oct 2026). Every brand page is this copy with the
 * brand's name and product category filled in; `BrandPage.content` stores
 * only what an admin changed on top (same diff format as Dashboard → Pages).
 *
 * Client-safe plain data: the public page, the dashboard editor and the save
 * action all build the same defaults from here, so an unedited field follows
 * a renamed brand automatically. Collection item ids are stable keys.
 */

type Words = {
  /** Heading form, e.g. "PV Modules". */
  title: string;
  /** Running-text form, e.g. "PV modules". */
  plural: string;
  eyebrow: string;
};

export const BRAND_CATEGORY_WORDS: Record<BrandCategory, Words> = {
  MODULES: { title: "PV Modules", plural: "PV modules", eyebrow: "Tier 1 brand · PV modules" },
  INVERTERS: { title: "Solar Inverters", plural: "solar inverters", eyebrow: "Tier 1 brand · Inverters" },
  BESS: { title: "Battery Energy Storage", plural: "battery energy storage systems", eyebrow: "Tier 1 brand · Energy storage" },
  MIXED: {
    title: "Inverters & Applicable Energy Storage Products",
    plural: "inverters and energy storage products",
    eyebrow: "Tier 1 brand · Inverters & storage",
  },
};

/** Section label shown on the collection page for each category. */
export const BRAND_CATEGORY_LABELS: Record<BrandCategory, string> = {
  MODULES: "Solar modules",
  INVERTERS: "Inverters",
  BESS: "Battery storage (BESS)",
  MIXED: "Inverters & storage",
};

/** The brief's H1 per category (JA Solar, Solis, Hithium and Deye examples). */
function heroHeading(name: string, category: BrandCategory): string {
  switch (category) {
    case "BESS":
      return `Explore ${name} Battery Energy Storage Solutions`;
    case "MIXED":
      return `Source ${name} Inverters & Applicable Energy Storage Products`;
    default:
      return `Source ${name} ${BRAND_CATEGORY_WORDS[category].title} Through CNX Energy`;
  }
}

const HERO_IMAGE: Record<BrandCategory, string> = {
  MODULES: "/images/home/utilityScaleSolar.webp",
  INVERTERS: "/images/home/commercialBuildings.webp",
  BESS: "/images/home/virtualPowerPlantSolutions.webp",
  MIXED: "/images/home/residentialSolar.webp",
};

/** Ordered `{ id: item }` — collection key order is display order. */
function list<T extends MessageTree>(items: [string, T][]): MessageTree {
  return Object.fromEntries(items);
}

/** The brief's "Product Advantages": what each product type should highlight. */
function advantages(category: BrandCategory): MessageTree {
  if (category === "MODULES") {
    return list([
      ["power", { icon: "zap", title: "Power output", body: "Rated power classes for each series, so module counts and string design can be checked against the system size." }],
      ["size", { icon: "maximize", title: "Module size & weight", body: "Dimensions and weight that affect racking, container loading and rooftop or tracker layout." }],
      ["bifaciality", { icon: "layers", title: "Bifaciality", body: "Rear-side gain for bifacial models, relevant to ground-mount, tracker and high-albedo sites." }],
      ["temperature", { icon: "thermometer", title: "Temperature coefficient", body: "Power loss per °C above 25 °C, which matters most in hot climates and on rooftops with little airflow." }],
    ]);
  }
  if (category === "BESS") {
    return list([
      ["energy", { icon: "battery", title: "Rated energy", body: "Usable capacity per unit and how units combine to reach the project's MWh target." }],
      ["power", { icon: "zap", title: "Rated power", body: "Charge and discharge power, and the duration it supports for the intended use case." }],
      ["cycleLife", { icon: "repeat", title: "Cycle life conditions", body: "Rated cycle life together with its test conditions: depth of discharge, C-rate and temperature." }],
      ["integration", { icon: "settings", title: "System integration", body: "PCS, EMS and grid-connection requirements to confirm before the system is specified." }],
    ]);
  }
  return list([
    ["powerRange", { icon: "gauge", title: "Power range", body: "Available ratings per series, matched to array size and the site's load profile." }],
    ["phase", { icon: "zap", title: "Phase", body: "Single-phase or three-phase models to suit the grid connection on site." }],
    ["grid", { icon: "plug", title: "Grid compatibility", body: "Grid codes, voltage and frequency settings, and the certifications required in the destination market." }],
    ["monitoring", { icon: "activity", title: "Monitoring", body: "Data loggers, apps and platforms for remote monitoring and after-sales diagnostics." }],
  ]);
}

/** Shared default when a new product is added in the editor (the first item is the template). */
function sampleProducts(category: BrandCategory): MessageTree {
  const spec = (label: string, value: string) => ({ label, value });
  if (category === "MODULES") {
    return list([
      [
        "series1",
        {
          image: "",
          series: "Product series 1",
          category: "n-type bifacial module",
          specs: list([
            ["power", spec("Power class", "600 W+")],
            ["cell", spec("Cell technology", "n-type")],
            ["glass", spec("Construction", "Bifacial, dual-glass")],
            ["fit", spec("Best for", "Utility & C&I")],
          ]),
          specsHref: "",
          datasheetHref: "/service/downloads",
        },
      ],
    ]);
  }
  if (category === "BESS") {
    return list([
      [
        "series1",
        {
          image: "",
          series: "Product series 1",
          category: "C&I energy storage cabinet",
          specs: list([
            ["energy", spec("Rated energy", "261 kWh")],
            ["power", spec("Rated power", "125 kW")],
            ["chemistry", spec("Cell chemistry", "LFP")],
            ["fit", spec("Best for", "C&I peak shaving")],
          ]),
          specsHref: "",
          datasheetHref: "/service/downloads",
        },
      ],
    ]);
  }
  return list([
    [
      "series1",
      {
        image: "",
        series: "Product series 1",
        category: "Three-phase hybrid inverter",
        specs: list([
          ["power", spec("Power range", "5–12 kW")],
          ["phase", spec("Phase", "Three-phase")],
          ["battery", spec("Battery", "Low-voltage, 48 V")],
          ["monitoring", spec("Monitoring", "Wi-Fi app & cloud")],
        ]),
        specsHref: "",
        datasheetHref: "/service/downloads",
      },
    ],
  ]);
}

/** Every editable section of a brand page, filled in for one brand. Root key "brand". */
export function brandTemplate(name: string, category: BrandCategory): MessageTree {
  const words = BRAND_CATEGORY_WORDS[category];
  const brand = name.trim() || "this brand";

  return {
    brand: {
      seo: {
        metaTitle: `${brand} ${words.title} Supplier`,
        metaDescription: `Source ${brand} ${words.plural} through CNX Energy: model selection, technical documents, quotation and delivery support for distributors, EPC contractors and project developers.`,
      },
      hero: {
        eyebrow: words.eyebrow,
        heading: heroHeading(brand, category),
        body: `Explore available ${brand} products for your solar and energy storage projects. CNX helps distributors, EPC contractors and project developers review applicable models, technical specifications and supply requirements, with quotation and documentation support based on your project needs.`,
        primaryLabel: `Request a ${brand} Quote`,
        primaryHref: "#inquiry",
        secondaryLabel: "Explore Available Products",
        secondaryHref: "#products",
        linkLabel: "Need Help Selecting a Model? Talk to Our Team",
        linkHref: "/contact",
        backgroundImage: HERO_IMAGE[category],
      },
      overview: {
        hideSection: "false",
        eyebrow: "Brand overview",
        heading: `${brand} products, sourced with CNX`,
        body: `${brand} is a supplier of ${words.plural} for residential, commercial & industrial and utility-scale solar and energy storage applications. This page helps procurement teams explore the product options available through CNX, review relevant technical information and discuss project-specific requirements.\n\nCNX's role is to support the sourcing process by clarifying product availability, coordinating applicable documentation and aligning the proposed supply scope with your project requirements. Specific product availability, regional supply arrangements and commercial terms are confirmed individually.`,
        image: "/images/about/whyChooseCNX/beyondProductImage.webp",
      },
      products: {
        hideSection: "false",
        eyebrow: "Product display",
        heading: `${brand} products available through CNX`,
        intro: "Key procurement parameters for each series. Full specifications are in the datasheet for the selected model.",
        allLabel: "All",
        viewSpecsLabel: "View Specifications",
        datasheetLabel: "Download Datasheet",
        quoteLabel: "Request a Quote",
        closeLabel: "Close",
        items: sampleProducts(category),
      },
      advantages: {
        hideSection: "false",
        eyebrow: "Product advantages",
        heading: `What to compare in ${brand} ${words.plural}`,
        items: advantages(category),
      },
      buyers: {
        hideSection: "false",
        eyebrow: "For the buyers",
        heading: "What to confirm before you order",
        items: list([
          ["performance", { title: "Performance Specifications", body: "Review rated output, operating parameters and other product specifications against your project design requirements." }],
          ["compatibility", { title: "System Compatibility", body: "Check relevant electrical interfaces, operating conditions and compatibility requirements before confirming equipment selection." }],
          ["quality", { title: "Quality & Documentation", body: "Request applicable product documentation, test reports and warranty information for the selected model." }],
          ["application", { title: "Application Fit", body: "Compare available models according to installation conditions, system architecture and project objectives." }],
          ["support", { title: "Technical Support", body: "Clarify product selection and documentation requirements with the CNX team before procurement." }],
          ["readiness", { title: "Procurement Readiness", body: "Confirm model availability, lead time, documentation and commercial terms before placing an order." }],
        ]),
      },
      documents: {
        hideSection: "false",
        eyebrow: "Technical documents & certifications",
        heading: "Technical Documents & Certifications",
        body: "Make informed procurement decisions with access to applicable product specifications and supporting documentation. Depending on the selected model and destination market, available resources may include datasheets, installation manuals, warranty terms, test reports and relevant conformity documents.\n\nContact CNX to request the documents applicable to your selected products and intended application.",
        ctaLabel: "Request Technical Documents",
        ctaHref: "#inquiry",
        items: list([
          ["datasheet", { icon: "file-text", title: "Product Datasheet", body: "Electrical, mechanical and operating specifications for each model." }],
          ["manual", { icon: "book-open", title: "Installation Manual", body: "Mounting, wiring and commissioning instructions from the manufacturer." }],
          ["warranty", { icon: "shield-check", title: "Warranty Information", body: "Product and performance warranty terms for the selected model." }],
          ["reports", { icon: "badge-check", title: "Test Reports & Certificates", body: "Type-test reports and conformity documents for the destination market." }],
          ["guide", { icon: "list-checks", title: "Product Selection Guide", body: "Model overview to compare series, ratings and applications." }],
        ]),
      },
      applications: {
        hideSection: "false",
        eyebrow: "Application scenarios",
        heading: `Where ${brand} products fit`,
        intro: `The right product depends on your installation environment, system design and project objectives. Explore the applications relevant to the available ${brand} product range and discuss your specific requirements with CNX before procurement.`,
        previousLabel: "Previous",
        nextLabel: "Next",
        items: list([
          ["residential", { title: "Residential Solar", description: "Explore applicable products for residential PV installations and, where supported, solar-plus-storage systems.", image: "/images/home/residentialSolar.webp" }],
          ["commercial", { title: "Commercial & Industrial", description: "Review product options against facility loads, system capacity, installation conditions and project specifications.", image: "/images/home/commercialBuildings.webp" }],
          ["utility", { title: "Utility-Scale Projects", description: "Assess applicable product models, project quantities, technical documentation and delivery requirements for large-scale deployments.", image: "/images/home/utilityScaleSolar.webp" }],
          ["storage", { title: "Energy Storage Applications", description: "Explore applicable products, evaluate storage requirements for renewable integration, load management and other defined energy use cases.", image: "/images/home/virtualPowerPlantSolutions.webp" }],
        ]),
      },
      cases: {
        // Off until the client sends verified projects — the brief asks for
        // "Verified Project Results", which can't be invented.
        hideSection: "true",
        eyebrow: "Case studies",
        heading: `${brand} Projects & Supply Case Studies`,
        locationLabel: "Project location",
        applicationLabel: "Application",
        productsLabel: "Products supplied",
        roleLabel: "CNX's role",
        resultsLabel: "Verified project results",
        readLabel: "Read Case Study",
        items: list([
          [
            "case1",
            {
              image: "/images/manufacturing/bc-solar/success-story-bg.webp",
              title: "Project name",
              location: "Country, region",
              application: "Utility-scale PV",
              products: "Model and quantity supplied",
              role: "Sourcing, documentation and delivery coordination",
              results: "",
              caseHref: "",
            },
          ],
        ]),
      },
      procurement: {
        hideSection: "false",
        eyebrow: "Procurement & delivery support",
        heading: `How CNX Supports Your ${brand} Procurement`,
        body: "From initial model selection to order coordination, CNX helps you clarify the practical details that matter before committing to a purchase.\n\nOur team can assist with applicable product information, availability checks, quotation preparation, export documentation coordination and technical clarification within the confirmed service scope.\n\nFor each order, we aim to establish a clear understanding of the product specification, quantity, delivery destination, lead time, commercial terms and required documentation before order confirmation.",
        ctaLabel: "Discuss Your Supply Requirements",
        ctaHref: "#inquiry",
        steps: list([
          ["selection", { title: "Product Selection", body: "Clarify models, specifications and project requirements." }],
          ["documentation", { title: "Documentation", body: "Request applicable datasheets, manuals and product documents." }],
          ["delivery", { title: "Order & Delivery Coordination", body: "Confirm stock or production lead time, shipping arrangements and order milestones." }],
          ["technical", { title: "Technical Assistance", body: "Clarify product-related questions and applicable after-sales support arrangements." }],
        ]),
      },
      faq: {
        hideSection: "false",
        eyebrow: "FAQ",
        heading: `${brand} sourcing questions`,
        items: list([
          ["bulk", { question: "Can I request a quotation for bulk orders or an EPC project?", answer: `Yes. Send the ${brand} models you are considering, the estimated quantity and the delivery destination. CNX prepares quotations for distributor stock orders as well as project-based supply for EPC contractors and developers.` }],
          ["information", { question: "What information do you need to provide an accurate quotation?", answer: "The product series or model, quantity, delivery country or port, required delivery date and any technical requirements. A BOQ or project specification helps us confirm the scope faster." }],
          ["selection", { question: "How do I select the right model for my project?", answer: "Start from the installation conditions, system design and project objectives. Share them with our team and we will help compare the applicable models and their datasheets before you decide." }],
          ["certifications", { question: "Which certifications and warranty terms apply to the selected product?", answer: "They depend on the model and the destination market. CNX can provide the applicable certificates, test reports and the manufacturer's warranty terms for the model you select." }],
          ["leadTime", { question: "What are the applicable lead times and minimum order requirements?", answer: "Lead time and minimum order quantity depend on the model, stock availability and the order volume. They are confirmed in the quotation for your specific request." }],
          ["compatibility", { question: "Can CNX help confirm product compatibility with my existing system?", answer: "Yes. Share the details of your existing equipment and our technical team will review the relevant interfaces and operating requirements with you before you order." }],
          ["support", { question: "What technical and after-sales support is available in my market?", answer: "Support arrangements vary by market and product. Tell us your location and we will clarify the technical assistance and after-sales support that apply to your order." }],
        ]),
      },
      inquiry: {
        eyebrow: "Request a quote",
        heading: "Still Comparing Models? Let Us Help You Choose.",
        body: "Send us your preferred model, project location and estimated quantity. Our team will help clarify product availability, technical documentation and quotation requirements.",
        submitLabel: "Send inquiry",
        fields: list([
          ["name", { label: "Full Name", type: "text", placeholder: "Your full name", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["email", { label: "Business Email", type: "email", placeholder: "name@company.com", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["company", { label: "Company Name", type: "text", placeholder: "Company name", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["country", { label: "Country / Delivery Destination", type: "text", placeholder: "e.g. Germany, Port of Hamburg", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["model", { label: "Product Series / Model", type: "text", placeholder: "Series or model name", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["quantity", { label: "Product Quantity", type: "text", placeholder: "e.g. 2,000 pcs or 5 MW", options: "", required: "true", hidden: "false", fullWidth: "false" }],
          ["capacity", { label: "Project Capacity (Optional)", type: "text", placeholder: "e.g. 12 MWp", options: "", required: "false", hidden: "false", fullWidth: "false" }],
          ["deliveryDate", { label: "Required Delivery Date (Optional)", type: "date", placeholder: "", options: "", required: "false", hidden: "false", fullWidth: "false" }],
          ["message", { label: "Technical Requirements (Optional)", type: "textarea", placeholder: "Certifications, grid code, packaging, Incoterms…", options: "", required: "false", hidden: "false", fullWidth: "true" }],
          ["boq", { label: "Upload BOQ or Specifications (Optional)", type: "file", placeholder: "", options: "", required: "false", hidden: "false", fullWidth: "true" }],
        ]),
      },
    },
  };
}
