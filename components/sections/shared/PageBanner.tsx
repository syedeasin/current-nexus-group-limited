import Image from "next/image";
import Container from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

interface PageBannerProps {
  eyebrowLabel: string;
  heading: string;
  image: {
    src: string;
    /** Decorative full-bleed background — leave empty unless the photo carries real information. */
    alt?: string;
    objectPosition?: string;
  };
  /** Tailwind max-width class for the text block. Defaults to the manufacturing category spec (855px). */
  textMaxWidthClassName?: string;
}

export default function PageBanner({
  eyebrowLabel,
  heading,
  image,
  textMaxWidthClassName = "max-w-855",
}: PageBannerProps) {
  return (
    <section aria-label={heading} className="relative w-full overflow-hidden bg-neutral-1">
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        aria-hidden={image.alt ? undefined : "true"}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: image.objectPosition ?? "right center" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80.364%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-167"
        style={{
          background: "linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 96.876%)",
        }}
      />

      <Container className="relative z-10 flex h-400 flex-col justify-end py-64 md:h-460 xl:h-548 xl:pt-140 xl:pb-120">
        <div className={cn("flex flex-col gap-12", textMaxWidthClassName)}>
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={eyebrowLabel} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={1} size="h1" className="text-balance text-white">
              {heading}
            </Heading>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
