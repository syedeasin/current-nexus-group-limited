import { permanentRedirect } from "@/i18n/navigation";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect({ href: "/about/why-choose-cnx", locale });
}
