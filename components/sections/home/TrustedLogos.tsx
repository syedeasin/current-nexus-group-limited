import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { trustedLogos } from "@/lib/data/trustedLogos";
import LogoTicker from "@/components/sections/home/trusted-logos/LogoTicker";

export default async function TrustedLogos() {
  const t = await getTranslations("home.trustedLogos");

  return (
    <section aria-label={t("title")} className="trusted-logos-section w-full bg-surface-2">
      <Container size="section" className="flex flex-col items-center gap-32">
        <Reveal as="div" className="w-full">
          <p className="w-full text-center text-h5 font-semibold text-neutral-3">{t("title")}</p>
        </Reveal>
        <LogoTicker logos={trustedLogos} />
      </Container>
    </section>
  );
}
