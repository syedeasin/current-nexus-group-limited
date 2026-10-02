import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import LogoTicker from "@/components/sections/home/trusted-logos/LogoTicker";
import { entries, num, str } from "@/lib/page-content/read";

export default async function TrustedLogos() {
  const t = await getTranslations("home.trustedLogos");

  const logos = entries(t.raw("logos" as never))
    .map(([, logo]) => ({ name: str(logo, "name"), image: str(logo, "logo"), width: num(logo, "width", 120) }))
    .filter((logo) => logo.image);

  return (
    <section aria-label={t("title")} className="trusted-logos-section w-full bg-surface-2">
      <Container className="flex flex-col items-center gap-32">
        <Reveal as="div" className="w-full">
          <p className="w-full text-center text-h5 font-semibold text-neutral-3">{t("title")}</p>
        </Reveal>
        <LogoTicker logos={logos} />
      </Container>
    </section>
  );
}
