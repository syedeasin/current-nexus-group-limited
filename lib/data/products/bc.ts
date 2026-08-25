import type { ProductDetail } from "@/lib/data/products/types";

/**
 * Full BC product detail data (docs/figma/product-detail-bc.md), sections 1-18.
 *
 * Content warning (doc §2): the Figma frame is named "BC Solar Panels" but
 * every piece of copy inside it is about HJT — eyebrow, heading, comparison
 * section, and both featured products. This is kept 100% verbatim per
 * instruction; do not "fix" it to say BC. Flag to Easin: confirm with the
 * client whether this content belongs on /bc or /hjt before launch.
 *
 * Other verbatim copy issues (doc §3), also kept as-is — see the Pass 2
 * report for the full list:
 *  - "Maximum system voltage" spec row: Figma has the label duplicated as
 *    the value. Kept literally below.
 *  - Table A "Note" column is internal designer instructions, stored in
 *    `internalNote` and never rendered by TechnicalSpecifications.tsx.
 *  - The doc's own warning list says Figma has "HJT week-light gain" and
 *    flags it as almost certainly meant to be "weak-light" — the doc's own
 *    data table already shows the corrected "weak-light" spelling, which is
 *    what's transcribed below.
 *  - Case study section: headline says 5MW but specs say 1.3MW system size;
 *    body says "ground-mounted" but specs say "Rooftop carport mount";
 *    "Vertex N NEG19RC.20" is a Trina Solar product line, not CNX.
 *  - FAQ answers 3 and 11 contain the word "template".
 *  - FAQ contact bio has the wrong company name ("Kelana"), a double space,
 *    and a missing final period.
 */
