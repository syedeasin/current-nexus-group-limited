import type { Metadata } from "next";
import LegalPage, { legalMetadata } from "@/components/sections/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata(locale, "cookies");
}

export default function CookiePolicyPage() {
  return <LegalPage pageKey="cookies" />;
}
