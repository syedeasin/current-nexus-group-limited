import { Role, Locale, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { seedDownloads } from "./seed-downloads";

const makeSlug = (s: string) => slugify(s, { lower: true, strict: true, trim: true });

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? "Admin";

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    }

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            name,
            email,
            passwordHash: await bcrypt.hash(password, 12),
            role: Role.ADMIN,
        },
    });
    console.log("Admin ready:", admin.email);

    const categories = [
        { name: "Market Analysis", description: "Renewable energy market reports and outlooks." },
        { name: "Technology", description: "Solar cell, BESS and inverter technology explained." },
        { name: "Company News", description: "Announcements from CurrentNexus Group." },
        { name: "Policy", description: "Regulation, tariffs and energy policy updates." },
    ];

    const categoryIds: Record<string, string> = {};
    for (const [i, c] of categories.entries()) {
        const category = await prisma.category.upsert({
            where: { slug_locale: { slug: makeSlug(c.name), locale: Locale.EN } },
            update: {},
            create: {
                name: c.name,
                slug: makeSlug(c.name),
                locale: Locale.EN,
                description: c.description,
                sortOrder: i,
            },
        });
        categoryIds[c.name] = category.id;
    }
    console.log("Categories ready:", categories.length);

    const posts = [
        {
            title: "Global Solar Panel Prices Fall Amid Oversupply",
            category: "Market Analysis",
            status: PostStatus.PUBLISHED,
            excerpt: "Polysilicon oversupply is pushing module prices to multi-year lows across every major export market.",
            publishedAt: new Date("2026-08-10"),
            viewCount: 412,
            content: [
                "<h2>A buyer's market takes hold</h2>",
                "<p>Module spot prices have slipped below <strong>USD 0.09/W</strong> in several Asian markets, the lowest level on record. The correction is driven almost entirely by polysilicon: new capacity that came online through 2025 is now running at scale while demand growth has flattened in Europe and slowed in the United States.</p>",
                "<p>For distributors the effect is immediate. Inventory bought at 2024 prices is being written down, and procurement teams are shortening contract tenors to avoid locking in above-market rates.</p>",
                "<ul><li>Polysilicon down roughly 40% year on year</li><li>Wafer and cell margins compressed to near breakeven</li><li>Tier 1 manufacturers absorbing losses to hold market share</li></ul>",
                "<blockquote>We expect prices to stabilise only once weaker producers idle capacity, which historically lags the price trough by two to three quarters.</blockquote>",
            ].join(""),
        },
        {
            title: "TOPCon vs HJT: Which Cell Technology Wins in 2026",
            category: "Technology",
            status: PostStatus.PUBLISHED,
            excerpt: "A side-by-side look at efficiency, temperature coefficient and manufacturing cost for the two leading cell architectures.",
            publishedAt: new Date("2026-08-15"),
            viewCount: 289,
            content: [
                "<h2>The efficiency gap is narrowing</h2>",
                "<p>Mainstream <strong>TOPCon</strong> cells now ship at 24.5–25.0% efficiency, while <strong>heterojunction (HJT)</strong> lines are landing around 25.5%. The half-point advantage that once defined HJT has shrunk as TOPCon passivation stacks matured.</p>",
                "<p>Where HJT still leads clearly is the temperature coefficient, typically <em>-0.24%/°C</em> against -0.29%/°C for TOPCon. In hot climates that translates to a measurable yield gain over the array's life.</p>",
                "<ul><li>TOPCon: lower capex, drop-in compatibility with PERC lines</li><li>HJT: fewer process steps, better low-light and temperature behaviour</li><li>Both: bifaciality above 80%</li></ul>",
                "<blockquote>For most utility-scale buyers in 2026, TOPCon remains the safe default. HJT wins on projects where every kWh in high ambient heat is worth paying for.</blockquote>",
            ].join(""),
        },
        {
            title: "CurrentNexus Group Opens New BESS Assembly Line",
            category: "Company News",
            status: PostStatus.PUBLISHED,
            excerpt: "The new line doubles our battery energy storage system output capacity for 2026 export orders.",
            publishedAt: new Date("2026-08-20"),
            viewCount: 156,
            content: [
                "<h2>Doubling storage output for 2026</h2>",
                "<p>The second assembly line at our Shenzhen facility is now in serial production, taking annual <strong>BESS</strong> capacity from 1.2 GWh to 2.4 GWh. The expansion was commissioned in under seven months and is already allocated against confirmed export orders for the first half of the year.</p>",
                "<p>The line adds automated cell stacking, in-line impedance testing and a dedicated enclosure for fire-safety validation before any unit ships.</p>",
                "<ul><li>2.4 GWh combined annual capacity</li><li>Cell-to-pack testing on 100% of units</li><li>Container and rack form factors on the same line</li></ul>",
                "<blockquote>This investment lets us commit to twelve-week lead times on standard configurations through the whole of 2026.</blockquote>",
            ].join(""),
        },
        {
            title: "EU Carbon Border Tariff: What Manufacturers Need to Know",
            category: "Policy",
            status: PostStatus.PUBLISHED,
            excerpt: "A practical breakdown of CBAM reporting obligations for solar and battery exporters shipping into the EU.",
            publishedAt: new Date("2026-08-22"),
            viewCount: 98,
            content: [
                "<h2>CBAM moves from reporting to payment</h2>",
                "<p>The <strong>Carbon Border Adjustment Mechanism</strong> transitional phase ends and the definitive regime begins. Importers of covered goods must now surrender CBAM certificates matching the embedded emissions of what they bring into the EU.</p>",
                "<p>Solar modules are not yet a covered category, but the aluminium frames, steel mounting structures and battery inputs that ship alongside them are. Exporters that cannot supply verified emissions data will have default values applied, which are deliberately punitive.</p>",
                "<ul><li>Collect installation-level energy and emissions data now</li><li>Have it verified by an accredited body</li><li>Give EU importers a single reporting pack per shipment</li></ul>",
                "<blockquote>The manufacturers who prepared documentation during the transitional phase are the ones quoting confidently today. Everyone else is absorbing the default rate.</blockquote>",
            ].join(""),
        },
        {
            title: "Q3 Silicon Wafer Supply Chain Outlook",
            category: "Market Analysis",
            status: PostStatus.DRAFT,
            excerpt: "Early signals on wafer pricing heading into the fourth quarter.",
            publishedAt: null,
            viewCount: 0,
            content: [
                "<h2>Draft — pending Q3 data</h2>",
                "<p>This outlook will be published once end-of-quarter wafer shipment figures are confirmed. Early indications point to continued softness in <strong>182mm</strong> pricing with <strong>210mm</strong> holding a small premium.</p>",
                "<ul><li>Inventory across the chain still above seasonal norms</li><li>Utilisation cuts rumoured but not yet confirmed</li></ul>",
                "<blockquote>Placeholder body for the drafting workflow — not for publication.</blockquote>",
            ].join(""),
        },
        {
            title: "Inside Our New Battery Cell Testing Lab",
            category: "Technology",
            status: PostStatus.PENDING_REVIEW,
            excerpt: "A tour of the environmental and cycle-life testing equipment now running at our Shenzhen facility.",
            publishedAt: null,
            viewCount: 0,
            content: [
                "<h2>Cycle life, on site</h2>",
                "<p>Our new lab runs continuous <strong>charge-discharge cycling</strong> across a temperature range of -20°C to +55°C, letting us validate vendor cell claims rather than take them on datasheet trust.</p>",
                "<p>Each incoming cell batch is sampled and put through an accelerated ageing profile before it is cleared for pack assembly.</p>",
                "<ul><li>Thermal chambers for -20°C to +55°C testing</li><li>Cycle-life benches running 24/7</li><li>Abuse testing in an isolated bay</li></ul>",
                "<blockquote>Awaiting editorial review — photos and equipment specs to be added before publish.</blockquote>",
            ].join(""),
        },
        {
            title: "CurrentNexus Wins Tier 1 Distributor Award",
            category: "Company News",
            status: PostStatus.PENDING_REVIEW,
            excerpt: "Recognition from a leading industry body for distribution reliability and after-sales support.",
            publishedAt: null,
            viewCount: 0,
            content: [
                "<h2>Recognised for reliability</h2>",
                "<p>CurrentNexus Group has been named a <strong>Tier 1 Distributor</strong> by an independent industry association, based on on-time delivery, warranty response times and customer survey scores across the past twelve months.</p>",
                "<ul><li>98.6% on-time shipment rate</li><li>Average warranty resolution under five business days</li><li>Net promoter score of 61 from installer customers</li></ul>",
                "<blockquote>The award reflects the work of our logistics and after-sales teams more than anything on the commercial side.</blockquote>",
            ].join(""),
        },
        {
            title: "US Section 201 Tariff Renewal: Early Analysis",
            category: "Policy",
            status: PostStatus.ARCHIVED,
            excerpt: "Our original take on the 2025 tariff renewal decision, kept for reference.",
            publishedAt: new Date("2025-11-02"),
            viewCount: 731,
            content: [
                "<h2>Archived: our 2025 read</h2>",
                "<p>This analysis is retained for reference. It reflects our view at the time of the <strong>Section 201</strong> renewal and has not been updated for subsequent policy changes.</p>",
                "<p>Our expectation then was that the four-year extension would keep landed prices for imported cells elevated while domestic capacity ramped, and that the bifacial exclusion would remain the key swing factor for utility projects.</p>",
                "<ul><li>Extension confirmed through 2029</li><li>Annual tariff-rate quota on cells retained</li><li>Bifacial module exclusion left in place</li></ul>",
                "<blockquote>Kept for the record — see later coverage for the current position.</blockquote>",
            ].join(""),
        },
    ];

    for (const p of posts) {
        const slug = makeSlug(p.title);
        await prisma.post.upsert({
            where: { slug_locale: { slug, locale: Locale.EN } },
            update: { content: p.content },
            create: {
                title: p.title,
                slug,
                locale: Locale.EN,
                excerpt: p.excerpt,
                content: p.content,
                status: p.status,
                publishedAt: p.publishedAt,
                viewCount: p.viewCount,
                categoryId: categoryIds[p.category],
                authorId: admin.id,
            },
        });
    }
    console.log("Posts ready:", posts.length);

    await seedDownloads();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1); 
    })
    .finally(() => prisma.$disconnect());