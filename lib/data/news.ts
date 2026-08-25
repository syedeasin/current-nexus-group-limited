export type NewsBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "listLead"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string };

export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  readingMinutes: number;
  isHighlight: boolean;
  content: NewsBlock[];
}

/**
 * Phase 1 dummy data (docs/figma/news-and-news-details.md). Every component
 * reads posts only through the functions below, never this array directly,
 * so Phase 2 only has to rewrite the function bodies to query Supabase.
 *
 * Reserved slugs: "re-analysis", "knowledge-database", and "events" are
 * static routes under /news/ (see docs/figma/mega-menu.md) and take priority
 * over this dynamic [slug] route. No post below may ever use one of them.
 */
const posts: NewsPost[] = [
  {
    slug: "high-efficiency-solar-modules",
    title: "Why high-efficiency solar modules are transforming utility-scale projects",
    excerpt:
      "Higher-wattage, high-bifaciality modules are changing the economics of utility-scale solar, cutting balance-of-system costs while lifting yield per hectare.",
    category: "Industry Insight",
    coverImage: "/images/news/news-solar-modules.webp",
    publishedAt: "2026-07-30",
    readingMinutes: 7,
    isHighlight: true,
    content: [
      { type: "paragraph", text: "Utility-scale developers are under constant pressure to lower levelized cost of energy while land and interconnection queues grow more competitive. High-efficiency modules are one of the few levers that improve the economics on both sides of that equation at once." },
      { type: "heading", text: "More power per hectare" },
      { type: "paragraph", text: "750W+ modules with high-bifaciality HJT cells reduce the number of modules, racking, and DC cabling runs needed to hit a target capacity, which trims balance-of-system cost even before accounting for the yield gain from bifacial gain on the rear side." },
      { type: "listLead", text: "Developers evaluating a switch typically see gains in three areas:" },
      { type: "list", items: [
        "Lower BOS cost per watt from fewer modules and shorter cable runs",
        "Higher bifacial gain in high-albedo utility sites",
        "Reduced land footprint for the same nameplate capacity",
      ] },
      { type: "image", src: "/images/news/news-hjt-inline-01.webp", alt: "Rows of high-wattage solar modules installed at a utility-scale solar farm" },
      { type: "paragraph", text: "The trade-off is upfront module cost, which is why financing structure and O&M planning matter as much as the panel spec sheet when a project is sized for a 25-year hold." },
    ],
  },
  {
    slug: "hjt-solar-technology-yield",
    title: "How HJT solar technology delivers higher energy yield in real-world settings",
    excerpt:
      "Heterojunction cells combine crystalline silicon with thin amorphous layers to cut recombination losses — here is what that means for real project yield.",
    category: "Industry Insight",
    coverImage: "/images/news/news-hjt-tracker.webp",
    publishedAt: "2026-07-28",
    readingMinutes: 9,
    isHighlight: true,
    content: [
      { type: "paragraph", text: "Heterojunction (HJT) technology has moved from lab curiosity to mainstream Tier-1 production over the last few years. The core idea — sandwiching a crystalline silicon wafer between thin amorphous silicon layers — sounds academic, but the yield difference shows up clearly on a project's generation report." },
      { type: "heading", text: "Why the junction design matters" },
      { type: "paragraph", text: "Conventional PERC and TOPCon cells lose a meaningful share of generated electrons to recombination at the cell surface. HJT's passivating contact layers cut that loss sharply, which is why HJT cells post some of the highest open-circuit voltages and temperature coefficients in commercial production today." },
      { type: "listLead", text: "Key performance advantages include:" },
      { type: "list", items: [
        "Lower temperature coefficient, so output degrades less on hot roofs and ground-mount sites",
        "Higher bifaciality, typically 85% or above, for stronger rear-side gain",
        "Lower first-year and long-term degradation than PERC or standard TOPCon",
        "Simpler cell process with fewer high-temperature steps, which helps long-run reliability",
      ] },
      { type: "image", src: "/images/news/news-hjt-inline-02.webp", alt: "Technician inspecting a heterojunction solar module on a production line" },
      { type: "heading", text: "What this looks like on a real project" },
      { type: "paragraph", text: "On a 5MW ground-mounted array with single-axis trackers, switching from standard N-type modules to high-bifaciality HJT modules typically improves annual yield by several percentage points, with the gap widening in hot climates where the lower temperature coefficient keeps output higher through peak summer hours." },
      { type: "paragraph", text: "For EPCs and asset owners comparing module datasheets, the number worth tracking over a 25-year hold is not day-one efficiency alone — it is the combination of efficiency, temperature coefficient, and degradation curve that determines lifetime energy yield." },
    ],
  },
  {
    slug: "choosing-commercial-solar-module",
    title: "How to choose the right solar module for a commercial energy project",
    excerpt:
      "Roof load, shading, financing horizon, and warranty terms all shape which module makes sense for a commercial rooftop — a short framework for narrowing the field.",
    category: "Industry Insight",
    coverImage: "/images/news/news-commercial-module.webp",
    publishedAt: "2026-07-22",
    readingMinutes: 6,
    isHighlight: true,
    content: [
      { type: "paragraph", text: "Commercial rooftop projects sit in a different decision space than utility-scale ground mounts. Roof load limits, partial shading from HVAC units, and shorter financing horizons all change which module spec actually earns its premium." },
      { type: "heading", text: "Start with the roof, not the datasheet" },
      { type: "paragraph", text: "A structural assessment sets the ceiling on module weight and array density before efficiency or price enters the conversation. On older roofs, a lighter, higher-efficiency module can unlock capacity that a heavier standard panel simply cannot fit." },
      { type: "listLead", text: "Questions worth asking before shortlisting modules:" },
      { type: "list", items: [
        "What is the roof's remaining structural load capacity?",
        "How much of the array sits in partial shade for part of the day?",
        "What warranty term does the financing partner require?",
        "Does the module's degradation curve match the project's hold period?",
      ] },
      { type: "paragraph", text: "Once those constraints are clear, comparing OEM and ODM options against a fixed target capacity — rather than chasing the highest efficiency figure on the datasheet — usually produces the better commercial outcome." },
    ],
  },
  {
    slug: "bess-total-cost-ownership",
    title: "Understanding total cost of ownership for commercial BESS installations",
    excerpt:
      "Sticker price is a small part of a battery system's real cost — round-trip efficiency, augmentation, and warranty structure move the number more.",
    category: "Industry Insight",
    coverImage: "/images/news/news-bess-tco.webp",
    publishedAt: "2026-07-15",
    readingMinutes: 8,
    isHighlight: true,
    content: [
      { type: "paragraph", text: "Commercial and industrial BESS buyers often anchor on $/kWh at the point of purchase, but that figure tells only part of the story. Round-trip efficiency, calendar and cycle degradation, and augmentation strategy all compound over a 10 to 15 year asset life." },
      { type: "heading", text: "The four costs that matter most" },
      { type: "listLead", text: "A realistic TCO model should account for:" },
      { type: "list", items: [
        "Round-trip efficiency losses over the full discharge cycle",
        "Capacity fade and the augmentation plan needed to hold guaranteed capacity",
        "O&M and thermal management running costs",
        "End-of-warranty replacement or second-life disposition costs",
      ] },
      { type: "paragraph", text: "Cells with higher cycle life and a well-defined augmentation schedule often cost more upfront but land at a lower levelized cost of storage once the full ownership period is modeled." },
    ],
  },
  {
    slug: "topcon-vs-back-contact",
    title: "TOPCon vs Back Contact: choosing the right cell technology for your project",
    excerpt:
      "TOPCon and Back Contact cells solve similar efficiency problems from different directions — here is how the trade-offs shape up for real projects.",
    category: "Product Update",
    coverImage: "/images/news/news-topcon-cell.webp",
    publishedAt: "2026-07-08",
    readingMinutes: 6,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "TOPCon and Back Contact cells both push past the efficiency ceiling of standard PERC, but they get there differently — one through a passivated rear contact, the other by moving all contacts to the cell's back surface for a cleaner front face." },
      { type: "heading", text: "Where each technology wins" },
      { type: "paragraph", text: "TOPCon's manufacturing process shares more equipment with existing PERC lines, which has helped it scale quickly and keep cost per watt competitive. Back Contact modules trade some manufacturing complexity for a shading-free front surface and a cleaner aesthetic that residential and premium commercial buyers often prefer." },
      { type: "listLead", text: "A quick way to frame the decision:" },
      { type: "list", items: [
        "Cost-sensitive utility-scale — TOPCon usually wins on $/W today",
        "Premium residential or visible commercial roofs — Back Contact's clean face is a differentiator",
        "Hot climates — compare temperature coefficients directly, the gap is narrowing each generation",
      ] },
    ],
  },
  {
    slug: "global-solar-tariff-outlook-2026",
    title: "Global solar tariff outlook: what importers need to know in 2026",
    excerpt:
      "Trade policy keeps shifting across major solar markets — a summary of where tariffs stand and what buyers should build into sourcing plans.",
    category: "Company News",
    coverImage: "/images/news/news-tariff-outlook.webp",
    publishedAt: "2026-06-30",
    readingMinutes: 5,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "Tariff and trade-remedy rules on solar modules and cells continue to shift across major import markets, and sourcing teams that build flexibility into supplier agreements are weathering the changes better than those locked into single-origin contracts." },
      { type: "heading", text: "What to build into a 2026 sourcing plan" },
      { type: "listLead", text: "Buyers are increasingly asking suppliers for:" },
      { type: "list", items: [
        "Multi-origin manufacturing so a single tariff change does not stall a project",
        "Documentation trails that support country-of-origin verification",
        "Contract terms that share tariff risk rather than passing it entirely to one side",
      ] },
      { type: "paragraph", text: "None of this replaces good legal and customs advice for a specific market, but it does explain why diversified manufacturing footprints have become a selling point rather than a nice-to-have." },
    ],
  },
  {
    slug: "utility-scale-tracker-systems",
    title: "How tracker systems boost yield on utility-scale solar farms",
    excerpt:
      "Single-axis trackers add moving parts and O&M complexity, but the yield gain over fixed-tilt racking usually justifies it at utility scale.",
    category: "Industry Insight",
    coverImage: "/images/news/news-tracker-systems.webp",
    publishedAt: "2026-06-20",
    readingMinutes: 6,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "Single-axis trackers follow the sun from east to west across the day, keeping the module surface closer to perpendicular with incoming light for more of the day than fixed-tilt racking allows." },
      { type: "heading", text: "The yield and cost trade-off" },
      { type: "paragraph", text: "The gain is largest at higher latitudes and on sites with strong direct-normal irradiance, where trackers can lift annual yield well above a comparable fixed-tilt array. That gain has to be weighed against the added mechanical complexity, foundation requirements, and ongoing maintenance a tracker system introduces." },
      { type: "listLead", text: "Trackers tend to pencil out best when:" },
      { type: "list", items: [
        "The site has high direct-normal irradiance rather than mostly diffuse light",
        "Land is available for the wider row spacing trackers typically need",
        "The O&M team has experience maintaining tracking hardware",
      ] },
    ],
  },
  {
    slug: "oem-odm-manufacturing-guide",
    title: "A buyer's guide to OEM and ODM solar manufacturing partnerships",
    excerpt:
      "OEM and ODM both put your brand on the box, but the two models split responsibility for design very differently. Here is how to pick.",
    category: "Company News",
    coverImage: "/images/news/news-oem-odm.webp",
    publishedAt: "2026-06-10",
    readingMinutes: 5,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "OEM and ODM manufacturing both let a brand sell private-label solar and storage products without owning a factory, but the split of design responsibility between buyer and manufacturer is very different between the two models." },
      { type: "heading", text: "OEM vs ODM in practice" },
      { type: "listLead", text: "The practical differences that matter when evaluating a partner:" },
      { type: "list", items: [
        "OEM builds to the buyer's own design and specification",
        "ODM starts from the manufacturer's existing design, customized to the buyer's brand and requirements",
        "ODM usually gets to market faster; OEM gives more control over the final spec",
        "Both models still need the buyer to own certification, warranty, and after-sales terms",
      ] },
      { type: "paragraph", text: "Most first-time private-label buyers start with ODM to validate demand before investing in a fully custom OEM design." },
    ],
  },
  {
    slug: "residential-bess-safety-standards",
    title: "Residential BESS safety standards every installer should know",
    excerpt:
      "Battery fire risk gets outsized attention, but most residential BESS incidents trace back to a handful of preventable installation and design gaps.",
    category: "Industry Insight",
    coverImage: "/images/news/news-bess-safety.webp",
    publishedAt: "2026-05-28",
    readingMinutes: 7,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "Residential battery storage is subject to a growing set of safety standards covering cell chemistry, enclosure design, thermal management, and installation clearances. Installers who treat these as a checklist rather than a formality avoid the vast majority of field issues." },
      { type: "heading", text: "Where installation gaps usually happen" },
      { type: "listLead", text: "The most common preventable gaps are:" },
      { type: "list", items: [
        "Insufficient clearance from doors, windows, and escape routes",
        "Skipping ventilation requirements for the battery's chemistry and enclosure rating",
        "Undersized or incorrectly rated DC disconnects",
        "Missing or incomplete commissioning documentation",
      ] },
      { type: "paragraph", text: "LFP chemistry, now standard across most residential BESS products, is meaningfully more thermally stable than older NMC packs, but chemistry alone does not substitute for correct installation practice." },
    ],
  },
  {
    slug: "smart-pv-monitoring-platforms",
    title: "Smart PV monitoring platforms: turning panel data into performance",
    excerpt:
      "Module-level monitoring generates a flood of data — the platforms that matter are the ones that turn it into fewer truck rolls and faster fault detection.",
    category: "Product Update",
    coverImage: "/images/news/news-smart-monitoring.webp",
    publishedAt: "2026-05-15",
    readingMinutes: 6,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "Module-level monitoring and AI-driven analytics platforms have moved from a premium add-on to a near-standard feature on commercial and utility-scale solar projects, largely because the O&M savings pay for the hardware within the first few years." },
      { type: "heading", text: "What separates a useful platform from noise" },
      { type: "listLead", text: "The platforms that actually reduce O&M cost tend to share a few traits:" },
      { type: "list", items: [
        "String or module-level fault detection, not just inverter-level totals",
        "Automated alerts that distinguish real faults from normal weather-driven dips",
        "Historical performance baselines to catch slow degradation, not just hard failures",
      ] },
      { type: "paragraph", text: "The end goal is fewer unnecessary site visits and faster identification of the handful of underperforming strings that account for most lost generation." },
    ],
  },
  {
    slug: "logistics-tariff-compliance-solar-exports",
    title: "Navigating logistics and tariff compliance for solar exports",
    excerpt:
      "Getting modules and BESS units from factory to job site across borders is as much a compliance exercise as a shipping one.",
    category: "Company News",
    coverImage: "/images/news/news-logistics-compliance.webp",
    publishedAt: "2026-05-02",
    readingMinutes: 5,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "Exporting solar modules and battery storage systems involves more than booking freight. Documentation, classification, and country-of-origin compliance determine whether a shipment clears customs on schedule or sits in a bonded warehouse." },
      { type: "heading", text: "The compliance basics that prevent delays" },
      { type: "listLead", text: "Shipments move fastest when exporters have, ahead of time:" },
      { type: "list", items: [
        "Accurate HS classification for modules, inverters, and battery cells separately",
        "UN38.3 test documentation for any lithium battery shipment",
        "Country-of-origin paperwork that matches the destination market's current tariff rules",
      ] },
      { type: "paragraph", text: "Battery shipments in particular face stricter dangerous-goods handling than modules, so building UN38.3 documentation into the manufacturing process — rather than chasing it at shipping time — saves weeks on lead time." },
    ],
  },
  {
    slug: "epc-financing-solar-storage-projects",
    title: "How EPC+F financing accelerates solar and storage projects",
    excerpt:
      "Bundling engineering, procurement, construction, and financing into one package removes the biggest bottleneck for many ODM partners: working capital.",
    category: "Industry Insight",
    coverImage: "/images/news/news-epc-financing.webp",
    publishedAt: "2026-04-18",
    readingMinutes: 6,
    isHighlight: false,
    content: [
      { type: "paragraph", text: "For many ODM partners and project developers, the constraint on growth is not demand or technical capability — it is working capital tied up in long project cycles. EPC+F financing folds credit terms into the engineering, procurement, and construction package to remove that bottleneck." },
      { type: "heading", text: "What EPC+F changes for a project pipeline" },
      { type: "listLead", text: "Bundled financing typically helps partners in three ways:" },
      { type: "list", items: [
        "Frees up working capital that would otherwise sit in inventory and receivables",
        "Shortens the gap between signed contract and project start",
        "Lets smaller partners take on larger projects than their balance sheet alone would support",
      ] },
      { type: "paragraph", text: "The terms and qualification bar vary by partner and project size, but the structural benefit — decoupling growth from cash on hand — is consistent across markets." },
    ],
  },
];

export async function getHighlightPosts(): Promise<NewsPost[]> {
  return posts.filter((post) => post.isHighlight);
}

export async function getPosts(
  page: number,
  perPage: number
): Promise<{ posts: NewsPost[]; total: number; totalPages: number }> {
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    posts: posts.slice(start, start + perPage),
    total,
    totalPages,
  };
}

export async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: NewsPost | null; next: NewsPost | null }> {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  return posts.map((post) => post.slug);
}
