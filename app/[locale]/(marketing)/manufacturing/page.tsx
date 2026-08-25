import { permanentRedirect } from "@/i18n/navigation";

export default async function ManufacturingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect({ href: "/manufacturing/solar-panels", locale });
}
