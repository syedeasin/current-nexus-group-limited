import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { DownloadStatus, Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";

/**
 * Seed data for Service → Downloads.
 *
 * Two things are seeded: the filter taxonomy (which an admin can then edit at
 * /dashboard/downloads/filters without a deploy) and a catalogue of resources
 * large enough that pagination, faceting and search are exercised for real
 * rather than demoed against a single page of rows.
 *
 * The PDFs are generated here rather than committed: /public/uploads is
 * gitignored, and a repository is the wrong place for binaries. They are real,
 * openable one-page PDFs, so the Download button delivers an actual file end to
 * end instead of a placeholder.
 *
 * The FR rows deliberately reuse the EN storage keys — a datasheet is
 * language-neutral. That is the case the admin delete/replace path has to
 * reference-count before unlinking a file.
 */

const UPLOAD_SUBDIR = path.join("downloads", "seed");

/** Escape the three characters that are special inside a PDF literal string. */
function pdfEscape(text: string): string {
  return text.replace(/[\\()]/g, (char) => `\\${char}`);
}

/**
 * Emit a valid single-page PDF. Hand-assembled rather than pulled from a
 * dependency: the xref table needs real byte offsets, which is the only fiddly
 * part, and adding a PDF library to the build for seed data would not be worth
 * it.
 */
function buildPdf(title: string, subtitle: string): Buffer {
  const body = [
    `BT /F1 20 Tf 60 760 Td (${pdfEscape(title)}) Tj ET`,
    `BT /F2 12 Tf 60 730 Td (${pdfEscape(subtitle)}) Tj ET`,
    `BT /F2 11 Tf 60 700 Td (${pdfEscape("CurrentNexus Group Limited - technical resource")}) Tj ET`,
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(body, "latin1")} >>\nstream\n${body}\nendstream`,
  ];

  const header = "%PDF-1.4\n";
  let pdf = header;
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

async function writeSeedPdf(fileSlug: string, title: string, subtitle: string) {
  const dir = path.join(process.cwd(), "public", "uploads", UPLOAD_SUBDIR);
  await mkdir(dir, { recursive: true });

  const fileName = `${fileSlug}.pdf`;
  const bytes = buildPdf(title, subtitle);
  await writeFile(path.join(dir, fileName), bytes);

  const key = path.posix.join("uploads", "downloads", "seed", fileName);
  return {
    fileKey: key,
    fileUrl: `/${key}`,
    fileName: `${fileSlug}.pdf`,
    mimeType: "application/pdf",
    fileSize: bytes.byteLength,
  };
}

type GroupSeed = {
  slug: string;
  en: string;
  fr: string;
  options: { slug: string; en: string; fr: string }[];
};

/** Mirrors the sidebar in Figma node 2080:38699, plus options for the two groups it draws collapsed. */
const GROUPS: GroupSeed[] = [
  {
    slug: "solar-panel-modules",
    en: "Solar panel modules",
    fr: "Modules photovoltaïques",
    options: [
      { slug: "hjt-series", en: "HJT Series", fr: "Série HJT" },
      { slug: "topcon-series", en: "TOPCon Series", fr: "Série TOPCon" },
      { slug: "back-contact-series", en: "Back Contact Series", fr: "Série Back Contact" },
    ],
  },
  {
    slug: "energy-storage",
    en: "Energy storage",
    fr: "Stockage d'énergie",
    options: [
      { slug: "battery", en: "Battery", fr: "Batterie" },
      { slug: "ess", en: "ESS", fr: "SSE" },
      { slug: "inverter", en: "Inverter", fr: "Onduleur" },
    ],
  },
  {
    slug: "documents-type",
    en: "Documents type",
    fr: "Type de document",
    options: [
      { slug: "datasheets", en: "Datasheets", fr: "Fiches techniques" },
      { slug: "product-catalogs", en: "Product Catalogs", fr: "Catalogues produits" },
      { slug: "brochures", en: "Brochures", fr: "Brochures" },
    ],
  },
  {
    slug: "technical-documents",
    en: "Technical documents",
    fr: "Documents techniques",
    options: [
      { slug: "installation-guides", en: "Installation Guides", fr: "Guides d'installation" },
      { slug: "warranty-documents", en: "Warranty Documents", fr: "Documents de garantie" },
      { slug: "compliance-documents", en: "Compliance Documents", fr: "Documents de conformité" },
    ],
  },
  {
    slug: "certifications",
    en: "Certifications",
    fr: "Certifications",
    options: [
      { slug: "iec", en: "IEC", fr: "IEC" },
      { slug: "tuv", en: "TÜV", fr: "TÜV" },
      { slug: "iso", en: "ISO", fr: "ISO" },
    ],
  },
];

type ResourceSeed = {
  en: string;
  fr: string;
  subtitle: string;
  options: string[];
  tags: string[];
};

const RESOURCES: ResourceSeed[] = [
  {
    en: "G12-0BB Uranus Pro Module 730-765W datasheet",
    fr: "Fiche technique module G12-0BB Uranus Pro 730-765 W",
    subtitle: "HJT bifacial module, 730-765W",
    options: ["hjt-series", "datasheets"],
    tags: ["uranus", "hjt", "730w"],
  },
  {
    en: "G12-0BB Venus Pro Module 530-565W datasheet",
    fr: "Fiche technique module G12-0BB Venus Pro 530-565 W",
    subtitle: "HJT bifacial module, 530-565W",
    options: ["hjt-series", "datasheets"],
    tags: ["venus", "hjt", "530w"],
  },
  {
    en: "CNX TOPCon N-Type Module 580-610W datasheet",
    fr: "Fiche technique module TOPCon N-Type 580-610 W",
    subtitle: "TOPCon N-type module, 580-610W",
    options: ["topcon-series", "datasheets"],
    tags: ["topcon", "n-type"],
  },
  {
    en: "CNX Back Contact Module 600-630W datasheet",
    fr: "Fiche technique module Back Contact 600-630 W",
    subtitle: "Back contact module, 600-630W",
    options: ["back-contact-series", "datasheets"],
    tags: ["back contact", "bc"],
  },
  {
    en: "CNX Solar Module Product Catalog 2026",
    fr: "Catalogue produits modules solaires 2026",
    subtitle: "Full module range, 2026 edition",
    options: ["hjt-series", "topcon-series", "back-contact-series", "product-catalogs"],
    tags: ["catalog", "2026"],
  },
  {
    en: "Residential Energy Storage System brochure",
    fr: "Brochure système de stockage résidentiel",
    subtitle: "Residential ESS overview",
    options: ["ess", "battery", "brochures"],
    tags: ["residential", "ess"],
  },
  {
    en: "CNX Hybrid Inverter 5-12kW datasheet",
    fr: "Fiche technique onduleur hybride 5-12 kW",
    subtitle: "Hybrid inverter, 5-12kW",
    options: ["inverter", "datasheets"],
    tags: ["inverter", "hybrid"],
  },
  {
    en: "LFP Battery Module 5.12kWh datasheet",
    fr: "Fiche technique module batterie LFP 5,12 kWh",
    subtitle: "LFP battery module, 5.12kWh",
    options: ["battery", "datasheets"],
    tags: ["lfp", "battery"],
  },
  {
    en: "Rooftop module installation guide",
    fr: "Guide d'installation en toiture",
    subtitle: "Mounting and wiring instructions",
    options: ["installation-guides", "hjt-series"],
    tags: ["installation", "rooftop"],
  },
  {
    en: "Ground-mount and tracker installation guide",
    fr: "Guide d'installation au sol et sur trackers",
    subtitle: "Ground-mount and tracker systems",
    options: ["installation-guides", "topcon-series"],
    tags: ["installation", "tracker"],
  },
  {
    en: "30-year power linearity warranty statement",
    fr: "Attestation de garantie de linéarité 30 ans",
    subtitle: "Warranty terms and conditions",
    options: ["warranty-documents"],
    tags: ["warranty", "30 year"],
  },
  {
    en: "IEC 61215 / IEC 61730 certificate",
    fr: "Certificat IEC 61215 / IEC 61730",
    subtitle: "Design qualification and safety certification",
    options: ["certifications", "iec", "compliance-documents"],
    tags: ["iec", "certificate"],
  },
  {
    en: "TÜV Rheinland module test report",
    fr: "Rapport d'essai TÜV Rheinland",
    subtitle: "Independent module test report",
    options: ["certifications", "tuv", "compliance-documents"],
    tags: ["tuv", "test report"],
  },
  {
    en: "ISO 9001 quality management certificate",
    fr: "Certificat de management de la qualité ISO 9001",
    subtitle: "Quality management system certification",
    options: ["certifications", "iso"],
    tags: ["iso", "quality"],
  },
  {
    en: "Energy storage safety compliance pack",
    fr: "Dossier de conformité sécurité du stockage",
    subtitle: "ESS transport and safety compliance",
    options: ["ess", "compliance-documents"],
    tags: ["safety", "compliance"],
  },
];

export async function seedDownloads() {
  // Taxonomy, one row set per locale — the convention Category/Tag already use.
  const optionIdsByLocale: Record<Locale, Record<string, string>> = {
    [Locale.EN]: {},
    [Locale.FR]: {},
  };

  for (const [groupIndex, group] of GROUPS.entries()) {
    for (const locale of [Locale.EN, Locale.FR] as const) {
      const record = await prisma.filterGroup.upsert({
        where: { slug_locale: { slug: group.slug, locale } },
        update: { name: locale === Locale.EN ? group.en : group.fr, sortOrder: groupIndex },
        create: {
          name: locale === Locale.EN ? group.en : group.fr,
          slug: group.slug,
          locale,
          sortOrder: groupIndex,
        },
      });

      for (const [optionIndex, option] of group.options.entries()) {
        const saved = await prisma.filterOption.upsert({
          where: { groupId_slug: { groupId: record.id, slug: option.slug } },
          update: { name: locale === Locale.EN ? option.en : option.fr, sortOrder: optionIndex },
          create: {
            name: locale === Locale.EN ? option.en : option.fr,
            slug: option.slug,
            sortOrder: optionIndex,
            groupId: record.id,
          },
        });
        optionIdsByLocale[locale][option.slug] = saved.id;
      }
    }
  }
  console.log("Filter taxonomy ready:", GROUPS.length, "groups");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

  for (const [index, resource] of RESOURCES.entries()) {
    const fileSlug = makeSlug(resource.en);
    // One file, both locales point at it — the shared-key case delete has to handle.
    const stored = await writeSeedPdf(fileSlug, resource.en, resource.subtitle);

    for (const locale of [Locale.EN, Locale.FR] as const) {
      const title = locale === Locale.EN ? resource.en : resource.fr;
      const slug = makeSlug(title);

      const saved = await prisma.downloadResource.upsert({
        where: { slug_locale: { slug, locale } },
        update: {
          title,
          displayOrder: index,
          status: DownloadStatus.PUBLISHED,
          ...stored,
        },
        create: {
          title,
          slug,
          locale,
          description: resource.subtitle,
          displayOrder: index,
          status: DownloadStatus.PUBLISHED,
          publishedAt: new Date(Date.now() - index * 86_400_000),
          tags: resource.tags,
          uploadedById: admin?.id ?? null,
          ...stored,
        },
      });

      const optionIds = resource.options
        .map((slugValue) => optionIdsByLocale[locale][slugValue])
        .filter(Boolean);

      await prisma.$transaction([
        prisma.downloadResourceFilterOption.deleteMany({ where: { downloadId: saved.id } }),
        prisma.downloadResourceFilterOption.createMany({
          data: optionIds.map((optionId) => ({ downloadId: saved.id, optionId })),
          skipDuplicates: true,
        }),
      ]);
    }
  }

  console.log("Download resources ready:", RESOURCES.length, "x 2 locales");
}
