import Image from "next/image";
import { slugify } from "../../lib/slug";

export interface LegalSection {
    heading: string;
    body?: string[];
    list?: string[];
    after?: string[];
}

export interface LegalDoc {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    heroImage?: { src: string; alt: string };
    intro: string[];
    sections: LegalSection[];
}

/* Shared container padding — identical to every other section. */
const CONTAINER = "mx-auto w-full max-w-[1280px] px-5 xl:px-10 2xl:px-0";

const BODY_TEXT =
    "font-mono text-[15px] leading-7 tracking-[-0.7px] text-ink-2 lg:text-[18px] lg:leading-[28px] lg:tracking-[-0.9px]";

export default function LegalPage({
    doc,
    header,
    footer,
}: {
    doc: LegalDoc
    /** Slot for your site's nav/header — originally a hardcoded <Navbar />. */
    header?: React.ReactNode
    /** Slot for your site's footer — originally a hardcoded <Footer />. */
    footer?: React.ReactNode
}) {
    return (
        <>
            <main className="flex-1 bg-cream">
                {header}

                <section className="relative w-full overflow-clip bg-cream py-[60px] md:py-[90px] lg:py-[120px]">
                    <div className={`relative z-10 ${CONTAINER}`}>
                        <div className="flex flex-col gap-10 lg:gap-12">
                            {doc.heroImage && (
                                <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-line sm:h-[400px] md:h-[480px]">
                                    <Image
                                        src={doc.heroImage.src}
                                        alt={doc.heroImage.alt}
                                        fill
                                        sizes="(min-width: 1024px) 1280px, 100vw"
                                        priority
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Eyebrow + title + last updated */}
                            <div className="flex flex-col gap-3">
                                <p className="font-fjalla text-[14px] uppercase leading-[28px] tracking-[2.88px] text-primary lg:text-[18px] lg:tracking-[4px]">
                                    {doc.eyebrow}
                                </p>

                                <h1 className="font-fjalla text-[32px] uppercase leading-[1.1] tracking-[-0.48px] text-ink md:text-[40px] lg:text-[48px] lg:leading-[52px]">
                                    {doc.title}
                                </h1>

                                <p className="font-mono text-[14px] leading-6 tracking-[-0.5px] text-ink-3">
                                    Last updated {doc.lastUpdated}
                                </p>
                            </div>

                            {/* Intro */}
                            <div className="flex max-w-[720px] flex-col gap-4">
                                {doc.intro.map((para, i) => (
                                    <p key={i} className={BODY_TEXT}>
                                        {para}
                                    </p>
                                ))}
                            </div>

                            {/* Sections */}
                            <div className="flex flex-col gap-12 md:gap-16">
                                {doc.sections.map((section, i) => (
                                    <section
                                        key={i}
                                        id={slugify(section.heading)}
                                        className="flex max-w-[720px] scroll-mt-24 flex-col gap-4"
                                    >
                                        <h2 className="font-fjalla text-[28px] uppercase leading-[36px] tracking-[-0.56px] text-ink md:text-[32px] md:leading-[40px] lg:text-[36px] lg:leading-[44px] lg:tracking-[-0.72px]">
                                            {section.heading}
                                        </h2>

                                        {section.body?.map((para, j) => (
                                            <p key={j} className={BODY_TEXT}>
                                                {para}
                                            </p>
                                        ))}

                                        {section.list && (
                                            <ul className={`flex list-disc flex-col gap-3 pl-6 marker:text-primary ${BODY_TEXT}`}>
                                                {section.list.map((item, k) => (
                                                    <li key={k}>{item}</li>
                                                ))}
                                            </ul>
                                        )}

                                        {section.after?.map((para, j) => (
                                            <p key={j} className={BODY_TEXT}>
                                                {para}
                                            </p>
                                        ))}
                                    </section>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {footer}
        </>
    );
}