export const bcProductDetail: ProductDetail = {
  slug: "bc",
  category: "solar-panels",
  meta: {
    title: "BC Solar Panels | CNX Energy Manufacturing",
    description:
      "Build private-label PV projects with CNX high-bifaciality heterojunction modules, engineered for 765W+ output, low operating-temperature loss, and long-term power stability.",
  },
  hero: {
    eyebrow: "HJT Solar Panels",
    heading: "Redefining the yield boundaries of ODM projects with HJT",
    body: "Build private-label PV projects with CNX high-bifaciality heterojunction modules, engineered for 765W+ output, low operating-temperature loss, and long-term power stability.",
    primaryCta: { label: "Request datasheet", href: "#quotation" },
    secondaryCta: { label: "Talk to specialist", href: "/contact" },
    stats: [
      { value: "BNPI-845W", label: "Bifacial double-glass HJT module" },
      { value: "24.63%+", label: "Maximum Efficiency" },
      { value: "95%", label: "Up to Bifaciality" },
      { value: "15 year", label: "Process Warranty" },
      { value: "30 year", label: "Power Linearity Warranty" },
    ],
    backgroundImage: "/images/products/bc/hero-plant.jpg",
    productImage: "/images/products/bc/hero-product-shot.jpg",
  },
  introduction: {
    eyebrow: "Product Introduction",
    heading: "What is HJT Technology?",
    paragraphs: [
      "CNX HJT solar modules combine crystalline silicon with advanced amorphous silicon passivation to reduce recombination loss and maximize real-world energy yield. Designed for ODM partners, they deliver high power density, strong bifacial performance, low temperature loss, and reliable factory-controlled quality.",
      "Ideal for utility-scale, C&I rooftops, trackers, carports, and high-reflectance sites, CNX HJT modules improve project performance while simplifying procurement with one-stop manufacturing, certification support, packaging customization, and global shipping.",
    ],
    image: "/images/products/bc/product-intro-factory.jpg",
  },
  competitiveAdvantage: {
    eyebrow: "Our Competitive Advantage",
    heading: "Everything you need from one reliable partner",
    items: [
      {
        icon: "layer",
        title: "Bifacial Double-glass design",
        body: "Enhanced product weather ability with high mechanical load capacity front and rear.",
      },
      {
        icon: "cloud-sun-rain",
        title: "Low-light performance",
        body: "Reliable power generation in all weather, even during low light.",
      },
      {
        icon: "chart-increase",
        title: "High Bifaciality",
        body: "Bifaciality approaching 95%, achieving significantly higher rear-side gain.",
      },
      {
        icon: "apartment",
        title: "Wide Installation scenarios",
        body: "Large-scale power plants, commercial rooftops, and vertical installations.",
      },
      {
        icon: "menu-square",
        title: "Multi-Cut technology",
        body: "Ultra-high power output, resulting in lower BOS and LCOE costs per installed watt.",
      },
      {
        icon: "snow",
        title: "Low Temperature coefficient",
        body: "Less degradation at high temperatures, ensuring stable output.",
      },
    ],
  },
  engineeringDetails: {
    eyebrow: "ENGINEERING DETAILS",
    heading: "Built for strength, efficiency and long-term reliability",
    image: "/images/products/bc/engineering-panel.jpg",
    tabs: [
      {
        id: "mechanical",
        label: "Mechanical Parameters",
        rows: [
          { label: "Type and Size(mm):", value: "HJT Solar cell & 210x52.5" },
          { label: "No.of cells(pcs):", value: "276 (12x23)" },
          { label: "Dimension(mm):", value: "2384x1303x33" },
          { label: "Glass(mm):", value: "2.0mm" },
          { label: "Output Cable(mm):", value: "4mm2,length can be customized/UV resistant" },
          { label: "Weight(kg):", value: "38.4" },
          { label: "No.of Diodes(u.):", value: "3" },
          { label: "Frame:", value: "Anodized aluminum alloy frame / steel frame" },
        ],
      },
      {
        id: "temperature",
        label: "Temperature Coefficient",
        rows: [],
        pending: true,
      },
    ],
  },
  manufacturingReliability: {
    eyebrow: "Manufacturing excellence",
    heading: "Built in CNX controlled manufacturing for trusted ODM reliability",
    intro:
      "CNX integrates cell, module, and BESS production across its factory network, providing ODM partners with complete visibility into quality, capacity, compliance, and logistics. Every product follows a fully traceable workflow from material inspection to export.",
    items: [
      "6 Wholly-owned smart factories",
      "100% In-house traceability",
      "Cell → Module → BESS Full-chain integration",
      "Module-level barcode traceability",
      "In-house PID/LeTID/mechanical load testing",
      "Export to 50+ countries",
    ],
    image: "/images/products/bc/manufacturing-reliability.jpg",
  },
  manufacturingWorkflow: {
    eyebrow: "Manufacturing Workflow",
    heading: "From raw materials to certified quality",
    intro:
      "Every CNX module follows a fully traceable production process, ensuring consistent quality, reliable performance, and export-ready delivery.",
    steps: [
      {
        label: "Step 01",
        title: "Incoming material inspection",
        body: "Glass, cells, EVA/POE, frame, junction box, labels, packaging",
      },
      {
        label: "Step 02",
        title: "Cell cutting and stringing",
        body: "Half-cut HJT cells, string alignment, soldering quality",
      },
      {
        label: "Step 03",
        title: "Layup & lamination",
        body: "Glass-glass stack, encapsulant control, lamination profile",
      },
      {
        label: "Step 04",
        title: "EL & IV testing",
        body: "Microcrack screening, power binning, electrical performance verification",
      },
      {
        label: "Step 05",
        title: "Final QA & packaging",
        body: "Visual check, barcode traceability, pallet protection, shipment documents",
      },
    ],
  },
  awards: {
    eyebrow: "Industry Recognition",
    heading: "Recognized for excellence in manufacturing & innovation",
    backgroundImage: "/images/products/bc/awards-background.jpg",
    cards: [
      {
        image: "/images/products/bc/award-iec.png",
        alt: "IEC certification badge",
        caption: "Leading Renewable Energy Manufacturer Award",
      },
      {
        image: "/images/products/bc/award-tuv.png",
        alt: "TÜV Rheinland Certified badge",
        caption: "Leading Renewable Energy Manufacturer Award",
      },
      {
        image: "/images/products/bc/award-cqc.png",
        alt: "CQC certification badge",
        caption: "Leading Renewable Energy Manufacturer Award",
      },
    ],
  },
  technicalSpecifications: {
    eyebrow: "Detailed Specifications",
    heading: "Technical specifications at a glance",
    tableA: [
      {
        label: "Cell technology",
        value: "N-type HJT, half-cut cells",
        internalNote: "Replace with final bill of materials.",
      },
      {
        label: "Power range",
        value:
          "730-765W for Lians G12-0BB Uranus Pro Module; 530-565W for Lians G12-0BB Venus Pro Module",
        internalNote: "Create separate tabs if both series are sold.",
      },
      {
        label: "Module efficiency",
        value: "Up to 24.6%",
        internalNote: "Use exact module value after testing.",
      },
      {
        label: "Bifaciality",
        value: "Up to 95% typical template value",
        internalNote: "Show as datasheet value, not universal claim.",
      },
      {
        label: "Temperature coefficient Pmax",
        value: "Down to -0.24%/C template value",
        internalNote: "Replace with certified datasheet value.",
      },
      {
        label: "First-year degradation",
        value: "<=1.0%",
        internalNote: "Warranty claim must match warranty PDF.",
      },
      {
        label: "Annual degradation years 2-30",
        value: "<=0.32%",
        internalNote: "Warranty claim must match warranty PDF.",
      },
      {
        label: "Product warranty",
        value: "15-year product quality assurance",
        internalNote: "Confirm commercial policy.",
      },
      {
        label: "Power warranty",
        value: "30-year power output linear warranty",
        internalNote: "Link warranty document.",
      },
      {
        label: "Operating temperature",
        value: "-40° C to +85° C",
        internalNote: "Standard PV module range.",
      },
      {
        label: "Maximum system voltage",
        value: "Maximum system voltage",
        internalNote: "Project-level design compatibility. Figma has the label duplicated as the value — needs the real value.",
      },
      {
        label: "Frame and glass",
        value:
          "Anodized aluminum alloy frame / steel frame; 2.0mm Aluminum alloy/composite material frame; 2.0mm+1.6mm",
        internalNote: "ODM option.",
      },
    ],
    tableB: [
      {
        model: "G12-0BB Uranus Pro",
        pmax: "765",
        vmp: "46.75",
        imp: "16.37",
        voc: "52.62",
        isc: "17.23",
        maxVoltage: "1500V",
        fuse: "30A",
      },
      {
        model: "G12-0BB Venus Pro",
        pmax: "565",
        vmp: "34.61",
        imp: "16.33",
        voc: "38.96",
        isc: "17.20",
        maxVoltage: "1500V",
        fuse: "35A",
      },
    ],
  },
  whyChooseComparison: {
    eyebrow: "HJT vs TOPCon / PERC / BC Comparison",
    heading: "Why Choose HJT Technology",
    charts: [
      {
        title: "Typical bifaciality (%)",
        values: [
          { label: "PERC", value: 70 },
          { label: "TOPCon", value: 80 },
          { label: "HJT", value: 90 },
          { label: "BC", value: 70 },
        ],
      },
      {
        title: "Temperature coefficient (%/°C)",
        lowerIsBetter: true,
        values: [
          { label: "PERC", value: -0.35 },
          { label: "TOPCon", value: -0.3 },
          { label: "HJT", value: -0.24 },
          { label: "BC", value: -0.29 },
        ],
      },
      {
        title: "Annual degradation (%)",
        values: [
          { label: "PERC", value: 0.45 },
          { label: "TOPCon", value: 0.4 },
          { label: "HJT", value: 0.25 },
          { label: "BC", value: 0.35 },
        ],
      },
    ],
    table: [
      {
        technology: "PERC",
        positioning: "Mature P-type baseline",
        strength: "Lower cost, mature supply",
        tradeOff: "Lower bifaciality and higher degradation than advanced N-type options",
        bestFit: "Price-sensitive projects",
      },
      {
        technology: "TOPCon",
        positioning: "N-type passivated contact",
        strength: "Strong mainstream efficiency and broad supply",
        tradeOff: "Bifaciality and temperature performance vary by product",
        bestFit: "Utility and C&I projects",
      },
      {
        technology: "HJT",
        positioning: "N-type heterojunction",
        strength: "High bifaciality, low temperature coefficient, low degradation",
        tradeOff: "Requires strong process control & cost management",
        bestFit: "High-yield utility, trackers, hot climates, reflective sites",
        highlight: true,
      },
      {
        technology: "BC",
        positioning: "Back-contact architecture",
        strength: "High front-side efficiency and premium aesthetics",
        tradeOff: "Bifaciality and cost depend on design",
        bestFit: "Premium rooftop, BIPV, high-density layouts",
      },
    ],
  },
  energyGain: {
    eyebrow: "Energy yield & LCOE story",
    heading: "Illustrative annual energy gain model",
    yAxisLabels: [110, 88, 66, 44, 22, 0],
    bars: [
      { value: 100, displayValue: "100%", caption: "Baseline N-type project" },
      { value: 2.0, displayValue: "+2.0%", caption: "HJT low-temp gain" },
      { value: 4.5, displayValue: "+4.5%", caption: "HJT bifacial gain" },
      // Doc warning: Figma's own label reads "week-light" — almost certainly
      // meant "weak-light". Kept as written in the doc's table verbatim.
      { value: 1.5, displayValue: "+1.5%", caption: "HJT weak-light gain" },
    ],
  },
  productVariants: {
    eyebrow: "Applications",
    heading: "Powering every project with the right HJT solution",
    variants: [
      {
        eyebrowPair: ["Flagship level", "maximizing profits"],
        name: "G12-0BB Uranus Pro",
        body: "Engineered for utility-scale projects, Uranus Pro delivers 730–765W output, up to 24.63% efficiency, 85%±5% bifaciality, and a -0.24%/°C temperature coefficient for maximum energy yield. Certified for 2400Pa wind and 5400Pa snow loads, it offers a 30-year linear power warranty with ≤0.25% annual degradation from year 2.",
        specs: [
          { label: "Scene", value: "Utility, Commercial & Industrial" },
          { label: "Core selling point", value: "Ultra-high power, dual-sided gain, ultra-low attenuation" },
          { label: "Visual keywords", value: "Scale, desert/snowy terrain, tracking stand" },
        ],
        image: "/images/products/bc/variant-uranus.jpg",
        buttonLabel: "Download data-sheets",
        buttonHref: "#quotation",
      },
      {
        eyebrowPair: ["Aesthetic level", "distributed optimization"],
        name: "G12-0BB Venus Pro",
        body: "A full-black module purpose-built for distributed generation. Compact 1762×1303×30mm, 26kg design for load-bearing rooftops, with excellent low-light response and a power range of 530–565W matched to distributed project capacity.",
        specs: [
          { label: "Scene", value: "Residential, C&I, tourism & cultural" },
          { label: "Core selling point", value: "Total-black aesthetics, lightweight, low-light response" },
          { label: "Visual keywords", value: "Architecture integration, city skyline, rooftops" },
        ],
        image: "/images/products/bc/variant-venus.jpg",
        buttonLabel: "Download data-sheets",
        buttonHref: "#quotation",
      },
    ],
  },
  odm: {
    eyebrow: "ODM customization service",
    heading: "Private-label HJT manufacturing for your market",
    intro:
      "CNX supports ODM customers from module selection to certification, packaging, production, inspection, and shipment, helping launch private-label PV brands and EPC-ready solar solutions.",
    features: [
      {
        icon: "paint-board",
        title: "Branding",
        body: "Private label, carton design, label layout, datasheet cover, warranty file",
      },
      {
        icon: "settings-02",
        title: "Product configuration",
        body: "Power bin, frame color, glass, cable, connector type, pallet quantity",
      },
      {
        icon: "new-releases",
        title: "Certification",
        body: "IEC / CE / TÜV / UL pathway support according to target market",
      },
      {
        icon: "file-01",
        title: "Documentation",
        body: "Datasheet, manual, warranty, flash report, packing list, traceability",
      },
      {
        icon: "agreement-02",
        title: "Commercial terms",
        body: "MOQ by model and packaging; sample order before batch production",
      },
    ],
    image: "/images/products/bc/odm-service.jpg",
    serviceFlowHeading: "Service flow",
    serviceFlowSteps: [
      "Demand communication",
      "Technical selection",
      "Sample confirmation",
      "Batch production",
      "QA inspection",
      "Shipment",
    ],
    ctaLabel: "Talk to our ODM specialist",
    ctaHref: "/contact",
  },
  // Doc flags three factual contradictions in this section, kept verbatim
  // (see the Pass 1/2 report): the headline says 5MW while the specs say
  // 1.3MW, "ground-mounted" body copy vs. "Rooftop carport mount" spec, and
  // "Vertex N NEG19RC.20" is a Trina Solar product line, not CNX.
  caseStudy: {
    eyebrow: "Client success story",
    heading: "Real world HJT project success stories",
    backgroundImage: "/images/products/bc/case-study.jpg",
    title: "5MW HJT tracker project designed for higher yield",
    body: "A European utility developer selected CNX HJT modules for a ground-mounted tracker installation, targeting higher bifacial gain and lower temperature-related losses across a full commissioning season.",
    specs: [
      { icon: "layers", text: "324 Vertex N NEG19RC.20 modules" },
      { icon: "zap", text: "1.3MW System size" },
      { icon: "building", text: "Q4 2025 Rooftop carport mount" },
    ],
  },
  relatedProducts: {
    eyebrow: "Related products",
    heading: "Explore more energy solutions",
    items: [
      {
        title: "CNX TOPCon Solar Modules",
        body: "High-efficiency N-Type TOPCon modules delivering reliable performance for utility-scale and commercial solar projects.",
        image: "/images/manufacturing/product-topcon.jpg",
        href: "/manufacturing/solar-panels/topcon",
        featured: true,
      },
      {
        title: "CNX BC Solar Modules",
        body: "Premium back-contact solar modules combining exceptional efficiency with a sleek all-black design for modern installations.",
        image: "/images/manufacturing/product-bc.jpg",
        href: "/manufacturing/solar-panels/bc",
      },
      {
        title: "CNX 488kWh C&I BESS",
        body: "Commercial and industrial battery energy storage designed to optimize energy usage, reduce peak demand, and provide reliable backup power.",
        image: "/images/manufacturing/product-488kwh-bess.jpg",
        href: "/manufacturing/bess/488kwh",
      },
      {
        title: "Compatible String or Hybrid Inverters",
        body: "Smart hybrid and string inverters engineered for seamless integration with solar PV and battery storage systems.",
        image: "/images/products/bc/related-inverters.jpg",
        // No inverter product page exists yet in the manufacturing data file — points at the closest built hub for now.
        href: "/tier-1-brands",
      },
    ],
  },
  faq: {
    eyebrow: "Frequently asked question",
    heading: "Do you have any\nquestions for me?",
    defaultOpenId: "hjtDefinition",
    items: [
      {
        id: "hjtDefinition",
        question: "Q. What is HJT solar technology?",
        answer:
          "HJT, or heterojunction technology, combines crystalline silicon with thin amorphous silicon passivation layers to reduce recombination loss and improve module efficiency and long-term stability.",
      },
      {
        id: "hjtVsTopcon",
        question: "Q. How is HJT different from TOPCon?",
        answer:
          "Both are N-type technologies. HJT is known for high bifaciality, low temperature coefficient, and low degradation, while TOPCon has broad mainstream supply and strong cost competitiveness.",
      },
      {
        id: "powerRange",
        // Doc warning: this answer contains the word "template", left verbatim.
        question: "Q. What power range does CNX offer for HJT modules?",
        answer:
          "The utility HJT template covers 530W to 765W modules, with additional commercial rooftop formats available according to project requirements.",
      },
      {
        id: "ownBrand",
        question: "Q. Can CNX manufacture HJT modules under my own brand?",
        answer:
          "Yes. CNX supports ODM private-label projects, including logo, label, carton, datasheet, warranty file, and packaging customization.",
      },
      {
        id: "certifications",
        question: "Q. What certifications are available?",
        answer:
          "CNX can support common PV module certification requirements such as IEC, CE, TÜV, and UL where applicable. Final availability depends on the exact model and target market.",
      },
      {
        id: "moq",
        question: "Q. What is the typical MOQ?",
        answer:
          "MOQ depends on the selected model, packaging design, and certification requirements. CNX can confirm MOQ after the technical selection and branding scope are defined.",
      },
      {
        id: "hotClimates",
        question: "Q. Do HJT modules work better in hot climates?",
        answer:
          "HJT modules typically have a low temperature coefficient, which helps reduce power loss during hot operating hours. Site-level simulation is recommended for final yield estimates.",
      },
      {
        id: "bifacialSuitability",
        question: "Q. Are HJT modules suitable for bifacial projects?",
        answer:
          "Yes. HJT is often selected for bifacial applications because of its high rear-side response. The actual gain depends on albedo, mounting height, ground cover, and shading.",
      },
      {
        id: "flashReports",
        question: "Q. Can CNX provide flash reports and traceability data?",
        answer:
          "Yes. CNX can provide module-level documents such as flash reports, barcode traceability records, packing lists, and QA files according to order scope.",
      },
      {
        id: "combineWithBess",
        question: "Q. Can I combine CNX HJT modules with inverters and BESS?",
        answer:
          "Yes. CNX can support hybrid procurement by combining self-manufactured modules with inverter and BESS products for a more complete PV-plus-storage solution.",
      },
      {
        id: "warranty",
        // Doc warning: this answer contains the word "template", left verbatim.
        question: "Q. What warranty does CNX provide for HJT modules?",
        answer:
          "The template page uses a 15-year product warranty and 30-year linear power warranty. Final warranty terms must match the official warranty document.",
      },
      {
        id: "startProject",
        question: "Q. How do I start an ODM HJT module project?",
        answer:
          "Share your target market, power range, certification needs, branding scope, estimated volume, and delivery schedule. CNX will recommend a model and prepare the next-step quotation package.",
      },
    ],
    contact: {
      avatarSrc: "/images/home/emmaDP.png",
      name: "Emma Collins",
      role: "Customer care",
      // Doc warning: wrong company name ("Kelana", not CNX), double space,
      // and missing final period — kept 100% verbatim per instruction.
      message: "Hi, I'm Emma, Customer care of Kelana  Reach out anytime.",
      ctaLabel: "Let's talk",
      ctaHref: "/contact",
    },
  },
  quotationForm: {
    eyebrow: "Get in touch",
    heading: "Request your ODM quotation",
    productInterestOptions: ["G12-0BB Uranus Pro", "G12-0BB Venus Pro"],
    productInterestPlaceholder: "G12-0BB Uranus Pro",
  },
  documentsCta: {
    heading: "Technical Documents & Product Resources",
    buttonLabel: "Download Datasheet",
    buttonHref: "#quotation",
    backgroundImage: "/images/products/bc/documents-cta.jpg",
  },
};
