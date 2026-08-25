import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.technology.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TechnologyPage() {
  const t = await getTranslations("about.technology");

  return (
    <main>
      <Container>
        <h1>{t("meta.title")}</h1>
      </Container>
    </main>
  );
}
